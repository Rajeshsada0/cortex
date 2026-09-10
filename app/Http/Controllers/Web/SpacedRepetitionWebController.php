<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\QuestionResource;
use App\Models\SpacedRepetitionQueue;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SpacedRepetitionWebController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $queue = SpacedRepetitionQueue::where('user_id', $user->id)
            ->with(['question.subject', 'question.topic', 'question.options'])
            ->orderBy('next_review_due')
            ->get();

        $dueCards = $queue->filter(fn ($item) => ! $item->next_review_due || $item->next_review_due <= now())->values();

        return Inertia::render('spaced-repetition/index', [
            'user' => $user,
            'totalInQueue' => $queue->count(),
            'dueCount' => $dueCards->count(),
            'dueCards' => $dueCards->map(fn ($item) => [
                'id' => $item->id,
                'repetition_stage' => $item->repetition_stage,
                'interval_days' => $item->interval_days,
                'consecutive_correct' => $item->consecutive_correct,
                'next_review_due' => $item->next_review_due?->toIso8601String(),
                'question' => new QuestionResource($item->question),
            ]),
            'stageCounts' => [
                0 => $queue->where('repetition_stage', 0)->count(),
                1 => $queue->where('repetition_stage', 1)->count(),
                2 => $queue->where('repetition_stage', 2)->count(),
                3 => $queue->where('repetition_stage', 3)->count(),
                4 => $queue->where('repetition_stage', '>=', 4)->count(),
            ],
        ]);
    }
}
