import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { affiliateService, type AffiliateProfile, type AffiliateStats, type Commission, type WithdrawalRequest } from '@/services/affiliate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Copy, Link2, TrendingUp, Users, DollarSign, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [affiliate, setAffiliate] = useState<AffiliateProfile | null>(null);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [paymentNumber, setPaymentNumber] = useState('');
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadAffiliateData();
    }
  }, [user]);

  const loadAffiliateData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const profile = await affiliateService.getOrCreateAffiliateProfile(user.id);
      setAffiliate(profile);

      if (profile) {
        const [statsData, commissionsData, withdrawalsData] = await Promise.all([
          affiliateService.getAffiliateStats(profile.id),
          affiliateService.getCommissions(profile.id),
          affiliateService.getWithdrawals(profile.id),
        ]);
        setStats(statsData);
        setCommissions(commissionsData);
        setWithdrawals(withdrawalsData);
      }
    } catch (error) {
      console.error('Error loading affiliate data:', error);
      toast.error('Failed to load affiliate data');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (affiliate) {
      const link = affiliateService.getReferralLink(affiliate.referral_code);
      navigator.clipboard.writeText(link);
      toast.success(language === 'bn' ? 'লিঙ্ক কপি হয়েছে!' : 'Link copied!');
    }
  };

  const handleWithdrawalRequest = async () => {
    if (!affiliate) return;
    
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(language === 'bn' ? 'সঠিক পরিমাণ দিন' : 'Enter valid amount');
      return;
    }

    if (!paymentNumber) {
      toast.error(language === 'bn' ? 'পেমেন্ট নম্বর দিন' : 'Enter payment number');
      return;
    }

    setSubmitting(true);
    try {
      const result = await affiliateService.requestWithdrawal(
        affiliate.id,
        amount,
        paymentMethod,
        { account_number: paymentNumber }
      );

      if (result.success) {
        toast.success(language === 'bn' ? 'উইথড্র রিকোয়েস্ট জমা হয়েছে' : 'Withdrawal request submitted');
        setWithdrawDialogOpen(false);
        setWithdrawalAmount('');
        setPaymentNumber('');
        loadAffiliateData();
      } else {
        toast.error(result.error || 'Failed to submit request');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      approved: 'default',
      paid: 'default',
      completed: 'default',
      cancelled: 'destructive',
      rejected: 'destructive',
      processing: 'outline',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!affiliate) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {language === 'bn' ? 'অ্যাফিলিয়েট প্রোফাইল তৈরি করতে সমস্যা হয়েছে' : 'Failed to create affiliate profile'}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const isPending = affiliate.status === 'pending';
  const isSuspended = affiliate.status === 'suspended';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'bn' ? 'অ্যাফিলিয়েট ড্যাশবোর্ড' : 'Affiliate Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'আপনার রেফারেল এবং কমিশন ট্র্যাক করুন' : 'Track your referrals and commissions'}
          </p>
        </div>

        {/* Status Alerts */}
        {isPending && (
          <Card className="border-yellow-500 bg-yellow-500/10">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <p className="text-yellow-700 dark:text-yellow-400">
                  {language === 'bn' 
                    ? 'আপনার অ্যাফিলিয়েট আবেদন পর্যালোচনাধীন। অনুমোদনের পর আপনি রেফার করতে পারবেন।'
                    : 'Your affiliate application is under review. You can start referring once approved.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isSuspended && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-destructive" />
                <p className="text-destructive">
                  {language === 'bn'
                    ? 'আপনার অ্যাফিলিয়েট অ্যাকাউন্ট স্থগিত করা হয়েছে। সাপোর্টে যোগাযোগ করুন।'
                    : 'Your affiliate account has been suspended. Please contact support.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Referral Link Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              {language === 'bn' ? 'আপনার রেফারেল লিঙ্ক' : 'Your Referral Link'}
            </CardTitle>
            <CardDescription>
              {language === 'bn'
                ? 'এই লিঙ্ক শেয়ার করে কমিশন আয় করুন'
                : 'Share this link to earn commissions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                readOnly
                value={affiliateService.getReferralLink(affiliate.referral_code)}
                className="font-mono text-sm"
              />
              <Button onClick={copyReferralLink} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                {language === 'bn' ? 'কপি' : 'Copy'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {language === 'bn' ? 'রেফারেল কোড:' : 'Referral Code:'} <code className="bg-muted px-2 py-1 rounded">{affiliate.referral_code}</code>
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'মোট ক্লিক' : 'Total Clicks'}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClicks}</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'bn' ? `আজ: ${stats.todayClicks}` : `Today: ${stats.todayClicks}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'কনভার্সন' : 'Conversions'}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalConversions}</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'bn' ? `রেট: ${stats.conversionRate}%` : `Rate: ${stats.conversionRate}%`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'উত্তোলনযোগ্য' : 'Withdrawable'}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.withdrawableEarnings)}</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'bn' ? `পেন্ডিং: ${formatCurrency(stats.pendingEarnings)}` : `Pending: ${formatCurrency(stats.pendingEarnings)}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'মোট আয়' : 'Total Earnings'}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'bn' ? `উত্তোলিত: ${formatCurrency(stats.withdrawnEarnings)}` : `Withdrawn: ${formatCurrency(stats.withdrawnEarnings)}`}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Withdrawal Button */}
        {affiliate.status === 'active' && stats && stats.withdrawableEarnings >= affiliate.min_withdrawal_amount && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {language === 'bn' ? 'উত্তোলনযোগ্য ব্যালেন্স' : 'Withdrawable Balance'}
                  </p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.withdrawableEarnings)}</p>
                </div>
                <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      {language === 'bn' ? 'উইথড্র রিকোয়েস্ট' : 'Request Withdrawal'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{language === 'bn' ? 'উইথড্র রিকোয়েস্ট' : 'Withdrawal Request'}</DialogTitle>
                      <DialogDescription>
                        {language === 'bn' 
                          ? `সর্বনিম্ন উত্তোলন: ${formatCurrency(affiliate.min_withdrawal_amount)}`
                          : `Minimum withdrawal: ${formatCurrency(affiliate.min_withdrawal_amount)}`}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>{language === 'bn' ? 'পরিমাণ' : 'Amount'}</Label>
                        <Input
                          type="number"
                          value={withdrawalAmount}
                          onChange={(e) => setWithdrawalAmount(e.target.value)}
                          placeholder={`Max: ${stats.withdrawableEarnings}`}
                        />
                      </div>
                      <div>
                        <Label>{language === 'bn' ? 'পেমেন্ট মেথড' : 'Payment Method'}</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bkash">bKash</SelectItem>
                            <SelectItem value="nagad">Nagad</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>
                          {paymentMethod === 'bank' 
                            ? (language === 'bn' ? 'অ্যাকাউন্ট নম্বর' : 'Account Number')
                            : (language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number')}
                        </Label>
                        <Input
                          value={paymentNumber}
                          onChange={(e) => setPaymentNumber(e.target.value)}
                          placeholder={paymentMethod === 'bank' ? 'Account number' : '01XXXXXXXXX'}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                        {language === 'bn' ? 'বাতিল' : 'Cancel'}
                      </Button>
                      <Button onClick={handleWithdrawalRequest} disabled={submitting}>
                        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {language === 'bn' ? 'জমা দিন' : 'Submit'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Commissions and Withdrawals */}
        <Tabs defaultValue="commissions">
          <TabsList>
            <TabsTrigger value="commissions">
              {language === 'bn' ? 'কমিশন' : 'Commissions'}
            </TabsTrigger>
            <TabsTrigger value="withdrawals">
              {language === 'bn' ? 'উইথড্র' : 'Withdrawals'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="commissions">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'bn' ? 'কমিশন ইতিহাস' : 'Commission History'}</CardTitle>
              </CardHeader>
              <CardContent>
                {commissions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {language === 'bn' ? 'কোনো কমিশন নেই' : 'No commissions yet'}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'bn' ? 'তারিখ' : 'Date'}</TableHead>
                        <TableHead>{language === 'bn' ? 'অর্ডার মূল্য' : 'Order Amount'}</TableHead>
                        <TableHead>{language === 'bn' ? 'রেট' : 'Rate'}</TableHead>
                        <TableHead>{language === 'bn' ? 'কমিশন' : 'Commission'}</TableHead>
                        <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissions.map((commission) => (
                        <TableRow key={commission.id}>
                          <TableCell>{new Date(commission.created_at).toLocaleDateString('bn-BD')}</TableCell>
                          <TableCell>{formatCurrency(commission.order_amount)}</TableCell>
                          <TableCell>{commission.commission_rate}%</TableCell>
                          <TableCell className="font-medium">{formatCurrency(commission.commission_amount)}</TableCell>
                          <TableCell>{getStatusBadge(commission.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'bn' ? 'উইথড্র ইতিহাস' : 'Withdrawal History'}</CardTitle>
              </CardHeader>
              <CardContent>
                {withdrawals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {language === 'bn' ? 'কোনো উইথড্র নেই' : 'No withdrawals yet'}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'bn' ? 'তারিখ' : 'Date'}</TableHead>
                        <TableHead>{language === 'bn' ? 'পরিমাণ' : 'Amount'}</TableHead>
                        <TableHead>{language === 'bn' ? 'মেথড' : 'Method'}</TableHead>
                        <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((withdrawal) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell>{new Date(withdrawal.created_at).toLocaleDateString('bn-BD')}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(withdrawal.amount)}</TableCell>
                          <TableCell className="capitalize">{withdrawal.payment_method}</TableCell>
                          <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Commission Rate Info */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'bn' ? 'কমিশন তথ্য' : 'Commission Info'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'bn' ? 'কমিশন রেট' : 'Commission Rate'}</p>
                <p className="text-2xl font-bold">{affiliate.commission_rate}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{language === 'bn' ? 'গ্রেস পিরিয়ড' : 'Grace Period'}</p>
                <p className="text-2xl font-bold">{affiliate.grace_period_days} {language === 'bn' ? 'দিন' : 'days'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{language === 'bn' ? 'সর্বনিম্ন উত্তোলন' : 'Min. Withdrawal'}</p>
                <p className="text-2xl font-bold">{formatCurrency(affiliate.min_withdrawal_amount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
