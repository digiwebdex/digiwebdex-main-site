
-- Bundle discounts table for admin-managed bundle pricing rules
CREATE TABLE public.bundle_discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_bn TEXT,
  description TEXT,
  service_types TEXT[] NOT NULL,
  discount_percent NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bundle_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bundle discounts"
  ON public.bundle_discounts FOR ALL
  USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Anyone can view active bundle discounts"
  ON public.bundle_discounts FOR SELECT
  USING (is_active = true);

-- Cart items table for logged-in user cart persistence
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  service_id UUID REFERENCES public.services(id),
  package_id UUID REFERENCES public.service_packages(id),
  package_name TEXT,
  domain TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  qty INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart items"
  ON public.cart_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);

-- Updated_at trigger for bundle_discounts
CREATE TRIGGER update_bundle_discounts_updated_at
  BEFORE UPDATE ON public.bundle_discounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Updated_at trigger for cart_items
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
