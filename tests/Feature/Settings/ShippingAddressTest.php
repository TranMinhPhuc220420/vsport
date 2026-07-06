<?php

use App\Models\ShippingAddress;
use App\Models\User;

test('guest cannot access address routes', function () {
    $this->get(route('addresses.index'))->assertRedirect(route('login'));
});

test('user can create a shipping address', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('addresses.store'), [
        'label' => 'Home',
        'recipientName' => 'Trần Minh Phúc',
        'phone' => '+84901234567',
        'addressLine' => '123 Nguyen Hue, District 1, Ho Chi Minh City',
    ]);

    $response->assertRedirect(route('addresses.index'));

    $address = ShippingAddress::query()->firstOrFail();

    expect($address->user_id)->toBe($user->id)
        ->and($address->label)->toBe('Home')
        ->and($address->is_default)->toBeTrue();
});

test('second address is not default unless requested', function () {
    $user = User::factory()->create();
    ShippingAddress::factory()->for($user)->create(['is_default' => true]);

    $this->actingAs($user)->post(route('addresses.store'), [
        'recipientName' => 'Second Person',
        'phone' => '+84901234567',
        'addressLine' => '456 Le Loi, District 1',
    ]);

    expect($user->addresses()->count())->toBe(2)
        ->and($user->addresses()->where('is_default', true)->count())->toBe(1);
});

test('marking a new address as default unsets the previous default', function () {
    $user = User::factory()->create();
    ShippingAddress::factory()->for($user)->create(['is_default' => true]);

    $this->actingAs($user)->post(route('addresses.store'), [
        'recipientName' => 'Second Person',
        'phone' => '+84901234567',
        'addressLine' => '456 Le Loi, District 1',
        'isDefault' => true,
    ]);

    expect($user->addresses()->where('is_default', true)->count())->toBe(1)
        ->and($user->addresses()->orderByDesc('id')->first()->is_default)->toBeTrue();
});

test('user cannot save more than 10 addresses', function () {
    $user = User::factory()->create();
    ShippingAddress::factory()->for($user)->count(10)->create();

    $response = $this->actingAs($user)->post(route('addresses.store'), [
        'recipientName' => 'Eleventh Person',
        'phone' => '+84901234567',
        'addressLine' => '789 Somewhere',
    ]);

    $response->assertSessionHasErrors('recipientName');
    expect($user->addresses()->count())->toBe(10);
});

test('user can update their own address', function () {
    $user = User::factory()->create();
    $address = ShippingAddress::factory()->for($user)->create();

    $this->actingAs($user)->patch(route('addresses.update', $address), [
        'recipientName' => 'Updated Name',
        'phone' => '+84900000000',
        'addressLine' => 'Updated address line',
    ])->assertRedirect(route('addresses.index'));

    expect($address->fresh()->recipient_name)->toBe('Updated Name');
});

test('user cannot update another users address', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $address = ShippingAddress::factory()->for($owner)->create();

    $this->actingAs($other)->patch(route('addresses.update', $address), [
        'recipientName' => 'Hacked',
        'phone' => '+84900000000',
        'addressLine' => 'Nope',
    ])->assertForbidden();

    expect($address->fresh()->recipient_name)->not->toBe('Hacked');
});

test('deleting the default address promotes another to default', function () {
    $user = User::factory()->create();
    $first = ShippingAddress::factory()->for($user)->create(['is_default' => true]);
    $second = ShippingAddress::factory()->for($user)->create(['is_default' => false]);

    $this->actingAs($user)->delete(route('addresses.destroy', $first))
        ->assertRedirect(route('addresses.index'));

    expect(ShippingAddress::query()->find($first->id))->toBeNull()
        ->and($second->fresh()->is_default)->toBeTrue();
});

test('user cannot delete another users address', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $address = ShippingAddress::factory()->for($owner)->create();

    $this->actingAs($other)->delete(route('addresses.destroy', $address))
        ->assertForbidden();

    expect(ShippingAddress::query()->find($address->id))->not->toBeNull();
});

test('user can set an existing address as default', function () {
    $user = User::factory()->create();
    $first = ShippingAddress::factory()->for($user)->create(['is_default' => true]);
    $second = ShippingAddress::factory()->for($user)->create(['is_default' => false]);

    $this->actingAs($user)->patch(route('addresses.default', $second))
        ->assertRedirect(route('addresses.index'));

    expect($first->fresh()->is_default)->toBeFalse()
        ->and($second->fresh()->is_default)->toBeTrue();
});
