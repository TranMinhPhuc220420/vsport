<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

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

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'campaigns.*.image.uploaded' => __('messages.campaign_image_upload_failed'),
            'campaigns.*.image.max' => __('messages.campaign_image_too_large'),
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $campaigns = $this->file('campaigns');

            if (! is_array($campaigns)) {
                return;
            }

            foreach ($campaigns as $index => $campaign) {
                if (! is_array($campaign)) {
                    continue;
                }

                $file = $campaign['image'] ?? null;

                if (! $file instanceof UploadedFile || $file->isValid()) {
                    continue;
                }

                $attribute = "campaigns.$index.image";

                if ($validator->errors()->has($attribute)) {
                    $validator->errors()->forget($attribute);
                }

                $message = match ($file->getError()) {
                    UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => __('messages.campaign_image_too_large'),
                    default => __('messages.campaign_image_upload_failed'),
                };

                $validator->errors()->add($attribute, $message);
            }
        });
    }
}
