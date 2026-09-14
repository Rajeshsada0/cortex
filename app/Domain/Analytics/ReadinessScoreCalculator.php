<?php

namespace App\Domain\Analytics;

use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\SpacedRepetitionQueue;
use App\Models\Subject;
use App\Models\TestSession;
use App\Models\User;
use Illuminate\Support\Carbon;

final class ReadinessScoreCalculator
{
    /**
     * Calculate Cortex Readiness Score (0 - 100) and component metrics
     * Formula: Readiness = 0.35 * A_recent + 0.20 * V_coverage + 0.20 * M_mock + 0.15 * R_spaced - 0.10 * S_stability
     */
    public function calculate(User $user): array
    {
        $recentAccuracy = $this->recentAccuracy($user);          // 0..1
        $curriculumCoverage = $this->curriculumCoverage($user);  // 0..1
        $mockPercentile = $this->averageMockPercentile($user);   // 0..1
        $srsClearanceRate = $this->srsClearanceRate($user);      // 0..1
        $stabilityPenalty = $this->stabilityPenalty($user);      // 0..1

        $rawScore = (0.35 * $recentAccuracy)
            + (0.20 * $curriculumCoverage)
            + (0.20 * $mockPercentile)
            + (0.15 * $srsClearanceRate)
            - (0.10 * $stabilityPenalty);

        $readinessScore = round(max(0, min(100, $rawScore * 100)), 1);

        return [
            'readiness_score' => $readinessScore,
            'components' => [
                'recent_accuracy' => round($recentAccuracy * 100, 1),
                'curriculum_coverage' => round($curriculumCoverage * 100, 1),
                'mock_performance' => round($mockPercentile * 100, 1),
                'srs_clearance_rate' => round($srsClearanceRate * 100, 1),
                'stability_penalty' => round($stabilityPenalty * 100, 1),
            ],
            'weights' => [
                'recent_accuracy' => 0.35,
                'curriculum_coverage' => 0.20,
                'mock_performance' => 0.20,
                'srs_clearance' => 0.15,
                'stability_penalty' => 0.10,
            ],
        ];
    }

    /**
     * Accuracy across the last 500 attempts (or all available attempts)
     */
    public function recentAccuracy(User $user): float
    {
        $attempts = QuestionAttempt::where('user_id', $user->id)
            ->latest('id')
            ->limit(500)
            ->get();

        if ($attempts->isEmpty()) {
            return 0.50; // Neutral baseline for new user
        }

        $correct = $attempts->where('is_correct', true)->count();

        return $correct / $attempts->count();
    }

    /**
     * Curriculum coverage across the 19 medical subjects
     */
    public function curriculumCoverage(User $user): float
    {
        $totalSubjects = Subject::count();
        if ($totalSubjects === 0) {
            return 0.20;
        }

        $pathway = $user->active_pathway ?? 'INI_CET';

        $coveredSubjects = QuestionAttempt::where('user_id', $user->id)
            ->whereHas('question', fn ($q) => $q->where('is_active', true)->forExam($pathway))
            ->join('questions', 'question_attempts.question_id', '=', 'questions.id')
            ->distinct('questions.subject_id')
            ->count('questions.subject_id');

        $totalQuestions = Question::where('is_active', true)->forExam($pathway)->count();
        $attemptedQuestions = QuestionAttempt::where('user_id', $user->id)
            ->whereHas('question', fn ($q) => $q->where('is_active', true)->forExam($pathway))
            ->distinct('question_id')
            ->count('question_id');

        $subjectRatio = $totalSubjects > 0 ? ($coveredSubjects / $totalSubjects) : 0;
        $questionRatio = $totalQuestions > 0 ? ($attemptedQuestions / $totalQuestions) : 0;

        return min(1.0, (0.6 * $subjectRatio) + (0.4 * $questionRatio));
    }

    /**
     * Normalized mock exam performance (last 3 grand mocks)
     */
    public function averageMockPercentile(User $user): float
    {
        $mocks = TestSession::where('user_id', $user->id)
            ->where('session_type', 'GRAND_MOCK')
            ->where('is_completed', true)
            ->latest('completed_at')
            ->limit(3)
            ->get();

        if ($mocks->isEmpty()) {
            // Fallback to regular sessions if grand mocks haven't been completed yet
            $anySession = TestSession::where('user_id', $user->id)
                ->where('is_completed', true)
                ->latest('completed_at')
                ->limit(3)
                ->get();

            if ($anySession->isEmpty()) {
                return 0.50; // Neutral prior
            }
            $mocks = $anySession;
        }

        $avgScore = $mocks->avg(function ($session) {
            return $session->total_questions > 0
                ? max(0, $session->score_obtained / $session->total_questions)
                : 0.5;
        });

        return min(1.0, max(0.0, (float) $avgScore));
    }

    /**
     * SRS clearance rate: percentage of due items cleared on time
     */
    public function srsClearanceRate(User $user): float
    {
        $totalSrs = SpacedRepetitionQueue::where('user_id', $user->id)->count();
        if ($totalSrs === 0) {
            return 0.70; // Baseline before items added
        }

        $overdueCount = SpacedRepetitionQueue::where('user_id', $user->id)
            ->where('next_review_due', '<', Carbon::now())
            ->count();

        $cleared = max(0, $totalSrs - $overdueCount);

        return $cleared / $totalSrs;
    }

    /**
     * Stability penalty for volatility and harmful answer-switching
     */
    public function stabilityPenalty(User $user): float
    {
        $attempts = QuestionAttempt::where('user_id', $user->id)->get();
        if ($attempts->isEmpty()) {
            return 0.10;
        }

        $switchedAttempts = $attempts->where('was_switched', true);
        if ($switchedAttempts->isEmpty()) {
            return 0.05;
        }

        // Specifically penalize switching from what would have been correct to incorrect
        $harmfulSwitches = $switchedAttempts->where('is_correct', false)->count();

        return min(1.0, ($harmfulSwitches / $attempts->count()) * 3.0);
    }
}
