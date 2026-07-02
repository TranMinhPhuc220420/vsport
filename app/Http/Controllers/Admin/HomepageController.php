<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateHomepageCampaignRequest;
use App\Models\Product;
use App\Services\Admin\AdminActivityService;
use App\Services\ProductImageStorage;
use App\Services\Site\HomepageSettingsService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class HomepageController extends Controller
{
    public function __construct(
        private readonly AdminActivityService $activity,
        private readonly ProductImageStorage $storage,
    ) {}

    public function edit(HomepageSettingsService $homepage): Response
    {
        $featuredProducts = Product::query()
            ->where('is_featured', true)
            ->orderByDesc('updated_at')
            ->limit(12)
            ->get(['id', 'name', 'slug', 'style_code']);

        return Inertia::render('admin/homepage/edit', [
            'campaigns' => array_map(
                fn ($campaign) => $campaign->toArray(),
                $homepage->campaigns(),
            ),
            'featuredProducts' => [
                'data' => $featuredProducts->map(fn (Product $product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'styleCode' => $product->style_code,
                ])->values()->all(),
            ],
        ]);
    }

    public function update(
        UpdateHomepageCampaignRequest $request,
        HomepageSettingsService $homepage,
    ): RedirectResponse {
        $validated = $request->validated();

        $campaigns = [];

        foreach (array_values($validated['campaigns']) as $index => $item) {
            $imageUrl = $item['imageUrl'] ?? '';

            if ($request->hasFile("campaigns.$index.image")) {
                $path = $this->storage->uploadHomepage($request->file("campaigns.$index.image"));
                $imageUrl = $this->storage->publicUrl($path);
            }

            $campaigns[] = [
                'headline' => $item['headline'],
                'subtitle' => $item['subtitle'],
                'imageUrl' => $imageUrl,
                'ctaLabel' => $item['ctaLabel'],
                'ctaHref' => $item['ctaHref'],
            ];
        }

        $homepage->updateCampaigns($campaigns);

        $this->activity->log(
            $request->user(),
            'homepage.update',
            properties: ['campaigns' => $campaigns],
            request: $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.homepage_updated'),
        ]);

        return redirect()->route('admin.homepage.edit');
    }
}
