import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusType = 
  | 'active' | 'inactive' | 'pending' | 'processing' | 'completed' | 'cancelled'
  | 'paid' | 'unpaid' | 'overdue' | 'refunded'
  | 'draft' | 'published' | 'scheduled'
  | 'approved' | 'rejected' | 'review'
  | 'suspended' | 'expired';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  // General
  active: { label: 'Active', variant: 'default', className: 'bg-green-500 hover:bg-green-600' },
  inactive: { label: 'Inactive', variant: 'secondary' },
  pending: { label: 'Pending', variant: 'outline', className: 'border-yellow-500 text-yellow-600' },
  processing: { label: 'Processing', variant: 'outline', className: 'border-blue-500 text-blue-600' },
  completed: { label: 'Completed', variant: 'default', className: 'bg-green-500 hover:bg-green-600' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  
  // Payment/Invoice
  paid: { label: 'Paid', variant: 'default', className: 'bg-green-500 hover:bg-green-600' },
  unpaid: { label: 'Unpaid', variant: 'outline', className: 'border-yellow-500 text-yellow-600' },
  overdue: { label: 'Overdue', variant: 'destructive' },
  refunded: { label: 'Refunded', variant: 'secondary' },
  
  // Content
  draft: { label: 'Draft', variant: 'secondary' },
  published: { label: 'Published', variant: 'default', className: 'bg-green-500 hover:bg-green-600' },
  scheduled: { label: 'Scheduled', variant: 'outline', className: 'border-blue-500 text-blue-600' },
  
  // Approval
  approved: { label: 'Approved', variant: 'default', className: 'bg-green-500 hover:bg-green-600' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  review: { label: 'In Review', variant: 'outline', className: 'border-purple-500 text-purple-600' },
  in_review: { label: 'In Review', variant: 'outline', className: 'border-purple-500 text-purple-600' },
  in_progress: { label: 'In Progress', variant: 'outline', className: 'border-blue-500 text-blue-600' },
  
  // Hosting/Domain
  suspended: { label: 'Suspended', variant: 'destructive' },
  expired: { label: 'Expired', variant: 'destructive' },
  registered: { label: 'Registered', variant: 'default', className: 'bg-green-500 hover:bg-green-600' },
  transferring: { label: 'Transferring', variant: 'outline', className: 'border-yellow-500 text-yellow-600' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || { 
    label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '), 
    variant: 'secondary' as const 
  };

  return (
    <Badge 
      variant={config.variant} 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
