import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import {
  RevenueMetricsCards,
  MonthlyRevenueTrendChart,
  ServiceRevenueDistributionChart,
  ExpiringServicesAlert,
  RenewalRateCard,
} from '@/components/admin/analytics';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { analyticsService } from '@/services/analytics';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminAnalytics() {
  const { language } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      analyticsService.clearCache();
      window.location.reload();
    } catch (error) {
      toast.error('Failed to refresh analytics');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'bn' ? 'রাজস্ব বিশ্লেষণ' : 'Revenue Analytics'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'bn'
                ? 'বিস্তারিত আর্থিক পরিসংখ্যান এবং চার্ট'
                : 'Detailed financial statistics and charts'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
          </Button>
        </div>

        {/* Key Metrics */}
        <RevenueMetricsCards />

        {/* Charts Section */}
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList>
            <TabsTrigger value="trends">
              {language === 'bn' ? 'রাজস্ব প্রবণতা' : 'Revenue Trends'}
            </TabsTrigger>
            <TabsTrigger value="distribution">
              {language === 'bn' ? 'সেবা বিভাজন' : 'Service Distribution'}
            </TabsTrigger>
            <TabsTrigger value="renewals">
              {language === 'bn' ? 'নবায়ন ও মেয়াদ' : 'Renewals & Expiry'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <MonthlyRevenueTrendChart />
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <ServiceRevenueDistributionChart />
          </TabsContent>

          <TabsContent value="renewals" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <RenewalRateCard />
              <ExpiringServicesAlert />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
