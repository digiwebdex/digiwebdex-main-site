import { useEffect, useState } from 'react';
import { analyticsService } from '@/services/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RefreshCw } from 'lucide-react';

export function RenewalRateCard() {
  const [renewalRate, setRenewalRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRenewalRate() {
      try {
        const rate = await analyticsService.getRenewalRate();
        setRenewalRate(rate);
      } catch (error) {
        console.error('Failed to fetch renewal rate:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRenewalRate();
  }, []);

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            নবায়ন হার
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 w-20 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          নবায়ন হার (গত ৩ মাস)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-4xl font-bold">{renewalRate}%</div>
          <Progress 
            value={renewalRate} 
            className="h-3"
          />
          <p className="text-sm text-muted-foreground">
            {renewalRate >= 80 
              ? 'চমৎকার! গ্রাহক ধরে রাখার হার খুবই ভালো।'
              : renewalRate >= 60
              ? 'মোটামুটি ভালো। উন্নতির সুযোগ আছে।'
              : 'নবায়ন হার বাড়ানো প্রয়োজন।'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
