<?php

namespace App\Policies;

use App\Models\ReturnRequest;
use App\Models\User;

class ReturnRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, ReturnRequest $returnRequest): bool
    {
        return $user->isAdmin() || $returnRequest->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ReturnRequest $returnRequest): bool
    {
        return $user->isAdmin();
    }
}
