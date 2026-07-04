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

    public function upload(UploadedFile $file, int $optionValueId): string
    {
        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $path = sprintf(
            'option-values/%d/%s.%s',
            $optionValueId,
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

    public function uploadStoreLogo(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $path = sprintf('store/%s.%s', Str::uuid(), $extension);

        return $this->storeUploadedFile($file, $path);
    }

    public function uploadStoreLogoWide(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $path = sprintf('store/wide-%s.%s', Str::uuid(), $extension);

        return $this->storeUploadedFile($file, $path);
    }

    public function uploadCategory(UploadedFile $file, int $categoryId): string
    {
        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $path = sprintf(
            'categories/%d/%s.%s',
            $categoryId,
            Str::uuid(),
            $extension,
        );

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
