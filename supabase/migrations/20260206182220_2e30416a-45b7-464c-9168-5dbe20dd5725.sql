-- Create manual_payments table for manual payment submissions
CREATE TABLE public.manual_payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    user_id UUID NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('bkash_personal', 'bank_transfer')),
    transaction_id TEXT NOT NULL,
    sender_number TEXT,
    amount NUMERIC NOT NULL,
    screenshot_url TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_manual_payments_user_id ON public.manual_payments(user_id);
CREATE INDEX idx_manual_payments_status ON public.manual_payments(status);
CREATE INDEX idx_manual_payments_order_id ON public.manual_payments(order_id);

-- Enable RLS
ALTER TABLE public.manual_payments ENABLE ROW LEVEL SECURITY;

-- Users can create their own manual payments
CREATE POLICY "Users can create own manual payments"
ON public.manual_payments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own manual payments
CREATE POLICY "Users can view own manual payments"
ON public.manual_payments
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own pending manual payments (e.g., add screenshot)
CREATE POLICY "Users can update own pending payments"
ON public.manual_payments
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admins can view all manual payments
CREATE POLICY "Admins can view all manual payments"
ON public.manual_payments
FOR SELECT
USING (is_admin_or_staff(auth.uid()));

-- Admins can manage (approve/reject) all manual payments
CREATE POLICY "Admins can manage manual payments"
ON public.manual_payments
FOR UPDATE
USING (is_admin_or_staff(auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_manual_payments_updated_at
BEFORE UPDATE ON public.manual_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payment-proofs',
    'payment-proofs',
    false,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Storage policies for payment proofs
CREATE POLICY "Users can upload own payment proofs"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'payment-proofs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own payment proofs"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'payment-proofs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all payment proofs"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'payment-proofs' 
    AND is_admin_or_staff(auth.uid())
);