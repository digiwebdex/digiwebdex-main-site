import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column, StatusBadge, DeleteConfirmDialog, FormModal } from '@/components/admin/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Service = Database['public']['Tables']['services']['Row'];
type ServiceInsert = Database['public']['Tables']['services']['Insert'];

const SERVICE_TYPES = [
  { value: 'domain', label_en: 'Domain', label_bn: 'ডোমেইন' },
  { value: 'hosting', label_en: 'Hosting', label_bn: 'হোস্টিং' },
  { value: 'web_development', label_en: 'Web Development', label_bn: 'ওয়েব ডেভেলপমেন্ট' },
  { value: 'software_development', label_en: 'Software Development', label_bn: 'সফটওয়্যার ডেভেলপমেন্ট' },
  { value: 'digital_marketing', label_en: 'Digital Marketing', label_bn: 'ডিজিটাল মার্কেটিং' },
];

export default function AdminServices() {
  const { language } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<ServiceInsert>>({
    name_en: '',
    name_bn: '',
    slug: '',
    description_en: '',
    description_bn: '',
    service_type: 'web_development',
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setServices(data || []);
    }
    setLoading(false);
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setSelectedService(service);
      setFormData({
        name_en: service.name_en,
        name_bn: service.name_bn,
        slug: service.slug,
        description_en: service.description_en || '',
        description_bn: service.description_bn || '',
        service_type: service.service_type,
        is_active: service.is_active ?? true,
        sort_order: service.sort_order ?? 0,
      });
    } else {
      setSelectedService(null);
      setFormData({
        name_en: '',
        name_bn: '',
        slug: '',
        description_en: '',
        description_bn: '',
        service_type: 'web_development',
        is_active: true,
        sort_order: services.length,
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name_en || !formData.name_bn || !formData.slug) {
      toast({ title: 'Error', description: 'Name and slug are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      service_type: formData.service_type as Database['public']['Enums']['service_type'],
    };

    if (selectedService) {
      const { error } = await supabase
        .from('services')
        .update(payload)
        .eq('id', selectedService.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: language === 'bn' ? 'সফল' : 'Success', description: language === 'bn' ? 'সার্ভিস আপডেট হয়েছে' : 'Service updated' });
        setModalOpen(false);
        fetchServices();
      }
    } else {
      const { error } = await supabase.from('services').insert(payload as ServiceInsert);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: language === 'bn' ? 'সফল' : 'Success', description: language === 'bn' ? 'সার্ভিস তৈরি হয়েছে' : 'Service created' });
        setModalOpen(false);
        fetchServices();
      }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    setSaving(true);
    const { error } = await supabase.from('services').delete().eq('id', selectedService.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success', description: language === 'bn' ? 'সার্ভিস মুছে ফেলা হয়েছে' : 'Service deleted' });
      setDeleteDialogOpen(false);
      fetchServices();
    }
    setSaving(false);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const columns: Column<Service>[] = [
    {
      key: 'name',
      header: language === 'bn' ? 'নাম' : 'Name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium">{language === 'bn' ? row.name_bn : row.name_en}</p>
          <p className="text-sm text-muted-foreground">{row.slug}</p>
        </div>
      ),
    },
    {
      key: 'service_type',
      header: language === 'bn' ? 'টাইপ' : 'Type',
      sortable: true,
      render: (row) => {
        const type = SERVICE_TYPES.find((t) => t.value === row.service_type);
        return type ? (language === 'bn' ? type.label_bn : type.label_en) : row.service_type;
      },
    },
    {
      key: 'is_active',
      header: language === 'bn' ? 'স্ট্যাটাস' : 'Status',
      render: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} />,
    },
    {
      key: 'sort_order',
      header: language === 'bn' ? 'ক্রম' : 'Order',
      sortable: true,
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
              setSelectedService(row);
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
            <h1 className="text-3xl font-bold">{language === 'bn' ? 'সার্ভিস ম্যানেজমেন্ট' : 'Services Management'}</h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'সব সার্ভিস দেখুন এবং পরিচালনা করুন' : 'View and manage all services'}
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'নতুন সার্ভিস' : 'Add Service'}
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DataTable
              data={services}
              columns={columns}
              loading={loading}
              searchKeys={['name_en', 'name_bn', 'slug']}
              searchPlaceholder={language === 'bn' ? 'সার্ভিস খুঁজুন...' : 'Search services...'}
              onRowClick={handleOpenModal}
            />
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={selectedService 
          ? (language === 'bn' ? 'সার্ভিস সম্পাদনা' : 'Edit Service') 
          : (language === 'bn' ? 'নতুন সার্ভিস' : 'Add Service')}
        onSubmit={handleSave}
        loading={saving}
        size="lg"
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'নাম (ইংরেজি)' : 'Name (English)'} *</Label>
              <Input
                value={formData.name_en}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    name_en: e.target.value,
                    slug: !selectedService ? generateSlug(e.target.value) : formData.slug,
                  });
                }}
                placeholder="Web Development"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'নাম (বাংলা)' : 'Name (Bengali)'} *</Label>
              <Input
                value={formData.name_bn}
                onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                placeholder="ওয়েব ডেভেলপমেন্ট"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                placeholder="web-development"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'সার্ভিস টাইপ' : 'Service Type'}</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => setFormData({ ...formData, service_type: value as Database['public']['Enums']['service_type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {language === 'bn' ? type.label_bn : type.label_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'বিবরণ (ইংরেজি)' : 'Description (English)'}</Label>
              <Textarea
                value={formData.description_en || ''}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'বিবরণ (বাংলা)' : 'Description (Bengali)'}</Label>
              <Textarea
                value={formData.description_bn || ''}
                onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'ক্রম' : 'Sort Order'}</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>{language === 'bn' ? 'সক্রিয়' : 'Active'}</Label>
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        loading={saving}
      />
    </AdminLayout>
  );
}
