<?php

namespace App\Support;

class ColorSwatch
{
    private const MAP = [
        'black' => '#111111',
        'white' => '#f5f5f5',
        'red' => '#d30005',
        'blue' => '#1151ff',
        'green' => '#007d48',
        'grey' => '#707072',
        'gray' => '#707072',
    ];

    public static function fromColorName(string $colorName): string
    {
        $key = strtolower(trim($colorName));

        return self::MAP[$key] ?? '#cacacb';
    }
}
