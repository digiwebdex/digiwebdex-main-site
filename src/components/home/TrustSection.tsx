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
      color: 'from-primary to-primary/70',
    },
    {
      icon: Users,
      value: '200',
      suffix: '+',
      label: language === 'bn' ? 'সন্তুষ্ট ক্লায়েন্ট' : 'Happy Clients',
      color: 'from-secondary to-accent',
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
      color: 'from-accent to-secondary',
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Glowing orbs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-accent/10 blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center text-center p-8 rounded-3xl glass-premium hover:border-primary/40 transition-all duration-500 hover-lift">
                {/* Icon with glow */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} p-3.5 mb-5 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 group-hover:shadow-2xl`}>
                  <stat.icon className="w-full h-full text-white drop-shadow-lg" />
                </div>
                
                {/* Value with gradient */}
                <div className="text-4xl md:text-5xl font-extrabold text-foreground mb-2 tracking-tight">
                  {stat.value}
                  <span className="gradient-text">{stat.suffix}</span>
                </div>
                
                {/* Label */}
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom tagline with enhanced styling */}
        <div className="mt-14 text-center animate-slide-up delay-500">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-premium">
            <span className="text-xl">🏆</span>
            <p className="text-foreground font-semibold">
              {language === 'bn' 
                ? 'বাংলাদেশের শীর্ষস্থানীয় ডিজিটাল সার্ভিস প্রোভাইডার'
                : 'Bangladesh\'s Leading Digital Service Provider'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
