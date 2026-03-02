import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { Button } from '@/components/ui/button';

export function CartIcon() {
  const { itemCount, toggleCart } = useCart();

  if (itemCount === 0) return null;

  return (
    <Button
      onClick={toggleCart}
      size="icon"
      className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
    >
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Button>
  );
}
