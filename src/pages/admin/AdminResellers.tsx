import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Building2, 
  Users, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  Wallet
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { resellerService, ResellerProfile, ResellerWithdrawal } from '@/services/reseller';
import { format } from 'date-fns';

export default function AdminResellers() {
  const { toast } = useToast();
  const [resellers, setResellers] = useState<ResellerProfile[]>([]);
  const [withdrawals, setWithdrawals] = useState<ResellerWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalResellers: number;
    activeResellers: number;
    pendingResellers: number;
    totalRevenue: number;
    pendingPayouts: number;
  } | null>(null);
  
  // Dialog states
  const [selectedReseller, setSelectedReseller] = useState<ResellerProfile | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showCommissionDialog, setShowCommissionDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<ResellerWithdrawal | null>(null);
  
  // Form states
  const [commissionType, setCommissionType] = useState<'fixed' | 'percentage'>('percentage');
  const [commissionRate, setCommissionRate] = useState('10');
  const [suspendReason, setSuspendReason] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [resellersData, withdrawalsData, statsData] = await Promise.all([
      resellerService.getAllResellers(),
      resellerService.getAllWithdrawals(),
      resellerService.getAdminStats(),
    ]);
    setResellers(resellersData);
    setWithdrawals(withdrawalsData);
    setStats(statsData);
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!selectedReseller) return;

    const result = await resellerService.approveReseller(
      selectedReseller.id,
      commissionType,
      parseFloat(commissionRate)
    );

    if (result.success) {
      toast({ title: 'Success', description: 'Reseller approved successfully!' });
      setShowApproveDialog(false);
      loadData();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleUpdateCommission = async () => {
    if (!selectedReseller) return;

    const result = await resellerService.updateCommission(
      selectedReseller.id,
      commissionType,
      parseFloat(commissionRate)
    );

    if (result.success) {
      toast({ title: 'Success', description: 'Commission updated successfully!' });
      setShowCommissionDialog(false);
      loadData();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleSuspend = async () => {
    if (!selectedReseller) return;

    const result = await resellerService.suspendReseller(selectedReseller.id, suspendReason);

    if (result.success) {
      toast({ title: 'Success', description: 'Reseller suspended!' });
      setShowSuspendDialog(false);
      loadData();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleProcessWithdrawal = async () => {
    if (!selectedWithdrawal || !transactionId) return;

    const result = await resellerService.processWithdrawal(selectedWithdrawal.id, transactionId);

    if (result.success) {
      toast({ title: 'Success', description: 'Withdrawal processed!' });
      setShowProcessDialog(false);
      setTransactionId('');
      loadData();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleRejectWithdrawal = async (withdrawal: ResellerWithdrawal) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    const result = await resellerService.rejectWithdrawal(withdrawal.id, reason);

    if (result.success) {
      toast({ title: 'Success', description: 'Withdrawal rejected!' });
      loadData();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
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
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredResellers = statusFilter === 'all' 
    ? resellers 
    : resellers.filter(r => r.status === statusFilter);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reseller Management</h1>
          <p className="text-muted-foreground">Manage resellers, commissions, and payouts</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Resellers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalResellers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeResellers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingResellers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{stats?.totalRevenue.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Wallet className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{stats?.pendingPayouts.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="resellers">
          <TabsList>
            <TabsTrigger value="resellers">Resellers</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="resellers" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Resellers</CardTitle>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResellers.map((reseller) => (
                      <TableRow key={reseller.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {reseller.company_logo_url ? (
                              <img src={reseller.company_logo_url} alt="" className="h-8 w-8 rounded" />
                            ) : (
                              <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-4 w-4" />
                              </div>
                            )}
                            <span className="font-medium">{reseller.company_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {reseller.commission_type === 'percentage' 
                            ? `${reseller.commission_rate}%` 
                            : `৳${reseller.commission_rate}`}
                        </TableCell>
                        <TableCell>৳{reseller.balance.toLocaleString()}</TableCell>
                        <TableCell>৳{reseller.total_earnings.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(reseller.status)}</TableCell>
                        <TableCell>{format(new Date(reseller.created_at), 'PP')}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {reseller.status === 'pending' && (
                                <DropdownMenuItem onClick={() => {
                                  setSelectedReseller(reseller);
                                  setCommissionType(reseller.commission_type);
                                  setCommissionRate(reseller.commission_rate.toString());
                                  setShowApproveDialog(true);
                                }}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => {
                                setSelectedReseller(reseller);
                                setCommissionType(reseller.commission_type);
                                setCommissionRate(reseller.commission_rate.toString());
                                setShowCommissionDialog(true);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Commission
                              </DropdownMenuItem>
                              {reseller.status === 'active' && (
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedReseller(reseller);
                                    setSuspendReason('');
                                    setShowSuspendDialog(true);
                                  }}
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              {reseller.status === 'suspended' && (
                                <DropdownMenuItem onClick={() => {
                                  setSelectedReseller(reseller);
                                  setShowApproveDialog(true);
                                }}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Reactivate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reseller</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((withdrawal) => {
                      const reseller = resellers.find(r => r.id === withdrawal.reseller_id);
                      return (
                        <TableRow key={withdrawal.id}>
                          <TableCell>{reseller?.company_name || 'Unknown'}</TableCell>
                          <TableCell className="font-bold">৳{withdrawal.amount.toLocaleString()}</TableCell>
                          <TableCell>{withdrawal.payment_method}</TableCell>
                          <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                          <TableCell>{format(new Date(withdrawal.created_at), 'PP')}</TableCell>
                          <TableCell>
                            {withdrawal.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => {
                                    setSelectedWithdrawal(withdrawal);
                                    setShowProcessDialog(true);
                                  }}
                                >
                                  Process
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleRejectWithdrawal(withdrawal)}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                            {withdrawal.transaction_id && (
                              <span className="text-xs text-muted-foreground">
                                TxID: {withdrawal.transaction_id}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Approve Dialog */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Reseller</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">{selectedReseller?.company_name}</p>
              </div>
              <div>
                <Label>Commission Type</Label>
                <Select value={commissionType} onValueChange={(v) => setCommissionType(v as 'fixed' | 'percentage')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Commission Rate</Label>
                <Input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  placeholder={commissionType === 'percentage' ? '10' : '500'}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
              <Button onClick={handleApprove}>Approve</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Commission Dialog */}
        <Dialog open={showCommissionDialog} onOpenChange={setShowCommissionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Commission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Commission Type</Label>
                <Select value={commissionType} onValueChange={(v) => setCommissionType(v as 'fixed' | 'percentage')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Commission Rate</Label>
                <Input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCommissionDialog(false)}>Cancel</Button>
              <Button onClick={handleUpdateCommission}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Suspend Dialog */}
        <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend Reseller</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to suspend <strong>{selectedReseller?.company_name}</strong>?
              </p>
              <div>
                <Label>Reason (optional)</Label>
                <Input
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Enter suspension reason"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleSuspend}>Suspend</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Process Withdrawal Dialog */}
        <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Withdrawal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-lg font-bold">৳{selectedWithdrawal?.amount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedWithdrawal?.payment_method} • {(selectedWithdrawal?.payment_details as { number?: string })?.number}
                </p>
              </div>
              <div>
                <Label>Transaction ID *</Label>
                <Input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter payment transaction ID"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProcessDialog(false)}>Cancel</Button>
              <Button onClick={handleProcessWithdrawal}>Mark as Paid</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
