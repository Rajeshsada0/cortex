<?php

namespace App\Http\Controllers\Web;

use App\Domain\Scoring\ExamPathway;
use App\Domain\TestSession\TestSessionService;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\QuestionResource;
use App\Http\Resources\V1\TestSessionResource;
use App\Models\Question;
use App\Models\QuestionAttempt;
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

        $questions = Question::where('is_active', true)
            ->forExam($session->exam_pathway)
            ->with(['subject', 'topic', 'options', 'relevantExams'])
            ->limit($session->total_questions)
            ->get();

        return Inertia::render('mock-exam/hall', [
            'user' => $user,
            'session' => new TestSessionResource($session),
            'questions' => QuestionResource::collection($questions),
            'attempts' => $session->attempts,
        ]);
    }

    /**
     * Start a new Grand Mock session
     */
    public function launch(Request $request)
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $pathway = ExamPathway::tryFrom($request->input('pathway', $user->active_pathway)) ?? ExamPathway::INI_CET;

        $result = $this->testSessionService->createSession(
            user: $user,
            title: "{$pathway->label()} All-India / National Grand Mock",
            sessionType: 'GRAND_MOCK',
            examPathway: $pathway->value,
            limit: 20, // Sample 20 questions for mock run in local demo
            durationMinutes: 45
        );

        return redirect()->route('mock-exam.hall', ['id' => $result['session']->id]);
    }

    /**
     * Exam Result & Negative Marking Breakdown
     */
    public function result(Request $request, string $id): Response
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $session = TestSession::with(['attempts.question.subject', 'attempts.question.options'])->findOrFail($id);

        $attempts = $session->attempts;
        $correct = $attempts->where('is_correct', true)->count();
        $incorrect = $attempts->where('is_correct', false)->count();
        $unanswered = max(0, $session->total_questions - $attempts->count());

        $questions = Question::whereIn('id', $attempts->pluck('question_id'))
            ->with(['subject', 'topic', 'options'])
            ->get();

        return Inertia::render('mock-exam/result', [
            'user' => $user,
            'session' => new TestSessionResource($session),
            'questions' => QuestionResource::collection($questions),
            'stats' => [
                'score' => (float) $session->score_obtained,
                'total' => $session->total_questions,
                'correct' => $correct,
                'incorrect' => $incorrect,
                'unanswered' => $unanswered,
                'accuracy' => $attempts->count() > 0 ? round(($correct / $attempts->count()) * 100, 1) : 0,
                'timeSpentMinutes' => round($session->time_spent_seconds / 60, 1),
            ],
        ]);
    }
}
