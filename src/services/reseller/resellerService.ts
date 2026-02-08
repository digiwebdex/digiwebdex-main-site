import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface ResellerProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_logo_url: string | null;
  brand_color: string;
  commission_type: 'fixed' | 'percentage';
  commission_rate: number;
  balance: number;
  pending_earnings: number;
  total_earnings: number;
  withdrawn_earnings: number;
  min_withdrawal_amount: number;
  status: 'pending' | 'active' | 'suspended';
  approved_at: string | null;
  approved_by: string | null;
  notes: string | null;
  payment_method: string | null;
  payment_details: Json;
  created_at: string;
  updated_at: string;
}

export interface ResellerClient {
  id: string;
  reseller_id: string;
  client_user_id: string;
  created_at: string;
}

export interface ResellerEarning {
  id: string;
  reseller_id: string;
  order_id: string;
  client_user_id: string | null;
  order_amount: number;
  commission_type: 'fixed' | 'percentage';
  commission_rate: number;
  earning_amount: number;
  status: 'pending' | 'approved' | 'paid';
  approved_at: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResellerWithdrawal {
  id: string;
  reseller_id: string;
  amount: number;
  payment_method: string;
  payment_details: Json;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  transaction_id: string | null;
  processed_by: string | null;
  processed_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResellerStats {
  totalClients: number;
  totalEarnings: number;
  pendingEarnings: number;
  withdrawableBalance: number;
  totalWithdrawn: number;
  totalOrders: number;
  monthlyEarnings: number;
}

class ResellerService {
  // Get current user's reseller profile
  async getProfile(): Promise<ResellerProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('resellers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching reseller profile:', error);
      return null;
    }

    return data as ResellerProfile | null;
  }

  // Apply to become a reseller
  async applyAsReseller(companyName: string, paymentMethod?: string, paymentDetails?: Record<string, unknown>): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Check if already a reseller
    const existing = await this.getProfile();
    if (existing) {
      return { success: false, error: 'Already registered as a reseller' };
    }

    const { error } = await supabase
      .from('resellers')
      .insert({
        user_id: user.id,
        company_name: companyName,
        payment_method: paymentMethod,
        payment_details: (paymentDetails || {}) as Json,
      } as never);

    if (error) {
      console.error('Error applying as reseller:', error);
      return { success: false, error: error.message };
    }

    // Add reseller role to user
    await supabase
      .from('user_roles')
      .insert({ user_id: user.id, role: 'reseller' } as never)
      .select();

