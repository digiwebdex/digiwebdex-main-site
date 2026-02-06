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
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <span>🔄</span>
            {language === 'bn' ? 'কাজের প্রক্রিয়া' : 'Work Process'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-slide-up">
            {language === 'bn' ? (
              <>আমরা কীভাবে <span className="gradient-text">কাজ করি</span></>
            ) : (
              <>How We <span className="gradient-text">Work</span></>
            )}
          </h2>
          <p className="text-lg text-muted-foreground animate-slide-up delay-100">
            {language === 'bn'
              ? 'আমাদের প্রমাণিত ৪ ধাপের প্রক্রিয়া দিয়ে আপনার প্রজেক্ট সফলভাবে সম্পন্ন করি'
              : 'We successfully complete your project with our proven 4-step process'}
          </p>
        </div>

        {/* Process Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-orange-500 to-green-500 -translate-y-1/2 rounded-full opacity-20" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative animate-slide-up"
                style={{ animationDelay: `${index * 150 + 200}ms` }}
              >
                {/* Arrow Between Steps - Desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 w-8 h-8 items-center justify-center z-10">
                    <ArrowRight className="w-5 h-5 text-primary/50" />
                  </div>
                )}

                <div className="group glass-card p-8 text-center hover:border-primary/30 transition-all duration-500 h-full">
                  {/* Step Number */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${step.color} shadow-lg`}>
                      {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`w-20 h-20 mx-auto mt-4 mb-6 rounded-2xl bg-gradient-to-br ${step.color} p-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-full h-full text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Message */}
        <div className="mt-16 text-center animate-slide-up delay-700">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl glass-card">
            <span className="text-2xl">⏱️</span>
            <div className="text-left">
              <p className="font-bold text-foreground">
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
