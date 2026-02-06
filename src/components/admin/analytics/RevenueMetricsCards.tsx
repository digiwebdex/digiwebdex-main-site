import { useEffect, useState } from 'react';
import { analyticsService, type RevenueMetrics } from '@/services/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Globe, 
  Server,
  Ban
} from 'lucide-react';

export function RevenueMetricsCards() {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const data = await analyticsService.getRevenueMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch revenue metrics:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return <div className="text-muted-foreground">Failed to load metrics</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const cards = [
    {
      title: 'মোট রাজস্ব',
      titleEn: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'মাসিক রাজস্ব',
      titleEn: 'Monthly Revenue',
      value: formatCurrency(metrics.monthlyRevenue),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'MRR',
      titleEn: 'Monthly Recurring',
      value: formatCurrency(metrics.mrr),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'ARR',
      titleEn: 'Annual Recurring',
      value: formatCurrency(metrics.arr),
      icon: DollarSign,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'বকেয়া ইনভয়েস',
      titleEn: 'Pending Invoices',
      value: `${metrics.pendingInvoices.count} (${formatCurrency(metrics.pendingInvoices.amount)})`,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'ওভারডিউ ইনভয়েস',
      titleEn: 'Overdue Invoices',
      value: `${metrics.overdueInvoices.count} (${formatCurrency(metrics.overdueInvoices.amount)})`,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'সক্রিয় সেবা',
      titleEn: 'Active Services',
      value: `${metrics.activeServices.domains} ডোমেইন, ${metrics.activeServices.hosting} হোস্টিং`,
      icon: Globe,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
    {
      title: 'স্থগিত সেবা',
      titleEn: 'Suspended',
      value: `${metrics.suspendedServices.hosting} হোস্টিং`,
      icon: Ban,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.titleEn} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
