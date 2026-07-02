<?php

test('guest can access checkout page', function () {
    $response = $this->get(route('checkout.create'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('storefront/checkout')
            ->where('isGuest', true)
        );
});

test('authenticated user sees checkout without guest flag', function () {
    $user = \App\Models\User::factory()->create();

    $this->actingAs($user)
        ->get(route('checkout.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('storefront/checkout')
            ->where('isGuest', false)
        );
});

test('guest cannot place checkout order without email', function () {
    $response = $this->post(route('checkout.store'), checkoutShippingPayload());

    $response->assertSessionHasErrors('customerEmail');
});
