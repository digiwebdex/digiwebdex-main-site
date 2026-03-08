-- DigiWebDex Database Schema
-- Generated for self-hosted PostgreSQL migration
-- Run enums.sql before this file

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USERS TABLE (replaces Supabase auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    raw_user_meta_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_sign_in_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    company_name VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Bangladesh',
    avatar_url TEXT,
    balance_due NUMERIC(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- =====================================================
-- USER ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'client',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- =====================================================
-- ROLE PERMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role app_role NOT NULL,
    module VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    allowed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, module, action)
);

-- =====================================================
-- PASSWORD RESET TOKENS
-- =====================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- =====================================================
-- EMAIL VERIFICATION TOKENS
-- =====================================================
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REFRESH TOKENS (for JWT auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- =====================================================
-- SERVICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    description_en TEXT,
    description_bn TEXT,
    service_type service_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    icon VARCHAR(50),
    image_url TEXT,
    meta_title_en VARCHAR(255),
    meta_title_bn VARCHAR(255),
    meta_description_en TEXT,
    meta_description_bn TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_type ON services(service_type);

-- =====================================================
-- SERVICE CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES service_categories(id),
    service_type service_type,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SERVICE PACKAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    description_en TEXT,
    description_bn TEXT,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    original_price NUMERIC(12,2),
    billing_cycle billing_cycle,
    billing_type billing_type DEFAULT 'one_time',
    features JSONB DEFAULT '[]',
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    delivery_days INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_packages_service_id ON service_packages(service_id);
CREATE INDEX idx_service_packages_slug ON service_packages(slug);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id),
    package_id UUID REFERENCES service_packages(id),
    service_type service_type,
    package_name VARCHAR(255),
    domain VARCHAR(255),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount NUMERIC(12,2) DEFAULT 0,
    tax NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    advance_payment NUMERIC(12,2) DEFAULT 0,
    status order_status DEFAULT 'pending',
    payment_method payment_gateway,
    notes TEXT,
    admin_notes TEXT,
    metadata JSONB DEFAULT '{}',
    affiliate_id UUID,
    coupon_id UUID,
    merged_into_order_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id),
    package_id UUID REFERENCES service_packages(id),
    service_type service_type,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    domain VARCHAR(255),
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- =====================================================
-- ORDER META TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_meta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    meta_key VARCHAR(100) NOT NULL,
    meta_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id, meta_key)
);

-- =====================================================
-- INVOICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount NUMERIC(12,2) DEFAULT 0,
    tax NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    advance_paid NUMERIC(12,2) DEFAULT 0,
    due_amount NUMERIC(12,2) DEFAULT 0,
    status invoice_status DEFAULT 'unpaid',
    due_date DATE,
    paid_at TIMESTAMPTZ,
    currency VARCHAR(10) DEFAULT 'BDT',
    notes TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

-- =====================================================
-- INVOICE ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT,
    service_type VARCHAR(100),
    package_name VARCHAR(255),
    domain VARCHAR(255),
    renewal_date DATE,
    qty INTEGER DEFAULT 1,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    payment_gateway payment_gateway,
    transaction_id VARCHAR(255),
    status payment_status DEFAULT 'pending',
    gateway_response JSONB,
    notes TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- =====================================================
-- MANUAL PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS manual_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    payment_method payment_gateway,
    transaction_id VARCHAR(255),
    account_number VARCHAR(100),
    sender_number VARCHAR(50),
    proof_url TEXT,
    status payment_status DEFAULT 'pending',
    notes TEXT,
    admin_notes TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    rejected_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_manual_payments_order_id ON manual_payments(order_id);
CREATE INDEX idx_manual_payments_status ON manual_payments(status);

-- =====================================================
-- PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'pending',
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES users(id),
    progress INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_order_id ON projects(order_id);
CREATE INDEX idx_projects_status ON projects(status);

-- =====================================================
-- PROJECT FILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS project_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_files_project_id ON project_files(project_id);

-- =====================================================
-- MILESTONES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount NUMERIC(12,2),
    due_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_milestones_order_id ON milestones(order_id);

-- =====================================================
-- DOMAINS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_name VARCHAR(255) NOT NULL,
    tld VARCHAR(20) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    status domain_status DEFAULT 'pending',
    registrar VARCHAR(100),
    registrar_order_id VARCHAR(255),
    registration_date DATE,
    expiry_date DATE,
    auto_renew BOOLEAN DEFAULT TRUE,
    whois_privacy BOOLEAN DEFAULT FALSE,
    nameservers JSONB,
    dns_records JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_domains_user_id ON domains(user_id);
