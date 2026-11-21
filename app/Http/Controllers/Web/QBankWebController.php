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
            'totalQuestions' => $totalPathwayQuestions,
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
            $limit = max(1, min(1000, (int) $request->query('limit', 10)));

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

            $pastYearParam = $request->query('year', $request->query('past_year'));
            $isPastYear = $request->boolean('is_past_year') || ! empty($pastYearParam) || in_array(strtolower((string) $request->query('filter')), ['past_year', 'pyq']);
            $isHighYield = $request->boolean('is_high_yield') || in_array(strtolower((string) $request->query('filter')), ['high_yield', 'hyq']);

            $title = match (strtoupper((string) ($quadrant ?? ''))) {
                'HAZARDOUS' => 'Hazardous Blind Spot Remediation ('.$pathway.')',
                'UNSTABLE', 'LUCKY_GUESS' => 'Lucky Guess & Unstable Remediation ('.$pathway.')',
                'GAP' => 'Knowledge Gap Remediation ('.$pathway.')',
                'MASTERED' => 'Mastered Concepts Revision ('.$pathway.')',
                default => ! empty($pastYearParam)
                    ? 'Past Year Questions ('.$pastYearParam.') ('.$pathway.')'
                    : ($isPastYear
                        ? 'Past Year Questions (PYQs) ('.$pathway.')'
                        : ($isHighYield
                            ? 'High-Yield Board Questions ('.$pathway.')'
                            : (strtoupper((string) $status) === 'BOOKMARKED'
                                ? 'Bookmarked Clinical Vignettes Practice ('.$pathway.')'
                                : ($singleQuestionId
                                    ? 'Targeted Clinical Vignette Review ('.$pathway.')'
                                    : ($mode === 'TIMED' ? 'Timed Exam Block' : 'Interactive Tutor Session').' ('.$pathway.')')))),
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
                questionIds: $questionIds,
                isPastYear: $isPastYear,
                isHighYield: $isHighYield,
                pastYear: $pastYearParam
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

    /**
     * Past Year Questions Year-Wise Hub
     */
    public function pyq(Request $request): Response
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $pathway = $user->active_pathway ?? 'INI_CET';

        $baseQuery = Question::where('is_active', true)->forExam($pathway);

        $totalPyq = (clone $baseQuery)->where(function ($q) {
            $q->where('is_past_year', true)->orWhereNotNull('past_year');
        })->count();

        $supportedYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];
        $yearsData = [];

        foreach ($supportedYears as $yr) {
            $count = (clone $baseQuery)->where(function ($q) use ($yr) {
                $q->where('past_year', 'LIKE', "%{$yr}%")
                    ->orWhere('stem', 'LIKE', "%{$yr}%");
            })->count();

            $badge = match ($yr) {
                '2026' => 'LATEST 2026',
                '2025' => 'RECENT 2025',
                '2024' => 'HIGH-YIELD',
                default => null,
            };

            $yearsData[] = [
                'year' => $yr,
                'label' => "{$yr} Exam Papers",
                'description' => "Real exam questions & memory recalls from {$yr} board sessions",
                'count' => $count,
                'badge' => $badge,
                'is_featured' => in_array($yr, ['2026', '2025', '2024']),
            ];
        }

        $subjects = Subject::withCount(['questions' => function ($q) use ($pathway) {
            $q->where('is_active', true)->forExam($pathway)->where(function ($sq) {
                $sq->where('is_past_year', true)->orWhereNotNull('past_year');
            });
        }])->orderBy('order_index')->get();

        return Inertia::render('pyq/index', [
            'user' => $user,
            'activePathway' => $pathway,
            'totalPyqCount' => $totalPyq,
            'years' => $yearsData,
            'subjects' => $subjects,
        ]);
    }

    /**
     * High-Yield Questions Topic-Wise Selection Hub
     */
    public function highYield(Request $request): Response
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $pathway = $user->active_pathway ?? 'INI_CET';

        $data = \Illuminate\Support\Facades\Cache::remember("high_yield_topics_{$pathway}", 3600, function () use ($pathway) {
            $hyTopicIds = \Illuminate\Support\Facades\DB::table('topics')
                ->where('high_yield_priority', '>=', 3)
                ->pluck('id')
                ->toArray();

            $topicCounts = \Illuminate\Support\Facades\DB::table('questions')
                ->join('question_exam_relevance', 'questions.id', '=', 'question_exam_relevance.question_id')
                ->where('questions.is_active', true)
                ->where(function ($q) use ($pathway) {
                    $q->where('question_exam_relevance.exam', $pathway)
                      ->orWhere('question_exam_relevance.exam', 'COMBINED');
                })
                ->where(function ($q) use ($hyTopicIds) {
                    $q->where('questions.is_high_yield', true);
                    if (!empty($hyTopicIds)) {
                        $q->orWhereIn('questions.topic_id', $hyTopicIds);
                    }
                })
                ->select('questions.topic_id', \Illuminate\Support\Facades\DB::raw('count(*) as total'))
                ->groupBy('questions.topic_id')
                ->pluck('total', 'topic_id');

            $totalHyq = (int) $topicCounts->sum();

            $topicsBySubject = \Illuminate\Support\Facades\DB::table('topics')
                ->whereIn('id', $topicCounts->keys())
                ->orderBy('high_yield_priority', 'desc')
                ->get()
                ->groupBy('subject_id');

            $subjects = \Illuminate\Support\Facades\DB::table('subjects')
                ->whereIn('id', $topicsBySubject->keys())
                ->orderBy('order_index')
                ->get()
                ->map(function ($subject) use ($topicsBySubject, $topicCounts) {
                    $sTopics = $topicsBySubject->get($subject->id, collect())->map(function ($t) use ($topicCounts) {
                        return [
                            'id' => (int) $t->id,
                            'name' => $t->name,
                            'slug' => $t->slug,
                            'high_yield_priority' => (int) $t->high_yield_priority,
                            'questions_count' => (int) $topicCounts->get($t->id, 0),
                        ];
                    })->values()->toArray();

                    return [
                        'id' => (int) $subject->id,
                        'name' => $subject->name,
                        'slug' => $subject->slug,
                        'questions_count' => (int) array_sum(array_column($sTopics, 'questions_count')),
                        'topics' => $sTopics,
                    ];
                })->values()->toArray();

            return [
                'total_hy_count' => $totalHyq,
                'pathway' => $pathway,
                'subjects' => $subjects,
            ];
        });

        return Inertia::render('high-yield/index', [
            'user' => $user,
            'activePathway' => $pathway,
            'totalHyqCount' => $data['total_hy_count'],
            'subjects' => $data['subjects'],
        ]);
    }
}
