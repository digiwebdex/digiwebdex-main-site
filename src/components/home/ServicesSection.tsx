import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Code, Smartphone, TrendingUp, ArrowRight } from 'lucide-react';

const serviceIcons = {
  domainHosting: Globe,
  webDev: Code,
  softwareDev: Smartphone,
  digitalMarketing: TrendingUp,
};

export function ServicesSection() {
  const { language, t } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  const services = [
    {
      key: 'domainHosting',
      icon: serviceIcons.domainHosting,
      title: t.services.domainHosting.title,
      description: t.services.domainHosting.description,
      href: `${basePath}/services/domain-hosting`,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      key: 'webDev',
      icon: serviceIcons.webDev,
      title: t.services.webDev.title,
      description: t.services.webDev.description,
      href: `${basePath}/services/web-development`,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      key: 'softwareDev',
      icon: serviceIcons.softwareDev,
      title: t.services.softwareDev.title,
      description: t.services.softwareDev.description,
      href: `${basePath}/services/software-development`,
      gradient: 'from-orange-500 to-red-500',
    },
    {
      key: 'digitalMarketing',
      icon: serviceIcons.digitalMarketing,
      title: t.services.digitalMarketing.title,
      description: t.services.digitalMarketing.description,
      href: `${basePath}/services/digital-marketing`,
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">{t.services.title}</h2>
          <p className="mt-4 text-muted-foreground text-lg">{t.services.subtitle}</p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <Card
              key={service.key}
              className="group glass-card border-transparent hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                {/* Icon */}
                <div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <service.icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{service.description}</p>

                {/* Link */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-primary hover:text-primary/80 group/btn"
                  asChild
                >
                  <Link to={service.href}>
                    {t.services.learnMore}
                    <ArrowRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
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
