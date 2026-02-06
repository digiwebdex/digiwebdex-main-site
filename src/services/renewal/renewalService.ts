import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { notificationService } from '../notificationService';
import { invoiceService } from '../invoiceService';

type HostingAccount = Database['public']['Tables']['hosting_accounts']['Row'];
type Domain = Database['public']['Tables']['domains']['Row'];
type RenewalLog = Database['public']['Tables']['renewal_logs']['Row'];

export interface ExpiringEntity {
  id: string;
  type: 'hosting' | 'domain';
  userId: string;
  userEmail?: string;
  entityName: string; // domain name or hosting package
  expiryDate: string;
  daysUntilExpiry: number;
  renewalAmount: number;
  autoRenew: boolean;
}

export interface RenewalConfig {
  reminderDays: number[];        // Days before expiry for reminders [30, 15, 7, 1]
  invoiceGenerationDays: number; // Days before expiry to generate invoice
  gracePeriodDays: number;       // Days after expiry before suspension
  suspensionWarningDays: number; // Days before suspension to warn
}

export interface RenewalProcessResult {
  processed: number;
  reminders: number;
  invoicesGenerated: number;
  suspensions: number;
  errors: string[];
  timestamp: string;
}

class RenewalService {
  private config: RenewalConfig = {
    reminderDays: [30, 15, 7, 1],
    invoiceGenerationDays: 30,
    gracePeriodDays: 7,
    suspensionWarningDays: 3,
  };

  /**
   * Main renewal processing - should be called by daily cron job
   * Designed to be idempotent - safe to run multiple times
   */
  async processRenewals(): Promise<RenewalProcessResult> {
    const result: RenewalProcessResult = {
      processed: 0,
      reminders: 0,
      invoicesGenerated: 0,
      suspensions: 0,
      errors: [],
      timestamp: new Date().toISOString(),
    };

    try {
      // 1. Process expiring hosting accounts
      const expiringHosting = await this.getExpiringHostingAccounts();
      for (const entity of expiringHosting) {
        try {
          await this.processExpiringEntity(entity, result);
          result.processed++;
        } catch (error) {
          result.errors.push(`Hosting ${entity.id}: ${(error as Error).message}`);
        }
      }

      // 2. Process expiring domains
      const expiringDomains = await this.getExpiringDomains();
      for (const entity of expiringDomains) {
        try {
          await this.processExpiringEntity(entity, result);
          result.processed++;
        } catch (error) {
          result.errors.push(`Domain ${entity.id}: ${(error as Error).message}`);
        }
      }

      // 3. Process suspensions for entities past grace period
      await this.processSuspensions(result);

      // 4. Log the renewal run
      await this.logRenewalRun(result);

    } catch (error) {
      result.errors.push(`System error: ${(error as Error).message}`);
    }

    return result;
  }

  /**
   * Get hosting accounts expiring within 30 days
   */
  private async getExpiringHostingAccounts(): Promise<ExpiringEntity[]> {
    const maxDays = Math.max(...this.config.reminderDays);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + maxDays);

    const { data: accounts, error } = await supabase
      .from('hosting_accounts')
      .select(`
        *,
        order:orders(total, user_id)
      `)
      .eq('status', 'active')
      .lte('expiry_date', futureDate.toISOString().split('T')[0])
      .gte('expiry_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;

    return (accounts || []).map(account => this.mapToExpiringEntity(account, 'hosting'));
  }

  /**
   * Get domains expiring within 30 days
   */
  private async getExpiringDomains(): Promise<ExpiringEntity[]> {
    const maxDays = Math.max(...this.config.reminderDays);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + maxDays);

    const { data: domains, error } = await supabase
      .from('domains')
      .select(`
        *,
        order:orders(total, user_id),
        pricing:domain_pricing!inner(renewal_price)
      `)
      .in('status', ['active', 'registered'])
      .lte('expiry_date', futureDate.toISOString().split('T')[0])
      .gte('expiry_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;

    return (domains || []).map(domain => this.mapToExpiringEntity(domain, 'domain'));
  }

