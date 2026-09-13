<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark" @class(['dark' => ($appearance ?? 'dark') !== 'light'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Enforce clinical dark theme --}}
        <script>
            (function() {
                document.documentElement.classList.add('dark');
                document.documentElement.style.colorScheme = 'dark';
                try {
                    localStorage.setItem('appearance', 'dark');
                } catch (e) {}
            })();
        </script>

        {{-- Inline style to set the HTML background color based on clinical theme --}}
        <style>
            html, body {
                background-color: #070b14 !important;
                color: #f1f5f9;
            }
            html.dark, body.dark {
                background-color: #070b14 !important;
                color: #f1f5f9;
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased bg-[#070b14] text-slate-100">
        <x-inertia::app />
    </body>
</html>
