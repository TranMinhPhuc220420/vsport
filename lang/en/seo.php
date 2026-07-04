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
        'order_confirmation' => 'Order confirmed',
        'checkout' => 'Checkout',
        'checkout_stripe' => 'Card payment',
        'cart' => 'Bag',
    ],
    'breadcrumb' => [
        'home' => 'Home',
    ],
];
