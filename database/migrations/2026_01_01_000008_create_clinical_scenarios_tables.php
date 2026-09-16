<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Clinical Scenario Stations (Vignettes)
        Schema::create('clinical_scenarios', function (Blueprint $table) {
            $table->id();
            $table->string('pathway_code', 50)->nullable()->default('NMC');
            $table->string('discipline', 150);
            $table->string('title', 255);
            $table->longText('stem');
            $table->text('vitals')->nullable();
            $table->integer('order_index')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['pathway_code', 'is_active']);
            $table->index('order_index');
        });

        // 5 Linked Questions per Scenario
        Schema::create('clinical_scenario_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinical_scenario_id')
                ->constrained('clinical_scenarios')
                ->cascadeOnDelete();
            $table->unsignedTinyInteger('question_number')->default(1);
            $table->text('stem');
            $table->json('options'); // Array of 4 options
            $table->unsignedTinyInteger('correct_option')->default(0); // 0-indexed: 0=A, 1=B, 2=C, 3=D
            $table->text('explanation')->nullable();
            $table->integer('order_index')->default(0);
            $table->timestamps();

            $table->index(['clinical_scenario_id', 'order_index'], 'idx_csq_scenario_order');
        });

        // Student Exam Attempts for CSQ Mock Examinations
        Schema::create('clinical_scenario_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('pathway_code', 50)->nullable()->default('NMC');
            $table->unsignedInteger('total_stations')->default(4);
            $table->unsignedInteger('total_questions')->default(20);
            $table->unsignedInteger('total_score')->default(0);
            $table->decimal('percentage', 5, 2)->default(0.00);
            $table->boolean('is_passed')->default(false);
            $table->unsignedInteger('time_spent_seconds')->default(0);
            $table->json('station_results')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinical_scenario_attempts');
        Schema::dropIfExists('clinical_scenario_questions');
        Schema::dropIfExists('clinical_scenarios');
    }
};
