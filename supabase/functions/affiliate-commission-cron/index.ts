import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting affiliate commission processing...');

    const now = new Date().toISOString();

    // Find commissions past grace period that are still pending
    const { data: pendingCommissions, error: fetchError } = await supabase
      .from('affiliate_commissions')
      .select('id, affiliate_id, commission_amount')
      .eq('status', 'pending')
      .lt('grace_period_ends_at', now);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${pendingCommissions?.length || 0} commissions to process`);

    let approvedCount = 0;
    const affiliateUpdates: Record<string, number> = {};

    for (const commission of pendingCommissions || []) {
      // Approve the commission
      const { error: updateError } = await supabase
        .from('affiliate_commissions')
        .update({
          status: 'approved',
          approved_at: now,
        })
        .eq('id', commission.id);

      if (!updateError) {
        approvedCount++;
        
        // Track earnings to move from pending to withdrawable
        if (!affiliateUpdates[commission.affiliate_id]) {
          affiliateUpdates[commission.affiliate_id] = 0;
        }
        affiliateUpdates[commission.affiliate_id] += Number(commission.commission_amount);
      }
    }

    // Update affiliate earnings
    for (const [affiliateId, amount] of Object.entries(affiliateUpdates)) {
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('pending_earnings, withdrawable_earnings')
        .eq('id', affiliateId)
        .single();

      if (affiliate) {
        await supabase
          .from('affiliates')
          .update({
            pending_earnings: Math.max(0, affiliate.pending_earnings - amount),
            withdrawable_earnings: affiliate.withdrawable_earnings + amount,
          })
          .eq('id', affiliateId);
      }
    }

    // Log the processing run
    await supabase.from('audit_logs').insert({
      action: 'affiliate_commission_processing',
      entity_type: 'affiliate_commissions',
      new_values: {
        processed_at: now,
        approved_count: approvedCount,
        affiliates_updated: Object.keys(affiliateUpdates).length,
      },
    });

    console.log(`Approved ${approvedCount} commissions`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Affiliate commission processing completed',
        approved: approvedCount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Commission processing error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
