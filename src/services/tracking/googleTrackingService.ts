/**
 * Google Tracking Service
 * Handles client-side GA4 + Google Ads tracking with consent management
 * and server-side Measurement Protocol / Google Ads Conversion API
 */

import { supabase } from '@/integrations/supabase/client';
import { systemSettingsService } from '@/services/settings';

// Standard GA4 events
export type GA4Event =
  | 'page_view'
  | 'view_item'
  | 'generate_lead'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'search'
  | 'sign_up'
  | 'login';

export interface GA4EventParams {
  [key: string]: unknown;
}

export interface GoogleUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
  externalId?: string;
}

function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

class GoogleTrackingService {
  private ga4MeasurementId: string | null = null;
  private adsConversionId: string | null = null;
  private initialized = false;
  private consentGiven = false;
  private pendingEvents: Array<{ event: string; params?: GA4EventParams; eventId: string }> = [];

  private readonly CONSENT_COOKIE = 'google_tracking_consent';

  constructor() {
    this.checkExistingConsent();
  }

  private checkExistingConsent(): void {
    const consent = this.getCookie(this.CONSENT_COOKIE);
    // Also check the FB consent cookie for unified consent
    const fbConsent = this.getCookie('fb_tracking_consent');
    if (consent === 'granted' || fbConsent === 'granted') {
      this.consentGiven = true;
    }
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  private setCookie(name: string, value: string, days = 365): void {
    if (typeof document === 'undefined') return;
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const [ga4Id, adsId] = await Promise.all([
        systemSettingsService.getSetting<string>('ga4_measurement_id'),
        systemSettingsService.getSetting<string>('google_ads_conversion_id'),
      ]);

      if (ga4Id) this.ga4MeasurementId = ga4Id.replace(/^"|"$/g, '');
      if (adsId) this.adsConversionId = adsId.replace(/^"|"$/g, '');

      if (!this.ga4MeasurementId && !this.adsConversionId) {
        console.log('Google tracking IDs not configured');
        return;
      }

      this.loadGtagScript();
      this.initialized = true;

      if (this.consentGiven) {
        this.processPendingEvents();
      }
    } catch (error) {
      console.error('Error initializing Google tracking:', error);
    }
  }

