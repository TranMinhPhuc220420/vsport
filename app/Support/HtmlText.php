<?php

namespace App\Support;

class HtmlText
{
    public static function extract(?string $html, int $maxLen = 2000): string
    {
        $s = trim((string) $html);
        if ($s === '') {
            return '';
        }

        $s = preg_replace('/<\s*br\s*\/?>/i', "\n", $s);
        $s = preg_replace('/<\s*\/\s*p\s*>/i', "\n\n", $s);
        $s = preg_replace('/<\s*\/\s*div\s*>/i', "\n\n", $s);
        $s = preg_replace('/<\s*\/\s*li\s*>/i', "\n", $s);

        $text = strip_tags((string) $s);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/[ \t]+/', ' ', (string) $text);
        $text = preg_replace('/\s*\n\s*/', "\n", (string) $text);
        $text = trim((string) $text);

        if ($maxLen > 0 && strlen($text) > $maxLen) {
            $text = substr($text, 0, $maxLen);
        }

        return $text;
    }
}
