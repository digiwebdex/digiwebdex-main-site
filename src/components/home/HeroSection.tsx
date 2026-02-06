import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Users, FolderKanban, Clock, Shield } from 'lucide-react';
import { DomainSearchBox } from './DomainSearchBox';

export function HeroSection() {
  const { language, t } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  const stats = [
    {
      icon: FolderKanban,
      value: '500+',
      label: language === 'bn' ? 'প্রকল্প সম্পন্ন' : 'Projects Completed',
    },
    {
      icon: Users,
      value: '200+',
      label: language === 'bn' ? 'সন্তুষ্ট ক্লায়েন্ট' : 'Happy Clients',
    },
    {
      icon: Clock,
      value: '99.9%',
      label: language === 'bn' ? 'আপটাইম গ্যারান্টি' : 'Uptime Guarantee',
    },
    {
      icon: Shield,
      value: '24/7',
      label: language === 'bn' ? 'সাপোর্ট' : 'Support',
    },
  ];

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center" style={{ background: 'var(--gradient-hero)' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Logo Color Gradient Orbs */}
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/30 to-accent/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-accent/20 to-primary/15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-primary/15 blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.5)_70%)]" />
      </div>

      <div className="container-custom relative z-10">
        <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
          {/* Badge */}
          <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-muted-foreground shadow-sm">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>{language === 'bn' ? '🚀 বাংলাদেশের সেরা ডিজিটাল সেবা' : '🚀 Bangladesh\'s Premier Digital Agency'}</span>
          </div>

          {/* Main Headline */}
          <h1 className="animate-slide-up text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl leading-tight">
            {language === 'bn' ? 'আপনার ব্যবসাকে' : 'Transform Your'}{' '}
            <span className="relative inline-block">
              <span className="gradient-text">{language === 'bn' ? 'ডিজিটালে রূপান্তর করুন' : 'Business Digitally'}</span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/40" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="animate-slide-up delay-100 mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl md:text-2xl leading-relaxed">
            {language === 'bn' 
              ? 'ডোমেইন, হোস্টিং, ওয়েব ডেভেলপমেন্ট, সফটওয়্যার এবং ডিজিটাল মার্কেটিং - সবকিছু এক জায়গায়। সাশ্রয়ী মূল্যে প্রিমিয়াম সার্ভিস।' 
              : 'Domain, Hosting, Web Development, Software & Digital Marketing - all in one place. Premium services at affordable prices.'}
          </p>

          {/* CTA Buttons */}
          <div className="animate-slide-up delay-200 mt-10 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="gradient-button h-14 px-10 text-lg shadow-lg shadow-primary/25" asChild>
              <Link to={`${basePath}/pricing`}>
                {language === 'bn' ? 'প্যাকেজ দেখুন' : 'View Packages'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg bg-background/80 backdrop-blur-sm hover:bg-background" asChild>
              <Link to={`${basePath}/contact`}>
                <Play className="mr-2 h-5 w-5" />
                {language === 'bn' ? 'ফ্রি পরামর্শ নিন' : 'Free Consultation'}
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="animate-slide-up delay-300 mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center glass-card px-6 py-4 rounded-xl">
                <stat.icon className="h-6 w-6 text-primary mb-2" />
                <span className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</span>
                <span className="text-xs md:text-sm text-muted-foreground text-center">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Domain Search Box */}
          <div className="animate-slide-up delay-400 mt-14 w-full max-w-2xl">
            <p className="text-sm text-muted-foreground mb-4 font-medium">
              {language === 'bn' ? '🔍 আপনার পছন্দের ডোমেইন খুঁজুন' : '🔍 Search for your perfect domain'}
            </p>
            <DomainSearchBox />
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0,64 C480,120 960,0 1440,64 L1440,120 L0,120 Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
}