  /**
   * Map database entity to ExpiringEntity interface
   */
  private mapToExpiringEntity(entity: any, type: 'hosting' | 'domain'): ExpiringEntity {
    const expiryDate = new Date(entity.expiry_date || '');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expiryDate.getTime() - today.getTime();
    const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (type === 'hosting') {
      return {
        id: entity.id,
        type: 'hosting',
        userId: entity.user_id || '',
        entityName: entity.package_name || 'Hosting Account',
        expiryDate: entity.expiry_date || '',
        daysUntilExpiry,
        renewalAmount: (entity.order as any)?.total || 0,
        autoRenew: entity.auto_renew ?? true,
      };
    } else {
      return {
        id: entity.id,
        type: 'domain',
        userId: entity.user_id || '',
        entityName: entity.domain_name || '',
        expiryDate: entity.expiry_date || '',
        daysUntilExpiry,
        renewalAmount: (entity.pricing as any)?.renewal_price || 0,
        autoRenew: entity.auto_renew ?? true,
      };
    }
  }

  /**
   * Process a single expiring entity based on days until expiry
   * Idempotent: checks if action was already taken today
   */
  private async processExpiringEntity(
    entity: ExpiringEntity,
    result: RenewalProcessResult
  ): Promise<void> {
    const { daysUntilExpiry } = entity;

    // Check if we should process this reminder day
    if (!this.config.reminderDays.includes(daysUntilExpiry)) {
      return;
    }

    // Idempotency check: see if we already sent a reminder today
    const alreadyProcessed = await this.wasProcessedToday(entity.id, `reminder_${daysUntilExpiry}`);
    if (alreadyProcessed) {
      return;
    }

    // Get user email for notifications
    const userEmail = await this.getUserEmail(entity.userId);

    // Send renewal reminder
    await this.sendRenewalReminder(entity, userEmail, daysUntilExpiry);
    result.reminders++;

    // Generate invoice on first reminder (30 days) if not already created
    if (daysUntilExpiry === this.config.invoiceGenerationDays) {
      const hasInvoice = await this.hasRenewalInvoice(entity.id, entity.type);
      if (!hasInvoice) {
        await this.generateRenewalInvoice(entity);
        result.invoicesGenerated++;
      }
    }

    // Log the processing
    await this.logReminderSent(entity.id, entity.type, daysUntilExpiry);
  }

  /**
   * Check if entity was already processed today (idempotency)
   */
  private async wasProcessedToday(entityId: string, actionType: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('renewal_logs')
      .select('id')
      .eq('entity_id', entityId)
      .gte('created_at', today.toISOString())
      .limit(1);

    return (data?.length || 0) > 0;
  }

  /**
   * Get user email from profiles or auth
   */
  private async getUserEmail(userId: string): Promise<string> {
    // Try to get from notifications metadata or return empty
    // In production, this would query auth.users or a profiles table with email
    return '';
  }

  /**
   * Send renewal reminder notification
   */
  private async sendRenewalReminder(
    entity: ExpiringEntity,
    email: string,
    daysRemaining: number
  ): Promise<void> {
    const reminderType = this.getReminderType(daysRemaining);
    
    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', entity.userId)
      .single();

    await notificationService.triggerEvent('RENEWAL_REMINDER', entity.userId, email, {
      service_type: entity.type === 'hosting' ? 'Hosting' : 'Domain',
      service_name: entity.entityName,
      expiry_date: entity.expiryDate,
      days_until_expiry: daysRemaining.toString(),
      renewal_amount: entity.renewalAmount.toString(),
      customer_name: profile?.full_name || 'Customer',
      reminder_type: reminderType,
    });
  }

  /**
   * Get reminder type label based on days remaining
   */
  private getReminderType(days: number): string {
    if (days === 30) return 'first';
    if (days === 15) return 'second';
    if (days === 7) return 'third';
    if (days === 1) return 'final';
    return 'reminder';
  }

  /**
   * Check if renewal invoice already exists
   */
  private async hasRenewalInvoice(entityId: string, entityType: string): Promise<boolean> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
      .from('renewal_logs')
      .select('invoice_id')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .not('invoice_id', 'is', null)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .limit(1);

