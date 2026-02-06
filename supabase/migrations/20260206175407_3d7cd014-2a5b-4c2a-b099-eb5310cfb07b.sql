-- ================================================
-- PHASE 1: Core Enums and Types
-- ================================================

-- User roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'client');

-- Order status lifecycle
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'processing', 'active', 'completed', 'cancelled');

-- Billing type
CREATE TYPE public.billing_type AS ENUM ('one_time', 'recurring', 'milestone');

-- Invoice status
CREATE TYPE public.invoice_status AS ENUM ('unpaid', 'paid', 'overdue', 'cancelled');

-- Payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');

-- Payment gateway types
CREATE TYPE public.payment_gateway AS ENUM ('sslcommerz', 'bkash', 'nagad', 'bank_transfer', 'manual');

-- Service type enum
CREATE TYPE public.service_type AS ENUM ('domain', 'hosting', 'web_development', 'software_development', 'digital_marketing', 'other');

-- Hosting status
CREATE TYPE public.hosting_status AS ENUM ('pending', 'active', 'suspended', 'terminated');

-- Domain status
CREATE TYPE public.domain_status AS ENUM ('pending', 'registered', 'active', 'expired', 'transferred');

-- Project status
CREATE TYPE public.project_status AS ENUM ('pending', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled');

-- Notification type
CREATE TYPE public.notification_type AS ENUM ('email', 'sms', 'whatsapp', 'in_app');

-- Notification status
CREATE TYPE public.notification_status AS ENUM ('pending', 'sent', 'failed');

-- ================================================
-- PHASE 2: User Profiles & Roles
-- ================================================

-- User profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    company_name TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Bangladesh',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL DEFAULT 'client',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- ================================================
-- PHASE 3: Services & Packages
-- ================================================

-- Service categories
CREATE TABLE public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description_en TEXT,
    description_bn TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Services table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    service_type public.service_type NOT NULL,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description_en TEXT,
    description_bn TEXT,
    features_en JSONB DEFAULT '[]',
    features_bn JSONB DEFAULT '[]',
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service packages (pricing tiers)
CREATE TABLE public.service_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    billing_type public.billing_type NOT NULL DEFAULT 'one_time',
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'BDT',
    billing_cycle_months INTEGER DEFAULT 1,
    setup_fee DECIMAL(10, 2) DEFAULT 0,
    features_en JSONB DEFAULT '[]',
    features_bn JSONB DEFAULT '[]',
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================
-- PHASE 4: Orders & Order Meta
-- ================================================

-- Orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    package_id UUID REFERENCES public.service_packages(id) ON DELETE SET NULL,
    service_type public.service_type NOT NULL,
    status public.order_status NOT NULL DEFAULT 'pending',
    billing_type public.billing_type NOT NULL DEFAULT 'one_time',
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'BDT',
    coupon_code TEXT,
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Order meta for dynamic custom fields
CREATE TABLE public.order_meta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    meta_key TEXT NOT NULL,
    meta_value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================
-- PHASE 5: Invoices
-- ================================================

CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status public.invoice_status NOT NULL DEFAULT 'unpaid',
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'BDT',
    due_date DATE,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================
-- PHASE 6: Payments
-- ================================================

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id TEXT UNIQUE NOT NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    gateway public.payment_gateway NOT NULL,
    status public.payment_status NOT NULL DEFAULT 'pending',
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'BDT',
    gateway_response JSONB DEFAULT '{}',
    gateway_transaction_id TEXT,
    bank_transfer_proof_url TEXT,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================
-- PHASE 7: Domain Management
-- ================================================

CREATE TABLE public.domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    domain_name TEXT NOT NULL,
    tld TEXT NOT NULL,
    status public.domain_status NOT NULL DEFAULT 'pending',
    registrar TEXT,
    registrar_order_id TEXT,
    nameservers JSONB DEFAULT '[]',
    registration_date DATE,
    expiry_date DATE,
    auto_renew BOOLEAN DEFAULT true,
    whois_privacy BOOLEAN DEFAULT false,
    dns_records JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Domain logs for tracking
CREATE TABLE public.domain_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================
-- PHASE 8: Hosting Management
-- ================================================

-- Servers table
CREATE TABLE public.servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    hostname TEXT NOT NULL,
    ip_address TEXT,
    server_type TEXT DEFAULT 'cpanel',
    max_accounts INTEGER DEFAULT 100,
    current_accounts INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    api_token_encrypted TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hosting accounts
CREATE TABLE public.hosting_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    server_id UUID REFERENCES public.servers(id) ON DELETE SET NULL,
    domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL,
    username TEXT,
    package_name TEXT,
    status public.hosting_status NOT NULL DEFAULT 'pending',
    disk_limit_mb INTEGER,
    bandwidth_limit_mb INTEGER,
    email_limit INTEGER,
    database_limit INTEGER,
    cpanel_url TEXT,
    credentials_encrypted TEXT,
    expiry_date DATE,
    auto_renew BOOLEAN DEFAULT true,
    suspended_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================
-- PHASE 9: Projects & Milestones
-- ================================================

CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    service_type public.service_type NOT NULL,
    status public.project_status NOT NULL DEFAULT 'pending',
    start_date DATE,
    deadline DATE,
    completed_at TIMESTAMPTZ,
    total_milestones INTEGER DEFAULT 0,
    completed_milestones INTEGER DEFAULT 0,
    requirements JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) DEFAULT 0,
    is_paid BOOLEAN DEFAULT false,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    due_date DATE,
    completed_at TIMESTAMPTZ,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project files for delivery
