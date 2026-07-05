<?php

namespace App\Http\Requests\Storefront;

use App\Enums\NewsletterSource;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubscribeNewsletterRequest extends FormRequest
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
            'email' => ['required', 'email', 'max:255'],
            'source' => ['required', Rule::enum(NewsletterSource::class)],
        ];
    }
}