CREATE INDEX idx_domains_domain_name ON domains(domain_name);
CREATE INDEX idx_domains_status ON domains(status);
CREATE INDEX idx_domains_expiry_date ON domains(expiry_date);

-- =====================================================
-- DOMAIN PRICING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS domain_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tld VARCHAR(20) UNIQUE NOT NULL,
    base_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    renewal_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    transfer_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    margin_percent NUMERIC(5,2) DEFAULT 20,
    currency VARCHAR(10) DEFAULT 'BDT',
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_domain_pricing_tld ON domain_pricing(tld);

-- =====================================================
-- DOMAIN LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS domain_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DOMAIN SEARCH LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS domain_search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_name VARCHAR(255) NOT NULL,
    tld VARCHAR(20) NOT NULL,
    is_available BOOLEAN,
    price_shown NUMERIC(12,2),
    user_id UUID REFERENCES users(id),
    ip_address VARCHAR(50),
    search_source VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SERVERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    hostname VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50),
    server_type VARCHAR(50),
    whm_url TEXT,
    whm_username VARCHAR(100),
    whm_api_token_encrypted TEXT,
    max_accounts INTEGER,
    current_accounts INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HOSTING ACCOUNTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS hosting_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    domain_id UUID REFERENCES domains(id),
    server_id UUID REFERENCES servers(id),
    username VARCHAR(50),
    package_name VARCHAR(100),
    status hosting_status DEFAULT 'pending',
    cpanel_url TEXT,
    credentials_encrypted TEXT,
    disk_limit_mb INTEGER,
    bandwidth_limit_mb INTEGER,
    email_limit INTEGER,
    database_limit INTEGER,
    expiry_date DATE,
    auto_renew BOOLEAN DEFAULT TRUE,
    suspended_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hosting_accounts_user_id ON hosting_accounts(user_id);
CREATE INDEX idx_hosting_accounts_status ON hosting_accounts(status);
CREATE INDEX idx_hosting_accounts_expiry_date ON hosting_accounts(expiry_date);

-- =====================================================
-- LEADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    service_interest VARCHAR(100),
    message TEXT,
    source VARCHAR(100),
    status lead_status DEFAULT 'new',
    assigned_to UUID REFERENCES users(id),
    converted_order_id UUID REFERENCES orders(id),
    ip_address VARCHAR(50),
    user_agent TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    notes TEXT,
    last_contacted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_created_at ON leads(created_at);

-- =====================================================
-- LEAD LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS lead_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    notes TEXT,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CONTACT MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    replied_at TIMESTAMPTZ,
    replied_by UUID REFERENCES users(id),
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_messages_status ON contact_messages(status);

-- =====================================================
-- CONSULTATION BOOKINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS consultation_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    service_interest VARCHAR(100),
    preferred_date DATE,
    preferred_time VARCHAR(20),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUPPORT TICKETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    category ticket_category,
    priority ticket_priority DEFAULT 'medium',
    status ticket_status DEFAULT 'open',
    order_id UUID REFERENCES orders(id),
    assigned_to UUID REFERENCES users(id),
    sla_due_at TIMESTAMPTZ,
    first_response_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_ticket_number ON support_tickets(ticket_number);

-- =====================================================
-- TICKET MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);

-- =====================================================
-- TICKET LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ticket_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id),
    service_id UUID REFERENCES services(id),
    package_id UUID REFERENCES service_packages(id),
    domain VARCHAR(255),
    status subscription_status DEFAULT 'pending',
    billing_cycle billing_cycle,
    amount NUMERIC(12,2) NOT NULL,
    start_date DATE,
    next_billing_date DATE,
    cancelled_at TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_billing_date ON subscriptions(next_billing_date);

-- =====================================================
-- SUBSCRIPTION BILLING HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_billing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id),
    amount NUMERIC(12,2) NOT NULL,
    billing_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUBSCRIPTION LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RENEWAL LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS renewal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PROPOSALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_number VARCHAR(50) UNIQUE,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    client_company VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    items JSONB DEFAULT '[]',
    subtotal NUMERIC(12,2) DEFAULT 0,
    discount NUMERIC(12,2) DEFAULT 0,
    tax NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) DEFAULT 0,
    status proposal_status DEFAULT 'draft',
    valid_until DATE,
    expiry_date DATE,
    terms TEXT,
    notes TEXT,
    template_id UUID,
    created_by UUID REFERENCES users(id),
    sent_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_proposal_number ON proposals(proposal_number);

