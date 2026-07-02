<?php

namespace App\Rules;

use App\Models\Category;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidCategoryParent implements ValidationRule
{
    public function __construct(
        private readonly ?int $categoryId = null,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value === null || $value === '') {
            return;
        }

        $parentId = (int) $value;

        if ($this->categoryId !== null && $parentId === $this->categoryId) {
            $fail('A category cannot be its own parent.');

            return;
        }

        if ($this->categoryId !== null && in_array($parentId, $this->descendantIds($this->categoryId), true)) {
            $fail('A category cannot be nested under its own descendant.');
        }
    }

    /**
     * @return list<int>
     */
    private function descendantIds(int $categoryId): array
    {
        $ids = [];
        $childIds = Category::query()
            ->where('parent_id', $categoryId)
            ->pluck('id');

        foreach ($childIds as $childId) {
            $ids[] = $childId;
            $ids = array_merge($ids, $this->descendantIds($childId));
        }

        return $ids;
    }
}
