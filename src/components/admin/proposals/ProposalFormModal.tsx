import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/lib/i18n';
import { proposalService, Proposal, LineItem, ProposalFormData } from '@/services/proposal';
import { leadService } from '@/services/leadService';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

interface ProposalFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal?: Proposal | null;
  onSuccess: () => void;
}

const serviceTypes = [
  { value: 'domain-hosting', labelBn: 'ডোমেইন ও হোস্টিং', labelEn: 'Domain & Hosting' },
  { value: 'web-development', labelBn: 'ওয়েব ডেভেলপমেন্ট', labelEn: 'Web Development' },
  { value: 'software-development', labelBn: 'সফটওয়্যার ডেভেলপমেন্ট', labelEn: 'Software Development' },
  { value: 'digital-marketing', labelBn: 'ডিজিটাল মার্কেটিং', labelEn: 'Digital Marketing' },
  { value: 'graphics-design', labelBn: 'গ্রাফিক্স ডিজাইন', labelEn: 'Graphics Design' },
  { value: 'seo', labelBn: 'এসইও', labelEn: 'SEO' },
];

const defaultPaymentInstructions = `পেমেন্ট করার উপায়:

১. বিকাশ: 01674533303 (Personal)
২. নগদ: 01674533303 (Personal)
৩. রকেট: 016745333031 (Personal)

ব্যাংক ট্রান্সফার:
Bank Name: Islami Bank Bangladesh Limited
Account Name: DIGIWEBDEX
Account Number: 20502230207206103
Routing Number: 125274517

পেমেন্ট করার পর স্ক্রিনশট সহ নিশ্চিত করুন।`;

