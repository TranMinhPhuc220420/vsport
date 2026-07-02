<?php

namespace App\Services\Admin;

use App\Models\AdminActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AdminActivityService
{
    /**
     * @param  array<string, mixed>  $properties
     */
    public function log(
        User $actor,
        string $action,
        ?Model $subject = null,
        array $properties = [],
        ?Request $request = null,
    ): AdminActivityLog {
        return AdminActivityLog::query()->create([
            'user_id' => $actor->id,
            'action' => $action,
            'subject_type' => $subject !== null ? $subject::class : null,
            'subject_id' => $subject?->getKey(),
            'properties' => $properties === [] ? null : $properties,
            'ip_address' => $request?->ip(),
            'created_at' => now(),
        ]);
    }
}
