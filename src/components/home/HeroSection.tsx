import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles, Zap, Globe, Shield, CheckCircle } from 'lucide-react';
import { DomainSearchBox } from './DomainSearchBox';

export function HeroSection() {
  const { language, t } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  const highlights = [
    { icon: CheckCircle, text: language === 'bn' ? '৫০০+ সফল প্রজেক্ট' : '500+ Successful Projects' },
    { icon: CheckCircle, text: language === 'bn' ? '৯৯.৯% আপটাইম' : '99.9% Uptime' },
    { icon: CheckCircle, text: language === 'bn' ? '২৪/৭ সাপোর্ট' : '24/7 Support' },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
      <div className="absolute inset-0 mesh-gradient" />
      
      {/* Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large primary orb */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 via-secondary/15 to-transparent blur-3xl animate-float" />
        
        {/* Secondary orb */}
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-secondary/15 via-primary/10 to-transparent blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        {/* Small accent orbs */}
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/10 blur-2xl animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/4 left-1/3 w-48 h-48 rounded-full bg-primary/15 blur-2xl animate-float" style={{ animationDelay: '3s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Radial Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.3)_70%)]" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-float" style={{ animationDelay: '0s' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary p-2.5 shadow-lg">
            <Globe className="w-full h-full text-white" />
          </div>
        </div>
        <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-pink-500 p-2 shadow-lg">
            <Zap className="w-full h-full text-white" />
          </div>
        </div>
        <div className="absolute bottom-40 left-20 animate-float" style={{ animationDelay: '2.5s' }}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-primary p-3 shadow-lg">
            <Shield className="w-full h-full text-white" />
          </div>
        </div>
        <div className="absolute bottom-60 right-40 animate-float" style={{ animationDelay: '1.5s' }}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent p-1.5 shadow-lg">
            <Sparkles className="w-full h-full text-white" />
          </div>
        </div>
      </div>

      <div className="container-custom relative z-10 py-20 md:py-28">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="animate-slide-up mb-8">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-card border-primary/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-foreground">
                {language === 'bn' ? '🚀 বাংলাদেশের #১ ডিজিটাল এজেন্সি' : '🚀 Bangladesh\'s #1 Digital Agency'}
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="animate-slide-up delay-100 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            {language === 'bn' ? (
              <>
                আপনার ব্যবসাকে
                <br />
                <span className="relative inline-block mt-2">
                  <span className="gradient-text animate-gradient">ডিজিটালে রূপান্তর</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" preserveAspectRatio="none">
                    <path d="M0,8 Q75,0 150,8 T300,8" fill="none" stroke="url(#underlineGradient)" strokeWidth="4" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="underlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(235 85% 60%)" />
                        <stop offset="50%" stopColor="hsl(270 80% 60%)" />
                        <stop offset="100%" stopColor="hsl(300 75% 55%)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <span className="block mt-2">করুন</span>
              </>
            ) : (
              <>
                Transform Your
                <br />
                <span className="relative inline-block mt-2">
                  <span className="gradient-text animate-gradient">Business Digitally</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" preserveAspectRatio="none">
                    <path d="M0,8 Q75,0 150,8 T300,8" fill="none" stroke="url(#underlineGradient)" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p className="animate-slide-up delay-200 mt-8 text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed">
            {language === 'bn' 
              ? 'ডোমেইন, হোস্টিং, ওয়েব ডেভেলপমেন্ট, সফটওয়্যার এবং ডিজিটাল মার্কেটিং — সবকিছু এক জায়গায়। প্রিমিয়াম সার্ভিস, সাশ্রয়ী মূল্যে।' 
              : 'Domain, Hosting, Web Development, Software & Digital Marketing — all in one place. Premium services at affordable prices.'}
          </p>

          {/* Highlights */}
          <div className="animate-slide-up delay-300 mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {highlights.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm md:text-base text-foreground/80">
                <item.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="animate-slide-up delay-400 mt-12 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="gradient-button h-14 px-10 text-lg" asChild>
              <Link to={`${basePath}/pricing`}>
                {language === 'bn' ? 'প্যাকেজ দেখুন' : 'View Packages'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg bg-background/60 backdrop-blur-sm border-primary/20 hover:bg-primary/5 hover:border-primary/40" asChild>
              <Link to={`${basePath}/contact`}>
                <Play className="mr-2 h-5 w-5 text-primary" />
                {language === 'bn' ? 'ফ্রি কনসাল্টেশন' : 'Free Consultation'}
              </Link>
            </Button>
          </div>

          {/* Domain Search Box */}
          <div className="animate-slide-up delay-500 mt-16 w-full max-w-2xl">
            <div className="text-center mb-6">
              <p className="text-base font-medium text-foreground mb-1">
                {language === 'bn' ? '🔍 আপনার পছন্দের ডোমেইন খুঁজুন' : '🔍 Find Your Perfect Domain'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'bn' ? '.com শুরু মাত্র ৳৯৯৯/বছর থেকে' : '.com starting from just ৳999/year'}
              </p>
            </div>
            <DomainSearchBox />
          </div>

          {/* Stats Cards */}
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0,80 C360,120 720,40 1080,80 C1260,100 1380,100 1440,80 L1440,120 L0,120 Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
}
