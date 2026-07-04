<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateCategoryImageAltRequest;
use App\Http\Requests\Admin\UploadCategoryImageRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\ProductImageStorage;
use App\Support\CatalogCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class CategoryImageController extends Controller
{
    public function __construct(
        private readonly ProductImageStorage $storage,
    ) {}

    public function store(UploadCategoryImageRequest $request, Category $category): JsonResponse
    {
        if ($category->image_path !== null) {
            $this->storage->delete($category->image_path);
        }

        $path = $this->storage->uploadCategory($request->file('image'), $category->id);

        $category->update([
            'image_path' => $path,
            'image_alt' => $request->validated('image_alt') ?? $category->image_alt ?? $category->name,
        ]);

        CatalogCache::forget();

        return response()->json([
            'category' => CategoryResource::make($category->fresh('children'))->resolve(),
        ]);
    }

    public function updateAlt(
        UpdateCategoryImageAltRequest $request,
        Category $category,
    ): JsonResponse {
        $category->update([
            'image_alt' => $request->validated('image_alt'),
        ]);

        CatalogCache::forget();

        return response()->json([
            'category' => CategoryResource::make($category->fresh('children'))->resolve(),
        ]);
    }

    public function destroy(Category $category): Response
    {
        if ($category->image_path !== null) {
            $this->storage->delete($category->image_path);
        }

        $category->update([
            'image_path' => null,
            'image_alt' => null,
        ]);

        CatalogCache::forget();

        return response()->noContent();
    }
}
