import { Building2, Target, Globe, Briefcase } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface ClientOverviewProps {
  companyBackground?: string;
  industryType?: string;
  businessGoal?: string;
  clientLogoUrl?: string;
  clientWebsiteUrl?: string;
}

export function ClientOverview({
  companyBackground,
  industryType,
  businessGoal,
  clientLogoUrl,
  clientWebsiteUrl
}: ClientOverviewProps) {
  const { language } = useLanguage();

  const infoItems = [
    {
      icon: Building2,
      label: language === 'bn' ? 'কোম্পানি পরিচিতি' : 'Company Background',
      value: companyBackground
    },
    {
      icon: Briefcase,
      label: language === 'bn' ? 'ইন্ডাস্ট্রি' : 'Industry',
      value: industryType
    },
    {
      icon: Target,
      label: language === 'bn' ? 'ব্যবসায়িক লক্ষ্য' : 'Business Goal',
      value: businessGoal
    }
  ].filter(item => item.value);

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === 'bn' ? 'ক্লায়েন্ট পরিচিতি' : 'Client Overview'}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {infoItems.map((item, index) => (
            <div
              key={index}
              className="glass-premium p-6 rounded-2xl hover:shadow-xl transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{item.label}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Client Logo & Website */}
        {(clientLogoUrl || clientWebsiteUrl) && (
          <div className="flex items-center justify-center gap-6 mt-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {clientLogoUrl && (
              <img
                src={clientLogoUrl}
                alt="Client Logo"
                className="h-16 object-contain grayscale hover:grayscale-0 transition-all"
              />
            )}
            {clientWebsiteUrl && (
              <a
                href={clientWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Globe className="w-5 h-5" />
                {language === 'bn' ? 'ওয়েবসাইট দেখুন' : 'Visit Website'}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
