import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Users, Gauge, ShoppingCart, Star } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import type { Result } from '@/services/caseStudyService';

interface ResultsSectionProps {
  results: Result[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'traffic': TrendingUp,
  'sales': ShoppingCart,
  'pagespeed': Gauge,
  'users': Users,
  'default': Star
};

function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  const prefix = value.match(/^[^\d]*/)?.[0] || '';
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = performance.now();
          
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setDisplayValue(Math.round(numericValue * easeOutQuart));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [numericValue]);

  return (
    <span ref={ref} className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
      {prefix}{displayValue}{suffix}
    </span>
  );
}

export function ResultsSection({ results }: ResultsSectionProps) {
  const { language } = useLanguage();

  if (!results || results.length === 0) return null;

  return (
    <section className="py-24 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {language === 'bn' ? 'চূড়ান্ত ফলাফল' : 'The Results'}
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            {language === 'bn' 
              ? 'পরিমাপযোগ্য উন্নতি যা ব্যবসায়িক সাফল্য এনেছে'
              : 'Measurable improvements that drove business success'}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mt-4" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {results.map((result, index) => {
            const IconComponent = iconMap[result.icon || 'default'] || Star;
            const suffix = result.value.includes('%') ? '%' : result.value.includes('+') ? '+' : '';
            
            return (
              <div
                key={index}
                className="glass-premium rounded-2xl p-8 text-center group hover:scale-105 transition-transform animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-500/25">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <AnimatedCounter value={result.value} suffix={suffix} />
                <p className="text-slate-300 mt-3 text-lg">
                  {language === 'bn' ? result.label_bn : result.label_en}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
