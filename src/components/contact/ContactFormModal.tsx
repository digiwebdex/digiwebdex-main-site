import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { contactService } from '@/services/contactService';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(5, 'Subject is required').max(200),
  message: z.string().trim().min(10, 'Message is too short').max(2000),
});

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactFormModal({ isOpen, onClose }: ContactFormModalProps) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = contactSchema.parse(formData);
      const result = await contactService.submitContactForm({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        subject: validatedData.subject,
        message: validatedData.message,
      });

      if (result.success) {
        toast.success(
          language === 'bn' ? 'বার্তা পাঠানো হয়েছে!' : 'Message sent!',
          {
            description: language === 'bn'
              ? 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।'
              : 'We will get back to you soon.',
          }
        );
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(
          language === 'bn' ? 'ত্রুটি' : 'Error',
          { description: err.errors[0].message }
        );
      } else {
        toast.error(
          language === 'bn' ? 'ত্রুটি' : 'Error',
          { description: language === 'bn' ? 'বার্তা পাঠাতে সমস্যা হয়েছে' : 'Failed to send message' }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{language === 'bn' ? 'নাম' : 'Name'} *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={language === 'bn' ? 'আপনার নাম' : 'Your name'}
              required
            />
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">{language === 'bn' ? 'ইমেইল' : 'Email'} *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{language === 'bn' ? 'ফোন' : 'Phone'}</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+880..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">{language === 'bn' ? 'বিষয়' : 'Subject'} *</Label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder={language === 'bn' ? 'বার্তার বিষয়' : 'Message subject'}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{language === 'bn' ? 'বার্তা' : 'Message'} *</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={language === 'bn' ? 'আপনার বার্তা লিখুন...' : 'Write your message...'}
              rows={4}
              required
            />
          </div>

          <Button type="submit" className="w-full gradient-button" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {loading
              ? (language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...')
              : (language === 'bn' ? 'বার্তা পাঠান' : 'Send Message')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
