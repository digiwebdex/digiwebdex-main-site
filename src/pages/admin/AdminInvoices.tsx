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
import { Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

type Invoice = Database['public']['Tables']['invoices']['Row'] & {
  orders?: { order_number: string; service_type: string } | null;
};

const INVOICE_STATUSES = [
  { value: 'unpaid', label_en: 'Unpaid', label_bn: 'অপরিশোধিত' },
  { value: 'paid', label_en: 'Paid', label_bn: 'পরিশোধিত' },
  { value: 'overdue', label_en: 'Overdue', label_bn: 'বকেয়া' },
  { value: 'cancelled', label_en: 'Cancelled', label_bn: 'বাতিল' },
  { value: 'refunded', label_en: 'Refunded', label_bn: 'ফেরত' },
];

export default function AdminInvoices() {
  const { language } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('invoices')
      .select(`*, orders:order_id (order_number, service_type)`)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setInvoices((data as Invoice[]) || []);
    }
    setLoading(false);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setNewStatus(invoice.status);
    setDetailOpen(true);
  };

  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return;
    setSaving(true);

    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'paid' && selectedInvoice.status !== 'paid') {
      updates.paid_at = new Date().toISOString();
    }

    const { error } = await supabase.from('invoices').update(updates).eq('id', selectedInvoice.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success' });
      setDetailOpen(false);
      fetchInvoices();
    }
    setSaving(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoice_number',
      header: language === 'bn' ? 'ইনভয়েস নং' : 'Invoice #',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium font-mono">{row.invoice_number}</p>
          <p className="text-sm text-muted-foreground">{row.orders?.order_number || '-'}</p>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: language === 'bn' ? 'তারিখ' : 'Date',
      sortable: true,
      render: (row) => format(new Date(row.created_at), 'dd MMM yyyy'),
    },
    {
      key: 'due_date',
      header: language === 'bn' ? 'বকেয়া তারিখ' : 'Due Date',
      render: (row) => row.due_date ? format(new Date(row.due_date), 'dd MMM yyyy') : '-',
    },
    {
      key: 'total',
      header: language === 'bn' ? 'মোট' : 'Total',
      sortable: true,
      render: (row) => <span className="font-medium">{formatCurrency(row.total)}</span>,
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
          <Button size="icon" variant="ghost" onClick={() => handleViewInvoice(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          {row.pdf_url && (
            <Button size="icon" variant="ghost" asChild>
              <a href={row.pdf_url} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold">{language === 'bn' ? 'ইনভয়েস ম্যানেজমেন্ট' : 'Invoices Management'}</h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'সব ইনভয়েস দেখুন এবং পরিচালনা করুন' : 'View and manage all invoices'}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DataTable
              data={invoices}
              columns={columns}
              loading={loading}
              searchKeys={['invoice_number']}
              searchPlaceholder={language === 'bn' ? 'ইনভয়েস নং দিয়ে খুঁজুন...' : 'Search by invoice number...'}
              onRowClick={handleViewInvoice}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {language === 'bn' ? 'ইনভয়েস বিস্তারিত' : 'Invoice Details'} - {selectedInvoice?.invoice_number}
            </DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</Label>
                  <p className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'ডিসকাউন্ট' : 'Discount'}</Label>
                  <p className="font-medium">{formatCurrency(selectedInvoice.discount || 0)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'ট্যাক্স' : 'Tax'}</Label>
                  <p className="font-medium">{formatCurrency(selectedInvoice.tax || 0)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'মোট' : 'Total'}</Label>
                  <p className="font-medium text-lg">{formatCurrency(selectedInvoice.total)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVOICE_STATUSES.map((s) => (
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
            <Button onClick={handleUpdateInvoice} disabled={saving}>
              {saving ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'আপডেট করুন' : 'Update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
