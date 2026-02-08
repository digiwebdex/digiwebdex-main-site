import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { Proposal, proposalService } from '@/services/proposal';
import { Download, Send, Copy, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

interface ProposalPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: Proposal | null;
}

export const ProposalPreviewModal: React.FC<ProposalPreviewModalProps> = ({
  open,
  onOpenChange,
  proposal,
}) => {
  const { language } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);

  if (!proposal) return null;

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Proposal - ${proposal.proposal_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .proposal { max-width: 800px; margin: 0 auto; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; }
            .logo img { max-width: 180px; height: auto; }
            .company-info { text-align: right; font-size: 12px; color: #666; }
            .proposal-meta { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .proposal-number { font-size: 24px; font-weight: bold; color: #4f46e5; }
            .client-section { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .section-title { font-size: 16px; font-weight: 600; color: #4f46e5; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            .client-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .service-section { margin-bottom: 30px; }
            .deliverables { list-style: none; padding-left: 0; }
            .deliverables li { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
            .deliverables li:before { content: "✓"; color: #22c55e; font-weight: bold; margin-right: 10px; }
            .pricing-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .pricing-table th, .pricing-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            .pricing-table th { background: #f1f5f9; font-weight: 600; }
            .pricing-table .amount { text-align: right; }
            .totals { margin-left: auto; width: 300px; }
            .totals .row { display: flex; justify-content: space-between; padding: 8px 0; }
            .totals .total { font-size: 20px; font-weight: bold; color: #4f46e5; border-top: 2px solid #4f46e5; margin-top: 10px; padding-top: 10px; }
            .payment-section { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 25px; border-radius: 8px; margin-top: 30px; }
            .payment-section h3 { margin-bottom: 15px; }
            .payment-section pre { white-space: pre-wrap; font-family: inherit; font-size: 13px; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .validity { background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(proposalService.getPublicUrl(proposal));
    toast.success(language === 'bn' ? 'লিংক কপি হয়েছে' : 'Link copied');
  };

  const handleSend = async () => {
    try {
      await proposalService.sendProposal(proposal.id);
      toast.success(language === 'bn' ? 'প্রস্তাব পাঠানো হয়েছে' : 'Proposal sent');
      onOpenChange(false);
    } catch (error) {
      toast.error(language === 'bn' ? 'পাঠাতে সমস্যা হয়েছে' : 'Failed to send');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{language === 'bn' ? 'প্রস্তাব প্রিভিউ' : 'Proposal Preview'}</span>
            <div className="flex gap-2">
              {proposal.status === 'draft' && (
                <Button size="sm" onClick={handleSend}>
                  <Send className="h-4 w-4 mr-1" />
                  {language === 'bn' ? 'পাঠান' : 'Send'}
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-1" />
                {language === 'bn' ? 'লিংক' : 'Link'}
              </Button>
              <Button size="sm" variant="outline" onClick={handlePrint}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(proposalService.getPublicUrl(proposal), '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                {language === 'bn' ? 'ওপেন' : 'Open'}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Preview Content */}
        <div ref={printRef} className="proposal bg-white p-8 rounded-lg">
          {/* Header */}
          <div className="header flex justify-between items-start border-b-4 border-primary pb-6 mb-8">
            <div className="logo">
              <img src={logo} alt="Digiwebdex" className="h-16" />
            </div>
            <div className="company-info text-right text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Digiwebdex</p>
              <p>Narayanganj, Bangladesh</p>
              <p>+880 1674 533 303</p>
              <p>digiwebdex@gmail.com</p>
              <p>www.digiwebdex.com</p>
            </div>
          </div>

          {/* Proposal Meta */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-3xl font-bold text-primary">{proposal.proposal_number}</p>
              <p className="text-muted-foreground">
                {language === 'bn' ? 'তারিখ:' : 'Date:'} {format(new Date(proposal.created_at), 'dd MMM yyyy')}
              </p>
            </div>
            {proposal.expiry_date && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'মেয়াদ শেষ:' : 'Valid Until:'}
                </p>
                <p className="font-semibold">{format(new Date(proposal.expiry_date), 'dd MMM yyyy')}</p>
              </div>
            )}
          </div>

          {/* Client Section */}
          <div className="client-section bg-muted/30 p-6 rounded-lg mb-8">
            <h3 className="section-title text-lg font-semibold text-primary border-b pb-2 mb-4">
              {language === 'bn' ? 'ক্লায়েন্ট তথ্য' : 'Client Information'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'bn' ? 'নাম' : 'Name'}</p>
                <p className="font-medium">{proposal.client_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{language === 'bn' ? 'ফোন' : 'Phone'}</p>
                <p className="font-medium">{proposal.client_phone}</p>
              </div>
              {proposal.client_email && (
                <div>
                  <p className="text-sm text-muted-foreground">{language === 'bn' ? 'ইমেইল' : 'Email'}</p>
                  <p className="font-medium">{proposal.client_email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Service Details */}
          <div className="mb-8">
            <h3 className="section-title text-lg font-semibold text-primary border-b pb-2 mb-4">
              {language === 'bn' ? 'সার্ভিস বিবরণ' : 'Service Details'}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'bn' ? 'সার্ভিস' : 'Service'}</p>
                <p className="font-medium">{proposal.service_type}</p>
              </div>
              {proposal.package_name && (
                <div>
                  <p className="text-sm text-muted-foreground">{language === 'bn' ? 'প্যাকেজ' : 'Package'}</p>
                  <p className="font-medium">{proposal.package_name}</p>
                </div>
              )}
              {proposal.timeline && (
                <div>
                  <p className="text-sm text-muted-foreground">{language === 'bn' ? 'টাইমলাইন' : 'Timeline'}</p>
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
            <div className="mb-8">
              <h3 className="section-title text-lg font-semibold text-primary border-b pb-2 mb-4">
                {language === 'bn' ? 'ডেলিভারেবল' : 'Deliverables'}
              </h3>
              <ul className="space-y-2">
                {proposal.deliverables.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pricing Table */}
          <div className="mb-8">
            <h3 className="section-title text-lg font-semibold text-primary border-b pb-2 mb-4">
              {language === 'bn' ? 'মূল্য তালিকা' : 'Pricing'}
            </h3>
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3">{language === 'bn' ? 'বিবরণ' : 'Description'}</th>
                  <th className="text-center p-3">{language === 'bn' ? 'পরিমাণ' : 'Qty'}</th>
                  <th className="text-right p-3">{language === 'bn' ? 'একক মূল্য' : 'Unit Price'}</th>
                  <th className="text-right p-3">{language === 'bn' ? 'মোট' : 'Total'}</th>
                </tr>
              </thead>
              <tbody>
                {proposal.line_items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">{item.description}</td>
                    <td className="text-center p-3">{item.quantity}</td>
                    <td className="text-right p-3">৳{item.unit_price.toLocaleString()}</td>
                    <td className="text-right p-3">৳{item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-4 ml-auto w-72">
              <div className="flex justify-between py-2">
                <span>{language === 'bn' ? 'সাবটোটাল:' : 'Subtotal:'}</span>
                <span>৳{proposal.subtotal.toLocaleString()}</span>
              </div>
              {proposal.discount_amount > 0 && (
                <div className="flex justify-between py-2 text-green-600">
                  <span>{language === 'bn' ? 'ডিসকাউন্ট:' : 'Discount:'}</span>
                  <span>-৳{proposal.discount_amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t-2 border-primary mt-2 text-xl font-bold text-primary">
                <span>{language === 'bn' ? 'সর্বমোট:' : 'Total:'}</span>
                <span>৳{proposal.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          {proposal.payment_instructions && (
            <div className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {language === 'bn' ? 'পেমেন্ট নির্দেশনা' : 'Payment Instructions'}
              </h3>
              <pre className="whitespace-pre-wrap font-sans text-sm opacity-90">
                {proposal.payment_instructions}
              </pre>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>{language === 'bn' ? 'ধন্যবাদ আমাদের সাথে ব্যবসা করার জন্য!' : 'Thank you for your business!'}</p>
            <p className="mt-2">Digiwebdex - Your Digital Partner</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
