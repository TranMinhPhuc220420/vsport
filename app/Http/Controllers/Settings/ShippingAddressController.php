<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ShippingAddressRequest;
use App\Models\ShippingAddress;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ShippingAddressController extends Controller
{
    private const MAX_ADDRESSES_PER_USER = 10;

    public function index(Request $request): Response
    {
        return Inertia::render('storefront/settings/addresses', [
            'addresses' => $request->user()->addresses->map(
                fn (ShippingAddress $address) => $this->format($address),
            )->values()->all(),
            'addressLimit' => self::MAX_ADDRESSES_PER_USER,
        ]);
    }

    public function store(ShippingAddressRequest $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->addresses()->count() >= self::MAX_ADDRESSES_PER_USER) {
            return back()->withErrors([
                'recipientName' => __('messages.shipping_address_limit_reached'),
            ]);
        }

        $data = $request->validated();
        $makeDefault = (bool) ($data['isDefault'] ?? false) || $user->addresses()->count() === 0;

        DB::transaction(function () use ($user, $data, $makeDefault): void {
            if ($makeDefault) {
                $user->addresses()->update(['is_default' => false]);
            }

            $user->addresses()->create([
                'label' => $data['label'] ?? null,
                'recipient_name' => $data['recipientName'],
                'phone' => $data['phone'],
                'address_line' => $data['addressLine'],
                'is_default' => $makeDefault,
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('messages.shipping_address_created')]);

        return to_route('addresses.index');
    }

    public function update(ShippingAddressRequest $request, ShippingAddress $address): RedirectResponse
    {
        $this->authorize('update', $address);

        $data = $request->validated();
        $makeDefault = (bool) ($data['isDefault'] ?? false);

        DB::transaction(function () use ($request, $address, $data, $makeDefault): void {
            if ($makeDefault) {
                $request->user()->addresses()->update(['is_default' => false]);
            }

            $address->update([
                'label' => $data['label'] ?? null,
                'recipient_name' => $data['recipientName'],
                'phone' => $data['phone'],
                'address_line' => $data['addressLine'],
                'is_default' => $makeDefault ? true : $address->is_default,
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('messages.shipping_address_updated')]);

        return to_route('addresses.index');
    }

    public function destroy(Request $request, ShippingAddress $address): RedirectResponse
    {
        $this->authorize('delete', $address);

        /** @var User $user */
        $user = $request->user();
        $wasDefault = $address->is_default;

        $address->delete();

        if ($wasDefault) {
            $user->addresses()->first()?->update(['is_default' => true]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('messages.shipping_address_deleted')]);

        return to_route('addresses.index');
    }

    public function setDefault(Request $request, ShippingAddress $address): RedirectResponse
    {
        $this->authorize('update', $address);

        DB::transaction(function () use ($request, $address): void {
            $request->user()->addresses()->update(['is_default' => false]);
            $address->update(['is_default' => true]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('messages.shipping_address_updated')]);

        return to_route('addresses.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function format(ShippingAddress $address): array
    {
        return [
            'id' => $address->id,
            'label' => $address->label,
            'recipientName' => $address->recipient_name,
            'phone' => $address->phone,
            'addressLine' => $address->address_line,
            'isDefault' => $address->is_default,
        ];
    }
}
