<?php

namespace App\Services\Cart;

use App\Exceptions\CheckoutStockException;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Models\User;
use App\Support\CartSession;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartService
{
    private const TTL_HOURS = 24;

    public function __construct(
        private readonly InventoryReservationService $reservations,
    ) {}

    public function resolveCart(Request $request): Cart
    {
        if ($request->user() !== null) {
            return $this->resolveUserCart($request->user());
        }

        $sessionId = CartSession::idFromRequest($request);

        if ($sessionId !== null) {
            $cart = Cart::query()
                ->where('session_id', $sessionId)
                ->whereNull('user_id')
                ->first();

            if ($cart !== null) {
                $this->touchExpiry($cart);

                return $cart;
            }
        }

        return Cart::query()->create([
            'session_id' => $sessionId ?? CartSession::generateId(),
            'expires_at' => $this->defaultExpiry(),
        ]);
    }

    public function resolveUserCart(User $user): Cart
    {
        $cart = Cart::query()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'expires_at' => $this->defaultExpiry(),
            ],
        );

        $this->touchExpiry($cart);

        return $cart;
    }

    public function mergeGuestCartIntoUser(string $sessionId, User $user): void
    {
        DB::transaction(function () use ($sessionId, $user): void {
            $guestCart = Cart::query()
                ->where('session_id', $sessionId)
                ->whereNull('user_id')
                ->with('items')
                ->first();

            if ($guestCart === null || $guestCart->items->isEmpty()) {
                return;
            }

            $userCart = $this->resolveUserCart($user);

            foreach ($guestCart->items as $guestItem) {
                $existing = CartItem::query()
                    ->where('cart_id', $userCart->id)
                    ->where('variant_id', $guestItem->variant_id)
                    ->first();

                if ($existing !== null) {
                    $delta = $guestItem->quantity;
                    $this->reservations->reserveDelta(
                        ProductVariant::query()->findOrFail($guestItem->variant_id),
                        $delta,
                    );
                    $existing->update([
                        'quantity' => $existing->quantity + $guestItem->quantity,
                        'custom_configuration' => $guestItem->custom_configuration ?? $existing->custom_configuration,
                    ]);
                    $this->reservations->release($guestItem->variant_id, $guestItem->quantity);
                } else {
                    CartItem::query()->create([
                        'cart_id' => $userCart->id,
                        'variant_id' => $guestItem->variant_id,
                        'quantity' => $guestItem->quantity,
                        'custom_configuration' => $guestItem->custom_configuration,
                    ]);
                }
            }

            $guestCart->items()->delete();
            $guestCart->delete();
        });
    }

    /**
     * @param  array<string, mixed>|null  $customConfiguration
     */
    public function addOrUpdateItem(
        Cart $cart,
        int $variantId,
        int $quantity,
        ?array $customConfiguration = null,
    ): CartItem {
        if ($quantity < 1 || $quantity > 10) {
            throw new CheckoutStockException([0 => 'Quantity must be between 1 and 10.']);
        }

        return DB::transaction(function () use ($cart, $variantId, $quantity, $customConfiguration): CartItem {
            $variant = ProductVariant::query()->findOrFail($variantId);
            $item = CartItem::query()
                ->where('cart_id', $cart->id)
                ->where('variant_id', $variantId)
                ->lockForUpdate()
                ->first();

            $previousQty = $item?->quantity ?? 0;
            $delta = $quantity - $previousQty;

            $this->reservations->reserveDelta($variant, $delta);

            if ($item === null) {
                return CartItem::query()->create([
                    'cart_id' => $cart->id,
                    'variant_id' => $variantId,
                    'quantity' => $quantity,
                    'custom_configuration' => $customConfiguration,
                ]);
            }

            $item->update([
                'quantity' => $quantity,
                'custom_configuration' => $customConfiguration ?? $item->custom_configuration,
            ]);

            return $item->fresh();
        });
    }

    public function removeItem(Cart $cart, int $variantId): void
    {
        DB::transaction(function () use ($cart, $variantId): void {
            $item = CartItem::query()
                ->where('cart_id', $cart->id)
                ->where('variant_id', $variantId)
                ->lockForUpdate()
                ->first();

            if ($item === null) {
                return;
            }

            $this->reservations->release($variantId, $item->quantity);
            $item->delete();
        });
    }

    public function clearCartKeepingReservations(Cart $cart): void
    {
        $cart->items()->delete();
    }

    public function releaseCartReservations(Cart $cart): void
    {
        DB::transaction(function () use ($cart): void {
            $cart->load('items');

            foreach ($cart->items as $item) {
                $this->reservations->release($item->variant_id, $item->quantity);
            }

            $cart->items()->delete();
            $cart->delete();
        });
    }

    public function releaseExpiredCarts(): int
    {
        $count = 0;

        Cart::query()
            ->where('expires_at', '<', now())
            ->with('items')
            ->orderBy('id')
            ->chunkById(50, function ($carts) use (&$count): void {
                foreach ($carts as $cart) {
                    $this->releaseCartReservations($cart);
                    $count++;
                }
            });

        return $count;
    }

    public function loadCartForResponse(Cart $cart): Cart
    {
        return $cart->load([
            'items.variant.product',
            'items.variant.optionValues.option',
            'items.variant.optionValues.images',
            'items.variant.inventory',
        ]);
    }

    private function touchExpiry(Cart $cart): void
    {
        $cart->update(['expires_at' => $this->defaultExpiry()]);
    }

    private function defaultExpiry(): CarbonInterface
    {
        return now()->addHours(self::TTL_HOURS);
    }
}
