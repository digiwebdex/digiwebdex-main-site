import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { affiliateService } from '@/services/affiliate';

export function useAffiliateTracking() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    
    if (refCode) {
      // Track the click asynchronously
      affiliateService.trackClick(refCode).then((clickId) => {
        if (clickId) {
          console.log('Affiliate click tracked:', clickId);
        }
      });
    }
  }, [searchParams]);

  return {
    referralCode: affiliateService.getStoredReferralCode(),
    clickId: affiliateService.getStoredClickId(),
  };
}
