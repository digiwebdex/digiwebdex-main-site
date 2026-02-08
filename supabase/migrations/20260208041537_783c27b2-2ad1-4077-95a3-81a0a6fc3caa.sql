-- Create proposal status enum
CREATE TYPE public.proposal_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');

-- Create proposals table
CREATE TABLE public.proposals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_number TEXT NOT NULL UNIQUE,
    access_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT NOT NULL,
    service_type TEXT NOT NULL,
    package_name TEXT,
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_type TEXT DEFAULT 'fixed',
    discount_value NUMERIC(12,2) DEFAULT 0,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'BDT',
    description TEXT,
    timeline TEXT,
    deliverables JSONB DEFAULT '[]'::jsonb,
    payment_instructions TEXT,
    payment_link TEXT,
    status public.proposal_status NOT NULL DEFAULT 'draft',
    expiry_date TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    converted_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create proposal logs table for audit trail
CREATE TABLE public.proposal_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    performed_by UUID,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_proposals_lead_id ON public.proposals(lead_id);
CREATE INDEX idx_proposals_status ON public.proposals(status);
CREATE INDEX idx_proposals_created_by ON public.proposals(created_by);
CREATE INDEX idx_proposals_expiry_date ON public.proposals(expiry_date);
CREATE INDEX idx_proposals_access_token ON public.proposals(access_token);
CREATE INDEX idx_proposal_logs_proposal_id ON public.proposal_logs(proposal_id);

-- Enable RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for proposals
CREATE POLICY "Admin and staff can manage proposals"
ON public.proposals FOR ALL
USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Public can view proposals by access token"
ON public.proposals FOR SELECT
USING (true);

-- RLS Policies for proposal_logs
CREATE POLICY "Admin and staff can view proposal logs"
ON public.proposal_logs FOR SELECT
USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Allow inserting proposal logs"
ON public.proposal_logs FOR INSERT
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_proposals_updated_at
BEFORE UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate proposal number
CREATE OR REPLACE FUNCTION public.generate_proposal_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    new_number TEXT;
    year_prefix TEXT;
    next_seq INTEGER;
BEGIN
    year_prefix := 'PRO-' || TO_CHAR(NOW(), 'YYMM');
    SELECT COALESCE(MAX(SUBSTRING(proposal_number FROM 9)::INTEGER), 0) + 1
    INTO next_seq
    FROM public.proposals
    WHERE proposal_number LIKE year_prefix || '%';
    new_number := year_prefix || LPAD(next_seq::TEXT, 6, '0');
    RETURN new_number;
END;
$$;