  private loadGtagScript(): void {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (win.gtag) return;

    const trackingId = this.ga4MeasurementId || this.adsConversionId;
    if (!trackingId) return;

    // Initialize dataLayer and gtag BEFORE script loads
    win.dataLayer = win.dataLayer || [];
    win.gtag = function (...args: unknown[]) {
      win.dataLayer.push(args);
    };

    // Load gtag.js via our proxy to bypass ad blockers
    const proxyBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ga4-proxy`;
    const script = document.createElement('script');
    script.async = true;
    script.src = `${proxyBase}?action=gtag-script&id=${trackingId}`;
    document.head.appendChild(script);

    win.gtag('js', new Date());

    // Configure GA4 — route collection through our proxy too
    if (this.ga4MeasurementId) {
      win.gtag('config', this.ga4MeasurementId, {
        send_page_view: false,
        transport_url: proxyBase,
        first_party_collection: true,
      });
    }

    // Configure Google Ads
    if (this.adsConversionId) {
      win.gtag('config', this.adsConversionId);
    }
  }

  grantConsent(): void {
    this.consentGiven = true;
    this.setCookie(this.CONSENT_COOKIE, 'granted');
    if (this.initialized) this.processPendingEvents();
  }

  denyConsent(): void {
    this.consentGiven = false;
    this.setCookie(this.CONSENT_COOKIE, 'denied');
    this.pendingEvents = [];
  }

  hasConsent(): boolean {
    return this.consentGiven;
  }

  private processPendingEvents(): void {
    for (const { event, params, eventId } of this.pendingEvents) {
      this.fireEvent(event, params, eventId);
    }
    this.pendingEvents = [];
  }

  private fireEvent(event: string, params?: GA4EventParams, _eventId?: string): void {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (!win.gtag) return;
    win.gtag('event', event, params);
  }

  async track(event: string, params?: GA4EventParams, userData?: GoogleUserData): Promise<string> {
    const eventId = generateEventId();

    if (!this.consentGiven) {
      this.pendingEvents.push({ event, params, eventId });
      return eventId;
    }

    if (!this.initialized) await this.initialize();

    this.fireEvent(event, params, eventId);
    this.sendToServerAsync(event, eventId, params, userData);

    return eventId;
  }

  // Send to server-side via our proxy (bypasses ad blockers completely)
  private async sendToServerAsync(
    event: string,
    eventId: string,
    params?: GA4EventParams,
    userData?: GoogleUserData
  ): Promise<void> {
    try {
      // Always send server-side — this is the ad-blocker-proof path
      const clientId = this.getGAClientId();

      // Use the unified ga4-proxy edge function
      await supabase.functions.invoke('ga4-proxy', {
        body: {
          action: 'event',
          event_name: event,
          event_id: eventId,
          client_id: clientId,
          event_source_url: window.location.href,
          user_data: userData || {},
          custom_data: params || {},
        },
      });
    } catch (error) {
      console.error('Error sending to GA4 server-side:', error);
    }
  }

  private getGAClientId(): string | null {
    const gaCookie = this.getCookie('_ga');
    if (!gaCookie) return null;
    // _ga cookie format: GA1.1.XXXXXXXXXX.XXXXXXXXXX
    const parts = gaCookie.split('.');
    return parts.length >= 4 ? `${parts[2]}.${parts[3]}` : null;
  }

  // Convenience methods
  async trackPageView(pageTitle?: string, pagePath?: string): Promise<string> {
    return this.track('page_view', {
      page_title: pageTitle || document.title,
      page_location: window.location.href,
      page_path: pagePath || window.location.pathname,
    });
  }

  async trackViewContent(contentName: string, contentId?: string, value?: number, currency = 'BDT'): Promise<string> {
    return this.track('view_item', {
      items: [{ item_name: contentName, item_id: contentId }],
      value,
      currency,
    });
  }

  async trackLead(userData?: GoogleUserData, contentName?: string): Promise<string> {
    return this.track('generate_lead', { content_name: contentName }, userData);
  }

  async trackAddToCart(contentName: string, contentId: string, value: number, currency = 'BDT'): Promise<string> {
    return this.track('add_to_cart', {
      items: [{ item_name: contentName, item_id: contentId, price: value }],
      value,
      currency,
    });
  }

  async trackBeginCheckout(contentIds: string[], value: number, currency = 'BDT'): Promise<string> {
    return this.track('begin_checkout', {
      items: contentIds.map(id => ({ item_id: id })),
      value,
      currency,
    });
  }

  async trackPurchase(
    transactionId: string,
    contentName: string,
    value: number,
    currency = 'BDT',
    userData?: GoogleUserData
  ): Promise<string> {
    return this.track('purchase', {
      transaction_id: transactionId,
      items: [{ item_name: contentName }],
      value,
      currency,
    }, userData);
  }

  async trackSearch(searchTerm: string): Promise<string> {
    return this.track('search', { search_term: searchTerm });
  }

  async trackSignUp(userData?: GoogleUserData): Promise<string> {
    return this.track('sign_up', {}, userData);
  }

  // Google Ads conversion tracking
  async trackAdsConversion(conversionLabel: string, value?: number, currency = 'BDT'): Promise<string> {
    if (!this.adsConversionId) return '';
    const eventId = generateEventId();

    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      if (win.gtag) {
        win.gtag('event', 'conversion', {
          send_to: `${this.adsConversionId}/${conversionLabel}`,
          value,
          currency,
        });
      }
    }

    // Also send server-side
    this.sendToServerAsync('conversion', eventId, {
      conversion_label: conversionLabel,
      value,
      currency,
    });

    return eventId;
  }
}

export const googleTrackingService = new GoogleTrackingService();
