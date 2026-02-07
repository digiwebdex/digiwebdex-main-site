import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/lib/i18n';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  loading = false,
}: DeleteConfirmDialogProps) {
  const { language } = useLanguage();

  const defaultTitle = language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?';
  const defaultDescription = language === 'bn'
    ? 'এই ক্রিয়াটি পূর্বাবস্থায় ফেরানো যাবে না। এটি স্থায়ীভাবে মুছে ফেলা হবে।'
    : 'This action cannot be undone. This will permanently delete this item.';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || defaultTitle}</AlertDialogTitle>
          <AlertDialogDescription>{description || defaultDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {language === 'bn' ? 'বাতিল' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading 
              ? (language === 'bn' ? 'মুছছে...' : 'Deleting...') 
              : (language === 'bn' ? 'মুছুন' : 'Delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
