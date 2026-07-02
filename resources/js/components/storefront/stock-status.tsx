import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

type StockStatusProps = {
    inStock: boolean;
    className?: string;
};

function StockStatus({ inStock, className }: StockStatusProps) {
    const { t } = useTranslation('storefront');

    return (
        <p
            data-slot="stock-status"
            className={cn(
                'text-caption-md',
                inStock ? 'text-success' : 'text-mute',
                className,
            )}
        >
            {inStock ? t('pdp.inStock') : t('pdp.outOfStock')}
        </p>
    );
}

export { StockStatus };
