<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Test sessions
        Schema::create('test_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 150);
            $table->string('session_type', 50)->default('PRACTICE'); // PRACTICE, TIMED_BLOCK, GRAND_MOCK
            $table->string('exam_pathway', 30)->default('INI_CET');
            $table->integer('total_questions')->default(0);
            $table->integer('duration_seconds')->default(0);
            $table->integer('time_spent_seconds')->default(0);
            $table->decimal('score_obtained', 6, 2)->default(0.00);
            $table->boolean('is_completed')->default(false);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // Question attempts
        Schema::create('question_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('session_id')->constrained('test_sessions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('question_id')->constrained('questions')->cascadeOnDelete();
            $table->char('selected_option', 1)->nullable();
            $table->boolean('is_correct')->default(false);
            $table->string('confidence', 20)->default('HIGH'); // LOW, MEDIUM, HIGH
            $table->integer('time_taken_seconds')->default(0);
            $table->boolean('was_switched')->default(false);
            $table->char('initial_option', 1)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'question_id'], 'idx_attempts_user_question');
            $table->index(['session_id'], 'idx_attempts_session');
        });

        // Spaced repetition queue
        Schema::create('spaced_repetition_queue', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('question_id')->constrained('questions')->cascadeOnDelete();
            $table->integer('repetition_stage')->default(0); // 0..4
            $table->timestamp('next_review_due')->nullable();
            $table->decimal('ease_factor', 3, 2)->default(2.50);
            $table->integer('interval_days')->default(0);
            $table->integer('consecutive_correct')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'question_id'], 'uniq_srs_user_question');
            $table->index(['user_id', 'next_review_due'], 'idx_spaced_queue_review');
        });

        // Bookmarks, folders & personal notes
        Schema::create('library_folders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('color_hex', 10)->default('#55BDEB');
            $table->timestamps();
        });

        Schema::create('user_notes_bookmarks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('question_id')->constrained('questions')->cascadeOnDelete();
            $table->foreignUuid('folder_id')->nullable()->constrained('library_folders')->nullOnDelete();
            $table->boolean('is_bookmarked')->default(false);
            $table->text('note_content')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'question_id'], 'uniq_user_question_note');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_notes_bookmarks');
        Schema::dropIfExists('library_folders');
        Schema::dropIfExists('spaced_repetition_queue');
        Schema::dropIfExists('question_attempts');
        Schema::dropIfExists('test_sessions');
    }
};
