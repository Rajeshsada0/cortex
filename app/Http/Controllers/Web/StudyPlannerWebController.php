<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class StudyPlannerWebController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $targetDate = $user?->target_exam_date ? Carbon::parse($user->target_exam_date) : Carbon::now()->addMonths(4);
        $daysRemaining = round(max(1, Carbon::now()->diffInDays($targetDate, false)), 2);

        $totalQuestions = Question::count();
        $attempted = QuestionAttempt::where('user_id', $user?->id ?? 0)->distinct('question_id')->count('question_id');
        $remaining = max(0, $totalQuestions - $attempted);

        return Inertia::render('planner/index', [
            'user' => $user,
            'plan' => [
                'target_exam_date' => $targetDate->toDateString(),
                'days_remaining' => $daysRemaining,
                'daily_study_hours' => $user?->daily_study_hours ?? 6,
                'daily_mcq_target' => $user?->daily_mcq_target ?? 100,
                'total_questions' => $totalQuestions,
                'attempted_questions' => $attempted,
                'remaining_questions' => $remaining,
                'recommended_daily_pace' => round($remaining / $daysRemaining, 1),
            ],
        ]);
    }
}
