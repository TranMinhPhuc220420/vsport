<?php

namespace App\Listeners;

use App\Services\Cart\CartService;
use App\Support\CartSession;
use Illuminate\Auth\Events\Login;

class MergeCartOnLogin
{
    public function __construct(
        private readonly CartService $cartService,
    ) {}

    public function handle(Login $event): void
    {
        $request = request();
        $sessionId = CartSession::idFromRequest($request);

        if ($sessionId === null) {
            return;
        }

        $this->cartService->mergeGuestCartIntoUser($sessionId, $event->user);
    }
}
