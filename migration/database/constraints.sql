-- DigiWebDex Constraints SQL
-- Foreign keys and unique constraints

-- Note: Most constraints are already defined in schema.sql
-- This file contains additional constraints that may be needed

-- Ensure unique email in users table
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_email_unique UNIQUE (email);

-- Ensure order numbers are unique
ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS orders_order_number_unique UNIQUE (order_number);

-- Ensure invoice numbers are unique  
ALTER TABLE invoices ADD CONSTRAINT IF NOT EXISTS invoices_invoice_number_unique UNIQUE (invoice_number);

-- Ensure ticket numbers are unique
ALTER TABLE support_tickets ADD CONSTRAINT IF NOT EXISTS support_tickets_ticket_number_unique UNIQUE (ticket_number);

-- Ensure proposal numbers are unique
ALTER TABLE proposals ADD CONSTRAINT IF NOT EXISTS proposals_proposal_number_unique UNIQUE (proposal_number);

-- Ensure domain names are unique
ALTER TABLE domains ADD CONSTRAINT IF NOT EXISTS domains_domain_name_unique UNIQUE (domain_name);

-- Ensure affiliate referral codes are unique
ALTER TABLE affiliates ADD CONSTRAINT IF NOT EXISTS affiliates_referral_code_unique UNIQUE (referral_code);

-- Ensure coupon codes are unique
ALTER TABLE coupons ADD CONSTRAINT IF NOT EXISTS coupons_code_unique UNIQUE (code);

-- Ensure blog post slugs are unique
ALTER TABLE blog_posts ADD CONSTRAINT IF NOT EXISTS blog_posts_slug_unique UNIQUE (slug);

-- Ensure case study slugs are unique
ALTER TABLE case_studies ADD CONSTRAINT IF NOT EXISTS case_studies_slug_unique UNIQUE (slug);

-- Ensure landing page slugs are unique
ALTER TABLE landing_pages ADD CONSTRAINT IF NOT EXISTS landing_pages_slug_unique UNIQUE (slug);

-- Ensure location page slugs are unique
ALTER TABLE location_pages ADD CONSTRAINT IF NOT EXISTS location_pages_slug_unique UNIQUE (slug);

-- Ensure service slugs are unique
ALTER TABLE services ADD CONSTRAINT IF NOT EXISTS services_slug_unique UNIQUE (slug);

-- Check constraints for positive amounts
ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS orders_total_positive CHECK (total >= 0);
ALTER TABLE invoices ADD CONSTRAINT IF NOT EXISTS invoices_total_positive CHECK (total >= 0);
ALTER TABLE payments ADD CONSTRAINT IF NOT EXISTS payments_amount_positive CHECK (amount >= 0);
ALTER TABLE affiliate_commissions ADD CONSTRAINT IF NOT EXISTS commissions_amount_positive CHECK (commission_amount >= 0);

-- Check constraint for valid email format (basic)
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
