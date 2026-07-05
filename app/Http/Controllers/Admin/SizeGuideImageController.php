<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSizeGuideImageAltRequest;
use App\Http\Requests\Admin\UploadSizeGuideImageRequest;
use App\Http\Resources\SizeGuideResource;
use App\Models\SizeGuide;
use App\Services\ProductImageStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class SizeGuideImageController extends Controller
{
    public function __construct(
        private readonly ProductImageStorage $storage,
    ) {}

    public function store(UploadSizeGuideImageRequest $request, SizeGuide $sizeGuide): JsonResponse
    {
        if ($sizeGuide->measure_image_path !== null) {
            $this->storage->delete($sizeGuide->measure_image_path);
        }

        $path = $this->storage->uploadSizeGuide($request->file('image'), $sizeGuide->id);

        $sizeGuide->update([
            'measure_image_path' => $path,
            'measure_image_alt' => $request->validated('image_alt') ?? $sizeGuide->measure_image_alt ?? $sizeGuide->name,
        ]);

        return response()->json([
            'sizeGuide' => SizeGuideResource::make($sizeGuide->fresh())->resolve(),
        ]);
    }

    public function updateAlt(
        UpdateSizeGuideImageAltRequest $request,
        SizeGuide $sizeGuide,
    ): JsonResponse {
        $sizeGuide->update([
            'measure_image_alt' => $request->validated('image_alt'),
        ]);

        return response()->json([
            'sizeGuide' => SizeGuideResource::make($sizeGuide->fresh())->resolve(),
        ]);
    }

    public function destroy(SizeGuide $sizeGuide): Response
    {
        if ($sizeGuide->measure_image_path !== null) {
            $this->storage->delete($sizeGuide->measure_image_path);
        }

        $sizeGuide->update([
            'measure_image_path' => null,
            'measure_image_alt' => null,
        ]);

        return response()->noContent();
    }
}
