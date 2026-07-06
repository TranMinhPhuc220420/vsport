import { Link, router, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import {
    CheckoutField,
    checkoutInputClassName,
} from '@/components/storefront/checkout-form';
import { PageSeo } from '@/components/storefront/page-seo';
import type { SeoData } from '@/components/storefront/page-seo';
import { useCart } from '@/contexts/cart-context';
import { formatCurrency, useLocale } from '@/hooks/use-locale';

function getCsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);

    return match ? decodeURIComponent(match[1]) : '';
}

type SavedAddress = {
    id: number;
    label: string | null;
    recipientName: string;
    phone: string;
    addressLine: string;
    isDefault: boolean;
};

type CheckoutPageProps = {
    stripeKey?: string | null;
    isGuest?: boolean;
    errors?: Record<string, string>;
    seo?: SeoData;
    defaults?: {
        customerName: string;
        customerEmail: string;
        customerPhone: string;
        shippingAddress: string;
    };
    savedAddresses?: SavedAddress[];
};

export default function CheckoutPage(props: CheckoutPageProps) {
    const { t } = useTranslation('storefront');
    const { locale, currency } = useLocale();
    const {
        errors: pageErrors,
        stripeKey: pageStripeKey,
        isGuest: pageIsGuest,
        defaults: pageDefaults,
        savedAddresses: pageSavedAddresses,
        seo: pageSeo,
    } = usePage().props as {
        errors?: Record<string, string>;
        stripeKey?: string | null;
        isGuest?: boolean;
        defaults?: CheckoutPageProps['defaults'];
        savedAddresses?: SavedAddress[];
        seo?: SeoData;
    };
    const errors = { ...pageErrors, ...props.errors };
    const stripeKey = props.stripeKey ?? pageStripeKey;
    const isGuest = props.isGuest ?? pageIsGuest ?? false;
    const defaults = props.defaults ?? pageDefaults;
    const savedAddresses = props.savedAddresses ?? pageSavedAddresses ?? [];
    const seo = props.seo ?? pageSeo;
    const { items, subtotal, itemCount } = useCart();
    const [customerName, setCustomerName] = useState(
        defaults?.customerName ?? '',
    );
    const [customerEmail, setCustomerEmail] = useState(
        defaults?.customerEmail ?? '',
    );
    const [customerPhone, setCustomerPhone] = useState(
        defaults?.customerPhone ?? '',
    );
    const [shippingAddress, setShippingAddress] = useState(
        defaults?.shippingAddress ?? '',
    );
    const [selectedAddressId, setSelectedAddressId] = useState(
        () => savedAddresses.find((address) => address.isDefault)?.id ?? '',
    );
    const [saveAddress, setSaveAddress] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe'>('cod');
    const [processing, setProcessing] = useState(false);
    const [applyingCode, setApplyingCode] = useState(false);
    const [discountError, setDiscountError] = useState<string | null>(null);

    const applySavedAddress = (addressId: string) => {
        setSelectedAddressId(addressId);

        const address = savedAddresses.find(
            (item) => String(item.id) === addressId,
        );

        if (address) {
            setCustomerPhone(address.phone);
            setShippingAddress(address.addressLine);
        }
    };

    const total = Math.max(0, subtotal - discountAmount);

    const applyDiscount = async () => {
        if (!discountCode.trim()) {
            return;
        }

        setApplyingCode(true);
        setDiscountError(null);

        try {
            const response = await fetch('/api/discount/validate', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ code: discountCode }),
            });

            const body = await response.json();

            if (!response.ok) {
                setDiscountAmount(0);
                setDiscountError(body.message ?? t('checkout.invalidDiscount'));

                return;
            }

            setDiscountAmount(body.discountAmount);
        } catch {
            setDiscountError(t('checkout.discountError'));
        } finally {
            setApplyingCode(false);
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (items.length === 0) {
            return;
        }

        setProcessing(true);

        router.post(
            '/checkout',
            {
                customerName,
                customerEmail: isGuest ? customerEmail : undefined,
                customerPhone,
                shippingAddress,
                discountCode: discountCode.trim() || undefined,
                paymentMethod,
                saveAddress: !isGuest && saveAddress ? true : undefined,
            },
            {
                onFinish: () => setProcessing(false),
            },
        );
    };

    if (items.length === 0) {
        return (
            <>
                {seo ? <PageSeo seo={seo} /> : null}
                <div className="storefront-container storefront-section text-center">
                    <p className="text-body-strong text-mute">
                        {t('checkout.empty')}
                    </p>
                    <StorefrontButton
                        variant="primary"
                        className="mt-6"
                        asChild
                    >
                        <Link href="/cart">{t('checkout.backToBag')}</Link>
                    </StorefrontButton>
                </div>
            </>
        );
    }

    return (
        <>
            {seo ? <PageSeo seo={seo} /> : null}

            <div className="storefront-container storefront-section">
                <h1 className="text-heading-xl text-ink">
                    {t('checkout.title')}
                </h1>
                <p className="text-caption-md mt-2 text-mute">
                    {t('checkout.description')}
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 grid gap-8 desktop:grid-cols-[1fr_320px]"
                >
                    <div className="space-y-6">
                        <CheckoutField
                            id="customerName"
                            label={t('checkout.fullName')}
                            error={errors.customerName}
                        >
                            <input
                                id="customerName"
                                name="customerName"
                                type="text"
                                required
                                value={customerName}
                                onChange={(e) =>
                                    setCustomerName(e.target.value)
                                }
                                className={checkoutInputClassName}
                            />
                        </CheckoutField>

                        {isGuest && (
                            <CheckoutField
                                id="customerEmail"
                                label={t('checkout.email')}
                                error={errors.customerEmail}
                            >
                                <input
                                    id="customerEmail"
                                    name="customerEmail"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={customerEmail}
                                    onChange={(e) =>
                                        setCustomerEmail(e.target.value)
                                    }
                                    className={checkoutInputClassName}
                                />
                            </CheckoutField>
                        )}

                        {!isGuest && savedAddresses.length > 0 && (
                            <CheckoutField
                                id="savedAddress"
                                label={t('checkout.savedAddress')}
                            >
                                <select
                                    id="savedAddress"
                                    value={selectedAddressId}
                                    onChange={(e) =>
                                        applySavedAddress(e.target.value)
                                    }
                                    className={checkoutInputClassName}
                                >
                                    <option value="">
                                        {t('checkout.savedAddressNew')}
                                    </option>
                                    {savedAddresses.map((address) => (
                                        <option
                                            key={address.id}
                                            value={address.id}
                                        >
                                            {address.label ||
                                                address.recipientName}
                                        </option>
                                    ))}
                                </select>
                            </CheckoutField>
                        )}

                        <CheckoutField
                            id="customerPhone"
                            label={t('checkout.phone')}
                            error={errors.customerPhone}
                        >
                            <input
                                id="customerPhone"
                                name="customerPhone"
                                type="tel"
                                required
                                value={customerPhone}
                                onChange={(e) =>
                                    setCustomerPhone(e.target.value)
                                }
                                className={checkoutInputClassName}
                            />
                        </CheckoutField>

                        <CheckoutField
                            id="shippingAddress"
                            label={t('checkout.shippingAddress')}
                            error={errors.shippingAddress}
                        >
                            <textarea
                                id="shippingAddress"
                                name="shippingAddress"
                                required
                                rows={4}
                                value={shippingAddress}
                                onChange={(e) =>
                                    setShippingAddress(e.target.value)
                                }
                                className={checkoutInputClassName}
                            />
                        </CheckoutField>

                        {!isGuest && (
                            <label className="text-caption-md flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={saveAddress}
                                    onChange={(e) =>
                                        setSaveAddress(e.target.checked)
                                    }
                                />
                                {t('checkout.saveAddress')}
                            </label>
                        )}

                        <CheckoutField
                            id="discountCode"
                            label={t('checkout.promoCode')}
                            error={
                                errors.discountCode ??
                                discountError ??
                                undefined
                            }
                        >
                            <div className="flex gap-2">
                                <input
                                    id="discountCode"
                                    name="discountCode"
                                    type="text"
                                    value={discountCode}
                                    onChange={(e) =>
                                        setDiscountCode(e.target.value)
                                    }
                                    className={checkoutInputClassName}
                                />
                                <StorefrontButton
                                    type="button"
                                    variant="secondary"
                                    onClick={applyDiscount}
                                    disabled={applyingCode}
                                >
                                    {t('checkout.apply')}
                                </StorefrontButton>
                            </div>
                        </CheckoutField>

                        <fieldset className="space-y-3">
                            <legend className="text-body-strong text-ink">
                                {t('checkout.paymentMethod')}
                            </legend>
                            <label className="text-caption-md flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={() => setPaymentMethod('cod')}
                                />
                                {t('checkout.cod')}
                            </label>
                            <label className="text-caption-md flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="stripe"
                                    checked={paymentMethod === 'stripe'}
                                    onChange={() => setPaymentMethod('stripe')}
                                    disabled={!stripeKey}
                                />
                                {t('checkout.card')}
                                {!stripeKey && (
                                    <span className="text-mute">
                                        {t('checkout.unavailable')}
                                    </span>
                                )}
                            </label>
                            {errors.paymentMethod && (
                                <p className="text-caption-md text-sale">
                                    {errors.paymentMethod}
                                </p>
                            )}
                        </fieldset>

                        {Object.keys(errors).some((key) =>
                            key.startsWith('items.'),
                        ) && (
                            <p className="text-caption-md text-sale">
                                {t('checkout.stockError')}
                            </p>
                        )}
                    </div>

                    <aside className="border border-hairline p-6 desktop:sticky desktop:top-24">
                        <h2 className="text-heading-lg text-ink">
                            {t('checkout.orderSummary')}
                        </h2>
                        <ul className="mt-4 space-y-3">
                            {items.map((item) => (
                                <li
                                    key={item.variantId}
                                    className="text-caption-md flex justify-between gap-4"
                                >
                                    <span className="text-mute">
                                        {item.productName} × {item.quantity}
                                    </span>
                                    <span className="text-ink">
                                        {formatCurrency(
                                            item.unitPrice * item.quantity,
                                            locale,
                                            currency,
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        {discountAmount > 0 && (
                            <div className="text-caption-md mt-4 flex justify-between text-sale">
                                <span>{t('checkout.discount')}</span>
                                <span>
                                    -
                                    {formatCurrency(
                                        discountAmount,
                                        locale,
                                        currency,
                                    )}
                                </span>
                            </div>
                        )}
                        <div className="text-body-strong mt-4 flex justify-between border-t border-hairline pt-4">
                            <span>
                                {t('checkout.totalWithCount', {
                                    count: itemCount,
                                })}
                            </span>
                            <span>
                                {formatCurrency(total, locale, currency)}
                            </span>
                        </div>
                        <StorefrontButton
                            type="submit"
                            variant="primary"
                            className="mt-6 w-full"
                            disabled={processing}
                            data-testid="checkout-submit"
                        >
                            {t('checkout.placeOrder')}
                        </StorefrontButton>
                    </aside>
                </form>
            </div>
        </>
    );
}
