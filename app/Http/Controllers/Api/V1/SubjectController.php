<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\SubjectResource;
use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    /**
     * One-click curriculum & directory seeder for development & live deployments
     */
    public function seedCurriculum(): JsonResponse
    {
        try {
            (new \Database\Seeders\CortexCurriculumSeeder())->run();
            (new \Database\Seeders\MedicalDirectorySeeder())->run();

            $subjectCount = Subject::count();
            $topicCount = \App\Models\Topic::count();

            return response()->json([
                'success' => true,
                'message' => 'Medical directory and curriculum synced successfully.',
                'subjects_count' => $subjectCount,
                'topics_count' => $topicCount,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to seed curriculum: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * List all 19 medical subjects with topics and question counts
     */
    public function index(): JsonResponse
    {
        $subjects = Subject::with('topics')->withCount(['topics', 'questions'])->orderBy('order_index')->get();

        return response()->json([
            'success' => true,
            'data' => SubjectResource::collection($subjects),
        ]);
    }

    /**
     * Subject progress and mastery percentages
     */
    public function progress(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $userId = $user?->id ?? 0;

        $attemptsBySubject = QuestionAttempt::where('question_attempts.user_id', $userId)
            ->join('questions', 'questions.id', '=', 'question_attempts.question_id')
            ->where('questions.is_active', true)
            ->groupBy('questions.subject_id')
            ->selectRaw('questions.subject_id, COUNT(DISTINCT question_attempts.question_id) as attempted_questions, SUM(CASE WHEN question_attempts.is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts, COUNT(*) as total_attempts')
            ->get()
            ->keyBy('subject_id');

        $subjects = Subject::withCount(['questions', 'topics'])->orderBy('order_index')->get();

        $progressData = $subjects->map(function ($subject) use ($attemptsBySubject) {
            $totalQuestions = (int) $subject->questions_count;
            $stat = $attemptsBySubject->get($subject->id);
            $attemptedQuestions = (int) ($stat?->attempted_questions ?? 0);
            $correctAttempts = (int) ($stat?->correct_attempts ?? 0);
            $totalAttempts = (int) ($stat?->total_attempts ?? 0);

            $coveragePct = $totalQuestions > 0 ? round(($attemptedQuestions / $totalQuestions) * 100, 1) : 0.0;
            $masteryPct = $totalAttempts > 0 ? round(($correctAttempts / $totalAttempts) * 100, 1) : 0.0;

            return [
                'id' => $subject->id,
                'name' => $subject->name,
                'slug' => $subject->slug,
                'icon_key' => $subject->icon_key,
                'order_index' => $subject->order_index,
                'total_questions' => $totalQuestions,
                'attempted_questions' => $attemptedQuestions,
                'topics_count' => $subject->topics_count,
                'coverage_percentage' => $coveragePct,
                'mastery_percentage' => $masteryPct,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $progressData,
        ]);
    }

    /**
     * 19-Subject Medical Directory with topics, question counts, and coverage
     */
    public function directory(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $pathway = $user?->active_pathway ?? 'INI_CET';
        $userId = $user?->id ?? 0;

        $attemptsQuery = QuestionAttempt::where('question_attempts.user_id', $userId)
            ->join('questions', 'questions.id', '=', 'question_attempts.question_id')
            ->where('questions.is_active', true);

        if ($pathway && $pathway !== 'COMBINED') {
            $attemptsQuery->join('question_exam_relevance', 'question_exam_relevance.question_id', '=', 'questions.id')
                ->whereIn('question_exam_relevance.exam', [$pathway, 'COMBINED']);
        }

        $attemptsBySubject = $attemptsQuery
            ->groupBy('questions.subject_id')
            ->selectRaw('questions.subject_id, COUNT(DISTINCT question_attempts.question_id) as attempted_count, SUM(CASE WHEN question_attempts.is_correct = 1 THEN 1 ELSE 0 END) as correct_count')
            ->get()
            ->keyBy('subject_id');

        $subjects = Subject::with([
                'topics' => function ($q) use ($pathway) {
                    $q->withCount([
                        'questions' => fn ($qq) => $qq->where('is_active', true)->forExam($pathway)
                    ])->with('subtopics');
                }
            ])
            ->withCount([
                'questions' => fn ($q) => $q->where('is_active', true)->forExam($pathway),
                'topics',
            ])
            ->orderBy('order_index')
            ->get()
            ->map(function ($subject) use ($attemptsBySubject) {
                $stat = $attemptsBySubject->get($subject->id);
                $attemptedCount = (int) ($stat?->attempted_count ?? 0);
                $correctCount = (int) ($stat?->correct_count ?? 0);
                $totalQuestions = (int) $subject->questions_count;

                return [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'slug' => $subject->slug,
                    'icon_key' => $subject->icon_key,
                    'order_index' => $subject->order_index,
                    'total_questions' => $totalQuestions,
                    'attempted_count' => $attemptedCount,
                    'topics_count' => $subject->topics_count,
                    'coverage_percentage' => $totalQuestions > 0 ? round(($attemptedCount / $totalQuestions) * 100) : 0,
                    'mastery_percentage' => $attemptedCount > 0 ? round(($correctCount / $attemptedCount) * 100) : 0,
                    'topics' => $subject->topics->map(fn ($topic) => [
                        'id' => $topic->id,
                        'name' => $topic->name,
                        'slug' => $topic->slug,
                        'priority' => $topic->high_yield_priority ?? 1,
                        'subtopics' => $topic->subtopics->pluck('name')->toArray(),
                        'questions_count' => (int) $topic->questions_count,
                    ]),
                ];
            });

        $totalQuestions = $subjects->sum('total_questions');
        $totalTopics = $subjects->sum('topics_count');
        $avgMastery = $subjects->count() > 0 ? round($subjects->avg('mastery_percentage')) : 0;
        $avgCoverage = $subjects->count() > 0 ? round($subjects->avg('coverage_percentage')) : 0;

        return response()->json([
            'success' => true,
            'stats' => [
                'total_subjects' => $subjects->count(),
                'total_questions' => $totalQuestions,
                'total_topics' => $totalTopics,
                'avg_mastery' => $avgMastery,
                'avg_coverage' => $avgCoverage,
            ],
            'data' => $subjects,
        ]);
    }
}
