import { supabase } from '@/integrations/supabase/client';

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface ProposalFormData {
  lead_id?: string;
  client_name: string;
  client_email?: string;
  client_phone: string;
  service_type: string;
  package_name?: string;
  line_items: LineItem[];
  subtotal: number;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  discount_amount: number;
  total_amount: number;
  description?: string;
  timeline?: string;
  deliverables?: string[];
  payment_instructions?: string;
  payment_link?: string;
  expiry_days: number;
}

export interface Proposal {
  id: string;
  proposal_number: string;
  access_token: string;
  lead_id: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string;
  service_type: string;
  package_name: string | null;
  line_items: LineItem[];
  subtotal: number;
  discount_type: string;
  discount_value: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  description: string | null;
  timeline: string | null;
  deliverables: string[];
  payment_instructions: string | null;
  payment_link: string | null;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  expiry_date: string | null;
  sent_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  converted_order_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalStats {
  total: number;
  sent: number;
  accepted: number;
  rejected: number;
  expired: number;
  draft: number;
  acceptance_rate: number;
  total_revenue: number;
}

class ProposalService {
  // Generate proposal number
  async generateProposalNumber(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_proposal_number');
    if (error) throw error;
    return data;
  }

  // Create a new proposal
  async createProposal(formData: ProposalFormData, createdBy?: string): Promise<Proposal> {
    const proposalNumber = await this.generateProposalNumber();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + formData.expiry_days);

