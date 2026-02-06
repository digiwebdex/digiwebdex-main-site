import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

const REFERRAL_COOKIE_NAME = 'dwx_ref';
const CLICK_ID_COOKIE_NAME = 'dwx_click_id';
const COOKIE_EXPIRY_DAYS = 30;

export interface AffiliateProfile {
  id: string;
  user_id: string;
  referral_code: string;
  commission_rate: number;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  payment_method: string | null;
  payment_details: Json;
  total_clicks: number;
  total_conversions: number;
  total_earnings: number;
  pending_earnings: number;
  withdrawable_earnings: number;
  withdrawn_earnings: number;
  grace_period_days: number;
  min_withdrawal_amount: number;
  created_at: string;
}

export interface AffiliateStats {
  totalClicks: number;
  todayClicks: number;
  weekClicks: number;
  monthClicks: number;
  totalConversions: number;
  conversionRate: number;
  pendingEarnings: number;
  withdrawableEarnings: number;
  totalEarnings: number;
  withdrawnEarnings: number;
}

export interface Commission {
  id: string;
  order_id: string;
  order_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  grace_period_ends_at: string | null;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  payment_method: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
  processed_at: string | null;
}

// Cookie utilities
function setCookie(name: string, value: string, days: number): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
}

// Device detection
function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

