<?php

namespace App\Support\RichText;

use App\Services\ProductImageStorage;

/**
 * Replaces data:image/... URIs in HTML with stored public URLs.
 */
class HtmlImageExternalizer
{
    public function __construct(
        private readonly ProductImageStorage $storage,
    ) {}

    public function externalize(string $html): string
    {
        if ($html === '' || stripos($html, 'data:image') === false) {
            return $html;
        }

        return (string) preg_replace_callback(
            '/<img([^>]*)\ssrc=(["\'])(data:image\/([^;]+);base64,([^"\']+))\2/i',
            function (array $matches): string {
                $mime = 'image/'.strtolower($matches[4]);
                $binary = base64_decode($matches[5], true);
                if ($binary === false || $binary === '') {
                    return $matches[0];
                }

                try {
                    $url = $this->storage->storeBinary($binary, $mime);
                } catch (\Throwable) {
                    return $matches[0];
                }

                return '<img'.$matches[1].' src="'.$url.'"';
            },
            $html
        );
    }
}
