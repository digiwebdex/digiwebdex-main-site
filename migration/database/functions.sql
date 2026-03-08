-- DigiWebDex Database Functions
-- Generated for self-hosted PostgreSQL migration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function: Generate Order Number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
    new_number TEXT;
    year_prefix TEXT;
    next_seq INTEGER;
BEGIN
    year_prefix := TO_CHAR(NOW(), 'YYMM');
    SELECT COALESCE(MAX(SUBSTRING(order_number FROM 5)::INTEGER), 0) + 1
    INTO next_seq
    FROM orders
    WHERE order_number LIKE year_prefix || '%';
    new_number := year_prefix || LPAD(next_seq::TEXT, 6, '0');
    RETURN new_number;
END;
$$;

-- Function: Generate Invoice Number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
    new_number TEXT;
    year_prefix TEXT;
    next_seq INTEGER;
BEGIN
    year_prefix := 'INV-' || TO_CHAR(NOW(), 'YYMM');
    SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM 9)::INTEGER), 0) + 1
    INTO next_seq
    FROM invoices
    WHERE invoice_number LIKE year_prefix || '%';
    new_number := year_prefix || LPAD(next_seq::TEXT, 6, '0');
    RETURN new_number;
END;
$$;

-- Function: Generate Proposal Number
CREATE OR REPLACE FUNCTION generate_proposal_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
    new_number TEXT;
    year_prefix TEXT;
    next_seq INTEGER;
BEGIN
    year_prefix := 'PRO-' || TO_CHAR(NOW(), 'YYMM');
    SELECT COALESCE(MAX(SUBSTRING(proposal_number FROM 9)::INTEGER), 0) + 1
    INTO next_seq
    FROM proposals
    WHERE proposal_number LIKE year_prefix || '%';
    new_number := year_prefix || LPAD(next_seq::TEXT, 6, '0');
    RETURN new_number;
END;
$$;

-- Function: Generate Ticket Number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
    new_number TEXT;
    year_prefix TEXT;
    next_seq INTEGER;
BEGIN
    year_prefix := 'TKT-' || TO_CHAR(NOW(), 'YYMM');
    SELECT COALESCE(MAX(SUBSTRING(ticket_number FROM 9)::INTEGER), 0) + 1
    INTO next_seq
    FROM support_tickets
    WHERE ticket_number LIKE year_prefix || '%';
    new_number := year_prefix || LPAD(next_seq::TEXT, 6, '0');
    RETURN new_number;
END;
$$;

-- Function: Generate Referral Code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 8));
        SELECT EXISTS (
            SELECT 1 FROM affiliates WHERE referral_code = new_code
        ) INTO code_exists;
        EXIT WHEN NOT code_exists;
    END LOOP;
    RETURN new_code;
END;
$$;

-- Function: Update Updated At Column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Function: Set Ticket Number
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$;

-- Function: Calculate SLA Due At
CREATE OR REPLACE FUNCTION calculate_sla_due_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    IF NEW.sla_due_at IS NULL THEN
        CASE NEW.priority
            WHEN 'urgent' THEN NEW.sla_due_at := NOW() + INTERVAL '4 hours';
            WHEN 'high' THEN NEW.sla_due_at := NOW() + INTERVAL '8 hours';
            WHEN 'medium' THEN NEW.sla_due_at := NOW() + INTERVAL '24 hours';
            WHEN 'low' THEN NEW.sla_due_at := NOW() + INTERVAL '48 hours';
        END CASE;
    END IF;
    RETURN NEW;
END;
$$;

-- Function: Cleanup Expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    DELETE FROM phone_otps WHERE expires_at < NOW() - INTERVAL '1 hour';
    RETURN NEW;
END;
$$;

-- Function: Has Role
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;

-- Function: Is Admin Or Staff
CREATE OR REPLACE FUNCTION is_admin_or_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = _user_id
        AND role IN ('admin', 'staff')
    )
$$;

-- Function: Has Permission
CREATE OR REPLACE FUNCTION has_permission(_user_id UUID, _module TEXT, _action TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role = rp.role
        WHERE ur.user_id = _user_id
          AND rp.module = _module
          AND rp.action = _action
          AND rp.allowed = true
    )
$$;

-- Function: Update Customer Balance
CREATE OR REPLACE FUNCTION update_customer_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    UPDATE profiles
    SET balance_due = COALESCE((
        SELECT SUM(COALESCE(due_amount, 0))
        FROM invoices
        WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
          AND status IN ('unpaid', 'partial', 'overdue')
    ), 0)
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function: Auto Generate Invoice
CREATE OR REPLACE FUNCTION auto_generate_invoice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    new_invoice_number TEXT;
    adv NUMERIC;
    due NUMERIC;
BEGIN
    new_invoice_number := generate_invoice_number();
    adv := COALESCE(NEW.advance_payment, 0);
    due := NEW.total - adv;

    INSERT INTO invoices (
        invoice_number, order_id, user_id,
        subtotal, discount, tax, total,
        advance_paid, due_amount,
        status, due_date, currency
    ) VALUES (
        new_invoice_number, NEW.id, NEW.user_id,
        NEW.subtotal, COALESCE(NEW.discount, 0), COALESCE(NEW.tax, 0), NEW.total,
        adv, due,
        (CASE
            WHEN due <= 0 THEN 'paid'::invoice_status
            WHEN adv > 0 THEN 'partial'::invoice_status
            ELSE 'unpaid'::invoice_status
        END),
        (CURRENT_DATE + INTERVAL '7 days')::DATE,
        'BDT'
    );

    RETURN NEW;
END;
$$;

-- Function: Check Order Delete Integrity
CREATE OR REPLACE FUNCTION check_order_delete_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM invoices
        WHERE order_id = OLD.id AND status = 'paid'
    ) THEN
        RAISE EXCEPTION 'Cannot delete order with paid invoices. Cancel or refund invoices first.';
    END IF;
    DELETE FROM invoices WHERE order_id = OLD.id AND status != 'paid';
    RETURN OLD;
END;
$$;

-- Function: Increment Page Views
CREATE OR REPLACE FUNCTION increment_page_views(page_table TEXT, page_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    EXECUTE format('UPDATE %I SET views_count = views_count + 1 WHERE id = $1', page_table)
    USING page_id;
END;
$$;

-- Function: Update Sitemap Entry
CREATE OR REPLACE FUNCTION update_sitemap_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        INSERT INTO sitemap_entries (url, last_modified, page_type, entity_id, priority, change_frequency)
        VALUES (
            '/' || NEW.slug,
            NOW(),
            TG_ARGV[0],
            NEW.id,
            COALESCE(NEW.priority, 0.5),
            COALESCE(NEW.change_frequency, 'weekly')
        )
        ON CONFLICT (url) DO UPDATE SET
            last_modified = NOW(),
            priority = EXCLUDED.priority,
            change_frequency = EXCLUDED.change_frequency,
            is_active = CASE 
                WHEN TG_ARGV[0] = 'blog' THEN NEW.is_published AND NEW.is_indexed
                WHEN TG_ARGV[0] = 'landing' THEN NEW.is_published AND NEW.is_indexed
                WHEN TG_ARGV[0] = 'location' THEN NEW.is_published AND NEW.is_indexed
                ELSE true
            END;
    END IF;
    RETURN NEW;
END;
$$;

SELECT 'All functions created successfully' AS status;
