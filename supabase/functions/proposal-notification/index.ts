import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SMS_API_KEY = Deno.env.get("SMS_API_KEY");
const SMS_SENDER_ID = Deno.env.get("SMS_SENDER_ID") || "DIGIWEBDEX";
const ADMIN_PHONE = "+8801674533303";
const ADMIN_EMAIL = "digiwebdex@gmail.com";

interface RequestBody {
  proposalId: string;
  action: "sent" | "accepted" | "rejected" | "reminder";
}

async function sendSMS(phone: string, message: string) {
  if (!SMS_API_KEY) {
    console.log("SMS API key not configured, skipping SMS");
    return;
  }

  try {
    const formattedPhone = phone.startsWith("+88") ? phone.substring(3) : 
                          phone.startsWith("88") ? phone.substring(2) : phone;
    
    const url = `https://bulksmsbd.net/api/smsapi?api_key=${SMS_API_KEY}&type=text&number=${formattedPhone}&senderid=${SMS_SENDER_ID}&message=${encodeURIComponent(message)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    console.log("SMS response:", data);
    return data;
  } catch (error) {
    console.error("SMS sending failed:", error);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proposalId, action }: RequestBody = await req.json();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get proposal details
    const { data: proposal, error: proposalError } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", proposalId)
      .single();

    if (proposalError || !proposal) {
      throw new Error("Proposal not found");
    }

    const baseUrl = req.headers.get("origin") || "https://digiwebdex.lovable.app";
    const proposalUrl = `${baseUrl}/proposal/${proposal.access_token}`;

    switch (action) {
      case "sent": {
        // Send SMS to client
        const clientMessage = `প্রিয় ${proposal.client_name},

Digiwebdex থেকে আপনার জন্য একটি প্রস্তাব পাঠানো হয়েছে।

প্রস্তাব নম্বর: ${proposal.proposal_number}
মোট মূল্য: ৳${Number(proposal.total_amount).toLocaleString()}

প্রস্তাব দেখতে ভিজিট করুন:
${proposalUrl}

প্রশ্ন থাকলে কল করুন: 01674533303

ধন্যবাদ,
Digiwebdex Team`;

        await sendSMS(proposal.client_phone, clientMessage);

        // Notify admin
        const adminMessage = `নতুন প্রস্তাব পাঠানো হয়েছে!

ক্লায়েন্ট: ${proposal.client_name}
ফোন: ${proposal.client_phone}
সার্ভিস: ${proposal.service_type}
মোট: ৳${Number(proposal.total_amount).toLocaleString()}

Proposal: ${proposal.proposal_number}`;

        await sendSMS(ADMIN_PHONE, adminMessage);
        break;
      }

      case "accepted": {
        // Notify admin about acceptance
        const adminAcceptMessage = `প্রস্তাব গৃহীত হয়েছে!

ক্লায়েন্ট: ${proposal.client_name}
ফোন: ${proposal.client_phone}
মোট: ৳${Number(proposal.total_amount).toLocaleString()}

Proposal: ${proposal.proposal_number}

শীঘ্রই ক্লায়েন্টের সাথে যোগাযোগ করুন।`;

        await sendSMS(ADMIN_PHONE, adminAcceptMessage);

        // Send confirmation to client
        const clientAcceptMessage = `ধন্যবাদ ${proposal.client_name}!

আপনার প্রস্তাব (${proposal.proposal_number}) গ্রহণ করা হয়েছে।

আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।

প্রশ্ন থাকলে: 01674533303

Digiwebdex Team`;

        await sendSMS(proposal.client_phone, clientAcceptMessage);

        // Convert to lead if not already linked
        if (proposal.lead_id) {
          await supabase
            .from("leads")
            .update({ status: "converted" })
            .eq("id", proposal.lead_id);
        }
        break;
      }

      case "rejected": {
        // Notify admin about rejection
        const adminRejectMessage = `প্রস্তাব প্রত্যাখ্যাত হয়েছে।

ক্লায়েন্ট: ${proposal.client_name}
ফোন: ${proposal.client_phone}
কারণ: ${proposal.rejection_reason || "উল্লেখ করা হয়নি"}

Proposal: ${proposal.proposal_number}`;

        await sendSMS(ADMIN_PHONE, adminRejectMessage);
        break;
      }

      case "reminder": {
        // Send reminder to client
        const reminderMessage = `প্রিয় ${proposal.client_name},

আপনার প্রস্তাব (${proposal.proposal_number}) এর মেয়াদ শীঘ্রই শেষ হবে।

মোট মূল্য: ৳${Number(proposal.total_amount).toLocaleString()}

প্রস্তাব দেখুন: ${proposalUrl}

প্রশ্ন? কল করুন: 01674533303

Digiwebdex Team`;

        await sendSMS(proposal.client_phone, reminderMessage);
        break;
      }
    }

    // Log the notification
    await supabase.from("proposal_logs").insert({
      proposal_id: proposalId,
      action: `notification_${action}`,
      details: { action, timestamp: new Date().toISOString() },
    });

    return new Response(
      JSON.stringify({ success: true, action }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Proposal notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
