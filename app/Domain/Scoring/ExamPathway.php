<?php

namespace App\Domain\Scoring;

enum ExamPathway: string
{
    case MECEE_PG = 'MECEE_PG';
    case INI_CET = 'INI_CET';
    case USMLE_STEP1 = 'USMLE_STEP1';
    case USMLE_STEP2CK = 'USMLE_STEP2CK';
    case COMBINED = 'COMBINED';

    public function label(): string
    {
        return match ($this) {
            self::MECEE_PG => 'Nepal: MECEE-PG',
            self::INI_CET => 'India: INI-CET',
            self::USMLE_STEP1 => 'USA: USMLE Step 1',
            self::USMLE_STEP2CK => 'USA: USMLE Step 2 CK',
            self::COMBINED => 'Combined Track (Global)',
        };
    }

    public function targetQuestions(): int
    {
        return match ($this) {
            self::MECEE_PG => 200,
            self::INI_CET => 200,
            self::USMLE_STEP1 => 280,
            self::USMLE_STEP2CK => 318,
            self::COMBINED => 200,
        };
    }

    public function durationMinutes(): int
    {
        return match ($this) {
            self::MECEE_PG => 180,
            self::INI_CET => 180,
            self::USMLE_STEP1 => 420, // 7 blocks x 60 min
            self::USMLE_STEP2CK => 480, // 8 blocks x 60 min
            self::COMBINED => 180,
        };
    }

    public function markingRules(): string
    {
        return match ($this) {
            self::MECEE_PG => '+1.0 Correct / -0.25 Incorrect',
            self::INI_CET => '+1.0 Correct / -0.33 Incorrect',
            self::USMLE_STEP1 => 'Pass / Fail (No negative marking)',
            self::USMLE_STEP2CK => '3-Digit Scaled Score (1-300)',
            self::COMBINED => '+1.0 Correct / -0.25 Incorrect',
        };
    }

    public function penaltyPerIncorrect(): float
    {
        return match ($this) {
            self::MECEE_PG => 0.25,
            self::INI_CET => 0.33,
            self::USMLE_STEP1 => 0.0,
            self::USMLE_STEP2CK => 0.0,
            self::COMBINED => 0.25,
        };
    }

    /**
     * Proportional percentage weights for 19 medical subjects matching national entrance standards.
     *
     * @return array<string, float> [subject_slug => percentage]
     */
    public function blueprintWeights(): array
    {
        return [
            // Pre-Clinical (18%)
            'anatomy' => 6.0,
            'physiology' => 6.0,
            'biochemistry' => 6.0,

            // Para-Clinical (32%)
            'pathology' => 9.0,
            'pharmacology' => 9.0,
            'microbiology' => 6.0,
            'forensic-medicine' => 3.0,
            'community-medicine' => 5.0,

            // Clinical (50%)
            'general-medicine' => 12.0,
            'general-surgery' => 12.0,
            'obstetrics-gynecology' => 10.0,
            'pediatrics' => 6.0,
            'orthopedics' => 3.0,
            'ophthalmology' => 3.0,
            'ent' => 3.0,
            'dermatology' => 2.0,
            'psychiatry' => 2.0,
            'radiology' => 3.0,
            'anesthesiology' => 2.0,
        ];
    }

    /**
     * Compute integer question quota per subject for a mock exam of given size.
     *
     * @return array<string, int>
     */
    public function blueprintQuota(int $total = 200): array
    {
        $weights = $this->blueprintWeights();
        $quota = [];
        $sum = 0;

        foreach ($weights as $slug => $pct) {
            $count = (int) round(($pct / 100.0) * $total);
            if ($total >= count($weights)) {
                $count = max(1, $count);
            }
            $quota[$slug] = $count;
            $sum += $count;
        }

        // Adjust rounding difference on general medicine
        $diff = $total - $sum;
        if ($diff !== 0 && isset($quota['general-medicine'])) {
            $quota['general-medicine'] = max(1, $quota['general-medicine'] + $diff);
        }

        return $quota;
    }
}