    return (data?.length || 0) > 0;
  }

  /**
   * Generate renewal invoice for entity
   */
  private async generateRenewalInvoice(entity: ExpiringEntity): Promise<string | null> {
    const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number');

    const dueDate = new Date(entity.expiryDate);

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber || `INV-${Date.now()}`,
        user_id: entity.userId,
        subtotal: entity.renewalAmount,
        total: entity.renewalAmount,
        discount: 0,
        tax: 0,
        status: 'unpaid',
        due_date: dueDate.toISOString().split('T')[0],
        notes: `Renewal invoice for ${entity.type}: ${entity.entityName}`,
      })
      .select()
      .single();

    if (error) throw error;

    // Log renewal invoice generation
    await supabase.from('renewal_logs').insert({
      entity_type: entity.type,
      entity_id: entity.id,
      old_expiry_date: entity.expiryDate,
      invoice_id: invoice?.id,
    });

    // Send invoice notification
    await notificationService.triggerEvent('INVOICE_GENERATED', entity.userId, '', {
      invoice_number: invoice?.invoice_number || '',
      amount: entity.renewalAmount.toString(),
      service_name: entity.entityName,
      due_date: entity.expiryDate,
    });

    return invoice?.id || null;
  }

  /**
   * Log reminder sent for tracking
   */
  private async logReminderSent(
    entityId: string,
    entityType: string,
    daysRemaining: number
  ): Promise<void> {
    await supabase.from('renewal_logs').insert({
      entity_type: entityType,
      entity_id: entityId,
      old_expiry_date: new Date().toISOString().split('T')[0],
    });
  }

  /**
   * Process suspensions for entities past grace period
   */
  private async processSuspensions(result: RenewalProcessResult): Promise<void> {
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() - this.config.gracePeriodDays);

    // Suspend hosting accounts
    await this.suspendExpiredHostingAccounts(gracePeriodEnd, result);

    // Suspend domains (mark as expired)
    await this.suspendExpiredDomains(gracePeriodEnd, result);
  }

  /**
   * Suspend expired hosting accounts past grace period
   */
  private async suspendExpiredHostingAccounts(
    gracePeriodEnd: Date,
    result: RenewalProcessResult
  ): Promise<void> {
    const { data: expiredAccounts, error } = await supabase
      .from('hosting_accounts')
      .select('*')
      .eq('status', 'active')
      .lt('expiry_date', gracePeriodEnd.toISOString().split('T')[0]);

    if (error) throw error;

    for (const account of expiredAccounts || []) {
      // Check if renewal invoice is paid
      const isPaid = await this.isRenewalInvoicePaid(account.id, 'hosting');

      if (!isPaid) {
        // Suspend account
        const { error: updateError } = await supabase
          .from('hosting_accounts')
          .update({
            status: 'suspended',
            suspended_reason: 'Non-payment after grace period',
          })
          .eq('id', account.id);

        if (!updateError) {
          result.suspensions++;

          // Send suspension notification
          if (account.user_id) {
            await notificationService.triggerEvent('SUSPENSION_NOTICE', account.user_id, '', {
              service_type: 'Hosting',
              service_name: account.package_name || 'Hosting Account',
              reason: 'Payment not received after grace period',
            });
          }

          // Log suspension
          await supabase.from('renewal_logs').insert({
            entity_type: 'hosting',
            entity_id: account.id,
            old_expiry_date: account.expiry_date,
          });
        } else {
          result.errors.push(`Suspension failed for hosting ${account.id}: ${updateError.message}`);
        }
      }
    }
  }

  /**
   * Mark expired domains past grace period
   */
  private async suspendExpiredDomains(
    gracePeriodEnd: Date,
    result: RenewalProcessResult
  ): Promise<void> {
    const { data: expiredDomains, error } = await supabase
      .from('domains')
      .select('*')
      .in('status', ['active', 'registered'])
      .lt('expiry_date', gracePeriodEnd.toISOString().split('T')[0]);

    if (error) throw error;

    for (const domain of expiredDomains || []) {
      // Check if renewal invoice is paid
      const isPaid = await this.isRenewalInvoicePaid(domain.id, 'domain');

      if (!isPaid) {
        // Mark domain as expired
        const { error: updateError } = await supabase
          .from('domains')
          .update({ status: 'expired' })
          .eq('id', domain.id);

        if (!updateError) {
          result.suspensions++;

          // Send suspension notification
          if (domain.user_id) {
            await notificationService.triggerEvent('SUSPENSION_NOTICE', domain.user_id, '', {
              service_type: 'Domain',
              service_name: domain.domain_name,
              reason: 'Domain expired - renewal payment not received',
            });
          }

          // Log expiration
          await supabase.from('renewal_logs').insert({
            entity_type: 'domain',
            entity_id: domain.id,
            old_expiry_date: domain.expiry_date,
          });
        } else {
          result.errors.push(`Expiration failed for domain ${domain.id}: ${updateError.message}`);
        }
      }
    }
  }

  /**
   * Check if renewal invoice is paid
   */
  private async isRenewalInvoicePaid(entityId: string, entityType: string): Promise<boolean> {
    const { data: renewalLog } = await supabase
      .from('renewal_logs')
      .select('invoice_id')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .not('invoice_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!renewalLog?.invoice_id) return false;

    const { data: invoice } = await supabase
      .from('invoices')
      .select('status')
      .eq('id', renewalLog.invoice_id)
      .single();

    return invoice?.status === 'paid';
  }

  /**
   * Reactivate service after payment
   */
  async reactivateAfterPayment(
    entityId: string,
    entityType: 'hosting' | 'domain',
    billingMonths: number = 12
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const newExpiry = new Date();
      newExpiry.setMonth(newExpiry.getMonth() + billingMonths);
      const newExpiryDate = newExpiry.toISOString().split('T')[0];

      if (entityType === 'hosting') {
        // Get current data
        const { data: account } = await supabase
          .from('hosting_accounts')
          .select('expiry_date, user_id, package_name')
          .eq('id', entityId)
          .single();

        // Reactivate hosting account
        const { error } = await supabase
          .from('hosting_accounts')
          .update({
            status: 'active',
            expiry_date: newExpiryDate,
            suspended_reason: null,
          })
          .eq('id', entityId);

        if (error) throw error;

        // Log reactivation
        await supabase.from('renewal_logs').insert({
          entity_type: 'hosting',
          entity_id: entityId,
          old_expiry_date: account?.expiry_date,
          new_expiry_date: newExpiryDate,
        });

        // Send reactivation notification
        if (account?.user_id) {
          await notificationService.sendNotification({
            userId: account.user_id,
            type: 'email',
            recipient: '',
            subject: 'Service Reactivated',
            body: `Your hosting account (${account.package_name}) has been reactivated. New expiry date: ${newExpiryDate}`,
          });
        }
      } else {
        // Get current data
        const { data: domain } = await supabase
          .from('domains')
          .select('expiry_date, user_id, domain_name')
          .eq('id', entityId)
          .single();

        // Reactivate domain
        const { error } = await supabase
          .from('domains')
          .update({
            status: 'active',
            expiry_date: newExpiryDate,
          })
          .eq('id', entityId);

        if (error) throw error;

        // Log reactivation
        await supabase.from('renewal_logs').insert({
          entity_type: 'domain',
          entity_id: entityId,
          old_expiry_date: domain?.expiry_date,
          new_expiry_date: newExpiryDate,
        });

        // Send reactivation notification
        if (domain?.user_id) {
          await notificationService.sendNotification({
            userId: domain.user_id,
            type: 'email',
            recipient: '',
            subject: 'Domain Renewed',
            body: `Your domain ${domain.domain_name} has been renewed. New expiry date: ${newExpiryDate}`,
          });
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get renewal statistics for admin dashboard
   */
  async getRenewalStats(): Promise<{
    expiringIn7Days: number;
    expiringIn30Days: number;
    suspended: number;
    recentRenewals: RenewalLog[];
  }> {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const today = new Date().toISOString().split('T')[0];

    // Count hosting expiring in 7 days
    const { count: hosting7 } = await supabase
      .from('hosting_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('expiry_date', today)
      .lte('expiry_date', sevenDaysFromNow.toISOString().split('T')[0]);

    // Count domains expiring in 7 days
    const { count: domains7 } = await supabase
      .from('domains')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'registered'])
      .gte('expiry_date', today)
      .lte('expiry_date', sevenDaysFromNow.toISOString().split('T')[0]);

    // Count hosting expiring in 30 days
    const { count: hosting30 } = await supabase
      .from('hosting_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('expiry_date', today)
      .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0]);

    // Count domains expiring in 30 days
    const { count: domains30 } = await supabase
      .from('domains')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'registered'])
      .gte('expiry_date', today)
      .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0]);

    // Count suspended
    const { count: suspendedHosting } = await supabase
      .from('hosting_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'suspended');

    const { count: expiredDomains } = await supabase
      .from('domains')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'expired');

    // Recent renewal logs
    const { data: recentLogs } = await supabase
      .from('renewal_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      expiringIn7Days: (hosting7 || 0) + (domains7 || 0),
      expiringIn30Days: (hosting30 || 0) + (domains30 || 0),
      suspended: (suspendedHosting || 0) + (expiredDomains || 0),
      recentRenewals: recentLogs || [],
    };
  }

  /**
   * Log renewal run for audit
   */
  private async logRenewalRun(result: RenewalProcessResult): Promise<void> {
    console.log('[Renewal Automation]', result);

    // Could also insert into audit_logs table
    await supabase.from('audit_logs').insert({
      action: 'renewal_automation_run',
      entity_type: 'system',
      new_values: result as any,
    });
  }
}

export const renewalService = new RenewalService();
