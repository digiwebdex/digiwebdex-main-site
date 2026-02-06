import { supabase } from '@/integrations/supabase/client';

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  mrr: number;
  arr: number;
  pendingInvoices: { count: number; amount: number };
  overdueInvoices: { count: number; amount: number };
  activeServices: { domains: number; hosting: number };
  suspendedServices: { hosting: number };
}

export interface ServiceRevenueBreakdown {
  domain: number;
  hosting: number;
  webDevelopment: number;
  softwareDevelopment: number;
  digitalMarketing: number;
  other: number;
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  orders: number;
}

export interface ExpiringService {
  id: string;
  name: string;
  type: 'domain' | 'hosting';
  expiryDate: string;
  daysUntilExpiry: number;
  userId: string;
}

// Simple in-memory cache
const cache: Map<string, { data: unknown; expiry: number }> = new Map();

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown, ttlMs: number = 5 * 60 * 1000): void {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

class AnalyticsService {
  async getRevenueMetrics(): Promise<RevenueMetrics> {
    const cacheKey = 'revenue_metrics';
    const cached = getCached<RevenueMetrics>(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    // Fetch all metrics in parallel
    const [
      totalRevenueResult,
      monthlyRevenueResult,
      pendingInvoicesResult,
      overdueInvoicesResult,
      activeDomainsResult,
      activeHostingResult,
      suspendedHostingResult,
      recurringRevenueResult,
    ] = await Promise.all([
      // Total revenue (all time paid invoices)
      supabase
        .from('invoices')
        .select('total')
        .eq('status', 'paid'),
      // Monthly revenue
      supabase
        .from('invoices')
        .select('total')
        .eq('status', 'paid')
        .gte('paid_at', firstDayOfMonth)
        .lte('paid_at', lastDayOfMonth),
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
      // Active domains
      supabase
        .from('domains')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      // Active hosting
      supabase
        .from('hosting_accounts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      // Suspended hosting
      supabase
        .from('hosting_accounts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'suspended'),
      // MRR calculation from recurring orders
      supabase
        .from('orders')
        .select('total, billing_type')
        .eq('status', 'active')
        .eq('billing_type', 'recurring'),
    ]);

    const totalRevenue = (totalRevenueResult.data || []).reduce((sum, inv) => sum + Number(inv.total), 0);
    const monthlyRevenue = (monthlyRevenueResult.data || []).reduce((sum, inv) => sum + Number(inv.total), 0);
    
    const pendingAmount = (pendingInvoicesResult.data || []).reduce((sum, inv) => sum + Number(inv.total), 0);
    const overdueAmount = (overdueInvoicesResult.data || []).reduce((sum, inv) => sum + Number(inv.total), 0);
    
    // Calculate MRR from active recurring subscriptions
    const mrr = (recurringRevenueResult.data || []).reduce((sum, order) => sum + Number(order.total), 0);
    const arr = mrr * 12;

    const metrics: RevenueMetrics = {
      totalRevenue,
      monthlyRevenue,
      mrr,
      arr,
      pendingInvoices: {
        count: pendingInvoicesResult.data?.length || 0,
        amount: pendingAmount,
      },
      overdueInvoices: {
        count: overdueInvoicesResult.data?.length || 0,
        amount: overdueAmount,
      },
      activeServices: {
        domains: activeDomainsResult.count || 0,
        hosting: activeHostingResult.count || 0,
      },
      suspendedServices: {
        hosting: suspendedHostingResult.count || 0,
      },
    };

    setCache(cacheKey, metrics);
    return metrics;
  }

  async getServiceRevenueBreakdown(): Promise<ServiceRevenueBreakdown> {
    const cacheKey = 'service_revenue_breakdown';
    const cached = getCached<ServiceRevenueBreakdown>(cacheKey);
    if (cached) return cached;

    const { data: orders } = await supabase
      .from('orders')
      .select('service_type, total')
      .eq('status', 'completed');

    const breakdown: ServiceRevenueBreakdown = {
      domain: 0,
      hosting: 0,
      webDevelopment: 0,
      softwareDevelopment: 0,
      digitalMarketing: 0,
      other: 0,
    };

    (orders || []).forEach((order) => {
      const amount = Number(order.total);
      switch (order.service_type) {
        case 'domain':
          breakdown.domain += amount;
          break;
        case 'hosting':
          breakdown.hosting += amount;
          break;
        case 'web_development':
          breakdown.webDevelopment += amount;
          break;
        case 'software_development':
          breakdown.softwareDevelopment += amount;
          break;
        case 'digital_marketing':
          breakdown.digitalMarketing += amount;
          break;
        default:
          breakdown.other += amount;
      }
    });

    setCache(cacheKey, breakdown);
    return breakdown;
  }

  async getMonthlyRevenueTrend(months: number = 12): Promise<MonthlyTrend[]> {
    const cacheKey = `monthly_trend_${months}`;
    const cached = getCached<MonthlyTrend[]>(cacheKey);
    if (cached) return cached;

    const trends: MonthlyTrend[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

      const [revenueResult, ordersResult] = await Promise.all([
        supabase
          .from('invoices')
          .select('total')
          .eq('status', 'paid')
          .gte('paid_at', startOfMonth)
          .lte('paid_at', endOfMonth),
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth),
      ]);

      trends.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: (revenueResult.data || []).reduce((sum, inv) => sum + Number(inv.total), 0),
        orders: ordersResult.count || 0,
      });
    }

    setCache(cacheKey, trends, 10 * 60 * 1000); // 10 min cache for trends
    return trends;
  }

  async getExpiringServices(days: number = 30): Promise<ExpiringService[]> {
    const cacheKey = `expiring_services_${days}`;
    const cached = getCached<ExpiringService[]>(cacheKey);
    if (cached) return cached;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const [domainsResult, hostingResult] = await Promise.all([
      supabase
        .from('domains')
        .select('id, domain_name, expiry_date, user_id')
        .eq('status', 'active')
        .gte('expiry_date', today)
        .lte('expiry_date', futureDateStr)
        .order('expiry_date', { ascending: true }),
      supabase
        .from('hosting_accounts')
        .select('id, username, expiry_date, user_id')
        .eq('status', 'active')
        .gte('expiry_date', today)
        .lte('expiry_date', futureDateStr)
        .order('expiry_date', { ascending: true }),
    ]);

    const services: ExpiringService[] = [];
    const todayDate = new Date();

    (domainsResult.data || []).forEach((domain) => {
      const expiryDate = new Date(domain.expiry_date!);
      services.push({
        id: domain.id,
        name: domain.domain_name,
        type: 'domain',
        expiryDate: domain.expiry_date!,
        daysUntilExpiry: Math.ceil((expiryDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)),
        userId: domain.user_id!,
      });
    });

    (hostingResult.data || []).forEach((hosting) => {
      const expiryDate = new Date(hosting.expiry_date!);
      services.push({
        id: hosting.id,
        name: hosting.username || 'Unnamed Hosting',
        type: 'hosting',
        expiryDate: hosting.expiry_date!,
        daysUntilExpiry: Math.ceil((expiryDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)),
        userId: hosting.user_id!,
      });
    });

    // Sort by days until expiry
    services.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    setCache(cacheKey, services, 5 * 60 * 1000);
    return services;
  }

  async getRenewalRate(): Promise<number> {
    const cacheKey = 'renewal_rate';
    const cached = getCached<number>(cacheKey);
    if (cached !== null) return cached;

    // Calculate renewal rate from renewal_logs
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: renewalLogs, count: totalRenewals } = await supabase
      .from('renewal_logs')
      .select('id', { count: 'exact' })
      .gte('created_at', threeMonthsAgo.toISOString());

    // Get total expired/due for renewal in the same period
    const { count: totalDue } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .in('status', ['paid', 'unpaid', 'overdue'])
      .gte('created_at', threeMonthsAgo.toISOString());

    const rate = totalDue && totalDue > 0 ? ((totalRenewals || 0) / totalDue) * 100 : 0;
    
    setCache(cacheKey, rate, 30 * 60 * 1000); // 30 min cache
    return Math.round(rate * 100) / 100;
  }

  // Clear cache (useful after data updates)
  clearCache(): void {
    cache.clear();
  }
}

export const analyticsService = new AnalyticsService();
