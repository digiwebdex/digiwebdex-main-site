import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AggregationResult {
  month: string;
  totalRevenue: number;
  domainRevenue: number;
  hostingRevenue: number;
  webDevelopmentRevenue: number;
  softwareDevelopmentRevenue: number;
  digitalMarketingRevenue: number;
  otherRevenue: number;
  pendingInvoicesCount: number;
  pendingInvoicesAmount: number;
  overdueInvoicesCount: number;
  overdueInvoicesAmount: number;
  paidInvoicesCount: number;
  newOrdersCount: number;
  activeDomainsCount: number;
  activeHostingCount: number;
  suspendedHostingCount: number;
  renewalRate: number;
  mrr: number;
  arr: number;
}

async function aggregateMonthlyData(
  supabase: ReturnType<typeof createClient>,
  monthDate: Date
): Promise<AggregationResult> {
  const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString();
  const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59).toISOString();
  const monthStr = startOfMonth.split('T')[0];

  // Fetch all data in parallel
  const [
    paidInvoices,
    pendingInvoices,
    overdueInvoices,
    completedOrders,
    newOrders,
    activeDomains,
    activeHosting,
    suspendedHosting,
    recurringOrders,
    renewalLogs,
  ] = await Promise.all([
    // Paid invoices this month
    supabase
      .from('invoices')
      .select('total')
      .eq('status', 'paid')
      .gte('paid_at', startOfMonth)
      .lte('paid_at', endOfMonth),
    // Pending invoices
    supabase
      .from('invoices')
      .select('total')
      .eq('status', 'unpaid'),
    // Overdue invoices
    supabase
      .from('invoices')
      .select('total')
      .eq('status', 'overdue'),
    // Completed orders by service type
    supabase
      .from('orders')
      .select('service_type, total')
      .in('status', ['completed', 'active'])
      .gte('paid_at', startOfMonth)
      .lte('paid_at', endOfMonth),
    // New orders this month
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth),
    // Active domains count
    supabase
      .from('domains')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    // Active hosting count
    supabase
      .from('hosting_accounts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    // Suspended hosting count
    supabase
      .from('hosting_accounts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'suspended'),
    // Recurring orders for MRR
    supabase
      .from('orders')
      .select('total')
      .eq('status', 'active')
      .eq('billing_type', 'recurring'),
    // Renewal logs for renewal rate
    supabase
      .from('renewal_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth),
  ]);

  // Calculate revenue by service type
  const serviceRevenue = {
    domain: 0,
    hosting: 0,
    web_development: 0,
    software_development: 0,
    digital_marketing: 0,
    other: 0,
  };

  (completedOrders.data || []).forEach((order) => {
    const amount = Number(order.total);
    if (order.service_type in serviceRevenue) {
      serviceRevenue[order.service_type as keyof typeof serviceRevenue] += amount;
    } else {
      serviceRevenue.other += amount;
    }
  });

  const totalRevenue = (paidInvoices.data || []).reduce((sum, inv) => sum + Number(inv.total), 0);
  const pendingAmount = (pendingInvoices.data || []).reduce((sum, inv) => sum + Number(inv.total), 0);
  const overdueAmount = (overdueInvoices.data || []).reduce((sum, inv) => sum + Number(inv.total), 0);
  const mrr = (recurringOrders.data || []).reduce((sum, order) => sum + Number(order.total), 0);

  // Calculate renewal rate
  const totalDueForRenewal = (pendingInvoices.data?.length || 0) + (overdueInvoices.data?.length || 0) + (renewalLogs.count || 0);
  const renewalRate = totalDueForRenewal > 0 ? ((renewalLogs.count || 0) / totalDueForRenewal) * 100 : 0;

  return {
    month: monthStr,
    totalRevenue,
    domainRevenue: serviceRevenue.domain,
    hostingRevenue: serviceRevenue.hosting,
    webDevelopmentRevenue: serviceRevenue.web_development,
    softwareDevelopmentRevenue: serviceRevenue.software_development,
    digitalMarketingRevenue: serviceRevenue.digital_marketing,
    otherRevenue: serviceRevenue.other,
    pendingInvoicesCount: pendingInvoices.data?.length || 0,
    pendingInvoicesAmount: pendingAmount,
    overdueInvoicesCount: overdueInvoices.data?.length || 0,
    overdueInvoicesAmount: overdueAmount,
    paidInvoicesCount: paidInvoices.data?.length || 0,
    newOrdersCount: newOrders.count || 0,
    activeDomainsCount: activeDomains.count || 0,
    activeHostingCount: activeHosting.count || 0,
    suspendedHostingCount: suspendedHosting.count || 0,
    renewalRate: Math.round(renewalRate * 100) / 100,
    mrr,
    arr: mrr * 12,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting daily analytics aggregation...');

    // Aggregate current month
    const currentMonth = new Date();
    const aggregation = await aggregateMonthlyData(supabase, currentMonth);

    // Upsert into revenue_summary
    const { error: upsertError } = await supabase
      .from('revenue_summary')
      .upsert({
        month: aggregation.month,
        total_revenue: aggregation.totalRevenue,
        domain_revenue: aggregation.domainRevenue,
        hosting_revenue: aggregation.hostingRevenue,
        web_development_revenue: aggregation.webDevelopmentRevenue,
        software_development_revenue: aggregation.softwareDevelopmentRevenue,
        digital_marketing_revenue: aggregation.digitalMarketingRevenue,
        other_revenue: aggregation.otherRevenue,
        pending_invoices_count: aggregation.pendingInvoicesCount,
        pending_invoices_amount: aggregation.pendingInvoicesAmount,
        overdue_invoices_count: aggregation.overdueInvoicesCount,
        overdue_invoices_amount: aggregation.overdueInvoicesAmount,
        paid_invoices_count: aggregation.paidInvoicesCount,
        new_orders_count: aggregation.newOrdersCount,
        active_domains_count: aggregation.activeDomainsCount,
        active_hosting_count: aggregation.activeHostingCount,
        suspended_hosting_count: aggregation.suspendedHostingCount,
        renewal_rate: aggregation.renewalRate,
        mrr: aggregation.mrr,
        arr: aggregation.arr,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'month',
      });

    if (upsertError) {
      throw upsertError;
    }

    // Log the aggregation run
    await supabase.from('audit_logs').insert({
      action: 'analytics_aggregation',
      entity_type: 'revenue_summary',
      new_values: aggregation,
    });

    console.log('Analytics aggregation completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Analytics aggregation completed',
        data: aggregation,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Analytics aggregation error:', error);
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
