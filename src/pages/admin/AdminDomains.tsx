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
import { Eye, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

type Domain = Database['public']['Tables']['domains']['Row'];

const DOMAIN_STATUSES = [
  { value: 'pending', label_en: 'Pending', label_bn: 'বিবেচনাধীন' },
  { value: 'registered', label_en: 'Registered', label_bn: 'রেজিস্টার্ড' },
  { value: 'active', label_en: 'Active', label_bn: 'সক্রিয়' },
  { value: 'expired', label_en: 'Expired', label_bn: 'মেয়াদ উত্তীর্ণ' },
  { value: 'suspended', label_en: 'Suspended', label_bn: 'স্থগিত' },
  { value: 'transferring', label_en: 'Transferring', label_bn: 'স্থানান্তরিত হচ্ছে' },
];

export default function AdminDomains() {
  const { language } = useLanguage();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('domains').select('*').order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setDomains(data || []);
    }
    setLoading(false);
  };

  const handleViewDomain = (domain: Domain) => {
    setSelectedDomain(domain);
    setNewStatus(domain.status);
    setDetailOpen(true);
  };

  const handleUpdateDomain = async () => {
    if (!selectedDomain) return;
    setSaving(true);

    const { error } = await supabase.from('domains').update({ 
      status: newStatus as Database['public']['Enums']['domain_status']
    }).eq('id', selectedDomain.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success' });
      setDetailOpen(false);
      fetchDomains();
    }
    setSaving(false);
  };

  const columns: Column<Domain>[] = [
    {
      key: 'domain_name',
      header: language === 'bn' ? 'ডোমেইন' : 'Domain',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.domain_name}</span>
          <a href={`https://${row.domain_name}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ),
    },
    {
      key: 'tld',
      header: 'TLD',
      render: (row) => <span className="font-mono">.{row.tld}</span>,
    },
    {
      key: 'registration_date',
      header: language === 'bn' ? 'রেজিস্ট্রেশন' : 'Registered',
      render: (row) => row.registration_date ? format(new Date(row.registration_date), 'dd MMM yyyy') : '-',
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
      key: 'auto_renew',
      header: language === 'bn' ? 'অটো রিনিউ' : 'Auto Renew',
      render: (row) => row.auto_renew ? '✓' : '✗',
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
        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleViewDomain(row); }}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{language === 'bn' ? 'ডোমেইন ম্যানেজমেন্ট' : 'Domains Management'}</h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'কাস্টমারদের ডোমেইন দেখুন এবং পরিচালনা করুন' : 'View and manage customer domains'}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DataTable
              data={domains}
              columns={columns}
              loading={loading}
              searchKeys={['domain_name']}
              searchPlaceholder={language === 'bn' ? 'ডোমেইন নাম দিয়ে খুঁজুন...' : 'Search by domain name...'}
              onRowClick={handleViewDomain}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedDomain?.domain_name}</DialogTitle>
          </DialogHeader>

          {selectedDomain && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'রেজিস্ট্রার' : 'Registrar'}</Label>
                  <p className="font-medium">{selectedDomain.registrar || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'মেয়াদ' : 'Expiry'}</Label>
                  <p className="font-medium">{selectedDomain.expiry_date ? format(new Date(selectedDomain.expiry_date), 'dd MMM yyyy') : '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">WHOIS Privacy</Label>
                  <p className="font-medium">{selectedDomain.whois_privacy ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Auto Renew</Label>
                  <p className="font-medium">{selectedDomain.auto_renew ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>

              {selectedDomain.nameservers && Array.isArray(selectedDomain.nameservers) && (selectedDomain.nameservers as string[]).length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Nameservers</Label>
                  <div className="mt-1 space-y-1">
                    {(selectedDomain.nameservers as string[]).map((ns, i) => (
                      <p key={i} className="font-mono text-sm">{ns}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAIN_STATUSES.map((s) => (
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
            <Button onClick={handleUpdateDomain} disabled={saving}>
              {saving ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'আপডেট করুন' : 'Update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
