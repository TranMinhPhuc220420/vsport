<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SyncCategoryOptionTemplatesRequest;
use App\Models\Category;
use App\Models\CategoryOptionTemplate;
use Illuminate\Http\RedirectResponse;

class CategoryOptionTemplateController extends Controller
{
    public function sync(SyncCategoryOptionTemplatesRequest $request, Category $category): RedirectResponse
    {
        $templates = $request->validated('templates');

        $incomingIds = collect($templates)->pluck('id')->filter()->all();
        $category->optionTemplates()->whereNotIn('id', $incomingIds)->delete();

        foreach ($templates as $templateData) {
            $template = isset($templateData['id'])
                ? $category->optionTemplates()->findOrFail($templateData['id'])
                : new CategoryOptionTemplate(['category_id' => $category->id]);

            $template->fill([
                'name' => $templateData['name'],
                'position' => $templateData['position'],
                'display_type' => $templateData['displayType'],
                'is_required' => $templateData['isRequired'] ?? true,
                'drives_gallery' => $templateData['drivesGallery'] ?? false,
                'default_values' => $templateData['defaultValues'] ?? [],
                'metadata' => $templateData['metadata'] ?? null,
            ]);
            $template->save();
        }

        return back();
    }
}
