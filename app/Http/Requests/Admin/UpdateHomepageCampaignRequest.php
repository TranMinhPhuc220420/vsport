<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHomepageCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'campaigns' => ['required', 'array', 'min:1', 'max:10'],
            'campaigns.*.headline' => ['required', 'string', 'max:200'],
            'campaigns.*.subtitle' => ['required', 'string', 'max:300'],
            'campaigns.*.image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'campaigns.*.imageUrl' => ['nullable', 'string', 'url', 'max:500', 'required_without:campaigns.*.image'],
            'campaigns.*.ctaLabel' => ['required', 'string', 'max:100'],
            'campaigns.*.ctaHref' => ['required', 'string', 'max:255'],
        ];
    }
}
