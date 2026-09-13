<?php

namespace App\Http\Controllers\Web;

use App\Domain\Analytics\NationalRankPredictor;
use App\Domain\Analytics\PerformanceQuadrantService;
use App\Domain\Analytics\ReadinessScoreCalculator;
use App\Domain\Analytics\StudyStreakService;
use App\Domain\Scoring\ExamPathway;
use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\SpacedRepetitionQueue;
use App\Models\Subject;
use App\Models\TestSession;
use App\Models\User;
use App\Models\UserNoteBookmark;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardWebController extends Controller
{
    public function __construct(
        private readonly ReadinessScoreCalculator $readinessCalculator,
        private readonly PerformanceQuadrantService $quadrantService,
        private readonly NationalRankPredictor $rankPredictor,
        private readonly StudyStreakService $streakService,
    ) {}

    public function __invoke(Request $request): Response
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        // 1. Readiness score calculation
        $readiness = $this->readinessCalculator->calculate($user);

        // 2. Performance Quadrants
        $quadrants = $this->quadrantService->getQuadrantBreakdown($user);

        // 3. Subject progress overview
        $subjects = Subject::withCount(['questions', 'topics'])
            ->orderBy('order_index')
            ->get()
            ->map(function ($s) use ($user) {
                $attempted = QuestionAttempt::where('user_id', $user->id)
                    ->whereHas('question', fn ($q) => $q->where('subject_id', $s->id))
                    ->distinct('question_id')
                    ->count('question_id');

                $correct = QuestionAttempt::where('user_id', $user->id)
                    ->whereHas('question', fn ($q) => $q->where('subject_id', $s->id))
                    ->where('is_correct', true)
                    ->count();

                $total = $s->questions_count;
                $coverage = $total > 0 ? round(($attempted / $total) * 100) : 0;
                $mastery = $attempted > 0 ? round(($correct / $attempted) * 100) : 0;

                return [
                    'id' => $s->id,
                    'name' => $s->name,
                    'slug' => $s->slug,
                    'icon_key' => $s->icon_key,
                    'order_index' => $s->order_index,
                    'questions_count' => $total,
                    'attempted_count' => $attempted,
                    'coverage_percentage' => $coverage,
                    'mastery_percentage' => $mastery,
                ];
            });

        // 4. Spaced repetition queue summary
        $dueCardsCount = SpacedRepetitionQueue::where('user_id', $user->id)
            ->where(function ($q) {
                $q->whereNull('next_review_due')->orWhere('next_review_due', '<=', now());
            })
            ->count();

        // 5. Test session metrics & real counts
        $recentSessions = TestSession::where('user_id', $user->id)
            ->latest('created_at')
            ->limit(4)
            ->get();

        $grandMocksCount = TestSession::where('user_id', $user->id)
            ->where('session_type', 'GRAND_MOCK')
            ->count();

        $completedSessionsCount = TestSession::where('user_id', $user->id)
            ->where('is_completed', true)
            ->count();

        $completedSessions = TestSession::where('user_id', $user->id)
            ->where('is_completed', true)
            ->get();

        $avgScorePercent = $completedSessions->isNotEmpty()
            ? round((float) $completedSessions->avg(fn ($s) => $s->total_questions > 0 ? ($s->score_obtained / $s->total_questions) * 100 : 0), 1)
            : null;

        $targetDate = $user->target_exam_date;
        $daysUntilExam = $targetDate
            ? (int) max(0, ceil(now()->floatDiffInDays($targetDate, false)))
            : null;

        $pathwayEnum = ExamPathway::tryFrom($user->active_pathway ?? 'INI_CET') ?? ExamPathway::INI_CET;
        $rankPrediction = $this->rankPredictor->predict($user, $readiness['readiness_score']);
        $studyStreak = $this->streakService->calculate($user);

        return Inertia::render('dashboard', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'active_pathway' => $user->active_pathway ?? 'INI_CET',
                'pathway_label' => $pathwayEnum->label(),
                'target_exam_date' => $user->target_exam_date?->toDateString(),
                'days_until_exam' => $daysUntilExam,
                'daily_study_hours' => $user->daily_study_hours,
                'daily_mcq_target' => $user->daily_mcq_target,
            ],
            'readiness' => $readiness,
            'quadrants' => $quadrants,
            'rankPrediction' => $rankPrediction,
            'studyStreak' => $studyStreak,
            'subjects' => $subjects,
            'dueCardsCount' => $dueCardsCount,
            'bookmarkedCount' => UserNoteBookmark::where('user_id', $user->id)->where('is_bookmarked', true)->count(),
            'recentSessions' => $recentSessions,
            'grandMocksCount' => $grandMocksCount,
            'completedSessionsCount' => $completedSessionsCount,
            'avgScorePercent' => $avgScorePercent,
            'totalQuestions' => Question::count(),
            'totalAttempts' => QuestionAttempt::where('user_id', $user->id)->count(),
        ]);
    }
}
