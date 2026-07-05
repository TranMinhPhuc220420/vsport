<?php

namespace App\Http\Resources;

use App\Models\ProductContentSectionImage;
use App\Services\ProductImageStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ProductContentSectionImage
 */
class ContentSectionImageResource extends JsonResource
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
            'url' => $storage->urlFor($this->image_url, $this->storage_path),
            'alt' => $this->image_alt_tag,
            'sortOrder' => $this->sort_order,
        ];
    }
}
