<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class ProductImageStorage
{
    public function disk(): string
    {
        if (config('filesystems.disks.supabase.key') && config('filesystems.disks.supabase.bucket')) {
            return 'supabase';
        }

        return 'public';
    }

    public function upload(UploadedFile $file, int $colorwayId): string
    {
        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $path = sprintf(
            'colorways/%d/%s.%s',
            $colorwayId,
            Str::uuid(),
            $extension,
        );

        return $this->storeUploadedFile($file, $path);
    }

    public function uploadHomepage(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $path = sprintf('homepage/%s.%s', Str::uuid(), $extension);

        return $this->storeUploadedFile($file, $path);
    }

    private function storeUploadedFile(UploadedFile $file, string $path): string
    {
        $stored = Storage::disk($this->disk())->put($path, $file->getContent(), 'public');

        if (! $stored) {
            throw new RuntimeException('Failed to upload product image.');
        }

        return $path;
    }

    public function delete(string $path): void
    {
        Storage::disk($this->disk())->delete($path);
    }

    public function publicUrl(string $path): string
    {
        return Storage::disk($this->disk())->url($path);
    }

    public function urlFor(?string $imageUrl, ?string $storagePath): ?string
    {
        if ($imageUrl !== null && $imageUrl !== '' && filter_var($imageUrl, FILTER_VALIDATE_URL)) {
            return $imageUrl;
        }

        if ($storagePath !== null && $storagePath !== '') {
            return $this->publicUrl($storagePath);
        }

        return $imageUrl !== '' ? $imageUrl : null;
    }
}
