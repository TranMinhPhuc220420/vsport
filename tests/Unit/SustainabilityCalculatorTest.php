<?php

use App\Models\ProductSustainabilityMaterial;
use App\Support\SustainabilityCalculator;

test('weighted recycled percent is calculated by component weight', function () {
    $materials = collect([
        new ProductSustainabilityMaterial([
            'component_weight_g' => 100,
            'recycled_content_pct' => 100,
        ]),
        new ProductSustainabilityMaterial([
            'component_weight_g' => 100,
            'recycled_content_pct' => 0,
        ]),
    ]);

    $percent = app(SustainabilityCalculator::class)->weightedRecycledPercent($materials);

    expect($percent)->toBe(50.0);
});

test('weighted recycled percent returns zero for empty materials', function () {
    $percent = app(SustainabilityCalculator::class)->weightedRecycledPercent(collect());

    expect($percent)->toBe(0.0);
});

test('weighted recycled percent returns zero when total weight is zero', function () {
    $materials = collect([
        new ProductSustainabilityMaterial([
            'component_weight_g' => 0,
            'recycled_content_pct' => 100,
        ]),
    ]);

    $percent = app(SustainabilityCalculator::class)->weightedRecycledPercent($materials);

    expect($percent)->toBe(0.0);
});