class AffiliateService {
  // Track a referral click
  async trackClick(referralCode: string): Promise<string | null> {
    try {
      // Check if this is a valid referral code
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliates')
        .select('id, user_id, status, total_clicks')
        .eq('referral_code', referralCode)
        .eq('status', 'active')
        .single();

      if (affiliateError || !affiliate) {
        console.warn('Invalid or inactive referral code:', referralCode);
        return null;
      }

      // Prevent self-referral - check if current user is the affiliate
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === affiliate.user_id) {
        console.warn('Self-referral attempt blocked');
        return null;
      }

      // Record the click
      const { data: click, error: clickError } = await supabase
        .from('affiliate_clicks')
        .insert({
          affiliate_id: affiliate.id,
          ip_address: null, // Will be set by edge function if needed
          user_agent: navigator.userAgent,
          referrer_url: document.referrer || null,
          landing_page: window.location.href,
          device_type: getDeviceType(),
        })
        .select('id')
        .single();

      if (clickError) {
        console.error('Failed to record affiliate click:', clickError);
        return null;
      }

      // Update click count directly
      await supabase
        .from('affiliates')
        .update({ total_clicks: (affiliate.total_clicks || 0) + 1 })
        .eq('id', affiliate.id);

      // Set cookies for tracking
      setCookie(REFERRAL_COOKIE_NAME, referralCode, COOKIE_EXPIRY_DAYS);
      setCookie(CLICK_ID_COOKIE_NAME, click.id, COOKIE_EXPIRY_DAYS);

      return click.id;
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
      return null;
    }
  }

  // Get stored referral code from cookie
  getStoredReferralCode(): string | null {
    return getCookie(REFERRAL_COOKIE_NAME);
  }

  // Get stored click ID from cookie
  getStoredClickId(): string | null {
    return getCookie(CLICK_ID_COOKIE_NAME);
  }

  // Clear referral cookies (after conversion or expiry)
  clearReferralCookies(): void {
    deleteCookie(REFERRAL_COOKIE_NAME);
    deleteCookie(CLICK_ID_COOKIE_NAME);
  }

  // Process commission on successful order payment
  async processOrderCommission(
    orderId: string,
    orderAmount: number,
    orderUserId: string
  ): Promise<{ success: boolean; commissionId?: string; error?: string }> {
    try {
      const referralCode = this.getStoredReferralCode();
      const clickId = this.getStoredClickId();

      if (!referralCode) {
        return { success: false, error: 'No referral code found' };
      }

      // Get affiliate
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('referral_code', referralCode)
        .eq('status', 'active')
        .single();

      if (affiliateError || !affiliate) {
        return { success: false, error: 'Invalid or inactive affiliate' };
      }

      // Fraud prevention: Check if order user is the affiliate (self-purchase)
      if (affiliate.user_id === orderUserId) {
        console.warn('Self-purchase detected, commission blocked');
        this.clearReferralCookies();
        return { success: false, error: 'Self-purchase not eligible for commission' };
      }

      // Check for duplicate commission
      const { data: existingCommission } = await supabase
        .from('affiliate_commissions')
        .select('id')
        .eq('order_id', orderId)
        .single();

      if (existingCommission) {
        return { success: false, error: 'Commission already processed for this order' };
      }

      // Calculate commission
      const commissionRate = affiliate.commission_rate;
      const commissionAmount = (orderAmount * commissionRate) / 100;

      // Calculate grace period end date
      const gracePeriodEndsAt = new Date();
      gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + affiliate.grace_period_days);

      // Create commission record
      const { data: commission, error: commissionError } = await supabase
        .from('affiliate_commissions')
        .insert({
          affiliate_id: affiliate.id,
          order_id: orderId,
          click_id: clickId,
          order_amount: orderAmount,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          status: 'pending',
          grace_period_ends_at: gracePeriodEndsAt.toISOString(),
        })
        .select('id')
        .single();

      if (commissionError) {
        console.error('Failed to create commission:', commissionError);
        return { success: false, error: 'Failed to create commission record' };
      }

      // Update click as converted
      if (clickId) {
        await supabase
          .from('affiliate_clicks')
          .update({ converted: true, conversion_order_id: orderId })
          .eq('id', clickId);
      }

      // Update affiliate stats
      await supabase
        .from('affiliates')
        .update({
          total_conversions: affiliate.total_conversions + 1,
          pending_earnings: affiliate.pending_earnings + commissionAmount,
          total_earnings: affiliate.total_earnings + commissionAmount,
        })
        .eq('id', affiliate.id);

      // Clear cookies after successful conversion
      this.clearReferralCookies();

      return { success: true, commissionId: commission.id };
    } catch (error) {
      console.error('Error processing order commission:', error);
      return { success: false, error: 'Unexpected error processing commission' };
    }
  }

  // Get or create affiliate profile
  async getOrCreateAffiliateProfile(userId: string): Promise<AffiliateProfile | null> {
    try {
      // Try to get existing profile
      const { data: existing, error: existingError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing) {
        return existing as AffiliateProfile;
      }

      // Generate referral code
      const { data: codeData } = await supabase.rpc('generate_referral_code');
      const referralCode = codeData || Math.random().toString(36).substring(2, 10).toUpperCase();

      // Create new affiliate profile
      const { data: newAffiliate, error: createError } = await supabase
        .from('affiliates')
        .insert({
          user_id: userId,
          referral_code: referralCode,
        })
        .select('*')
        .single();

      if (createError) {
        console.error('Failed to create affiliate profile:', createError);
        return null;
      }

      return newAffiliate as AffiliateProfile;
    } catch (error) {
      console.error('Error getting/creating affiliate profile:', error);
      return null;
    }
  }

  // Get affiliate stats
  async getAffiliateStats(affiliateId: string): Promise<AffiliateStats | null> {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [
        affiliateResult,
        todayClicksResult,
        weekClicksResult,
        monthClicksResult,
      ] = await Promise.all([
        supabase
          .from('affiliates')
          .select('*')
          .eq('id', affiliateId)
          .single(),
        supabase
          .from('affiliate_clicks')
          .select('id', { count: 'exact', head: true })
          .eq('affiliate_id', affiliateId)
          .gte('created_at', todayStart),
        supabase
          .from('affiliate_clicks')
          .select('id', { count: 'exact', head: true })
          .eq('affiliate_id', affiliateId)
          .gte('created_at', weekStart),
        supabase
          .from('affiliate_clicks')
          .select('id', { count: 'exact', head: true })
          .eq('affiliate_id', affiliateId)
          .gte('created_at', monthStart),
      ]);

      if (affiliateResult.error || !affiliateResult.data) {
        return null;
      }

      const affiliate = affiliateResult.data;
      const conversionRate = affiliate.total_clicks > 0
        ? (affiliate.total_conversions / affiliate.total_clicks) * 100
        : 0;

      return {
        totalClicks: affiliate.total_clicks,
        todayClicks: todayClicksResult.count || 0,
        weekClicks: weekClicksResult.count || 0,
        monthClicks: monthClicksResult.count || 0,
        totalConversions: affiliate.total_conversions,
        conversionRate: Math.round(conversionRate * 100) / 100,
        pendingEarnings: affiliate.pending_earnings,
        withdrawableEarnings: affiliate.withdrawable_earnings,
        totalEarnings: affiliate.total_earnings,
        withdrawnEarnings: affiliate.withdrawn_earnings,
      };
    } catch (error) {
      console.error('Error getting affiliate stats:', error);
      return null;
    }
  }

  // Get commissions list
  async getCommissions(affiliateId: string): Promise<Commission[]> {
    const { data, error } = await supabase
      .from('affiliate_commissions')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching commissions:', error);
      return [];
    }

    return data as Commission[];
  }

  // Get withdrawals list
  async getWithdrawals(affiliateId: string): Promise<WithdrawalRequest[]> {
    const { data, error } = await supabase
      .from('affiliate_withdrawals')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching withdrawals:', error);
      return [];
    }

    return data as WithdrawalRequest[];
  }

  // Request withdrawal
  async requestWithdrawal(
    affiliateId: string,
    amount: number,
    paymentMethod: string,
    paymentDetails: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get affiliate to check eligibility
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('id', affiliateId)
        .single();

      if (affiliateError || !affiliate) {
        return { success: false, error: 'Affiliate not found' };
      }

      if (affiliate.status !== 'active') {
        return { success: false, error: 'Affiliate account is not active' };
      }

      if (amount > affiliate.withdrawable_earnings) {
        return { success: false, error: 'Insufficient withdrawable balance' };
      }

      if (amount < affiliate.min_withdrawal_amount) {
        return { success: false, error: `Minimum withdrawal amount is ৳${affiliate.min_withdrawal_amount}` };
      }

      // Check for pending withdrawals
      const { data: pendingWithdrawals } = await supabase
        .from('affiliate_withdrawals')
        .select('id')
        .eq('affiliate_id', affiliateId)
        .in('status', ['pending', 'processing']);

      if (pendingWithdrawals && pendingWithdrawals.length > 0) {
        return { success: false, error: 'You have a pending withdrawal request' };
      }

      // Create withdrawal request
      const { error: withdrawalError } = await supabase
        .from('affiliate_withdrawals')
        .insert([{
          affiliate_id: affiliateId,
          amount,
          payment_method: paymentMethod,
          payment_details: paymentDetails as Json,
        }]);

      if (withdrawalError) {
        console.error('Failed to create withdrawal:', withdrawalError);
        return { success: false, error: 'Failed to create withdrawal request' };
      }

      // Deduct from withdrawable (will be finalized when processed)
      await supabase
        .from('affiliates')
        .update({
          withdrawable_earnings: affiliate.withdrawable_earnings - amount,
        })
        .eq('id', affiliateId);

      return { success: true };
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      return { success: false, error: 'Unexpected error' };
    }
  }

  // Update affiliate payment details
  async updatePaymentDetails(
    affiliateId: string,
    paymentMethod: string,
    paymentDetails: Json
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('affiliates')
      .update({
        payment_method: paymentMethod,
        payment_details: paymentDetails,
      })
      .eq('id', affiliateId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  // Generate referral link
  getReferralLink(referralCode: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}?ref=${referralCode}`;
  }
}

export const affiliateService = new AffiliateService();
