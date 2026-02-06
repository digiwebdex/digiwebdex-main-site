import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Award, Clock, DollarSign, Headphones } from 'lucide-react';

export function FeaturesSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Award,
      title: t.features.quality.title,
      description: t.features.quality.description,
    },
    {
      icon: Headphones,
      title: t.features.support.title,
      description: t.features.support.description,
    },
    {
      icon: DollarSign,
      title: t.features.price.title,
      description: t.features.price.description,
    },
    {
      icon: Clock,
      title: t.features.delivery.title,
      description: t.features.delivery.description,
    },
  ];

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">{t.features.title}</h2>
          <p className="mt-4 text-muted-foreground text-lg">{t.features.subtitle}</p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-background border border-transparent hover:border-primary/20 hover:shadow-lg transition-all duration-300"
            >
              {/* Icon */}
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
