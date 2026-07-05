<?php

/**
 * Danh mục sản phẩm seed — tên tiếng Việt, slug giữ nguyên để tương thích route/test.
 *
 * image_url: Unsplash/Pexels CDN (lưu trực tiếp vào image_path khi seed).
 */

return [
    [
        'slug' => 'men',
        'name' => 'Nam',
        'image_url' => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop&auto=format',
        'image_alt' => 'Thời trang thể thao nam',
        'children' => [
            [
                'slug' => 'men-shoes',
                'name' => 'Giày',
                'image_url' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Giày thể thao nam',
            ],
            [
                'slug' => 'men-running',
                'name' => 'Giày chạy bộ',
                'image_url' => 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Giày chạy bộ nam',
            ],
            [
                'slug' => 'men-training',
                'name' => 'Giày tập luyện',
                'image_url' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Giày tập gym và HIIT',
            ],
            [
                'slug' => 'men-sneakers',
                'name' => 'Giày sneaker',
                'image_url' => 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Giày sneaker lifestyle nam',
            ],
            [
                'slug' => 'men-apparel',
                'name' => 'Quần áo',
                'image_url' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Quần áo thể thao nam',
            ],
            [
                'slug' => 'men-accessories',
                'name' => 'Phụ kiện',
                'image_url' => 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Phụ kiện thể thao nam',
            ],
        ],
    ],
    [
        'slug' => 'women',
        'name' => 'Nữ',
        'image_url' => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop&auto=format',
        'image_alt' => 'Thời trang thể thao nữ',
        'children' => [
            [
                'slug' => 'women-shoes',
                'name' => 'Giày',
                'image_url' => 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Giày thể thao nữ',
            ],
            [
                'slug' => 'women-running',
                'name' => 'Giày chạy bộ',
                'image_url' => 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Giày chạy bộ nữ',
            ],
            [
                'slug' => 'women-training',
                'name' => 'Giày tập & yoga',
                'image_url' => 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Giày tập luyện và yoga',
            ],
            [
                'slug' => 'women-sneakers',
                'name' => 'Giày sneaker',
                'image_url' => 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Giày sneaker nữ',
            ],
            [
                'slug' => 'women-apparel',
                'name' => 'Quần áo',
                'image_url' => 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Quần áo thể thao nữ',
            ],
            [
                'slug' => 'women-accessories',
                'name' => 'Phụ kiện',
                'image_url' => 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Phụ kiện thể thao nữ',
            ],
        ],
    ],
    [
        'slug' => 'kids',
        'name' => 'Trẻ em',
        'image_url' => 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop&auto=format',
        'image_alt' => 'Đồ thể thao trẻ em',
        'children' => [
            [
                'slug' => 'kids-shoes',
                'name' => 'Giày trẻ em',
                'image_url' => 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Giày thể thao trẻ em',
            ],
            [
                'slug' => 'kids-apparel',
                'name' => 'Quần áo trẻ em',
                'image_url' => 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Quần áo thể thao trẻ em',
            ],
        ],
    ],
    [
        'slug' => 'jordan',
        'name' => 'Jordan',
        'image_url' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop&auto=format',
        'image_alt' => 'Bộ sưu tập Jordan',
        'children' => [
            [
                'slug' => 'jordan-sneakers',
                'name' => 'Giày Jordan',
                'image_url' => 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Giày sneaker Jordan',
            ],
            [
                'slug' => 'jordan-apparel',
                'name' => 'Quần áo Jordan',
                'image_url' => 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Quần áo streetwear Jordan',
            ],
        ],
    ],
    [
        'slug' => 'bags',
        'name' => 'Túi & balo',
        'image_url' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&auto=format',
        'image_alt' => 'Túi và balo thể thao',
        'children' => [
            [
                'slug' => 'bags-duffel',
                'name' => 'Túi thể thao',
                'image_url' => 'https://images.unsplash.com/photo-1761653457980-21b9f7fd3a04?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Túi thể thao duffel',
            ],
            [
                'slug' => 'bags-backpack',
                'name' => 'Balo',
                'image_url' => 'https://images.unsplash.com/photo-1708622833152-924c6e364138?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Balo tập luyện',
            ],
        ],
    ],
    [
        'slug' => 'paddles',
        'name' => 'Vợt pickleball',
        'image_url' => 'https://images.unsplash.com/photo-1769911112109-8ce1e4f75e19?w=800&h=600&fit=crop&auto=format',
        'image_alt' => 'Vợt pickleball',
        'children' => [
            [
                'slug' => 'paddles-pro',
                'name' => 'Vợt chuyên nghiệp',
                'image_url' => 'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'image_alt' => 'Vợt pickleball chuyên nghiệp',
            ],
            [
                'slug' => 'paddles-beginner',
                'name' => 'Vợt người mới',
                'image_url' => 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'image_alt' => 'Vợt pickleball cho người mới',
            ],
        ],
    ],
    [
        'slug' => 'apparel',
        'name' => 'Quần áo',
        'image_url' => 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop&auto=format',
        'image_alt' => 'Quần áo thể thao',
        'children' => [
            [
                'slug' => 'apparel-tops',
                'name' => 'Áo',
                'image_url' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Áo thể thao',
            ],
            [
                'slug' => 'apparel-bottoms',
                'name' => 'Quần & legging',
                'image_url' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Quần short và legging',
            ],
            [
                'slug' => 'apparel-outerwear',
                'name' => 'Áo khoác',
                'image_url' => 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=600&fit=crop&auto=format',
                'image_alt' => 'Áo khoác thể thao',
            ],
        ],
    ],
];
