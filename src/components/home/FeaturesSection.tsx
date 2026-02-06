import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { 
  CheckCircle2, 
  Rocket, 
  Palette, 
  Code, 
  BarChart3, 
  Shield, 
  RefreshCcw, 
  Headphones 
} from 'lucide-react';

export function FeaturesSection() {
  const { language } = useLanguage();

  const features = [
    {
      icon: Rocket,
      title: language === 'bn' ? 'দ্রুত ডেলিভারি' : 'Fast Delivery',
      description: language === 'bn'
        ? 'সময়মতো প্রজেক্ট ডেলিভারি নিশ্চিত করি'
        : 'We ensure on-time project delivery',
    },
    {
      icon: Palette,
      title: language === 'bn' ? 'কাস্টম ডিজাইন' : 'Custom Design',
      description: language === 'bn'
        ? 'আপনার ব্র্যান্ডের জন্য ইউনিক ডিজাইন'
        : 'Unique designs for your brand',
    },
    {
      icon: Code,
      title: language === 'bn' ? 'ক্লিন কোড' : 'Clean Code',
      description: language === 'bn'
        ? 'মেইনটেইনেবল এবং স্কেলেবল কোড'
        : 'Maintainable and scalable code',
    },
    {
      icon: BarChart3,
      title: language === 'bn' ? 'SEO অপটিমাইজড' : 'SEO Optimized',
      description: language === 'bn'
        ? 'সার্চ ইঞ্জিনে উপরে থাকার জন্য অপটিমাইজড'
        : 'Optimized for search engine ranking',
    },
    {
      icon: Shield,
      title: language === 'bn' ? 'সিকিউরিটি ফার্স্ট' : 'Security First',
      description: language === 'bn'
        ? 'আপনার ডাটা সুরক্ষিত রাখি'
        : 'We keep your data secure',
    },
    {
      icon: RefreshCcw,
      title: language === 'bn' ? 'ফ্রি রিভিশন' : 'Free Revisions',
      description: language === 'bn'
        ? 'সন্তুষ্ট না হওয়া পর্যন্ত রিভিশন'
        : 'Revisions until you are satisfied',
    },
    {
      icon: Headphones,
      title: language === 'bn' ? 'ডেডিকেটেড সাপোর্ট' : 'Dedicated Support',
      description: language === 'bn'
        ? 'প্রজেক্টের পরেও সাপোর্ট পাবেন'
        : 'Support even after project completion',
    },
    {
      icon: CheckCircle2,
      title: language === 'bn' ? 'কোয়ালিটি অ্যাসুরেন্স' : 'Quality Assurance',
      description: language === 'bn'
        ? 'প্রতিটি প্রজেক্ট টেস্ট করা হয়'
        : 'Every project is thoroughly tested',
    },
  ];

  return (
    <section className="section-padding bg-secondary/30 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <span>⚡</span>
              {language === 'bn' ? 'আমাদের সুবিধাসমূহ' : 'Our Benefits'}
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-slide-up">
              {language === 'bn' ? (
                <>আমরা কীভাবে আপনার <span className="gradient-text">ব্যবসা বাড়াই</span></>
              ) : (
                <>How We Help <span className="gradient-text">Grow Your Business</span></>
              )}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 animate-slide-up delay-100">
              {language === 'bn'
                ? 'আমাদের এক্সপার্ট টিম এবং প্রমাণিত পদ্ধতি দিয়ে আপনার ব্যবসাকে পরবর্তী স্তরে নিয়ে যাই। আমরা শুধু সার্ভিস দিই না, আমরা পার্টনার হিসেবে কাজ করি।'
                : 'We take your business to the next level with our expert team and proven methods. We don\'t just provide services, we work as partners.'}
            </p>

            {/* Highlight Stats */}
            <div className="grid grid-cols-3 gap-4 animate-slide-up delay-200">
              {[
                { value: '100%', label: language === 'bn' ? 'সন্তুষ্টি' : 'Satisfaction' },
                { value: '500+', label: language === 'bn' ? 'প্রজেক্ট' : 'Projects' },
                { value: '24/7', label: language === 'bn' ? 'সাপোর্ট' : 'Support' },
              ].map((stat, index) => (
                <div key={index} className="text-center p-4 rounded-xl bg-background/50">
                  <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 75 + 150}ms` }}
              >
                <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 hover:bg-background transition-colors duration-300 hover:shadow-lg">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
