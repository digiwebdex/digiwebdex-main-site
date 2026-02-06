import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Star, Quote } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

export function TestimonialsSection() {
  const { language } = useLanguage();
  
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const testimonials = [
    {
      id: 1,
      name: language === 'bn' ? 'মো. রাশেদুল ইসলাম' : 'Md. Rashedul Islam',
      role: language === 'bn' ? 'সিইও, ফ্যাশন হাউজ বিডি' : 'CEO, Fashion House BD',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      rating: 5,
      text: language === 'bn'
        ? 'Digiwebdex আমাদের ই-কমার্স সাইট তৈরি করেছে এবং বিক্রয় ৩ গুণ বেড়েছে! তাদের টিম অত্যন্ত প্রফেশনাল এবং ডেডলাইন মেনে কাজ করে।'
        : 'Digiwebdex built our e-commerce site and sales increased 3x! Their team is highly professional and meets deadlines.',
    },
    {
      id: 2,
      name: language === 'bn' ? 'ফাতেমা আক্তার' : 'Fatema Akter',
      role: language === 'bn' ? 'ম্যানেজার, রেস্টুরেন্ট চেইন' : 'Manager, Restaurant Chain',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      rating: 5,
      text: language === 'bn'
        ? 'তাদের POS সিস্টেম আমাদের রেস্টুরেন্ট ম্যানেজমেন্টকে সম্পূর্ণ বদলে দিয়েছে। এখন সব কিছু অটোমেটেড এবং সহজ।'
        : 'Their POS system completely transformed our restaurant management. Everything is now automated and easy.',
    },
    {
      id: 3,
      name: language === 'bn' ? 'তানভীর হোসেন' : 'Tanvir Hossen',
      role: language === 'bn' ? 'ফাউন্ডার, টেক স্টার্টআপ' : 'Founder, Tech Startup',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      rating: 5,
      text: language === 'bn'
        ? 'সেরা ডিজিটাল এজেন্সি! তাদের SEO সার্ভিসে আমাদের ওয়েবসাইট এখন গুগলে প্রথম পেজে। বিশ্বাস করার মতো ফলাফল।'
        : 'Best digital agency! Their SEO service got our website on Google\'s first page. Incredible results.',
    },
    {
      id: 4,
      name: language === 'bn' ? 'নাফিসা রহমান' : 'Nafisa Rahman',
      role: language === 'bn' ? 'মালিক, বুটিক শপ' : 'Owner, Boutique Shop',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      rating: 5,
      text: language === 'bn'
        ? 'আমার ছোট ব্যবসার জন্য তারা যে ওয়েবসাইট তৈরি করেছে তা অসাধারণ! সাপোর্টও খুব দ্রুত এবং বাংলায়।'
        : 'The website they created for my small business is amazing! Support is also fast and in Bengali.',
    },
    {
      id: 5,
      name: language === 'bn' ? 'সাকিব আল হাসান' : 'Sakib Al Hasan',
      role: language === 'bn' ? 'ডিরেক্টর, লজিস্টিক কোম্পানি' : 'Director, Logistics Company',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      rating: 5,
      text: language === 'bn'
        ? 'তাদের ERP সলিউশন আমাদের পুরো অপারেশনকে স্ট্রিমলাইন করেছে। এখন সব কিছু একটা প্ল্যাটফর্মে। অসাধারণ টিম!'
        : 'Their ERP solution streamlined our entire operation. Everything is now on one platform. Amazing team!',
    },
  ];

  return (
    <section className="section-padding bg-secondary/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-secondary/10 blur-3xl" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <span>💬</span>
            {language === 'bn' ? 'ক্লায়েন্ট রিভিউ' : 'Client Reviews'}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-slide-up">
            {language === 'bn' ? (
              <>আমাদের ক্লায়েন্টরা <span className="gradient-text">কী বলেন</span></>
            ) : (
              <>What Our <span className="gradient-text">Clients Say</span></>
            )}
          </h2>
          <p className="text-lg text-muted-foreground animate-slide-up delay-100">
            {language === 'bn'
              ? 'বাংলাদেশের সফল ব্যবসায়ীদের মতামত দেখুন'
              : 'See what successful businesses in Bangladesh have to say'}
          </p>
        </div>

        {/* Testimonials Carousel */}
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          plugins={[autoplayPlugin.current]}
          className="w-full max-w-6xl mx-auto animate-slide-up delay-200"
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="h-full glass-card p-8 flex flex-col">
                  {/* Quote Icon */}
                  <Quote className="w-10 h-10 text-primary/20 mb-4" />

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-muted-foreground flex-grow mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    <div>
                      <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 lg:-left-12" />
          <CarouselNext className="hidden md:flex -right-4 lg:-right-12" />
        </Carousel>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 animate-slide-up delay-400">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-bold text-foreground">4.9/5</span>
            <span className="text-muted-foreground">
              {language === 'bn' ? '(২০০+ রিভিউ)' : '(200+ reviews)'}
            </span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="text-muted-foreground">
            {language === 'bn' ? '🏆 বাংলাদেশের শীর্ষ ডিজিটাল এজেন্সি' : '🏆 Top Digital Agency in Bangladesh'}
          </div>
        </div>
      </div>
    </section>
  );
}
