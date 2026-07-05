<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBlogCategoryRequest;
use App\Http\Requests\Admin\UpdateBlogCategoryRequest;
use App\Http\Resources\BlogCategoryResource;
use App\Models\BlogCategory;
use App\Services\Admin\AdminActivityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BlogCategoryController extends Controller
{
    public function __construct(
        private readonly AdminActivityService $activity,
    ) {}

    public function index(): Response
    {
        $categories = BlogCategory::query()
            ->withCount('posts')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/blog-categories/index', [
            'categories' => [
                'data' => $categories->map(fn (BlogCategory $category) => [
                    ...BlogCategoryResource::make($category)->resolve(),
                    'postsCount' => $category->posts_count,
                ])->values()->all(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/blog-categories/create');
    }

    public function store(StoreBlogCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->resolveSlug($data['slug'], $data['name']);

        $category = BlogCategory::query()->create($data);

        $this->activity->log(
            $request->user(),
            'blog_categories.store',
            $category,
            request: $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.blog_category_created'),
        ]);

        return redirect()->route('admin.blog-categories.index');
    }

    public function edit(BlogCategory $blogCategory): Response
    {
        return Inertia::render('admin/blog-categories/edit', [
            'category' => BlogCategoryResource::make($blogCategory)->resolve(),
        ]);
    }

    public function update(UpdateBlogCategoryRequest $request, BlogCategory $blogCategory): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->resolveSlug($data['slug'], $data['name'], $blogCategory->id);

        $blogCategory->update($data);

        $this->activity->log(
            $request->user(),
            'blog_categories.update',
            $blogCategory,
            request: $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.blog_category_updated'),
        ]);

        return redirect()->route('admin.blog-categories.index');
    }

    public function destroy(BlogCategory $blogCategory): RedirectResponse
    {
        if ($blogCategory->posts()->exists()) {
            return back()->withErrors([
                'category' => __('messages.blog_category_has_posts'),
            ]);
        }

        $this->activity->log(
            request()->user(),
            'blog_categories.destroy',
            $blogCategory,
            request: request(),
        );

        $blogCategory->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.blog_category_deleted'),
        ]);

        return redirect()->route('admin.blog-categories.index');
    }

    private function resolveSlug(?string $slug, string $name, ?int $ignoreId = null): string
    {
        $base = $slug !== null && trim($slug) !== '' ? $slug : Str::slug($name);
        $candidate = $base;
        $suffix = 1;

        while (
            BlogCategory::query()
                ->where('slug', $candidate)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $candidate = "{$base}-{$suffix}";
            $suffix++;
        }

        return $candidate;
    }
}
