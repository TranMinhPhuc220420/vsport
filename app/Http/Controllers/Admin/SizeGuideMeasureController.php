<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSizeGuideMeasureRequest;
use App\Models\SizeGuide;
use Illuminate\Http\RedirectResponse;

class SizeGuideMeasureController extends Controller
{
    public function update(UpdateSizeGuideMeasureRequest $request, SizeGuide $sizeGuide): RedirectResponse
    {
        $sizeGuide->update($request->validated());

        return back();
    }
}
