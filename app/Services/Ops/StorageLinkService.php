<?php

namespace App\Services\Ops;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

class StorageLinkService
{
    /**
     * @return array{success: bool, message: string, links: list<array{path: string, target: string, status: string}>}
     */
    public function run(): array
    {
        $links = config('filesystems.links', []);
        $results = [];

        foreach ($links as $link => $target) {
            $results[] = $this->describeLink((string) $link, (string) $target);
        }

        if (collect($results)->every(fn (array $item) => $item['status'] === 'linked')) {
            return [
                'success' => true,
                'message' => 'Storage link already exists.',
                'links' => $results,
            ];
        }

        if (collect($results)->contains(fn (array $item) => $item['status'] === 'blocked')) {
            return [
                'success' => false,
                'message' => 'public/storage exists but is not a symlink. Remove it in cPanel File Manager, then run this endpoint again.',
                'links' => $results,
            ];
        }

        $exitCode = Artisan::call('storage:link');
        $output = trim(Artisan::output());

        foreach ($links as $link => $target) {
            $results = array_map(
                fn (array $item) => $item['path'] === $link
                    ? $this->describeLink((string) $link, (string) $target)
                    : $item,
                $results,
            );
        }

        $created = collect($results)->every(fn (array $item) => $item['status'] === 'linked');

        if ($exitCode === 0 && $created) {
            return [
                'success' => true,
                'message' => $output !== '' ? $output : 'Storage link created successfully.',
                'links' => $results,
            ];
        }

        return [
            'success' => false,
            'message' => $output !== ''
                ? $output
                : 'Unable to create storage link. Your host may block symlinks — create public/storage manually in cPanel File Manager.',
            'links' => $results,
        ];
    }

    /**
     * @return array{path: string, target: string, status: string}
     */
    private function describeLink(string $link, string $target): array
    {
        if (File::exists($link)) {
            if (is_link($link) && realpath($link) === realpath($target)) {
                return [
                    'path' => $link,
                    'target' => (string) readlink($link),
                    'status' => 'linked',
                ];
            }

            return [
                'path' => $link,
                'target' => $target,
                'status' => 'blocked',
            ];
        }

        return [
            'path' => $link,
            'target' => $target,
            'status' => 'missing',
        ];
    }
}
