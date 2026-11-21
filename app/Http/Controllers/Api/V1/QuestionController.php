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

        $supportedYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];
        $yearsData = [];

        foreach ($supportedYears as $yr) {
            $count = (clone $baseQuery)->where(function ($q) use ($yr) {
                $q->where('past_year', 'LIKE', "%{$yr}%")
                    ->orWhere('stem', 'LIKE', "%{$yr}%");
            })->count();

            $badge = match ($yr) {
                '2026' => 'LATEST',
                '2025' => 'RECENT',
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

        $totalHyq = Question::where('is_active', true)
            ->forExam($pathway)
            ->where(function ($q) {
                $q->where('is_high_yield', true)
                    ->orWhereHas('topic', fn ($t) => $t->where('high_yield_priority', '>=', 3));
            })
            ->count();

        $subjects = \App\Models\Subject::with(['topics' => function ($q) use ($pathway) {
            $q->withCount(['questions' => function ($sq) use ($pathway) {
                $sq->where('is_active', true)->forExam($pathway)->where(function ($ssq) {
                    $ssq->where('is_high_yield', true)
                        ->orWhereHas('topic', fn ($t) => $t->where('high_yield_priority', '>=', 3));
                });
            }])
            ->having('questions_count', '>', 0)
            ->orderBy('high_yield_priority', 'desc');
        }])
        ->withCount(['questions' => function ($q) use ($pathway) {
            $q->where('is_active', true)->forExam($pathway)->where(function ($sq) {
                $sq->where('is_high_yield', true)
                    ->orWhereHas('topic', fn ($t) => $t->where('high_yield_priority', '>=', 3));
            });
        }])
        ->having('questions_count', '>', 0)
        ->orderBy('order_index')
        ->get()
        ->map(function ($subject) {
            return [
                'id' => $subject->id,
                'name' => $subject->name,
                'slug' => $subject->slug,
                'questions_count' => $subject->questions_count,
                'topics' => $subject->topics->map(function ($topic) {
                    return [
                        'id' => $topic->id,
                        'name' => $topic->name,
                        'slug' => $topic->slug,
                        'high_yield_priority' => $topic->high_yield_priority,
                        'questions_count' => $topic->questions_count,
                    ];
                }),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'total_hy_count' => $totalHyq,
                'pathway' => $pathway,
                'subjects' => $subjects,
            ],
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
