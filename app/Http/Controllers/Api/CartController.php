<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartResource;
use App\Services\Cart\CartService;
use App\Support\CartSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $cart = $this->cartService->resolveCart($request);
        $cart = $this->cartService->loadCartForResponse($cart);

        return $this->cartResponse($request, $cart);
    }

    public function storeItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'variantId' => ['required', 'integer', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:10'],
            'customConfiguration' => ['nullable', 'array'],
        ]);

        $cart = $this->cartService->resolveCart($request);
        $this->cartService->addOrUpdateItem(
            $cart,
            (int) $validated['variantId'],
            (int) $validated['quantity'],
            $validated['customConfiguration'] ?? null,
        );

        $cart = $this->cartService->loadCartForResponse($cart->fresh());

        return $this->cartResponse($request, $cart);
    }

    public function updateItem(Request $request, int $variant): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:10'],
            'customConfiguration' => ['nullable', 'array'],
        ]);

        $cart = $this->cartService->resolveCart($request);
        $this->cartService->addOrUpdateItem(
            $cart,
            $variant,
            (int) $validated['quantity'],
            $validated['customConfiguration'] ?? null,
        );

        $cart = $this->cartService->loadCartForResponse($cart->fresh());

        return $this->cartResponse($request, $cart);
    }

    public function destroyItem(Request $request, int $variant): JsonResponse
    {
        $cart = $this->cartService->resolveCart($request);
        $this->cartService->removeItem($cart, $variant);

        $cart = $this->cartService->loadCartForResponse($cart->fresh());

        return $this->cartResponse($request, $cart);
    }

    private function cartResponse(Request $request, $cart): JsonResponse
    {
        $response = (new CartResource($cart))->response();

        if ($request->user() === null && $cart->session_id !== null) {
            $response->cookie(
                CartSession::COOKIE_NAME,
                $cart->session_id,
                60 * 24 * 30,
                '/',
                null,
                false,
                true,
                false,
                'lax',
            );
        }

        return $response;
    }
}
