import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// DigiWebDex Contact Info
const ADMIN_EMAIL = 'digiwebdex@gmail.com';
const ADMIN_PHONE = '+8801674533303';
const WHATSAPP_NUMBER = '8801674533303';

interface ContactNotificationRequest {
  type: 'contact_form' | 'order_created' | 'payment_received';
  // Contact form fields
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  // Order fields
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  packageName?: string;
  amount?: number;
  paymentMethod?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const data: ContactNotificationRequest = await req.json();
    console.log('Notification request received:', data);

    const notifications: Array<{
      recipient: string;
      notification_type: string;
      subject: string;
      body: string;
      status: string;
      metadata: Record<string, unknown>;
    }> = [];

    if (data.type === 'contact_form') {
      // Admin notification for contact form
      const adminEmailBody = `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Subject: ${data.subject}

Message:
${data.message}

---
DigiWebDex Contact System
      `.trim();

      notifications.push({
        recipient: ADMIN_EMAIL,
        notification_type: 'email',
        subject: `[Contact] ${data.subject} - ${data.name}`,
        body: adminEmailBody,
        status: 'pending',
        metadata: { type: 'contact_admin_email', contactEmail: data.email }
      });

      // SMS notification to admin
      const adminSmsBody = `New Contact: ${data.name} - ${data.subject?.substring(0, 30)}... Reply to: ${data.email}`;
      notifications.push({
        recipient: ADMIN_PHONE,
        notification_type: 'sms',
        subject: 'New Contact',
        body: adminSmsBody,
        status: 'pending',
        metadata: { type: 'contact_admin_sms' }
      });

      // WhatsApp notification to admin
      const whatsappBody = `🔔 *New Contact Form*\n\n👤 *Name:* ${data.name}\n📧 *Email:* ${data.email}\n📱 *Phone:* ${data.phone || 'N/A'}\n📝 *Subject:* ${data.subject}\n\n💬 *Message:*\n${data.message}`;
      notifications.push({
        recipient: WHATSAPP_NUMBER,
        notification_type: 'whatsapp',
        subject: 'New Contact',
        body: whatsappBody,
        status: 'pending',
        metadata: { type: 'contact_admin_whatsapp' }
      });

    } else if (data.type === 'order_created') {
      // Customer notifications
      const customerEmailBody = `
প্রিয় ${data.customerName},

আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে!

অর্ডার নম্বর: ${data.orderNumber}
প্যাকেজ: ${data.packageName}
মূল্য: ৳${data.amount}
পেমেন্ট মেথড: ${data.paymentMethod}

আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।

ধন্যবাদ,
DigiWebDex Team
+880 1674 533303
      `.trim();

      if (data.customerEmail) {
        notifications.push({
          recipient: data.customerEmail,
          notification_type: 'email',
          subject: `আপনার অর্ডার নিশ্চিত হয়েছে - ${data.orderNumber}`,
          body: customerEmailBody,
          status: 'pending',
          metadata: { type: 'order_customer_email', orderNumber: data.orderNumber }
        });
      }

      // Customer SMS
      if (data.customerPhone) {
        const customerSms = `DigiWebDex: আপনার অর্ডার ${data.orderNumber} গ্রহণ করা হয়েছে। প্যাকেজ: ${data.packageName}। শীঘ্রই যোগাযোগ করা হবে।`;
        notifications.push({
          recipient: data.customerPhone,
          notification_type: 'sms',
          subject: 'Order Confirmation',
          body: customerSms,
          status: 'pending',
          metadata: { type: 'order_customer_sms', orderNumber: data.orderNumber }
        });
      }

      // Customer WhatsApp
      if (data.customerPhone) {
        const customerWhatsapp = `✅ *অর্ডার নিশ্চিত হয়েছে!*\n\n📦 *অর্ডার:* ${data.orderNumber}\n📋 *প্যাকেজ:* ${data.packageName}\n💰 *মূল্য:* ৳${data.amount}\n\nআমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।\n\n🏢 *DigiWebDex*\n📞 +880 1674 533303`;
        notifications.push({
          recipient: data.customerPhone.replace(/[^0-9]/g, ''),
          notification_type: 'whatsapp',
          subject: 'Order Confirmation',
          body: customerWhatsapp,
          status: 'pending',
          metadata: { type: 'order_customer_whatsapp', orderNumber: data.orderNumber }
        });
      }

      // Admin notifications for new order
      const adminOrderEmail = `
🛒 New Order Received!

Order: ${data.orderNumber}
Customer: ${data.customerName}
Email: ${data.customerEmail}
Phone: ${data.customerPhone}
Package: ${data.packageName}
Amount: ৳${data.amount}
Payment: ${data.paymentMethod}

---
DigiWebDex Order System
      `.trim();

      notifications.push({
        recipient: ADMIN_EMAIL,
        notification_type: 'email',
        subject: `[ORDER] ${data.orderNumber} - ${data.packageName} - ৳${data.amount}`,
        body: adminOrderEmail,
        status: 'pending',
        metadata: { type: 'order_admin_email', orderNumber: data.orderNumber }
      });

      // Admin SMS for order
      notifications.push({
        recipient: ADMIN_PHONE,
        notification_type: 'sms',
        subject: 'New Order',
        body: `নতুন অর্ডার ${data.orderNumber}: ${data.customerName} - ${data.packageName} - ৳${data.amount}`,
        status: 'pending',
        metadata: { type: 'order_admin_sms', orderNumber: data.orderNumber }
      });

      // Admin WhatsApp for order
      notifications.push({
        recipient: WHATSAPP_NUMBER,
        notification_type: 'whatsapp',
        subject: 'New Order',
        body: `🛒 *নতুন অর্ডার!*\n\n📦 *Order:* ${data.orderNumber}\n👤 *Customer:* ${data.customerName}\n📧 *Email:* ${data.customerEmail}\n📱 *Phone:* ${data.customerPhone}\n📋 *Package:* ${data.packageName}\n💰 *Amount:* ৳${data.amount}\n💳 *Payment:* ${data.paymentMethod}`,
        status: 'pending',
        metadata: { type: 'order_admin_whatsapp', orderNumber: data.orderNumber }
      });

    } else if (data.type === 'payment_received') {
      // Admin notification for payment screenshot
      const paymentAlertEmail = `
💳 Payment Screenshot Received!

Order: ${data.orderNumber}
Customer: ${data.customerName}
Phone: ${data.customerPhone}
Amount: ৳${data.amount}
Method: ${data.paymentMethod}

Please verify the payment in admin panel.

---
DigiWebDex Payment System
      `.trim();

      notifications.push({
        recipient: ADMIN_EMAIL,
        notification_type: 'email',
        subject: `[PAYMENT] Verification Required - ${data.orderNumber}`,
        body: paymentAlertEmail,
        status: 'pending',
        metadata: { type: 'payment_admin_email', orderNumber: data.orderNumber }
      });

      // Urgent SMS to admin
      notifications.push({
        recipient: ADMIN_PHONE,
        notification_type: 'sms',
        subject: 'Payment Received',
        body: `পেমেন্ট প্রমাণ পাওয়া গেছে! Order: ${data.orderNumber}, Amount: ৳${data.amount}। এখনই ভেরিফাই করুন।`,
        status: 'pending',
        metadata: { type: 'payment_admin_sms', orderNumber: data.orderNumber }
      });

      // WhatsApp alert to admin
      notifications.push({
        recipient: WHATSAPP_NUMBER,
        notification_type: 'whatsapp',
        subject: 'Payment Received',
        body: `💳 *পেমেন্ট স্ক্রিনশট পাওয়া গেছে!*\n\n📦 *Order:* ${data.orderNumber}\n👤 *Customer:* ${data.customerName}\n📱 *Phone:* ${data.customerPhone}\n💰 *Amount:* ৳${data.amount}\n💳 *Method:* ${data.paymentMethod}\n\n⚠️ *দয়া করে এখনই ভেরিফাই করুন!*`,
        status: 'pending',
        metadata: { type: 'payment_admin_whatsapp', orderNumber: data.orderNumber }
      });

      // Customer confirmation
      if (data.customerPhone) {
        notifications.push({
          recipient: data.customerPhone.replace(/[^0-9]/g, ''),
          notification_type: 'whatsapp',
          subject: 'Payment Received',
          body: `✅ *পেমেন্ট প্রমাণ পাওয়া গেছে!*\n\nআপনার পেমেন্ট স্ক্রিনশট সফলভাবে জমা হয়েছে।\n\n📦 *Order:* ${data.orderNumber}\n💰 *Amount:* ৳${data.amount}\n\nআমরা শীঘ্রই ভেরিফাই করে আপনাকে জানাব।\n\n🏢 *DigiWebDex*`,
          status: 'pending',
          metadata: { type: 'payment_customer_whatsapp', orderNumber: data.orderNumber }
        });
      }
    }

    // Save all notifications to database
    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        console.error('Error saving notifications:', insertError);
      } else {
        console.log(`${notifications.length} notifications queued successfully`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${notifications.length} notifications queued`,
        notifications: notifications.length 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