-- =====================================================
-- PROPOSAL TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS proposal_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PROPOSAL LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS proposal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AFFILIATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    status affiliate_status DEFAULT 'pending',
    commission_rate NUMERIC(5,2) DEFAULT 10,
    grace_period_days INTEGER DEFAULT 30,
    min_withdrawal_amount NUMERIC(12,2) DEFAULT 1000,
    payment_method VARCHAR(50),
    payment_details JSONB,
    total_clicks INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    total_earnings NUMERIC(12,2) DEFAULT 0,
    pending_earnings NUMERIC(12,2) DEFAULT 0,
    withdrawable_earnings NUMERIC(12,2) DEFAULT 0,
    withdrawn_earnings NUMERIC(12,2) DEFAULT 0,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX idx_affiliates_status ON affiliates(status);

-- =====================================================
-- AFFILIATE CLICKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    user_agent TEXT,
    referrer_url TEXT,
    landing_page TEXT,
    country VARCHAR(100),
    device_type VARCHAR(50),
    converted BOOLEAN DEFAULT FALSE,
    conversion_order_id UUID REFERENCES orders(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX idx_affiliate_clicks_created_at ON affiliate_clicks(created_at);
CREATE INDEX idx_affiliate_clicks_ip ON affiliate_clicks(ip_address);

-- =====================================================
-- AFFILIATE COMMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id),
    click_id UUID REFERENCES affiliate_clicks(id),
    order_amount NUMERIC(12,2) NOT NULL,
    commission_rate NUMERIC(5,2) NOT NULL,
    commission_amount NUMERIC(12,2) NOT NULL,
    status commission_status DEFAULT 'pending',
    grace_period_ends_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_affiliate_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
CREATE INDEX idx_affiliate_commissions_order_id ON affiliate_commissions(order_id);
CREATE INDEX idx_affiliate_commissions_status ON affiliate_commissions(status);

-- =====================================================
-- AFFILIATE WITHDRAWALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliate_withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_details JSONB,
    status withdrawal_status DEFAULT 'pending',
    transaction_id VARCHAR(255),
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_affiliate_withdrawals_affiliate_id ON affiliate_withdrawals(affiliate_id);
CREATE INDEX idx_affiliate_withdrawals_status ON affiliate_withdrawals(status);

-- =====================================================
-- RESELLERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS resellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    logo_url TEXT,
    website_url TEXT,
    status reseller_status DEFAULT 'pending',
    commission_type commission_type DEFAULT 'percentage',
    commission_value NUMERIC(12,2) DEFAULT 15,
    min_withdrawal_amount NUMERIC(12,2) DEFAULT 2000,
    payment_method VARCHAR(50),
    payment_details JSONB,
    total_clients INTEGER DEFAULT 0,
    total_earnings NUMERIC(12,2) DEFAULT 0,
    pending_earnings NUMERIC(12,2) DEFAULT 0,
    withdrawable_earnings NUMERIC(12,2) DEFAULT 0,
    withdrawn_earnings NUMERIC(12,2) DEFAULT 0,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resellers_user_id ON resellers(user_id);
CREATE INDEX idx_resellers_status ON resellers(status);

-- =====================================================
-- RESELLER CLIENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reseller_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reseller_id UUID NOT NULL REFERENCES resellers(id) ON DELETE CASCADE,
    client_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reseller_clients_reseller_id ON reseller_clients(reseller_id);

-- =====================================================
-- RESELLER EARNINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reseller_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reseller_id UUID NOT NULL REFERENCES resellers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id),
    client_id UUID REFERENCES reseller_clients(id),
    order_amount NUMERIC(12,2) NOT NULL,
    commission_type commission_type NOT NULL,
    commission_value NUMERIC(12,2) NOT NULL,
    earning_amount NUMERIC(12,2) NOT NULL,
    status earning_status DEFAULT 'pending',
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reseller_earnings_reseller_id ON reseller_earnings(reseller_id);

