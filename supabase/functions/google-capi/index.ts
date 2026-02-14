import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  event_name: string;
  event_id: string;
  client_id?: string;
  event_source_url?: string;
  user_data?: Record<string, string>;
  custom_data?: Record<string, unknown>;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get settings
    const { data: settings } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', [
        'ga4_measurement_id', 'ga4_api_secret', 'google_capi_enabled',
        'google_ads_conversion_id', 'google_ads_api_token',
      ]);

    const s = new Map<string, string>();
    settings?.forEach(r => {
      const val = typeof r.value === 'string' ? r.value.replace(/^"|"$/g, '') : String(r.value);
      s.set(r.key, val);
    });

    if (s.get('google_capi_enabled') !== 'true') {
      return new Response(
        JSON.stringify({ success: false, message: 'Google CAPI disabled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: RequestBody = await req.json();
    const { event_name, event_id, client_id, event_source_url, user_data, custom_data } = body;

    if (!event_name || !event_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing event_name or event_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: Record<string, unknown> = {};

    // --- GA4 Measurement Protocol ---
    const ga4Id = s.get('ga4_measurement_id');
    const ga4Secret = s.get('ga4_api_secret');

    if (ga4Id && ga4Secret) {
      const ga4Url = `https://www.google-analytics.com/mp/collect?measurement_id=${ga4Id}&api_secret=${ga4Secret}`;

      const ga4Payload = {
        client_id: client_id || `server.${Date.now()}`,
        events: [{
          name: event_name,
          params: {
            engagement_time_msec: '100',
            session_id: event_id,
            page_location: event_source_url,
            ...custom_data,
          },
        }],
      };

      const ga4Response = await fetch(ga4Url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ga4Payload),
      });

      results.ga4 = { status: ga4Response.status, ok: ga4Response.ok };
      console.log('GA4 MP response:', ga4Response.status);
    }

    // --- Google Ads Conversion API ---
    const adsConversionId = s.get('google_ads_conversion_id');
    const adsToken = s.get('google_ads_api_token');

    if (adsConversionId && adsToken && (event_name === 'conversion' || event_name === 'purchase' || event_name === 'generate_lead')) {
      const conversionLabel = (custom_data?.conversion_label as string) || '';
      const value = (custom_data?.value as number) || 0;
      const currency = (custom_data?.currency as string) || 'BDT';

      // Google Ads offline conversion via gtag measurement protocol
      const adsUrl = `https://www.googleadservices.com/pagead/conversion/${adsConversionId}/?label=${conversionLabel}&value=${value}&currency_code=${currency}&cv=11&fst=${Date.now()}&fmt=3`;

      try {
        const adsResponse = await fetch(adsUrl);
        results.ads = { status: adsResponse.status, ok: adsResponse.ok };
        // Consume body
        await adsResponse.text();
        console.log('Google Ads conversion response:', adsResponse.status);
      } catch (e) {
        console.error('Google Ads conversion error:', e);
        results.ads = { error: String(e) };
      }
    }

    // Log the event
    await supabase.from('tracking_event_logs').insert({
      event_name,
      event_id,
      source: 'google_capi',
      user_data: (user_data || {}) as Record<string, never>,
      custom_data: (custom_data || {}) as Record<string, never>,
      status: 'sent',
      response_data: results as Record<string, never>,
    });

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Google CAPI Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
