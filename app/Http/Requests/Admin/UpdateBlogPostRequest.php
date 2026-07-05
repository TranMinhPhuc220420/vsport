<?php

namespace App\Http\Requests\Admin;

class UpdateBlogPostRequest extends StoreBlogPostRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $post = $this->route('blog_post');

        return $this->baseRules($post?->id);
    }
}
