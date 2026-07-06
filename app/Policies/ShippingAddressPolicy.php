<?php

namespace App\Policies;

use App\Models\ShippingAddress;
use App\Models\User;

class ShippingAddressPolicy
{
    public function update(User $user, ShippingAddress $address): bool
    {
        return $address->user_id === $user->id;
    }

    public function delete(User $user, ShippingAddress $address): bool
    {
        return $address->user_id === $user->id;
    }
}
