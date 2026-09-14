<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_pathways', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 100);
            $table->string('full_name', 255);
            $table->string('region', 50)->nullable();
            $table->unsignedInteger('total_questions')->default(200);
            $table->unsignedInteger('duration_minutes')->default(180);
            $table->decimal('correct_marks', 5, 2)->default(1.0);
            $table->decimal('negative_marks', 5, 2)->default(0.25);
            $table->string('scoring_type', 150)->default('Negative Marking (+1 / -0.25)');
            $table->string('penalty_label', 100)->nullable();
            $table->string('badge_color', 100)->nullable();
            $table->json('blueprint_weights')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false);
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });

        // Seed initial default pathways
        $now = now();
        $defaultPathways = [
            [
                'code' => 'MECEE_PG',
                'name' => 'Nepal MECEE-PG',
                'full_name' => 'Medical Education Commission Entrance Examination (MD/MS)',
                'region' => 'Nepal',
                'total_questions' => 200,
                'duration_minutes' => 180,
                'correct_marks' => 1.0,
                'negative_marks' => 0.25,
                'scoring_type' => 'Negative Marking (+1 / -0.25)',
                'penalty_label' => 'Standard (-0.25)',
                'badge_color' => 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
                'blueprint_weights' => null,
                'is_active' => true,
                'is_system' => true,
                'order_index' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'code' => 'INI_CET',
                'name' => 'India INI-CET',
                'full_name' => 'Institute of National Importance Combined Entrance Test (AIIMS, PGI, JIPMER, NIMHANS)',
                'region' => 'India',
                'total_questions' => 200,
                'duration_minutes' => 180,
                'correct_marks' => 1.0,
                'negative_marks' => 0.33,
                'scoring_type' => 'Negative Marking (+1 / -0.333)',
                'penalty_label' => 'Severe (-0.33)',
                'badge_color' => 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
                'blueprint_weights' => null,
                'is_active' => true,
                'is_system' => true,
                'order_index' => 2,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'code' => 'NEET_PG',
                'name' => 'India NEET-PG (2026)',
                'full_name' => 'National Eligibility cum Entrance Test for Postgraduate Medical Courses',
                'region' => 'India',
                'total_questions' => 180,
                'duration_minutes' => 210,
                'correct_marks' => 4.0,
                'negative_marks' => 1.0,
                'scoring_type' => 'Negative Marking (+4 / -1.0)',
                'penalty_label' => 'National (-1.0)',
                'badge_color' => 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                'blueprint_weights' => null,
                'is_active' => true,
                'is_system' => true,
                'order_index' => 3,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'code' => 'USMLE_STEP1',
                'name' => 'USA USMLE Step 1',
                'full_name' => 'United States Medical Licensing Examination Step 1 (Basic Biomedical Sciences)',
                'region' => 'USA',
                'total_questions' => 280,
                'duration_minutes' => 420,
                'correct_marks' => 1.0,
                'negative_marks' => 0.0,
                'scoring_type' => 'Pass / Fail (Standard Minimum 196)',
                'penalty_label' => 'No Negative',
                'badge_color' => 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                'blueprint_weights' => null,
                'is_active' => true,
                'is_system' => true,
                'order_index' => 4,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'code' => 'USMLE_STEP2CK',
                'name' => 'USA USMLE Step 2 CK',
                'full_name' => 'United States Medical Licensing Examination Step 2 Clinical Knowledge',
                'region' => 'USA',
                'total_questions' => 318,
                'duration_minutes' => 480,
                'correct_marks' => 1.0,
                'negative_marks' => 0.0,
                'scoring_type' => 'Three-Digit Scaled Score (1–300, Passing ~214)',
                'penalty_label' => 'No Negative',
                'badge_color' => 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                'blueprint_weights' => null,
                'is_active' => true,
                'is_system' => true,
                'order_index' => 5,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'code' => 'COMBINED',
                'name' => 'Combined Global Track',
                'full_name' => 'Integrated Tri-Pathway Medical Curriculum (MECEE + INI-CET + USMLE)',
                'region' => 'Global',
                'total_questions' => 200,
                'duration_minutes' => 180,
                'correct_marks' => 1.0,
                'negative_marks' => 0.25,
                'scoring_type' => 'Comprehensive Dual-Metric Scoring',
                'penalty_label' => 'Standard (-0.25)',
                'badge_color' => 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
                'blueprint_weights' => null,
                'is_active' => true,
                'is_system' => true,
                'order_index' => 6,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('exam_pathways')->insert($defaultPathways);
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_pathways');
    }
};
