<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingsWebController extends Controller
{
    /**
     * Display the Global System Settings suite.
     */
    public function index(): Response
    {
        return Inertia::render('admin/settings/index', [
            'settings' => SystemSetting::getPublicSettings(),
        ]);
    }

    /**
     * Update platform settings and process branding asset uploads.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            // Branding & Identity
            'app_name' => 'nullable|string|max:100',
            'app_version' => 'nullable|string|max:20',
            'app_tagline' => 'nullable|string|max:255',
            'footer_text' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:100',
            'site_logo' => 'nullable|string|max:500',
            'site_favicon' => 'nullable|string|max:500',

            // File uploads
            'site_logo_file' => 'nullable|file|mimes:jpeg,png,jpg,webp,svg,gif,ico|max:10240',
            'site_favicon_file' => 'nullable|file|mimes:jpeg,png,jpg,webp,svg,ico|max:4096',
            'seo_og_image_file' => 'nullable|file|mimes:jpeg,png,jpg,webp|max:10240',

            // SEO
            'seo_meta_title' => 'nullable|string|max:255',
            'seo_meta_description' => 'nullable|string|max:600',
            'seo_meta_keywords' => 'nullable|string|max:600',
            'seo_og_image' => 'nullable|string|max:500',

            // Social Media
            'social_facebook' => 'nullable|string|max:255',
            'social_twitter' => 'nullable|string|max:255',
            'social_instagram' => 'nullable|string|max:255',
            'social_youtube' => 'nullable|string|max:255',
            'social_linkedin' => 'nullable|string|max:255',
            'social_telegram' => 'nullable|string|max:255',
        ]);

        // Process File Uploads
        if ($request->hasFile('site_logo_file')) {
            $path = $request->file('site_logo_file')->store('branding', 'public');
            $validated['site_logo'] = Storage::url($path);
        }

        if ($request->hasFile('site_favicon_file')) {
            $path = $request->file('site_favicon_file')->store('branding', 'public');
            $validated['site_favicon'] = Storage::url($path);
        }

        if ($request->hasFile('seo_og_image_file')) {
            $path = $request->file('seo_og_image_file')->store('branding', 'public');
            $validated['seo_og_image'] = Storage::url($path);
        }

        $groupMapping = [
            'app_name' => 'branding',
            'app_version' => 'branding',
            'app_tagline' => 'branding',
            'site_logo' => 'branding',
            'site_favicon' => 'branding',
            'footer_text' => 'general',
            'contact_email' => 'general',
            'seo_meta_title' => 'seo',
            'seo_meta_description' => 'seo',
            'seo_meta_keywords' => 'seo',
            'seo_og_image' => 'seo',
            'social_facebook' => 'social',
            'social_twitter' => 'social',
            'social_instagram' => 'social',
            'social_youtube' => 'social',
            'social_linkedin' => 'social',
            'social_telegram' => 'social',
        ];

        foreach ($groupMapping as $key => $group) {
            if (array_key_exists($key, $validated)) {
                SystemSetting::set($key, $validated[$key], $group);
            }
        }

        SystemSetting::clearCache();

        return redirect()->route('admin.settings.index')
            ->with('success', 'Global system settings updated successfully.');
    }

    /**
     * Reset primary site logo to default Cortex Med logo.
     */
    public function resetLogo(): RedirectResponse
    {
        SystemSetting::set('site_logo', '/images/cortex-logo.png', 'branding');
        SystemSetting::clearCache();

        return redirect()->route('admin.settings.index')
            ->with('success', 'Site logo reset to official default.');
    }

    /**
     * Reset favicon to default.
     */
    public function resetFavicon(): RedirectResponse
    {
        SystemSetting::set('site_favicon', '/favicon.ico', 'branding');
        SystemSetting::clearCache();

        return redirect()->route('admin.settings.index')
            ->with('success', 'Site favicon reset to official default.');
    }
}
