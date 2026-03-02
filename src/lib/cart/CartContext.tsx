import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface CartItem {
  id: string; // local UUID or DB id
  service_type: string;
  service_id?: string;
  package_id?: string;
  package_name: string;
  domain?: string;
  price: number;
  qty: number;
  metadata?: Record<string, unknown>;
}

export interface BundleDiscount {
  id: string;
  name_en: string;
  name_bn: string | null;
  service_types: string[];
  discount_percent: number;
}

interface CartContextType {
  items: CartItem[];
  bundleDiscount: BundleDiscount | null;
  subtotal: number;
  discountAmount: number;
  total: number;
  itemCount: number;
  isOpen: boolean;
  loading: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'digiwebdex_cart';

function generateLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [bundles, setBundles] = useState<BundleDiscount[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load bundles
  useEffect(() => {
    supabase
      .from('bundle_discounts')
      .select('id, name_en, name_bn, service_types, discount_percent')
      .eq('is_active', true)
      .then(({ data }) => {
        if (data) setBundles(data as BundleDiscount[]);
      });
  }, []);

  // Load cart from DB or localStorage
  useEffect(() => {
    if (user) {
      loadCartFromDB();
    } else {
      loadCartFromStorage();
    }
  }, [user]);

  const loadCartFromStorage = () => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch { /* ignore */ }
  };

  const saveCartToStorage = (cartItems: CartItem[]) => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  };

  const loadCartFromDB = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at');

    if (data) {
      const mapped: CartItem[] = data.map((d: any) => ({
        id: d.id,
        service_type: d.service_type,
        service_id: d.service_id,
        package_id: d.package_id,
        package_name: d.package_name || '',
        domain: d.domain,
        price: Number(d.price),
        qty: d.qty,
        metadata: d.metadata,
      }));
      setItems(mapped);

      // Also merge any localStorage cart items (from guest session)
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        try {
          const guestItems: CartItem[] = JSON.parse(stored);
          if (guestItems.length > 0) {
            const inserts = guestItems.map(gi => ({
              user_id: user.id,
              service_type: gi.service_type,
              service_id: gi.service_id || null,
              package_id: gi.package_id || null,
              package_name: gi.package_name,
              domain: gi.domain || null,
              price: gi.price,
              qty: gi.qty,
              metadata: (gi.metadata || {}) as any,
            }));
            await supabase.from('cart_items').insert(inserts);
            localStorage.removeItem(CART_STORAGE_KEY);
            // Reload from DB
            const { data: refreshed } = await supabase
              .from('cart_items')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at');
            if (refreshed) {
              setItems(refreshed.map((d: any) => ({
                id: d.id,
                service_type: d.service_type,
                service_id: d.service_id,
                package_id: d.package_id,
                package_name: d.package_name || '',
                domain: d.domain,
                price: Number(d.price),
                qty: d.qty,
                metadata: d.metadata,
              })));
            }
          }
        } catch { /* ignore */ }
      }
    }
    setLoading(false);
  };

  const syncToDB = useCallback(async (cartItems: CartItem[]) => {
    if (!user) {
      saveCartToStorage(cartItems);
      return;
    }
    // For simplicity, we handle individual add/remove ops inline
  }, [user]);

  const addItem = useCallback(async (item: Omit<CartItem, 'id'>) => {
    if (user) {
      const insertData = {
        user_id: user.id,
        service_type: item.service_type,
        service_id: item.service_id || null,
        package_id: item.package_id || null,
        package_name: item.package_name,
        domain: item.domain || null,
        price: item.price,
        qty: item.qty,
        metadata: (item.metadata || {}) as any,
      };
      const { data } = await supabase.from('cart_items').insert(insertData).select().single();

      if (data) {
        setItems(prev => [...prev, {
          id: data.id,
          service_type: data.service_type,
          service_id: data.service_id,
          package_id: data.package_id,
          package_name: data.package_name || '',
          domain: data.domain,
          price: Number(data.price),
          qty: data.qty,
          metadata: data.metadata as Record<string, unknown>,
        }]);
      }
    } else {
      const newItem: CartItem = { ...item, id: generateLocalId() };
      setItems(prev => {
        const updated = [...prev, newItem];
        saveCartToStorage(updated);
        return updated;
      });
    }
  }, [user]);

  const removeItem = useCallback(async (id: string) => {
    if (user && !id.startsWith('local_')) {
      await supabase.from('cart_items').delete().eq('id', id);
    }
    setItems(prev => {
      const updated = prev.filter(i => i.id !== id);
      if (!user) saveCartToStorage(updated);
      return updated;
    });
  }, [user]);

  const updateQty = useCallback(async (id: string, qty: number) => {
    if (qty < 1) return;
    if (user && !id.startsWith('local_')) {
      await supabase.from('cart_items').update({ qty }).eq('id', id);
    }
    setItems(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, qty } : i);
      if (!user) saveCartToStorage(updated);
      return updated;
    });
  }, [user]);

  const clearCart = useCallback(async () => {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
    }
    localStorage.removeItem(CART_STORAGE_KEY);
    setItems([]);
  }, [user]);

  const toggleCart = useCallback(() => setIsOpen(prev => !prev), []);

  // Calculate bundle discount
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const serviceTypesInCart = [...new Set(items.map(i => i.service_type))];

  let bestBundle: BundleDiscount | null = null;
  let bestDiscountPercent = 0;

  for (const bundle of bundles) {
    const allTypesPresent = bundle.service_types.every(t => serviceTypesInCart.includes(t));
    if (allTypesPresent && bundle.discount_percent > bestDiscountPercent) {
      bestBundle = bundle;
      bestDiscountPercent = bundle.discount_percent;
    }
  }

  const discountAmount = bestBundle ? Math.round(subtotal * bestDiscountPercent / 100) : 0;
  const total = subtotal - discountAmount;
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{
      items,
      bundleDiscount: bestBundle,
      subtotal,
      discountAmount,
      total,
      itemCount,
      isOpen,
      loading,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      toggleCart,
      setIsOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
