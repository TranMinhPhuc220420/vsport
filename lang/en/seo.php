<?php

return [
    'home' => [
        'description' => 'Shop sports footwear and apparel at :app. Fast checkout with cash on delivery.',
    ],
    'category' => [
        'title' => ':name | :app',
        'description' => 'Shop :name shoes and gear at :app.',
    ],
    'search' => [
        'title' => 'Search | :app',
        'title_with_query' => 'Search: :query | :app',
        'description' => 'Search products at :app.',
        'description_with_query' => 'Search results for ":query" at :app.',
    ],
    'product' => [
        'title' => ':name | :app',
        'fallback_description' => 'Shop :name at :app.',
    ],
    'legal' => [
        'title' => ':page | :app',
        'description' => ':page — :app',
    ],
    'private' => [
        'wishlist' => 'Wishlist',
        'account' => 'Account',
        'orders' => 'Orders',
        'order_detail' => 'Order :order_number',
        'return_request' => 'Return request — :order_number',
        'order_tracking' => 'Track shipment',
        'order_tracking_detail' => 'Shipment tracking — :order_number',
        'order_confirmation' => 'Order confirmed',
        'order_lookup' => 'Find your order',
        'checkout' => 'Checkout',
        'checkout_stripe' => 'Card payment',
        'cart' => 'Bag',
    ],
    'breadcrumb' => [
        'home' => 'Home',
        'blog' => 'News',
    ],
    'blog' => [
        'index_title' => 'News | :app',
        'index_description' => 'Sports news, guides, and articles from :app.',
        'post_title' => ':title | :app',
        'category_title' => ':name | :app',
        'category_description' => 'Articles in :name from :app.',
        'tag_title' => ':name | :app',
        'tag_description' => 'Articles tagged :name from :app.',
        'feed_title' => ':app — News',
        'feed_description' => 'Sports news, guides, and articles from :app.',
    ],
];
