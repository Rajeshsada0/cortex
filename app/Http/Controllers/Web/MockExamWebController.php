<?php

namespace App\Http\Controllers\Web;

use App\Domain\Analytics\NationalRankPredictor;
use App\Domain\Scoring\ExamPathway;
use App\Domain\TestSession\TestSessionService;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\QuestionResource;
use App\Http\Resources\V1\TestSessionResource;
use App\Models\Question;
use App\Models\TestSession;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MockExamWebController extends Controller
{
    public function __construct(
        private readonly TestSessionService $testSessionService,
    ) {}

    /**
     * Mock Hall Hub
     */
    public function index(Request $request): Response
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $history = TestSession::where('user_id', $user->id)
            ->where('session_type', 'GRAND_MOCK')
            ->latest('created_at')
            ->get();

        $pathway = ExamPathway::tryFrom($user->active_pathway) ?? ExamPathway::INI_CET;

        return Inertia::render('mock-exam/index', [
            'user' => $user,
            'activePathway' => $user->active_pathway,
            'pathwayName' => $pathway->label(),
            'targetQuestions' => $pathway->targetQuestions(),
            'durationMinutes' => $pathway->durationMinutes(),
            'markingRules' => $pathway->markingRules(),
            'history' => $history,
        ]);
    }

    /**
     * Active Mock Exam Hall (Fullscreen, distraction-free, blur detection, live timer)
     */
    public function hall(Request $request, string $id): Response
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $session = TestSession::with(['attempts'])->findOrFail($id);

        $attemptQuestionIds = $session->attempts->pluck('question_id')->filter();
        if ($attemptQuestionIds->isNotEmpty()) {
            $questions = Question::whereIn('id', $attemptQuestionIds)
                ->with(['subject', 'topic', 'options', 'relevantExams'])
                ->get();
        } else {
            $questions = Question::where('is_active', true)
                ->forExam($session->exam_pathway)
                ->with(['subject', 'topic', 'options', 'relevantExams'])
                ->limit($session->total_questions)
                ->get();
        }

        return Inertia::render('mock-exam/hall', [
            'user' => $user,
            'session' => new TestSessionResource($session),
            'questions' => QuestionResource::collection($questions),
            'attempts' => $session->attempts,
        ]);
    }

    /**
     * Start a new Grand Mock session following the official curriculum blueprint
     */
    public function launch(Request $request)
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $pathway = ExamPathway::tryFrom($request->input('pathway', $user->active_pathway)) ?? ExamPathway::INI_CET;

        $targetQuestions = (int) $request->input('target_questions', 200);

        $durationMinutes = $request->filled('duration_minutes')
            ? (int) $request->input('duration_minutes')
            : ($targetQuestions >= 200 ? 180 : ($targetQuestions >= 100 ? 90 : ($targetQuestions >= 50 ? 45 : 20)));

        $result = $this->testSessionService->createBlueprintMockSession(
            user: $user,
            pathway: $pathway,
            targetQuestions: $targetQuestions,
            durationMinutes: $durationMinutes
        );

        return redirect()->route('mock-exam.hall', ['id' => $result['session']->id]);
    }

    /**
     * Exam Result, Subject-by-Subject Breakdown & Negative Marking Diagnostics
     */
    public function result(Request $request, string $id): Response
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $session = TestSession::with(['attempts.question.subject', 'attempts.question.options'])->findOrFail($id);

        $attempts = $session->attempts;
        $correct = $attempts->where('is_correct', true)->count();
        $incorrect = $attempts->where('is_correct', false)->count();
        $unanswered = max(0, $session->total_questions - $attempts->count());

        $questionIds = $attempts->pluck('question_id')->filter();
        $questions = Question::whereIn('id', $questionIds)
            ->with(['subject', 'topic', 'options'])
            ->get();

        // Subject-by-subject breakdown
        $subjectBreakdown = [];
        $pathway = ExamPathway::tryFrom($session->exam_pathway) ?? ExamPathway::INI_CET;
        $penaltyRate = $pathway->penaltyPerIncorrect();

        foreach ($questions->groupBy('subject_id') as $subjId => $qGroup) {
            $subjName = $qGroup->first()->subject?->name ?? 'Clinical Discipline';
            $subjQIds = $qGroup->pluck('id');
            $subjAttempts = $attempts->whereIn('question_id', $subjQIds)->whereNotNull('selected_option');

            $sCorrect = $subjAttempts->where('is_correct', true)->count();
            $sIncorrect = $subjAttempts->where('is_correct', false)->count();
            $sUnanswered = max(0, $qGroup->count() - $subjAttempts->count());
            $sPenalty = round($sIncorrect * $penaltyRate, 2);
            $sNetScore = round($sCorrect - $sPenalty, 2);
            $sAccuracy = $subjAttempts->count() > 0 ? round(($sCorrect / $subjAttempts->count()) * 100, 1) : 0;

            $subjectBreakdown[] = [
                'subject_id' => $subjId,
                'name' => $subjName,
                'total' => $qGroup->count(),
                'correct' => $sCorrect,
                'incorrect' => $sIncorrect,
                'unanswered' => $sUnanswered,
                'penalty_lost' => $sPenalty,
                'net_score' => $sNetScore,
                'accuracy' => $sAccuracy,
            ];
        }

        $rankPredictor = app(NationalRankPredictor::class);
        $mockScorePercentage = $session->total_questions > 0
            ? max(0, ($session->score_obtained / $session->total_questions) * 100)
            : 0;
        $rankPrediction = $rankPredictor->predict($user, (float) $mockScorePercentage);

        return Inertia::render('mock-exam/result', [
            'user' => $user,
            'session' => new TestSessionResource($session),
            'questions' => QuestionResource::collection($questions),
            'subjectBreakdown' => $subjectBreakdown,
            'rankPrediction' => $rankPrediction,
            'stats' => [
                'score' => (float) $session->score_obtained,
                'total' => $session->total_questions,
                'correct' => $correct,
                'incorrect' => $incorrect,
                'unanswered' => $unanswered,
                'accuracy' => $attempts->count() > 0 ? round(($correct / $attempts->count()) * 100, 1) : 0,
                'timeSpentMinutes' => round($session->time_spent_seconds / 60, 1),
                'penaltyRate' => $penaltyRate,
            ],
        ]);
    }
}
