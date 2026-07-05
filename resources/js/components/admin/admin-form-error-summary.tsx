import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

type AdminFormErrorSummaryProps = {
    errors: Record<string, string | undefined>;
};

function collectErrorMessages(
    errors: Record<string, string | undefined>,
): { field: string; message: string }[] {
    return Object.entries(errors)
        .filter(([, message]) => Boolean(message))
        .map(([field, message]) => ({ field, message: message as string }));
}

export function AdminFormErrorSummary({ errors }: AdminFormErrorSummaryProps) {
    const { t } = useTranslation('admin');
    const messages = collectErrorMessages(errors);

    if (messages.length === 0) {
        return null;
    }

    return (
        <div
            role="alert"
            className="rounded-admin-md border border-red-200 bg-red-50 px-4 py-3"
        >
            <p className="text-sm font-medium text-red-800">
                {t('form.validationSummaryTitle')}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                {messages.map(({ field, message }) => (
                    <li key={field}>{message}</li>
                ))}
            </ul>
        </div>
    );
}

export function notifyAdminFormValidationError(message: string): void {
    toast.error(message);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
