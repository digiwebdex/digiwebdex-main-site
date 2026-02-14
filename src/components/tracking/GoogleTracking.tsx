import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { googleTrackingService } from '@/services/tracking';

/**
 * Google Tracking Component
 * Initializes GA4 + Google Ads and tracks page views on route changes
 */
export function GoogleTracking() {
  const location = useLocation();

  useEffect(() => {
    googleTrackingService.initialize();
  }, []);

  useEffect(() => {
    if (googleTrackingService.hasConsent()) {
      googleTrackingService.trackPageView();
    }
  }, [location.pathname]);

  return null;
}
