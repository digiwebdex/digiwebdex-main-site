import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, Tag, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { createOrderWithItems, type OrderItem } from '@/services/multiItemOrderService';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';
import type { Database } from '@/integrations/supabase/types';

export function CartPanel() {
  const { items, isOpen, setIsOpen, subtotal, discountAmount, total, bundleDiscount, removeItem, updateQty, clearCart, itemCount } = useCart();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(amount);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (!user) {
      setIsOpen(false);
      navigate(`/${language}/auth/login`);
      toast({ title: language === 'bn' ? 'প্রথমে লগইন করুন' : 'Please login first' });
      return;
    }

    setCheckingOut(true);
    try {
      const orderItems: OrderItem[] = items.map(item => ({
        type: item.service_type as Database['public']['Enums']['service_type'],
        package: item.package_name,
        domain: item.domain,
        price: item.price * item.qty,
        qty: item.qty,
      }));

      const result = await createOrderWithItems({
        userId: user.id,
        items: orderItems,
        discount: discountAmount,
      });

      await clearCart();
      setIsOpen(false);
      toast({
        title: language === 'bn'
          ? `✅ অর্ডার তৈরি হয়েছে (${result.order.order_number})`
          : `✅ Order Created (${result.order.order_number})`,
      });
      navigate(`/${language}/dashboard/orders`);
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
    setCheckingOut(false);
  };

  const serviceTypeLabel = (type: string) => {
    const map: Record<string, { en: string; bn: string }> = {
      domain: { en: 'Domain', bn: 'ডোমেইন' },
      hosting: { en: 'Hosting', bn: 'হোস্টিং' },
      web_development: { en: 'Web Development', bn: 'ওয়েব ডেভেলপমেন্ট' },
      software_development: { en: 'Software', bn: 'সফটওয়্যার' },
      digital_marketing: { en: 'Digital Marketing', bn: 'ডিজিটাল মার্কেটিং' },
    };
    const label = map[type];
    return label ? (language === 'bn' ? label.bn : label.en) : type;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {language === 'bn' ? 'কার্ট' : 'Cart'} ({itemCount})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>{language === 'bn' ? 'কার্ট খালি' : 'Cart is empty'}</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg bg-card">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.package_name}</p>
                  <p className="text-xs text-muted-foreground">{serviceTypeLabel(item.service_type)}</p>
                  {item.domain && <p className="text-xs text-muted-foreground">{item.domain}</p>}
                  <p className="font-semibold text-sm mt-1">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(item.id, item.qty - 1)} disabled={item.qty <= 1}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm">{item.qty}</span>
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(item.id, item.qty + 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            {/* Summary */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {bundleDiscount && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {language === 'bn' ? bundleDiscount.name_bn || bundleDiscount.name_en : bundleDiscount.name_en}
                    ({bundleDiscount.discount_percent}%)
                  </span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-base pt-1 border-t">
                <span>{language === 'bn' ? 'মোট' : 'Total'}</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <SheetFooter className="flex-col gap-2 sm:flex-col">
              <Button className="w-full" size="lg" onClick={handleCheckout} disabled={checkingOut}>
                {checkingOut
                  ? (language === 'bn' ? 'প্রক্রিয়াধীন...' : 'Processing...')
                  : (language === 'bn' ? 'চেকআউট করুন' : 'Checkout')}
              </Button>
              <Button variant="ghost" className="w-full" onClick={clearCart}>
                {language === 'bn' ? 'কার্ট খালি করুন' : 'Clear Cart'}
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
