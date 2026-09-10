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
            ->status($user, $request->query('status'));

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
