<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CartSession
{
    public const COOKIE_NAME = 'cart_session_id';

    public static function idFromRequest(Request $request): ?string
    {
        $sessionId = $request->cookie(self::COOKIE_NAME);

        return is_string($sessionId) && $sessionId !== '' ? $sessionId : null;
    }

    public static function generateId(): string
    {
        return (string) Str::uuid();
    }
}
