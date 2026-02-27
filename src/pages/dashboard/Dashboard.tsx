import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ShoppingCart, FileText, Globe, Server, FolderKanban, CreditCard, Rocket, Wallet, CalendarClock } from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  pendingInvoices: number;
  activeDomains: number;
  activeHosting: number;
  activeProjects: number;
  dueAmount: number;
  nextRenewal: string | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activeOrders: 0,
    pendingInvoices: 0,
    activeDomains: 0,
    activeHosting: 0,
    activeProjects: 0,
    dueAmount: 0,
    nextRenewal: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const [orders, invoices, domains, hosting, projects, subs] = await Promise.all([
        supabase.from('orders').select('id, status').eq('user_id', user.id),
        supabase.from('invoices').select('id, status, due_amount').eq('user_id', user.id),
        supabase.from('domains').select('id, status, expiry_date').eq('user_id', user.id),
        supabase.from('hosting_accounts').select('id, status, expiry_date').eq('user_id', user.id),
        supabase.from('projects').select('id, status').eq('user_id', user.id),
        supabase.from('subscriptions').select('id, next_billing_date').eq('user_id', user.id).eq('status', 'active'),
      ]);

      // Calculate total due
      const totalDue = (invoices.data || [])
        .filter(i => ['unpaid', 'partial', 'overdue'].includes(i.status))
        .reduce((sum, i) => sum + Number(i.due_amount || 0), 0);

      // Find nearest renewal date
      const allDates = [
        ...(domains.data || []).filter(d => d.expiry_date).map(d => d.expiry_date!),
        ...(hosting.data || []).filter(h => h.expiry_date).map(h => h.expiry_date!),
        ...(subs.data || []).filter(s => s.next_billing_date).map(s => s.next_billing_date),
      ].filter(d => new Date(d) > new Date()).sort();

      setStats({
        totalOrders: orders.data?.length || 0,
        activeOrders: orders.data?.filter(o => ['processing', 'active'].includes(o.status)).length || 0,
        pendingInvoices: invoices.data?.filter(i => i.status === 'unpaid').length || 0,
        activeDomains: domains.data?.filter(d => d.status === 'active').length || 0,
        activeHosting: hosting.data?.filter(h => h.status === 'active').length || 0,
        activeProjects: projects.data?.filter(p => ['in_progress', 'review'].includes(p.status)).length || 0,
        dueAmount: totalDue,
        nextRenewal: allDates.length > 0 ? allDates[0] : null,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: language === 'bn' ? 'মোট অর্ডার' : 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: language === 'bn' ? 'সক্রিয় সেবা' : 'Active Services',
      value: stats.activeDomains + stats.activeHosting,
      icon: Server,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: language === 'bn' ? 'বকেয়া ইনভয়েস' : 'Pending Invoices',
      value: stats.pendingInvoices,
      icon: FileText,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: language === 'bn' ? 'বকেয়া পরিমাণ' : 'Due Amount',
      value: `৳${stats.dueAmount.toLocaleString()}`,
      icon: Wallet,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: language === 'bn' ? 'পরবর্তী রিনিউয়াল' : 'Next Renewal',
      value: stats.nextRenewal
        ? new Date(stats.nextRenewal).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        : (language === 'bn' ? 'নেই' : 'None'),
      icon: CalendarClock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: language === 'bn' ? 'সক্রিয় ডোমেইন' : 'Active Domains',
      value: stats.activeDomains,
      icon: Globe,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: language === 'bn' ? 'সক্রিয় হোস্টিং' : 'Active Hosting',
      value: stats.activeHosting,
      icon: Server,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
    },
    {
      title: language === 'bn' ? 'চলমান প্রজেক্ট' : 'Active Projects',
      value: stats.activeProjects,
      icon: FolderKanban,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' 
              ? 'আপনার সার্ভিসগুলোর সারসংক্ষেপ দেখুন'
              : 'Overview of your services'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? '...' : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>
              {language === 'bn' ? 'দ্রুত কার্যক্রম' : 'Quick Actions'}
            </CardTitle>
            <CardDescription>
              {language === 'bn'
                ? 'আপনার প্রয়োজনীয় কাজগুলো দ্রুত করুন'
                : 'Quickly access common tasks'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <QuickActionCard
                icon={Rocket}
                title={language === 'bn' ? 'নতুন সেবা শুরু' : 'Get Started'}
                href={`/${language}/dashboard/onboarding`}
                highlight
              />
              <QuickActionCard
                icon={ShoppingCart}
                title={language === 'bn' ? 'নতুন অর্ডার' : 'New Order'}
                href={`/${language}/pricing`}
              />
              <QuickActionCard
                icon={CreditCard}
                title={language === 'bn' ? 'পেমেন্ট করুন' : 'Make Payment'}
                href={`/${language}/dashboard/invoices`}
              />
              <QuickActionCard
                icon={Globe}
                title={language === 'bn' ? 'ডোমেইন সার্চ' : 'Search Domain'}
                href={`/${language}/services/domain-hosting`}
              />
              <QuickActionCard
                icon={FileText}
                title={language === 'bn' ? 'সাপোর্ট টিকেট' : 'Support Ticket'}
                href={`/${language}/contact`}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function QuickActionCard({ 
  icon: Icon, 
  title, 
  href,
  highlight 
}: { 
  icon: React.ElementType; 
  title: string; 
  href: string;
  highlight?: boolean;
}) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent",
        highlight && "border-primary bg-primary/5 hover:bg-primary/10"
      )}
    >
      <Icon className={cn("h-5 w-5", highlight ? "text-primary" : "text-primary")} />
      <span className="font-medium">{title}</span>
    </a>
  );
}
