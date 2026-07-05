<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SyncSizeGuideRowsRequest;
use App\Models\SizeGuide;
use App\Models\SizeGuideRow;
use Illuminate\Http\RedirectResponse;

class SizeGuideRowController extends Controller
{
    public function sync(SyncSizeGuideRowsRequest $request, SizeGuide $sizeGuide): RedirectResponse
    {
        $columns = $request->validated('columns');
        $rows = $request->validated('rows');

        $sizeGuide->update(['columns' => $columns]);

        $incomingIds = collect($rows)->pluck('id')->filter()->all();
        $sizeGuide->rows()->whereNotIn('id', $incomingIds)->delete();

        foreach ($rows as $rowData) {
            $row = isset($rowData['id'])
                ? $sizeGuide->rows()->findOrFail($rowData['id'])
                : new SizeGuideRow(['size_guide_id' => $sizeGuide->id]);

            $row->fill([
                'position' => $rowData['position'],
                'values' => array_values($rowData['values']),
            ]);
            $row->save();
        }

        return back();
    }
}