    return { success: true };
  }

  // Update reseller profile (logo, brand color, payment info)
  async updateProfile(updates: Partial<Omit<ResellerProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<{ success: boolean; error?: string }> {
    const profile = await this.getProfile();
    if (!profile) return { success: false, error: 'Reseller profile not found' };

    const { error } = await supabase
      .from('resellers')
      .update(updates as never)
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating reseller profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  // Upload reseller logo
  async uploadLogo(file: File): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('reseller-logos')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('reseller-logos')
      .getPublicUrl(fileName);

    // Update profile with new logo URL
    await this.updateProfile({ company_logo_url: urlData.publicUrl });

    return urlData.publicUrl;
  }

  // Get reseller stats
  async getStats(): Promise<ResellerStats | null> {
    const profile = await this.getProfile();
    if (!profile) return null;

    // Get client count
    const { count: clientCount } = await supabase
      .from('reseller_clients')
      .select('*', { count: 'exact', head: true })
      .eq('reseller_id', profile.id);

    // Get order count
    const { count: orderCount } = await supabase
      .from('reseller_earnings')
      .select('*', { count: 'exact', head: true })
      .eq('reseller_id', profile.id);

    // Get monthly earnings (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyData } = await supabase
      .from('reseller_earnings')
      .select('earning_amount')
      .eq('reseller_id', profile.id)
      .gte('created_at', startOfMonth.toISOString());

    const monthlyEarnings = monthlyData?.reduce((sum, e) => sum + Number(e.earning_amount), 0) || 0;

    return {
      totalClients: clientCount || 0,
      totalEarnings: profile.total_earnings,
      pendingEarnings: profile.pending_earnings,
      withdrawableBalance: profile.balance,
      totalWithdrawn: profile.withdrawn_earnings,
      totalOrders: orderCount || 0,
      monthlyEarnings,
    };
  }

  // Get reseller's clients
  async getClients(): Promise<ResellerClient[]> {
    const profile = await this.getProfile();
    if (!profile) return [];

    const { data, error } = await supabase
      .from('reseller_clients')
      .select('*')
      .eq('reseller_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
      return [];
    }

    return data as ResellerClient[];
  }

  // Create a client account under this reseller
  async createClientAccount(email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string; userId?: string }> {
    const profile = await this.getProfile();
    if (!profile) return { success: false, error: 'Reseller profile not found' };
    if (profile.status !== 'active') return { success: false, error: 'Reseller account is not active' };

    // Prevent self-referral
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email === email) {
      return { success: false, error: 'Cannot add yourself as a client' };
    }

    // Create new user account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, created_by_reseller: profile.id },
      },
    });

    if (signUpError) {
      // If user already exists, we can't add them via client-side
      if (signUpError.message.includes('already registered')) {
        return { success: false, error: 'User with this email already exists. Ask them to link their account.' };
      }
      return { success: false, error: signUpError.message };
    }

    if (!signUpData.user) {
      return { success: false, error: 'Failed to create user account' };
    }

    const clientUserId = signUpData.user.id;

    // Link client to reseller
    const { error: linkError } = await supabase
      .from('reseller_clients')
      .insert({
        reseller_id: profile.id,
        client_user_id: clientUserId,
      } as never);

    if (linkError) {
      console.error('Error linking client:', linkError);
      return { success: false, error: linkError.message };
    }

    // Log the action
    await this.logAction(profile.id, 'client_added', { client_user_id: clientUserId, email });

    return { success: true, userId: clientUserId };
  }

  // Get earnings history
  async getEarnings(status?: 'pending' | 'approved' | 'paid'): Promise<ResellerEarning[]> {
    const profile = await this.getProfile();
    if (!profile) return [];

    const { data, error } = await supabase
      .from('reseller_earnings')
      .select('*')
      .eq('reseller_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching earnings:', error);
      return [];
    }

    const earnings = data as ResellerEarning[];
    return status ? earnings.filter(e => e.status === status) : earnings;
  }

  // Request withdrawal
  async requestWithdrawal(amount: number, paymentMethod: string, paymentDetails?: Record<string, unknown>): Promise<{ success: boolean; error?: string }> {
    const profile = await this.getProfile();
    if (!profile) return { success: false, error: 'Reseller profile not found' };
    if (profile.status !== 'active') return { success: false, error: 'Reseller account is not active' };
    if (amount > profile.balance) return { success: false, error: 'Insufficient balance' };
    if (amount < profile.min_withdrawal_amount) {
      return { success: false, error: `Minimum withdrawal amount is ৳${profile.min_withdrawal_amount}` };
    }

    const { error } = await supabase
      .from('reseller_withdrawals')
      .insert({
        reseller_id: profile.id,
        amount,
        payment_method: paymentMethod,
        payment_details: (paymentDetails || profile.payment_details) as Json,
      } as never);

    if (error) {
      console.error('Error requesting withdrawal:', error);
      return { success: false, error: error.message };
    }

    // Log the action
    await this.logAction(profile.id, 'withdrawal_requested', { amount, payment_method: paymentMethod });

    return { success: true };
  }

  // Get withdrawal history
  async getWithdrawals(): Promise<ResellerWithdrawal[]> {
    const profile = await this.getProfile();
    if (!profile) return [];

    const { data, error } = await supabase
      .from('reseller_withdrawals')
      .select('*')
      .eq('reseller_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching withdrawals:', error);
      return [];
    }

    return data as ResellerWithdrawal[];
  }

  // Calculate commission for an order
  calculateCommission(orderAmount: number, commissionType: 'fixed' | 'percentage', commissionRate: number): number {
    if (commissionType === 'fixed') {
      return commissionRate;
    }
    return (orderAmount * commissionRate) / 100;
  }

  // Create earning entry (called when a client places an order)
  async createEarning(orderId: string, clientUserId: string, orderAmount: number): Promise<{ success: boolean; error?: string }> {
    // Find reseller for this client
    const { data: clientData } = await supabase
      .from('reseller_clients')
      .select('reseller_id')
      .eq('client_user_id', clientUserId)
      .maybeSingle();

    if (!clientData) {
      // Client not under any reseller
      return { success: true };
    }

    // Get reseller info
    const { data: reseller } = await supabase
      .from('resellers')
      .select('*')
      .eq('id', clientData.reseller_id)
      .single();

    if (!reseller || reseller.status !== 'active') {
      return { success: true };
    }

    const earningAmount = this.calculateCommission(
      orderAmount,
      reseller.commission_type as 'fixed' | 'percentage',
      reseller.commission_rate
    );

    const { error } = await supabase
      .from('reseller_earnings')
      .insert({
        reseller_id: reseller.id,
        order_id: orderId,
        client_user_id: clientUserId,
        order_amount: orderAmount,
        commission_type: reseller.commission_type,
        commission_rate: reseller.commission_rate,
        earning_amount: earningAmount,
        status: 'pending',
      } as never);

    if (error) {
      console.error('Error creating earning:', error);
      return { success: false, error: error.message };
    }

    // Update pending earnings
    await supabase
      .from('resellers')
      .update({
        pending_earnings: reseller.pending_earnings + earningAmount,
      } as never)
      .eq('id', reseller.id);

    return { success: true };
  }

  // Log reseller action for audit
  private async logAction(resellerId: string, action: string, details: Record<string, unknown>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from('reseller_logs')
      .insert({
        reseller_id: resellerId,
        action,
        performed_by: user?.id,
        details: details as Json,
      } as never);
  }

  // ========== ADMIN FUNCTIONS ==========

  // Get all resellers (admin only)
  async getAllResellers(status?: 'pending' | 'active' | 'suspended'): Promise<ResellerProfile[]> {
    let query = supabase
      .from('resellers')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching resellers:', error);
      return [];
    }

    return data as ResellerProfile[];
  }

  // Approve reseller (admin only)
  async approveReseller(resellerId: string, commissionType?: 'fixed' | 'percentage', commissionRate?: number): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const updates: Record<string, unknown> = {
      status: 'active',
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    };

    if (commissionType) updates.commission_type = commissionType;
    if (commissionRate !== undefined) updates.commission_rate = commissionRate;

    const { error } = await supabase
      .from('resellers')
      .update(updates as never)
      .eq('id', resellerId);

    if (error) {
      console.error('Error approving reseller:', error);
      return { success: false, error: error.message };
    }

    await this.logAction(resellerId, 'approved', { approved_by: user.id });

    return { success: true };
  }

  // Suspend reseller (admin only)
  async suspendReseller(resellerId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('resellers')
      .update({
        status: 'suspended',
        notes: reason,
      } as never)
      .eq('id', resellerId);

    if (error) {
      console.error('Error suspending reseller:', error);
      return { success: false, error: error.message };
    }

    await this.logAction(resellerId, 'suspended', { reason, by: user?.id });

    return { success: true };
  }

  // Update reseller commission (admin only)
  async updateCommission(resellerId: string, commissionType: 'fixed' | 'percentage', commissionRate: number): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('resellers')
      .update({
        commission_type: commissionType,
        commission_rate: commissionRate,
      } as never)
      .eq('id', resellerId);

    if (error) {
      console.error('Error updating commission:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  // Approve earning (admin only)
  async approveEarning(earningId: string): Promise<{ success: boolean; error?: string }> {
    const { data: earning } = await supabase
      .from('reseller_earnings')
      .select('*')
      .eq('id', earningId)
      .single();

    if (!earning) return { success: false, error: 'Earning not found' };

    const { error } = await supabase
      .from('reseller_earnings')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      } as never)
      .eq('id', earningId);

    if (error) {
      console.error('Error approving earning:', error);
      return { success: false, error: error.message };
    }

    // Move from pending to balance
    const { data: reseller } = await supabase
      .from('resellers')
      .select('pending_earnings, balance, total_earnings')
      .eq('id', earning.reseller_id)
      .single();

    if (reseller) {
      await supabase
        .from('resellers')
        .update({
          pending_earnings: reseller.pending_earnings - Number(earning.earning_amount),
          balance: reseller.balance + Number(earning.earning_amount),
          total_earnings: reseller.total_earnings + Number(earning.earning_amount),
        } as never)
        .eq('id', earning.reseller_id);
    }

    return { success: true };
  }

  // Process withdrawal (admin only)
  async processWithdrawal(withdrawalId: string, transactionId: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: withdrawal } = await supabase
      .from('reseller_withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (!withdrawal) return { success: false, error: 'Withdrawal not found' };

    const { error } = await supabase
      .from('reseller_withdrawals')
      .update({
        status: 'completed',
        transaction_id: transactionId,
        processed_by: user.id,
        processed_at: new Date().toISOString(),
      } as never)
      .eq('id', withdrawalId);

    if (error) {
      console.error('Error processing withdrawal:', error);
      return { success: false, error: error.message };
    }

    // Update reseller balance
    const { data: reseller } = await supabase
      .from('resellers')
      .select('balance, withdrawn_earnings')
      .eq('id', withdrawal.reseller_id)
      .single();

    if (reseller) {
      await supabase
        .from('resellers')
        .update({
          balance: reseller.balance - Number(withdrawal.amount),
          withdrawn_earnings: reseller.withdrawn_earnings + Number(withdrawal.amount),
        } as never)
        .eq('id', withdrawal.reseller_id);
    }

    await this.logAction(withdrawal.reseller_id, 'withdrawal_paid', { amount: withdrawal.amount, transaction_id: transactionId });

    return { success: true };
  }

  // Reject withdrawal (admin only)
  async rejectWithdrawal(withdrawalId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('reseller_withdrawals')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        processed_by: user?.id,
        processed_at: new Date().toISOString(),
      } as never)
      .eq('id', withdrawalId);

    if (error) {
      console.error('Error rejecting withdrawal:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  // Get all withdrawals (admin only)
  async getAllWithdrawals(status?: 'pending' | 'processing' | 'completed' | 'rejected'): Promise<ResellerWithdrawal[]> {
    let query = supabase
      .from('reseller_withdrawals')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching withdrawals:', error);
      return [];
    }

    return data as ResellerWithdrawal[];
  }

  // Get all earnings (admin only)
  async getAllEarnings(): Promise<ResellerEarning[]> {
    const { data, error } = await supabase
      .from('reseller_earnings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching earnings:', error);
      return [];
    }

    return data as ResellerEarning[];
  }

  // Get admin stats
  async getAdminStats(): Promise<{
    totalResellers: number;
    activeResellers: number;
    pendingResellers: number;
    totalRevenue: number;
    pendingPayouts: number;
  }> {
    const { count: totalResellers } = await supabase
      .from('resellers')
      .select('*', { count: 'exact', head: true });

    const { count: activeResellers } = await supabase
      .from('resellers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: pendingResellers } = await supabase
      .from('resellers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { data: earningsData } = await supabase
      .from('reseller_earnings')
      .select('earning_amount')
      .eq('status', 'approved');

    const totalRevenue = earningsData?.reduce((sum, e) => sum + Number(e.earning_amount), 0) || 0;

    const { data: pendingData } = await supabase
      .from('reseller_withdrawals')
      .select('amount')
      .eq('status', 'pending');

    const pendingPayouts = pendingData?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;

    return {
      totalResellers: totalResellers || 0,
      activeResellers: activeResellers || 0,
      pendingResellers: pendingResellers || 0,
      totalRevenue,
      pendingPayouts,
    };
  }
}

export const resellerService = new ResellerService();
