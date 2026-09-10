<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 50)->unique(); // e.g., Q-PHARM-0192
            $table->foreignId('subject_id')->constrained('subjects');
            $table->foreignId('topic_id')->constrained('topics');
            $table->foreignId('subtopic_id')->nullable()->constrained('subtopics');
            $table->string('difficulty', 20)->default('MEDIUM'); // EASY, MEDIUM, HARD
            $table->string('question_type', 30)->default('SINGLE_BEST_ANSWER'); // SINGLE_BEST_ANSWER, MULTIPLE_RESPONSE, EXTENDED_MATCHING
            $table->text('stem');
            $table->text('image_url')->nullable();
            $table->string('image_caption', 255)->nullable();
            $table->char('correct_option', 1); // A, B, C, D
            $table->text('learning_objective');
            $table->text('foundation_explanation');
            $table->text('integration_explanation');
            $table->text('application_explanation');
            $table->text('memory_peg')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['subject_id', 'topic_id'], 'idx_questions_subject_topic');
        });

        Schema::create('question_exam_relevance', function (Blueprint $table) {
            $table->foreignUuid('question_id')->constrained('questions')->cascadeOnDelete();
            $table->string('exam', 30); // MECEE_PG, INI_CET, USMLE_STEP1, USMLE_STEP2CK, COMBINED
            $table->primary(['question_id', 'exam']);
        });

        Schema::create('question_options', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('question_id')->constrained('questions')->cascadeOnDelete();
            $table->char('option_key', 1); // A, B, C, D
            $table->text('option_text');
            $table->text('rationale');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_options');
        Schema::dropIfExists('question_exam_relevance');
        Schema::dropIfExists('questions');
    }
};
