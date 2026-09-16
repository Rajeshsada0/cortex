<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'light') === 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Initialize light theme as default --}}
        <script>
            (function() {
                const appearance = localStorage.getItem('appearance') || 'light';
                if (appearance === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                    try {
                        localStorage.setItem('appearance', 'light');
                    } catch (e) {}
                }
            })();
        </script>

        {{-- Inline style to prevent theme flash --}}
        <style>
            html, body {
                background-color: #f8fafc;
                color: #0f172a;
            }
            html.dark, body.dark {
                background-color: #070b14 !important;
                color: #f1f5f9 !important;
            }
        </style>

        @php
            $sysAppName = \App\Models\SystemSetting::get('app_name', config('app.name', 'Cortex Med'));
            $sysFavicon = \App\Models\SystemSetting::get('site_favicon', '/favicon.ico');
            $sysMetaTitle = \App\Models\SystemSetting::get('seo_meta_title', $sysAppName);
            $sysMetaDesc = \App\Models\SystemSetting::get('seo_meta_description', 'High-Stakes Postgraduate Doctor Entrance Simulation Engine.');
            $sysMetaKeywords = \App\Models\SystemSetting::get('seo_meta_keywords', 'MBBS, NMCLE, MECEE-PG, INI-CET, USMLE');
            $sysOgImage = \App\Models\SystemSetting::get('seo_og_image', '/images/cortex-logo.png');
        @endphp

        <meta name="description" content="{{ $sysMetaDesc }}">
        <meta name="keywords" content="{{ $sysMetaKeywords }}">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="{{ $sysMetaTitle }}">
        <meta property="og:description" content="{{ $sysMetaDesc }}">
        <meta property="og:image" content="{{ str_starts_with($sysOgImage, 'http') ? $sysOgImage : url($sysOgImage) }}">

        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="{{ url()->current() }}">
        <meta name="twitter:title" content="{{ $sysMetaTitle }}">
        <meta name="twitter:description" content="{{ $sysMetaDesc }}">
        <meta name="twitter:image" content="{{ str_starts_with($sysOgImage, 'http') ? $sysOgImage : url($sysOgImage) }}">

        <link rel="icon" href="{{ $sysFavicon }}" sizes="any">
        <link rel="apple-touch-icon" href="{{ $sysFavicon }}">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ $sysMetaTitle }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased bg-background text-foreground">
        <x-inertia::app />
    </body>
</html>
