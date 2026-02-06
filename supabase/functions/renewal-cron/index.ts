import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ExpiringEntity {
  id: string;
  type: "hosting" | "domain";
  userId: string;
  entityName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  renewalAmount: number;
}

interface RenewalProcessResult {
  processed: number;
  reminders: number;
  invoicesGenerated: number;
  suspensions: number;
  errors: string[];
  timestamp: string;
}

const REMINDER_DAYS = [30, 15, 7, 1];
const INVOICE_GENERATION_DAYS = 30;
const GRACE_PERIOD_DAYS = 7;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const result: RenewalProcessResult = {
      processed: 0,
      reminders: 0,
      invoicesGenerated: 0,
      suspensions: 0,
      errors: [],
      timestamp: new Date().toISOString(),
    };

    console.log("[Renewal Cron] Starting renewal processing...");

    // 1. Process expiring hosting accounts
    const expiringHosting = await getExpiringHostingAccounts(supabase);
    for (const entity of expiringHosting) {
      try {
        await processExpiringEntity(supabase, entity, result);
        result.processed++;
      } catch (error) {
        result.errors.push(`Hosting ${entity.id}: ${(error as Error).message}`);
      }
    }

    // 2. Process expiring domains
    const expiringDomains = await getExpiringDomains(supabase);
    for (const entity of expiringDomains) {
      try {
        await processExpiringEntity(supabase, entity, result);
        result.processed++;
      } catch (error) {
        result.errors.push(`Domain ${entity.id}: ${(error as Error).message}`);
      }
    }

    // 3. Process suspensions
    await processSuspensions(supabase, result);

    // 4. Log the run
    await supabase.from("audit_logs").insert({
      action: "renewal_cron_run",
      entity_type: "system",
      new_values: result,
    });

    console.log("[Renewal Cron] Completed:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[Renewal Cron] Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function getExpiringHostingAccounts(
  supabase: any
): Promise<ExpiringEntity[]> {
  const maxDays = Math.max(...REMINDER_DAYS);
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + maxDays);
  const today = new Date();

  const { data: accounts, error } = await supabase
    .from("hosting_accounts")
    .select(
      `
      *,
      order:orders(total, user_id)
    `
    )
    .eq("status", "active")
    .lte("expiry_date", futureDate.toISOString().split("T")[0])
    .gte("expiry_date", today.toISOString().split("T")[0]);

  if (error) throw error;

  return (accounts || []).map((account: any) => {
    const expiryDate = new Date(account.expiry_date || "");
    const diffTime = expiryDate.getTime() - today.getTime();
    const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      id: account.id,
      type: "hosting" as const,
      userId: account.user_id || "",
      entityName: account.package_name || "Hosting Account",
      expiryDate: account.expiry_date || "",
      daysUntilExpiry,
      renewalAmount: account.order?.total || 0,
    };
  });
}

async function getExpiringDomains(supabase: any): Promise<ExpiringEntity[]> {
  const maxDays = Math.max(...REMINDER_DAYS);
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + maxDays);
  const today = new Date();

  const { data: domains, error } = await supabase
    .from("domains")
    .select(
      `
      *,
      order:orders(total, user_id)
    `
    )
    .in("status", ["active", "registered"])
    .lte("expiry_date", futureDate.toISOString().split("T")[0])
    .gte("expiry_date", today.toISOString().split("T")[0]);

  if (error) throw error;

  return (domains || []).map((domain: any) => {
    const expiryDate = new Date(domain.expiry_date || "");
    const diffTime = expiryDate.getTime() - today.getTime();
    const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      id: domain.id,
      type: "domain" as const,
      userId: domain.user_id || "",
      entityName: domain.domain_name || "",
      expiryDate: domain.expiry_date || "",
      daysUntilExpiry,
      renewalAmount: 0, // Will be fetched from domain_pricing
    };
  });
}

