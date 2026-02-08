import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find proposals expiring in 24 hours that are still in 'sent' status
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const { data: expiringProposals, error } = await supabase
      .from("proposals")
      .select("id, proposal_number, client_name, client_phone")
      .eq("status", "sent")
      .gte("expiry_date", tomorrowStart.toISOString())
      .lte("expiry_date", tomorrowEnd.toISOString());

    if (error) throw error;

    console.log(`Found ${expiringProposals?.length || 0} proposals expiring tomorrow`);

    const results = [];

    for (const proposal of expiringProposals || []) {
      try {
        // Check if reminder already sent
        const { data: existingLog } = await supabase
          .from("proposal_logs")
          .select("id")
          .eq("proposal_id", proposal.id)
          .eq("action", "notification_reminder")
          .single();

        if (existingLog) {
          console.log(`Reminder already sent for proposal ${proposal.proposal_number}`);
          continue;
        }

        // Send reminder notification
        await supabase.functions.invoke("proposal-notification", {
          body: { proposalId: proposal.id, action: "reminder" },
        });

        results.push({
          proposal_id: proposal.id,
          proposal_number: proposal.proposal_number,
          status: "reminder_sent",
        });

        console.log(`Sent reminder for proposal ${proposal.proposal_number}`);
      } catch (err) {
        console.error(`Failed to send reminder for proposal ${proposal.id}:`, err);
        results.push({
          proposal_id: proposal.id,
          proposal_number: proposal.proposal_number,
          status: "failed",
          error: err.message,
        });
      }
    }

    // Mark expired proposals
    const now = new Date().toISOString();
    const { data: expiredProposals } = await supabase
      .from("proposals")
      .update({ status: "expired" })
      .eq("status", "sent")
      .lt("expiry_date", now)
      .select("id, proposal_number");

    if (expiredProposals && expiredProposals.length > 0) {
      console.log(`Marked ${expiredProposals.length} proposals as expired`);
      
      // Log expiration for each
      for (const exp of expiredProposals) {
        await supabase.from("proposal_logs").insert({
          proposal_id: exp.id,
          action: "auto_expired",
          details: { expired_at: now },
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reminders_sent: results.filter(r => r.status === "reminder_sent").length,
        expired_count: expiredProposals?.length || 0,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Proposal reminder cron error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
