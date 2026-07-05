<?php

/**
 * Curated stock images for database seeding.
 *
 * All URLs point to Unsplash or Pexels CDN assets that are free for
 * commercial use under their respective licenses:
 * - https://unsplash.com/license
 * - https://www.pexels.com/license/
 *
 * Pinterest and Adobe Stock are intentionally excluded: Pinterest hotlinks
 * are unreliable and often copyrighted; Adobe Stock requires a paid license.
 */

return [
    'homepage_hero' => 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1440&h=600&fit=crop&auto=format',

    'products' => [
        // Zegama 2 — men's trail running
        'DD1391' => [
            'Black' => 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop&auto=format',
            'White' => 'https://images.unsplash.com/photo-1576508122703-d98b0fc9e896?w=800&h=800&fit=crop&auto=format',
        ],
        // Air Max Pulse — men's lifestyle sneaker
        'FN7454' => [
            'Black' => 'https://images.unsplash.com/photo-1615743307208-df0aa5a3f9cf?w=800&h=800&fit=crop&auto=format',
            'White' => 'https://images.unsplash.com/photo-1578314921455-34dd4626b38d?w=800&h=800&fit=crop&auto=format',
        ],
        // Jordan 1 Low — men's basketball-inspired low top
        '553558' => [
            'Black' => 'https://images.unsplash.com/photo-1557461761-c7c2b7a5fa97?w=800&h=800&fit=crop&auto=format',
            'White' => 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&h=800&fit=crop&auto=format',
        ],
        // Revolution 7 — women's running
        'DV4023' => [
            'Black' => 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&h=800&fit=crop&auto=format',
            'White' => 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=800&fit=crop&auto=format',
        ],
    ],

    'bags' => [
        'CORE-BAG' => [
            'Black' => 'https://images.unsplash.com/photo-1708622833152-924c6e364138?w=800&h=800&fit=crop&auto=format',
            'Navy' => 'https://images.unsplash.com/photo-1761653457980-21b9f7fd3a04?w=800&h=800&fit=crop&auto=format',
        ],
    ],

    'paddles' => [
        'OMNI' => [
            'Chalk' => 'https://images.unsplash.com/photo-1769911112109-8ce1e4f75e19?w=800&h=800&fit=crop&auto=format',
            'Cosmic' => 'https://images.pexels.com/photos/2529157/pexels-photo-2529157.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
            'Hydro' => 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
            'Canyon Clay' => 'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
        ],
    ],

    'size_guides' => [
        'shoe_measure' => [
            'url' => 'https://images.unsplash.com/photo-1576508122703-d98b0fc9e896?w=1200&h=800&fit=crop&auto=format',
            'alt' => 'Đo chân để chọn size giày',
            'content' => '<p>Đứng sát tường, đặt tờ giấy lên sàn và đánh dấu gót chân cùng đầu ngón chân dài nhất.</p><p>Đo khoảng cách bằng thước (cm) và đối chiếu với bảng quy đổi size.</p>',
        ],
        'apparel_measure' => [
            'url' => 'https://images.pexels.com/photos/7147587/pexels-photo-7147587.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
            'alt' => 'Đo vòng ngực và vòng eo',
            'content' => '<p>Dùng thước dây quanh vòng ngực và vòng eo ở vị trí rộng nhất, giữ thước song song sàn.</p><p>Đo khi mặc áo lót mỏng; không siết quá chặt.</p>',
        ],
    ],

    'blog' => [
        'cach-chon-size-giay-chay-dung' => [
            'url' => 'https://images.unsplash.com/photo-1576508122703-d98b0fc9e896?w=1200&h=675&fit=crop&auto=format',
            'alt' => 'Đo chân và chọn size giày chạy',
        ],
        '5-loi-thuong-gap-khi-mua-giay-the-thao-online' => [
            'url' => 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&h=675&fit=crop&auto=format',
            'alt' => 'Mua giày thể thao trực tuyến',
        ],
        'ke-hoach-chay-5k-cho-nguoi-moi' => [
            'url' => 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1200&h=675&fit=crop&auto=format',
            'alt' => 'Chạy bộ ngoài trời cho người mới',
        ],
        'phan-biet-giay-chay-va-giay-tap-gym' => [
            'url' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=675&fit=crop&auto=format',
            'alt' => 'Giày tập gym và giày chạy bộ',
        ],
        'vi-sao-vat-lieu-tai-che-quan-trong-voi-runner' => [
            'url' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=675&fit=crop&auto=format',
            'alt' => 'Chạy bộ bền vững với vật liệu tái chế',
        ],
        'xu-huong-giay-chay-2026' => [
            'url' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=675&fit=crop&auto=format',
            'alt' => 'Xu hướng giày chạy 2026',
        ],
        'bai-tap-core-cho-runner' => [
            'url' => 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=675&fit=crop&auto=format',
            'alt' => 'Bài tập core cho runner',
        ],
        'cach-bao-quan-giay-the-thao' => [
            'url' => 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1200&h=675&fit=crop&auto=format',
            'alt' => 'Bảo quản giày thể thao',
        ],
    ],
];
