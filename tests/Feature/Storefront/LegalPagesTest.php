<?php

test('privacy and shipping legal pages are accessible', function () {
    $this->get(route('legal.privacy'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('storefront/legal/page')
            ->where('page', 'privacy'));

    $this->get(route('legal.shipping'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('storefront/legal/page')
            ->where('page', 'shipping'));

    $this->get(route('legal.returns'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('storefront/legal/page')
            ->where('page', 'returns'));

    $this->get(route('legal.contact'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('storefront/legal/page')
            ->where('page', 'contact'));
});
