import React, { useState, useEffect } from 'react';
import { ShoppingCart, MessageCircle, X, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { EasyOrderModal } from './EasyOrderModal';

const WHATSAPP_NUMBER = '8801XXXXXXXXX'; // Replace with actual number

export function FloatingActions() {
  const { language } = useLanguage();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      language === 'bn'
        ? 'হ্যালো, আমি DigiWebDex এর সার্ভিস সম্পর্কে জানতে চাই।'
        : 'Hello, I want to know about DigiWebDex services.'
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Scroll to Top */}
        <Button
          size="icon"
          variant="outline"
          className={cn(
            'h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-sm transition-all duration-300',
            showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
          )}
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>

        {/* Expanded Actions */}
        <div
          className={cn(
            'flex flex-col gap-3 transition-all duration-300',
            isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          )}
        >
          {/* WhatsApp Button */}
          <Button
            className="h-12 gap-2 rounded-full shadow-lg bg-green-500 hover:bg-green-600 text-white px-4"
            onClick={openWhatsApp}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>

          {/* Order Now Button */}
          <Button
            className="h-12 gap-2 rounded-full shadow-lg gradient-button px-4"
            onClick={() => {
              setIsOrderModalOpen(true);
              setIsExpanded(false);
            }}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">{language === 'bn' ? 'অর্ডার করুন' : 'Order Now'}</span>
          </Button>
        </div>

        {/* Main Toggle Button */}
        <Button
          size="icon"
          className={cn(
            'h-14 w-14 rounded-full shadow-xl transition-all duration-300',
            isExpanded ? 'bg-destructive hover:bg-destructive/90' : 'gradient-button'
          )}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Close menu' : 'Open menu'}
        >
          {isExpanded ? (
            <X className="h-6 w-6" />
          ) : (
            <ShoppingCart className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Bottom Bar - Alternative for better mobile UX */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-sm border-t p-3 safe-area-inset-bottom">
        <div className="flex gap-3">
          <Button
            className="flex-1 gap-2 bg-green-500 hover:bg-green-600 text-white"
            onClick={openWhatsApp}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
          <Button
            className="flex-1 gap-2 gradient-button"
            onClick={() => setIsOrderModalOpen(true)}
          >
            <ShoppingCart className="h-4 w-4" />
            {language === 'bn' ? 'অর্ডার করুন' : 'Order Now'}
          </Button>
        </div>
      </div>

      {/* Easy Order Modal */}
      <EasyOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </>
  );
}
