<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateStoreSettingsRequest;
use App\Services\Admin\AdminActivityService;
use App\Services\Admin\ReturnPolicySettingsService;
use App\Services\Admin\StoreSettingsService;
use App\Services\FaviconGenerator;
use App\Services\ProductImageStorage;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StoreSettingController extends Controller
{
    public function __construct(
        private readonly AdminActivityService $activity,
        private readonly ProductImageStorage $storage,
        private readonly FaviconGenerator $favicon,
    ) {}

    public function edit(
        StoreSettingsService $settings,
        ReturnPolicySettingsService $returnPolicy,
    ): Response {
        return Inertia::render('admin/settings/edit', [
            'profile' => $settings->profile(),
            'returnPolicy' => $returnPolicy->settings(),
        ]);
    }

    public function update(
        UpdateStoreSettingsRequest $request,
        StoreSettingsService $settings,
        ReturnPolicySettingsService $returnPolicy,
    ): RedirectResponse {
        $validated = $request->validated();

        $logoUrl = $validated['logoUrl'] ?? null;
        $logoWideUrl = $validated['logoWideUrl'] ?? null;
        $faviconStatus = 'ok';

        if ($request->hasFile('logo')) {
            $path = $this->storage->uploadStoreLogo($request->file('logo'));
            $logoUrl = $this->storage->publicUrl($path);
            $faviconStatus = $this->favicon->generateFromUploadedLogo($request->file('logo'));
        }

        if ($request->hasFile('logoWide')) {
            $path = $this->storage->uploadStoreLogoWide($request->file('logoWide'));
            $logoWideUrl = $this->storage->publicUrl($path);
        }

        $profile = $settings->updateProfile([
            'name' => $validated['name'],
            'logoUrl' => $logoUrl,
            'logoWideUrl' => $logoWideUrl,
            'shortDescription' => $validated['shortDescription'] ?? '',
            'contactEmail' => $validated['contactEmail'] ?? '',
            'contactPhone' => $validated['contactPhone'] ?? '',
            'address' => $validated['address'] ?? '',
            'facebookUrl' => $validated['facebookUrl'] ?? null,
            'instagramUrl' => $validated['instagramUrl'] ?? null,
            'tiktokUrl' => $validated['tiktokUrl'] ?? null,
            'youtubeUrl' => $validated['youtubeUrl'] ?? null,
            'currency' => $validated['currency'],
        ]);

        $returnPolicy->update([
            'returnsEnabled' => $validated['returnsEnabled'] ?? false,
            'returnsWindowDays' => $validated['returnsWindowDays'] ?? 30,
        ]);

        $this->activity->log(
            $request->user(),
            'settings.update',
            properties: $profile,
            request: $request,
        );

        $messageKey = match ($faviconStatus) {
            'skipped_svg' => 'messages.settings_updated_favicon_svg_skipped',
            'failed' => 'messages.settings_updated_favicon_failed',
            default => 'messages.settings_updated',
        };

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __($messageKey),
        ]);

        return redirect()->route('admin.settings.edit');
    }
}
