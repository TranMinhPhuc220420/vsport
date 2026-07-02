<?php

namespace App\Support;

readonly class DeployCheckReport
{
    /**
     * @param  list<array{level: string, message: string}>  $items
     */
    public function __construct(
        public array $items,
    ) {}

    public function hasFailures(): bool
    {
        return collect($this->items)->contains(
            fn (array $item) => $item['level'] === 'fail',
        );
    }

    public function hasWarnings(): bool
    {
        return collect($this->items)->contains(
            fn (array $item) => $item['level'] === 'warn',
        );
    }

    public function passesStrict(): bool
    {
        return ! $this->hasFailures() && ! $this->hasWarnings();
    }
}
