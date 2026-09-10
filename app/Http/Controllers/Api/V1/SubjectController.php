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

        $subjects = Subject::withCount(['questions', 'topics'])->orderBy('order_index')->get();

        $progressData = $subjects->map(function ($subject) use ($userId) {
            $totalQuestions = $subject->questions_count;

            $attempts = QuestionAttempt::where('user_id', $userId)
                ->whereHas('question', fn ($q) => $q->where('subject_id', $subject->id))
                ->get();

            $attemptedQuestions = $attempts->unique('question_id')->count();
            $correctAttempts = $attempts->where('is_correct', true)->count();
            $totalAttempts = $attempts->count();

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
}
