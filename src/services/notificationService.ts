import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationType = Database['public']['Enums']['notification_type'];

export interface SendNotificationParams {
  userId: string;
  templateSlug?: string;
  type: NotificationType;
  recipient: string;
  subject?: string;
  body: string;
  metadata?: Record<string, string | number | boolean>;
}

class NotificationService {
  // Trigger events mapping
  private triggerEvents = {
    ORDER_CREATED: 'order_created',
    INVOICE_GENERATED: 'invoice_generated',
    PAYMENT_SUCCESS: 'payment_success',
    SERVICE_ACTIVATED: 'service_activated',
    RENEWAL_REMINDER: 'renewal_reminder',
    SUSPENSION_NOTICE: 'suspension_notice',
  };

  async sendNotification(params: SendNotificationParams): Promise<{ data: Notification | null; error: Error | null }> {
    try {
      let finalBody = params.body;
      let finalSubject = params.subject;

      // If template is provided, fetch and use it
      if (params.templateSlug) {
        const { data: template } = await supabase
          .from('notification_templates')
          .select('*')
          .eq('slug', params.templateSlug)
          .eq('is_active', true)
          .single();

        if (template) {
          finalBody = this.replaceVariables(template.body_en || params.body, params.metadata || {});
          finalSubject = this.replaceVariables(template.subject_en || params.subject || '', params.metadata || {});
        }
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: params.userId,
          notification_type: params.type,
          recipient: params.recipient,
          subject: finalSubject,
          body: finalBody,
          metadata: (params.metadata || {}) as Json,
          status: 'pending' as const,
        }])
        .select()
        .single();

      if (error) throw error;

      // Process notification based on type
      await this.processNotification(data);

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  }

  private replaceVariables(template: string, variables: Record<string, string | number | boolean>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
    return result;
  }

  private async processNotification(notification: Notification): Promise<void> {
    try {
      switch (notification.notification_type) {
        case 'email':
          await this.sendEmail(notification);
          break;
        case 'sms':
          await this.sendSMS(notification);
          break;
        case 'whatsapp':
          await this.sendWhatsApp(notification);
          break;
        case 'in_app':
          // In-app notifications are already stored, just mark as sent
          await this.markAsSent(notification.id);
          break;
      }
    } catch (err) {
      await this.markAsFailed(notification.id, (err as Error).message);
    }
  }

  // Email integration structure (requires edge function)
  private async sendEmail(notification: Notification): Promise<void> {
    console.log('Email notification structure:', {
      to: notification.recipient,
      subject: notification.subject,
      body: notification.body,
    });
    // This would call an edge function for email sending
    // For now, mark as sent for demo purposes
    await this.markAsSent(notification.id);
  }

  // SMS integration structure
  private async sendSMS(notification: Notification): Promise<void> {
    console.log('SMS notification structure:', {
      to: notification.recipient,
      message: notification.body,
    });
    // This would integrate with SMS gateway (e.g., Twilio, SSL Wireless)
    await this.markAsSent(notification.id);
  }

  // WhatsApp Cloud API structure
  private async sendWhatsApp(notification: Notification): Promise<void> {
    console.log('WhatsApp notification structure:', {
      to: notification.recipient,
      template: notification.metadata,
      message: notification.body,
    });
    // This would integrate with WhatsApp Business API
    await this.markAsSent(notification.id);
  }

  private async markAsSent(notificationId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', notificationId);
  }

  private async markAsFailed(notificationId: string, errorMessage: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({
        status: 'failed',
        error_message: errorMessage,
      })
      .eq('id', notificationId);
  }

  // Get user's in-app notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('notification_type', 'in_app')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  }

  // Trigger notification for events
  async triggerEvent(
    eventType: keyof typeof this.triggerEvents,
    userId: string,
    email: string,
    data: Record<string, string | number | boolean>
  ): Promise<void> {
    const templateSlug = this.triggerEvents[eventType];

    // Send email notification
    await this.sendNotification({
      userId,
      templateSlug,
      type: 'email',
      recipient: email,
      body: `Notification for ${eventType}`,
      metadata: data,
    });

    // Also create in-app notification
    await this.sendNotification({
      userId,
      templateSlug,
      type: 'in_app',
      recipient: userId,
      body: `Notification for ${eventType}`,
      metadata: data,
    });
  }
}

export const notificationService = new NotificationService();
