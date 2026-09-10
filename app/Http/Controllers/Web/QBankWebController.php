<?php

namespace App\Http\Controllers\Web;

use App\Domain\Scoring\ExamPathway;
use App\Domain\TestSession\TestSessionService;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\QuestionResource;
use App\Http\Resources\V1\TestSessionResource;
use App\Models\Question;
use App\Models\Subject;
use App\Models\TestSession;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QBankWebController extends Controller
{
    public function __construct(
        private readonly TestSessionService $testSessionService,
    ) {}

    /**
     * Q-Bank Index / Test Builder
     */
    public function index(Request $request): Response
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $subjects = Subject::with('topics')->orderBy('order_index')->get();

        return Inertia::render('qbank/index', [
            'user' => $user,
            'subjects' => $subjects,
            'activePathway' => $user->active_pathway,
            'totalQuestions' => Question::count(),
        ]);
    }

    /**
     * Interactive MCQ Runner Page
     */
    public function runner(Request $request): Response
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $sessionId = $request->query('session_id');

        if ($sessionId) {
            $session = TestSession::with(['attempts'])->findOrFail($sessionId);
            $questions = Question::where('is_active', true)
                ->forExam($session->exam_pathway)
                ->with(['subject', 'topic', 'subtopic', 'options', 'relevantExams'])
                ->limit($session->total_questions)
                ->get();
        } else {
            // Create a quick practice session if none provided
            $result = $this->testSessionService->createSession(
                user: $user,
                title: 'High-Yield Clinical Practice Block',
                sessionType: 'PRACTICE',
                examPathway: $request->query('pathway', $user->active_pathway),
                subjectId: $request->query('subject_id') ? (int) $request->query('subject_id') : null,
                topicId: $request->query('topic_id') ? (int) $request->query('topic_id') : null,
                difficulty: $request->query('difficulty'),
                limit: 10
            );
            $session = $result['session'];
            $questions = $result['questions'];
        }

        return Inertia::render('qbank/runner', [
            'user' => $user,
            'session' => new TestSessionResource($session),
            'questions' => QuestionResource::collection($questions),
            'attempts' => $session->attempts ?? [],
        ]);
    }
}
