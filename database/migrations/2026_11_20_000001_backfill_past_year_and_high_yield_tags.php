<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Artisan;

return new class extends Migration
{
    public function up(): void
    {
        try {
            Artisan::call('cortex:tag-pyq-highyield');
        } catch (\Throwable $e) {
            // Silently continue if tables not ready
        }
    }

    public function down(): void
    {
        // No-op
    }
};
