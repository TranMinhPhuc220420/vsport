<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\InvalidDiscountCodeException;
use App\Http\Controllers\Controller;
use App\Services\Cart\CartService;
use App\Services\Discount\DiscountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiscountController extends Controller
{
    public function validateCode(Request $request, DiscountService $discounts, CartService $carts): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
        ]);

        $cart = $carts->loadCartForResponse($carts->resolveCart($request));
        $subtotal = (float) collect($cart->items)->sum(function ($item) {
            $colorway = $item->variant->colorway;

            return ((float) ($colorway->discount_price ?? $colorway->price)) * $item->quantity;
        });

        try {
            $discount = $discounts->validate($validated['code'], $subtotal);
            $amount = $discounts->calculateAmount($discount, $subtotal);
        } catch (InvalidDiscountCodeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'code' => $discount->code,
            'discountAmount' => $amount,
            'total' => max(0, round($subtotal - $amount, 2)),
        ]);
    }
}
