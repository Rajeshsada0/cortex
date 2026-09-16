<?php

namespace Tests\Feature;

use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        SystemSetting::seedDefaults();
    }

    public function test_guest_cannot_access_settings_page(): void
    {
        $response = $this->get('/admin/settings');
        $response->assertRedirect('/login');
    }

    public function test_non_admin_cannot_access_settings_page(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/admin/settings');
        $response->assertRedirect(route('dashboard'));
    }

    public function test_admin_can_view_settings_page(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->get('/admin/settings');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/settings/index')
            ->has('settings.app_name')
            ->has('settings.site_logo')
            ->has('settings.seo_meta_title')
        );
    }

    public function test_admin_can_update_text_settings(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $payload = [
            'app_name' => 'CORTEX MED ULTRA',
            'app_version' => 'v5.0',
            'app_tagline' => 'Next-Gen Doctor Simulation',
            'contact_email' => 'admin@cortexmed.com',
            'footer_text' => '© 2026 Cortex Med Ultra. All rights reserved.',
            'seo_meta_title' => 'Cortex Med Ultra — Leading Entrance Simulation',
            'seo_meta_description' => 'A comprehensive medical test prep platform.',
            'seo_meta_keywords' => 'MBBS, NMCLE, USMLE, PG',
            'social_facebook' => 'https://facebook.com/cortexmedultra',
            'social_twitter' => 'https://x.com/cortexmedultra',
            'social_instagram' => 'https://instagram.com/cortexmedultra',
            'social_youtube' => 'https://youtube.com/@cortexmedultra',
            'social_linkedin' => 'https://linkedin.com/company/cortexmedultra',
            'social_telegram' => 'https://t.me/cortexmedultra',
        ];

        $response = $this->actingAs($admin)->post('/admin/settings', $payload);

        $response->assertRedirect(route('admin.settings.index'));
        $response->assertSessionHas('success');

        $this->assertEquals('CORTEX MED ULTRA', SystemSetting::get('app_name'));
        $this->assertEquals('v5.0', SystemSetting::get('app_version'));
        $this->assertEquals('https://t.me/cortexmedultra', SystemSetting::get('social_telegram'));
    }

    public function test_admin_can_upload_logo_and_favicon(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create(['is_admin' => true]);

        $logoFile = UploadedFile::fake()->image('custom-logo.png', 200, 200);
        $faviconFile = UploadedFile::fake()->image('favicon.png', 32, 32);

        $response = $this->actingAs($admin)->post('/admin/settings', [
            'app_name' => 'CORTEX BRAND',
            'site_logo_file' => $logoFile,
            'site_favicon_file' => $faviconFile,
        ]);

        $response->assertRedirect(route('admin.settings.index'));

        $logoUrl = SystemSetting::get('site_logo');
        $faviconUrl = SystemSetting::get('site_favicon');

        $this->assertStringContainsString('/storage/branding/', $logoUrl);
        $this->assertStringContainsString('/storage/branding/', $faviconUrl);

        $relativePath = str_replace('/storage/', '', $logoUrl);
        Storage::disk('public')->assertExists($relativePath);
    }

    public function test_admin_can_reset_logo_to_default(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        SystemSetting::set('site_logo', '/custom-path/logo.png', 'branding');
        $this->assertEquals('/custom-path/logo.png', SystemSetting::get('site_logo'));

        $response = $this->actingAs($admin)->post('/admin/settings/reset-logo');
        $response->assertRedirect(route('admin.settings.index'));

        $this->assertEquals('/images/cortex-logo.png', SystemSetting::get('site_logo'));
    }

    public function test_settings_are_shared_globally_in_inertia(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/dashboard');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('settings')
            ->where('settings.app_name', SystemSetting::get('app_name'))
            ->where('settings.site_logo', SystemSetting::get('site_logo'))
        );
    }
}
