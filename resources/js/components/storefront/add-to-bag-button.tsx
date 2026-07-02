import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import { cn } from '@/lib/utils';

type AddToBagButtonProps = {
    disabled?: boolean;
    onClick: () => void;
    className?: string;
};

function AddToBagButton({ disabled, onClick, className }: AddToBagButtonProps) {
    const { t } = useTranslation('storefront');

    return (
        <StorefrontButton
            variant="primary"
            className={cn('w-full', className)}
            disabled={disabled}
            onClick={onClick}
        >
            {t('pdp.addToBag')}
        </StorefrontButton>
    );
}

export { AddToBagButton };
