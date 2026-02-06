import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  const { language, t } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16" style={{ background: 'var(--gradient-primary)' }}>
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative text-center text-white">
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl max-w-3xl mx-auto">
              {t.cta.title}
            </h2>
            <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
              {t.cta.subtitle}
            </p>
            <Button
              size="lg"
              className="mt-8 h-12 px-8 bg-white text-primary hover:bg-white/90 font-semibold"
              asChild
            >
              <Link to={`${basePath}/contact`}>
                {t.cta.button}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
