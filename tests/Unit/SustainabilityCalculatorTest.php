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
