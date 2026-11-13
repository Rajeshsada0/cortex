<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('support_inquiries', function (Blueprint $table) {
            $table->string('ticket_number')->nullable()->after('id')->index();
            $table->string('priority')->default('normal')->after('category'); // low, normal, high, urgent
            $table->text('reply')->nullable()->after('message');
            $table->timestamp('replied_at')->nullable()->after('reply');
            $table->string('assigned_to')->nullable()->after('replied_at');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('institution')->nullable()->after('email');
            $table->string('medical_council_no')->nullable()->after('institution');
            $table->string('phone')->nullable()->after('medical_council_no');
            $table->unsignedInteger('ai_credits')->default(50)->after('daily_mcq_target');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('support_inquiries', function (Blueprint $table) {
            $table->dropColumn(['ticket_number', 'priority', 'reply', 'replied_at', 'assigned_to']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['institution', 'medical_council_no', 'phone', 'ai_credits']);
        });
    }
};
