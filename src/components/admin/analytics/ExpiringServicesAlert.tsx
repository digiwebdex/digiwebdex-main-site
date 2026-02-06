import { useEffect, useState } from 'react';
import { analyticsService, type ExpiringService } from '@/services/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Globe, Server, AlertTriangle } from 'lucide-react';

export function ExpiringServicesAlert() {
  const [services, setServices] = useState<ExpiringService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExpiringServices() {
      try {
        const data = await analyticsService.getExpiringServices(30);
        setServices(data);
      } catch (error) {
        console.error('Failed to fetch expiring services:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchExpiringServices();
  }, []);

  const getSeverityColor = (days: number) => {
    if (days <= 7) return 'destructive';
    if (days <= 15) return 'secondary';
    return 'outline';
  };

  const getSeverityBg = (days: number) => {
    if (days <= 7) return 'bg-destructive/10';
    if (days <= 15) return 'bg-yellow-500/10';
    return '';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            মেয়াদ উত্তীর্ণ হচ্ছে
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          মেয়াদ উত্তীর্ণ হচ্ছে (৩০ দিনের মধ্যে)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            আগামী ৩০ দিনে কোনো সেবার মেয়াদ উত্তীর্ণ হচ্ছে না
          </p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getSeverityBg(service.daysUntilExpiry)}`}
                >
                  <div className="flex items-center gap-3">
                    {service.type === 'domain' ? (
                      <Globe className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Server className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        মেয়াদ: {new Date(service.expiryDate).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getSeverityColor(service.daysUntilExpiry)}>
                    {service.daysUntilExpiry} দিন বাকি
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
