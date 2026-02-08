import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Subscription {
  id: string;
  user_id: string;
  service_type: string;
  plan_name: string;
  billing_cycle: string;
  amount: number;
  next_billing_date: string;
  status: string;
  auto_renew: boolean;
  grace_period_days: number;
  failed_billing_attempts: number;
  hosting_account_id: string | null;
  domain_id: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split('T')[0];
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`[Subscription Billing Cron] Running for date: ${today}`);

    // 1. Process subscriptions due today (generate invoices)
    const { data: dueSubscriptions, error: dueError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .eq('auto_renew', true)
      .eq('next_billing_date', today);

    if (dueError) throw dueError;

    console.log(`[Subscription Billing] Found ${dueSubscriptions?.length || 0} subscriptions due today`);

    for (const subscription of (dueSubscriptions || []) as Subscription[]) {
      try {
        // Generate invoice
        const invoiceNumber = `INV-${new Date().toISOString().slice(2, 4)}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
        
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + subscription.grace_period_days);

        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            user_id: subscription.user_id,
            invoice_number: invoiceNumber,
            subtotal: subscription.amount,
            total: subscription.amount,
            status: 'unpaid',
            due_date: dueDate.toISOString().split('T')[0],
            notes: `Subscription renewal: ${subscription.plan_name} (${subscription.billing_cycle})`,
          })
          .select()
          .single();

        if (invoiceError) throw invoiceError;

        // Record billing history
        await supabase.from('subscription_billing_history').insert({
          subscription_id: subscription.id,
          invoice_id: invoice.id,
          billing_date: today,
          amount: subscription.amount,
          status: 'pending',
        });

        // Log action
        await supabase.from('subscription_logs').insert({
          subscription_id: subscription.id,
          action: 'invoice_generated',
          new_status: subscription.status as any,
          details: { invoice_id: invoice.id, amount: subscription.amount },
        });

        // Send notification to client
        await sendNotification(supabase, subscription.user_id, 'subscription_renewal', {
          plan_name: subscription.plan_name,
          amount: subscription.amount,
          due_date: dueDate.toISOString().split('T')[0],
        });

        console.log(`[Subscription Billing] Generated invoice ${invoiceNumber} for subscription ${subscription.id}`);
      } catch (err) {
        console.error(`[Subscription Billing] Error processing subscription ${subscription.id}:`, err);
      }
    }

    // 2. Send reminders for subscriptions due in 3 days
    const { data: upcomingSubscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .eq('auto_renew', true)
      .eq('next_billing_date', threeDaysFromNow);

    for (const subscription of (upcomingSubscriptions || []) as Subscription[]) {
      await sendNotification(supabase, subscription.user_id, 'subscription_reminder', {
        plan_name: subscription.plan_name,
        amount: subscription.amount,
        renewal_date: subscription.next_billing_date,
        days_remaining: 3,
      });
      console.log(`[Subscription Billing] Sent 3-day reminder for subscription ${subscription.id}`);
    }

    // 3. Check for overdue subscriptions and suspend after grace period
    const { data: overdueSubscriptions, error: overdueError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .lt('next_billing_date', sevenDaysAgo);

    if (overdueError) throw overdueError;

    console.log(`[Subscription Billing] Found ${overdueSubscriptions?.length || 0} overdue subscriptions`);

    for (const subscription of (overdueSubscriptions || []) as Subscription[]) {
      const billingDate = new Date(subscription.next_billing_date);
      const gracePeriodEnd = new Date(billingDate.getTime() + subscription.grace_period_days * 24 * 60 * 60 * 1000);

      if (new Date() > gracePeriodEnd) {
        // Suspend subscription
        await supabase
          .from('subscriptions')
          .update({
            status: 'suspended',
            suspended_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);

        // Suspend linked hosting account
        if (subscription.hosting_account_id) {
          await supabase
            .from('hosting_accounts')
            .update({
              status: 'suspended',
              suspended_reason: 'Payment overdue - subscription suspended',
            })
            .eq('id', subscription.hosting_account_id);
        }

        // Log action
        await supabase.from('subscription_logs').insert({
          subscription_id: subscription.id,
          action: 'suspended_overdue',
          old_status: 'active',
          new_status: 'suspended',
          details: { reason: 'Payment overdue after grace period' },
        });

        // Notify admin
        await sendAdminNotification(supabase, 'subscription_suspended', {
          subscription_id: subscription.id,
          plan_name: subscription.plan_name,
          user_id: subscription.user_id,
        });

        console.log(`[Subscription Billing] Suspended subscription ${subscription.id} due to non-payment`);
      } else {
        // Send reminder
        const daysOverdue = Math.floor((new Date().getTime() - billingDate.getTime()) / (24 * 60 * 60 * 1000));
        await sendNotification(supabase, subscription.user_id, 'subscription_overdue', {
          plan_name: subscription.plan_name,
          amount: subscription.amount,
          days_overdue: daysOverdue,
          suspension_date: gracePeriodEnd.toISOString().split('T')[0],
        });
      }
    }

    // 4. Check for paid invoices and reactivate subscriptions
    const { data: paidBillings } = await supabase
      .from('subscription_billing_history')
      .select('*, subscription:subscriptions(*)')
      .eq('status', 'pending')
      .not('invoice_id', 'is', null);

    for (const billing of (paidBillings || [])) {
      // Check if invoice is paid
      const { data: invoice } = await supabase
        .from('invoices')
        .select('status')
        .eq('id', billing.invoice_id)
        .single();

      if (invoice?.status === 'paid') {
        // Update billing history
        await supabase
          .from('subscription_billing_history')
          .update({ status: 'paid', payment_date: new Date().toISOString() })
          .eq('id', billing.id);

        const sub = billing.subscription as unknown as Subscription;
        if (sub?.status === 'suspended') {
          // Calculate next billing date based on cycle
          let nextDate = new Date();
          switch (sub.billing_cycle) {
            case 'monthly':
              nextDate.setMonth(nextDate.getMonth() + 1);
              break;
            case 'quarterly':
              nextDate.setMonth(nextDate.getMonth() + 3);
              break;
            case 'yearly':
              nextDate.setFullYear(nextDate.getFullYear() + 1);
              break;
          }

          // Reactivate subscription
          await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              suspended_at: null,
              failed_billing_attempts: 0,
              next_billing_date: nextDate.toISOString().split('T')[0],
              last_billing_date: new Date().toISOString().split('T')[0],
            })
            .eq('id', sub.id);

          // Reactivate hosting
          if (sub.hosting_account_id) {
            await supabase
              .from('hosting_accounts')
              .update({ status: 'active', suspended_reason: null })
              .eq('id', sub.hosting_account_id);
          }

          await supabase.from('subscription_logs').insert({
            subscription_id: sub.id,
            action: 'reactivated_payment',
            old_status: 'suspended',
            new_status: 'active',
          });

          // Notify user
          await sendNotification(supabase, sub.user_id, 'subscription_reactivated', {
            plan_name: sub.plan_name,
          });

          console.log(`[Subscription Billing] Reactivated subscription ${sub.id} after payment`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: {
          due: dueSubscriptions?.length || 0,
          reminders: upcomingSubscriptions?.length || 0,
          overdue: overdueSubscriptions?.length || 0,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Subscription Billing Cron] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendNotification(supabase: any, userId: string, type: string, data: Record<string, any>) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone, full_name')
      .eq('user_id', userId)
      .single();

    if (profile?.phone) {
      const messages: Record<string, string> = {
        subscription_renewal: `Digiwebdex: আপনার ${data.plan_name} সাবস্ক্রিপশন আজ নবায়ন হয়েছে। পরিমাণ: ৳${data.amount}। পেমেন্ট শেষ তারিখ: ${data.due_date}`,
        subscription_reminder: `Digiwebdex: আপনার ${data.plan_name} সাবস্ক্রিপশন ${data.days_remaining} দিনে নবায়ন হবে। পরিমাণ: ৳${data.amount}`,
        subscription_overdue: `Digiwebdex: আপনার ${data.plan_name} সাবস্ক্রিপশন বকেয়া! ${data.suspension_date} তারিখে সার্ভিস বন্ধ হবে।`,
        subscription_reactivated: `Digiwebdex: আপনার ${data.plan_name} সাবস্ক্রিপশন পুনরায় সক্রিয় করা হয়েছে!`,
      };

      // Store notification
      await supabase.from('notifications').insert({
        user_id: userId,
        recipient: profile.phone,
        notification_type: 'sms',
        subject: type,
        body: messages[type] || `Subscription update: ${type}`,
        status: 'pending',
      });
    }
  } catch (err) {
    console.error('[Notification Error]:', err);
  }
}

async function sendAdminNotification(supabase: any, type: string, data: Record<string, any>) {
  try {
    const { data: admins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    for (const admin of (admins || [])) {
      await supabase.from('notifications').insert({
        user_id: admin.user_id,
        recipient: 'admin',
        notification_type: 'email',
        subject: `Subscription Alert: ${type}`,
        body: JSON.stringify(data),
        status: 'pending',
      });
    }
  } catch (err) {
    console.error('[Admin Notification Error]:', err);
  }
}
