import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { MessageCircle, FileSearch, Code2, Rocket, ArrowRight } from 'lucide-react';

export function ProcessSection() {
  const { language } = useLanguage();

  const steps = [
    {
      icon: MessageCircle,
      number: '01',
      title: language === 'bn' ? 'আলোচনা' : 'Discussion',
      description: language === 'bn'
        ? 'আপনার প্রয়োজন এবং লক্ষ্য বুঝতে বিনামূল্যে পরামর্শ'
        : 'Free consultation to understand your needs and goals',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileSearch,
      number: '02',
      title: language === 'bn' ? 'প্ল্যানিং' : 'Planning',
      description: language === 'bn'
        ? 'বিস্তারিত রোডম্যাপ এবং প্রজেক্ট প্ল্যান তৈরি'
        : 'Create detailed roadmap and project plan',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: Code2,
      number: '03',
      title: language === 'bn' ? 'ডেভেলপমেন্ট' : 'Development',
      description: language === 'bn'
        ? 'এক্সপার্ট টিম দিয়ে প্রজেক্ট ডেভেলপমেন্ট'
        : 'Project development with expert team',
      color: 'from-orange-500 to-amber-500',
    },
    {
      icon: Rocket,
      number: '04',
      title: language === 'bn' ? 'লঞ্চ' : 'Launch',
      description: language === 'bn'
        ? 'টেস্টিং এবং সফল ডেলিভারি নিশ্চিত করা'
        : 'Testing and ensuring successful delivery',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section className="section-padding relative bg-gradient-to-b from-muted/50 via-background to-background">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-semibold mb-6">
            <span>🔄</span>
            {language === 'bn' ? 'কাজের প্রক্রিয়া' : 'Work Process'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {language === 'bn' ? (
              <>আমরা কীভাবে <span className="gradient-text">কাজ করি</span></>
            ) : (
              <>How We <span className="gradient-text">Work</span></>
            )}
          </h2>
          <p className="text-lg text-muted-foreground">
            {language === 'bn'
              ? 'আমাদের প্রমাণিত ৪ ধাপের প্রক্রিয়া দিয়ে আপনার প্রজেক্ট সফলভাবে সম্পন্ন করি'
              : 'We successfully complete your project with our proven 4-step process'}
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Arrow connector for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-2 z-10 w-4 h-4 items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-primary/50" />
                </div>
              )}

              <div className="bg-card border border-border/50 rounded-2xl p-6 text-center h-full transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1">
                {/* Step Number Badge - Inside Card */}
                <div className="mb-4">
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold text-white bg-gradient-to-br ${step.color} shadow-md`}>
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 mx-auto mb-5 rounded-xl bg-gradient-to-br ${step.color} p-4 shadow-lg transition-transform duration-300 group-hover:scale-105`}>
                  <step.icon className="w-full h-full text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Message */}
        <div className="mt-14 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-4 rounded-xl bg-primary/5 border border-primary/10">
            <span className="text-2xl">⏱️</span>
            <div className="text-left">
              <p className="font-semibold text-foreground">
                {language === 'bn' ? 'গড় ডেলিভারি সময়: ৭-১৪ দিন' : 'Average Delivery: 7-14 Days'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'bn' ? 'প্রজেক্টের জটিলতা অনুযায়ী' : 'Depending on project complexity'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
