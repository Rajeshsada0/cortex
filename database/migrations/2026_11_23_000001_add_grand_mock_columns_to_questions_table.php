<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->boolean('is_grand_mock')->default(false)->after('is_high_yield');
            $table->string('mock_exam_name', 150)->nullable()->after('is_grand_mock');
            $table->string('scheduled_day', 30)->nullable()->after('mock_exam_name'); // e.g., SATURDAY, SUNDAY

            $table->index('is_grand_mock', 'idx_questions_is_grand_mock');
            $table->index('mock_exam_name', 'idx_questions_mock_exam_name');
            $table->index('scheduled_day', 'idx_questions_scheduled_day');
        });
    }

    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropIndex('idx_questions_is_grand_mock');
            $table->dropIndex('idx_questions_mock_exam_name');
            $table->dropIndex('idx_questions_scheduled_day');
            $table->dropColumn(['is_grand_mock', 'mock_exam_name', 'scheduled_day']);
        });
    }
};
