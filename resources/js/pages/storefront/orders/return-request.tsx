import { Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import { PageSeo } from '@/components/storefront/page-seo';
import type { SeoData } from '@/components/storefront/page-seo';
import { formatCurrency, useLocale } from '@/hooks/use-locale';
import type { OrderDetail } from '@/types/order';

type ReturnEligibility = {
    eligible: boolean;
    reason: string | null;
};

type ReturnRequestPageProps = {
    order: OrderDetail;
    eligibility: ReturnEligibility;
    seo: SeoData;
};

type ReturnItemForm = {
    orderItemId: number;
    quantity: number;
    selected: boolean;
};

export default function ReturnRequestPage({
    order,
    eligibility,
    seo,
}: ReturnRequestPageProps) {
    const { t } = useTranslation(['storefront', 'common']);
    const { locale, currency } = useLocale();

    const initialItems = useMemo<ReturnItemForm[]>(
        () =>
            order.items.map((item) => ({
                orderItemId: item.id,
                quantity: item.quantity,
                selected: false,
            })),
        [order.items],
    );

    const { data, setData, post, processing, errors, transform } = useForm({
        reason: '',
        items: initialItems,
    });

    const toggleItem = (orderItemId: number, selected: boolean) => {
        setData(
            'items',
            data.items.map((item) =>
                item.orderItemId === orderItemId ? { ...item, selected } : item,
            ),
        );
    };

    const setQuantity = (orderItemId: number, quantity: number) => {
        setData(
            'items',
            data.items.map((item) =>
                item.orderItemId === orderItemId ? { ...item, quantity } : item,
            ),
        );
    };

    const submit = () => {
        const selectedItems = data.items
            .filter((item) => item.selected)
            .map((item) => ({
                orderItemId: item.orderItemId,
                quantity: item.quantity,
            }));

        transform(() => ({
            reason: data.reason,
            items: selectedItems,
        }));

        post(`/orders/${order.orderNumber}/returns`);
    };

    const ineligibleMessage = eligibility.reason
        ? t(`storefront:orders.returns.ineligible.${eligibility.reason}`)
        : null;
    const formErrors = errors as typeof errors & { return?: string };

    return (
        <>
            <PageSeo seo={seo} />

            <div className="storefront-container storefront-section">
                <Link
                    href={`/orders/${order.orderNumber}`}
                    className="text-caption-md text-mute hover:underline"
                >
                    {t('storefront:orders.backToOrder')}
                </Link>

                <h1 className="text-heading-xl mt-4 text-ink">
                    {t('storefront:orders.returns.title')}
                </h1>
                <p className="text-caption-md mt-2 text-mute">
                    {t('storefront:orders.returns.subtitle', {
                        orderNumber: order.orderNumber,
                    })}
                </p>

                {!eligibility.eligible ? (
                    <div className="mt-8 border border-hairline p-6">
                        <p className="text-body-strong text-ink">
                            {t('storefront:orders.returns.notEligible')}
                        </p>
                        {ineligibleMessage ? (
                            <p className="text-caption-md mt-2 text-mute">
                                {ineligibleMessage}
                            </p>
                        ) : null}
                    </div>
                ) : (
                    <form
                        className="mt-8 space-y-8"
                        onSubmit={(event) => {
                            event.preventDefault();
                            submit();
                        }}
                    >
                        <section className="border border-hairline">
                            <h2 className="text-heading-lg border-b border-hairline px-6 py-4 text-ink">
                                {t('storefront:orders.returns.selectItems')}
                            </h2>
                            <ul>
                                {order.items.map((item) => {
                                    const formItem = data.items.find(
                                        (row) => row.orderItemId === item.id,
                                    );

                                    if (!formItem) {
                                        return null;
                                    }

                                    return (
                                        <li
                                            key={item.id}
                                            className="flex flex-col gap-4 border-b border-hairline-soft px-6 py-4 last:border-b-0 tablet:flex-row tablet:items-center tablet:justify-between"
                                        >
                                            <label className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    className="mt-1"
                                                    checked={formItem.selected}
                                                    onChange={(event) =>
                                                        toggleItem(
                                                            item.id,
                                                            event.target
                                                                .checked,
                                                        )
                                                    }
                                                />
                                                <span>
                                                    <span className="text-body-strong text-ink">
                                                        {item.productName}
                                                    </span>
                                                    <span className="text-caption-md mt-1 block text-mute">
                                                        {(item.options ?? [])
                                                            .map(
                                                                (option) =>
                                                                    option.value,
                                                            )
                                                            .join(' / ') ||
                                                            `${item.colorName} / ${item.size}`}{' '}
                                                        ·{' '}
                                                        {formatCurrency(
                                                            item.lineTotal,
                                                            locale,
                                                            currency,
                                                        )}
                                                    </span>
                                                </span>
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-caption-md text-mute">
                                                    {t(
                                                        'storefront:orders.returns.quantity',
                                                    )}
                                                </span>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={item.quantity}
                                                    value={formItem.quantity}
                                                    disabled={
                                                        !formItem.selected
                                                    }
                                                    className="w-20 border border-hairline px-2 py-1"
                                                    onChange={(event) =>
                                                        setQuantity(
                                                            item.id,
                                                            Number(
                                                                event.target
                                                                    .value,
                                                            ),
                                                        )
                                                    }
                                                />
                                                <span className="text-caption-md text-mute">
                                                    / {item.quantity}
                                                </span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>

                        <section className="border border-hairline p-6">
                            <label
                                htmlFor="return-reason"
                                className="text-heading-lg text-ink"
                            >
                                {t('storefront:orders.returns.reason')}
                            </label>
                            <textarea
                                id="return-reason"
                                rows={4}
                                className="mt-4 w-full border border-hairline p-3"
                                value={data.reason}
                                onChange={(event) =>
                                    setData('reason', event.target.value)
                                }
                            />
                            {errors.reason ? (
                                <p className="text-caption-md mt-2 text-red-600">
                                    {errors.reason}
                                </p>
                            ) : null}
                            {errors.items ? (
                                <p className="text-caption-md mt-2 text-red-600">
                                    {errors.items}
                                </p>
                            ) : null}
                            {formErrors.return ? (
                                <p className="text-caption-md mt-2 text-red-600">
                                    {formErrors.return}
                                </p>
                            ) : null}
                        </section>

                        <StorefrontButton type="submit" disabled={processing}>
                            {t('storefront:orders.returns.submit')}
                        </StorefrontButton>
                    </form>
                )}
            </div>
        </>
    );
}
