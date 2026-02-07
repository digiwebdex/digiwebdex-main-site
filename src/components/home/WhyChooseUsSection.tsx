import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { 
  Shield, 
  Zap, 
  Clock, 
  Users, 
  Award, 
  Headphones, 
  TrendingUp, 
  Lock 
} from 'lucide-react';

export function WhyChooseUsSection() {
  const { language } = useLanguage();

  const benefits = [
    {
      icon: Zap,
      title: language === 'bn' ? 'লাইটনিং ফাস্ট' : 'Lightning Fast',
      description: language === 'bn' 
        ? 'অপটিমাইজড সার্ভার এবং CDN দিয়ে সুপার ফাস্ট লোডিং' 
        : 'Super fast loading with optimized servers and CDN',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Shield,
      title: language === 'bn' ? 'এন্টারপ্রাইজ সিকিউরিটি' : 'Enterprise Security',
      description: language === 'bn'
        ? 'SSL, ফায়ারওয়াল এবং DDoS প্রটেকশন বিল্ট-ইন'
        : 'Built-in SSL, firewall and DDoS protection',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Clock,
      title: language === 'bn' ? '৯৯.৯% আপটাইম' : '99.9% Uptime',
      description: language === 'bn'
        ? 'গ্যারান্টেড আপটাইম যাতে আপনার সাইট সবসময় অনলাইন থাকে'
        : 'Guaranteed uptime to keep your site always online',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Headphones,
      title: language === 'bn' ? '২৪/৭ সাপোর্ট' : '24/7 Support',
      description: language === 'bn'
        ? 'বাংলায় এক্সপার্ট টেকনিক্যাল সাপোর্ট যেকোনো সময়'
        : 'Expert technical support in Bengali anytime',
      color: 'from-purple-500 to-violet-500',
    },
    {
      icon: TrendingUp,
      title: language === 'bn' ? 'স্কেলেবল সলিউশন' : 'Scalable Solutions',
      description: language === 'bn'
        ? 'আপনার ব্যবসার সাথে বৃদ্ধি পায় এমন ফ্লেক্সিবল প্ল্যান'
        : 'Flexible plans that grow with your business',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Award,
      title: language === 'bn' ? '১০+ বছরের অভিজ্ঞতা' : '10+ Years Experience',
      description: language === 'bn'
        ? 'দীর্ঘ অভিজ্ঞতার সাথে প্রমাণিত ট্র্যাক রেকর্ড'
        : 'Proven track record with extensive experience',
      color: 'from-amber-500 to-yellow-500',
    },
    {
      icon: Users,
      title: language === 'bn' ? 'ডেডিকেটেড টিম' : 'Dedicated Team',
      description: language === 'bn'
        ? 'আপনার প্রজেক্টের জন্য নিবেদিত এক্সপার্ট টিম'
        : 'Expert team dedicated to your project',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Lock,
      title: language === 'bn' ? 'ডাটা প্রাইভেসি' : 'Data Privacy',
      description: language === 'bn'
        ? 'আপনার ডাটা সুরক্ষিত এবং সম্পূর্ণ প্রাইভেট'
        : 'Your data is secure and completely private',
      color: 'from-teal-500 to-green-500',
    },
  ];

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Decorative orbs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-morph" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl animate-morph" style={{ animationDelay: '4s' }} />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-premium text-primary text-sm font-semibold mb-6 animate-fade-in">
            <span>🏆</span>
            {language === 'bn' ? 'কেন আমরা' : 'Why Choose Us'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-slide-up">
            {language === 'bn' ? (
              <>আমাদের সাথে কাজ করার <span className="gradient-text">৮টি কারণ</span></>
            ) : (
              <><span className="gradient-text">8 Reasons</span> to Work With Us</>
            )}
          </h2>
          <p className="text-lg text-muted-foreground animate-slide-up delay-100">
            {language === 'bn'
              ? 'বাংলাদেশের হাজারো ব্যবসায়ী আমাদের বিশ্বাস করেন'
              : 'Thousands of businesses in Bangladesh trust us'}
          </p>
        </div>

        {/* Benefits Grid with enhanced cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group animate-slide-up"
              style={{ animationDelay: `${index * 75 + 150}ms` }}
            >
              <div className="h-full glass-premium p-6 text-center hover:border-primary/40 transition-all duration-500 card-shine">
                {/* Icon with enhanced effects */}
                <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${benefit.color} p-4 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 group-hover:shadow-2xl`}>
                  <benefit.icon className="w-full h-full text-white drop-shadow-lg" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge with enhanced styling */}
        <div className="mt-16 text-center animate-slide-up delay-700">
          <div className="inline-flex items-center gap-4 px-8 py-5 rounded-2xl glass-premium">
            <div className="flex -space-x-3">
              {['😊', '🎉', '💼', '🚀'].map((emoji, i) => (
                <span key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl border-2 border-background shadow-lg">
                  {emoji}
                </span>
              ))}
            </div>
            <div className="text-left">
              <p className="font-bold text-lg text-foreground">
                {language === 'bn' ? '৫০০+ সন্তুষ্ট ক্লায়েন্ট' : '500+ Satisfied Clients'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'bn' ? 'বাংলাদেশ জুড়ে' : 'Across Bangladesh'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
