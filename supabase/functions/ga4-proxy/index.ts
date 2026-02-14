import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Action 1: Serve gtag.js script (proxy)
    if (action === 'gtag-script') {
      const trackingId = url.searchParams.get('id');
      if (!trackingId) {
        return new Response('Missing id', { status: 400, headers: corsHeaders });
      }

      const gtagResp = await fetch(
        `https://www.googletagmanager.com/gtag/js?id=${trackingId}`,
        { headers: { 'User-Agent': req.headers.get('user-agent') || '' } }
      );

      const scriptBody = await gtagResp.text();

      return new Response(scriptBody, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Action 2: Proxy GA4 collect endpoint
    if (action === 'collect') {
      const body = await req.json();
      const { measurement_id, events, client_id, user_id, user_properties } = body;

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Get API secret from settings
      const { data: settings } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['ga4_api_secret', 'ga4_measurement_id']);

      const settingsMap = new Map<string, string>();
      settings?.forEach(s => {
        const val = typeof s.value === 'string' ? s.value.replace(/^"|"$/g, '') : String(s.value);
        settingsMap.set(s.key, val);
      });

      const apiSecret = settingsMap.get('ga4_api_secret');
      const configuredMeasurementId = measurement_id || settingsMap.get('ga4_measurement_id');

      if (!apiSecret || !configuredMeasurementId) {
        return new Response(
          JSON.stringify({ success: false, message: 'GA4 API Secret or Measurement ID not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get real client IP for geo accuracy
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || req.headers.get('cf-connecting-ip')
        || req.headers.get('x-real-ip')
        || '';
      const userAgent = req.headers.get('user-agent') || '';

      // Build MP payload
      const mpPayload: Record<string, unknown> = {
        client_id: client_id || `server.${Date.now()}.${Math.random().toString(36).substring(2)}`,
        events: (events || []).map((evt: Record<string, unknown>) => ({
          name: evt.name || evt.event_name,
          params: {
            engagement_time_msec: '100',
            ...(evt.params || evt.custom_data || {}),
          },
        })),
      };

      if (user_id) mpPayload.user_id = user_id;
      if (user_properties) mpPayload.user_properties = user_properties;

      // Send via Measurement Protocol
      const mpUrl = `https://www.google-analytics.com/mp/collect?measurement_id=${configuredMeasurementId}&api_secret=${apiSecret}`;

      const mpResponse = await fetch(mpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': clientIp,
          'User-Agent': userAgent,
        },
        body: JSON.stringify(mpPayload),
      });

      // GA4 MP returns 204 on success
      const responseStatus = mpResponse.status;

      // Log the event
      for (const evt of (events || [])) {
        await supabase.from('tracking_event_logs').insert({
          event_name: evt.name || evt.event_name || 'unknown',
          event_id: evt.event_id || `mp-${Date.now()}`,
          source: 'ga4_mp_proxy',
          user_data: { client_id, user_agent: userAgent, ip: clientIp } as Record<string, never>,
          custom_data: (evt.params || {}) as Record<string, never>,
          status: responseStatus <= 204 ? 'sent' : 'failed',
          response_data: { status: responseStatus } as Record<string, never>,
        });
      }

      return new Response(
        JSON.stringify({ success: responseStatus <= 204, status: responseStatus }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action 3: Server-side event (enhanced - combines GA4 MP + Google Ads)
    if (action === 'event') {
      const body = await req.json();
      const { event_name, event_id, client_id, event_source_url, user_data, custom_data } = body;

      if (!event_name) {
        return new Response(
          JSON.stringify({ success: false, message: 'Missing event_name' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: settings } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', [
          'ga4_measurement_id', 'ga4_api_secret',
          'google_ads_conversion_id', 'google_ads_api_token',
          'google_capi_enabled',
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

      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
      const userAgent = req.headers.get('user-agent') || '';
      const results: Record<string, unknown> = {};

      // GA4 Measurement Protocol
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
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': clientIp,
            'User-Agent': userAgent,
          },
          body: JSON.stringify(ga4Payload),
        });
        results.ga4 = { status: ga4Response.status, ok: ga4Response.ok };
      }

      // Google Ads Conversion
      const adsId = s.get('google_ads_conversion_id');
      const adsToken = s.get('google_ads_api_token');
      if (adsId && adsToken && ['conversion', 'purchase', 'generate_lead'].includes(event_name)) {
        const convLabel = (custom_data?.conversion_label as string) || '';
        const value = (custom_data?.value as number) || 0;
        const currency = (custom_data?.currency as string) || 'BDT';
        const adsUrl = `https://www.googleadservices.com/pagead/conversion/${adsId}/?label=${convLabel}&value=${value}&currency_code=${currency}&cv=11&fst=${Date.now()}&fmt=3`;
        try {
          const adsResp = await fetch(adsUrl);
          await adsResp.text();
          results.ads = { status: adsResp.status, ok: adsResp.ok };
        } catch (e) {
          results.ads = { error: String(e) };
        }
      }

      // Log
      await supabase.from('tracking_event_logs').insert({
        event_name,
        event_id: event_id || `ss-${Date.now()}`,
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
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: gtag-script, collect, or event' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('GA4 Proxy Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
