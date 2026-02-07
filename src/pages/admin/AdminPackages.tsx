import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column, StatusBadge, DeleteConfirmDialog, FormModal } from '@/components/admin/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Package = Database['public']['Tables']['service_packages']['Row'];
type Service = Database['public']['Tables']['services']['Row'];

const BILLING_TYPES = [
  { value: 'one_time', label_en: 'One Time', label_bn: 'একবার' },
  { value: 'recurring', label_en: 'Recurring', label_bn: 'রিকারিং' },
  { value: 'milestone', label_en: 'Milestone', label_bn: 'মাইলস্টোন' },
];

export default function AdminPackages() {
  const { language } = useLanguage();
  const [packages, setPackages] = useState<Package[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    service_id: '',
    name_en: '',
    name_bn: '',
    price: 0,
    setup_fee: 0,
    billing_type: 'one_time' as Database['public']['Enums']['billing_type'],
    billing_cycle_months: 12,
    features_en: '',
    features_bn: '',
    is_active: true,
    is_popular: false,
    sort_order: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [packagesRes, servicesRes] = await Promise.all([
      supabase.from('service_packages').select('*').order('sort_order'),
      supabase.from('services').select('*').eq('is_active', true).order('sort_order'),
    ]);

    if (packagesRes.data) setPackages(packagesRes.data);
    if (servicesRes.data) setServices(servicesRes.data);
    setLoading(false);
  };

  const handleOpenModal = (pkg?: Package) => {
    if (pkg) {
      setSelectedPackage(pkg);
      setFormData({
        service_id: pkg.service_id || '',
        name_en: pkg.name_en,
        name_bn: pkg.name_bn,
        price: pkg.price,
        setup_fee: pkg.setup_fee || 0,
        billing_type: pkg.billing_type,
        billing_cycle_months: pkg.billing_cycle_months || 12,
        features_en: Array.isArray(pkg.features_en) ? (pkg.features_en as string[]).join('\n') : '',
        features_bn: Array.isArray(pkg.features_bn) ? (pkg.features_bn as string[]).join('\n') : '',
        is_active: pkg.is_active ?? true,
        is_popular: pkg.is_popular ?? false,
        sort_order: pkg.sort_order ?? 0,
      });
    } else {
      setSelectedPackage(null);
      setFormData({
        service_id: services[0]?.id || '',
        name_en: '',
        name_bn: '',
        price: 0,
        setup_fee: 0,
        billing_type: 'one_time',
        billing_cycle_months: 12,
        features_en: '',
        features_bn: '',
        is_active: true,
        is_popular: false,
        sort_order: packages.length,
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name_en || !formData.name_bn || !formData.service_id) {
      toast({ title: 'Error', description: 'Name and service are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const payload = {
      service_id: formData.service_id,
      name_en: formData.name_en,
      name_bn: formData.name_bn,
      price: formData.price,
      setup_fee: formData.setup_fee,
      billing_type: formData.billing_type,
      billing_cycle_months: formData.billing_type === 'recurring' ? formData.billing_cycle_months : null,
      features_en: formData.features_en.split('\n').filter(Boolean),
      features_bn: formData.features_bn.split('\n').filter(Boolean),
      is_active: formData.is_active,
      is_popular: formData.is_popular,
      sort_order: formData.sort_order,
    };

    const { error } = selectedPackage
      ? await supabase.from('service_packages').update(payload).eq('id', selectedPackage.id)
      : await supabase.from('service_packages').insert(payload);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success' });
      setModalOpen(false);
      fetchData();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedPackage) return;
    setSaving(true);
    const { error } = await supabase.from('service_packages').delete().eq('id', selectedPackage.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success' });
      setDeleteDialogOpen(false);
      fetchData();
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

  const getServiceName = (serviceId: string | null) => {
    const service = services.find((s) => s.id === serviceId);
    return service ? (language === 'bn' ? service.name_bn : service.name_en) : '-';
  };

  const columns: Column<Package>[] = [
    {
      key: 'name',
      header: language === 'bn' ? 'নাম' : 'Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div>
            <p className="font-medium">{language === 'bn' ? row.name_bn : row.name_en}</p>
            <p className="text-sm text-muted-foreground">{getServiceName(row.service_id)}</p>
          </div>
          {row.is_popular && <Star className="h-4 w-4 text-primary fill-primary" />}
        </div>
      ),
    },
    {
      key: 'price',
      header: language === 'bn' ? 'মূল্য' : 'Price',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium">{formatCurrency(row.price)}</p>
          {row.billing_type === 'recurring' && row.billing_cycle_months && (
            <p className="text-sm text-muted-foreground">
              /{row.billing_cycle_months} {language === 'bn' ? 'মাস' : 'months'}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'billing_type',
      header: language === 'bn' ? 'বিলিং' : 'Billing',
      render: (row) => {
        const type = BILLING_TYPES.find((t) => t.value === row.billing_type);
        return type ? (language === 'bn' ? type.label_bn : type.label_en) : row.billing_type;
      },
    },
    {
      key: 'is_active',
      header: language === 'bn' ? 'স্ট্যাটাস' : 'Status',
      render: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      header: language === 'bn' ? 'অ্যাকশন' : 'Actions',
      render: (row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="ghost" onClick={() => handleOpenModal(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            onClick={() => {
              setSelectedPackage(row);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{language === 'bn' ? 'প্যাকেজ ম্যানেজমেন্ট' : 'Packages Management'}</h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'সার্ভিস প্যাকেজ এবং প্রাইসিং পরিচালনা করুন' : 'Manage service packages and pricing'}
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'নতুন প্যাকেজ' : 'Add Package'}
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DataTable
              data={packages}
              columns={columns}
              loading={loading}
              searchKeys={['name_en', 'name_bn']}
              searchPlaceholder={language === 'bn' ? 'প্যাকেজ খুঁজুন...' : 'Search packages...'}
              onRowClick={handleOpenModal}
            />
          </CardContent>
        </Card>
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={selectedPackage ? (language === 'bn' ? 'প্যাকেজ সম্পাদনা' : 'Edit Package') : (language === 'bn' ? 'নতুন প্যাকেজ' : 'Add Package')}
        onSubmit={handleSave}
        loading={saving}
        size="lg"
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>{language === 'bn' ? 'সার্ভিস' : 'Service'} *</Label>
            <Select value={formData.service_id} onValueChange={(v) => setFormData({ ...formData, service_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'bn' ? 'সার্ভিস নির্বাচন করুন' : 'Select service'} />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {language === 'bn' ? s.name_bn : s.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'নাম (ইংরেজি)' : 'Name (English)'} *</Label>
              <Input value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'নাম (বাংলা)' : 'Name (Bengali)'} *</Label>
              <Input value={formData.name_bn} onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'মূল্য (BDT)' : 'Price (BDT)'}</Label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'সেটআপ ফি' : 'Setup Fee'}</Label>
              <Input type="number" value={formData.setup_fee} onChange={(e) => setFormData({ ...formData, setup_fee: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'বিলিং টাইপ' : 'Billing Type'}</Label>
              <Select value={formData.billing_type} onValueChange={(v) => setFormData({ ...formData, billing_type: v as Database['public']['Enums']['billing_type'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {language === 'bn' ? t.label_bn : t.label_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.billing_type === 'recurring' && (
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'বিলিং সাইকেল (মাস)' : 'Billing Cycle (months)'}</Label>
              <Input type="number" value={formData.billing_cycle_months} onChange={(e) => setFormData({ ...formData, billing_cycle_months: parseInt(e.target.value) || 12 })} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'ফিচার (ইংরেজি)' : 'Features (English)'}</Label>
              <Textarea value={formData.features_en} onChange={(e) => setFormData({ ...formData, features_en: e.target.value })} rows={4} placeholder="One feature per line" />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'ফিচার (বাংলা)' : 'Features (Bengali)'}</Label>
              <Textarea value={formData.features_bn} onChange={(e) => setFormData({ ...formData, features_bn: e.target.value })} rows={4} placeholder="প্রতি লাইনে একটি ফিচার" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
              <Label>{language === 'bn' ? 'সক্রিয়' : 'Active'}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.is_popular} onCheckedChange={(c) => setFormData({ ...formData, is_popular: c })} />
              <Label>{language === 'bn' ? 'জনপ্রিয়' : 'Popular'}</Label>
            </div>
          </div>
        </div>
      </FormModal>

      <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} loading={saving} />
    </AdminLayout>
  );
}
