<?php

use Inertia\Testing\AssertableInertia as Assert;

test('cart page is publicly accessible', function () {
    $response = $this->get(route('cart.index'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/cart')
            ->has('seo')
            ->where('seo.robots', 'noindex, nofollow'));
});
