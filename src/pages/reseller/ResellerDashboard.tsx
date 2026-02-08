import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  ArrowDownToLine,
  Plus,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { resellerService, ResellerProfile, ResellerClient, ResellerEarning, ResellerWithdrawal, ResellerStats } from '@/services/reseller';
import { format } from 'date-fns';

export default function ResellerDashboard() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ResellerProfile | null>(null);
  const [stats, setStats] = useState<ResellerStats | null>(null);
  const [clients, setClients] = useState<ResellerClient[]>([]);
  const [earnings, setEarnings] = useState<ResellerEarning[]>([]);
  const [withdrawals, setWithdrawals] = useState<ResellerWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  
  // Application form
  const [companyName, setCompanyName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [paymentNumber, setPaymentNumber] = useState('');
  
  // Client form
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [clientName, setClientName] = useState('');
  
  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const resellerProfile = await resellerService.getProfile();
    setProfile(resellerProfile);

    if (resellerProfile && resellerProfile.status === 'active') {
      const [statsData, clientsData, earningsData, withdrawalsData] = await Promise.all([
        resellerService.getStats(),
        resellerService.getClients(),
        resellerService.getEarnings(),
        resellerService.getWithdrawals(),
      ]);
      setStats(statsData);
      setClients(clientsData);
      setEarnings(earningsData);
      setWithdrawals(withdrawalsData);
    }
    setLoading(false);
  };

  const handleApply = async () => {
    if (!companyName) {
      toast({ title: 'Error', description: 'Company name is required', variant: 'destructive' });
      return;
    }

    const result = await resellerService.applyAsReseller(
      companyName,
      paymentMethod,
      { number: paymentNumber }
    );

    if (result.success) {
      toast({ title: 'Success', description: 'Application submitted! Awaiting approval.' });
      setShowApplyDialog(false);
      loadData();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleCreateClient = async () => {
    if (!clientEmail || !clientPassword || !clientName) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' });
      return;
    }

    const result = await resellerService.createClientAccount(clientEmail, clientPassword, clientName);

    if (result.success) {
      toast({ title: 'Success', description: 'Client account created successfully!' });
      setShowClientDialog(false);
      setClientEmail('');
      setClientPassword('');
      setClientName('');
      loadData();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({ title: 'Error', description: 'Enter a valid amount', variant: 'destructive' });
      return;
    }

    const result = await resellerService.requestWithdrawal(
      amount,
      profile?.payment_method || 'bkash',
      profile?.payment_details as Record<string, unknown>
    );

    if (result.success) {
      toast({ title: 'Success', description: 'Withdrawal request submitted!' });
      setShowWithdrawDialog(false);
      setWithdrawAmount('');
      loadData();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await resellerService.uploadLogo(file);
    if (url) {
      toast({ title: 'Success', description: 'Logo uploaded successfully!' });
      loadData();
    } else {
      toast({ title: 'Error', description: 'Failed to upload logo', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'paid':
      case 'completed':
        return <Badge className="bg-blue-500">Paid</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Not a reseller yet - show apply form
  if (!profile) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Building2 className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle>Become a Reseller</CardTitle>
              <CardDescription>
                Join our reseller program and earn commission on every order from your clients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3 text-center">
                  <div className="p-4 border rounded-lg">
                    <DollarSign className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <h3 className="font-semibold">Earn Commission</h3>
                    <p className="text-sm text-muted-foreground">Up to 20% on every order</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                    <h3 className="font-semibold">White-Label</h3>
                    <p className="text-sm text-muted-foreground">Your brand, our service</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                    <h3 className="font-semibold">Grow Business</h3>
                    <p className="text-sm text-muted-foreground">No upfront investment</p>
                  </div>
                </div>

                <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      Apply Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reseller Application</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Company Name *</Label>
                        <Input
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Your company name"
                        />
                      </div>
                      <div>
                        <Label>Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bkash">bKash</SelectItem>
                            <SelectItem value="nagad">Nagad</SelectItem>
                            <SelectItem value="rocket">Rocket</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Payment Number/Account</Label>
                        <Input
                          value={paymentNumber}
                          onChange={(e) => setPaymentNumber(e.target.value)}
                          placeholder="Your payment number"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowApplyDialog(false)}>Cancel</Button>
                      <Button onClick={handleApply}>Submit Application</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Pending approval
  if (profile.status === 'pending') {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Clock className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              <CardTitle>Application Under Review</CardTitle>
              <CardDescription>
                Your reseller application is being reviewed. We'll notify you once it's approved.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm"><strong>Company:</strong> {profile.company_name}</p>
                <p className="text-sm"><strong>Applied:</strong> {format(new Date(profile.created_at), 'PPP')}</p>
                <p className="text-sm"><strong>Status:</strong> {getStatusBadge(profile.status)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Suspended
  if (profile.status === 'suspended') {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <CardTitle>Account Suspended</CardTitle>
              <CardDescription>
                Your reseller account has been suspended. Please contact support for more information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.notes && (
                <div className="bg-destructive/10 p-4 rounded-lg text-destructive">
                  <p className="text-sm"><strong>Reason:</strong> {profile.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Active reseller dashboard
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {profile.company_logo_url ? (
              <img src={profile.company_logo_url} alt="Logo" className="h-12 w-12 rounded-lg object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{profile.company_name}</h1>
              <p className="text-sm text-muted-foreground">
                Commission: {profile.commission_type === 'percentage' ? `${profile.commission_rate}%` : `৳${profile.commission_rate}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <label htmlFor="logo-upload">
              <Button variant="outline" size="sm" asChild>
                <span className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </span>
              </Button>
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{stats?.totalEarnings.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{stats?.withdrawableBalance.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{stats?.monthlyEarnings.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Client Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Client's full name"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>
                <div>
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={clientPassword}
                    onChange={(e) => setClientPassword(e.target.value)}
                    placeholder="Temporary password"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowClientDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateClient}>Create Client</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Withdraw Funds
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Withdrawal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">Available Balance: <strong>৳{profile.balance.toLocaleString()}</strong></p>
                  <p className="text-sm text-muted-foreground">Minimum: ৳{profile.min_withdrawal_amount}</p>
                </div>
                <div>
                  <Label>Amount (৳)</Label>
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    max={profile.balance}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Payment will be sent to: {profile.payment_method} ({(profile.payment_details as { number?: string })?.number || 'Not set'})
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>Cancel</Button>
                <Button onClick={handleWithdraw}>Request Withdrawal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="clients">
          <TabsList>
            <TabsTrigger value="clients">Clients ({clients.length})</TabsTrigger>
            <TabsTrigger value="earnings">Earnings ({earnings.length})</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals ({withdrawals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {clients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No clients yet. Add your first client to start earning!
                  </p>
                ) : (
                  <div className="divide-y">
                    {clients.map((client) => (
                      <div key={client.id} className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Client #{client.client_user_id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              Added {format(new Date(client.created_at), 'PPP')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {earnings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No earnings yet. You'll earn commission when your clients place orders.
                  </p>
                ) : (
                  <div className="divide-y">
                    {earnings.map((earning) => (
                      <div key={earning.id} className="py-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order #{earning.order_id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(earning.created_at), 'PPP')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">+৳{earning.earning_amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {earning.commission_rate}% of ৳{earning.order_amount.toLocaleString()}
                          </p>
                          {getStatusBadge(earning.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {withdrawals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No withdrawals yet. Request a withdrawal when you have available balance.
                  </p>
                ) : (
                  <div className="divide-y">
                    {withdrawals.map((withdrawal) => (
                      <div key={withdrawal.id} className="py-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">৳{withdrawal.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {withdrawal.payment_method} • {format(new Date(withdrawal.created_at), 'PPP')}
                          </p>
                          {withdrawal.rejection_reason && (
                            <p className="text-sm text-destructive">{withdrawal.rejection_reason}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {getStatusBadge(withdrawal.status)}
                          {withdrawal.transaction_id && (
                            <p className="text-xs text-muted-foreground mt-1">
                              TxID: {withdrawal.transaction_id}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
