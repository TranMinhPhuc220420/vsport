<?php

namespace Database\Seeders;

use App\Enums\BlogPostStatus;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use App\Models\Product;
use Illuminate\Database\Seeder;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $categories = collect([
            ['name' => 'Hướng dẫn', 'slug' => 'huong-dan', 'sort_order' => 0],
            ['name' => 'Xu hướng', 'slug' => 'xu-huong', 'sort_order' => 1],
            ['name' => 'Tập luyện', 'slug' => 'tap-luyen', 'sort_order' => 2],
            ['name' => 'Bền vững', 'slug' => 'ben-vung', 'sort_order' => 3],
        ])->map(fn (array $data) => BlogCategory::query()->firstOrCreate(
            ['slug' => $data['slug']],
            $data,
        ));

        $tags = collect([
            ['name' => 'Giày chạy', 'slug' => 'giay-chay'],
            ['name' => 'Size', 'slug' => 'size'],
            ['name' => 'Mua sắm', 'slug' => 'mua-sam'],
            ['name' => 'Chạy bộ', 'slug' => 'chay-bo'],
            ['name' => 'Beginner', 'slug' => 'beginner'],
            ['name' => 'Gym', 'slug' => 'gym'],
            ['name' => 'Sustainability', 'slug' => 'sustainability'],
        ])->map(fn (array $data) => BlogTag::query()->firstOrCreate(
            ['slug' => $data['slug']],
            $data,
        ));

        $product = Product::query()->orderByDesc('is_featured')->first();

        $posts = [
            [
                'title' => 'Cách chọn size giày chạy đúng',
                'slug' => 'cach-chon-size-giay-chay-dung',
                'excerpt' => 'Hướng dẫn đo chân và chọn size giày chạy phù hợp để tập luyện thoải mái và tránh chấn thương.',
                'body_html' => '<p>Chọn đúng size giày chạy giúp bạn tập luyện hiệu quả hơn. Hãy đo chân vào cuối ngày khi chân hơi sưng nhẹ.</p><p>Để lại khoảng một ngón tay phía trước mũi chân và thử chạy thử vài bước trước khi quyết định.</p>',
                'category' => 'huong-dan',
                'tags' => ['giay-chay', 'size'],
                'is_featured' => true,
            ],
            [
                'title' => '5 lỗi thường gặp khi mua giày thể thao online',
                'slug' => '5-loi-thuong-gap-khi-mua-giay-the-thao-online',
                'excerpt' => 'Tránh những sai lầm phổ biến khi mua giày thể thao trực tuyến để chọn đúng sản phẩm ngay lần đầu.',
                'body_html' => '<p>Nhiều người chỉ nhìn size EU/US mà quên kiểm tra form giày và mục đích sử dụng.</p><p>Hãy đọc mô tả sản phẩm, xem bảng size và ưu tiên shop có chính sách đổi trả rõ ràng.</p>',
                'category' => 'huong-dan',
                'tags' => ['mua-sam'],
                'is_featured' => true,
            ],
            [
                'title' => 'Kế hoạch chạy 5K cho người mới',
                'slug' => 'ke-hoach-chay-5k-cho-nguoi-moi',
                'excerpt' => 'Lộ trình 8 tuần giúp người mới bắt đầu chạy bộ hoàn thành mục tiêu 5K an toàn và bền vững.',
                'body_html' => '<p>Bắt đầu với xen kẽ đi bộ và chạy nhẹ 3 buổi mỗi tuần.</p><p>Tăng dần thời gian chạy, luôn khởi động và giãn cơ sau buổi tập.</p>',
                'category' => 'tap-luyen',
                'tags' => ['chay-bo', 'beginner'],
                'is_featured' => true,
            ],
            [
                'title' => 'Phân biệt giày chạy và giày tập gym',
                'slug' => 'phan-biet-giay-chay-va-giay-tap-gym',
                'excerpt' => 'Giày chạy và giày gym được thiết kế cho chuyển động khác nhau — chọn đúng loại để bảo vệ cơ thể.',
                'body_html' => '<p>Giày chạy tập trung vào đệm và lực đẩy về phía trước.</p><p>Giày gym cần đế bám tốt và ổn định cho các chuyển động đa hướng.</p>',
                'category' => 'huong-dan',
                'tags' => ['giay-chay', 'gym'],
                'is_featured' => true,
            ],
            [
                'title' => 'Vì sao vật liệu tái chế quan trọng với runner',
                'slug' => 'vi-sao-vat-lieu-tai-che-quan-trong-voi-runner',
                'excerpt' => 'Vật liệu tái chế giúp giảm tác động môi trường mà vẫn đảm bảo hiệu suất cho runner hiện đại.',
                'body_html' => '<p>Nhiều thương hiệu thể thao đang dùng polyester tái chế và cao su tái chế cho đế giày.</p><p>Runner có thể chọn sản phẩm bền vững mà không hy sinh đệm hay độ bám.</p>',
                'category' => 'ben-vung',
                'tags' => ['sustainability'],
                'is_featured' => true,
            ],
            [
                'title' => 'Xu hướng giày chạy 2026',
                'slug' => 'xu-huong-giay-chay-2026',
                'excerpt' => 'Những xu hướng giày chạy nổi bật năm 2026 — đệm siêu nhẹ, đế carbon và thiết kế tối giản.',
                'body_html' => '<p>Giày chạy 2026 tập trung vào trọng lượng nhẹ và phản hồi năng lượng tốt hơn.</p><p>Runner nên thử nhiều form giày trước khi chọn mẫu phù hợp với nhịp chạy của mình.</p>',
                'category' => 'xu-huong',
                'tags' => ['giay-chay'],
                'is_featured' => true,
            ],
            [
                'title' => 'Bài tập core cho runner',
                'slug' => 'bai-tap-core-cho-runner',
                'excerpt' => 'Core khỏe giúp runner giữ form chạy ổn định, giảm chấn thương và cải thiện sức bền.',
                'body_html' => '<p>Plank, dead bug và glute bridge là ba bài tập core cơ bản cho runner.</p><p>Tập 2–3 buổi mỗi tuần, mỗi buổi 15 phút là đủ để thấy khác biệt.</p>',
                'category' => 'tap-luyen',
                'tags' => ['chay-bo', 'gym'],
                'is_featured' => true,
            ],
            [
                'title' => 'Cách bảo quản giày thể thao',
                'slug' => 'cach-bao-quan-giay-the-thao',
                'excerpt' => 'Bảo quản đúng cách giúp giày thể thao bền hơn, giữ form đế và đệm lâu dài.',
                'body_html' => '<p>Phơi giày ở nơi thoáng mát, tránh máy sấy nhiệt cao.</p><p>Luân phiên ít nhất hai đôi nếu bạn chạy 4 buổi trở lên mỗi tuần.</p>',
                'category' => 'ben-vung',
                'tags' => ['giay-chay', 'sustainability'],
                'is_featured' => true,
            ],
        ];

        foreach ($posts as $index => $postData) {
            $plain = trim(strip_tags($postData['body_html']));
            $category = $categories->firstWhere('slug', $postData['category']);

            $post = BlogPost::query()->updateOrCreate(
                ['slug' => $postData['slug']],
                [
                    'blog_category_id' => $category?->id,
                    'title' => $postData['title'],
                    'excerpt' => $postData['excerpt'],
                    'body' => $plain,
                    'body_html' => $postData['body_html'],
                    'meta_description' => $postData['excerpt'],
                    'status' => BlogPostStatus::Published,
                    'is_featured' => $postData['is_featured'],
                    'published_at' => now()->subDays(max(0, count($posts) - 1 - $index)),
                    'author_name' => config('app.name', 'Zova Sport'),
                    'reading_time_minutes' => max(1, (int) ceil(str_word_count($plain) / 200)),
                ],
            );

            $tagIds = $tags
                ->whereIn('slug', $postData['tags'])
                ->pluck('id')
                ->all();

            $post->tags()->sync($tagIds);

            if ($product !== null && in_array($postData['slug'], [
                'cach-chon-size-giay-chay-dung',
                'phan-biet-giay-chay-va-giay-tap-gym',
            ], true)) {
                $post->products()->sync([
                    $product->id => ['sort_order' => 0],
                ]);
            }
        }
    }
}
