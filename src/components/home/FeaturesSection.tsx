import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { 
  CheckCircle2, 
  Rocket, 
  Globe, 
  Lock, 
  Smartphone, 
  BarChart3,
  HeartHandshake,
  Sparkles
} from 'lucide-react';

export function FeaturesSection() {
  const { language } = useLanguage();

  const features = [
    {
      icon: Rocket,
      title: language === 'bn' ? 'দ্রুত পারফরম্যান্স' : 'Fast Performance',
      description: language === 'bn' 
        ? 'অপ্টিমাইজড কোড ও CDN দিয়ে লাইটনিং ফাস্ট স্পিড' 
        : 'Lightning fast speed with optimized code & CDN',
    },
    {
      icon: Globe,
      title: language === 'bn' ? 'গ্লোবাল রিচ' : 'Global Reach',
      description: language === 'bn' 
        ? 'বিশ্বব্যাপী সার্ভার নেটওয়ার্ক দিয়ে দ্রুত এক্সেস' 
        : 'Fast access with worldwide server network',
    },
    {
      icon: Lock,
      title: language === 'bn' ? 'ডাটা প্রোটেকশন' : 'Data Protection',
      description: language === 'bn' 
        ? 'এন্ড-টু-এন্ড এনক্রিপশন ও রেগুলার ব্যাকআপ' 
        : 'End-to-end encryption & regular backups',
    },
    {
      icon: Smartphone,
      title: language === 'bn' ? 'মোবাইল অপ্টিমাইজড' : 'Mobile Optimized',
      description: language === 'bn' 
        ? 'সব ডিভাইসে পারফেক্ট রেসপন্সিভ ডিজাইন' 
        : 'Perfect responsive design on all devices',
    },
    {
      icon: BarChart3,
      title: language === 'bn' ? 'এনালিটিক্স ড্যাশবোর্ড' : 'Analytics Dashboard',
      description: language === 'bn' 
        ? 'রিয়েল-টাইম ডাটা ও রিপোর্টিং সিস্টেম' 
        : 'Real-time data & reporting system',
    },
    {
      icon: HeartHandshake,
      title: language === 'bn' ? 'ডেডিকেটেড সাপোর্ট' : 'Dedicated Support',
      description: language === 'bn' 
        ? 'প্রতিটি ক্লায়েন্টের জন্য ব্যক্তিগত সাপোর্ট' 
        : 'Personal support for every client',
    },
  ];

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              {language === 'bn' ? '🎯 ফিচারস' : '🎯 Features'}
            </span>
            <h2 className="text-3xl font-bold sm:text-4xl mb-6">
              {language === 'bn' 
                ? 'আমাদের সেবার বিশেষ সুবিধাসমূহ' 
                : 'Special Benefits of Our Services'}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              {language === 'bn' 
                ? 'আমরা শুধু কাজ করি না, আপনার ব্যবসাকে পরবর্তী স্তরে নিয়ে যাই। প্রতিটি প্রজেক্টে আমরা দেই:'
                : 'We don\'t just work, we take your business to the next level. In every project we provide:'}
            </p>

            {/* Feature List */}
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-background/80 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-300"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 p-8 flex items-center justify-center">
              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 h-20 w-20 rounded-full bg-primary/20 blur-xl animate-pulse" />
              <div className="absolute bottom-10 left-10 h-24 w-24 rounded-full bg-accent/20 blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
              
              {/* Center Stats */}
              <div className="relative z-10 text-center glass-card p-10 rounded-3xl">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-5xl font-bold gradient-text mb-2">500+</div>
                <p className="text-muted-foreground font-medium">
                  {language === 'bn' ? 'সফল প্রজেক্ট ডেলিভারি' : 'Successful Project Deliveries'}
                </p>
                
                <div className="mt-6 flex justify-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">99.9%</div>
                    <p className="text-xs text-muted-foreground">{language === 'bn' ? 'আপটাইম' : 'Uptime'}</p>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">5★</div>
                    <p className="text-xs text-muted-foreground">{language === 'bn' ? 'রেটিং' : 'Rating'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
