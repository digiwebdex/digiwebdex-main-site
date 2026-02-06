import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { MessageSquare, FileSearch, Code, Rocket, Check } from 'lucide-react';

export function ProcessSection() {
  const { language } = useLanguage();

  const steps = [
    {
      icon: MessageSquare,
      number: '01',
      title: language === 'bn' ? 'পরামর্শ' : 'Consultation',
      description: language === 'bn' 
        ? 'আপনার প্রয়োজন বুঝে ফ্রি কনসালটেশন দেই' 
        : 'Free consultation to understand your needs',
    },
    {
      icon: FileSearch,
      number: '02',
      title: language === 'bn' ? 'পরিকল্পনা' : 'Planning',
      description: language === 'bn' 
        ? 'বিস্তারিত রোডম্যাপ ও টাইমলাইন তৈরি' 
        : 'Detailed roadmap and timeline creation',
    },
    {
      icon: Code,
      number: '03',
      title: language === 'bn' ? 'ডেভেলপমেন্ট' : 'Development',
      description: language === 'bn' 
        ? 'আধুনিক প্রযুক্তিতে কাজ শুরু ও রেগুলার আপডেট' 
        : 'Work starts with modern tech & regular updates',
    },
    {
      icon: Rocket,
      number: '04',
      title: language === 'bn' ? 'লঞ্চ ও সাপোর্ট' : 'Launch & Support',
      description: language === 'bn' 
        ? 'প্রজেক্ট লঞ্চ ও চলমান সাপোর্ট সেবা' 
        : 'Project launch with ongoing support',
    },
  ];

  return (
    <section className="section-padding bg-background" id="process">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {language === 'bn' ? '📋 কাজের ধাপ' : '📋 Work Process'}
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">
            {language === 'bn' ? 'আমরা যেভাবে কাজ করি' : 'How We Work'}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            {language === 'bn' 
              ? 'সহজ ও স্বচ্ছ প্রক্রিয়ায় আপনার প্রজেক্ট সম্পন্ন করি' 
              : 'We complete your project through a simple & transparent process'}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

          <div className="grid gap-8 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center text-center animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Number Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-primary-foreground bg-primary px-3 py-1 rounded-full z-10">
                  {step.number}
                </div>

                {/* Icon Circle */}
                <div className="relative z-10 h-24 w-24 rounded-2xl bg-card border-2 border-primary/20 flex items-center justify-center mb-6 shadow-lg group hover:border-primary hover:shadow-xl transition-all duration-300">
                  <step.icon className="h-10 w-10 text-primary" />
                  
                  {/* Check mark */}
                  <div className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm max-w-xs">{step.description}</p>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden mt-6 text-primary/30">
                    <svg className="w-6 h-6 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
