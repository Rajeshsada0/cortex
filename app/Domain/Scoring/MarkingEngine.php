<?php

namespace App\Domain\Scoring;

final class MarkingEngine
{
    /**
     * Calculate score based on pathway rules
     */
    public function score(ExamPathway|string $pathway, int $correct, int $incorrect, int $total): float
    {
        $enumPathway = is_string($pathway) ? ExamPathway::tryFrom($pathway) ?? ExamPathway::INI_CET : $pathway;

        return match ($enumPathway) {
            ExamPathway::MECEE_PG => round($correct - (0.25 * $incorrect), 2),
            ExamPathway::INI_CET => round($correct - (0.33 * $incorrect), 2),
            ExamPathway::USMLE_STEP1 => $total > 0 ? round(($correct / $total) * 100, 1) : 0.0,
            ExamPathway::USMLE_STEP2CK => $this->calculateUsmleStep2CkScore($correct, $total),
            ExamPathway::COMBINED => round($correct - (0.25 * $incorrect), 2),
        };
    }

    /**
     * Scaled 3-digit score for USMLE Step 2 CK (range ~ 1-300, pass ~ 214)
     */
    private function calculateUsmleStep2CkScore(int $correct, int $total): float
    {
        if ($total <= 0) {
            return 0.0;
        }

        $percentage = ($correct / $total) * 100;
        // Standard USMLE 3-digit conversion: 0% -> 120, 60% -> 214 (passing), 100% -> 285+
        $scaled = 120 + ($percentage * 1.65);

        return round(min(300, max(1, $scaled)), 0);
    }
}
