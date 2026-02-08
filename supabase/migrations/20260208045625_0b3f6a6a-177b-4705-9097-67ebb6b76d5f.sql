-- Create enums for reseller system
CREATE TYPE public.reseller_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE public.earning_status AS ENUM ('pending', 'approved', 'paid');
CREATE TYPE public.commission_type AS ENUM ('fixed', 'percentage');

-- Create resellers table
CREATE TABLE public.resellers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  brand_color TEXT DEFAULT '#3b82f6',
  commission_type public.commission_type NOT NULL DEFAULT 'percentage',
  commission_rate NUMERIC NOT NULL DEFAULT 10,
  balance NUMERIC NOT NULL DEFAULT 0,
  pending_earnings NUMERIC NOT NULL DEFAULT 0,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  withdrawn_earnings NUMERIC NOT NULL DEFAULT 0,
  min_withdrawal_amount NUMERIC NOT NULL DEFAULT 1000,
  status public.reseller_status NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  notes TEXT,
  payment_method TEXT,
  payment_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_reseller_user UNIQUE (user_id)
);

-- Create reseller_clients table (clients under a reseller)
CREATE TABLE public.reseller_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
  client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_reseller_client UNIQUE (reseller_id, client_user_id),
  CONSTRAINT unique_client_reseller UNIQUE (client_user_id)
);

-- Create reseller_earnings table
CREATE TABLE public.reseller_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  client_user_id UUID REFERENCES auth.users(id),
  order_amount NUMERIC NOT NULL,
  commission_type public.commission_type NOT NULL,
  commission_rate NUMERIC NOT NULL,
  earning_amount NUMERIC NOT NULL,
  status public.earning_status NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reseller_withdrawals table
CREATE TABLE public.reseller_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_details JSONB DEFAULT '{}'::jsonb,
  status public.withdrawal_status NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reseller_logs table for audit trail
CREATE TABLE public.reseller_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add reseller role to app_role enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'reseller' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'reseller';
  END IF;
END$$;

-- Create indexes
CREATE INDEX idx_resellers_user_id ON public.resellers(user_id);
CREATE INDEX idx_resellers_status ON public.resellers(status);
CREATE INDEX idx_reseller_clients_reseller_id ON public.reseller_clients(reseller_id);
CREATE INDEX idx_reseller_clients_client_user_id ON public.reseller_clients(client_user_id);
CREATE INDEX idx_reseller_earnings_reseller_id ON public.reseller_earnings(reseller_id);
CREATE INDEX idx_reseller_earnings_status ON public.reseller_earnings(status);
CREATE INDEX idx_reseller_withdrawals_reseller_id ON public.reseller_withdrawals(reseller_id);
CREATE INDEX idx_reseller_withdrawals_status ON public.reseller_withdrawals(status);

-- Enable RLS
ALTER TABLE public.resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resellers
CREATE POLICY "Users can view own reseller profile" ON public.resellers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reseller profile" ON public.resellers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reseller profile" ON public.resellers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all resellers" ON public.resellers
  FOR SELECT USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can manage resellers" ON public.resellers
  FOR ALL USING (is_admin_or_staff(auth.uid()));

-- RLS Policies for reseller_clients
CREATE POLICY "Resellers can view own clients" ON public.reseller_clients
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.resellers WHERE id = reseller_clients.reseller_id AND user_id = auth.uid())
  );

CREATE POLICY "Resellers can add clients" ON public.reseller_clients
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.resellers WHERE id = reseller_clients.reseller_id AND user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Admins can manage reseller clients" ON public.reseller_clients
  FOR ALL USING (is_admin_or_staff(auth.uid()));

-- RLS Policies for reseller_earnings
CREATE POLICY "Resellers can view own earnings" ON public.reseller_earnings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.resellers WHERE id = reseller_earnings.reseller_id AND user_id = auth.uid())
  );

CREATE POLICY "System can insert earnings" ON public.reseller_earnings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage earnings" ON public.reseller_earnings
  FOR ALL USING (is_admin_or_staff(auth.uid()));

-- RLS Policies for reseller_withdrawals
CREATE POLICY "Resellers can view own withdrawals" ON public.reseller_withdrawals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.resellers WHERE id = reseller_withdrawals.reseller_id AND user_id = auth.uid())
  );

CREATE POLICY "Resellers can request withdrawals" ON public.reseller_withdrawals
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.resellers WHERE id = reseller_withdrawals.reseller_id AND user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Admins can manage withdrawals" ON public.reseller_withdrawals
  FOR ALL USING (is_admin_or_staff(auth.uid()));

-- RLS Policies for reseller_logs
CREATE POLICY "Resellers can view own logs" ON public.reseller_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.resellers WHERE id = reseller_logs.reseller_id AND user_id = auth.uid())
  );

CREATE POLICY "System can insert logs" ON public.reseller_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all logs" ON public.reseller_logs
  FOR SELECT USING (is_admin_or_staff(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_resellers_updated_at
  BEFORE UPDATE ON public.resellers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reseller_earnings_updated_at
  BEFORE UPDATE ON public.reseller_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reseller_withdrawals_updated_at
  BEFORE UPDATE ON public.reseller_withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for reseller logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('reseller-logos', 'reseller-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for reseller logos
CREATE POLICY "Public can view reseller logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'reseller-logos');

CREATE POLICY "Resellers can upload own logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reseller-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Resellers can update own logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'reseller-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Resellers can delete own logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'reseller-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);