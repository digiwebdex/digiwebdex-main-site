import { Quote, Star } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TestimonialSectionProps {
  text?: string;
  authorName?: string;
  authorTitle?: string;
  authorCompany?: string;
  authorAvatarUrl?: string;
  rating?: number;
}

export function TestimonialSection({
  text,
  authorName,
  authorTitle,
  authorCompany,
  authorAvatarUrl,
  rating = 5
}: TestimonialSectionProps) {
  const { language } = useLanguage();

  if (!text) return null;

  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === 'bn' ? 'ক্লায়েন্ট প্রতিক্রিয়া' : 'Client Testimonial'}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="glass-premium rounded-3xl p-8 md:p-12 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              {/* Quote Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/25">
                <Quote className="w-8 h-8 text-white" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < rating 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-xl md:text-2xl text-foreground leading-relaxed mb-8 italic">
                "{text}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-indigo-500">
                  <AvatarImage src={authorAvatarUrl} alt={authorName} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xl">
                    {authorName?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold text-foreground">{authorName}</p>
                  {authorTitle && (
                    <p className="text-muted-foreground">{authorTitle}</p>
                  )}
                  {authorCompany && (
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium">{authorCompany}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
