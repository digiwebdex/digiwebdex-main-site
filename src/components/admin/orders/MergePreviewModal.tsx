import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Merge } from 'lucide-react';

interface MergeItem {
  service_type?: string | null;
  package_name?: string | null;
  domain?: string | null;
  price?: number;
  total?: number;
}

interface MergeOrder {
  id: string;
  order_number: string;
  items?: MergeItem[];
  total?: number;
  service_type?: string;
}

interface MergePreviewModalProps {
  open: boolean;
  orders: MergeOrder[];
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function MergePreviewModal({ open, orders, onClose, onConfirm, loading }: MergePreviewModalProps) {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!orders?.length) return;

    const allItems: MergeItem[] = [];
    let sum = 0;

    orders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          allItems.push(item);
          sum += Number(item.total || item.price || 0);
        });
      } else {
        // Fallback: use order itself as an item
        allItems.push({
          service_type: order.service_type,
          package_name: null,
          domain: null,
          price: Number(order.total || 0),
          total: Number(order.total || 0),
        });
        sum += Number(order.total || 0);
      }
    });

    setItems(allItems);
    setTotal(sum);
  }, [orders]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Merge className="h-5 w-5 text-primary" />
            Merge Orders Preview
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          {orders.length} টি অর্ডার মার্জ হবে: {orders.map(o => o.order_number).join(', ')}
        </p>

        <ScrollArea className="max-h-80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.package_name || item.service_type || '-'}</TableCell>
                  <TableCell>{item.domain || '-'}</TableCell>
                  <TableCell className="text-right">৳{Number(item.total || item.price || 0).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        <div className="text-right text-lg font-bold text-primary">
          Total: ৳{total.toLocaleString()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Confirm Merge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
