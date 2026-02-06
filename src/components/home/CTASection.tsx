import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, MessageCircle, CheckCircle2 } from 'lucide-react';

export function CTASection() {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  const benefits = [
    language === 'bn' ? 'ফ্রি কনসালটেশন' : 'Free Consultation',
    language === 'bn' ? '১০০% সন্তুষ্টি গ্যারান্টি' : '100% Satisfaction Guarantee',
    language === 'bn' ? 'সাশ্রয়ী মূল্য' : 'Affordable Pricing',
    language === 'bn' ? '২৪/৭ সাপোর্ট' : '24/7 Support',
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <div className="relative overflow-hidden rounded-3xl p-10 sm:p-14 lg:p-20" style={{ background: 'var(--gradient-primary)' }}>
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          </div>

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Content */}
            <div className="text-center lg:text-left text-white max-w-2xl">
              <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl leading-tight">
                {language === 'bn' 
                  ? 'আজই আপনার ডিজিটাল যাত্রা শুরু করুন!' 
                  : 'Start Your Digital Journey Today!'}
              </h2>
              <p className="mt-4 text-lg opacity-90 leading-relaxed">
                {language === 'bn' 
                  ? 'ফ্রি পরামর্শ নিন এবং জানুন কিভাবে আপনার ব্যবসাকে অনলাইনে সফল করা যায়।' 
                  : 'Get free consultation and learn how to make your business successful online.'}
              </p>
              
              {/* Benefits */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 mt-6">
                {benefits.map((benefit, index) => (
                  <span key={index} className="flex items-center gap-2 text-sm opacity-90">
                    <CheckCircle2 className="h-4 w-4" />
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 min-w-[280px]">
              <Button
                size="lg"
                className="h-14 px-8 bg-white text-primary hover:bg-white/90 font-bold text-lg shadow-xl"
                asChild
              >
                <Link to={`${basePath}/contact`}>
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {language === 'bn' ? 'ফ্রি পরামর্শ নিন' : 'Get Free Consultation'}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-semibold text-lg"
                asChild
              >
                <a href="tel:+8801XXXXXXXXX">
                  <Phone className="mr-2 h-5 w-5" />
                  {language === 'bn' ? 'এখনই কল করুন' : 'Call Now'}
                </a>
              </Button>
              <p className="text-center text-white/70 text-sm">
                {language === 'bn' ? '💬 WhatsApp-এও যোগাযোগ করতে পারেন' : '💬 Also available on WhatsApp'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
