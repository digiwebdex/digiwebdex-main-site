import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { proposalService, Proposal } from '@/services/proposal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, X, CreditCard, Loader2, Clock, FileText, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const ProposalView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadProposal();
  }, [token]);

  const loadProposal = async () => {
    if (!token) {
      navigate('/');
      return;
    }

    try {
      setLoading(true);
      const data = await proposalService.getProposalByToken(token);
      if (!data) {
        toast.error('প্রস্তাব পাওয়া যায়নি');
        navigate('/');
        return;
      }
      setProposal(data);
    } catch (error) {
      console.error('Error loading proposal:', error);
      toast.error('প্রস্তাব লোড করতে সমস্যা হয়েছে');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!proposal) return;
    try {
      setProcessing(true);
      await proposalService.acceptProposal(proposal.id);
      toast.success('প্রস্তাব গ্রহণ করা হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।');
      loadProposal();
    } catch (error: any) {
      toast.error(error.message || 'প্রস্তাব গ্রহণ করতে সমস্যা হয়েছে');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!proposal) return;
    try {
      setProcessing(true);
      await proposalService.rejectProposal(proposal.id, rejectionReason);
      toast.success('প্রস্তাব প্রত্যাখ্যান করা হয়েছে');
      setShowRejectDialog(false);
      loadProposal();
    } catch (error) {
      toast.error('প্রত্যাখ্যান করতে সমস্যা হয়েছে');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-purple-500/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-purple-500/5">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">প্রস্তাব পাওয়া যায়নি</h2>
            <p className="text-muted-foreground">এই লিংকটি সঠিক নয় অথবা মেয়াদ শেষ হয়ে গেছে।</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = proposal.expiry_date && new Date(proposal.expiry_date) < new Date();
  const canRespond = proposal.status === 'sent' && !isExpired;

  const getStatusBadge = () => {
    switch (proposal.status) {
      case 'accepted':
        return <Badge className="bg-green-500">গৃহীত</Badge>;
      case 'rejected':
        return <Badge variant="destructive">প্রত্যাখ্যাত</Badge>;
      case 'expired':
        return <Badge variant="outline">মেয়াদোত্তীর্ণ</Badge>;
      default:
        return isExpired ? <Badge variant="outline">মেয়াদোত্তীর্ণ</Badge> : <Badge>পাঠানো হয়েছে</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-purple-500/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="Digiwebdex" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold text-primary">প্রস্তাবনা / Quotation</h1>
        </div>

        {/* Status Banner */}
        {proposal.status !== 'sent' && (
          <Card className={`mb-6 ${
            proposal.status === 'accepted' ? 'border-green-500 bg-green-50' :
            proposal.status === 'rejected' ? 'border-red-500 bg-red-50' :
            'border-yellow-500 bg-yellow-50'
          }`}>
            <CardContent className="pt-6 flex items-center gap-4">
              {proposal.status === 'accepted' && <Check className="h-8 w-8 text-green-500" />}
              {proposal.status === 'rejected' && <X className="h-8 w-8 text-red-500" />}
              {(proposal.status === 'expired' || isExpired) && <Clock className="h-8 w-8 text-yellow-500" />}
              <div>
                <h3 className="font-semibold text-lg">
                  {proposal.status === 'accepted' && 'প্রস্তাব গৃহীত হয়েছে!'}
                  {proposal.status === 'rejected' && 'প্রস্তাব প্রত্যাখ্যাত হয়েছে'}
                  {(proposal.status === 'expired' || isExpired) && 'প্রস্তাবের মেয়াদ শেষ হয়ে গেছে'}
                </h3>
                {proposal.status === 'accepted' && (
                  <p className="text-sm text-muted-foreground">
                    আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Validity Warning */}
        {canRespond && proposal.expiry_date && (
          <Card className="mb-6 border-yellow-500 bg-yellow-50">
            <CardContent className="pt-6 flex items-center gap-4">
              <Clock className="h-6 w-6 text-yellow-600" />
              <p className="text-yellow-800">
                এই প্রস্তাবটি <strong>{format(new Date(proposal.expiry_date), 'dd MMM yyyy')}</strong> পর্যন্ত বৈধ।
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Proposal Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary to-purple-600 text-white p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-6 w-6" />
                    <span className="text-2xl font-bold">{proposal.proposal_number}</span>
                  </div>
                  <p className="opacity-90">তারিখ: {format(new Date(proposal.created_at), 'dd MMM yyyy')}</p>
                </div>
                <div className="text-right">
                  {getStatusBadge()}
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="p-6 border-b">
              <h3 className="font-semibold text-lg mb-4 text-primary">ক্লায়েন্ট তথ্য</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">নাম</p>
                  <p className="font-medium">{proposal.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ফোন</p>
                  <p className="font-medium">{proposal.client_phone}</p>
                </div>
                {proposal.client_email && (
                  <div>
                    <p className="text-sm text-muted-foreground">ইমেইল</p>
                    <p className="font-medium">{proposal.client_email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Service Details */}
            <div className="p-6 border-b">
              <h3 className="font-semibold text-lg mb-4 text-primary">সার্ভিস বিবরণ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">সার্ভিস</p>
                  <p className="font-medium">{proposal.service_type}</p>
                </div>
                {proposal.package_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">প্যাকেজ</p>
                    <p className="font-medium">{proposal.package_name}</p>
                  </div>
                )}
                {proposal.timeline && (
                  <div>
                    <p className="text-sm text-muted-foreground">সময়কাল</p>
                    <p className="font-medium">{proposal.timeline}</p>
                  </div>
                )}
              </div>
              {proposal.description && (
                <p className="text-muted-foreground">{proposal.description}</p>
              )}
            </div>

            {/* Deliverables */}
            {proposal.deliverables && proposal.deliverables.length > 0 && (
              <div className="p-6 border-b bg-muted/20">
                <h3 className="font-semibold text-lg mb-4 text-primary">আপনি যা পাবেন</h3>
                <ul className="space-y-3">
                  {proposal.deliverables.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pricing */}
            <div className="p-6 border-b">
              <h3 className="font-semibold text-lg mb-4 text-primary">মূল্য তালিকা</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium">বিবরণ</th>
                      <th className="text-center p-3 font-medium">পরিমাণ</th>
                      <th className="text-right p-3 font-medium">একক মূল্য</th>
                      <th className="text-right p-3 font-medium">মোট</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposal.line_items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">{item.description}</td>
                        <td className="text-center p-3">{item.quantity}</td>
                        <td className="text-right p-3">৳{item.unit_price.toLocaleString()}</td>
                        <td className="text-right p-3 font-medium">৳{item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 ml-auto w-full md:w-72">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">সাবটোটাল:</span>
                  <span>৳{proposal.subtotal.toLocaleString()}</span>
                </div>
                {proposal.discount_amount > 0 && (
                  <div className="flex justify-between py-2 text-green-600">
                    <span>ডিসকাউন্ট:</span>
                    <span>-৳{proposal.discount_amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-t-2 border-primary mt-2 text-2xl font-bold text-primary">
                  <span>সর্বমোট:</span>
                  <span>৳{proposal.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            {proposal.payment_instructions && (
              <div className="p-6 border-b bg-gradient-to-r from-primary/10 to-purple-500/10">
                <h3 className="font-semibold text-lg mb-4 text-primary">পেমেন্ট নির্দেশনা</h3>
                <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                  {proposal.payment_instructions}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            {canRespond && (
              <div className="p-6 bg-muted/30">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                    onClick={handleAccept}
                    disabled={processing}
                  >
                    {processing ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Check className="h-5 w-5 mr-2" />}
                    প্রস্তাব গ্রহণ করুন
                  </Button>
                  {proposal.payment_link && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1 sm:flex-none"
                      onClick={() => window.open(proposal.payment_link!, '_blank')}
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      পেমেন্ট করুন
                    </Button>
                  )}
                  <Button
                    size="lg"
                    variant="destructive"
                    className="flex-1 sm:flex-none"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={processing}
                  >
                    <X className="h-5 w-5 mr-2" />
                    প্রত্যাখ্যান করুন
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>প্রশ্ন আছে? আমাদের কল করুন: <a href="tel:+8801674533303" className="text-primary font-medium">+880 1674 533 303</a></p>
          <p className="mt-2">© {new Date().getFullYear()} Digiwebdex - Your Digital Partner</p>
        </div>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>প্রস্তাব প্রত্যাখ্যান</DialogTitle>
            <DialogDescription>
              আপনি কি নিশ্চিত এই প্রস্তাবটি প্রত্যাখ্যান করতে চান?
            </DialogDescription>
          </DialogHeader>
          <div>
            <Textarea
              placeholder="প্রত্যাখ্যানের কারণ (ঐচ্ছিক)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              বাতিল
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              প্রত্যাখ্যান নিশ্চিত করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalView;
