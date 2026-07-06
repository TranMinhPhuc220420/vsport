<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\ReturnRequestStatus;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\ReturnRequest;
use App\Models\ReturnRequestItem;
use App\Models\User;
use App\Services\Payment\StripeRefundService;
use Database\Seeders\CatalogSeeder;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

function eligibleDeliveredOrder(User $user): Order
{
    $variant = ProductVariant::query()->with('inventory')->firstOrFail();
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'status' => OrderStatus::Delivered,
        'created_at' => now()->subDays(5),
    ]);

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'variant_id' => $variant->id,
        'quantity' => 1,
    ]);

    return $order->fresh(['items']);
}

test('customer can request return for eligible order', function () {
    Mail::fake();

    $user = User::factory()->create();
    $order = eligibleDeliveredOrder($user);
    $orderItem = $order->items->firstOrFail();

    $this->actingAs($user)
        ->post(route('orders.returns.store', $order->order_number), [
            'reason' => 'Wrong size',
            'items' => [
                ['orderItemId' => $orderItem->id, 'quantity' => 1],
            ],
        ])
        ->assertRedirect(route('orders.show', $order->order_number));

    $returnRequest = ReturnRequest::query()->first();

    expect($returnRequest)->not->toBeNull()
        ->and($returnRequest->status)->toBe(ReturnRequestStatus::Pending)
        ->and($returnRequest->reason)->toBe('Wrong size')
        ->and($returnRequest->items)->toHaveCount(1);
});

test('customer cannot request return outside policy window', function () {
    $user = User::factory()->create();
    $order = eligibleDeliveredOrder($user);
    $order->created_at = now()->subDays(31);
    $order->save();
    $orderItem = $order->items->firstOrFail();

    $this->actingAs($user)
        ->post(route('orders.returns.store', $order->order_number), [
            'reason' => 'Too late',
            'items' => [
                ['orderItemId' => $orderItem->id, 'quantity' => 1],
            ],
        ])
        ->assertSessionHasErrors('return');

    expect(ReturnRequest::query()->count())->toBe(0);
});

test('customer cannot request return for another users order', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $order = eligibleDeliveredOrder($owner);
    $orderItem = $order->items->firstOrFail();

    $this->actingAs($other)
        ->post(route('orders.returns.store', $order->order_number), [
            'reason' => 'Not mine',
            'items' => [
                ['orderItemId' => $orderItem->id, 'quantity' => 1],
            ],
        ])
        ->assertForbidden();
});

test('admin marking received restocks inventory', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();
    $order = eligibleDeliveredOrder($user);
    $orderItem = $order->items->firstOrFail();
    $inventory = Inventory::query()->where('variant_id', $orderItem->variant_id)->firstOrFail();
    $inventory->update(['quantity' => 5]);
    $inventory->decrement('quantity', $orderItem->quantity);
    $beforeReturn = $inventory->fresh()->quantity;

    $returnRequest = ReturnRequest::factory()->create([
        'order_id' => $order->id,
        'user_id' => $user->id,
        'status' => ReturnRequestStatus::Approved,
    ]);

    ReturnRequestItem::factory()->create([
        'return_request_id' => $returnRequest->id,
        'order_item_id' => $orderItem->id,
        'quantity' => $orderItem->quantity,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.return-requests.status.update', $returnRequest), [
            'status' => ReturnRequestStatus::Received->value,
        ])
        ->assertRedirect(route('admin.return-requests.show', $returnRequest));

    expect($inventory->fresh()->quantity)->toBe($beforeReturn + $orderItem->quantity);
});

test('admin refund triggers stripe refund for stripe orders', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();
    $order = eligibleDeliveredOrder($user);
    $order->update([
        'payment_method' => PaymentMethod::Stripe,
        'payment_intent_id' => 'pi_return_test',
    ]);
    $orderItem = $order->items->firstOrFail();

    $returnRequest = ReturnRequest::factory()->create([
        'order_id' => $order->id,
        'user_id' => $user->id,
        'status' => ReturnRequestStatus::Received,
    ]);

    ReturnRequestItem::factory()->create([
        'return_request_id' => $returnRequest->id,
        'order_item_id' => $orderItem->id,
        'quantity' => 1,
    ]);

    $this->mock(StripeRefundService::class, function ($mock) use ($order): void {
        $mock->shouldReceive('refundOrder')
            ->once()
            ->withArgs(fn (Order $arg) => $arg->id === $order->id);
    });

    $this->actingAs($admin)
        ->patch(route('admin.return-requests.status.update', $returnRequest), [
            'status' => ReturnRequestStatus::Refunded->value,
        ])
        ->assertRedirect(route('admin.return-requests.show', $returnRequest));
});

test('rejecting a return requires admin notes', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();
    $order = eligibleDeliveredOrder($user);

    $returnRequest = ReturnRequest::factory()->create([
        'order_id' => $order->id,
        'user_id' => $user->id,
        'status' => ReturnRequestStatus::Pending,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.return-requests.status.update', $returnRequest), [
            'status' => ReturnRequestStatus::Rejected->value,
        ])
        ->assertSessionHasErrors('adminNotes');
});

test('admin can export return requests as csv', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();
    $order = eligibleDeliveredOrder($user);

    ReturnRequest::factory()->create([
        'order_id' => $order->id,
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.return-requests.export'));

    $response->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');

    expect($response->streamedContent())->toContain($order->order_number);
});
