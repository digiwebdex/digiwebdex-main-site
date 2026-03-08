-- DigiWebDex Database Enums
-- Generated for self-hosted PostgreSQL migration

-- Drop existing types if they exist (for clean migration)
DO $$ BEGIN
    DROP TYPE IF EXISTS affiliate_status CASCADE;
    DROP TYPE IF EXISTS app_role CASCADE;
    DROP TYPE IF EXISTS billing_cycle CASCADE;
    DROP TYPE IF EXISTS billing_type CASCADE;
    DROP TYPE IF EXISTS commission_status CASCADE;
    DROP TYPE IF EXISTS commission_type CASCADE;
    DROP TYPE IF EXISTS custom_field_type CASCADE;
    DROP TYPE IF EXISTS domain_status CASCADE;
    DROP TYPE IF EXISTS earning_status CASCADE;
    DROP TYPE IF EXISTS hosting_status CASCADE;
    DROP TYPE IF EXISTS invoice_status CASCADE;
    DROP TYPE IF EXISTS lead_status CASCADE;
    DROP TYPE IF EXISTS notification_status CASCADE;
    DROP TYPE IF EXISTS notification_type CASCADE;
    DROP TYPE IF EXISTS order_status CASCADE;
    DROP TYPE IF EXISTS payment_gateway CASCADE;
    DROP TYPE IF EXISTS payment_status CASCADE;
    DROP TYPE IF EXISTS project_status CASCADE;
    DROP TYPE IF EXISTS proposal_status CASCADE;
    DROP TYPE IF EXISTS reseller_status CASCADE;
    DROP TYPE IF EXISTS service_type CASCADE;
    DROP TYPE IF EXISTS subscription_status CASCADE;
    DROP TYPE IF EXISTS ticket_category CASCADE;
    DROP TYPE IF EXISTS ticket_priority CASCADE;
    DROP TYPE IF EXISTS ticket_status CASCADE;
    DROP TYPE IF EXISTS withdrawal_status CASCADE;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Affiliate Status
CREATE TYPE affiliate_status AS ENUM ('pending', 'active', 'suspended', 'rejected');

-- App Role
CREATE TYPE app_role AS ENUM ('admin', 'staff', 'client', 'reseller', 'support');

-- Billing Cycle
CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly');

-- Billing Type
CREATE TYPE billing_type AS ENUM ('one_time', 'recurring', 'milestone');

-- Commission Status
CREATE TYPE commission_status AS ENUM ('pending', 'approved', 'paid', 'cancelled');

-- Commission Type
CREATE TYPE commission_type AS ENUM ('fixed', 'percentage');

-- Custom Field Type
CREATE TYPE custom_field_type AS ENUM ('text', 'number', 'date', 'select', 'multiselect', 'checkbox', 'textarea', 'email', 'phone', 'url');

-- Domain Status
CREATE TYPE domain_status AS ENUM ('pending', 'registered', 'active', 'expired', 'transferred');

-- Earning Status
CREATE TYPE earning_status AS ENUM ('pending', 'approved', 'paid');

-- Hosting Status
CREATE TYPE hosting_status AS ENUM ('pending', 'active', 'suspended', 'terminated');

-- Invoice Status
CREATE TYPE invoice_status AS ENUM ('unpaid', 'paid', 'overdue', 'cancelled', 'partial');

-- Lead Status
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'converted', 'lost');

-- Notification Status
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');

-- Notification Type
CREATE TYPE notification_type AS ENUM ('email', 'sms', 'whatsapp', 'in_app');

-- Order Status
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'active', 'completed', 'cancelled', 'merged');

-- Payment Gateway
CREATE TYPE payment_gateway AS ENUM ('sslcommerz', 'bkash', 'nagad', 'bank_transfer', 'manual');

-- Payment Status
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');

-- Project Status
CREATE TYPE project_status AS ENUM ('pending', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled');

-- Proposal Status
CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');

-- Reseller Status
CREATE TYPE reseller_status AS ENUM ('pending', 'active', 'suspended');

-- Service Type
CREATE TYPE service_type AS ENUM ('domain', 'hosting', 'web_development', 'software_development', 'digital_marketing', 'other');

-- Subscription Status
CREATE TYPE subscription_status AS ENUM ('active', 'suspended', 'cancelled', 'pending', 'expired');

-- Ticket Category
CREATE TYPE ticket_category AS ENUM ('hosting', 'domain', 'software', 'billing', 'technical', 'general', 'web_development');

-- Ticket Priority
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Ticket Status
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'waiting', 'resolved', 'closed');

-- Withdrawal Status
CREATE TYPE withdrawal_status AS ENUM ('pending', 'approved', 'rejected', 'paid');

-- Success message
SELECT 'All enum types created successfully' AS status;
