import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Sparkles } from 'lucide-react';
import { domainService, type DomainPricing } from '@/services/domainService';

export function DomainSearchBox() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [domain, setDomain] = useState('');
  const [popularTlds, setPopularTlds] = useState<{ tld: string; price: string }[]>([]);
  const basePath = language === 'en' ? '/en' : '/bn';

  useEffect(() => {
    loadPopularTlds();
  }, []);

  const loadPopularTlds = async () => {
    try {
      const pricing = await domainService.getPopularTlds();
      const formatted = pricing.slice(0, 5).map((item: DomainPricing) => ({
        tld: item.tld,
        price: `৳${Math.ceil(item.base_price * (1 + item.margin_percent / 100)).toLocaleString('bn-BD')}`,
      }));
      setPopularTlds(formatted);
    } catch (error) {
      console.error('Error loading TLD pricing:', error);
      // Fallback to static prices if fetch fails
      setPopularTlds([
        { tld: '.com', price: '৳১,৭৯৫' },
        { tld: '.net', price: '৳২,১৯০' },
        { tld: '.org', price: '৳২,০২০' },
        { tld: '.com.bd', price: '৳২,৫০০' },
        { tld: '.xyz', price: '৳১,২০০' },
      ]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      navigate(`${basePath}/domains?search=${encodeURIComponent(domain.trim())}`);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="w-full">
        <div className="relative flex flex-col sm:flex-row gap-3 p-3 rounded-2xl glass-card shadow-xl border-primary/20">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={language === 'bn' ? 'আপনার ডোমেইন নাম লিখুন...' : 'Enter your domain name...'}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="pl-12 h-14 border-0 bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/50 text-base rounded-xl"
            />
          </div>
          <Button
            type="submit"
            className="gradient-button h-14 px-8 shrink-0 rounded-xl text-base font-semibold"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {language === 'bn' ? 'খুঁজুন' : 'Search'}
          </Button>
        </div>
      </form>

      {/* Popular TLDs */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        {popularTlds.map((item) => (
          <button
            key={item.tld}
            type="button"
            onClick={() => setDomain((prev) => (prev ? prev.split('.')[0] + item.tld : item.tld))}
            className="group px-4 py-2 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {item.tld}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">
              {item.price}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
