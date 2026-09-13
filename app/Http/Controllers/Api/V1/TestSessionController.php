<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\SpacedRepetition\SpacedRepetitionService;
use App\Domain\TestSession\TestSessionService;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\QuestionResource;
use App\Http\Resources\V1\TestSessionResource;
use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\TestSession;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestSessionController extends Controller
{
    public function __construct(
        private readonly TestSessionService $testSessionService,
        private readonly SpacedRepetitionService $spacedRepetitionService,
    ) {}

    /**
     * Start a new test session (Practice, Timed Block, or Grand Mock)
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'session_type' => 'nullable|string|in:PRACTICE,TIMED_BLOCK,GRAND_MOCK',
            'exam_pathway' => 'nullable|string|in:MECEE_PG,INI_CET,NEET_PG,USMLE_STEP1,USMLE_STEP2CK,COMBINED',
            'subject_id' => 'nullable|integer',
            'topic_id' => 'nullable|integer',
            'difficulty' => 'nullable|string|in:EASY,MEDIUM,HARD',
            'limit' => 'nullable|integer|min:1|max:200',
            'duration_minutes' => 'nullable|integer|min:1|max:480',
        ]);

        $result = $this->testSessionService->createSession(
            user: $user,
            title: $validated['title'],
            sessionType: $validated['session_type'] ?? 'PRACTICE',
            examPathway: $validated['exam_pathway'] ?? $user->active_pathway,
            subjectId: $validated['subject_id'] ?? null,
            topicId: $validated['topic_id'] ?? null,
            difficulty: $validated['difficulty'] ?? null,
            limit: $validated['limit'] ?? 20,
            durationMinutes: $validated['duration_minutes'] ?? null
        );

        return response()->json([
            'success' => true,
            'session' => new TestSessionResource($result['session']),
            'questions' => QuestionResource::collection($result['questions']),
        ]);
    }

    /**
     * Get active or completed session details with questions and attempts
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $session = TestSession::with(['attempts.question.options'])->findOrFail($id);

        $attemptedQuestionIds = $session->attempts->pluck('question_id')->toArray();
        $questions = Question::whereIn('id', $attemptedQuestionIds)
            ->orWhere(function ($q) use ($session) {
                // Return questions relevant for the session pathway
                $q->forExam($session->exam_pathway);
            })
            ->limit($session->total_questions)
            ->with(['subject', 'topic', 'options', 'relevantExams'])
            ->get();

        return response()->json([
            'success' => true,
            'session' => new TestSessionResource($session),
            'questions' => QuestionResource::collection($questions),
            'attempts' => $session->attempts,
        ]);
    }

    /**
     * Record an individual question attempt within a session
     */
    public function recordAttempt(Request $request, string $id): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $session = TestSession::findOrFail($id);

        $validated = $request->validate([
            'question_id' => 'required|string',
            'selected_option' => 'required|string|size:1',
            'confidence' => 'required|string|in:LOW,MEDIUM,HIGH',
            'time_taken_seconds' => 'nullable|integer|min:0',
            'was_switched' => 'nullable|boolean',
            'initial_option' => 'nullable|string|size:1',
        ]);

        $question = Question::findOrFail($validated['question_id']);
        $isCorrect = (strtoupper($validated['selected_option']) === strtoupper($question->correct_option));

        $attempt = QuestionAttempt::updateOrCreate(
            [
                'session_id' => $session->id,
                'user_id' => $user->id,
                'question_id' => $question->id,
            ],
            [
                'selected_option' => strtoupper($validated['selected_option']),
                'is_correct' => $isCorrect,
                'confidence' => strtoupper($validated['confidence']),
                'time_taken_seconds' => $validated['time_taken_seconds'] ?? 45,
                'was_switched' => $validated['was_switched'] ?? false,
                'initial_option' => ! empty($validated['initial_option']) ? strtoupper($validated['initial_option']) : null,
            ]
        );

        // Update Spaced Repetition Queue automatically
        $srsItem = $this->spacedRepetitionService->recordAttempt(
            $user,
            $question->id,
            $isCorrect,
            $validated['confidence']
        );

        return response()->json([
            'success' => true,
            'attempt' => $attempt,
            'is_correct' => $isCorrect,
            'correct_option' => $question->correct_option,
            'srs_next_review' => $srsItem->next_review_due?->toIso8601String(),
            'repetition_stage' => $srsItem->repetition_stage,
        ]);
    }

    /**
     * Submit and grade the entire test session
     */
    public function submit(Request $request, string $id): JsonResponse
    {
        $session = TestSession::findOrFail($id);

        $validated = $request->validate([
            'time_spent_seconds' => 'nullable|integer|min:0',
        ]);

        $updatedSession = $this->testSessionService->submitSession(
            $session,
            $validated['time_spent_seconds'] ?? $session->time_spent_seconds
        );

        $attempts = QuestionAttempt::where('session_id', $session->id)->get();
        $correct = $attempts->where('is_correct', true)->count();
        $incorrect = $attempts->where('is_correct', false)->count();
        $unanswered = max(0, $session->total_questions - $attempts->count());

        return response()->json([
            'success' => true,
            'session' => new TestSessionResource($updatedSession),
            'score_breakdown' => [
                'score_obtained' => (float) $updatedSession->score_obtained,
                'total_questions' => $updatedSession->total_questions,
                'correct_count' => $correct,
                'incorrect_count' => $incorrect,
                'unanswered_count' => $unanswered,
                'accuracy_percentage' => $attempts->count() > 0 ? round(($correct / $attempts->count()) * 100, 1) : 0,
                'exam_pathway' => $updatedSession->exam_pathway,
            ],
        ]);
    }
}
