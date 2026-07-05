<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UploadBlogFeaturedImageRequest;
use App\Http\Resources\BlogPostResource;
use App\Models\BlogPost;
use App\Services\ProductImageStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class BlogFeaturedImageController extends Controller
{
    public function __construct(
        private readonly ProductImageStorage $storage,
    ) {}

    public function store(UploadBlogFeaturedImageRequest $request, BlogPost $blogPost): JsonResponse
    {
        if ($blogPost->featured_image_path !== null) {
            $this->storage->delete($blogPost->featured_image_path);
        }

        $path = $this->storage->uploadBlogFeatured($request->file('image'), $blogPost->id);

        $blogPost->update([
            'featured_image_path' => $path,
            'featured_image_url' => $this->storage->publicUrl($path),
            'featured_image_alt' => $request->validated('image_alt')
                ?? $blogPost->featured_image_alt
                ?? $blogPost->title,
        ]);

        return response()->json([
            'post' => BlogPostResource::make($blogPost->fresh())->resolve(),
        ]);
    }

    public function destroy(BlogPost $blogPost): Response
    {
        if ($blogPost->featured_image_path !== null) {
            $this->storage->delete($blogPost->featured_image_path);
        }

        $blogPost->update([
            'featured_image_path' => null,
            'featured_image_url' => null,
            'featured_image_alt' => null,
        ]);

        return response()->noContent();
    }
}
