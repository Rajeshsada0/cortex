<?php

namespace App\Http\Controllers\Web;

use App\Domain\Analytics\PerformanceQuadrantService;
use App\Domain\TestSession\TestSessionService;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\QuestionResource;
use App\Http\Resources\V1\TestSessionResource;
use App\Models\Question;
use App\Models\Subject;
use App\Models\TestSession;
use App\Models\User;
use App\Models\UserNoteBookmark;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QBankWebController extends Controller
{
    public function __construct(
        private readonly TestSessionService $testSessionService,
        private readonly PerformanceQuadrantService $performanceQuadrantService,
    ) {}

    /**
     * Q-Bank Index / Test Builder
     */
    public function index(Request $request): Response
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $pathway = $user->active_pathway ?? 'INI_CET';

        $baseQuery = Question::where('is_active', true)->forExam($pathway);

        $totalPathwayQuestions = (clone $baseQuery)->count();
        $unusedQuestions = (clone $baseQuery)->status($user, 'UNUSED')->count();
        $incorrectQuestions = (clone $baseQuery)->status($user, 'INCORRECT')->count();
        $bookmarkedQuestions = (clone $baseQuery)->status($user, 'BOOKMARKED')->count();
        $hazardousQuestions = (clone $baseQuery)->status($user, 'HAZARDOUS')->count();
        $unstableQuestions = (clone $baseQuery)->status($user, 'UNSTABLE')->count();

        $subjects = Subject::with(['topics' => function ($q) {
            $q->orderBy('high_yield_priority', 'desc');
        }])
            ->withCount(['questions' => function ($q) use ($pathway) {
                $q->where('is_active', true)->forExam($pathway);
            }])
            ->orderBy('order_index')
            ->get();

        return Inertia::render('qbank/index', [
            'user' => $user,
            'subjects' => $subjects,
            'activePathway' => $pathway,
            'counts' => [
                'total' => $totalPathwayQuestions,
                'unused' => $unusedQuestions,
                'incorrect' => $incorrectQuestions,
                'bookmarked' => $bookmarkedQuestions,
                'hazardous' => $hazardousQuestions,
                'unstable' => $unstableQuestions,
            ],
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
            $mode = strtoupper((string) $request->query('mode', 'TUTOR'));
            if (! in_array($mode, ['TUTOR', 'TIMED'])) {
                $mode = 'TUTOR';
            }

            $sessionType = $mode === 'TIMED' ? 'TIMED_BLOCK' : 'PRACTICE';
            $pathway = $request->query('pathway', $user->active_pathway ?? 'INI_CET');
            $status = $request->query('status', 'ALL');
            $quadrant = $request->query('quadrant');
            $difficulty = $request->query('difficulty', 'ALL');
            $limit = max(1, min(100, (int) $request->query('limit', 10)));

            $questionIds = null;
            $singleQuestionId = $request->query('question_id');
            if ($singleQuestionId) {
                $questionIds = [(string) $singleQuestionId];
                $limit = 1;
            } elseif ($rawQuestionIds = $request->query('question_ids')) {
                $questionIds = is_array($rawQuestionIds) ? $rawQuestionIds : explode(',', (string) $rawQuestionIds);
                $limit = count($questionIds);
            } elseif ($quadrant) {
                $status = strtoupper((string) $quadrant);
                $questionIds = $this->performanceQuadrantService->getQuadrantQuestionIds($user, $quadrant);
            }

            $rawSubjects = $request->query('subject_ids', $request->query('subject_id'));
            $subjectIds = null;
            if ($rawSubjects) {
                $subjectIds = is_array($rawSubjects)
                    ? array_map('intval', $rawSubjects)
                    : array_map('intval', explode(',', (string) $rawSubjects));
            }

            $rawTopics = $request->query('topic_ids', $request->query('topic_id'));
            $topicIds = null;
            if ($rawTopics) {
                $topicIds = is_array($rawTopics)
                    ? array_map('intval', $rawTopics)
                    : array_map('intval', explode(',', (string) $rawTopics));
            }

            $title = match (strtoupper((string) ($quadrant ?? ''))) {
                'HAZARDOUS' => 'Hazardous Blind Spot Remediation ('.$pathway.')',
                'UNSTABLE', 'LUCKY_GUESS' => 'Lucky Guess & Unstable Remediation ('.$pathway.')',
                'GAP' => 'Knowledge Gap Remediation ('.$pathway.')',
                'MASTERED' => 'Mastered Concepts Revision ('.$pathway.')',
                default => strtoupper((string) $status) === 'BOOKMARKED'
                    ? 'Bookmarked Clinical Vignettes Practice ('.$pathway.')'
                    : ($singleQuestionId
                        ? 'Targeted Clinical Vignette Review ('.$pathway.')'
                        : ($mode === 'TIMED' ? 'Timed Exam Block' : 'Interactive Tutor Session').' ('.$pathway.')'),
            };

            $result = $this->testSessionService->createSession(
                user: $user,
                title: $title,
                sessionType: $sessionType,
                examPathway: $pathway,
                subjectId: $subjectIds,
                topicId: $topicIds,
                difficulty: $difficulty !== 'ALL' ? $difficulty : null,
                limit: $limit,
                status: $questionIds !== null ? null : $status,
                questionIds: $questionIds
            );

            $session = $result['session'];
            $questions = $result['questions'];
        }

        $questionIdsList = $questions->pluck('id')->filter()->toArray();

        $bookmarkedQuestionIds = UserNoteBookmark::where('user_id', $user?->id ?? 0)
            ->where('is_bookmarked', true)
            ->whereIn('question_id', $questionIdsList)
            ->pluck('question_id')
            ->toArray();

        $notesMap = UserNoteBookmark::where('user_id', $user?->id ?? 0)
            ->whereNotNull('note_content')
            ->where('note_content', '!=', '')
            ->whereIn('question_id', $questionIdsList)
            ->pluck('note_content', 'question_id')
            ->toArray();

        return Inertia::render('qbank/runner', [
            'user' => $user,
            'session' => new TestSessionResource($session),
            'questions' => QuestionResource::collection($questions),
            'attempts' => $session->attempts ?? [],
            'bookmarked_question_ids' => $bookmarkedQuestionIds,
            'notes_map' => $notesMap,
            'mode' => $session->session_type === 'TIMED_BLOCK' ? 'TIMED' : 'TUTOR',
        ]);
    }
}
