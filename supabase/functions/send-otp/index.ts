import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function normalizePhone(phone: string): string {
  let n = phone.replace(/[^0-9]/g, '');
  if (n.startsWith('0')) n = '88' + n;
  else if (!n.startsWith('880')) n = '880' + n;
  return n;
}

function isValidBDPhone(phone: string): boolean {
  return /^8801[3-9]\d{8}$/.test(phone);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { phone } = await req.json();
    if (!phone) {
      return new Response(JSON.stringify({ error: 'Phone number required' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const normalized = normalizePhone(phone);
    if (!isValidBDPhone(normalized)) {
      return new Response(JSON.stringify({ error: 'Invalid Bangladesh phone number' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Rate limit: max 3 OTPs per phone per 10 min
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('phone_otps')
      .select('*', { count: 'exact', head: true })
      .eq('phone', normalized)
      .gte('created_at', tenMinAgo);

    if ((count || 0) >= 3) {
      return new Response(JSON.stringify({ error: 'Too many OTP requests. Please wait.' }), {
        status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min

    // Store OTP
    await supabase.from('phone_otps').insert({
      phone: normalized,
      otp_code: otp,
      expires_at: expiresAt,
    });

    // Send via SMS
    const smsApiKey = Deno.env.get('SMS_API_KEY');
    const smsSenderId = Deno.env.get('SMS_SENDER_ID');

    if (smsApiKey && smsSenderId) {
      const message = `DigiWebDex: আপনার OTP কোড হলো ${otp}। ৫ মিনিটের মধ্যে ব্যবহার করুন।`;
      const smsUrl = `http://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(smsApiKey)}&type=text&number=${normalized}&senderid=${encodeURIComponent(smsSenderId)}&message=${encodeURIComponent(message)}`;
      
      const smsRes = await fetch(smsUrl);
      console.log('OTP SMS response:', await smsRes.text());
    } else {
      console.warn('SMS credentials not configured, OTP:', otp);
    }

    return new Response(JSON.stringify({ success: true, message: 'OTP sent' }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
