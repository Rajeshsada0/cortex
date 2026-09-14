<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\SpacedRepetition\SpacedRepetitionService;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\QuestionResource;
use App\Models\SpacedRepetitionQueue;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class SpacedRepetitionController extends Controller
{
    public function __construct(
        private readonly SpacedRepetitionService $spacedRepetitionService,
    ) {}

    /**
     * Get spaced repetition queue and due questions
     */
    public function due(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $userId = $user?->id ?? 0;

        $now = Carbon::now();

        $dueQuery = SpacedRepetitionQueue::where('user_id', $userId)
            ->whereHas('question')
            ->where(function ($q) use ($now) {
                $q->whereNull('next_review_due')
                    ->orWhere('next_review_due', '<=', $now);
            })
            ->with(['question.subject', 'question.topic', 'question.options', 'question.relevantExams']);

        $dueItems = $dueQuery->get()->filter(fn ($i) => $i->question)->values();
        $totalInQueue = SpacedRepetitionQueue::where('user_id', $userId)->whereHas('question')->count();

        // Count per stage (0..4)
        $stageCounts = [
            0 => SpacedRepetitionQueue::where('user_id', $userId)->whereHas('question')->where('repetition_stage', 0)->count(),
            1 => SpacedRepetitionQueue::where('user_id', $userId)->whereHas('question')->where('repetition_stage', 1)->count(),
            2 => SpacedRepetitionQueue::where('user_id', $userId)->whereHas('question')->where('repetition_stage', 2)->count(),
            3 => SpacedRepetitionQueue::where('user_id', $userId)->whereHas('question')->where('repetition_stage', 3)->count(),
            4 => SpacedRepetitionQueue::where('user_id', $userId)->whereHas('question')->where('repetition_stage', '>=', 4)->count(),
        ];

        return response()->json([
            'success' => true,
            'summary' => [
                'due_count' => $dueItems->count(),
                'total_in_queue' => $totalInQueue,
                'stage_counts' => $stageCounts,
            ],
            'due_cards' => $dueItems->map(fn ($item) => [
                'id' => $item->id,
                'repetition_stage' => $item->repetition_stage,
                'interval_days' => $item->interval_days,
                'consecutive_correct' => $item->consecutive_correct,
                'next_review_due' => $item->next_review_due?->toIso8601String(),
                'question' => new QuestionResource($item->question),
            ]),
        ]);
    }

    /**
     * Submit a spaced repetition card review
     */
    public function review(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $validated = $request->validate([
            'question_id' => 'required|string',
            'is_correct' => 'required|boolean',
            'confidence' => 'required|string|in:LOW,MEDIUM,HIGH',
        ]);

        $srsItem = $this->spacedRepetitionService->recordAttempt(
            $user,
            $validated['question_id'],
            $validated['is_correct'],
            $validated['confidence']
        );

        return response()->json([
            'success' => true,
            'message' => 'Spaced repetition card updated successfully',
            'data' => [
                'repetition_stage' => $srsItem->repetition_stage,
                'next_review_due' => $srsItem->next_review_due?->toIso8601String(),
                'interval_days' => $srsItem->interval_days,
                'consecutive_correct' => $srsItem->consecutive_correct,
            ],
        ]);
    }
}