    const { data, error } = await supabase
      .from('proposals')
      .insert({
        proposal_number: proposalNumber,
        lead_id: formData.lead_id || null,
        client_name: formData.client_name,
        client_email: formData.client_email || null,
        client_phone: formData.client_phone,
        service_type: formData.service_type,
        package_name: formData.package_name || null,
        line_items: formData.line_items as unknown as any,
        subtotal: formData.subtotal,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        discount_amount: formData.discount_amount,
        total_amount: formData.total_amount,
        description: formData.description || null,
        timeline: formData.timeline || null,
        deliverables: formData.deliverables as unknown as any || [],
        payment_instructions: formData.payment_instructions || null,
        payment_link: formData.payment_link || null,
        expiry_date: expiryDate.toISOString(),
        created_by: createdBy || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Log the creation
    await this.logAction(data.id, 'created', { created_by: createdBy });

    return this.mapToProposal(data);
  }

  // Get all proposals
  async getProposals(filters?: {
    status?: string;
    search?: string;
  }): Promise<Proposal[]> {
    let query = supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired');
    }

    if (filters?.search) {
      query = query.or(
        `client_name.ilike.%${filters.search}%,client_phone.ilike.%${filters.search}%,proposal_number.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(this.mapToProposal);
  }

  // Get proposal by ID
  async getProposalById(id: string): Promise<Proposal | null> {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.mapToProposal(data);
  }

  // Get proposal by access token (for public view)
  async getProposalByToken(token: string): Promise<Proposal | null> {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('access_token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.mapToProposal(data);
  }

  // Update proposal
  async updateProposal(id: string, updates: Partial<ProposalFormData>): Promise<Proposal> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.client_name !== undefined) updateData.client_name = updates.client_name;
    if (updates.client_email !== undefined) updateData.client_email = updates.client_email;
    if (updates.client_phone !== undefined) updateData.client_phone = updates.client_phone;
    if (updates.service_type !== undefined) updateData.service_type = updates.service_type;
    if (updates.package_name !== undefined) updateData.package_name = updates.package_name;
    if (updates.line_items !== undefined) updateData.line_items = updates.line_items;
    if (updates.subtotal !== undefined) updateData.subtotal = updates.subtotal;
    if (updates.discount_type !== undefined) updateData.discount_type = updates.discount_type;
    if (updates.discount_value !== undefined) updateData.discount_value = updates.discount_value;
    if (updates.discount_amount !== undefined) updateData.discount_amount = updates.discount_amount;
    if (updates.total_amount !== undefined) updateData.total_amount = updates.total_amount;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.timeline !== undefined) updateData.timeline = updates.timeline;
    if (updates.deliverables !== undefined) updateData.deliverables = updates.deliverables;
    if (updates.payment_instructions !== undefined) updateData.payment_instructions = updates.payment_instructions;
    if (updates.payment_link !== undefined) updateData.payment_link = updates.payment_link;

    const { data, error } = await supabase
      .from('proposals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToProposal(data);
  }

  // Send proposal
  async sendProposal(id: string): Promise<Proposal> {
    const { data, error } = await supabase
      .from('proposals')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await this.logAction(id, 'sent', {});

    // Trigger notification edge function
    try {
      await supabase.functions.invoke('proposal-notification', {
        body: { proposalId: id, action: 'sent' },
      });
    } catch (e) {
      console.error('Failed to send proposal notification:', e);
    }

    return this.mapToProposal(data);
  }

  // Accept proposal (from client)
  async acceptProposal(id: string, ipAddress?: string, userAgent?: string): Promise<Proposal> {
    const proposal = await this.getProposalById(id);
    if (!proposal) throw new Error('Proposal not found');
    if (proposal.status !== 'sent') throw new Error('Proposal is not in sent status');

    // Check if expired
    if (proposal.expiry_date && new Date(proposal.expiry_date) < new Date()) {
      throw new Error('Proposal has expired');
    }

    const { data, error } = await supabase
      .from('proposals')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await this.logAction(id, 'accepted', { ip_address: ipAddress, user_agent: userAgent });

    // Trigger order creation
    try {
      await supabase.functions.invoke('proposal-notification', {
        body: { proposalId: id, action: 'accepted' },
      });
    } catch (e) {
      console.error('Failed to process proposal acceptance:', e);
    }

    return this.mapToProposal(data);
  }

  // Reject proposal (from client)
  async rejectProposal(id: string, reason?: string, ipAddress?: string, userAgent?: string): Promise<Proposal> {
    const proposal = await this.getProposalById(id);
    if (!proposal) throw new Error('Proposal not found');
    if (proposal.status !== 'sent') throw new Error('Proposal is not in sent status');

    const { data, error } = await supabase
      .from('proposals')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: reason || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await this.logAction(id, 'rejected', { reason, ip_address: ipAddress, user_agent: userAgent });

    return this.mapToProposal(data);
  }

  // Delete proposal
  async deleteProposal(id: string): Promise<void> {
    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get proposal statistics
  async getStats(): Promise<ProposalStats> {
    const { data, error } = await supabase
      .from('proposals')
      .select('status, total_amount');

    if (error) throw error;

    const stats: ProposalStats = {
      total: data?.length || 0,
      sent: 0,
      accepted: 0,
      rejected: 0,
      expired: 0,
      draft: 0,
      acceptance_rate: 0,
      total_revenue: 0,
    };

    data?.forEach((p) => {
      switch (p.status) {
        case 'sent':
          stats.sent++;
          break;
        case 'accepted':
          stats.accepted++;
          stats.total_revenue += Number(p.total_amount);
          break;
        case 'rejected':
          stats.rejected++;
          break;
        case 'expired':
          stats.expired++;
          break;
        case 'draft':
          stats.draft++;
          break;
      }
    });

    const responded = stats.accepted + stats.rejected;
    stats.acceptance_rate = responded > 0 ? (stats.accepted / responded) * 100 : 0;

    return stats;
  }

  // Log proposal action
  private async logAction(proposalId: string, action: string, details: Record<string, unknown>): Promise<void> {
    try {
      await supabase.from('proposal_logs').insert([{
        proposal_id: proposalId,
        action,
        details: details as any,
      }]);
    } catch (e) {
      console.error('Failed to log proposal action:', e);
    }
  }

  // Map database row to Proposal type
  private mapToProposal(row: any): Proposal {
    return {
      id: row.id,
      proposal_number: row.proposal_number,
      access_token: row.access_token,
      lead_id: row.lead_id,
      client_name: row.client_name,
      client_email: row.client_email,
      client_phone: row.client_phone,
      service_type: row.service_type,
      package_name: row.package_name,
      line_items: Array.isArray(row.line_items) ? row.line_items : [],
      subtotal: Number(row.subtotal),
      discount_type: row.discount_type,
      discount_value: Number(row.discount_value),
      discount_amount: Number(row.discount_amount),
      total_amount: Number(row.total_amount),
      currency: row.currency,
      description: row.description,
      timeline: row.timeline,
      deliverables: Array.isArray(row.deliverables) ? row.deliverables : [],
      payment_instructions: row.payment_instructions,
      payment_link: row.payment_link,
      status: row.status,
      expiry_date: row.expiry_date,
      sent_at: row.sent_at,
      accepted_at: row.accepted_at,
      rejected_at: row.rejected_at,
      rejection_reason: row.rejection_reason,
      converted_order_id: row.converted_order_id,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  // Get public proposal URL
  getPublicUrl(proposal: Proposal): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/proposal/${proposal.access_token}`;
  }
}

export const proposalService = new ProposalService();
