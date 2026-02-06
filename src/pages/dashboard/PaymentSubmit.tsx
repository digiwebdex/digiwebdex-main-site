import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ManualPaymentForm } from '@/components/payment/ManualPaymentForm';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSubmit() {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('order') || undefined;
  const invoiceId = searchParams.get('invoice') || undefined;
  const amount = parseFloat(searchParams.get('amount') || '0');

  const basePath = language === 'en' ? '/en' : '/bn';

  if (!amount || amount <= 0) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {language === 'bn' 
                ? 'অবৈধ পেমেন্ট অনুরোধ। অনুগ্রহ করে আবার চেষ্টা করুন।'
                : 'Invalid payment request. Please try again.'
              }
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate(`${basePath}/dashboard`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {language === 'bn' ? 'ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {language === 'bn' ? 'পেমেন্ট করুন' : 'Make Payment'}
            </h1>
            <p className="text-muted-foreground">
              {orderId && (language === 'bn' ? `অর্ডার: ${orderId.slice(0, 8)}...` : `Order: ${orderId.slice(0, 8)}...`)}
              {invoiceId && (language === 'bn' ? `ইনভয়েস: ${invoiceId.slice(0, 8)}...` : `Invoice: ${invoiceId.slice(0, 8)}...`)}
            </p>
          </div>
        </div>

        <ManualPaymentForm
          orderId={orderId}
          invoiceId={invoiceId}
          amount={amount}
          onSuccess={() => navigate(`${basePath}/dashboard/payments`)}
          onCancel={() => navigate(-1)}
        />
      </div>
    </DashboardLayout>
  );
}
