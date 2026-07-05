<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            'Nike',
            'Hoka',
            'adidas',
            'Mizuno',
            'Puma',
            'Joma',
            'Zocker',
            'Kamito',
            'Asics',
        ] as $name) {
            Brand::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name],
            );
        }
    }
}