async function processExpiringEntity(
  supabase: any,
  entity: ExpiringEntity,
  result: RenewalProcessResult
): Promise<void> {
  const { daysUntilExpiry } = entity;

  // Check if this is a reminder day
  if (!REMINDER_DAYS.includes(daysUntilExpiry)) {
    return;
  }

  // Idempotency check: see if already processed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: existingLog } = await supabase
    .from("renewal_logs")
    .select("id")
    .eq("entity_id", entity.id)
    .gte("created_at", today.toISOString())
    .limit(1);

  if (existingLog && existingLog.length > 0) {
    console.log(`[Renewal Cron] Already processed ${entity.id} today, skipping`);
    return;
  }

  // Create notification record
  const reminderType = getReminderType(daysUntilExpiry);

  await supabase.from("notifications").insert({
    user_id: entity.userId,
    notification_type: "email",
    recipient: entity.userId,
    subject: `Renewal Reminder: Your ${entity.type} expires in ${daysUntilExpiry} days`,
    body: `Your ${entity.type} (${entity.entityName}) is expiring on ${entity.expiryDate}. Please renew to avoid service interruption.`,
    status: "pending",
    metadata: {
      entity_type: entity.type,
      entity_id: entity.id,
      days_until_expiry: daysUntilExpiry,
      reminder_type: reminderType,
    },
  });

  result.reminders++;

  // Generate invoice on first reminder (30 days)
  if (daysUntilExpiry === INVOICE_GENERATION_DAYS) {
    // Check if invoice already exists
    const { data: existingInvoice } = await supabase
      .from("renewal_logs")
      .select("invoice_id")
      .eq("entity_id", entity.id)
      .eq("entity_type", entity.type)
      .not("invoice_id", "is", null)
      .limit(1);

    if (!existingInvoice || existingInvoice.length === 0) {
      // Generate invoice number
      const { data: invoiceNumber } = await supabase.rpc(
        "generate_invoice_number"
      );

      // Get renewal amount for domains
      let renewalAmount = entity.renewalAmount;
      if (entity.type === "domain") {
        const domainParts = entity.entityName.split(".");
        const tld = domainParts.slice(1).join(".");
        const { data: pricing } = await supabase
          .from("domain_pricing")
          .select("renewal_price")
          .eq("tld", `.${tld}`)
          .single();
        renewalAmount = pricing?.renewal_price || 0;
      }

      const dueDate = new Date(entity.expiryDate);

      const { data: invoice } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber || `INV-${Date.now()}`,
          user_id: entity.userId,
          subtotal: renewalAmount,
          total: renewalAmount,
          discount: 0,
          tax: 0,
          status: "unpaid",
          due_date: dueDate.toISOString().split("T")[0],
          notes: `Renewal invoice for ${entity.type}: ${entity.entityName}`,
        })
        .select()
        .single();

      if (invoice) {
        result.invoicesGenerated++;

        // Log with invoice ID
        await supabase.from("renewal_logs").insert({
          entity_type: entity.type,
          entity_id: entity.id,
          old_expiry_date: entity.expiryDate,
          invoice_id: invoice.id,
        });

        return;
      }
    }
  }

  // Log reminder
  await supabase.from("renewal_logs").insert({
    entity_type: entity.type,
    entity_id: entity.id,
    old_expiry_date: entity.expiryDate,
  });
}

function getReminderType(days: number): string {
  if (days === 30) return "first";
  if (days === 15) return "second";
  if (days === 7) return "third";
  if (days === 1) return "final";
  return "reminder";
}

async function processSuspensions(
  supabase: any,
  result: RenewalProcessResult
): Promise<void> {
  const gracePeriodEnd = new Date();
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() - GRACE_PERIOD_DAYS);
  const gracePeriodEndStr = gracePeriodEnd.toISOString().split("T")[0];

  // Suspend hosting accounts past grace period
  const { data: expiredHosting } = await supabase
    .from("hosting_accounts")
    .select("*")
    .eq("status", "active")
    .lt("expiry_date", gracePeriodEndStr);

  for (const account of expiredHosting || []) {
    // Check if invoice is paid
    const { data: renewalLog } = await supabase
      .from("renewal_logs")
      .select("invoice_id")
      .eq("entity_id", account.id)
      .eq("entity_type", "hosting")
      .not("invoice_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let isPaid = false;
    if (renewalLog?.invoice_id) {
      const { data: invoice } = await supabase
        .from("invoices")
        .select("status")
        .eq("id", renewalLog.invoice_id)
        .single();
      isPaid = invoice?.status === "paid";
    }

    if (!isPaid) {
      await supabase
        .from("hosting_accounts")
        .update({
          status: "suspended",
          suspended_reason: "Non-payment after grace period",
        })
        .eq("id", account.id);

      result.suspensions++;

      // Send suspension notification
      await supabase.from("notifications").insert({
        user_id: account.user_id,
        notification_type: "email",
        recipient: account.user_id,
        subject: "Service Suspended: Hosting Account",
        body: `Your hosting account (${account.package_name}) has been suspended due to non-payment. Please pay the outstanding invoice to reactivate.`,
        status: "pending",
        metadata: {
          entity_type: "hosting",
          entity_id: account.id,
          reason: "non_payment",
        },
      });

      // Log suspension
      await supabase.from("renewal_logs").insert({
        entity_type: "hosting",
        entity_id: account.id,
        old_expiry_date: account.expiry_date,
      });
    }
  }

  // Mark domains as expired past grace period
  const { data: expiredDomains } = await supabase
    .from("domains")
    .select("*")
    .in("status", ["active", "registered"])
    .lt("expiry_date", gracePeriodEndStr);

  for (const domain of expiredDomains || []) {
    // Check if invoice is paid
    const { data: renewalLog } = await supabase
      .from("renewal_logs")
      .select("invoice_id")
      .eq("entity_id", domain.id)
      .eq("entity_type", "domain")
      .not("invoice_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let isPaid = false;
    if (renewalLog?.invoice_id) {
      const { data: invoice } = await supabase
        .from("invoices")
        .select("status")
        .eq("id", renewalLog.invoice_id)
        .single();
      isPaid = invoice?.status === "paid";
    }

    if (!isPaid) {
      await supabase
        .from("domains")
        .update({ status: "expired" })
        .eq("id", domain.id);

      result.suspensions++;

      // Send expiration notification
      await supabase.from("notifications").insert({
        user_id: domain.user_id,
        notification_type: "email",
        recipient: domain.user_id,
        subject: "Domain Expired",
        body: `Your domain ${domain.domain_name} has expired due to non-renewal. Please renew immediately to avoid losing your domain.`,
        status: "pending",
        metadata: {
          entity_type: "domain",
          entity_id: domain.id,
          reason: "non_payment",
        },
      });

      // Log expiration
      await supabase.from("renewal_logs").insert({
        entity_type: "domain",
        entity_id: domain.id,
        old_expiry_date: domain.expiry_date,
      });
    }
  }
}
