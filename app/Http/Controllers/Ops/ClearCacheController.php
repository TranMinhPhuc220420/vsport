<?php

namespace App\Http\Controllers\Ops;

use App\Http\Controllers\Controller;
use App\Services\Ops\ClearCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClearCacheController extends Controller
{
    public function __invoke(Request $request, ClearCacheService $clearCache): JsonResponse
    {
        $result = $clearCache->run(warm: $request->boolean('warm'));

        return response()->json($result, $result['success'] ? 200 : 500);
    }
}
