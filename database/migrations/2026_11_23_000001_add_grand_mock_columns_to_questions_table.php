<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            if (! Schema::hasColumn('questions', 'is_grand_mock')) {
                $table->boolean('is_grand_mock')->default(false)->after('is_high_yield');
                $table->index('is_grand_mock', 'idx_questions_is_grand_mock');
            }
            if (! Schema::hasColumn('questions', 'mock_exam_name')) {
                $table->string('mock_exam_name', 150)->nullable()->after('is_grand_mock');
                $table->index('mock_exam_name', 'idx_questions_mock_exam_name');
            }
            if (! Schema::hasColumn('questions', 'scheduled_day')) {
                $table->string('scheduled_day', 30)->nullable()->after('mock_exam_name');
                $table->index('scheduled_day', 'idx_questions_scheduled_day');
            }
        });
    }

    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            if (Schema::hasColumn('questions', 'is_grand_mock')) {
                $table->dropIndex('idx_questions_is_grand_mock');
            }
            if (Schema::hasColumn('questions', 'mock_exam_name')) {
                $table->dropIndex('idx_questions_mock_exam_name');
            }
            if (Schema::hasColumn('questions', 'scheduled_day')) {
                $table->dropIndex('idx_questions_scheduled_day');
            }
            $table->dropColumn(array_filter([
                Schema::hasColumn('questions', 'is_grand_mock') ? 'is_grand_mock' : null,
                Schema::hasColumn('questions', 'mock_exam_name') ? 'mock_exam_name' : null,
                Schema::hasColumn('questions', 'scheduled_day') ? 'scheduled_day' : null,
            ]));
        });
    }
};
