<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStoreSettingsRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:150'],
            'logo' => ['nullable', 'image:allow_svg', 'mimes:jpeg,jpg,png,webp,svg', 'max:2048'],
            'logoUrl' => ['nullable', 'string', 'max:500'],
            'logoWide' => ['nullable', 'image:allow_svg', 'mimes:jpeg,jpg,png,webp,svg', 'max:2048'],
            'logoWideUrl' => ['nullable', 'string', 'max:500'],
            'shortDescription' => ['nullable', 'string', 'max:500'],
            'contactEmail' => ['nullable', 'email', 'max:255'],
            'contactPhone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:500'],
            'facebookUrl' => ['nullable', 'string', 'url', 'max:500'],
            'instagramUrl' => ['nullable', 'string', 'url', 'max:500'],
            'tiktokUrl' => ['nullable', 'string', 'url', 'max:500'],
            'youtubeUrl' => ['nullable', 'string', 'url', 'max:500'],
            'currency' => ['required', 'string', 'in:USD,VND'],
        ];
    }
}
