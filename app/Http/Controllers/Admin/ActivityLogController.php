<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $action = $request->query('action');

        $query = AdminActivityLog::query()
            ->with('user')
            ->orderByDesc('created_at');

        if (is_string($action) && $action !== '') {
            $query->where('action', $action);
        }

        $logs = $query->paginate(30)->withQueryString();

        $actions = AdminActivityLog::query()
            ->select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action')
            ->all();

        return Inertia::render('admin/activity-logs/index', [
            'logs' => [
                'data' => collect($logs->items())->map(fn (AdminActivityLog $log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'actorName' => $log->user->name,
                    'actorEmail' => $log->user->email,
                    'subjectType' => $log->subject_type,
                    'subjectId' => $log->subject_id,
                    'properties' => $log->properties,
                    'ipAddress' => $log->ip_address,
                    'createdAt' => $log->created_at?->toIso8601String(),
                ])->values()->all(),
                'links' => [
                    'first' => $logs->url(1),
                    'last' => $logs->url($logs->lastPage()),
                    'prev' => $logs->previousPageUrl(),
                    'next' => $logs->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'total' => $logs->total(),
                ],
            ],
            'filters' => [
                'action' => is_string($action) ? $action : null,
            ],
            'actionOptions' => $actions,
        ]);
    }
}
