<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateColorwayInventoryRequest;
use App\Http\Requests\Admin\UpdateInventoryRequest;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Catalog\ProductAdminService;
use Illuminate\Http\RedirectResponse;

class VariantController extends Controller
{
    public function __construct(
        private readonly ProductAdminService $products,
    ) {}

    public function updateInventory(UpdateInventoryRequest $request, ProductVariant $variant): RedirectResponse
    {
        $this->products->updateInventoryQuantity($variant, $request->integer('quantity'));

        $variant->loadMissing('product');

        return redirect()->route('admin.products.edit', [
            'product' => $variant->product,
            'tab' => 'inventory',
        ]);
    }

    public function updateProductInventory(
        UpdateColorwayInventoryRequest $request,
        Product $product,
    ): RedirectResponse {
        $this->products->batchUpdateInventory($product, $request->validated('variants'));

        return redirect()->route('admin.products.edit', [
            'product' => $product,
            'tab' => 'inventory',
        ]);
    }
}
