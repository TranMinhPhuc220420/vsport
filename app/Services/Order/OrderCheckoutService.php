<?php

namespace App\Services\Order;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Exceptions\CheckoutStockException;
use App\Models\Cart;
use App\Models\DiscountCode;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Services\Cart\CartService;
use App\Services\Discount\DiscountService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderCheckoutService
{
    public function __construct(
        private readonly CartService $cartService,
        private readonly DiscountService $discountService,
        private readonly OrderNotificationService $notifications,
    ) {}

    /**
     * @param  array{
     *     customerName: string,
     *     customerPhone: string,
     *     shippingAddress: string,
     *     customerEmail?: string|null,
     *     discountCode?: string|null,
     *     paymentMethod?: string|null,
     * }  $payload
     */
    public function createFromCart(Cart $cart, ?int $userId, array $payload): Order
    {
        return DB::transaction(function () use ($cart, $userId, $payload): Order {
            $cart = Cart::query()
                ->whereKey($cart->id)
                ->with(['items.variant.colorway.product', 'items.variant.inventory'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($cart->items->isEmpty()) {
                throw new CheckoutStockException([0 => 'Your bag is empty.']);
            }

            $stockErrors = [];

            foreach ($cart->items as $index => $item) {
                $variant = $item->variant;
                $available = $variant?->inventory?->availableQuantity() ?? 0;

                if ($variant === null || $item->quantity > $available) {
                    $size = $variant?->size_val ?? 'item';
                    $stockErrors[$index] = "{$size} is out of stock.";
                }
            }

            if ($stockErrors !== []) {
                throw new CheckoutStockException($stockErrors);
            }

            $subtotal = 0.0;
            $orderItems = [];

            foreach ($cart->items as $item) {
                /** @var ProductVariant $variant */
                $variant = $item->variant;
                $unitPrice = $variant->unitPrice();
                $subtotal += $unitPrice * $item->quantity;

                $orderItems[] = [
                    'variant_id' => $variant->id,
                    'product_name' => $variant->colorway->product->name,
                    'color_name' => $variant->colorway->color_name,
                    'size_val' => $variant->size_val,
                    'custom_configuration' => $item->custom_configuration,
                    'quantity' => $item->quantity,
                    'unit_price' => $unitPrice,
                ];
            }

            $discountAmount = 0.0;
            $discountCode = null;

            if (! empty($payload['discountCode'])) {
                $discountCode = $this->discountService->validate(
                    (string) $payload['discountCode'],
                    $subtotal,
                );
                $discountAmount = $this->discountService->calculateAmount($discountCode, $subtotal);
            }

            $paymentMethod = PaymentMethod::tryFrom((string) ($payload['paymentMethod'] ?? 'cod'))
                ?? PaymentMethod::Cod;

            $order = Order::query()->create([
                'user_id' => $userId,
                'order_number' => $this->generateOrderNumber(),
                'status' => OrderStatus::Pending,
                'total_amount' => max(0, round($subtotal - $discountAmount, 2)),
                'discount_code_id' => $discountCode?->id,
                'discount_amount' => $discountAmount,
                'shipping_address' => json_encode([
                    'name' => $payload['customerName'],
                    'phone' => $payload['customerPhone'],
                    'address' => $payload['shippingAddress'],
                    'email' => $payload['customerEmail'] ?? null,
                ], JSON_THROW_ON_ERROR),
                'payment_intent_id' => null,
                'payment_method' => $paymentMethod,
            ]);

            $order->items()->createMany($orderItems);

            if ($discountCode instanceof DiscountCode) {
                $discountCode->increment('used_count');
            }

            $this->cartService->clearCartKeepingReservations($cart);

            $order = $order->load(['items', 'user']);

            $this->notifications->sendConfirmationIfCod($order);

            return $order;
        });
    }

    /**
     * @param  array{
     *     customerName: string,
     *     customerPhone: string,
     *     shippingAddress: string,
     *     customerEmail?: string|null,
     *     discountCode?: string|null,
     *     paymentMethod?: string|null,
     * }  $payload
     */
    public function create(int $userId, array $payload): Order
    {
        $cart = Cart::query()
            ->where('user_id', $userId)
            ->first();

        if ($cart === null) {
            throw new CheckoutStockException([0 => 'Your bag is empty.']);
        }

        return $this->createFromCart($cart, $userId, $payload);
    }

    private function generateOrderNumber(): string
    {
        do {
            $number = 'VS-'.Str::upper(Str::random(8));
        } while (Order::query()->where('order_number', $number)->exists());

        return $number;
    }
}
