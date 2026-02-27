
CREATE TABLE public.phone_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookup
CREATE INDEX idx_phone_otps_phone_expires ON public.phone_otps (phone, expires_at);

-- Auto-cleanup old OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.phone_otps WHERE expires_at < NOW() - INTERVAL '1 hour';
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_cleanup_otps
  AFTER INSERT ON public.phone_otps
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.cleanup_expired_otps();

-- RLS: only edge functions (service role) access this table
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;
