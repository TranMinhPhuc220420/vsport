<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReorderContentSectionImagesRequest;
use App\Http\Requests\Admin\StoreContentSectionImageRequest;
use App\Http\Requests\Admin\UpdateContentSectionImageRequest;
use App\Http\Resources\ContentSectionImageResource;
use App\Models\ProductContentSection;
use App\Models\ProductContentSectionImage;
use App\Services\ProductImageStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ContentSectionImageController extends Controller
{
    public function __construct(
        private readonly ProductImageStorage $storage,
    ) {}

    public function store(
        StoreContentSectionImageRequest $request,
        ProductContentSection $contentSection,
    ): JsonResponse {
        $path = $this->storage->uploadContentSection(
            $request->file('image'),
            $contentSection->id,
        );

        $sortOrder = ($contentSection->images()->max('sort_order') ?? -1) + 1;

        $image = ProductContentSectionImage::query()->create([
            'content_section_id' => $contentSection->id,
            'image_url' => $this->storage->publicUrl($path),
            'storage_path' => $path,
            'image_alt_tag' => $request->validated('image_alt_tag'),
            'sort_order' => $request->validated('sort_order') ?? $sortOrder,
        ]);

        return response()->json([
            'image' => ContentSectionImageResource::make($image),
        ], 201);
    }

    public function update(
        UpdateContentSectionImageRequest $request,
        ProductContentSectionImage $contentSectionImage,
    ): JsonResponse {
        $contentSectionImage->update($request->validated());

        return response()->json([
            'image' => ContentSectionImageResource::make($contentSectionImage->fresh()),
        ]);
    }

    public function destroy(ProductContentSectionImage $contentSectionImage): JsonResponse
    {
        $storagePath = $contentSectionImage->storage_path;

        DB::transaction(function () use ($contentSectionImage, $storagePath): void {
            $contentSectionImage->delete();

            if ($storagePath) {
                $this->storage->delete($storagePath);
            }
        });

        return response()->json(['deleted' => true]);
    }

    public function reorder(
        ReorderContentSectionImagesRequest $request,
        ProductContentSection $contentSection,
    ): JsonResponse {
        $order = $request->validated('order');

        DB::transaction(function () use ($contentSection, $order): void {
            foreach ($order as $index => $imageId) {
                ProductContentSectionImage::query()
                    ->where('content_section_id', $contentSection->id)
                    ->whereKey($imageId)
                    ->update(['sort_order' => $index]);
            }
        });

        $images = $contentSection->images()->orderBy('sort_order')->get();

        return response()->json([
            'images' => ContentSectionImageResource::collection($images),
        ]);
    }
}
