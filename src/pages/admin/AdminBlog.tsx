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
import { Plus, Pencil, Trash2, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'] & {
  blog_categories?: { name_en: string; name_bn: string } | null;
};

type BlogCategory = Database['public']['Tables']['blog_categories']['Row'];

export default function AdminBlog() {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title_en: '',
    title_bn: '',
    slug: '',
    excerpt_en: '',
    excerpt_bn: '',
    content_en: '',
    content_bn: '',
    category_id: '',
    meta_title_en: '',
    meta_title_bn: '',
    meta_description_en: '',
    meta_description_bn: '',
    is_published: false,
    is_featured: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [postsRes, categoriesRes] = await Promise.all([
      supabase.from('blog_posts').select(`*, blog_categories:category_id (name_en, name_bn)`).order('created_at', { ascending: false }),
      supabase.from('blog_categories').select('*').eq('is_active', true).order('sort_order'),
    ]);

    if (postsRes.data) setPosts(postsRes.data as BlogPost[]);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  };

  const handleOpenModal = (post?: BlogPost) => {
    if (post) {
      setSelectedPost(post);
      setFormData({
        title_en: post.title_en,
        title_bn: post.title_bn,
        slug: post.slug,
        excerpt_en: post.excerpt_en || '',
        excerpt_bn: post.excerpt_bn || '',
        content_en: post.content_en || '',
        content_bn: post.content_bn || '',
        category_id: post.category_id || '',
        meta_title_en: post.meta_title_en || '',
        meta_title_bn: post.meta_title_bn || '',
        meta_description_en: post.meta_description_en || '',
        meta_description_bn: post.meta_description_bn || '',
        is_published: post.is_published ?? false,
        is_featured: post.is_featured ?? false,
      });
    } else {
      setSelectedPost(null);
      setFormData({
        title_en: '',
        title_bn: '',
        slug: '',
        excerpt_en: '',
        excerpt_bn: '',
        content_en: '',
        content_bn: '',
        category_id: categories[0]?.id || '',
        meta_title_en: '',
        meta_title_bn: '',
        meta_description_en: '',
        meta_description_bn: '',
        is_published: false,
        is_featured: false,
      });
    }
    setModalOpen(true);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSave = async () => {
    if (!formData.title_en || !formData.title_bn || !formData.slug) {
      toast({ title: 'Error', description: 'Title and slug are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      category_id: formData.category_id || null,
      published_at: formData.is_published ? new Date().toISOString() : null,
    };

    const { error } = selectedPost
      ? await supabase.from('blog_posts').update(payload).eq('id', selectedPost.id)
      : await supabase.from('blog_posts').insert(payload);

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
    if (!selectedPost) return;
    setSaving(true);
    const { error } = await supabase.from('blog_posts').delete().eq('id', selectedPost.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success' });
      setDeleteDialogOpen(false);
      fetchData();
    }
    setSaving(false);
  };

  const getCategoryName = (categoryId: string | null, row: BlogPost) => {
    if (row.blog_categories) {
      return language === 'bn' ? row.blog_categories.name_bn : row.blog_categories.name_en;
    }
    return '-';
  };

  const columns: Column<BlogPost>[] = [
    {
      key: 'title',
      header: language === 'bn' ? 'শিরোনাম' : 'Title',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium">{language === 'bn' ? row.title_bn : row.title_en}</p>
          <p className="text-sm text-muted-foreground">{getCategoryName(row.category_id, row)}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: language === 'bn' ? 'স্ট্যাটাস' : 'Status',
      render: (row) => <StatusBadge status={row.is_published ? 'published' : 'draft'} />,
    },
    {
      key: 'is_featured',
      header: language === 'bn' ? 'ফিচার্ড' : 'Featured',
      render: (row) => row.is_featured ? '⭐' : '-',
    },
    {
      key: 'views_count',
      header: language === 'bn' ? 'ভিউ' : 'Views',
      sortable: true,
      render: (row) => row.views_count || 0,
    },
    {
      key: 'created_at',
      header: language === 'bn' ? 'তারিখ' : 'Date',
      sortable: true,
      render: (row) => format(new Date(row.created_at), 'dd MMM yyyy'),
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
              setSelectedPost(row);
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
            <h1 className="text-3xl font-bold">{language === 'bn' ? 'ব্লগ ম্যানেজমেন্ট' : 'Blog Management'}</h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'ব্লগ পোস্ট তৈরি এবং পরিচালনা করুন' : 'Create and manage blog posts'}
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'নতুন পোস্ট' : 'New Post'}
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DataTable
              data={posts}
              columns={columns}
              loading={loading}
              searchKeys={['title_en', 'title_bn', 'slug']}
              searchPlaceholder={language === 'bn' ? 'পোস্ট খুঁজুন...' : 'Search posts...'}
              onRowClick={handleOpenModal}
            />
          </CardContent>
        </Card>
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={selectedPost ? (language === 'bn' ? 'পোস্ট সম্পাদনা' : 'Edit Post') : (language === 'bn' ? 'নতুন পোস্ট' : 'New Post')}
        onSubmit={handleSave}
        loading={saving}
        size="xl"
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'} *</Label>
              <Input
                value={formData.title_en}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    title_en: e.target.value,
                    slug: !selectedPost ? generateSlug(e.target.value) : formData.slug,
                  });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (Bengali)'} *</Label>
              <Input value={formData.title_bn} onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'ক্যাটেগরি' : 'Category'}</Label>
              <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'bn' ? 'ক্যাটেগরি নির্বাচন করুন' : 'Select category'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {language === 'bn' ? c.name_bn : c.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'সারাংশ (ইংরেজি)' : 'Excerpt (English)'}</Label>
              <Textarea value={formData.excerpt_en} onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'সারাংশ (বাংলা)' : 'Excerpt (Bengali)'}</Label>
              <Textarea value={formData.excerpt_bn} onChange={(e) => setFormData({ ...formData, excerpt_bn: e.target.value })} rows={2} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'কন্টেন্ট (ইংরেজি)' : 'Content (English)'}</Label>
              <Textarea value={formData.content_en} onChange={(e) => setFormData({ ...formData, content_en: e.target.value })} rows={6} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'কন্টেন্ট (বাংলা)' : 'Content (Bengali)'}</Label>
              <Textarea value={formData.content_bn} onChange={(e) => setFormData({ ...formData, content_bn: e.target.value })} rows={6} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'মেটা টাইটেল (ইংরেজি)' : 'Meta Title (English)'}</Label>
              <Input value={formData.meta_title_en} onChange={(e) => setFormData({ ...formData, meta_title_en: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'মেটা টাইটেল (বাংলা)' : 'Meta Title (Bengali)'}</Label>
              <Input value={formData.meta_title_bn} onChange={(e) => setFormData({ ...formData, meta_title_bn: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'মেটা ডেসক্রিপশন (ইংরেজি)' : 'Meta Description (English)'}</Label>
              <Textarea value={formData.meta_description_en} onChange={(e) => setFormData({ ...formData, meta_description_en: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'মেটা ডেসক্রিপশন (বাংলা)' : 'Meta Description (Bengali)'}</Label>
              <Textarea value={formData.meta_description_bn} onChange={(e) => setFormData({ ...formData, meta_description_bn: e.target.value })} rows={2} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={formData.is_published} onCheckedChange={(c) => setFormData({ ...formData, is_published: c })} />
              <Label>{language === 'bn' ? 'প্রকাশিত' : 'Published'}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.is_featured} onCheckedChange={(c) => setFormData({ ...formData, is_featured: c })} />
              <Label>{language === 'bn' ? 'ফিচার্ড' : 'Featured'}</Label>
            </div>
          </div>
        </div>
      </FormModal>

      <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} loading={saving} />
    </AdminLayout>
  );
}
