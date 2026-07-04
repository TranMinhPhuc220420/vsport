import { useTranslation } from 'react-i18next';

import { AdminButton } from '@/components/admin/ui/admin-button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type AdminConfirmDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void;
    loading?: boolean;
};

export function AdminConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    cancelLabel,
    variant = 'default',
    onConfirm,
    loading = false,
}: AdminConfirmDialogProps) {
    const { t } = useTranslation('common');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="vsport-admin rounded-admin-lg border-admin bg-[var(--admin-surface)]">
                <DialogHeader className="pr-8">
                    <DialogTitle className="admin-section-title text-left break-words">
                        {title}
                    </DialogTitle>
                    {description && (
                        <DialogDescription className="admin-caption text-left break-words">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                <DialogFooter className="flex-row justify-end gap-2">
                    <AdminButton
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        {cancelLabel ?? t('cancel')}
                    </AdminButton>
                    <AdminButton
                        type="button"
                        variant={
                            variant === 'destructive'
                                ? 'destructive'
                                : 'primary'
                        }
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {confirmLabel ?? t('confirm')}
                    </AdminButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