-- =====================================================
-- RESELLER WITHDRAWALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reseller_withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reseller_id UUID NOT NULL REFERENCES resellers(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_details JSONB,
    status withdrawal_status DEFAULT 'pending',
    transaction_id VARCHAR(255),
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RESELLER LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reseller_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reseller_id UUID NOT NULL REFERENCES resellers(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COUPONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) DEFAULT 'percentage',
    discount_value NUMERIC(12,2) NOT NULL,
    min_order_amount NUMERIC(12,2),
    max_discount NUMERIC(12,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    applicable_services JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);

-- =====================================================
-- BUNDLE DISCOUNTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bundle_discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255),
    description TEXT,
    service_types TEXT[] NOT NULL,
    discount_percent NUMERIC(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CART ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id),
    package_id UUID REFERENCES service_packages(id),
    service_type VARCHAR(50) NOT NULL,
    package_name VARCHAR(255),
    domain VARCHAR(255),
    price NUMERIC(12,2) DEFAULT 0,
    qty INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient VARCHAR(255) NOT NULL,
    notification_type notification_type NOT NULL,
    subject VARCHAR(255),
    body TEXT,
    status notification_status DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(notification_type);

-- =====================================================
-- NOTIFICATION TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    template_key VARCHAR(100) UNIQUE NOT NULL,
    notification_type notification_type NOT NULL,
    subject_template TEXT,
    body_template TEXT,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PHONE OTPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS phone_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(50) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_phone_otps_phone ON phone_otps(phone);
CREATE INDEX idx_phone_otps_expires_at ON phone_otps(expires_at);

-- =====================================================
-- AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- AUTOMATION LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    automation_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'success',
    details JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRACKING EVENT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tracking_event_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name VARCHAR(100) NOT NULL,
    event_data JSONB,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(100),
    ip_address VARCHAR(50),
    user_agent TEXT,
    page_url TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tracking_event_logs_event_name ON tracking_event_logs(event_name);

-- =====================================================
-- SYSTEM SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_settings_key ON system_settings(key);

-- =====================================================
-- CUSTOM FIELDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS custom_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    field_label_en VARCHAR(255) NOT NULL,
    field_label_bn VARCHAR(255),
    field_type custom_field_type DEFAULT 'text',
    options JSONB,
    default_value TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    validation_rules JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entity_type, field_key)
);

-- =====================================================
-- CUSTOM FIELD VALUES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS custom_field_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(field_id, entity_id)
);

-- =====================================================
-- BLOG CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description_en TEXT,
    description_bn TEXT,
    parent_id UUID REFERENCES blog_categories(id),
    meta_title_en VARCHAR(255),
    meta_title_bn VARCHAR(255),
    meta_description_en TEXT,
    meta_description_bn TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);

-- =====================================================
-- BLOG TAGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BLOG POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en VARCHAR(255) NOT NULL,
    title_bn VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt_en TEXT,
    excerpt_bn TEXT,
    content_en TEXT,
    content_bn TEXT,
    featured_image TEXT,
    og_image TEXT,
    category_id UUID REFERENCES blog_categories(id),
    author_id UUID REFERENCES users(id),
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_indexed BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMPTZ,
    meta_title_en VARCHAR(255),
    meta_title_bn VARCHAR(255),
    meta_description_en TEXT,
    meta_description_bn TEXT,
    keywords TEXT[],
    canonical_url TEXT,
    schema_markup JSONB,
    faq_items JSONB,
    reading_time_minutes INTEGER,
    views_count INTEGER DEFAULT 0,
    priority NUMERIC(3,2) DEFAULT 0.5,
    change_frequency VARCHAR(20) DEFAULT 'weekly',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published, published_at);

-- =====================================================
-- BLOG POST TAGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_post_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
    UNIQUE(post_id, tag_id)
);

-- =====================================================
-- BLOG RELATED POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_related_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    related_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    relevance_score INTEGER DEFAULT 0
);

