<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('active_pathway', 30)->default('INI_CET')->after('email');
            $table->date('target_exam_date')->nullable()->after('active_pathway');
            $table->integer('daily_study_hours')->default(6)->after('target_exam_date');
            $table->integer('daily_mcq_target')->default(100)->after('daily_study_hours');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'active_pathway',
                'target_exam_date',
                'daily_study_hours',
                'daily_mcq_target',
            ]);
        });
    }
};
