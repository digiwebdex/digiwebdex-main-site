import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export function TestimonialsSection() {
  const { language } = useLanguage();

  const testimonials = [
    {
      id: 1,
      name: language === 'bn' ? 'রহিম উদ্দিন' : 'Rahim Uddin',
      role: language === 'bn' ? 'ই-কমার্স উদ্যোক্তা' : 'E-commerce Entrepreneur',
      company: 'ShopBD',
      image: 'https://i.pravatar.cc/150?img=1',
      content: language === 'bn' 
        ? 'Digiwebdex আমার ই-কমার্স সাইট বানিয়ে দিয়েছে যা আমার বিক্রি ৩০০% বাড়িয়ে দিয়েছে। তাদের সার্ভিস অসাধারণ!' 
        : 'Digiwebdex built my e-commerce site which increased my sales by 300%. Their service is amazing!',
      rating: 5,
    },
    {
      id: 2,
      name: language === 'bn' ? 'সারা আহমেদ' : 'Sara Ahmed',
      role: language === 'bn' ? 'স্টার্টআপ ফাউন্ডার' : 'Startup Founder',
      company: 'TechStart',
      image: 'https://i.pravatar.cc/150?img=5',
      content: language === 'bn' 
        ? 'তাদের কাস্টম সফটওয়্যার সলিউশন আমাদের অপারেশন ৫০% দ্রুত করে দিয়েছে। চমৎকার টিম!' 
        : 'Their custom software solution made our operations 50% faster. Excellent team!',
      rating: 5,
    },
    {
      id: 3,
      name: language === 'bn' ? 'করিম সাহেব' : 'Karim Saheb',
      role: language === 'bn' ? 'ব্যবসায়ী' : 'Business Owner',
      company: 'Karim Industries',
      image: 'https://i.pravatar.cc/150?img=3',
      content: language === 'bn' 
        ? '২৪/৭ সাপোর্ট সত্যিই চমৎকার। যেকোনো সমস্যায় দ্রুত সমাধান পাই। হাইলি রেকমেন্ডেড!' 
        : '24/7 support is truly excellent. Quick solutions for any problem. Highly recommended!',
      rating: 5,
    },
    {
      id: 4,
      name: language === 'bn' ? 'নাসরিন বেগম' : 'Nasreen Begum',
      role: language === 'bn' ? 'রেস্টুরেন্ট মালিক' : 'Restaurant Owner',
      company: 'Dhaka Dine',
      image: 'https://i.pravatar.cc/150?img=9',
      content: language === 'bn' 
        ? 'ওয়েবসাইট ও অনলাইন অর্ডার সিস্টেম আমার রেস্টুরেন্টের আয় দ্বিগুণ করেছে। ধন্যবাদ Digiwebdex!' 
        : 'Website & online order system doubled my restaurant revenue. Thank you Digiwebdex!',
      rating: 5,
    },
    {
      id: 5,
      name: language === 'bn' ? 'আবুল হাসান' : 'Abul Hasan',
      role: language === 'bn' ? 'ডিজিটাল মার্কেটার' : 'Digital Marketer',
      company: 'Growth Agency',
      image: 'https://i.pravatar.cc/150?img=7',
      content: language === 'bn' 
        ? 'তাদের SEO সার্ভিসে আমার ক্লায়েন্টদের ওয়েবসাইট গুগলে প্রথম পেজে! প্রফেশনাল সার্ভিস।' 
        : 'Their SEO service got my clients websites on Google first page! Professional service.',
      rating: 5,
    },
  ];

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <section className="section-padding bg-secondary/30" id="testimonials">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {language === 'bn' ? '💬 ক্লায়েন্ট রিভিউ' : '💬 Client Reviews'}
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">
            {language === 'bn' ? 'ক্লায়েন্টরা কী বলছেন' : 'What Clients Say'}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            {language === 'bn' 
              ? 'আমাদের সন্তুষ্ট ক্লায়েন্টদের মতামত পড়ুন' 
              : 'Read what our satisfied clients have to say'}
          </p>
        </div>

        {/* Testimonials Slider */}
        <Carousel
          plugins={[plugin.current]}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="h-full glass-card border-transparent hover:border-primary/20 transition-all duration-300">
                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Quote Icon */}
                    <Quote className="h-10 w-10 text-primary/20 mb-4" />
                    
                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-muted-foreground mb-6 flex-grow italic">
                      "{testimonial.content}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                        <AvatarImage src={testimonial.image} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        <p className="text-xs text-primary">{testimonial.company}</p>
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
      </div>
    </section>
  );
}
