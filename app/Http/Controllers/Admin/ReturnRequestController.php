<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReturnRequestStatus;
use App\Exceptions\InvalidReturnTransitionException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateReturnRequestStatusRequest;
use App\Http\Resources\ReturnRequestResource;
use App\Models\ReturnRequest;
use App\Services\Admin\AdminActivityService;
use App\Services\Admin\ReturnRequestExportService;
use App\Services\Order\ReturnRequestService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReturnRequestController extends Controller
{
    public function __construct(
        private readonly ReturnRequestService $returnRequests,
        private readonly ReturnRequestExportService $export,
        private readonly AdminActivityService $activity,
    ) {}

    public function index(Request $request): Response
    {
        $status = $request->query('status');

        $returnRequests = $this->filteredQuery($status)
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/return-requests/index', [
            'returnRequests' => ReturnRequestResource::collection($returnRequests),
            'filters' => [
                'status' => is_string($status) ? $status : null,
            ],
            'statusOptions' => array_column(ReturnRequestStatus::cases(), 'value'),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $status = $request->query('status');

        $this->activity->log(
            $request->user(),
            'return_requests.export',
            properties: [
                'status' => is_string($status) ? $status : null,
            ],
            request: $request,
        );

        return $this->export->streamCsv(
            $this->filteredQuery(is_string($status) ? $status : null),
        );
    }

    public function show(ReturnRequest $returnRequest): Response
    {
        $this->authorize('view', $returnRequest);

        $returnRequest->load(['items.orderItem', 'order.user', 'user']);

        return Inertia::render('admin/return-requests/show', [
            'returnRequest' => ReturnRequestResource::make($returnRequest)->resolve(),
            'allowedNextStatuses' => $this->returnRequests->allowedNextStatuses($returnRequest),
        ]);
    }

    public function updateStatus(
        UpdateReturnRequestStatusRequest $request,
        ReturnRequest $returnRequest,
    ): RedirectResponse {
        $this->authorize('update', $returnRequest);

        try {
            $returnRequest = $this->returnRequests->transition(
                $returnRequest,
                $request->status(),
                $request->validated('adminNotes'),
            );
        } catch (InvalidReturnTransitionException $exception) {
            return back()->withErrors(['status' => $exception->getMessage()]);
        }

        $this->activity->log(
            $request->user(),
            'return_requests.status.update',
            $returnRequest,
            [
                'status' => $request->status()->value,
                'order_number' => $returnRequest->order->order_number,
            ],
            $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.return_request_status_updated'),
        ]);

        return redirect()->route('admin.return-requests.show', $returnRequest);
    }

    /**
     * @return Builder<ReturnRequest>
     */
    private function filteredQuery(?string $status)
    {
        $query = ReturnRequest::query()
            ->with(['order', 'user'])
            ->orderByDesc('created_at');

        if (is_string($status) && $status !== '') {
            $query->where('status', $status);
        }

        return $query;
    }
}
