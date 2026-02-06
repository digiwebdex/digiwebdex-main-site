import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Users, FolderCheck, Clock, Award } from 'lucide-react';

export function TrustSection() {
  const { language } = useLanguage();

  const stats = [
    {
      icon: FolderCheck,
      value: '500',
      suffix: '+',
      label: language === 'bn' ? 'সম্পন্ন প্রজেক্ট' : 'Projects Completed',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      value: '200',
      suffix: '+',
      label: language === 'bn' ? 'সন্তুষ্ট ক্লায়েন্ট' : 'Happy Clients',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: Clock,
      value: '99.9',
      suffix: '%',
      label: language === 'bn' ? 'আপটাইম গ্যারান্টি' : 'Uptime Guarantee',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Award,
      value: '10',
      suffix: '+',
      label: language === 'bn' ? 'বছরের অভিজ্ঞতা' : 'Years Experience',
      color: 'from-orange-500 to-amber-500',
    },
  ];

  return (
    <section className="py-16 bg-secondary/30 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} p-3 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-full h-full text-white" />
                </div>
                
                {/* Value */}
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {stat.value}
                  <span className="gradient-text">{stat.suffix}</span>
                </div>
                
                {/* Label */}
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div className="mt-12 text-center animate-slide-up delay-500">
          <p className="text-muted-foreground">
            {language === 'bn' 
              ? '🏆 বাংলাদেশের শীর্ষস্থানীয় ডিজিটাল সার্ভিস প্রোভাইডার'
              : '🏆 Bangladesh\'s Leading Digital Service Provider'}
          </p>
        </div>
      </div>
    </section>
  );
}
