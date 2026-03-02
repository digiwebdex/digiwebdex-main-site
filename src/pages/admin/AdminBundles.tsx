import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DataTable, Column, DeleteConfirmDialog } from '@/components/admin/common';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/lib/i18n';
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';

const SERVICE_TYPES = [
  { value: 'domain', label_en: 'Domain', label_bn: 'ডোমেইন' },
  { value: 'hosting', label_en: 'Hosting', label_bn: 'হোস্টিং' },
  { value: 'web_development', label_en: 'Web Development', label_bn: 'ওয়েব ডেভেলপমেন্ট' },
  { value: 'software_development', label_en: 'Software Development', label_bn: 'সফটওয়্যার ডেভেলপমেন্ট' },
  { value: 'digital_marketing', label_en: 'Digital Marketing', label_bn: 'ডিজিটাল মার্কেটিং' },
];

interface Bundle {
  id: string;
  name_en: string;
  name_bn: string | null;
  description: string | null;
  service_types: string[];
  discount_percent: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export default function AdminBundles() {
  const { language } = useLanguage();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Bundle | null>(null);
  const [toDelete, setToDelete] = useState<Bundle | null>(null);

  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => { fetchBundles(); }, []);

  const fetchBundles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('bundle_discounts')
      .select('*')
      .order('sort_order');
    if (data) setBundles(data as Bundle[]);
    setLoading(false);
  };

  const resetForm = () => {
    setNameEn(''); setNameBn(''); setDescription('');
    setSelectedTypes([]); setDiscountPercent(0); setIsActive(true);
    setEditing(null);
  };

  const openCreate = () => { resetForm(); setFormOpen(true); };
  const openEdit = (b: Bundle) => {
    setEditing(b);
    setNameEn(b.name_en); setNameBn(b.name_bn || ''); setDescription(b.description || '');
    setSelectedTypes(b.service_types); setDiscountPercent(b.discount_percent); setIsActive(b.is_active);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!nameEn || selectedTypes.length < 2 || discountPercent <= 0) {
      toast({ title: language === 'bn' ? 'সব ফিল্ড পূরণ করুন' : 'Fill all required fields', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      name_en: nameEn,
      name_bn: nameBn || null,
      description: description || null,
      service_types: selectedTypes,
      discount_percent: discountPercent,
      is_active: isActive,
    };

    if (editing) {
      await supabase.from('bundle_discounts').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('bundle_discounts').insert(payload);
    }
    toast({ title: language === 'bn' ? '✅ সংরক্ষিত' : '✅ Saved' });
    setFormOpen(false); resetForm(); fetchBundles();
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await supabase.from('bundle_discounts').delete().eq('id', toDelete.id);
    toast({ title: language === 'bn' ? 'মুছে ফেলা হয়েছে' : 'Deleted' });
    setDeleteOpen(false); setToDelete(null); fetchBundles();
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const columns: Column<Bundle>[] = [
    {
      key: 'name', header: language === 'bn' ? 'নাম' : 'Name',
      render: (row) => (
        <div>
          <p className="font-medium">{language === 'bn' ? (row.name_bn || row.name_en) : row.name_en}</p>
          {row.description && <p className="text-xs text-muted-foreground">{row.description}</p>}
        </div>
      ),
      exportValue: (row) => row.name_en,
    },
    {
      key: 'services', header: language === 'bn' ? 'সার্ভিস' : 'Services',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.service_types.map(t => (
            <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-muted capitalize">
              {t.replace('_', ' ')}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'discount', header: language === 'bn' ? 'ডিসকাউন্ট' : 'Discount',
      render: (row) => <span className="font-bold text-green-600">{row.discount_percent}%</span>,
    },
    {
      key: 'status', header: language === 'bn' ? 'স্ট্যাটাস' : 'Status',
      render: (row) => (
        <span className={`px-2 py-0.5 text-xs rounded-full ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
          {row.is_active ? (language === 'bn' ? 'সক্রিয়' : 'Active') : (language === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive')}
        </span>
      ),
    },
    {
      key: 'actions', header: '',
      render: (row) => (
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(row); }}><Edit className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" className="text-destructive" onClick={(e) => { e.stopPropagation(); setToDelete(row); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Tag className="h-8 w-8" />
              {language === 'bn' ? 'বান্ডেল ডিসকাউন্ট' : 'Bundle Discounts'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'একাধিক সার্ভিস একসাথে নিলে ডিসকাউন্ট নিয়ম তৈরি করুন' : 'Create discount rules for multi-service bundles'}
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'নতুন বান্ডেল' : 'New Bundle'}
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DataTable data={bundles as any[]} columns={columns as any[]} loading={loading} searchKeys={['name_en']} searchPlaceholder={language === 'bn' ? 'নাম দিয়ে খুঁজুন...' : 'Search by name...'} />
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? (language === 'bn' ? 'বান্ডেল সম্পাদনা' : 'Edit Bundle') : (language === 'bn' ? 'নতুন বান্ডেল' : 'New Bundle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{language === 'bn' ? 'নাম (English) *' : 'Name (English) *'}</Label>
                <Input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="Domain + Hosting Bundle" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{language === 'bn' ? 'নাম (বাংলা)' : 'Name (Bangla)'}</Label>
                <Input value={nameBn} onChange={e => setNameBn(e.target.value)} placeholder="ডোমেইন + হোস্টিং বান্ডেল" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{language === 'bn' ? 'বিবরণ' : 'Description'}</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{language === 'bn' ? 'সার্ভিস টাইপ (কমপক্ষে ২টি) *' : 'Service Types (min 2) *'}</Label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_TYPES.map(st => (
                  <label key={st.value} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-muted/50">
                    <Checkbox
                      checked={selectedTypes.includes(st.value)}
                      onCheckedChange={() => toggleType(st.value)}
                    />
                    <span className="text-sm">{language === 'bn' ? st.label_bn : st.label_en}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{language === 'bn' ? 'ডিসকাউন্ট (%) *' : 'Discount (%) *'}</Label>
                <Input type="number" value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))} min={1} max={100} />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>{language === 'bn' ? 'সক্রিয়' : 'Active'}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>{language === 'bn' ? 'বাতিল' : 'Cancel'}</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'সংরক্ষণ করুন' : 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title={language === 'bn' ? 'বান্ডেল মুছে ফেলুন' : 'Delete Bundle'}
        description={language === 'bn' ? `আপনি কি নিশ্চিত "${toDelete?.name_en}" মুছে ফেলতে চান?` : `Delete bundle "${toDelete?.name_en}"?`}
      />
    </AdminLayout>
  );
}