-- =====================================================
-- CASE STUDIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS case_studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name_en VARCHAR(255) NOT NULL,
    project_name_bn VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    hero_headline_en VARCHAR(255),
    hero_headline_bn VARCHAR(255),
    hero_subheadline_en TEXT,
    hero_subheadline_bn TEXT,
    hero_image_url TEXT,
    industry_type_en VARCHAR(100),
    industry_type_bn VARCHAR(100),
    industry_tag_en VARCHAR(100),
    industry_tag_bn VARCHAR(100),
    client_logo_url TEXT,
    client_website_url TEXT,
    company_background_en TEXT,
    company_background_bn TEXT,
    business_goal_en TEXT,
    business_goal_bn TEXT,
    problems JSONB,
    solutions JSONB,
    tech_stack JSONB,
    results JSONB,
    result_highlight_en TEXT,
    result_highlight_bn TEXT,
    before_screenshot_url TEXT,
    after_screenshot_url TEXT,
    before_pagespeed_score INTEGER,
    after_pagespeed_score INTEGER,
    performance_improvements JSONB,
    testimonial_text_en TEXT,
    testimonial_text_bn TEXT,
    testimonial_author_name VARCHAR(255),
    testimonial_author_title_en VARCHAR(255),
    testimonial_author_title_bn VARCHAR(255),
    testimonial_author_company VARCHAR(255),
    testimonial_author_avatar_url TEXT,
    testimonial_rating INTEGER,
    meta_title_en VARCHAR(255),
    meta_title_bn VARCHAR(255),
    meta_description_en TEXT,
    meta_description_bn TEXT,
    og_image_url TEXT,
    keywords TEXT[],
    canonical_url TEXT,
    schema_markup JSONB,
    faq_items JSONB,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    views_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_case_studies_slug ON case_studies(slug);
CREATE INDEX idx_case_studies_published ON case_studies(is_published);

-- =====================================================
-- LANDING PAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS landing_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en VARCHAR(255) NOT NULL,
    title_bn VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    content JSONB DEFAULT '{}',
    meta_title_en VARCHAR(255),
    meta_title_bn VARCHAR(255),
    meta_description_en TEXT,
    meta_description_bn TEXT,
    og_image TEXT,
    keywords TEXT[],
    canonical_url TEXT,
    schema_markup JSONB,
    is_published BOOLEAN DEFAULT FALSE,
    is_indexed BOOLEAN DEFAULT TRUE,
    priority NUMERIC(3,2) DEFAULT 0.5,
    change_frequency VARCHAR(20) DEFAULT 'weekly',
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);

-- =====================================================
-- LOCATION PAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS location_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_en VARCHAR(255) NOT NULL,
    city_bn VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    content JSONB DEFAULT '{}',
    meta_title_en VARCHAR(255),
    meta_title_bn VARCHAR(255),
    meta_description_en TEXT,
    meta_description_bn TEXT,
    og_image TEXT,
    keywords TEXT[],
    is_published BOOLEAN DEFAULT FALSE,
    is_indexed BOOLEAN DEFAULT TRUE,
    priority NUMERIC(3,2) DEFAULT 0.5,
    change_frequency VARCHAR(20) DEFAULT 'weekly',
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HOMEPAGE SECTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS homepage_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key VARCHAR(100) UNIQUE NOT NULL,
    title_en VARCHAR(255),
    title_bn VARCHAR(255),
    subtitle_en TEXT,
    subtitle_bn TEXT,
    content_en TEXT,
    content_bn TEXT,
    cta_text_en VARCHAR(100),
    cta_text_bn VARCHAR(100),
    cta_link TEXT,
    image_url TEXT,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SEO SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS seo_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_path VARCHAR(255) UNIQUE NOT NULL,
    title_en VARCHAR(255),
    title_bn VARCHAR(255),
    description_en TEXT,
    description_bn TEXT,
    keywords TEXT[],
    og_image TEXT,
    canonical_url TEXT,
    schema_markup JSONB,
    is_indexed BOOLEAN DEFAULT TRUE,
    priority NUMERIC(3,2) DEFAULT 0.5,
    change_frequency VARCHAR(20) DEFAULT 'weekly',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SITEMAP ENTRIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sitemap_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url VARCHAR(500) UNIQUE NOT NULL,
    page_type VARCHAR(50),
    entity_id UUID,
    priority NUMERIC(3,2) DEFAULT 0.5,
    change_frequency VARCHAR(20) DEFAULT 'weekly',
    last_modified TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sitemap_entries_url ON sitemap_entries(url);

-- =====================================================
-- CHATBOT CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id VARCHAR(255) NOT NULL,
    platform VARCHAR(50) DEFAULT 'web',
    message_in TEXT NOT NULL,
    message_out TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chatbot_conversations_sender_id ON chatbot_conversations(sender_id);

-- =====================================================
-- REVENUE SUMMARY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS revenue_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_type VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue NUMERIC(14,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_payments INTEGER DEFAULT 0,
    service_breakdown JSONB DEFAULT '{}',
    payment_method_breakdown JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(period_type, period_start)
);

SELECT 'Schema created successfully' AS status;
