-- DigiWebDex Database Triggers
-- Run after schema.sql and functions.sql

-- Trigger: Auto-generate invoice on order insert
CREATE TRIGGER trigger_auto_generate_invoice
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_invoice();

-- Trigger: Update customer balance on invoice changes
CREATE TRIGGER trigger_update_customer_balance_insert
    AFTER INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_balance();

CREATE TRIGGER trigger_update_customer_balance_update
    AFTER UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_balance();

CREATE TRIGGER trigger_update_customer_balance_delete
    AFTER DELETE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_balance();

-- Trigger: Check order delete integrity
CREATE TRIGGER trigger_check_order_delete
    BEFORE DELETE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION check_order_delete_integrity();

-- Trigger: Set ticket number
CREATE TRIGGER trigger_set_ticket_number
    BEFORE INSERT ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_ticket_number();

-- Trigger: Calculate SLA due
CREATE TRIGGER trigger_calculate_sla
    BEFORE INSERT ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION calculate_sla_due_at();

-- Trigger: Cleanup expired OTPs
CREATE TRIGGER trigger_cleanup_otps
    AFTER INSERT ON phone_otps
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_expired_otps();

-- Trigger: Update updated_at columns
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_domains_updated_at BEFORE UPDATE ON domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_hosting_accounts_updated_at BEFORE UPDATE ON hosting_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_affiliates_updated_at BEFORE UPDATE ON affiliates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_resellers_updated_at BEFORE UPDATE ON resellers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_service_packages_updated_at BEFORE UPDATE ON service_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update sitemap entries for blog posts
CREATE TRIGGER trigger_blog_posts_sitemap
    AFTER INSERT OR UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_sitemap_entry('blog');

-- Trigger: Update sitemap entries for landing pages
CREATE TRIGGER trigger_landing_pages_sitemap
    AFTER INSERT OR UPDATE ON landing_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_sitemap_entry('landing');

-- Trigger: Update sitemap entries for location pages
CREATE TRIGGER trigger_location_pages_sitemap
    AFTER INSERT OR UPDATE ON location_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_sitemap_entry('location');

SELECT 'All triggers created successfully' AS status;
