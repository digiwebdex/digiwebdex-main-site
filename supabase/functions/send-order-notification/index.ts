import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "order_created" | "payment_received" | "payment_approved";
  orderId?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  packageName: string;
  amount: number;
  paymentMethod?: string;
  screenshotUploaded?: boolean;
}

// Admin contact info - should be configured in env
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@digiwebdex.com";
const ADMIN_PHONE = Deno.env.get("ADMIN_PHONE") || "8801XXXXXXXXX";
const WHATSAPP_API_URL = Deno.env.get("WHATSAPP_API_URL");
const WHATSAPP_API_TOKEN = Deno.env.get("WHATSAPP_API_TOKEN");
const SMS_API_URL = Deno.env.get("SMS_API_URL");
const SMS_API_KEY = Deno.env.get("SMS_API_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log("Email would be sent to:", to, "Subject:", subject);
    return true;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "DigiWebDex <noreply@digiwebdex.com>",
        to: [to],
        subject,
        html: body,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

async function sendSMS(to: string, message: string): Promise<boolean> {
  if (!SMS_API_URL || !SMS_API_KEY) {
    console.log("SMS would be sent to:", to, "Message:", message);
    return true;
  }

  try {
    // Generic SMS API structure - adjust based on your provider
    const response = await fetch(SMS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SMS_API_KEY}`,
      },
      body: JSON.stringify({
        to,
        message,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("SMS send error:", error);
    return false;
  }
}

async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  if (!WHATSAPP_API_URL || !WHATSAPP_API_TOKEN) {
    console.log("WhatsApp would be sent to:", to, "Message:", message);
    return true;
  }

  try {
    // WhatsApp Cloud API structure
    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return false;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  }).format(amount);
}

async function logNotification(
  userId: string | null,
  type: string,
  recipient: string,
  subject: string,
  body: string,
  status: "sent" | "failed"
): Promise<void> {
  await supabase.from("notifications").insert({
    user_id: userId,
    notification_type: type as any,
    recipient,
    subject,
    body,
    status: status === "sent" ? "sent" : "failed",
    sent_at: status === "sent" ? new Date().toISOString() : null,
  });
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: NotificationRequest = await req.json();
    const results: { channel: string; success: boolean }[] = [];

    // Build messages based on notification type
    let customerEmailSubject = "";
    let customerEmailBody = "";
    let customerSmsMessage = "";
    let adminEmailSubject = "";
    let adminEmailBody = "";
    let adminSmsMessage = "";

    const formattedAmount = formatCurrency(data.amount);

    switch (data.type) {
      case "order_created":
        customerEmailSubject = `অর্ডার নিশ্চিত: ${data.orderNumber} - DigiWebDex`;
        customerEmailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #7c3aed;">ধন্যবাদ, ${data.customerName}!</h1>
            <p>আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>অর্ডার নম্বর:</strong> ${data.orderNumber}</p>
              <p><strong>প্যাকেজ:</strong> ${data.packageName}</p>
              <p><strong>মোট:</strong> ${formattedAmount}</p>
            </div>
            <p>পেমেন্ট সম্পন্ন করার পর আমরা আপনার সাথে যোগাযোগ করব।</p>
            <p>যেকোনো প্রশ্নের জন্য WhatsApp করুন: +880 1XXX-XXXXXX</p>
            <br/>
            <p>ধন্যবাদান্তে,<br/>DigiWebDex Team</p>
          </div>
        `;
        customerSmsMessage = `DigiWebDex: আপনার অর্ডার ${data.orderNumber} গ্রহণ হয়েছে। প্যাকেজ: ${data.packageName}, মোট: ${formattedAmount}`;

        adminEmailSubject = `নতুন অর্ডার: ${data.orderNumber}`;
        adminEmailBody = `
          <div style="font-family: Arial, sans-serif;">
            <h2 style="color: #059669;">নতুন অর্ডার এসেছে!</h2>
            <table style="border-collapse: collapse;">
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>অর্ডার নম্বর</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.orderNumber}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>কাস্টমার</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.customerName}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>ফোন</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.customerPhone}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>ইমেইল</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.customerEmail}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>প্যাকেজ</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.packageName}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>মোট</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formattedAmount}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>পেমেন্ট মেথড</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.paymentMethod || "N/A"}</td></tr>
            </table>
          </div>
        `;
        adminSmsMessage = `নতুন অর্ডার! ${data.orderNumber} - ${data.customerName} - ${formattedAmount}`;
        break;

      case "payment_received":
        customerEmailSubject = `পেমেন্ট প্রাপ্ত: ${data.orderNumber} - DigiWebDex`;
        customerEmailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #7c3aed;">${data.customerName}, আপনার পেমেন্ট প্রাপ্ত হয়েছে!</h1>
            <p>আমরা আপনার পেমেন্ট স্ক্রিনশট পেয়েছি। এটি যাচাই করা হচ্ছে।</p>
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>অর্ডার নম্বর:</strong> ${data.orderNumber}</p>
              <p><strong>পরিমাণ:</strong> ${formattedAmount}</p>
              <p><strong>স্ট্যাটাস:</strong> যাচাই প্রক্রিয়াধীন</p>
            </div>
            <p>সাধারণত ১-২ ঘন্টার মধ্যে যাচাই সম্পন্ন হয়।</p>
          </div>
        `;
        customerSmsMessage = `DigiWebDex: অর্ডার ${data.orderNumber} এর পেমেন্ট প্রাপ্ত। যাচাই প্রক্রিয়াধীন।`;

        adminEmailSubject = `⚡ পেমেন্ট স্ক্রিনশট আপলোড: ${data.orderNumber}`;
        adminEmailBody = `
          <div style="font-family: Arial, sans-serif;">
            <h2 style="color: #dc2626;">পেমেন্ট যাচাই করুন!</h2>
            <p><strong>অর্ডার:</strong> ${data.orderNumber}</p>
            <p><strong>কাস্টমার:</strong> ${data.customerName}</p>
            <p><strong>পরিমাণ:</strong> ${formattedAmount}</p>
            <p><strong>মেথড:</strong> ${data.paymentMethod}</p>
            <p style="color: #dc2626; font-weight: bold;">অ্যাডমিন প্যানেলে যাচাই করুন!</p>
          </div>
        `;
        adminSmsMessage = `⚡ পেমেন্ট যাচাই করুন! ${data.orderNumber} - ${formattedAmount}`;
        break;

      case "payment_approved":
        customerEmailSubject = `পেমেন্ট অনুমোদিত: ${data.orderNumber} - DigiWebDex`;
        customerEmailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #059669;">🎉 পেমেন্ট নিশ্চিত হয়েছে!</h1>
            <p>${data.customerName}, আপনার পেমেন্ট সফলভাবে অনুমোদিত হয়েছে।</p>
            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>অর্ডার নম্বর:</strong> ${data.orderNumber}</p>
              <p><strong>প্যাকেজ:</strong> ${data.packageName}</p>
              <p><strong>স্ট্যাটাস:</strong> ✅ অনুমোদিত</p>
            </div>
            <p>আমাদের টিম শীঘ্রই আপনার সার্ভিস সক্রিয় করবে।</p>
          </div>
        `;
        customerSmsMessage = `DigiWebDex: অর্ডার ${data.orderNumber} পেমেন্ট নিশ্চিত! সার্ভিস শীঘ্রই সক্রিয় হবে।`;
        break;
    }

    // Send customer notifications
    if (data.customerEmail) {
      const emailSent = await sendEmail(
        data.customerEmail,
        customerEmailSubject,
        customerEmailBody
      );
      results.push({ channel: "customer_email", success: emailSent });
      await logNotification(
        null,
        "email",
        data.customerEmail,
        customerEmailSubject,
        customerEmailBody,
        emailSent ? "sent" : "failed"
      );
    }

    if (data.customerPhone) {
      const smsSent = await sendSMS(data.customerPhone, customerSmsMessage);
      results.push({ channel: "customer_sms", success: smsSent });

      const whatsappSent = await sendWhatsApp(
        data.customerPhone,
        customerSmsMessage
      );
      results.push({ channel: "customer_whatsapp", success: whatsappSent });
    }

    // Send admin notifications (for order_created and payment_received)
    if (data.type !== "payment_approved") {
      const adminEmailSent = await sendEmail(
        ADMIN_EMAIL,
        adminEmailSubject,
        adminEmailBody
      );
      results.push({ channel: "admin_email", success: adminEmailSent });

      const adminSmsSent = await sendSMS(ADMIN_PHONE, adminSmsMessage);
      results.push({ channel: "admin_sms", success: adminSmsSent });

      const adminWhatsappSent = await sendWhatsApp(ADMIN_PHONE, adminSmsMessage);
      results.push({ channel: "admin_whatsapp", success: adminWhatsappSent });
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
