<?php

namespace App\Support;

use App\Models\ProductSustainabilityMaterial;
use Illuminate\Support\Collection;

class SustainabilityCalculator
{
    /**
     * @param  Collection<int, ProductSustainabilityMaterial>  $materials
     */
    public function weightedRecycledPercent(Collection $materials): float
    {
        if ($materials->isEmpty()) {
            return 0.0;
        }

        $totalWeight = $materials->sum('component_weight_g');

        if ($totalWeight <= 0) {
            return 0.0;
        }

        $weighted = $materials->sum(
            fn (ProductSustainabilityMaterial $material) => $material->component_weight_g * $material->recycled_content_pct,
        );

        return round($weighted / $totalWeight, 1);
    }
}
