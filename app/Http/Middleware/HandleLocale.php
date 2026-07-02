<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class HandleLocale
{
    /** @var list<string> */
    public const SUPPORTED = ['vi', 'en'];

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->cookie('locale', 'vi');

        if (! in_array($locale, self::SUPPORTED, true)) {
            $locale = 'vi';
        }

        App::setLocale($locale);

        return $next($request);
    }
}
