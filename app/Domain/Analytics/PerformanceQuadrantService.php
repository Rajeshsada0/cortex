<?php

namespace App\Domain\Analytics;

use App\Models\QuestionAttempt;
use App\Models\User;

final class PerformanceQuadrantService
{
    /**
     * Categorize user attempts into 4 Performance vs Confidence quadrants
     */
    public function getQuadrantBreakdown(User $user): array
    {
        $attempts = QuestionAttempt::where('user_id', $user->id)
            ->with(['question.subject', 'question.topic'])
            ->latest('id')
            ->limit(200)
            ->get();

        $total = $attempts->count();

        $mastered = [];
        $hazardous = [];
        $unstable = [];
        $gap = [];

        foreach ($attempts as $attempt) {
            $isHighConfidence = strtoupper($attempt->confidence) === 'HIGH';
            $isCorrect = (bool) $attempt->is_correct;

            if ($isCorrect && $isHighConfidence) {
                $mastered[] = $attempt;
            } elseif (! $isCorrect && $isHighConfidence) {
                // Hazardous Blind Spot: confident but wrong - high negative marking risk!
                $hazardous[] = $attempt;
            } elseif ($isCorrect && ! $isHighConfidence) {
                // Lucky Guess / Unstable Knowledge
                $unstable[] = $attempt;
            } else {
                // Recognized Gap: unsure and incorrect
                $gap[] = $attempt;
            }
        }

        $calcPct = fn (int $count) => $total > 0 ? round(($count / $total) * 100, 1) : 0.0;

        return [
            'total_analyzed' => $total,
            'quadrants' => [
                'mastered' => [
                    'title' => 'Mastered',
                    'subtitle' => 'High Accuracy + High Confidence',
                    'count' => count($mastered),
                    'percentage' => $calcPct(count($mastered)),
                    'status' => 'excellent',
                    'color' => '#2FB36F',
                    'description' => 'Solidified medical knowledge ready for the real exam.',
                ],
                'hazardous' => [
                    'title' => 'Hazardous Blind Spot',
                    'subtitle' => 'Incorrect + High Confidence',
                    'count' => count($hazardous),
                    'percentage' => $calcPct(count($hazardous)),
                    'status' => 'critical',
                    'color' => '#E05252',
                    'description' => 'Dangerous misconceptions that cause severe negative marking penalties.',
                ],
                'unstable' => [
                    'title' => 'Unstable / Lucky Guess',
                    'subtitle' => 'Correct + Low/Med Confidence',
                    'count' => count($unstable),
                    'percentage' => $calcPct(count($unstable)),
                    'status' => 'warning',
                    'color' => '#F59E0B',
                    'description' => 'Correctly guessed or intuitive recall that needs spaced repetition consolidation.',
                ],
                'gap' => [
                    'title' => 'Recognized Knowledge Gap',
                    'subtitle' => 'Incorrect + Low/Med Confidence',
                    'count' => count($gap),
                    'percentage' => $calcPct(count($gap)),
                    'status' => 'info',
                    'color' => '#52606D',
                    'description' => 'Identified weak areas requiring targeted study in the 19-subject directory.',
                ],
            ],
            'answer_switching' => [
                'total_switched' => $attempts->where('was_switched', true)->count(),
                'switched_to_incorrect' => $attempts->where('was_switched', true)->where('is_correct', false)->count(),
                'switched_to_correct' => $attempts->where('was_switched', true)->where('is_correct', true)->count(),
            ],
        ];
    }

    /**
     * Get unique question IDs for a specific quadrant from the user's recent attempts
     *
     * @return array<int>
     */
    public function getQuadrantQuestionIds(User $user, string $quadrant): array
    {
        $targetQuadrant = strtolower(trim($quadrant));
        $attempts = QuestionAttempt::where('user_id', $user->id)
            ->latest('id')
            ->limit(200)
            ->get();

        $questionIds = [];
        foreach ($attempts as $attempt) {
            $isHighConfidence = strtoupper((string) $attempt->confidence) === 'HIGH';
            $isCorrect = (bool) $attempt->is_correct;

            $matches = match ($targetQuadrant) {
                'hazardous' => (! $isCorrect && $isHighConfidence),
                'unstable', 'lucky_guess' => ($isCorrect && ! $isHighConfidence),
                'gap' => (! $isCorrect && ! $isHighConfidence),
                'mastered' => ($isCorrect && $isHighConfidence),
                default => false,
            };

            if ($matches && $attempt->question_id) {
                $questionIds[] = $attempt->question_id;
            }
        }

        return array_values(array_unique($questionIds));
    }
}
