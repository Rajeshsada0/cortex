<?php

namespace App\Domain\SpacedRepetition;

use App\Domain\Scoring\ConfidenceLevel;
use App\Models\SpacedRepetitionQueue;
use App\Models\User;
use Illuminate\Support\Carbon;

final class SpacedRepetitionService
{
    /**
     * Transition logic based on accuracy and user confidence level
     */
    public function transition(bool $isCorrect, ConfidenceLevel|string $confidence, int $currentStage): SrsTransition
    {
        $enumConfidence = is_string($confidence)
            ? ConfidenceLevel::tryFrom($confidence) ?? ConfidenceLevel::HIGH
            : $confidence;

        if (! $isCorrect) {
            return new SrsTransition(
                nextStage: 0,
                nextReviewDue: Carbon::now()->addHours(4),
                intervalDays: 0,
            );
        }

        return match ($enumConfidence) {
            ConfidenceLevel::LOW => new SrsTransition(
                nextStage: 1,
                nextReviewDue: Carbon::now()->addDays(2),
                intervalDays: 2,
            ),
            ConfidenceLevel::MEDIUM => (function () use ($currentStage) {
                $interval = $currentStage === 0 ? 2 : 7;

                return new SrsTransition(
                    nextStage: min($currentStage + 1, 3),
                    nextReviewDue: Carbon::now()->addDays($interval),
                    intervalDays: $interval,
                );
            })(),
            ConfidenceLevel::HIGH => (function () use ($currentStage) {
                $intervals = [0 => 2, 1 => 7, 2 => 21, 3 => 45, 4 => 90];
                $interval = $intervals[$currentStage] ?? 90;

                return new SrsTransition(
                    nextStage: $currentStage + 1,
                    nextReviewDue: Carbon::now()->addDays($interval),
                    intervalDays: $interval,
                );
            })(),
        };
    }

    /**
     * Record an attempt into the Spaced Repetition Queue
     */
    public function recordAttempt(User $user, string $questionId, bool $isCorrect, ConfidenceLevel|string $confidence): SpacedRepetitionQueue
    {
        $currentQueue = SpacedRepetitionQueue::where('user_id', $user->id)
            ->where('question_id', $questionId)
            ->first();

        $currentStage = $currentQueue?->repetition_stage ?? 0;
        $consecutiveCorrect = $isCorrect ? (($currentQueue?->consecutive_correct ?? 0) + 1) : 0;

        $transition = $this->transition($isCorrect, $confidence, $currentStage);

        return SpacedRepetitionQueue::updateOrCreate(
            [
                'user_id' => $user->id,
                'question_id' => $questionId,
            ],
            [
                'repetition_stage' => $transition->nextStage,
                'next_review_due' => $transition->nextReviewDue,
                'interval_days' => $transition->intervalDays,
                'consecutive_correct' => $consecutiveCorrect,
                'ease_factor' => $isCorrect ? 2.50 : max(1.30, ($currentQueue?->ease_factor ?? 2.50) - 0.20),
            ]
        );
    }
}
