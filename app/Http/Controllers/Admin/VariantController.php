<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SyncColorwayVariantsRequest;
use App\Http\Requests\Admin\UpdateColorwayInventoryRequest;
use App\Http\Requests\Admin\UpdateInventoryRequest;
use App\Models\ProductColorway;
use App\Models\ProductVariant;
use App\Services\Catalog\ProductAdminService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class VariantController extends Controller
{
    public function __construct(
        private readonly ProductAdminService $products,
    ) {}

    public function sync(SyncColorwayVariantsRequest $request, ProductColorway $colorway): RedirectResponse
    {
        $this->products->syncColorwayVariants($colorway, $request->validated('variants'));

        return redirect()->route('admin.products.edit', $colorway->product);
    }

    public function updateInventory(
        UpdateInventoryRequest $request,
        ProductVariant $variant,
    ): RedirectResponse {
        $this->products->updateInventoryQuantity($variant, (int) $request->validated('quantity'));

        $variant->loadMissing('colorway');

        return redirect()->route('admin.products.edit', $variant->colorway->product);
    }

    public function updateColorwayInventory(
        UpdateColorwayInventoryRequest $request,
        ProductColorway $colorway,
    ): RedirectResponse {
        $colorway->loadMissing('product');

        $this->products->batchUpdateColorwayInventory(
            $colorway,
            $request->validated('variants'),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.inventory_updated'),
        ]);

        return redirect()->route('admin.products.edit', [
            'product' => $colorway->product,
            'tab' => 'inventory',
        ]);
    }
}
