import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { subscriptionService, type SubscriptionWithDetails } from '@/services/subscription';
import { 
  CreditCard, 
  Calendar, 
  RefreshCw, 
  XCircle, 
  CheckCircle,
  AlertTriangle,
  Download,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Subscriptions() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    if (user?.id) {
      fetchSubscriptions();
    }
  }, [user?.id]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getUserSubscriptions(user!.id);
      setSubscriptions(data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error(language === 'bn' ? 'সাবস্ক্রিপশন লোড করতে ব্যর্থ' : 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoRenew = async (subscriptionId: string, currentValue: boolean) => {
    try {
      await subscriptionService.toggleAutoRenew(subscriptionId, !currentValue);
      toast.success(
        !currentValue
          ? (language === 'bn' ? 'স্বয়ংক্রিয় নবায়ন সক্রিয়' : 'Auto-renew enabled')
          : (language === 'bn' ? 'স্বয়ংক্রিয় নবায়ন নিষ্ক্রিয়' : 'Auto-renew disabled')
      );
      fetchSubscriptions();
    } catch (error) {
      toast.error(language === 'bn' ? 'আপডেট ব্যর্থ' : 'Update failed');
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      await subscriptionService.cancelSubscription(subscriptionId);
      toast.success(language === 'bn' ? 'সাবস্ক্রিপশন বাতিল হয়েছে' : 'Subscription cancelled');
      fetchSubscriptions();
    } catch (error) {
      toast.error(language === 'bn' ? 'বাতিল করতে ব্যর্থ' : 'Failed to cancel');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
      active: { 
        label: language === 'bn' ? 'সক্রিয়' : 'Active', 
        variant: 'default',
        className: 'bg-green-500 hover:bg-green-600'
      },
      suspended: { 
        label: language === 'bn' ? 'স্থগিত' : 'Suspended', 
        variant: 'destructive'
      },
      cancelled: { 
        label: language === 'bn' ? 'বাতিল' : 'Cancelled', 
        variant: 'secondary'
      },
      pending: { 
        label: language === 'bn' ? 'বিচারাধীন' : 'Pending', 
        variant: 'outline',
        className: 'border-yellow-500 text-yellow-600'
      },
      expired: { 
        label: language === 'bn' ? 'মেয়াদ শেষ' : 'Expired', 
        variant: 'destructive'
      },
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getBillingCycleLabel = (cycle: string) => {
    const labels: Record<string, { en: string; bn: string }> = {
      monthly: { en: 'Monthly', bn: 'মাসিক' },
      quarterly: { en: 'Quarterly', bn: 'ত্রৈমাসিক' },
      yearly: { en: 'Yearly', bn: 'বার্ষিক' },
    };
    const label = labels[cycle] || { en: cycle, bn: cycle };
    return language === 'bn' ? label.bn : label.en;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (activeTab === 'active') return sub.status === 'active';
    if (activeTab === 'suspended') return sub.status === 'suspended';
    if (activeTab === 'cancelled') return sub.status === 'cancelled';
    return true;
  });

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const suspendedCount = subscriptions.filter((s) => s.status === 'suspended').length;
  const cancelledCount = subscriptions.filter((s) => s.status === 'cancelled').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'bn' ? 'সাবস্ক্রিপশন' : 'Subscriptions'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn'
              ? 'আপনার সক্রিয় সাবস্ক্রিপশন পরিচালনা করুন'
              : 'Manage your active subscriptions'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-green-500/10 p-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'সক্রিয়' : 'Active'}
                </p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-yellow-500/10 p-3">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'স্থগিত' : 'Suspended'}
                </p>
                <p className="text-2xl font-bold text-yellow-600">{suspendedCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/30">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-gray-500/10 p-3">
                <XCircle className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'বাতিল' : 'Cancelled'}
                </p>
                <p className="text-2xl font-bold text-gray-600">{cancelledCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">
              {language === 'bn' ? 'সক্রিয়' : 'Active'} ({activeCount})
            </TabsTrigger>
            <TabsTrigger value="suspended">
              {language === 'bn' ? 'স্থগিত' : 'Suspended'} ({suspendedCount})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              {language === 'bn' ? 'বাতিল' : 'Cancelled'} ({cancelledCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredSubscriptions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'bn'
                      ? 'কোনো সাবস্ক্রিপশন পাওয়া যায়নি'
                      : 'No subscriptions found'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredSubscriptions.map((subscription) => (
                  <Card key={subscription.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{subscription.plan_name}</CardTitle>
                          <CardDescription>{subscription.service_type}</CardDescription>
                        </div>
                        {getStatusBadge(subscription.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Subscription Details */}
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {language === 'bn' ? 'পরিমাণ' : 'Amount'}
                            </p>
                            <p className="font-semibold">{formatCurrency(Number(subscription.amount))}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {language === 'bn' ? 'বিলিং সাইকেল' : 'Billing Cycle'}
                            </p>
                            <p className="font-semibold">{getBillingCycleLabel(subscription.billing_cycle)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {language === 'bn' ? 'পরবর্তী বিলিং' : 'Next Billing'}
                            </p>
                            <p className="font-semibold">{formatDate(subscription.next_billing_date)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {language === 'bn' ? 'শুরু তারিখ' : 'Started'}
                            </p>
                            <p className="font-semibold">{formatDate(subscription.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {subscription.status === 'active' && (
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                          <div className="flex items-center gap-3">
                            <span className="text-sm">
                              {language === 'bn' ? 'স্বয়ংক্রিয় নবায়ন' : 'Auto-renew'}
                            </span>
                            <Switch
                              checked={subscription.auto_renew || false}
                              onCheckedChange={() => 
                                handleToggleAutoRenew(subscription.id, subscription.auto_renew || false)
                              }
                            />
                          </div>

                          <div className="flex gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  {language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {language === 'bn'
                                      ? 'সাবস্ক্রিপশন বাতিল করুন?'
                                      : 'Cancel Subscription?'}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {language === 'bn'
                                      ? 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না। আপনার সার্ভিস বিলিং পিরিয়ড শেষ হলে বন্ধ হয়ে যাবে।'
                                      : 'This action cannot be undone. Your service will be discontinued at the end of the billing period.'}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {language === 'bn' ? 'না' : 'No'}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelSubscription(subscription.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {language === 'bn' ? 'হ্যাঁ, বাতিল করুন' : 'Yes, Cancel'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      )}

                      {subscription.status === 'suspended' && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            {language === 'bn'
                              ? 'পেমেন্ট বকেয়া থাকায় এই সাবস্ক্রিপশন স্থগিত। পেমেন্ট করুন পুনরায় সক্রিয় করতে।'
                              : 'This subscription is suspended due to overdue payment. Make payment to reactivate.'}
                          </p>
                          <Button size="sm" className="ml-auto">
                            {language === 'bn' ? 'পেমেন্ট করুন' : 'Pay Now'}
                          </Button>
                        </div>
                      )}

                      {/* Billing History */}
                      {subscription.billing_history && subscription.billing_history.length > 0 && (
                        <div className="pt-4">
                          <h4 className="text-sm font-medium mb-2">
                            {language === 'bn' ? 'বিলিং ইতিহাস' : 'Billing History'}
                          </h4>
                          <div className="space-y-2">
                            {subscription.billing_history.slice(0, 3).map((history) => (
                              <div
                                key={history.id}
                                className="flex items-center justify-between p-2 bg-muted/50 rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{formatDate(history.billing_date)}</span>
                                  <Badge variant={history.status === 'paid' ? 'default' : 'outline'} className={history.status === 'paid' ? 'bg-green-500' : ''}>
                                    {history.status === 'paid' 
                                      ? (language === 'bn' ? 'পরিশোধিত' : 'Paid')
                                      : (language === 'bn' ? 'বকেয়া' : 'Pending')}
                                  </Badge>
                                </div>
                                <span className="font-medium">{formatCurrency(Number(history.amount))}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
