<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOpsToken
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $configuredToken = (string) config('ops.token');

        if ($configuredToken === '') {
            abort(503, 'OPS_TOKEN is not configured.');
        }

        $providedToken = (string) ($request->query('token') ?? $request->header('X-Ops-Token'));

        if ($providedToken === '' || ! hash_equals($configuredToken, $providedToken)) {
            abort(403, 'Invalid ops token.');
        }

        return $next($request);
    }
}
