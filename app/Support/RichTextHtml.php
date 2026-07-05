<?php

namespace App\Support;

use App\Support\RichText\HtmlImageExternalizer;
use App\Services\ProductImageStorage;

/**
 * Prepare rich-text HTML for MySQL TEXT columns: externalize embedded images, enforce size limits.
 */
class RichTextHtml
{
    /** MySQL TEXT column limit (bytes). */
    public const MAX_LENGTH = 65535;

    public static function prepareForStorage(?string $html): ?string
    {
        if ($html === null) {
            return null;
        }

        $html = trim($html);
        if ($html === '') {
            return null;
        }

        $html = (new HtmlImageExternalizer(new ProductImageStorage))->externalize($html);

        return trim($html) === '' ? null : $html;
    }
}
