import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceStatus = Database['public']['Enums']['invoice_status'];

export interface InvoiceWithDetails extends Invoice {
  order?: {
    order_number: string;
    service_type: string;
  };
  profile?: {
    full_name: string;
    company_name: string;
    address: string;
    phone: string;
  };
}

class InvoiceService {
  async getInvoices(userId: string, isAdmin: boolean = false): Promise<InvoiceWithDetails[]> {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        order:orders(order_number, service_type)
      `)
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as InvoiceWithDetails[];
  }

  async getInvoiceById(invoiceId: string): Promise<InvoiceWithDetails | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        order:orders(order_number, service_type)
      `)
      .eq('id', invoiceId)
      .single();

    if (error) throw error;
    return data as InvoiceWithDetails;
  }

  async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus): Promise<{ error: Error | null }> {
    try {
      const updateData: Partial<Invoice> = { status };

      if (status === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId);

      if (error) throw error;

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  // Generate invoice PDF data structure
  generateInvoicePDFData(invoice: InvoiceWithDetails): object {
    return {
      invoiceNumber: invoice.invoice_number,
      date: new Date(invoice.created_at).toLocaleDateString('bn-BD'),
      dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('bn-BD') : null,
      status: invoice.status,
      company: {
        name: 'Digiwebdex',
        address: 'Dhaka, Bangladesh',
        email: 'support@digiwebdex.com',
        phone: '+880 1234 567890',
      },
      client: {
        name: invoice.profile?.full_name || 'N/A',
        company: invoice.profile?.company_name,
        address: invoice.profile?.address,
        phone: invoice.profile?.phone,
      },
      items: [
        {
          description: `Order #${invoice.order?.order_number || 'N/A'}`,
          type: invoice.order?.service_type || 'service',
          amount: invoice.subtotal,
        },
      ],
      subtotal: invoice.subtotal,
      discount: invoice.discount,
      tax: invoice.tax,
      total: invoice.total,
      currency: invoice.currency,
      notes: invoice.notes,
    };
  }

  // Check for overdue invoices
  async checkOverdueInvoices(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    await supabase
      .from('invoices')
      .update({ status: 'overdue' })
      .eq('status', 'unpaid')
      .lt('due_date', today);
  }

  // Get invoice statistics for admin dashboard
  async getInvoiceStats(): Promise<{
    totalUnpaid: number;
    totalPaid: number;
    totalOverdue: number;
    recentInvoices: Invoice[];
  }> {
    const { data: unpaid } = await supabase
      .from('invoices')
      .select('total')
      .eq('status', 'unpaid');

    const { data: paid } = await supabase
      .from('invoices')
      .select('total')
      .eq('status', 'paid');

    const { data: overdue } = await supabase
      .from('invoices')
      .select('total')
      .eq('status', 'overdue');

    const { data: recent } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      totalUnpaid: (unpaid || []).reduce((sum, inv) => sum + Number(inv.total), 0),
      totalPaid: (paid || []).reduce((sum, inv) => sum + Number(inv.total), 0),
      totalOverdue: (overdue || []).reduce((sum, inv) => sum + Number(inv.total), 0),
      recentInvoices: recent || [],
    };
  }
}

export const invoiceService = new InvoiceService();
