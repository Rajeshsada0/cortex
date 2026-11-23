<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->isProduction() || str_starts_with((string) config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }

        // Auto-ensure Grand Mock schema columns exist
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('questions') && ! \Illuminate\Support\Facades\Schema::hasColumn('questions', 'is_grand_mock')) {
                \Illuminate\Support\Facades\Schema::table('questions', function (\Illuminate\Database\Schema\Blueprint $table) {
                    if (! \Illuminate\Support\Facades\Schema::hasColumn('questions', 'is_grand_mock')) {
                        $table->boolean('is_grand_mock')->default(false)->after('is_high_yield');
                        $table->index('is_grand_mock', 'idx_questions_is_grand_mock');
                    }
                    if (! \Illuminate\Support\Facades\Schema::hasColumn('questions', 'mock_exam_name')) {
                        $table->string('mock_exam_name', 150)->nullable()->after('is_grand_mock');
                        $table->index('mock_exam_name', 'idx_questions_mock_exam_name');
                    }
                    if (! \Illuminate\Support\Facades\Schema::hasColumn('questions', 'scheduled_day')) {
                        $table->string('scheduled_day', 20)->nullable()->after('mock_exam_name');
                        $table->index('scheduled_day', 'idx_questions_scheduled_day');
                    }
                });
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Grand mock schema auto-ensure skipped: ' . $e->getMessage());
        }

        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
