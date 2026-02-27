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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { phone, otp } = await req.json();
    if (!phone || !otp) {
      return new Response(JSON.stringify({ error: 'Phone and OTP required' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const normalized = normalizePhone(phone);

    // Find valid OTP
    const { data: otpRecord, error: otpErr } = await supabase
      .from('phone_otps')
      .select('*')
      .eq('phone', normalized)
      .eq('otp_code', otp)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpErr || !otpRecord) {
      // Increment attempts on latest OTP
      const { data: latest } = await supabase
        .from('phone_otps')
        .select('id, attempts')
        .eq('phone', normalized)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latest) {
        const newAttempts = (latest.attempts || 0) + 1;
        await supabase.from('phone_otps').update({ attempts: newAttempts }).eq('id', latest.id);

        if (newAttempts >= 5) {
          return new Response(JSON.stringify({ error: 'Too many failed attempts. Request a new OTP.' }), {
            status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      }

      return new Response(JSON.stringify({ error: 'Invalid or expired OTP' }), {
        status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Mark OTP as verified
    await supabase.from('phone_otps').update({ verified: true }).eq('id', otpRecord.id);

    // Find user by phone in profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('phone', normalized)
      .single();

    if (!profile) {
      // No account with this phone — create one
      const tempEmail = `${normalized}@phone.digiwebdex.com`;
      const tempPassword = crypto.randomUUID();

      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: tempEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { phone: normalized, login_method: 'phone_otp' },
      });

      if (createErr || !newUser.user) {
        return new Response(JSON.stringify({ error: 'Failed to create account' }), {
          status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Update profile with phone
      await supabase.from('profiles').update({ phone: normalized }).eq('user_id', newUser.user.id);

      // Generate session token
      const { data: session, error: sessErr } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: tempEmail,
      });

      if (sessErr) {
        return new Response(JSON.stringify({ error: 'Session creation failed' }), {
          status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        is_new_user: true,
        user_id: newUser.user.id,
        email: tempEmail,
        password: tempPassword,
      }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Existing user — get their email and generate temp password for sign-in
    const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id);
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Set a temporary password for this session
    const tempPassword = crypto.randomUUID();
    await supabase.auth.admin.updateUser(profile.user_id, { password: tempPassword });

    return new Response(JSON.stringify({
      success: true,
      is_new_user: false,
      user_id: profile.user_id,
      email: userData.user.email,
      password: tempPassword,
    }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    console.error('Verify OTP error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
