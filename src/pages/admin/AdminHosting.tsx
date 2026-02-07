import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column, StatusBadge } from '@/components/admin/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Eye, ExternalLink, PauseCircle, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

type HostingAccount = Database['public']['Tables']['hosting_accounts']['Row'] & {
  domains?: { domain_name: string } | null;
};

const HOSTING_STATUSES = [
  { value: 'pending', label_en: 'Pending', label_bn: 'বিবেচনাধীন' },
  { value: 'active', label_en: 'Active', label_bn: 'সক্রিয়' },
  { value: 'suspended', label_en: 'Suspended', label_bn: 'স্থগিত' },
  { value: 'terminated', label_en: 'Terminated', label_bn: 'বাতিল' },
  { value: 'expired', label_en: 'Expired', label_bn: 'মেয়াদ উত্তীর্ণ' },
];

export default function AdminHosting() {
  const { language } = useLanguage();
  const [accounts, setAccounts] = useState<HostingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<HostingAccount | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hosting_accounts')
      .select(`*, domains:domain_id (domain_name)`)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setAccounts((data as HostingAccount[]) || []);
    }
    setLoading(false);
  };

  const handleViewAccount = (account: HostingAccount) => {
    setSelectedAccount(account);
    setNewStatus(account.status);
    setDetailOpen(true);
  };

  const handleUpdateAccount = async () => {
    if (!selectedAccount) return;
    setSaving(true);

    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'suspended' && selectedAccount.status !== 'suspended') {
      updates.suspended_reason = 'Admin action';
    }

    const { error } = await supabase.from('hosting_accounts').update(updates).eq('id', selectedAccount.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success' });
      setDetailOpen(false);
      fetchAccounts();
    }
    setSaving(false);
  };

  const toggleSuspend = async (account: HostingAccount) => {
    const newSt = account.status === 'suspended' ? 'active' : 'suspended';
    const { error } = await supabase.from('hosting_accounts').update({ 
      status: newSt,
      suspended_reason: newSt === 'suspended' ? 'Admin action' : null,
    }).eq('id', account.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success' });
      fetchAccounts();
    }
  };

  const columns: Column<HostingAccount>[] = [
    {
      key: 'username',
      header: language === 'bn' ? 'ইউজারনেম' : 'Username',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium font-mono">{row.username || 'N/A'}</p>
          <p className="text-sm text-muted-foreground">{row.domains?.domain_name || '-'}</p>
        </div>
      ),
    },
    {
      key: 'package_name',
      header: language === 'bn' ? 'প্যাকেজ' : 'Package',
      render: (row) => row.package_name || '-',
    },
    {
      key: 'disk_limit_mb',
      header: language === 'bn' ? 'ডিস্ক' : 'Disk',
      render: (row) => row.disk_limit_mb ? `${row.disk_limit_mb} MB` : '-',
    },
    {
      key: 'expiry_date',
      header: language === 'bn' ? 'মেয়াদ' : 'Expiry',
      render: (row) => {
        if (!row.expiry_date) return '-';
        const expiry = new Date(row.expiry_date);
        const isExpiring = expiry < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return (
          <span className={isExpiring ? 'text-destructive font-medium' : ''}>
            {format(expiry, 'dd MMM yyyy')}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: language === 'bn' ? 'স্ট্যাটাস' : 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: language === 'bn' ? 'অ্যাকশন' : 'Actions',
      render: (row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="ghost" onClick={() => handleViewAccount(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          {row.status !== 'terminated' && (
            <Button 
              size="icon" 
              variant="ghost" 
              className={row.status === 'suspended' ? 'text-green-600' : 'text-destructive'}
              onClick={() => toggleSuspend(row)}
            >
              {row.status === 'suspended' ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
            </Button>
          )}
          {row.cpanel_url && (
            <Button size="icon" variant="ghost" asChild>
              <a href={row.cpanel_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{language === 'bn' ? 'হোস্টিং ম্যানেজমেন্ট' : 'Hosting Management'}</h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'হোস্টিং অ্যাকাউন্ট দেখুন এবং পরিচালনা করুন' : 'View and manage hosting accounts'}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DataTable
              data={accounts}
              columns={columns}
              loading={loading}
              searchKeys={['username', 'package_name']}
              searchPlaceholder={language === 'bn' ? 'ইউজারনেম দিয়ে খুঁজুন...' : 'Search by username...'}
              onRowClick={handleViewAccount}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{language === 'bn' ? 'হোস্টিং বিস্তারিত' : 'Hosting Details'}</DialogTitle>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'ইউজারনেম' : 'Username'}</Label>
                  <p className="font-medium font-mono">{selectedAccount.username || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'ডোমেইন' : 'Domain'}</Label>
                  <p className="font-medium">{selectedAccount.domains?.domain_name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'প্যাকেজ' : 'Package'}</Label>
                  <p className="font-medium">{selectedAccount.package_name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'ডিস্ক' : 'Disk'}</Label>
                  <p className="font-medium">{selectedAccount.disk_limit_mb ? `${selectedAccount.disk_limit_mb} MB` : 'Unlimited'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'ব্যান্ডউইথ' : 'Bandwidth'}</Label>
                  <p className="font-medium">{selectedAccount.bandwidth_limit_mb ? `${selectedAccount.bandwidth_limit_mb} MB` : 'Unlimited'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'ইমেইল' : 'Emails'}</Label>
                  <p className="font-medium">{selectedAccount.email_limit ?? 'Unlimited'}</p>
                </div>
              </div>

              {selectedAccount.suspended_reason && (
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'স্থগিতের কারণ' : 'Suspension Reason'}</Label>
                  <p className="p-3 bg-destructive/10 text-destructive rounded-md">{selectedAccount.suspended_reason}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOSTING_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {language === 'bn' ? s.label_bn : s.label_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </Button>
            <Button onClick={handleUpdateAccount} disabled={saving}>
              {saving ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'আপডেট করুন' : 'Update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
