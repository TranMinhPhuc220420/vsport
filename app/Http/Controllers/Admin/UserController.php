<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Models\User;
use App\Services\Admin\AdminActivityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(
        private readonly AdminActivityService $activity,
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $users = User::query()
            ->when(
                is_string($search) && $search !== '',
                fn ($query) => $query->where('email', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%"),
            )
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => [
                'data' => collect($users->items())->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role->value,
                    'createdAt' => $user->created_at?->toIso8601String(),
                ])->values()->all(),
                'links' => [
                    'first' => $users->url(1),
                    'last' => $users->url($users->lastPage()),
                    'prev' => $users->previousPageUrl(),
                    'next' => $users->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'total' => $users->total(),
                ],
            ],
            'filters' => [
                'search' => is_string($search) ? $search : null,
            ],
            'roleOptions' => array_column(UserRole::cases(), 'value'),
        ]);
    }

    public function updateRole(UpdateUserRoleRequest $request, User $user): RedirectResponse
    {
        $actor = $request->user();
        $newRole = $request->role();

        if ($actor->id === $user->id && $newRole !== UserRole::Admin) {
            return back()->withErrors([
                'role' => 'You cannot demote your own admin account.',
            ]);
        }

        if ($user->isAdmin() && $newRole !== UserRole::Admin) {
            $adminCount = User::query()->where('role', UserRole::Admin)->count();

            if ($adminCount <= 1) {
                return back()->withErrors([
                    'role' => 'Cannot demote the last admin account.',
                ]);
            }
        }

        $user->forceFill(['role' => $newRole])->save();

        $this->activity->log(
            $actor,
            'users.role.update',
            $user,
            ['role' => $newRole->value],
            $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.user_role_updated'),
        ]);

        return back();
    }
}
