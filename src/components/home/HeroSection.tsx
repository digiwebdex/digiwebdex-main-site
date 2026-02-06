import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  const { language, t } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 -left-20 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-40 w-40 rounded-full bg-primary/5 blur-2xl animate-float" />
      </div>

      <div className="container-custom relative">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-20 text-center">
          {/* Badge */}
          <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            {t.hero.badge}
          </div>

          {/* Title */}
          <h1 className="animate-slide-up text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl">
            {t.hero.title}{' '}
            <span className="gradient-text">{t.hero.titleHighlight}</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-slide-up delay-100 mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {t.hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="animate-slide-up delay-200 mt-10 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="gradient-button h-12 px-8 text-base" asChild>
              <Link to={`${basePath}/pricing`}>
                {t.hero.cta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link to={`${basePath}/services/web-development`}>
                {t.hero.ctaSecondary}
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="animate-slide-up delay-300 mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: '500+', label: t.stats.clients },
              { value: '1000+', label: t.stats.projects },
              { value: '10+', label: t.stats.experience },
              { value: '24/7', label: t.stats.support },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
