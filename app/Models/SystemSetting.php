<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'group',
        'type',
    ];

    /**
     * Default platform settings map.
     */
    public const DEFAULTS = [
        // Branding & Core
        'app_name' => 'CORTEX MED',
        'app_version' => 'v4.2',
        'app_tagline' => 'Candidate Readiness Portal',
        'site_logo' => '/images/cortex-logo.png',
        'site_favicon' => '/favicon.ico',
        'footer_text' => '© 2026 Cortex Med. High-Stakes Doctor Entrance Simulation Engine.',
        'contact_email' => 'support@cortexmed.com',

        // SEO & Metadata
        'seo_meta_title' => 'Cortex Medical — Postgraduate Doctor Entrance Preparation (MECEE-PG • INI-CET • USMLE)',
        'seo_meta_description' => 'High-Stakes Postgraduate Doctor Entrance Simulation Engine. Prepare for Nepal MECEE-PG, NMCLE, India INI-CET, and USMLE with clinical vignettes, negative marking, and spaced repetition.',
        'seo_meta_keywords' => 'MBBS, NMCLE, MECEE-PG, INI-CET, USMLE, Medical Entrance Exam, Clinical Scenario Questions, CSQ, Medical PG Preparation',
        'seo_og_image' => '/images/cortex-logo.png',

        // Social Media Links
        'social_facebook' => 'https://facebook.com/cortexmed',
        'social_twitter' => 'https://twitter.com/cortexmed',
        'social_instagram' => 'https://instagram.com/cortexmed',
        'social_youtube' => 'https://youtube.com/@cortexmed',
        'social_linkedin' => 'https://linkedin.com/company/cortexmed',
        'social_telegram' => 'https://t.me/cortexmed',
    ];

    /**
     * Retrieve a setting by key with fallback default.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $all = static::getAll();

        if (array_key_exists($key, $all) && $all[$key] !== null) {
            return $all[$key];
        }

        return $default ?? (self::DEFAULTS[$key] ?? null);
    }

    /**
     * Set a setting by key and invalidate relevant caches.
     */
    public static function set(string $key, mixed $value, string $group = 'general', string $type = 'string'): self
    {
        $setting = static::updateOrCreate(
            ['key' => $key],
            [
                'value' => is_array($value) ? json_encode($value) : $value,
                'group' => $group,
                'type' => $type,
            ]
        );

        Cache::forget("sys_setting_{$key}");
        Cache::forget('sys_settings_all');

        return $setting;
    }

    /**
     * Get all settings as key => value dictionary (cached).
     */
    public static function getAll(): array
    {
        return Cache::rememberForever('sys_settings_all', function () {
            return static::pluck('value', 'key')->toArray();
        });
    }

    /**
     * Invalidate all setting caches.
     */
    public static function clearCache(): void
    {
        Cache::forget('sys_settings_all');
        foreach (array_keys(self::DEFAULTS) as $key) {
            Cache::forget("sys_setting_{$key}");
        }
    }

    /**
     * Get array of settings formatted for frontend/Inertia consumption.
     */
    public static function getPublicSettings(): array
    {
        $settings = [];
        foreach (self::DEFAULTS as $key => $defaultValue) {
            $settings[$key] = static::get($key, $defaultValue);
        }

        return $settings;
    }

    /**
     * Seed initial default settings if table is empty.
     */
    public static function seedDefaults(): void
    {
        $groups = [
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

        foreach (self::DEFAULTS as $key => $defaultValue) {
            if (! static::where('key', $key)->exists()) {
                static::create([
                    'key' => $key,
                    'value' => $defaultValue,
                    'group' => $groups[$key] ?? 'general',
                    'type' => 'string',
                ]);
            }
        }

        static::clearCache();
    }
}
