<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->boolean('is_past_year')->default(false)->after('memory_peg');
            $table->string('past_year', 30)->nullable()->after('is_past_year');
            $table->boolean('is_high_yield')->default(false)->after('past_year');

            $table->index('is_past_year', 'idx_questions_is_past_year');
            $table->index('is_high_yield', 'idx_questions_is_high_yield');
        });
    }

    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropIndex('idx_questions_is_past_year');
            $table->dropIndex('idx_questions_is_high_yield');
            $table->dropColumn(['is_past_year', 'past_year', 'is_high_yield']);
        });
    }
};
