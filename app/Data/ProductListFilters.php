<?php

namespace App\Data;

readonly class ProductListFilters
{
    public function __construct(
        public ?string $category = null,
        public ?string $gender = null,
        public string $sort = 'newest',
        public int $perPage = 16,
    ) {}
}
