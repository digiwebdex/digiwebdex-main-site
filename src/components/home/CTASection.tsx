import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, Sparkles } from 'lucide-react';

export function CTASection() {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary animate-gradient" style={{ backgroundSize: '200% 200%' }} />
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl animate-float" />
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-white/10 blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-white/5 blur-xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            {language === 'bn' ? 'আজই শুরু করুন' : 'Get Started Today'}
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 animate-slide-up">
            {language === 'bn' 
              ? 'আপনার ডিজিটাল সাফল্যের যাত্রা শুরু করুন'
              : 'Start Your Digital Success Journey'}
          </h2>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-slide-up delay-100">
            {language === 'bn'
              ? 'আজই আমাদের সাথে যোগাযোগ করুন এবং বিনামূল্যে পরামর্শ নিন। আমরা আপনার ব্যবসার লক্ষ্য অর্জনে সাহায্য করব।'
              : 'Contact us today and get a free consultation. We will help you achieve your business goals.'}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
            <Button 
              size="lg" 
              className="h-14 px-10 text-lg bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link to={`${basePath}/contact`}>
                <MessageCircle className="mr-2 h-5 w-5" />
                {language === 'bn' ? 'ফ্রি কনসাল্টেশন' : 'Free Consultation'}
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-10 text-lg border-2 border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/50"
              asChild
            >
              <a href="tel:+8801234567890">
                <Phone className="mr-2 h-5 w-5" />
                {language === 'bn' ? 'কল করুন' : 'Call Us'}
              </a>
            </Button>
          </div>

          {/* Contact Info */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/70 animate-slide-up delay-300">
            <a href="mailto:info@digiwebdex.com" className="flex items-center gap-2 hover:text-white transition-colors">
              📧 info@digiwebdex.com
            </a>
            <span className="hidden sm:block">|</span>
            <a href="tel:+8801234567890" className="flex items-center gap-2 hover:text-white transition-colors">
              📞 +880 1234-567890
            </a>
            <span className="hidden sm:block">|</span>
            <a href="https://wa.me/8801234567890" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
              💬 WhatsApp
            </a>
          </div>

          {/* Trust elements */}
          <div className="mt-12 pt-8 border-t border-white/20 animate-slide-up delay-400">
            <p className="text-white/60 text-sm mb-4">
              {language === 'bn' ? 'বিশ্বস্ত হাজারো ব্যবসায়ী' : 'Trusted by thousands of businesses'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {['✅ ফ্রি পরামর্শ', '✅ কোন লুকানো খরচ নেই', '✅ ১০০% সন্তুষ্টি গ্যারান্টি'].map((text, i) => (
                <span key={i} className="text-white/80 text-sm font-medium">
                  {language === 'bn' ? text : ['✅ Free Consultation', '✅ No Hidden Costs', '✅ 100% Satisfaction Guarantee'][i]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
