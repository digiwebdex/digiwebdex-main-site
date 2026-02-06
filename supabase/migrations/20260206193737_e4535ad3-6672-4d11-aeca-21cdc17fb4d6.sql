-- Create affiliate status enum
CREATE TYPE public.affiliate_status AS ENUM ('pending', 'active', 'suspended', 'rejected');

-- Create commission status enum
CREATE TYPE public.commission_status AS ENUM ('pending', 'approved', 'paid', 'cancelled');

-- Create withdrawal status enum
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'rejected');

-- Affiliates table
CREATE TABLE public.affiliates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    referral_code TEXT NOT NULL UNIQUE,
    commission_rate NUMERIC NOT NULL DEFAULT 10,
    status affiliate_status NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    payment_details JSONB DEFAULT '{}',
    total_clicks INTEGER NOT NULL DEFAULT 0,
    total_conversions INTEGER NOT NULL DEFAULT 0,
    total_earnings NUMERIC NOT NULL DEFAULT 0,
    pending_earnings NUMERIC NOT NULL DEFAULT 0,
    withdrawable_earnings NUMERIC NOT NULL DEFAULT 0,
    withdrawn_earnings NUMERIC NOT NULL DEFAULT 0,
    grace_period_days INTEGER NOT NULL DEFAULT 30,
    min_withdrawal_amount NUMERIC NOT NULL DEFAULT 500,
    notes TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Affiliate clicks tracking
CREATE TABLE public.affiliate_clicks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    referrer_url TEXT,
    landing_page TEXT,
    country TEXT,
    device_type TEXT,
    converted BOOLEAN NOT NULL DEFAULT false,
    conversion_order_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Affiliate commissions
CREATE TABLE public.affiliate_commissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    click_id UUID REFERENCES public.affiliate_clicks(id),
    order_amount NUMERIC NOT NULL,
    commission_rate NUMERIC NOT NULL,
    commission_amount NUMERIC NOT NULL,
    status commission_status NOT NULL DEFAULT 'pending',
    grace_period_ends_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Affiliate withdrawals
CREATE TABLE public.affiliate_withdrawals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    payment_details JSONB DEFAULT '{}',
    status withdrawal_status NOT NULL DEFAULT 'pending',
    transaction_id TEXT,
    processed_by UUID,
    processed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_withdrawals ENABLE ROW LEVEL SECURITY;

-- Affiliates policies
CREATE POLICY "Users can view own affiliate profile"
ON public.affiliates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own affiliate profile"
ON public.affiliates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate profile"
ON public.affiliates FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all affiliates"
ON public.affiliates FOR SELECT
USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can manage affiliates"
ON public.affiliates FOR UPDATE
USING (is_admin_or_staff(auth.uid()));

-- Affiliate clicks policies
CREATE POLICY "Affiliates can view own clicks"
ON public.affiliate_clicks FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.affiliates
    WHERE affiliates.id = affiliate_clicks.affiliate_id
    AND affiliates.user_id = auth.uid()
));

CREATE POLICY "Anyone can insert clicks"
ON public.affiliate_clicks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all clicks"
ON public.affiliate_clicks FOR SELECT
USING (is_admin_or_staff(auth.uid()));

-- Affiliate commissions policies
CREATE POLICY "Affiliates can view own commissions"
ON public.affiliate_commissions FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.affiliates
    WHERE affiliates.id = affiliate_commissions.affiliate_id
    AND affiliates.user_id = auth.uid()
));

CREATE POLICY "Admins can view all commissions"
ON public.affiliate_commissions FOR SELECT
USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can manage commissions"
ON public.affiliate_commissions FOR UPDATE
USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "System can insert commissions"
ON public.affiliate_commissions FOR INSERT
WITH CHECK (true);

-- Affiliate withdrawals policies
CREATE POLICY "Affiliates can view own withdrawals"
ON public.affiliate_withdrawals FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.affiliates
    WHERE affiliates.id = affiliate_withdrawals.affiliate_id
    AND affiliates.user_id = auth.uid()
));

CREATE POLICY "Affiliates can request withdrawals"
ON public.affiliate_withdrawals FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.affiliates
    WHERE affiliates.id = affiliate_withdrawals.affiliate_id
    AND affiliates.user_id = auth.uid()
    AND affiliates.status = 'active'
));

CREATE POLICY "Admins can view all withdrawals"
ON public.affiliate_withdrawals FOR SELECT
USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can manage withdrawals"
ON public.affiliate_withdrawals FOR UPDATE
USING (is_admin_or_staff(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX idx_affiliates_referral_code ON public.affiliates(referral_code);
CREATE INDEX idx_affiliates_status ON public.affiliates(status);
CREATE INDEX idx_affiliate_clicks_affiliate_id ON public.affiliate_clicks(affiliate_id);
CREATE INDEX idx_affiliate_clicks_created_at ON public.affiliate_clicks(created_at);
CREATE INDEX idx_affiliate_clicks_ip ON public.affiliate_clicks(ip_address);
CREATE INDEX idx_affiliate_commissions_affiliate_id ON public.affiliate_commissions(affiliate_id);
CREATE INDEX idx_affiliate_commissions_status ON public.affiliate_commissions(status);
CREATE INDEX idx_affiliate_commissions_order_id ON public.affiliate_commissions(order_id);
CREATE INDEX idx_affiliate_withdrawals_affiliate_id ON public.affiliate_withdrawals(affiliate_id);
CREATE INDEX idx_affiliate_withdrawals_status ON public.affiliate_withdrawals(status);

-- Add triggers for updated_at
CREATE TRIGGER update_affiliates_updated_at
BEFORE UPDATE ON public.affiliates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_commissions_updated_at
BEFORE UPDATE ON public.affiliate_commissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_withdrawals_updated_at
BEFORE UPDATE ON public.affiliate_withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate 8-character alphanumeric code
        new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 8));
        
        -- Check if code already exists
        SELECT EXISTS (
            SELECT 1 FROM public.affiliates WHERE referral_code = new_code
        ) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$;