import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Code, Smartphone, TrendingUp, ArrowRight } from 'lucide-react';

export function ServicesSection() {
  const { language, t } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  const services = [
    {
      key: 'domainHosting',
      icon: Globe,
      title: language === 'bn' ? 'ডোমেইন ও হোস্টিং' : 'Domain & Hosting',
      description: language === 'bn' 
        ? '.com, .net, .org সহ সব ধরনের ডোমেইন। দ্রুত ও নিরাপদ SSD হোস্টিং।' 
        : 'All types of domains including .com, .net, .org. Fast & secure SSD hosting.',
      price: language === 'bn' ? '৳৯৯' : '৳99',
      priceLabel: language === 'bn' ? '/মাস থেকে' : '/mo from',
      href: `${basePath}/services/domain-hosting`,
      gradient: 'from-blue-500 to-cyan-500',
      features: language === 'bn' 
        ? ['99.9% আপটাইম', 'ফ্রি SSL', '24/7 সাপোর্ট']
        : ['99.9% Uptime', 'Free SSL', '24/7 Support'],
    },
    {
      key: 'webDev',
      icon: Code,
      title: language === 'bn' ? 'ওয়েব ডেভেলপমেন্ট' : 'Web Development',
      description: language === 'bn' 
        ? 'মডার্ন ও রেসপন্সিভ ওয়েবসাইট। ই-কমার্স থেকে কর্পোরেট সাইট।' 
        : 'Modern & responsive websites. From e-commerce to corporate sites.',
      price: language === 'bn' ? '৳৫,০০০' : '৳5,000',
      priceLabel: language === 'bn' ? ' থেকে' : ' from',
      href: `${basePath}/services/web-development`,
      gradient: 'from-purple-500 to-pink-500',
      features: language === 'bn' 
        ? ['রেসপন্সিভ ডিজাইন', 'SEO ফ্রেন্ডলি', 'ফাস্ট লোডিং']
        : ['Responsive Design', 'SEO Friendly', 'Fast Loading'],
    },
    {
      key: 'softwareDev',
      icon: Smartphone,
      title: language === 'bn' ? 'সফটওয়্যার ডেভেলপমেন্ট' : 'Software Development',
      description: language === 'bn' 
        ? 'কাস্টম সফটওয়্যার ও মোবাইল অ্যাপ। ERP, CRM, ইনভেন্টরি সিস্টেম।' 
        : 'Custom software & mobile apps. ERP, CRM, Inventory systems.',
      price: language === 'bn' ? '৳২০,০০০' : '৳20,000',
      priceLabel: language === 'bn' ? ' থেকে' : ' from',
      href: `${basePath}/services/software-development`,
      gradient: 'from-orange-500 to-red-500',
      features: language === 'bn' 
        ? ['কাস্টম সলিউশন', 'স্কেলেবল', 'সোর্স কোড']
        : ['Custom Solutions', 'Scalable', 'Source Code'],
    },
    {
      key: 'digitalMarketing',
      icon: TrendingUp,
      title: language === 'bn' ? 'ডিজিটাল মার্কেটিং' : 'Digital Marketing',
      description: language === 'bn' 
        ? 'SEO, সোশ্যাল মিডিয়া, গুগল অ্যাডস। অনলাইনে ব্যবসা বাড়ান।' 
        : 'SEO, Social Media, Google Ads. Grow your business online.',
      price: language === 'bn' ? '৳৩,০০০' : '৳3,000',
      priceLabel: language === 'bn' ? '/মাস থেকে' : '/mo from',
      href: `${basePath}/services/digital-marketing`,
      gradient: 'from-green-500 to-emerald-500',
      features: language === 'bn' 
        ? ['ROI ফোকাসড', 'ডেটা ড্রিভেন', 'রিপোর্টিং']
        : ['ROI Focused', 'Data Driven', 'Reporting'],
    },
  ];

  return (
    <section className="section-padding bg-background" id="services">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {language === 'bn' ? '🛠️ আমাদের সেবাসমূহ' : '🛠️ Our Services'}
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            {language === 'bn' ? 'আপনার প্রয়োজনের সব সমাধান' : 'Solutions for All Your Needs'}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            {language === 'bn' 
              ? 'ডিজিটাল বিজনেসের জন্য প্রয়োজনীয় সকল সেবা এক ছাদের নিচে' 
              : 'All essential digital business services under one roof'}
          </p>
        </div>

        {/* Services Grid - 4 items */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <Card
              key={service.key}
              className="group glass-card border-transparent hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="relative p-6 flex flex-col h-full">
                {/* Icon */}
                <div
                  className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}
                >
                  <service.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-bold text-xl mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 flex-grow">{service.description}</p>

                {/* Features */}
                <ul className="space-y-1 mb-4">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="mb-4 pt-3 border-t border-border/50">
                  <span className="text-2xl font-bold text-primary">{service.price}</span>
                  <span className="text-sm text-muted-foreground">{service.priceLabel}</span>
                </div>

                {/* Link */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group/btn"
                  asChild
                >
                  <Link to={service.href}>
                    {language === 'bn' ? 'বিস্তারিত দেখুন' : 'Learn More'}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
