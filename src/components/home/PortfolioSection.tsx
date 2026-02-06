import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function PortfolioSection() {
  const { language, t } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  const projects = [
    {
      id: 1,
      title: language === 'bn' ? 'ই-কমার্স প্ল্যাটফর্ম' : 'E-commerce Platform',
      category: language === 'bn' ? 'ওয়েব ডেভেলপমেন্ট' : 'Web Development',
      result: language === 'bn' ? '৩০০% বিক্রি বৃদ্ধি' : '300% Sales Increase',
      description: language === 'bn' 
        ? 'সম্পূর্ণ অটোমেটেড অর্ডার ম্যানেজমেন্ট সিস্টেম সহ ই-কমার্স প্ল্যাটফর্ম' 
        : 'Full e-commerce platform with automated order management',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
      gradient: 'from-blue-500/20 to-purple-500/20',
    },
    {
      id: 2,
      title: language === 'bn' ? 'এন্টারপ্রাইজ ERP সিস্টেম' : 'Enterprise ERP System',
      category: language === 'bn' ? 'সফটওয়্যার ডেভেলপমেন্ট' : 'Software Development',
      result: language === 'bn' ? '৫০% দক্ষতা বৃদ্ধি' : '50% Efficiency Boost',
      description: language === 'bn' 
        ? 'ইনভেন্টরি, অ্যাকাউন্টিং এবং HR ম্যানেজমেন্ট সিস্টেম' 
        : 'Inventory, Accounting and HR management system',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      gradient: 'from-green-500/20 to-teal-500/20',
    },
    {
      id: 3,
      title: language === 'bn' ? 'ডিজিটাল মার্কেটিং ক্যাম্পেইন' : 'Digital Marketing Campaign',
      category: language === 'bn' ? 'ডিজিটাল মার্কেটিং' : 'Digital Marketing',
      result: language === 'bn' ? '২০০% ট্রাফিক বৃদ্ধি' : '200% Traffic Growth',
      description: language === 'bn' 
        ? 'SEO এবং সোশ্যাল মিডিয়া মার্কেটিং ক্যাম্পেইন' 
        : 'SEO and social media marketing campaign',
      image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&h=400&fit=crop',
      gradient: 'from-orange-500/20 to-red-500/20',
    },
    {
      id: 4,
      title: language === 'bn' ? 'কর্পোরেট ওয়েবসাইট' : 'Corporate Website',
      category: language === 'bn' ? 'ওয়েব ডেভেলপমেন্ট' : 'Web Development',
      result: language === 'bn' ? '৫০০+ লিড জেনারেশন' : '500+ Lead Generation',
      description: language === 'bn' 
        ? 'মাল্টি-ল্যাঙ্গুয়েজ সাপোর্ট সহ কর্পোরেট ওয়েবসাইট' 
        : 'Corporate website with multi-language support',
      image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop',
      gradient: 'from-purple-500/20 to-pink-500/20',
    },
    {
      id: 5,
      title: language === 'bn' ? 'হোটেল বুকিং সিস্টেম' : 'Hotel Booking System',
      category: language === 'bn' ? 'সফটওয়্যার ডেভেলপমেন্ট' : 'Software Development',
      result: language === 'bn' ? '১০০% অটোমেশন' : '100% Automation',
      description: language === 'bn' 
        ? 'অনলাইন বুকিং ও পেমেন্ট ইন্টিগ্রেশন সিস্টেম' 
        : 'Online booking with payment integration',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
      gradient: 'from-cyan-500/20 to-blue-500/20',
    },
  ];

  return (
    <section className="section-padding bg-secondary/30" id="portfolio">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {language === 'bn' ? '💼 আমাদের কাজ' : '💼 Our Work'}
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">{language === 'bn' ? 'সাম্প্রতিক প্রজেক্ট' : 'Recent Projects'}</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            {language === 'bn' 
              ? 'আমাদের সফল প্রজেক্টগুলো দেখুন যা ক্লায়েন্টদের ব্যবসা বাড়িয়েছে' 
              : 'See our successful projects that grew client businesses'}
          </p>
        </div>

        {/* Portfolio Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {projects.map((project) => (
              <CarouselItem key={project.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden aspect-[4/3]">
                      {/* Image */}
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      {/* Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t ${project.gradient} to-transparent opacity-60`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium mb-2">
                          {project.category}
                        </span>
                        <h3 className="text-lg font-bold text-foreground mb-1">{project.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{project.description}</p>
                        <p className="text-primary font-bold text-sm">📈 {project.result}</p>
                      </div>

                      {/* Hover Link */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <ExternalLink className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-4 mt-8">
            <CarouselPrevious className="static translate-y-0 h-12 w-12" />
            <CarouselNext className="static translate-y-0 h-12 w-12" />
          </div>
        </Carousel>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Button size="lg" className="gradient-button h-12 px-8" asChild>
            <Link to={`${basePath}/portfolio`}>
              {language === 'bn' ? 'সব প্রজেক্ট দেখুন' : 'View All Projects'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
