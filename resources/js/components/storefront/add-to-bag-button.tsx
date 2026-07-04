import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';

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
            className={className}
            disabled={disabled}
            onClick={onClick}
        >
            {t('pdp.addToBag')}
        </StorefrontButton>
    );
}

export { AddToBagButton };
