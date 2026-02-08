import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];
type SubscriptionStatus = Database['public']['Enums']['subscription_status'];
type BillingCycle = Database['public']['Enums']['billing_cycle'];
type BillingHistory = Database['public']['Tables']['subscription_billing_history']['Row'];

export interface SubscriptionWithDetails extends Subscription {
  profile?: {
    full_name: string;
    email: string;
    phone: string;
  };
  billing_history?: BillingHistory[];
}

export interface SubscriptionStats {
  totalActive: number;
  totalSuspended: number;
  totalCancelled: number;
  mrr: number;
  arr: number;
  churnRate: number;
  renewalSuccessRate: number;
  upcomingRenewals: number;
}

export interface CreateSubscriptionData {
  user_id: string;
  service_type: string;
  plan_name: string;
  billing_cycle: BillingCycle;
  amount: number;
  hosting_account_id?: string;
  domain_id?: string;
  metadata?: Record<string, unknown>;
}

class SubscriptionService {
  // Get all subscriptions (admin)
  async getSubscriptions(filters?: {
    status?: SubscriptionStatus;
    service_type?: string;
  }): Promise<SubscriptionWithDetails[]> {
    let query = supabase
      .from('subscriptions')
      .select(`
        *,
        profile:profiles!subscriptions_user_id_fkey(full_name, email, phone)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.service_type) {
      query = query.eq('service_type', filters.service_type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as unknown as SubscriptionWithDetails[];
  }

  // Get user's subscriptions
  async getUserSubscriptions(userId: string): Promise<SubscriptionWithDetails[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        billing_history:subscription_billing_history(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as SubscriptionWithDetails[];
  }

  // Get subscription by ID
  async getSubscriptionById(subscriptionId: string): Promise<SubscriptionWithDetails | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        billing_history:subscription_billing_history(*)
      `)
      .eq('id', subscriptionId)
      .single();

    if (error) throw error;
    return data as unknown as SubscriptionWithDetails;
  }

  // Create subscription
  async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
    const nextBillingDate = this.calculateNextBillingDate(new Date(), data.billing_cycle);

    const subscriptionData: SubscriptionInsert = {
      user_id: data.user_id,
      service_type: data.service_type,
      plan_name: data.plan_name,
      billing_cycle: data.billing_cycle,
      amount: data.amount,
      next_billing_date: nextBillingDate.toISOString().split('T')[0],
      status: 'active',
      auto_renew: true,
      hosting_account_id: data.hosting_account_id,
      domain_id: data.domain_id,
      metadata: data.metadata as Database['public']['Tables']['subscriptions']['Insert']['metadata'],
    };

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (error) throw error;

    // Log creation
    await this.logAction(subscription.id, 'created', null, 'active', { initial: true });

