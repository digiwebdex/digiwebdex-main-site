import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Payment = Database['public']['Tables']['payments']['Row'];
type PaymentGateway = Database['public']['Enums']['payment_gateway'];
type PaymentStatus = Database['public']['Enums']['payment_status'];

export interface InitiatePaymentParams {
  invoiceId: string;
  orderId: string;
  amount: number;
  gateway: PaymentGateway;
  currency?: string;
}

export interface SSLCommerzConfig {
  storeId: string;
  storePassword: string;
  isSandbox: boolean;
}

export interface BankTransferDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  routingNumber?: string;
}

class PaymentService {
  // Bank transfer account details (can be configured in admin)
  private bankDetails: BankTransferDetails = {
    bankName: 'Dutch-Bangla Bank Limited',
    accountName: 'Digiwebdex',
    accountNumber: '1234567890123',
    branch: 'Dhaka Branch',
    routingNumber: '090123456',
  };

  async initiatePayment(params: InitiatePaymentParams, userId: string): Promise<{ data: Payment | null; error: Error | null }> {
    try {
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const { data: payment, error } = await supabase
        .from('payments')
        .insert({
          transaction_id: transactionId,
          invoice_id: params.invoiceId,
          order_id: params.orderId,
          user_id: userId,
          gateway: params.gateway,
          status: 'pending',
          amount: params.amount,
          currency: params.currency || 'BDT',
        })
        .select()
        .single();

      if (error) throw error;

      return { data: payment, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  }

  // SSLCommerz Integration - INACTIVE (Structure ready for future activation)
  // To activate: Configure API keys in admin settings and enable integration
  private sslcommerzEnabled = false;

  async initiateSSLCommerzPayment(payment: Payment): Promise<{ redirectUrl: string | null; error: Error | null }> {
    // Gateway is currently disabled - return informative error
    if (!this.sslcommerzEnabled) {
      return { 
        redirectUrl: null, 
        error: new Error('SSLCommerz gateway is currently disabled. Please use manual payment methods (bKash Personal or Bank Transfer).') 
      };
    }

    try {
      // Structure ready for future implementation
      const paymentData = {
        store_id: 'your_store_id', // From secrets
        store_passwd: 'your_store_password', // From secrets
        total_amount: payment.amount,
        currency: payment.currency,
        tran_id: payment.transaction_id,
        success_url: `${window.location.origin}/payment/success`,
        fail_url: `${window.location.origin}/payment/fail`,
        cancel_url: `${window.location.origin}/payment/cancel`,
        ipn_url: `${window.location.origin}/api/payment/ipn`,
      };

      console.log('SSLCommerz payment data:', paymentData);
      return { redirectUrl: null, error: new Error('SSLCommerz integration not yet configured.') };
    } catch (err) {
      return { redirectUrl: null, error: err as Error };
    }
  }

  // bKash API Integration - INACTIVE (Structure ready for future activation)
  // To activate: Configure API keys in admin settings and enable integration
  private bkashApiEnabled = false;

  async initiateBKashPayment(payment: Payment): Promise<{ paymentId: string | null; error: Error | null }> {
    // Gateway is currently disabled - return informative error
    if (!this.bkashApiEnabled) {
      return { 
        paymentId: null, 
        error: new Error('bKash API gateway is currently disabled. Please use bKash Personal (manual payment) instead.') 
      };
    }

    try {
      // Structure ready for future implementation
      const bkashData = {
        mode: '0011',
        payerReference: payment.user_id,
        callbackURL: `${window.location.origin}/payment/bkash/callback`,
        amount: payment.amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: payment.transaction_id,
      };

      console.log('bKash payment data:', bkashData);
      return { paymentId: null, error: new Error('bKash API integration not yet configured.') };
    } catch (err) {
      return { paymentId: null, error: err as Error };
    }
  }

  // Nagad API Integration - INACTIVE (Structure ready for future activation)
  // To activate: Configure API keys in admin settings and enable integration
  private nagadEnabled = false;

  async initiateNagadPayment(payment: Payment): Promise<{ redirectUrl: string | null; error: Error | null }> {
    // Gateway is currently disabled - return informative error
    if (!this.nagadEnabled) {
      return { 
        redirectUrl: null, 
        error: new Error('Nagad gateway is currently disabled. Please use manual payment methods (bKash Personal or Bank Transfer).') 
      };
    }

    try {
      // Structure ready for future implementation
      const nagadData = {
        merchantId: 'your_merchant_id',
        orderId: payment.transaction_id,
        currencyCode: '050',
        amount: payment.amount.toString(),
        challenge: 'generated_challenge',
        callBackUrl: `${window.location.origin}/payment/nagad/callback`,
      };

      console.log('Nagad payment data:', nagadData);
      return { redirectUrl: null, error: new Error('Nagad integration not yet configured.') };
    } catch (err) {
      return { redirectUrl: null, error: err as Error };
    }
  }

  // Check if any API gateway is enabled
  isApiGatewayEnabled(): boolean {
    return this.sslcommerzEnabled || this.bkashApiEnabled || this.nagadEnabled;
  }

  // Get available payment methods (for UI)
  getAvailablePaymentMethods(): string[] {
    const methods: string[] = ['bkash_personal', 'bank_transfer']; // Manual methods always available
    if (this.sslcommerzEnabled) methods.push('sslcommerz');
    if (this.bkashApiEnabled) methods.push('bkash');
    if (this.nagadEnabled) methods.push('nagad');
    return methods;
  }

  // Bank Transfer - Manual Payment
  async submitBankTransferProof(paymentId: string, proofUrl: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          bank_transfer_proof_url: proofUrl,
          gateway_response: {
            type: 'bank_transfer',
            proof_submitted_at: new Date().toISOString(),
            status: 'awaiting_verification',
          },
        })
        .eq('id', paymentId);

      if (error) throw error;

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  // Admin: Verify bank transfer
  async verifyBankTransfer(paymentId: string, adminId: string, approved: boolean): Promise<{ error: Error | null }> {
    try {
      const status: PaymentStatus = approved ? 'success' : 'failed';

      const { data: payment, error: fetchError } = await supabase
        .from('payments')
        .select('order_id, invoice_id')
        .eq('id', paymentId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('payments')
        .update({
          status,
          verified_by: adminId,
          verified_at: new Date().toISOString(),
          gateway_response: {
            verified: approved,
            verified_at: new Date().toISOString(),
            verified_by: adminId,
          },
        })
        .eq('id', paymentId);

      if (error) throw error;

      // Update order and invoice if approved
      if (approved && payment) {
        if (payment.order_id) {
          await supabase
            .from('orders')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('id', payment.order_id);
        }

        if (payment.invoice_id) {
          await supabase
            .from('invoices')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('id', payment.invoice_id);
        }
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  getBankTransferDetails(): BankTransferDetails {
    return this.bankDetails;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getPaymentById(paymentId: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) throw error;
    return data;
  }
}

export const paymentService = new PaymentService();
