<?php

namespace App\Http\Resources;

use App\Models\SizeGuide;
use App\Services\ProductImageStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin SizeGuide
 */
class SizeGuideResource extends JsonResource
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
            'categoryId' => $this->category_id,
            'categoryName' => $this->whenLoaded('category', fn () => $this->category?->name),
            'brandId' => $this->brand_id,
            'brandName' => $this->whenLoaded('brand', fn () => $this->brand?->name),
            'isDefault' => $this->is_default,
            'columns' => $this->columns,
            'measureContentHtml' => $this->measure_content,
            'measureImageUrl' => $storage->urlFor(
                filter_var($this->measure_image_path, FILTER_VALIDATE_URL) ? $this->measure_image_path : null,
                filter_var($this->measure_image_path, FILTER_VALIDATE_URL) ? null : $this->measure_image_path,
            ),
            'measureImageAlt' => $this->measure_image_alt,
            'rows' => $this->when(
                $this->relationLoaded('rows'),
                fn () => $this->rows
                    ->map(fn ($row) => [
                        'id' => $row->id,
                        'position' => $row->position,
                        'values' => $row->values,
                    ])
                    ->values()
                    ->all(),
            ),
        ];
    }
}
