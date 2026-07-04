<?php

namespace App\Services;

use GdImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class FaviconGenerator
{
    /**
     * @var list<int>
     */
    private const SIZES = [16, 32, 48];

    /**
     * Generates a multi-resolution favicon.ico from an uploaded logo image
     * and writes it to the public webroot.
     *
     * Only ever call this with a freshly uploaded file (never with an
     * arbitrary admin-supplied URL) — fetching a remote URL server-side
     * here would be an SSRF vector.
     *
     * @return 'ok'|'skipped_svg'|'failed'
     */
    public function generateFromUploadedLogo(UploadedFile $file): string
    {
        if ($this->isSvg($file)) {
            return 'skipped_svg';
        }

        try {
            $source = imagecreatefromstring(file_get_contents($file->getRealPath()));

            if ($source === false) {
                Log::warning('favicon.generation_failed', ['reason' => 'undecodable_image']);

                return 'failed';
            }

            $entries = [];

            foreach (self::SIZES as $size) {
                $entries[$size] = $this->resizeToPng($source, $size);
            }

            $this->writeIco($entries);

            return 'ok';
        } catch (Throwable $e) {
            Log::warning('favicon.generation_failed', ['message' => $e->getMessage()]);

            return 'failed';
        }
    }

    private function isSvg(UploadedFile $file): bool
    {
        return $file->getClientMimeType() === 'image/svg+xml'
            || strtolower($file->getClientOriginalExtension()) === 'svg';
    }

    private function resizeToPng(GdImage $source, int $size): string
    {
        $resized = imagecreatetruecolor($size, $size);

        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        $transparent = imagecolorallocatealpha($resized, 0, 0, 0, 127);
        imagefill($resized, 0, 0, $transparent);

        imagecopyresampled(
            $resized,
            $source,
            0,
            0,
            0,
            0,
            $size,
            $size,
            imagesx($source),
            imagesy($source),
        );

        ob_start();
        imagepng($resized);
        $bytes = ob_get_clean();

        return $bytes;
    }

    /**
     * @param  array<int, string>  $pngEntriesBySize
     */
    private function writeIco(array $pngEntriesBySize): void
    {
        $count = count($pngEntriesBySize);

        // ICONDIR: reserved(2) + type(2, 1=icon) + count(2)
        $header = pack('vvv', 0, 1, $count);

        $directory = '';
        $imageData = '';
        $offset = 6 + (16 * $count);

        foreach ($pngEntriesBySize as $size => $bytes) {
            // ICONDIRENTRY: width(1) + height(1) + colors(1) + reserved(1)
            // + planes(2) + bitcount(2) + bytesInRes(4) + imageOffset(4)
            $directory .= pack(
                'CCCCvvVV',
                $size >= 256 ? 0 : $size,
                $size >= 256 ? 0 : $size,
                0,
                0,
                1,
                32,
                strlen($bytes),
                $offset,
            );

            $imageData .= $bytes;
            $offset += strlen($bytes);
        }

        $ico = $header.$directory.$imageData;

        $destination = public_path('favicon.ico');
        $temp = public_path('favicon.ico.'.Str::random(8).'.tmp');

        file_put_contents($temp, $ico);
        rename($temp, $destination);
    }
}
