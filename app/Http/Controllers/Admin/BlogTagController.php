<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBlogTagRequest;
use App\Http\Requests\Admin\UpdateBlogTagRequest;
use App\Http\Resources\BlogTagResource;
use App\Models\BlogTag;
use App\Services\Admin\AdminActivityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BlogTagController extends Controller
{
    public function __construct(
        private readonly AdminActivityService $activity,
    ) {}

    public function index(): Response
    {
        $tags = BlogTag::query()
            ->withCount('posts')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/blog-tags/index', [
            'tags' => [
                'data' => $tags->map(fn (BlogTag $tag) => [
                    ...BlogTagResource::make($tag)->resolve(),
                    'postsCount' => $tag->posts_count,
                ])->values()->all(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/blog-tags/create');
    }

    public function store(StoreBlogTagRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->resolveSlug($data['slug'], $data['name']);

        $tag = BlogTag::query()->create($data);

        $this->activity->log(
            $request->user(),
            'blog_tags.store',
            $tag,
            request: $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.blog_tag_created'),
        ]);

        return redirect()->route('admin.blog-tags.index');
    }

    public function edit(BlogTag $blogTag): Response
    {
        return Inertia::render('admin/blog-tags/edit', [
            'tag' => BlogTagResource::make($blogTag)->resolve(),
        ]);
    }

    public function update(UpdateBlogTagRequest $request, BlogTag $blogTag): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->resolveSlug($data['slug'], $data['name'], $blogTag->id);

        $blogTag->update($data);

        $this->activity->log(
            $request->user(),
            'blog_tags.update',
            $blogTag,
            request: $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.blog_tag_updated'),
        ]);

        return redirect()->route('admin.blog-tags.index');
    }

    public function destroy(BlogTag $blogTag): RedirectResponse
    {
        $this->activity->log(
            request()->user(),
            'blog_tags.destroy',
            $blogTag,
            request: request(),
        );

        $blogTag->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.blog_tag_deleted'),
        ]);

        return redirect()->route('admin.blog-tags.index');
    }

    private function resolveSlug(?string $slug, string $name, ?int $ignoreId = null): string
    {
        $base = $slug !== null && trim($slug) !== '' ? $slug : Str::slug($name);
        $candidate = $base;
        $suffix = 1;

        while (
            BlogTag::query()
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
