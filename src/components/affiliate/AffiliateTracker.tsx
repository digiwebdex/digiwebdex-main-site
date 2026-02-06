import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { affiliateService } from '@/services/affiliate';

/**
 * Component that tracks affiliate referral clicks.
 * Place this in your layout or home page to track incoming referrals.
 */
export function AffiliateTracker() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    
    if (refCode) {
      // Only track if we don't already have a stored referral
      const existingRef = affiliateService.getStoredReferralCode();
      if (!existingRef) {
        affiliateService.trackClick(refCode).then((clickId) => {
          if (clickId) {
            console.log('Affiliate referral tracked');
          }
        });
      }
    }
  }, [searchParams]);

  // This component doesn't render anything
  return null;
}
