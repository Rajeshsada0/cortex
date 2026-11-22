<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\QuestionResource;
use App\Models\Question;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    /**
     * Query Question Bank with multi-criteria filters and pagination
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $query = Question::query()
            ->where('is_active', true)
            ->with(['subject', 'topic', 'subtopic', 'options', 'relevantExams'])
            ->forExam($request->query('exam', $user?->active_pathway ?? 'INI_CET'))
            ->inSubject($request->query('subject_id'))
            ->inTopic($request->query('topic_id'))
            ->difficulty($request->query('difficulty'))
            ->status($user, $request->query('status'))
            ->when($request->query('past_year') ?: $request->query('year'), function ($q, $y) {
                $cleanYear = trim((string) $y);
                $q->where(function ($sq) use ($cleanYear) {
                    $sq->where('past_year', 'LIKE', "%{$cleanYear}%")
                        ->orWhere('stem', 'LIKE', "%{$cleanYear}%");
                });
            })
            ->when($request->boolean('is_past_year') || $request->query('filter') === 'past_year', fn ($q) => $q->where('is_past_year', true))
            ->when($request->boolean('is_high_yield') || $request->query('filter') === 'high_yield', fn ($q) => $q->where('is_high_yield', true));

        $perPage = min(50, max(5, (int) $request->query('per_page', 15)));
        $questions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => QuestionResource::collection($questions),
            'meta' => [
                'current_page' => $questions->currentPage(),
                'last_page' => $questions->lastPage(),
                'per_page' => $questions->perPage(),
                'total' => $questions->total(),
            ],
        ]);
    }

    /**
     * Get list of available past exam years with counts and metadata
     */
    public function pastYears(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $pathway = $request->query('exam', $user?->active_pathway ?? 'INI_CET');

        $baseQuery = Question::query()
            ->where('is_active', true)
            ->forExam($pathway);

        $totalPyq = (clone $baseQuery)->where(function ($q) {
            $q->where('is_past_year', true)->orWhereNotNull('past_year');
        })->count();

        $candidateYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

        // Dynamically discover all authentic 4-digit years actually present in the questions table
        $dbYears = (clone $baseQuery)
            ->whereNotNull('past_year')
            ->pluck('past_year')
            ->map(function ($val) {
                if (preg_match('/\b(20\d\d|19\d\d)\b/', (string) $val, $matches)) {
                    return $matches[1];
                }
                return null;
            })
            ->filter()
            ->unique()
            ->toArray();

        $allYears = array_values(array_unique(array_merge($candidateYears, $dbYears)));
        rsort($allYears); // Sort descending

        $yearsData = [];
        $isLatestAssigned = false;

        foreach ($allYears as $yr) {
            $count = (clone $baseQuery)->where(function ($q) use ($yr) {
                $q->where('past_year', 'LIKE', "%{$yr}%")
                    ->orWhere('stem', 'LIKE', "%{$yr}%");
            })->count();

            // Strictly skip any year with 0 questions (never show fake/empty years)
            if ($count <= 0) {
                continue;
            }

            $badge = null;
            if (! $isLatestAssigned) {
                $badge = 'LATEST';
                $isLatestAssigned = true;
            } elseif ($yr === '2025' || $yr === '2024') {
                $badge = 'HIGH-YIELD';
            }

            $yearsData[] = [
                'year' => (string) $yr,
                'label' => "{$yr} Exam Papers",
                'description' => "Real exam questions & memory recalls from {$yr} board sessions",
                'count' => $count,
                'badge' => $badge,
                'is_featured' => ! empty($badge),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total_pyq_count' => $totalPyq,
                'pathway' => $pathway,
                'years' => $yearsData,
            ],
        ]);
    }

    /**
     * Get 19 medical subjects with high-yield topics and questions count
     */
    public function highYieldTopics(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $pathway = $request->query('exam', $user?->active_pathway ?? 'INI_CET');

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

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get full question details by UUID
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $question = Question::with(['subject', 'topic', 'subtopic', 'options', 'relevantExams'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new QuestionResource($question),
        ]);
    }
}
