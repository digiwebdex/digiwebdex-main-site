-- Fix function search path warnings
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    new_number TEXT;
    year_prefix TEXT;
    next_seq INTEGER;
BEGIN
    year_prefix := TO_CHAR(NOW(), 'YYMM');
    SELECT COALESCE(MAX(SUBSTRING(order_number FROM 5)::INTEGER), 0) + 1
    INTO next_seq
    FROM public.orders
    WHERE order_number LIKE year_prefix || '%';
    new_number := year_prefix || LPAD(next_seq::TEXT, 6, '0');
    RETURN new_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    new_number TEXT;
    year_prefix TEXT;
    next_seq INTEGER;
BEGIN
    year_prefix := 'INV-' || TO_CHAR(NOW(), 'YYMM');
    SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM 9)::INTEGER), 0) + 1
    INTO next_seq
    FROM public.invoices
    WHERE invoice_number LIKE year_prefix || '%';
    new_number := year_prefix || LPAD(next_seq::TEXT, 6, '0');
    RETURN new_number;
END;
$$;

-- Fix overly permissive audit_logs INSERT policy
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs 
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);