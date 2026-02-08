-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'suspended', 'cancelled', 'pending', 'expired');

-- Create billing cycle enum
CREATE TYPE public.billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    service_type TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    billing_cycle public.billing_cycle NOT NULL DEFAULT 'monthly',
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'BDT',
    next_billing_date DATE NOT NULL,
    last_billing_date DATE,
    status public.subscription_status NOT NULL DEFAULT 'active',
    auto_renew BOOLEAN DEFAULT true,
    grace_period_days INTEGER DEFAULT 7,
    failed_billing_attempts INTEGER DEFAULT 0,
    suspended_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    metadata JSONB DEFAULT '{}',
    hosting_account_id UUID REFERENCES public.hosting_accounts(id) ON DELETE SET NULL,
    domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscription billing history table
CREATE TABLE public.subscription_billing_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    billing_date DATE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscription logs table for audit trail
CREATE TABLE public.subscription_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    old_status public.subscription_status,
    new_status public.subscription_status,
    details JSONB,
    performed_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admin/Staff can view all subscriptions"
    ON public.subscriptions FOR SELECT
    USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admin/Staff can manage subscriptions"
    ON public.subscriptions FOR ALL
    USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Users can update their own subscription auto_renew"
    ON public.subscriptions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for billing history
CREATE POLICY "Users can view their own billing history"
    ON public.subscription_billing_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.subscriptions s
            WHERE s.id = subscription_id AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Admin/Staff can view all billing history"
    ON public.subscription_billing_history FOR SELECT
    USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admin/Staff can manage billing history"
    ON public.subscription_billing_history FOR ALL
    USING (public.is_admin_or_staff(auth.uid()));

-- RLS Policies for subscription logs
CREATE POLICY "Users can view their own subscription logs"
    ON public.subscription_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.subscriptions s
            WHERE s.id = subscription_id AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Admin/Staff can view all subscription logs"
    ON public.subscription_logs FOR SELECT
    USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admin/Staff can manage subscription logs"
    ON public.subscription_logs FOR ALL
    USING (public.is_admin_or_staff(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_next_billing_date ON public.subscriptions(next_billing_date);
CREATE INDEX idx_subscription_billing_history_subscription_id ON public.subscription_billing_history(subscription_id);
CREATE INDEX idx_subscription_logs_subscription_id ON public.subscription_logs(subscription_id);

-- Add trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();