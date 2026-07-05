<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Product
 */
class AdminProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'styleCode' => $this->style_code,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'descriptionHtml' => $this->description_html,
            'categoryId' => $this->category_id,
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'brandId' => $this->brand_id,
            'subTitle' => $this->sub_title,
            'basePrice' => (float) $this->base_price,
            'gender' => $this->gender->value,
            'isCustomizable' => $this->is_customizable,
            'options' => $this->whenLoaded('options', fn () => $this->options->map(fn ($option) => [
                'id' => $option->id,
                'name' => $option->name,
                'position' => $option->position,
                'displayType' => $option->display_type->value,
                'isRequired' => $option->is_required,
                'drivesGallery' => $option->drives_gallery,
                'metadata' => $option->metadata,
                'values' => $option->values->map(fn ($value) => [
                    'id' => $value->id,
                    'value' => $value->value,
                    'slug' => $value->slug,
                    'swatchHex' => $value->swatch_hex,
                    'salePrice' => $value->sale_price !== null ? (float) $value->sale_price : null,
                    'metadata' => $value->metadata,
                    'sortOrder' => $value->sort_order,
                    'images' => ProductImageResource::collection($value->images)->resolve(),
                ]),
            ])),
            'variants' => $this->whenLoaded('variants', fn () => $this->variants->map(fn ($variant) => [
                'id' => $variant->id,
                'sku' => $variant->sku,
                'optionValueIds' => $variant->optionValues->pluck('id')->values()->all(),
                'optionLabels' => $variant->optionValues
                    ->sortBy(fn ($v) => $v->option->position)
                    ->pluck('value')
                    ->values()
                    ->all(),
                'quantity' => $variant->inventory?->quantity ?? 0,
                'available' => $variant->inventory?->availableQuantity() ?? 0,
            ])),
            'attributes' => $this->whenLoaded('attributes', fn () => $this->attributes->map(fn ($attr) => [
                'id' => $attr->id,
                'group' => $attr->group->value,
                'key' => $attr->key,
                'label' => $attr->label,
                'value' => $attr->value,
                'sortOrder' => $attr->sort_order,
                'optionValueId' => $attr->option_value_id,
            ])),
            'contentSections' => $this->relationLoaded('contentSections')
                ? $this->contentSections->map(fn ($section) => [
                    'id' => $section->id,
                    'title' => $section->title,
                    'content' => $section->content,
                    'contentHtml' => $section->content_html,
                    'sortOrder' => $section->sort_order,
                    'images' => $section->relationLoaded('images')
                        ? ContentSectionImageResource::collection($section->images)->resolve()
                        : [],
                ])->values()->all()
                : [],
            'customizationOptions' => $this->whenLoaded('customizationOptions', fn () => $this->customizationOptions->map(fn ($option) => [
                'componentName' => $option->component_name,
                'allowedMaterials' => $option->allowed_materials,
                'allowedColors' => $option->allowed_colors,
            ])),
        ];
    }
}
