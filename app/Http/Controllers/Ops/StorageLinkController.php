<?php

namespace App\Http\Controllers\Ops;

use App\Http\Controllers\Controller;
use App\Services\Ops\StorageLinkService;
use Illuminate\Http\JsonResponse;

class StorageLinkController extends Controller
{
    public function __invoke(StorageLinkService $storageLink): JsonResponse
    {
        $result = $storageLink->run();

        return response()->json($result, $result['success'] ? 200 : 500);
    }
}
