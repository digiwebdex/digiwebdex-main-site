import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { 
  Zap, 
  Shield, 
  Headphones, 
  DollarSign, 
  Award, 
  Clock,
  RefreshCw,
  Users
} from 'lucide-react';

export function WhyChooseUsSection() {
  const { language } = useLanguage();

  const benefits = [
    {
      icon: Zap,
      title: language === 'bn' ? 'অটোমেশন ফার্স্ট' : 'Automation First',
      description: language === 'bn' 
        ? 'স্বয়ংক্রিয় সিস্টেমে কাজ দ্রুত ও নির্ভুল' 
        : 'Automated systems for fast & accurate delivery',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: Shield,
      title: language === 'bn' ? 'সর্বোচ্চ নিরাপত্তা' : 'Maximum Security',
      description: language === 'bn' 
        ? 'SSL, ফায়ারওয়াল ও ম্যালওয়্যার প্রোটেকশন' 
        : 'SSL, Firewall & Malware Protection',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Headphones,
      title: language === 'bn' ? '২৪/৭ সাপোর্ট' : '24/7 Support',
      description: language === 'bn' 
        ? 'যেকোনো সমস্যায় সবসময় পাশে আছি' 
        : 'Always here to help with any issues',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: DollarSign,
      title: language === 'bn' ? 'সাশ্রয়ী মূল্য' : 'Affordable Pricing',
      description: language === 'bn' 
        ? 'বাজেট ফ্রেন্ডলি দামে প্রিমিয়াম সার্ভিস' 
        : 'Premium services at budget-friendly prices',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: Award,
      title: language === 'bn' ? 'মানসম্মত কাজ' : 'Quality Work',
      description: language === 'bn' 
        ? 'আন্তর্জাতিক মানের কাজের গ্যারান্টি' 
        : 'Guaranteed international quality standards',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Clock,
      title: language === 'bn' ? 'সময়মতো ডেলিভারি' : 'On-Time Delivery',
      description: language === 'bn' 
        ? 'ডেডলাইন মেনে কাজ সম্পন্ন করি' 
        : 'We complete work meeting deadlines',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: RefreshCw,
      title: language === 'bn' ? 'ফ্রি রিভিশন' : 'Free Revisions',
      description: language === 'bn' 
        ? 'সন্তুষ্ট না হলে বিনামূল্যে পরিবর্তন' 
        : 'Free changes until you are satisfied',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      icon: Users,
      title: language === 'bn' ? 'অভিজ্ঞ টিম' : 'Expert Team',
      description: language === 'bn' 
        ? '৫+ বছরের অভিজ্ঞ প্রফেশনাল টিম' 
        : '5+ years experienced professional team',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  return (
    <section className="section-padding bg-background" id="why-us">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {language === 'bn' ? '✨ কেন আমরা?' : '✨ Why Us?'}
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">
            {language === 'bn' ? 'Digiwebdex কেন বেছে নেবেন?' : 'Why Choose Digiwebdex?'}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            {language === 'bn' 
              ? 'আমরা শুধু সেবা দেই না, আপনার সাফল্যের অংশীদার হই' 
              : 'We don\'t just provide services, we become your success partner'}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card border border-transparent hover:border-primary/20 hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Icon */}
              <div className={`h-14 w-14 rounded-xl ${benefit.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <benefit.icon className={`h-7 w-7 ${benefit.color}`} />
              </div>

              {/* Content */}
              <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
