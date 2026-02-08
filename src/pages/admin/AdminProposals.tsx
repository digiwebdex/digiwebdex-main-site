import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { proposalService, Proposal, ProposalStats } from '@/services/proposal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  MoreHorizontal,
  Send,
  Eye,
  Download,
  Trash2,
  Copy,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ProposalFormModal } from '@/components/admin/proposals/ProposalFormModal';
import { ProposalPreviewModal } from '@/components/admin/proposals/ProposalPreviewModal';
import { DeleteConfirmDialog } from '@/components/admin/common';

const AdminProposals: React.FC = () => {
  const { language } = useLanguage();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<ProposalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [proposalsData, statsData] = await Promise.all([
        proposalService.getProposals({ status: statusFilter, search }),
        proposalService.getStats(),
      ]);
      setProposals(proposalsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading proposals:', error);
      toast.error(language === 'bn' ? 'ডেটা লোড করতে সমস্যা হয়েছে' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  const handleSend = async (proposal: Proposal) => {
    try {
      await proposalService.sendProposal(proposal.id);
      toast.success(language === 'bn' ? 'প্রস্তাব পাঠানো হয়েছে' : 'Proposal sent successfully');
      loadData();
    } catch (error) {
      toast.error(language === 'bn' ? 'পাঠাতে সমস্যা হয়েছে' : 'Failed to send proposal');
    }
  };

  const handleCopyLink = (proposal: Proposal) => {
    const url = proposalService.getPublicUrl(proposal);
    navigator.clipboard.writeText(url);
    toast.success(language === 'bn' ? 'লিংক কপি হয়েছে' : 'Link copied to clipboard');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await proposalService.deleteProposal(deleteId);
      toast.success(language === 'bn' ? 'প্রস্তাব মুছে ফেলা হয়েছে' : 'Proposal deleted');
      setDeleteId(null);
      loadData();
    } catch (error) {
      toast.error(language === 'bn' ? 'মুছতে সমস্যা হয়েছে' : 'Failed to delete');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      draft: { variant: 'secondary', label: language === 'bn' ? 'ড্রাফট' : 'Draft' },
      sent: { variant: 'default', label: language === 'bn' ? 'পাঠানো' : 'Sent' },
      accepted: { variant: 'default', label: language === 'bn' ? 'গৃহীত' : 'Accepted' },
      rejected: { variant: 'destructive', label: language === 'bn' ? 'প্রত্যাখ্যাত' : 'Rejected' },
      expired: { variant: 'outline', label: language === 'bn' ? 'মেয়াদোত্তীর্ণ' : 'Expired' },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {language === 'bn' ? 'প্রস্তাব ও কোটেশন' : 'Proposals & Quotations'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'ক্লায়েন্টদের জন্য প্রফেশনাল প্রস্তাব তৈরি করুন' : 'Create professional proposals for clients'}
            </p>
          </div>
          <Button onClick={() => { setSelectedProposal(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'নতুন প্রস্তাব' : 'New Proposal'}
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'মোট' : 'Total'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{stats.total}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'পাঠানো' : 'Sent'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-blue-500" />
                  <span className="text-2xl font-bold">{stats.sent}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'গৃহীত' : 'Accepted'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-2xl font-bold">{stats.accepted}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'প্রত্যাখ্যাত' : 'Rejected'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-2xl font-bold">{stats.rejected}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'গ্রহণের হার' : 'Acceptance Rate'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{stats.acceptance_rate.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'রাজস্ব' : 'Revenue'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">৳{stats.total_revenue.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'bn' ? 'নাম, ফোন বা নম্বর দিয়ে খুঁজুন...' : 'Search by name, phone or number...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={language === 'bn' ? 'স্ট্যাটাস' : 'Status'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'bn' ? 'সব' : 'All'}</SelectItem>
              <SelectItem value="draft">{language === 'bn' ? 'ড্রাফট' : 'Draft'}</SelectItem>
              <SelectItem value="sent">{language === 'bn' ? 'পাঠানো' : 'Sent'}</SelectItem>
              <SelectItem value="accepted">{language === 'bn' ? 'গৃহীত' : 'Accepted'}</SelectItem>
              <SelectItem value="rejected">{language === 'bn' ? 'প্রত্যাখ্যাত' : 'Rejected'}</SelectItem>
              <SelectItem value="expired">{language === 'bn' ? 'মেয়াদোত্তীর্ণ' : 'Expired'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Proposals Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'bn' ? 'প্রস্তাব নম্বর' : 'Proposal #'}</TableHead>
                  <TableHead>{language === 'bn' ? 'ক্লায়েন্ট' : 'Client'}</TableHead>
                  <TableHead>{language === 'bn' ? 'সার্ভিস' : 'Service'}</TableHead>
                  <TableHead>{language === 'bn' ? 'মোট' : 'Total'}</TableHead>
                  <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                  <TableHead>{language === 'bn' ? 'মেয়াদ' : 'Expiry'}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Clock className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : proposals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {language === 'bn' ? 'কোনো প্রস্তাব পাওয়া যায়নি' : 'No proposals found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  proposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell className="font-medium">{proposal.proposal_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{proposal.client_name}</p>
                          <p className="text-sm text-muted-foreground">{proposal.client_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{proposal.service_type}</p>
                          {proposal.package_name && (
                            <p className="text-sm text-muted-foreground">{proposal.package_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ৳{proposal.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                      <TableCell>
                        {proposal.expiry_date && (
                          <span className={new Date(proposal.expiry_date) < new Date() ? 'text-red-500' : ''}>
                            {format(new Date(proposal.expiry_date), 'dd MMM yyyy')}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedProposal(proposal); setIsPreviewOpen(true); }}>
                              <Eye className="h-4 w-4 mr-2" />
                              {language === 'bn' ? 'প্রিভিউ' : 'Preview'}
                            </DropdownMenuItem>
                            {proposal.status === 'draft' && (
                              <>
                                <DropdownMenuItem onClick={() => { setSelectedProposal(proposal); setIsFormOpen(true); }}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  {language === 'bn' ? 'সম্পাদনা' : 'Edit'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSend(proposal)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  {language === 'bn' ? 'পাঠান' : 'Send'}
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => handleCopyLink(proposal)}>
                              <Copy className="h-4 w-4 mr-2" />
                              {language === 'bn' ? 'লিংক কপি' : 'Copy Link'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(proposalService.getPublicUrl(proposal), '_blank')}>
                              <Download className="h-4 w-4 mr-2" />
                              {language === 'bn' ? 'PDF ডাউনলোড' : 'Download PDF'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(proposal.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {language === 'bn' ? 'মুছুন' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ProposalFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        proposal={selectedProposal}
        onSuccess={loadData}
      />

      <ProposalPreviewModal
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        proposal={selectedProposal}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title={language === 'bn' ? 'প্রস্তাব মুছুন' : 'Delete Proposal'}
        description={language === 'bn' ? 'আপনি কি নিশ্চিত এই প্রস্তাবটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this proposal?'}
      />
    </AdminLayout>
  );
};

export default AdminProposals;
