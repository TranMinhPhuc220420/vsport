<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRichtextImageRequest;
use App\Services\ProductImageStorage;
use Illuminate\Http\JsonResponse;

class RichtextImageController extends Controller
{
    public function __construct(
        private readonly ProductImageStorage $storage,
    ) {}

    public function store(StoreRichtextImageRequest $request): JsonResponse
    {
        $path = $this->storage->uploadRichtext($request->file('image'));

        return response()->json([
            'url' => $this->storage->publicUrl($path),
        ]);
    }
}
