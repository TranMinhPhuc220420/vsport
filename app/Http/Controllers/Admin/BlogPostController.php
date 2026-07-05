<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BlogPostStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBlogPostRequest;
use App\Http\Requests\Admin\UpdateBlogPostRequest;
use App\Http\Resources\BlogCategoryResource;
use App\Http\Resources\BlogPostResource;
use App\Http\Resources\BlogTagResource;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use App\Models\Product;
use App\Services\Admin\AdminActivityService;
use App\Services\Blog\BlogPostService;
use App\Services\ProductImageStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlogPostController extends Controller
{
    public function __construct(
        private readonly BlogPostService $blogPosts,
        private readonly AdminActivityService $activity,
        private readonly ProductImageStorage $imageStorage,
    ) {}

    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        if (! in_array($status, ['all', 'draft', 'published'], true)) {
            $status = 'all';
        }

        $posts = BlogPost::query()
            ->with('category')
            ->when($status !== 'all', fn ($query) => $query->where('status', $status))
            ->orderByDesc('updated_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/blog-posts/index', [
            'posts' => [
                'data' => collect($posts->items())->map(fn (BlogPost $post) => [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'excerpt' => $post->excerpt,
                    'status' => $post->status->value,
                    'isFeatured' => $post->is_featured,
                    'publishedAt' => $post->published_at?->toIso8601String(),
                    'updatedAt' => $post->updated_at?->toIso8601String(),
                    'categoryName' => $post->category?->name,
                    'authorName' => $post->author_name,
                    'readingTimeMinutes' => $post->reading_time_minutes,
                    'featuredImageUrl' => $this->imageStorage->urlFor(
                        $post->featured_image_url,
                        $post->featured_image_path,
                    ),
                    'featuredImageAlt' => $post->featured_image_alt,
                ])->values()->all(),
                'links' => [
                    'first' => $posts->url(1),
                    'last' => $posts->url($posts->lastPage()),
                    'prev' => $posts->previousPageUrl(),
                    'next' => $posts->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $posts->currentPage(),
                    'last_page' => $posts->lastPage(),
                    'total' => $posts->total(),
                ],
            ],
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/blog-posts/create', $this->formOptions());
    }

    public function store(StoreBlogPostRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $post = $this->blogPosts->create(
            $validated,
            $validated['tag_ids'],
            $validated['product_ids'],
        );

        $this->activity->log(
            $request->user(),
            'blog_posts.store',
            $post,
            request: $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.blog_post_created'),
        ]);

        return redirect()->route('admin.blog-posts.edit', $post);
    }

    public function edit(BlogPost $blogPost): Response
    {
        $blogPost->load(['category', 'tags', 'products']);

        return Inertia::render('admin/blog-posts/edit', [
            'post' => BlogPostResource::make($blogPost)->resolve(),
            ...$this->formOptions(),
        ]);
    }

    public function update(UpdateBlogPostRequest $request, BlogPost $blogPost): RedirectResponse
    {
        $validated = $request->validated();

        $post = $this->blogPosts->update(
            $blogPost,
            $validated,
            $validated['tag_ids'],
            $validated['product_ids'],
        );

        $this->activity->log(
            $request->user(),
            'blog_posts.update',
            $post,
            request: $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.blog_post_updated'),
        ]);

        return redirect()->route('admin.blog-posts.edit', $post);
    }

    public function destroy(BlogPost $blogPost): RedirectResponse
    {
        $this->activity->log(
            request()->user(),
            'blog_posts.destroy',
            $blogPost,
            request: request(),
        );

        $blogPost->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.blog_post_deleted'),
        ]);

        return redirect()->route('admin.blog-posts.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'categories' => BlogCategoryResource::collection(
                BlogCategory::query()->orderBy('sort_order')->orderBy('name')->get(),
            )->resolve(),
            'tags' => BlogTagResource::collection(
                BlogTag::query()->orderBy('name')->get(),
            )->resolve(),
            'productOptions' => Product::query()
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
                ->map(fn (Product $product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                ])
                ->values()
                ->all(),
            'statusOptions' => [
                BlogPostStatus::Draft->value,
                BlogPostStatus::Published->value,
            ],
        ];
    }
}