CREATE TABLE public.project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================
-- PHASE 10: Notifications
-- ================================================

CREATE TABLE public.notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    subject_en TEXT,
    subject_bn TEXT,
    body_en TEXT,
    body_bn TEXT,
    notification_type public.notification_type NOT NULL,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
    notification_type public.notification_type NOT NULL,
    status public.notification_status NOT NULL DEFAULT 'pending',
    recipient TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================
-- PHASE 11: Renewal & Coupons
-- ================================================

CREATE TABLE public.renewal_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_expiry_date DATE,
    new_expiry_date DATE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount DECIMAL(10, 2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    applicable_services JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================
-- PHASE 12: SEO Settings
-- ================================================

CREATE TABLE public.seo_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug TEXT UNIQUE NOT NULL,
    meta_title_en TEXT,
    meta_title_bn TEXT,
    meta_description_en TEXT,
    meta_description_bn TEXT,
    og_image TEXT,
    schema_markup JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================
-- PHASE 13: Audit Logs
-- ================================================

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================
-- PHASE 14: Helper Functions
-- ================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;

-- Function to check if user is admin or staff
CREATE OR REPLACE FUNCTION public.is_admin_or_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role IN ('admin', 'staff')
    )
$$;

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
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

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
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

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Auto create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'client');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ================================================
-- PHASE 15: Triggers
-- ================================================

-- Updated at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON public.service_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_packages_updated_at BEFORE UPDATE ON public.service_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON public.domains FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hosting_accounts_updated_at BEFORE UPDATE ON public.hosting_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_servers_updated_at BEFORE UPDATE ON public.servers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON public.notification_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seo_settings_updated_at BEFORE UPDATE ON public.seo_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto create profile trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- PHASE 16: Row Level Security
-- ================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin_or_staff(auth.uid()));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies (admin only for management)
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Public read for services, categories, packages (for website visitors)
CREATE POLICY "Anyone can view active categories" ON public.service_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active packages" ON public.service_packages FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.service_categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage packages" ON public.service_packages FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (public.is_admin_or_staff(auth.uid()));
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- Order meta policies
CREATE POLICY "Users can view own order meta" ON public.order_meta FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_meta.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can manage order meta" ON public.order_meta FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all invoices" ON public.invoices FOR SELECT USING (public.is_admin_or_staff(auth.uid()));
CREATE POLICY "Admins can manage invoices" ON public.invoices FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT USING (public.is_admin_or_staff(auth.uid()));
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- Domains policies
CREATE POLICY "Users can view own domains" ON public.domains FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all domains" ON public.domains FOR SELECT USING (public.is_admin_or_staff(auth.uid()));
CREATE POLICY "Admins can manage domains" ON public.domains FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- Domain logs policies
CREATE POLICY "Users can view own domain logs" ON public.domain_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.domains WHERE domains.id = domain_logs.domain_id AND domains.user_id = auth.uid())
);
CREATE POLICY "Admins can manage domain logs" ON public.domain_logs FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- Servers (admin only)
CREATE POLICY "Admins can manage servers" ON public.servers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Hosting accounts policies
CREATE POLICY "Users can view own hosting" ON public.hosting_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all hosting" ON public.hosting_accounts FOR SELECT USING (public.is_admin_or_staff(auth.uid()));
CREATE POLICY "Admins can manage hosting" ON public.hosting_accounts FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id OR auth.uid() = assigned_to);
CREATE POLICY "Staff can view assigned projects" ON public.projects FOR SELECT USING (public.is_admin_or_staff(auth.uid()));
CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- Milestones policies
CREATE POLICY "Users can view project milestones" ON public.milestones FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id AND (projects.user_id = auth.uid() OR projects.assigned_to = auth.uid()))
);
CREATE POLICY "Admins can manage milestones" ON public.milestones FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- Project files policies
CREATE POLICY "Users can view project files" ON public.project_files FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_files.project_id AND (projects.user_id = auth.uid() OR projects.assigned_to = auth.uid()))
);
CREATE POLICY "Staff can manage project files" ON public.project_files FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- Notification templates (admin only)
CREATE POLICY "Admins can manage notification templates" ON public.notification_templates FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff can view notification templates" ON public.notification_templates FOR SELECT USING (public.is_admin_or_staff(auth.uid()));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- Renewal logs policies
CREATE POLICY "Admins can view renewal logs" ON public.renewal_logs FOR SELECT USING (public.is_admin_or_staff(auth.uid()));
CREATE POLICY "Admins can manage renewal logs" ON public.renewal_logs FOR ALL USING (public.is_admin_or_staff(auth.uid()));

-- Coupons policies
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- SEO settings (admin only)
CREATE POLICY "Anyone can read SEO settings" ON public.seo_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage SEO settings" ON public.seo_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Audit logs (admin only)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- ================================================
-- PHASE 17: Indexes for Performance
-- ================================================

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_services_category_id ON public.services(category_id);
CREATE INDEX idx_services_service_type ON public.services(service_type);
CREATE INDEX idx_service_packages_service_id ON public.service_packages(service_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_service_type ON public.orders(service_type);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_meta_order_id ON public.order_meta(order_id);
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_domains_user_id ON public.domains(user_id);
CREATE INDEX idx_domains_expiry_date ON public.domains(expiry_date);
CREATE INDEX idx_hosting_accounts_user_id ON public.hosting_accounts(user_id);
CREATE INDEX idx_hosting_accounts_expiry_date ON public.hosting_accounts(expiry_date);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_assigned_to ON public.projects(assigned_to);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_milestones_project_id ON public.milestones(project_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_status ON public.notifications(status);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);