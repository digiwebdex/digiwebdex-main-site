import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];
type InvoiceStatus = Database['public']['Enums']['invoice_status'];
type ServiceType = Database['public']['Enums']['service_type'];

export interface OrderItem {
  type: ServiceType;
  package: string;
  domain?: string;
  description?: string;
  price: number;
  qty?: number;
  renewalDate?: string;
}

export interface CreateMultiItemOrderParams {
  userId: string;
  serviceId?: string;
  packageId?: string;
  serviceType?: ServiceType;
  items: OrderItem[];
  discount?: number;
  tax?: number;
  advance?: number;
  notes?: string;
  couponCode?: string;
}

export interface MultiItemOrderResult {
  order: Database['public']['Tables']['orders']['Row'];
  invoice: Database['public']['Tables']['invoices']['Row'];
}

/**
 * Creates a single order with multiple line items.
 * The DB trigger `auto_generate_invoice` fires on order INSERT and creates the invoice automatically.
 * We then find that invoice and attach invoice_items to it, plus update financials.
 */
export async function createOrderWithItems(
  params: CreateMultiItemOrderParams
): Promise<MultiItemOrderResult> {
  const {
    userId,
    items,
    discount = 0,
    tax = 0,
    advance = 0,
    notes,
    couponCode,
  } = params;

  if (!items || items.length === 0) {
    throw new Error('No items provided');
  }

  // --- Calculate totals ---
  let subtotal = 0;
  for (const item of items) {
    const qty = item.qty || 1;
    subtotal += Number(item.price) * qty;
  }
  const total = subtotal - discount + tax;

  // --- Generate order number ---
  const { data: orderNumber } = await supabase.rpc('generate_order_number');

  // --- Determine primary service type ---
  const primaryType = params.serviceType || items[0].type;

  // --- Insert order (trigger auto-creates invoice) ---
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber || `ORD-${Date.now()}`,
      user_id: userId,
      service_id: params.serviceId || null,
      package_id: params.packageId || null,
      service_type: primaryType,
      billing_type: 'one_time' as Database['public']['Enums']['billing_type'],
      subtotal,
      discount,
      tax,
      total,
      advance_payment: advance,
      coupon_code: couponCode || null,
      notes: notes || null,
      status: 'pending' as OrderStatus,
    })
    .select()
    .single();

  if (orderError) throw new Error(orderError.message);

  // --- Find the auto-generated invoice ---
  const { data: invoice, error: invError } = await supabase
    .from('invoices')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (invError) throw new Error(`Invoice not found: ${invError.message}`);

  // --- Insert invoice items ---
  const invoiceItems = items.map((item) => ({
    invoice_id: invoice.id,
    service_type: item.type as string,
    package_name: item.package,
    domain: item.domain || null,
    description: item.description || null,
    price: Number(item.price),
    qty: item.qty || 1,
    total: Number(item.price) * (item.qty || 1),
    renewal_date: item.renewalDate || null,
  }));

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(invoiceItems);

  if (itemsError) throw new Error(itemsError.message);

  // --- Store items as order_meta for reference ---
  const metaEntries = items.map((item, idx) => ({
    order_id: order.id,
    meta_key: `item_${idx}`,
    meta_value: {
      type: item.type,
      package: item.package,
      domain: item.domain,
      price: item.price,
      qty: item.qty || 1,
      renewalDate: item.renewalDate,
    } as Json,
  }));

  await supabase.from('order_meta').insert(metaEntries);

  // --- Create subscriptions for domain/hosting items ---
  for (const item of items) {
    if (item.type === 'domain' || item.type === 'hosting') {
      await supabase.from('subscriptions').insert({
        user_id: userId,
        service_type: item.type as string,
        plan_name: item.package,
        amount: Number(item.price),
        billing_cycle: 'yearly' as Database['public']['Enums']['billing_cycle'],
        next_billing_date: item.renewalDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active' as Database['public']['Enums']['subscription_status'],
        metadata: {
          order_id: order.id,
          domain: item.domain,
        } as Json,
      });
    }
  }

  // --- Record advance payment ---
  if (advance > 0) {
    await supabase.from('manual_payments').insert({
      invoice_id: invoice.id,
      user_id: userId,
      amount: advance,
      method: 'manual',
      transaction_id: `ADV-${Date.now()}`,
      status: 'verified',
      notes: 'Advance payment on order creation',
    });
  }

  return { order, invoice };
}

/**
 * Add a payment to an existing invoice and update balances.
 */
export async function addPaymentToInvoice(
  invoiceId: string,
  amount: number,
  userId: string,
  method = 'manual'
): Promise<void> {
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (error || !invoice) throw new Error('Invoice not found');

  const newAdvance = Number(invoice.advance_paid || 0) + Number(amount);
  const due = Number(invoice.total) - newAdvance;

  const newStatus: InvoiceStatus = due <= 0 ? 'paid' : 'partial';

  await supabase
    .from('invoices')
    .update({
      advance_paid: newAdvance,
      due_amount: due,
      status: newStatus,
      ...(due <= 0 ? { paid_at: new Date().toISOString() } : {}),
    })
    .eq('id', invoiceId);

  await supabase.from('manual_payments').insert({
    invoice_id: invoiceId,
    user_id: userId,
    amount,
    method,
    transaction_id: `PAY-${Date.now()}`,
    status: 'verified',
    notes: `Payment of ${amount} BDT`,
  });
}