    return subscription;
  }

  // Update subscription
  async updateSubscription(
    subscriptionId: string,
    updates: SubscriptionUpdate
  ): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Toggle auto-renew
  async toggleAutoRenew(subscriptionId: string, autoRenew: boolean): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .update({ auto_renew: autoRenew })
      .eq('id', subscriptionId);

    if (error) throw error;

    await this.logAction(subscriptionId, autoRenew ? 'auto_renew_enabled' : 'auto_renew_disabled');
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, reason?: string): Promise<void> {
    const subscription = await this.getSubscriptionById(subscriptionId);
    if (!subscription) throw new Error('Subscription not found');

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
        auto_renew: false,
      })
      .eq('id', subscriptionId);

    if (error) throw error;

    await this.logAction(subscriptionId, 'cancelled', subscription.status, 'cancelled', { reason });
  }

  // Suspend subscription
  async suspendSubscription(subscriptionId: string, reason?: string): Promise<void> {
    const subscription = await this.getSubscriptionById(subscriptionId);
    if (!subscription) throw new Error('Subscription not found');

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'suspended',
        suspended_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId);

    if (error) throw error;

    // If linked to hosting, suspend hosting account
    if (subscription.hosting_account_id) {
      await supabase
        .from('hosting_accounts')
        .update({ status: 'suspended', suspended_reason: reason || 'Payment overdue' })
        .eq('id', subscription.hosting_account_id);
    }

    await this.logAction(subscriptionId, 'suspended', subscription.status, 'suspended', { reason });
  }

  // Reactivate subscription after payment
  async reactivateSubscription(subscriptionId: string): Promise<void> {
    const subscription = await this.getSubscriptionById(subscriptionId);
    if (!subscription) throw new Error('Subscription not found');

    const nextBillingDate = this.calculateNextBillingDate(new Date(), subscription.billing_cycle);

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        suspended_at: null,
        failed_billing_attempts: 0,
        next_billing_date: nextBillingDate.toISOString().split('T')[0],
        last_billing_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', subscriptionId);

    if (error) throw error;

    // If linked to hosting, reactivate
    if (subscription.hosting_account_id) {
      await supabase
        .from('hosting_accounts')
        .update({ status: 'active', suspended_reason: null })
        .eq('id', subscription.hosting_account_id);
    }

    await this.logAction(subscriptionId, 'reactivated', subscription.status, 'active');
  }

  // Get subscription statistics
  async getSubscriptionStats(): Promise<SubscriptionStats> {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      activeResult,
      suspendedResult,
      cancelledResult,
      cancelledRecentResult,
      upcomingResult,
      billingSuccessResult,
    ] = await Promise.all([
      supabase.from('subscriptions').select('id, amount, billing_cycle').eq('status', 'active'),
      supabase.from('subscriptions').select('id').eq('status', 'suspended'),
      supabase.from('subscriptions').select('id').eq('status', 'cancelled'),
      supabase
        .from('subscriptions')
        .select('id')
        .eq('status', 'cancelled')
        .gte('cancelled_at', thirtyDaysAgo.toISOString()),
      supabase
        .from('subscriptions')
        .select('id')
        .eq('status', 'active')
        .lte('next_billing_date', thirtyDaysFromNow.toISOString().split('T')[0]),
      supabase
        .from('subscription_billing_history')
        .select('id, status')
        .gte('created_at', thirtyDaysAgo.toISOString()),
    ]);

    const activeSubscriptions = activeResult.data || [];
    const mrr = activeSubscriptions.reduce((sum, sub) => {
      let monthlyAmount = Number(sub.amount);
      if (sub.billing_cycle === 'quarterly') monthlyAmount = monthlyAmount / 3;
      if (sub.billing_cycle === 'yearly') monthlyAmount = monthlyAmount / 12;
      return sum + monthlyAmount;
    }, 0);

    const totalActiveAtStart = activeSubscriptions.length + (cancelledRecentResult.data?.length || 0);
    const churnRate = totalActiveAtStart > 0
      ? ((cancelledRecentResult.data?.length || 0) / totalActiveAtStart) * 100
      : 0;

    const billingHistory = billingSuccessResult.data || [];
    const successfulBillings = billingHistory.filter((b) => b.status === 'paid').length;
    const renewalSuccessRate = billingHistory.length > 0
      ? (successfulBillings / billingHistory.length) * 100
      : 100;

    return {
      totalActive: activeSubscriptions.length,
      totalSuspended: suspendedResult.data?.length || 0,
      totalCancelled: cancelledResult.data?.length || 0,
      mrr,
      arr: mrr * 12,
      churnRate,
      renewalSuccessRate,
      upcomingRenewals: upcomingResult.data?.length || 0,
    };
  }

  // Get billing history for subscription
  async getBillingHistory(subscriptionId: string): Promise<BillingHistory[]> {
    const { data, error } = await supabase
      .from('subscription_billing_history')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('billing_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Helper: Calculate next billing date
  private calculateNextBillingDate(fromDate: Date, cycle: BillingCycle): Date {
    const date = new Date(fromDate);
    switch (cycle) {
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date;
  }

  // Helper: Log subscription action
  private async logAction(
    subscriptionId: string,
    action: string,
    oldStatus?: SubscriptionStatus | null,
    newStatus?: SubscriptionStatus,
    details?: Record<string, unknown>
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('subscription_logs').insert({
      subscription_id: subscriptionId,
      action,
      old_status: oldStatus,
      new_status: newStatus,
      details: details as Database['public']['Tables']['subscription_logs']['Insert']['details'],
      performed_by: user?.id,
    });
  }
}

export const subscriptionService = new SubscriptionService();
