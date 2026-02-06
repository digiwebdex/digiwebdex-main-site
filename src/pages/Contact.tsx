import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(5, 'Subject is required').max(200),
  message: z.string().trim().min(10, 'Message is too short').max(2000),
});

export default function Contact() {
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
      
      // Here you would typically send to an API
      console.log('Form submitted:', validatedData);
      
      toast.success(
        language === 'bn' ? 'বার্তা পাঠানো হয়েছে!' : 'Message sent!',
        {
          description: language === 'bn'
            ? 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।'
            : 'We will get back to you soon.',
        }
      );
      
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(
          language === 'bn' ? 'ত্রুটি' : 'Error',
          { description: err.errors[0].message }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: language === 'bn' ? 'ইমেইল' : 'Email',
      value: 'support@digiwebdex.com',
      href: 'mailto:support@digiwebdex.com',
    },
    {
      icon: Phone,
      title: language === 'bn' ? 'ফোন' : 'Phone',
      value: '+880 1234 567890',
      href: 'tel:+8801234567890',
    },
    {
      icon: MapPin,
      title: language === 'bn' ? 'ঠিকানা' : 'Address',
      value: language === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh',
    },
    {
      icon: Clock,
      title: language === 'bn' ? 'কর্মঘণ্টা' : 'Working Hours',
      value: language === 'bn' ? 'শনি - বৃহঃ: সকাল ১০ - রাত ৮' : 'Sat - Thu: 10AM - 8PM',
    },
  ];

  return (
    <Layout>
      <div className="py-16 md:py-24">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {language === 'bn'
                ? 'আমাদের সাথে যোগাযোগ করতে নিচের ফর্মটি পূরণ করুন'
                : 'Fill out the form below to get in touch with us'}
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{language === 'bn' ? 'বার্তা পাঠান' : 'Send a Message'}</CardTitle>
                <CardDescription>
                  {language === 'bn'
                    ? 'আমরা ২৪ ঘণ্টার মধ্যে আপনার বার্তার উত্তর দেব'
                    : 'We will respond to your message within 24 hours'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
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
                    <div className="space-y-2">
                      <Label htmlFor="email">{language === 'bn' ? 'ইমেইল' : 'Email'} *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{language === 'bn' ? 'ফোন' : 'Phone'}</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+880 1XXX XXXXXX"
                      />
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{language === 'bn' ? 'বার্তা' : 'Message'} *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={language === 'bn' ? 'আপনার বার্তা লিখুন...' : 'Write your message...'}
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full gradient-button" disabled={loading}>
                    <Send className="h-4 w-4 mr-2" />
                    {loading
                      ? (language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...')
                      : (language === 'bn' ? 'বার্তা পাঠান' : 'Send Message')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="glass-card">
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <info.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium mb-1">{info.title}</p>
                        {info.href ? (
                          <a
                            href={info.href}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-muted-foreground">{info.value}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Map Placeholder */}
              <Card className="glass-card overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{language === 'bn' ? 'মানচিত্র শীঘ্রই আসছে' : 'Map coming soon'}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