export const ProposalFormModal: React.FC<ProposalFormModalProps> = ({
  open,
  onOpenChange,
  proposal,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Array<{ id: string; name: string; phone: string }>>([]);

  const [formData, setFormData] = useState({
    lead_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    service_type: '',
    package_name: '',
    description: '',
    timeline: '',
    deliverables: '',
    payment_instructions: defaultPaymentInstructions,
    payment_link: '',
    expiry_days: 7,
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0, total: 0 },
  ]);

  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState(0);

  useEffect(() => {
    if (open) {
      loadLeads();
      if (proposal) {
        setFormData({
          lead_id: proposal.lead_id || '',
          client_name: proposal.client_name,
          client_email: proposal.client_email || '',
          client_phone: proposal.client_phone,
          service_type: proposal.service_type,
          package_name: proposal.package_name || '',
          description: proposal.description || '',
          timeline: proposal.timeline || '',
          deliverables: proposal.deliverables?.join('\n') || '',
          payment_instructions: proposal.payment_instructions || defaultPaymentInstructions,
          payment_link: proposal.payment_link || '',
          expiry_days: 7,
        });
        setLineItems(proposal.line_items.length > 0 ? proposal.line_items : [{ description: '', quantity: 1, unit_price: 0, total: 0 }]);
        setDiscountType(proposal.discount_type as 'fixed' | 'percentage');
        setDiscountValue(proposal.discount_value);
      } else {
        resetForm();
      }
    }
  }, [open, proposal]);

  const loadLeads = async () => {
    try {
      const result = await leadService.getLeads({ status: 'new' });
      setLeads(result.data.map((l) => ({ id: l.id, name: l.name, phone: l.phone })));
    } catch (error) {
      console.error('Failed to load leads:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      lead_id: '',
      client_name: '',
      client_email: '',
      client_phone: '',
      service_type: '',
      package_name: '',
      description: '',
      timeline: '',
      deliverables: '',
      payment_instructions: defaultPaymentInstructions,
      payment_link: '',
      expiry_days: 7,
    });
    setLineItems([{ description: '', quantity: 1, unit_price: 0, total: 0 }]);
    setDiscountType('fixed');
    setDiscountValue(0);
  };

  const handleLeadSelect = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setFormData((prev) => ({
        ...prev,
        lead_id: leadId,
        client_name: lead.name,
        client_phone: lead.phone,
      }));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'quantity' || field === 'unit_price') {
        updated[index].total = updated[index].quantity * updated[index].unit_price;
      }
      return updated;
    });
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = (subtotal * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }
    const total = subtotal - discountAmount;
    return { subtotal, discountAmount, total };
  };

  const { subtotal, discountAmount, total } = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_name || !formData.client_phone || !formData.service_type) {
      toast.error(language === 'bn' ? 'সব প্রয়োজনীয় ফিল্ড পূরণ করুন' : 'Please fill all required fields');
      return;
    }

    if (lineItems.every((item) => !item.description || item.unit_price === 0)) {
      toast.error(language === 'bn' ? 'কমপক্ষে একটি আইটেম যোগ করুন' : 'Add at least one line item');
      return;
    }

    try {
      setLoading(true);
      const proposalData: ProposalFormData = {
        lead_id: formData.lead_id || undefined,
        client_name: formData.client_name,
        client_email: formData.client_email || undefined,
        client_phone: formData.client_phone,
        service_type: formData.service_type,
        package_name: formData.package_name || undefined,
        line_items: lineItems.filter((item) => item.description && item.unit_price > 0),
        subtotal,
        discount_type: discountType,
        discount_value: discountValue,
        discount_amount: discountAmount,
        total_amount: total,
        description: formData.description || undefined,
        timeline: formData.timeline || undefined,
        deliverables: formData.deliverables ? formData.deliverables.split('\n').filter(Boolean) : undefined,
        payment_instructions: formData.payment_instructions || undefined,
        payment_link: formData.payment_link || undefined,
        expiry_days: formData.expiry_days,
      };

      if (proposal) {
        await proposalService.updateProposal(proposal.id, proposalData);
        toast.success(language === 'bn' ? 'প্রস্তাব আপডেট হয়েছে' : 'Proposal updated');
      } else {
        await proposalService.createProposal(proposalData, user?.id);
        toast.success(language === 'bn' ? 'প্রস্তাব তৈরি হয়েছে' : 'Proposal created');
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving proposal:', error);
      toast.error(language === 'bn' ? 'সেভ করতে সমস্যা হয়েছে' : 'Failed to save proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {proposal
              ? (language === 'bn' ? 'প্রস্তাব সম্পাদনা' : 'Edit Proposal')
              : (language === 'bn' ? 'নতুন প্রস্তাব তৈরি' : 'Create New Proposal')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg border-b pb-2">
              {language === 'bn' ? 'ক্লায়েন্ট তথ্য' : 'Client Information'}
            </h3>
            
            {leads.length > 0 && (
              <div>
                <Label>{language === 'bn' ? 'লিড থেকে নির্বাচন (ঐচ্ছিক)' : 'Select from Lead (Optional)'}</Label>
                <Select value={formData.lead_id} onValueChange={handleLeadSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'bn' ? 'লিড নির্বাচন করুন' : 'Select a lead'} />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name} - {lead.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>{language === 'bn' ? 'ক্লায়েন্ট নাম *' : 'Client Name *'}</Label>
                <Input
                  value={formData.client_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, client_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>{language === 'bn' ? 'ফোন *' : 'Phone *'}</Label>
                <Input
                  value={formData.client_phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, client_phone: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>{language === 'bn' ? 'ইমেইল' : 'Email'}</Label>
                <Input
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, client_email: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg border-b pb-2">
              {language === 'bn' ? 'সার্ভিস তথ্য' : 'Service Details'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{language === 'bn' ? 'সার্ভিস টাইপ *' : 'Service Type *'}</Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, service_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'bn' ? 'সার্ভিস নির্বাচন করুন' : 'Select service'} />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {language === 'bn' ? type.labelBn : type.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{language === 'bn' ? 'প্যাকেজ নাম' : 'Package Name'}</Label>
                <Input
                  value={formData.package_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, package_name: e.target.value }))}
                  placeholder={language === 'bn' ? 'যেমন: স্ট্যান্ডার্ড, প্রিমিয়াম' : 'e.g., Standard, Premium'}
                />
              </div>
            </div>

            <div>
              <Label>{language === 'bn' ? 'বিবরণ' : 'Description'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{language === 'bn' ? 'টাইমলাইন' : 'Timeline'}</Label>
                <Input
                  value={formData.timeline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, timeline: e.target.value }))}
                  placeholder={language === 'bn' ? 'যেমন: ১৫-৩০ দিন' : 'e.g., 15-30 days'}
                />
              </div>
              <div>
                <Label>{language === 'bn' ? 'মেয়াদ (দিন)' : 'Expiry (Days)'}</Label>
                <Select
                  value={String(formData.expiry_days)}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, expiry_days: Number(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 {language === 'bn' ? 'দিন' : 'Days'}</SelectItem>
                    <SelectItem value="15">15 {language === 'bn' ? 'দিন' : 'Days'}</SelectItem>
                    <SelectItem value="30">30 {language === 'bn' ? 'দিন' : 'Days'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{language === 'bn' ? 'ডেলিভারেবল (প্রতি লাইনে একটি)' : 'Deliverables (One per line)'}</Label>
              <Textarea
                value={formData.deliverables}
                onChange={(e) => setFormData((prev) => ({ ...prev, deliverables: e.target.value }))}
                rows={4}
                placeholder={language === 'bn' 
                  ? 'রেসপন্সিভ ওয়েবসাইট\nকন্টাক্ট ফর্ম\nএডমিন প্যানেল'
                  : 'Responsive Website\nContact Form\nAdmin Panel'}
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-medium text-lg">
                {language === 'bn' ? 'মূল্য তালিকা' : 'Pricing Items'}
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-1" />
                {language === 'bn' ? 'আইটেম যোগ' : 'Add Item'}
              </Button>
            </div>

            <div className="space-y-2">
              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {index === 0 && <Label className="text-xs">{language === 'bn' ? 'বিবরণ' : 'Description'}</Label>}
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder={language === 'bn' ? 'আইটেম বিবরণ' : 'Item description'}
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs">{language === 'bn' ? 'পরিমাণ' : 'Qty'}</Label>}
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs">{language === 'bn' ? 'একক মূল্য' : 'Unit Price'}</Label>}
                    <Input
                      type="number"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(index, 'unit_price', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs">{language === 'bn' ? 'মোট' : 'Total'}</Label>}
                    <Input value={`৳${item.total.toLocaleString()}`} disabled />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>{language === 'bn' ? 'সাবটোটাল:' : 'Subtotal:'}</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span>{language === 'bn' ? 'ডিসকাউন্ট:' : 'Discount:'}</span>
                <div className="flex items-center gap-2">
                  <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'fixed' | 'percentage')}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">{language === 'bn' ? 'নির্দিষ্ট' : 'Fixed'}</SelectItem>
                      <SelectItem value="percentage">%</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    className="w-24"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                  />
                  <span className="text-muted-foreground w-24 text-right">-৳{discountAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>{language === 'bn' ? 'সর্বমোট:' : 'Total:'}</span>
                <span>৳{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg border-b pb-2">
              {language === 'bn' ? 'পেমেন্ট তথ্য' : 'Payment Information'}
            </h3>

            <div>
              <Label>{language === 'bn' ? 'পেমেন্ট নির্দেশনা' : 'Payment Instructions'}</Label>
              <Textarea
                value={formData.payment_instructions}
                onChange={(e) => setFormData((prev) => ({ ...prev, payment_instructions: e.target.value }))}
                rows={6}
              />
            </div>

            <div>
              <Label>{language === 'bn' ? 'পেমেন্ট লিংক (ঐচ্ছিক)' : 'Payment Link (Optional)'}</Label>
              <Input
                value={formData.payment_link}
                onChange={(e) => setFormData((prev) => ({ ...prev, payment_link: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {proposal
                ? (language === 'bn' ? 'আপডেট করুন' : 'Update')
                : (language === 'bn' ? 'তৈরি করুন' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
