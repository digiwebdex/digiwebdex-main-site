import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Clock, CheckCircle2, XCircle, Phone, Building2 } from 'lucide-react';
import { manualPaymentService, type ManualPayment } from '@/services/manualPaymentService';

export default function Payments() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      const data = await manualPaymentService.getUserPayments(user!.id);
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
            <Clock className="h-3 w-3" />
            {language === 'bn' ? 'যাচাইয়ের অপেক্ষায়' : 'Pending'}
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            {language === 'bn' ? 'অনুমোদিত' : 'Approved'}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="gap-1 border-destructive text-destructive">
            <XCircle className="h-3 w-3" />
            {language === 'bn' ? 'প্রত্যাখ্যাত' : 'Rejected'}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    if (method === 'bkash_personal') {
      return <Phone className="h-4 w-4 text-pink-500" />;
    }
    return <Building2 className="h-4 w-4 text-blue-500" />;
  };

  const getMethodLabel = (method: string) => {
    if (method === 'bkash_personal') {
      return 'bKash';
    }
    return language === 'bn' ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            {language === 'bn' ? 'আমার পেমেন্টসমূহ' : 'My Payments'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' 
              ? 'আপনার সকল পেমেন্ট জমার ইতিহাস'
              : 'History of all your payment submissions'
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'bn' ? 'পেমেন্ট ইতিহাস' : 'Payment History'}</CardTitle>
            <CardDescription>
              {language === 'bn' 
                ? 'আপনার জমা দেওয়া ম্যানুয়াল পেমেন্টসমূহ'
                : 'Your submitted manual payments'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">
                {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
              </div>
            ) : payments.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {language === 'bn' ? 'কোনো পেমেন্ট পাওয়া যায়নি' : 'No payments found'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'bn' ? 'তারিখ' : 'Date'}</TableHead>
                      <TableHead>{language === 'bn' ? 'পদ্ধতি' : 'Method'}</TableHead>
                      <TableHead>{language === 'bn' ? 'ট্রানজেকশন আইডি' : 'Transaction ID'}</TableHead>
                      <TableHead className="text-right">{language === 'bn' ? 'পরিমাণ' : 'Amount'}</TableHead>
                      <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(payment.created_at), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMethodIcon(payment.method)}
                            <span>{getMethodLabel(payment.method)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.transaction_id}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                          {payment.rejection_reason && (
                            <p className="mt-1 text-xs text-destructive">
                              {payment.rejection_reason}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
