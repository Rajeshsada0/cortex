<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flashcard_decks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('title', 150);
            $table->text('description')->nullable();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->string('category', 50)->default('custom'); // 'custom', 'anki', 'foundational', 'disease', 'clinical'
            $table->integer('cards_count')->default(0);
            $table->boolean('is_public')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'category'], 'idx_decks_user_category');
        });

        Schema::create('flashcards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('deck_id')->nullable()->constrained('flashcard_decks')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('question_id')->nullable()->constrained('questions')->nullOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained('topics')->nullOnDelete();
            $table->text('front');
            $table->text('back');
            $table->text('pearl')->nullable();
            $table->string('difficulty', 20)->default('MEDIUM');
            $table->boolean('is_high_yield')->default(false);
            $table->boolean('is_past_year')->default(false);
            $table->string('past_year', 30)->nullable();
            $table->timestamps();

            $table->index('deck_id', 'idx_flashcards_deck');
            $table->index('user_id', 'idx_flashcards_user');
            $table->index('subject_id', 'idx_flashcards_subject');
            $table->index('is_high_yield', 'idx_flashcards_high_yield');
            $table->index('is_past_year', 'idx_flashcards_past_year');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flashcards');
        Schema::dropIfExists('flashcard_decks');
    }
};
