<?php

namespace App\Http\Resources;

use App\Models\Category;
use App\Services\ProductImageStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Category
 */
class CategoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var ProductImageStorage $storage */
        $storage = app(ProductImageStorage::class);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'parentId' => $this->parent_id,
            'imageUrl' => $this->image_path !== null
                ? $storage->publicUrl($this->image_path)
                : null,
            'imageAlt' => $this->image_alt,
            'children' => $this->when(
                $this->relationLoaded('children'),
                fn () => $this->children
                    ->map(fn (Category $child) => (new self($child))->toArray($request))
                    ->values()
                    ->all(),
            ),
        ];
    }
}
