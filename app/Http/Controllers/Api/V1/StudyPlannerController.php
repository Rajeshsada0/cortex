<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class StudyPlannerController extends Controller
{
    /**
     * Get active study plan and daily task blocks
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $targetDate = $user?->target_exam_date ?? Carbon::now()->addMonths(4);
        $daysRemaining = max(1, Carbon::now()->diffInDays($targetDate, false));

        $totalQuestions = Question::count();
        $attemptedCount = QuestionAttempt::where('user_id', $user?->id ?? 0)->distinct('question_id')->count('question_id');
        $remainingQuestions = max(0, $totalQuestions - $attemptedCount);

        $dailyHours = $user?->daily_study_hours ?? 6;
        $dailyTarget = $user?->daily_mcq_target ?? 100;

        // Structured daily task blocks
        $scheduleBlocks = [
            [
                'time_slot' => '07:00 - 08:30',
                'category' => 'Revision',
                'title' => 'Spaced Repetition Flashcard Queue Clearance',
                'duration_minutes' => 90,
                'target' => 'Clear all due SRS cards (SM-2 Phase 1-4)',
                'badge' => 'Active Recall',
                'color' => '#55BDEB',
            ],
            [
                'time_slot' => '09:00 - 12:00',
                'category' => 'Practice',
                'title' => 'Timed MCQ Block (High Yield Clinical Vignettes)',
                'duration_minutes' => 180,
                'target' => "Target: {$dailyTarget} MCQs (40 Qs / 60 min blocks)",
                'badge' => 'Exam Simulation',
                'color' => '#102A43',
            ],
            [
                'time_slot' => '14:00 - 16:30',
                'category' => 'Review',
                'title' => '3-Tier Rationale Deconstruction & Deep Dive',
                'duration_minutes' => 150,
                'target' => 'Review Foundation, Integration, and Application tiers of incorrect items',
                'badge' => 'High Yield',
                'color' => '#F59E0B',
            ],
            [
                'time_slot' => '17:00 - 18:30',
                'category' => 'Mock',
                'title' => 'Hazardous Blind Spot Remediation & Mini-Mock',
                'duration_minutes' => 90,
                'target' => 'Focus on High-Confidence Incorrect questions in 19-Subject Directory',
                'badge' => 'Remediation',
                'color' => '#E05252',
            ],
        ];

        return response()->json([
            'success' => true,
            'plan' => [
                'target_exam_date' => $targetDate->toDateString(),
                'days_remaining' => $daysRemaining,
                'daily_study_hours' => $dailyHours,
                'daily_mcq_target' => $dailyTarget,
                'total_questions_in_pool' => $totalQuestions,
                'attempted_questions' => $attemptedCount,
                'remaining_questions' => $remainingQuestions,
                'recommended_daily_pace' => round($remainingQuestions / $daysRemaining, 1),
                'schedule_blocks' => $scheduleBlocks,
            ],
        ]);
    }

    /**
     * Mathematical schedule recalculator based on exam target date and daily hours
     */
    public function recalculate(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $validated = $request->validate([
            'target_exam_date' => 'required|date|after:today',
            'daily_study_hours' => 'required|integer|min:1|max:18',
        ]);

        $targetDate = Carbon::parse($validated['target_exam_date']);
        $daysRemaining = max(1, Carbon::now()->diffInDays($targetDate));

        $totalQuestions = Question::count();
        $attempted = QuestionAttempt::where('user_id', $user?->id ?? 0)->distinct('question_id')->count('question_id');
        $remaining = max(0, $totalQuestions - $attempted);

        // Calculate optimal daily MCQ pace based on available hours (assume ~1.5 min per question + review)
        $maxDailyMcqCapacity = ($validated['daily_study_hours'] * 60) / 2.5; // ~2.5 min per Q with thorough 3-tier review
        $requiredPace = ceil($remaining / $daysRemaining);
        $recommendedTarget = min((int) $maxDailyMcqCapacity, max(30, (int) $requiredPace));

        if ($user) {
            $user->update([
                'target_exam_date' => $targetDate->toDateString(),
                'daily_study_hours' => $validated['daily_study_hours'],
                'daily_mcq_target' => $recommendedTarget,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Study schedule recalculated successfully',
            'recalculated' => [
                'days_remaining' => $daysRemaining,
                'daily_study_hours' => $validated['daily_study_hours'],
                'daily_mcq_target' => $recommendedTarget,
                'estimated_curriculum_completion' => $targetDate->subWeeks(2)->toDateString(),
            ],
        ]);
    }
}
