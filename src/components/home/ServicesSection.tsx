import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Globe, Code2, Cpu, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ServicesSection() {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  const services = [
    {
      icon: Globe,
      title: language === 'bn' ? 'ডোমেইন ও হোস্টিং' : 'Domain & Hosting',
      description: language === 'bn'
        ? 'নিরাপদ ও দ্রুত ডোমেইন রেজিস্ট্রেশন এবং হোস্টিং সলিউশন'
        : 'Secure & fast domain registration and hosting solutions',
      features: language === 'bn'
        ? ['ফ্রি SSL সার্টিফিকেট', '99.9% আপটাইম', 'SSD স্টোরেজ']
        : ['Free SSL Certificate', '99.9% Uptime', 'SSD Storage'],
      price: '৳299',
      period: language === 'bn' ? '/মাস থেকে' : '/mo from',
      link: `${basePath}/services/domain-hosting`,
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      bgGradient: 'from-blue-500/10 via-cyan-500/5 to-transparent',
    },
    {
      icon: Code2,
      title: language === 'bn' ? 'ওয়েব ডেভেলপমেন্ট' : 'Web Development',
      description: language === 'bn'
        ? 'আধুনিক ও রেসপন্সিভ ওয়েবসাইট ডিজাইন এবং ডেভেলপমেন্ট'
        : 'Modern & responsive website design and development',
      features: language === 'bn'
        ? ['কাস্টম ডিজাইন', 'SEO অপটিমাইজড', 'মোবাইল ফ্রেন্ডলি']
        : ['Custom Design', 'SEO Optimized', 'Mobile Friendly'],
      price: '৳15,000',
      period: language === 'bn' ? ' থেকে' : ' from',
      link: `${basePath}/services/web-development`,
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      bgGradient: 'from-violet-500/10 via-purple-500/5 to-transparent',
    },
    {
      icon: Cpu,
      title: language === 'bn' ? 'সফটওয়্যার ডেভেলপমেন্ট' : 'Software Development',
      description: language === 'bn'
        ? 'কাস্টম ERP, POS এবং বিজনেস অটোমেশন সলিউশন'
        : 'Custom ERP, POS and business automation solutions',
      features: language === 'bn'
        ? ['ক্লাউড বেইজড', 'রিয়েলটাইম রিপোর্ট', 'মাল্টি-ইউজার']
        : ['Cloud Based', 'Realtime Reports', 'Multi-User'],
      price: '৳50,000',
      period: language === 'bn' ? ' থেকে' : ' from',
      link: `${basePath}/services/software-development`,
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      bgGradient: 'from-orange-500/10 via-amber-500/5 to-transparent',
    },
    {
      icon: TrendingUp,
      title: language === 'bn' ? 'ডিজিটাল মার্কেটিং' : 'Digital Marketing',
      description: language === 'bn'
        ? 'SEO, সোশ্যাল মিডিয়া এবং গুগল অ্যাডস ক্যাম্পেইন'
        : 'SEO, social media and Google Ads campaigns',
      features: language === 'bn'
        ? ['সার্চ র‍্যাংকিং', 'লিড জেনারেশন', 'ব্র্যান্ড বিল্ডিং']
        : ['Search Ranking', 'Lead Generation', 'Brand Building'],
      price: '৳10,000',
      period: language === 'bn' ? '/মাস থেকে' : '/mo from',
      link: `${basePath}/services/digital-marketing`,
      gradient: 'from-pink-500 via-rose-500 to-red-500',
      bgGradient: 'from-pink-500/10 via-rose-500/5 to-transparent',
    },
  ];

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient opacity-50" />
      
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <span>✨</span>
            {language === 'bn' ? 'আমাদের সেবাসমূহ' : 'Our Services'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-slide-up">
            {language === 'bn' ? (
              <>আপনার ব্যবসার জন্য <span className="gradient-text">সম্পূর্ণ ডিজিটাল সলিউশন</span></>
            ) : (
              <>Complete Digital Solutions <span className="gradient-text">for Your Business</span></>
            )}
          </h2>
          <p className="text-lg text-muted-foreground animate-slide-up delay-100">
            {language === 'bn'
              ? 'আমরা আপনার ব্যবসার অনলাইন উপস্থিতি থেকে শুরু করে সম্পূর্ণ ডিজিটাল ট্রান্সফর্মেশনে সাহায্য করি'
              : 'We help you from establishing online presence to complete digital transformation'}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <Link 
              key={index} 
              to={service.link}
              className="group animate-slide-up"
              style={{ animationDelay: `${index * 100 + 200}ms` }}
            >
              <div className="relative h-full glass-card p-8 hover:border-primary/30 transition-all duration-500 card-shine overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  {/* Icon & Price */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} p-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon className="w-full h-full text-white" />
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-foreground">{service.price}</span>
                      <span className="text-sm text-muted-foreground">{service.period}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {service.features.map((feature, fIndex) => (
                      <span 
                        key={fIndex}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/50 text-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center text-primary font-medium">
                    {language === 'bn' ? 'বিস্তারিত দেখুন' : 'Learn More'}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center animate-slide-up delay-500">
          <p className="text-muted-foreground mb-6">
            {language === 'bn' 
              ? 'কোন সার্ভিস আপনার জন্য সেরা তা জানতে চান?'
              : 'Not sure which service is right for you?'}
          </p>
          <Button size="lg" className="gradient-button h-14 px-10" asChild>
            <Link to={`${basePath}/contact`}>
              {language === 'bn' ? 'ফ্রি কনসাল্টেশন নিন' : 'Get Free Consultation'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
