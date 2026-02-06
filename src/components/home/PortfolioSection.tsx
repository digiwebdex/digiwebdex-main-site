import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink, TrendingUp } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export function PortfolioSection() {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  const projects = [
    {
      id: 1,
      title: language === 'bn' ? 'ই-কমার্স প্ল্যাটফর্ম' : 'E-commerce Platform',
      category: language === 'bn' ? 'ওয়েব ডেভেলপমেন্ট' : 'Web Development',
      result: language === 'bn' ? '৩০০% বিক্রয় বৃদ্ধি' : '300% Sales Increase',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
      gradient: 'from-violet-600/90 to-purple-600/90',
    },
    {
      id: 2,
      title: language === 'bn' ? 'রেস্টুরেন্ট POS সিস্টেম' : 'Restaurant POS System',
      category: language === 'bn' ? 'সফটওয়্যার' : 'Software',
      result: language === 'bn' ? '৫০% সময় সাশ্রয়' : '50% Time Saved',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      gradient: 'from-orange-600/90 to-amber-600/90',
    },
    {
      id: 3,
      title: language === 'bn' ? 'কর্পোরেট ওয়েবসাইট' : 'Corporate Website',
      category: language === 'bn' ? 'ওয়েব ডিজাইন' : 'Web Design',
      result: language === 'bn' ? '২০০% ট্রাফিক বৃদ্ধি' : '200% Traffic Increase',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      gradient: 'from-blue-600/90 to-cyan-600/90',
    },
    {
      id: 4,
      title: language === 'bn' ? 'ইনভেন্টরি ম্যানেজমেন্ট' : 'Inventory Management',
      category: language === 'bn' ? 'ERP সলিউশন' : 'ERP Solution',
      result: language === 'bn' ? '৪০% খরচ হ্রাস' : '40% Cost Reduction',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop',
      gradient: 'from-emerald-600/90 to-teal-600/90',
    },
    {
      id: 5,
      title: language === 'bn' ? 'ডিজিটাল মার্কেটিং' : 'Digital Marketing',
      category: language === 'bn' ? 'মার্কেটিং' : 'Marketing',
      result: language === 'bn' ? '৫x ROI অর্জন' : '5x ROI Achieved',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      gradient: 'from-pink-600/90 to-rose-600/90',
    },
    {
      id: 6,
      title: language === 'bn' ? 'মোবাইল অ্যাপ' : 'Mobile Application',
      category: language === 'bn' ? 'অ্যাপ ডেভেলপমেন্ট' : 'App Development',
      result: language === 'bn' ? '১০০K+ ডাউনলোড' : '100K+ Downloads',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
      gradient: 'from-indigo-600/90 to-violet-600/90',
    },
  ];

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <span>💼</span>
              {language === 'bn' ? 'আমাদের পোর্টফোলিও' : 'Our Portfolio'}
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-slide-up">
              {language === 'bn' ? (
                <>সাম্প্রতিক <span className="gradient-text">সফল প্রজেক্টসমূহ</span></>
              ) : (
                <>Recent <span className="gradient-text">Success Stories</span></>
              )}
            </h2>
            <p className="text-lg text-muted-foreground animate-slide-up delay-100">
              {language === 'bn'
                ? 'আমাদের ক্লায়েন্টদের সাফল্যের গল্প দেখুন'
                : 'See the success stories of our clients'}
            </p>
          </div>
          <Button variant="outline" size="lg" className="shrink-0 animate-slide-up delay-200" asChild>
            <Link to={`${basePath}/contact`}>
              {language === 'bn' ? 'সব প্রজেক্ট দেখুন' : 'View All Projects'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Portfolio Carousel */}
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full animate-slide-up delay-300"
        >
          <CarouselContent className="-ml-4">
            {projects.map((project) => (
              <CarouselItem key={project.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer card-shine">
                  {/* Image */}
                  <img
                    src={project.image}
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
                      {project.category}
                    </span>
                  </div>

                  {/* Result Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/90 text-white">
                      <TrendingUp className="w-3 h-3" />
                      {project.result}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
                      {project.title}
                    </h3>
                    <div className="flex items-center text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                      <span className="text-sm font-medium">
                        {language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}
                      </span>
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6" />
          <CarouselNext className="hidden md:flex -right-4 lg:-right-6" />
        </Carousel>

        {/* Stats Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up delay-400">
          {[
            { value: '500+', label: language === 'bn' ? 'সম্পন্ন প্রজেক্ট' : 'Projects Completed' },
            { value: '200+', label: language === 'bn' ? 'সন্তুষ্ট ক্লায়েন্ট' : 'Happy Clients' },
            { value: '10+', label: language === 'bn' ? 'বছরের অভিজ্ঞতা' : 'Years Experience' },
            { value: '50+', label: language === 'bn' ? 'এক্সপার্ট টিম' : 'Expert Team' },
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 rounded-2xl bg-secondary/30">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
