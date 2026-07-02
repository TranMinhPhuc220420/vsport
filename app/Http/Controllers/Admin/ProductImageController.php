<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReorderProductImagesRequest;
use App\Http\Requests\StoreProductImageRequest;
use App\Http\Requests\UpdateProductImageRequest;
use App\Http\Resources\ProductImageResource;
use App\Models\ProductColorway;
use App\Models\ProductImage;
use App\Services\ProductImageStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProductImageController extends Controller
{
    public function __construct(
        private readonly ProductImageStorage $storage,
    ) {}

    public function store(StoreProductImageRequest $request, ProductColorway $colorway): JsonResponse
    {
        $path = $this->storage->upload($request->file('image'), $colorway->id);

        $hasImages = $colorway->images()->exists();
        $sortOrder = ($colorway->images()->max('sort_order') ?? -1) + 1;
        $isPrimary = $request->has('is_primary')
            ? (bool) $request->validated('is_primary')
            : ! $hasImages;

        $image = DB::transaction(function () use ($request, $colorway, $path, $sortOrder, $isPrimary) {
            if ($isPrimary) {
                $colorway->images()->update(['is_primary' => false]);
            }

            return ProductImage::query()->create([
                'colorway_id' => $colorway->id,
                'image_url' => $this->storage->publicUrl($path),
                'storage_path' => $path,
                'image_alt_tag' => $request->validated('image_alt_tag'),
                'is_primary' => $isPrimary,
                'sort_order' => $request->validated('sort_order') ?? $sortOrder,
            ]);
        });

        return response()->json([
            'image' => ProductImageResource::make($image),
        ], 201);
    }

    public function update(UpdateProductImageRequest $request, ProductImage $image): JsonResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($image, $validated) {
            if (($validated['is_primary'] ?? false) === true) {
                ProductImage::query()
                    ->where('colorway_id', $image->colorway_id)
                    ->whereKeyNot($image->id)
                    ->update(['is_primary' => false]);
            }

            $image->update($validated);
        });

        return response()->json([
            'image' => ProductImageResource::make($image->fresh()),
        ]);
    }

    public function destroy(ProductImage $image): JsonResponse
    {
        $colorwayId = $image->colorway_id;
        $wasPrimary = $image->is_primary;
        $storagePath = $image->storage_path;

        DB::transaction(function () use ($image, $wasPrimary, $colorwayId, $storagePath) {
            $image->delete();

            if ($storagePath) {
                $this->storage->delete($storagePath);
            }

            if ($wasPrimary) {
                $nextPrimary = ProductImage::query()
                    ->where('colorway_id', $colorwayId)
                    ->orderBy('sort_order')
                    ->first();

                if ($nextPrimary) {
                    ProductImage::query()
                        ->where('colorway_id', $colorwayId)
                        ->update(['is_primary' => false]);

                    $nextPrimary->update(['is_primary' => true]);
                }
            }
        });

        return response()->json(['deleted' => true]);
    }

    public function reorder(
        ReorderProductImagesRequest $request,
        ProductColorway $colorway,
    ): JsonResponse {
        $order = $request->validated('order');

        DB::transaction(function () use ($colorway, $order) {
            foreach ($order as $index => $imageId) {
                ProductImage::query()
                    ->where('colorway_id', $colorway->id)
                    ->whereKey($imageId)
                    ->update(['sort_order' => $index]);
            }
        });

        $images = $colorway->images()->orderBy('sort_order')->get();

        return response()->json([
            'images' => ProductImageResource::collection($images),
        ]);
    }
}
