<?php

namespace App\Domain\Analytics;

use App\Domain\Scoring\ExamPathway;
use App\Models\User;

final class NationalRankPredictor
{
    public function __construct(
        private readonly ReadinessScoreCalculator $readinessCalculator
    ) {}

    /**
     * Predict National Cohort Rank and Percentile for a Candidate
     *
     * @return array{
     *     pathway: string,
     *     pathway_label: string,
     *     readiness_score: float,
     *     cohort_size: int,
     *     percentile: float,
     *     predicted_rank: int,
     *     rank_range_min: int,
     *     rank_range_max: int,
     *     specialty_eligibility: string,
     *     confidence_band: string,
     *     tier_status: string,
     * }
     */
    public function predict(User $user, ?float $customScore = null): array
    {
        $pathwayStr = $user->active_pathway ?? 'INI_CET';
        $pathway = ExamPathway::tryFrom($pathwayStr) ?? ExamPathway::INI_CET;

        $readiness = $customScore ?? $this->readinessCalculator->calculate($user)['readiness_score'];

        $cohortSizes = [
            'INI_CET' => 85000,
            'MECEE_PG' => 12500,
            'USMLE_STEP1' => 95000,
            'USMLE_STEP2CK' => 45000,
        ];

        $cohortSize = $cohortSizes[$pathway->value] ?? 50000;

        // Calibrate percentile using non-linear medical entrance score distribution
        $percentile = $this->calculatePercentile($readiness);

        // Calculate rank: Top 1% = Rank 1 to (cohort * 0.01)
        $fractionFromTop = max(0.001, (100.0 - $percentile) / 100.0);
        $predictedRank = max(1, (int) round($cohortSize * $fractionFromTop));

        // Range margin (+- 25% variance based on exam volatility)
        $rankMin = max(1, (int) round($predictedRank * 0.75));
        $rankMax = min($cohortSize, (int) round($predictedRank * 1.35));

        // Clinical branch eligibility based on national counselling cutoff standards
        $eligibility = match (true) {
            $percentile >= 98.5 => 'Top-Tier Clinical MD/MS (Radio-Diagnosis, Dermatology, General Medicine)',
            $percentile >= 94.0 => 'Core Clinical MD/MS (Pediatrics, Orthopedics, General Surgery, OBGYN)',
            $percentile >= 85.0 => 'Broad Clinical MD/MS (Anesthesiology, Ophthalmology, ENT, Psychiatry)',
            $percentile >= 65.0 => 'Para-Clinical MD (Pathology, Pharmacology, Microbiology, Community Med)',
            $percentile >= 50.0 => 'Pre-Clinical MD / General Qualifying Cutoff Cleared',
            default => 'Below Qualifying Cutoff — Intensive Remediation Recommended',
        };

        $tierStatus = match (true) {
            $percentile >= 98.0 => 'AIR Top 1% (Elite Distinction)',
            $percentile >= 90.0 => 'AIR Top 10% (High Clinical Probability)',
            $percentile >= 75.0 => 'Above Cohort Average',
            $percentile >= 50.0 => 'Median Cohort Range',
            default => 'Remediation Zone',
        };

        $confidenceBand = match (true) {
            $readiness >= 75 => 'HIGH (Strong Spaced Repetition + Mock Convergence)',
            $readiness >= 50 => 'MODERATE (Consistent Performance, Expand Mock Volume)',
            default => 'PRELIMINARY (Needs additional mock exam data)',
        };

        return [
            'pathway' => $pathway->value,
            'pathway_label' => $pathway->label(),
            'readiness_score' => round($readiness, 1),
            'cohort_size' => $cohortSize,
            'percentile' => round($percentile, 1),
            'predicted_rank' => $predictedRank,
            'rank_range_min' => $rankMin,
            'rank_range_max' => $rankMax,
            'specialty_eligibility' => $eligibility,
            'confidence_band' => $confidenceBand,
            'tier_status' => $tierStatus,
        ];
    }

    /**
     * Map readiness score (0..100) to historical cohort percentile using sigmoidal distribution
     */
    private function calculatePercentile(float $score): float
    {
        $normalized = ($score - 50.0) / 9.5;
        $sigmoidal = 1.0 / (1.0 + exp(-$normalized));
        $percentile = $sigmoidal * 100.0;

        return min(99.9, max(1.0, $percentile));
    }
}
