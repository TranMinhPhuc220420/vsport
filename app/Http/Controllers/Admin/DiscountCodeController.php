<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDiscountCodeRequest;
use App\Http\Requests\Admin\UpdateDiscountCodeRequest;
use App\Models\DiscountCode;
use App\Services\Admin\AdminActivityService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DiscountCodeController extends Controller
{
    public function __construct(
        private readonly AdminActivityService $activity,
    ) {}

    public function index(): Response
    {
        $codes = DiscountCode::query()
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/discount-codes/index', [
            'discountCodes' => [
                'data' => collect($codes->items())->map(fn (DiscountCode $code) => [
                    'id' => $code->id,
                    'code' => $code->code,
                    'type' => $code->type->value,
                    'value' => (float) $code->value,
                    'minOrderAmount' => (float) $code->min_order_amount,
                    'maxUses' => $code->max_uses,
                    'usedCount' => $code->used_count,
                    'startsAt' => $code->starts_at?->toIso8601String(),
                    'expiresAt' => $code->expires_at?->toIso8601String(),
                    'isActive' => $code->is_active,
                ])->values()->all(),
                'links' => [
                    'first' => $codes->url(1),
                    'last' => $codes->url($codes->lastPage()),
                    'prev' => $codes->previousPageUrl(),
                    'next' => $codes->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $codes->currentPage(),
                    'last_page' => $codes->lastPage(),
                    'total' => $codes->total(),
                ],
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/discount-codes/create');
    }

    public function store(StoreDiscountCodeRequest $request): RedirectResponse
    {
        $code = DiscountCode::query()->create($request->validated());

        $this->activity->log(
            $request->user(),
            'discount_codes.store',
            $code,
            request: $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.discount_code_created'),
        ]);

        return redirect()->route('admin.discount-codes.index');
    }

    public function edit(DiscountCode $discountCode): Response
    {
        return Inertia::render('admin/discount-codes/edit', [
            'discountCode' => [
                'id' => $discountCode->id,
                'code' => $discountCode->code,
                'type' => $discountCode->type->value,
                'value' => (float) $discountCode->value,
                'minOrderAmount' => (float) $discountCode->min_order_amount,
                'maxUses' => $discountCode->max_uses,
                'startsAt' => $discountCode->starts_at?->format('Y-m-d\TH:i'),
                'expiresAt' => $discountCode->expires_at?->format('Y-m-d\TH:i'),
                'isActive' => $discountCode->is_active,
            ],
        ]);
    }

    public function update(UpdateDiscountCodeRequest $request, DiscountCode $discountCode): RedirectResponse
    {
        $discountCode->update($request->validated());

        $this->activity->log(
            $request->user(),
            'discount_codes.update',
            $discountCode,
            request: $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.discount_code_updated'),
        ]);

        return redirect()->route('admin.discount-codes.index');
    }

    public function destroy(DiscountCode $discountCode): RedirectResponse
    {
        $this->activity->log(
            request()->user(),
            'discount_codes.destroy',
            $discountCode,
            request: request(),
        );

        $discountCode->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.discount_code_deleted'),
        ]);

        return redirect()->route('admin.discount-codes.index');
    }
}
