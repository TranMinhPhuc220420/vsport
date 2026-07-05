<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSizeGuideRequest;
use App\Http\Requests\Admin\UpdateSizeGuideRequest;
use App\Http\Resources\SizeGuideResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\SizeGuide;
use App\Services\Admin\AdminActivityService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SizeGuideController extends Controller
{
    private const DEFAULT_COLUMNS = ['VN', 'US', 'UK', 'EU', 'CM'];

    public function __construct(
        private readonly AdminActivityService $activity,
    ) {}

    public function index(): Response
    {
        $sizeGuides = SizeGuide::query()
            ->with(['category', 'brand'])
            ->withCount('rows')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/size-guides/index', [
            'sizeGuides' => [
                'data' => $sizeGuides->map(fn (SizeGuide $sizeGuide) => [
                    ...SizeGuideResource::make($sizeGuide)->resolve(),
                    'rowsCount' => $sizeGuide->rows_count,
                ])->values()->all(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/size-guides/create', [
            'categories' => $this->categoryOptions(),
            'brands' => $this->brandOptions(),
        ]);
    }

    public function store(StoreSizeGuideRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $this->clearExistingDefault($data);

        $sizeGuide = SizeGuide::query()->create([
            ...$data,
            'columns' => self::DEFAULT_COLUMNS,
        ]);

        $this->activity->log($request->user(), 'size_guides.store', $sizeGuide, request: $request);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.size_guide_created'),
        ]);

        return redirect()->route('admin.size-guides.edit', $sizeGuide);
    }

    public function edit(SizeGuide $sizeGuide): Response
    {
        $sizeGuide->load(['category', 'brand', 'rows']);

        return Inertia::render('admin/size-guides/edit', [
            'sizeGuide' => SizeGuideResource::make($sizeGuide)->resolve(),
            'categories' => $this->categoryOptions(),
            'brands' => $this->brandOptions(),
        ]);
    }

    public function update(UpdateSizeGuideRequest $request, SizeGuide $sizeGuide): RedirectResponse
    {
        $data = $request->validated();
        $this->clearExistingDefault($data, $sizeGuide->id);

        $sizeGuide->update($data);

        $this->activity->log($request->user(), 'size_guides.update', $sizeGuide, request: $request);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.size_guide_updated'),
        ]);

        return redirect()->route('admin.size-guides.index');
    }

    public function destroy(SizeGuide $sizeGuide): RedirectResponse
    {
        $this->activity->log(request()->user(), 'size_guides.destroy', $sizeGuide, request: request());

        $sizeGuide->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.size_guide_deleted'),
        ]);

        return redirect()->route('admin.size-guides.index');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function clearExistingDefault(array $data, ?int $excludeId = null): void
    {
        if (! ($data['is_default'] ?? false)) {
            return;
        }

        SizeGuide::query()
            ->where('is_default', true)
            ->when($excludeId, fn ($query) => $query->where('id', '!=', $excludeId))
            ->update(['is_default' => false]);
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    private function categoryOptions(): array
    {
        return Category::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
            ])
            ->all();
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    private function brandOptions(): array
    {
        return Brand::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Brand $brand) => [
                'id' => $brand->id,
                'name' => $brand->name,
            ])
            ->all();
    }
}
