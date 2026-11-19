<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Scoring\ExamPathway as ExamPathwayEnum;
use App\Http\Controllers\Controller;
use App\Models\ExamPathway;
use Illuminate\Http\JsonResponse;

class ExamConfigController extends Controller
{
    /**
     * List all active exam pathways
     */
    public function index(): JsonResponse
    {
        $pathways = ExamPathway::where('is_active', true)
            ->orderBy('order_index')
            ->orderBy('id')
            ->get();

        $data = $pathways->map(function ($p) {
            $totalQ = $p->total_questions ?: 200;
            $durationMin = $p->duration_minutes ?: 180;
            $pace = $totalQ > 0 ? (int) round(($durationMin * 60) / $totalQ) : 54;

            $sub = $p->negative_marks > 0
                ? "+{$p->correct_marks} / -{$p->negative_marks} Scheme • {$totalQ} Questions"
                : "Pass / Fail Scheme • {$totalQ} Questions";

            $tag = match (strtoupper($p->code)) {
                'MECEE_PG' => 'National',
                'INI_CET' => 'Clinical',
                'NEET_PG' => 'National',
                'USMLE_STEP1' => 'Licensure',
                'USMLE_STEP2CK' => 'Clinical',
                'COMBINED' => 'Integrated',
                default => $p->region ?: 'Medical',
            };

            return [
                'id' => $p->id,
                'code' => $p->code,
                'name' => $p->name,
                'full_name' => $p->full_name,
                'region' => $p->region,
                'total_questions' => $totalQ,
                'duration_minutes' => $durationMin,
                'pace_seconds_per_question' => $pace,
                'correct_marks' => (float) $p->correct_marks,
                'negative_marks' => (float) $p->negative_marks,
                'scoring_type' => $p->scoring_type,
                'penalty_label' => $p->penalty_label,
                'badge_color' => $p->badge_color,
                'tag' => $tag,
                'sub' => $sub,
                'is_active' => (bool) $p->is_active,
                'is_system' => (bool) $p->is_system,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get exam blueprint, timing constraints, and negative marking rules
     */
    public function show(string $pathway): JsonResponse
    {
        $pathwayUpper = strtoupper($pathway);

        $dbPathway = ExamPathway::where('code', $pathwayUpper)->first();
        $availablePathways = ExamPathway::where('is_active', true)->pluck('code')->toArray();

        if (empty($availablePathways)) {
            $availablePathways = ['MECEE_PG', 'INI_CET', 'USMLE_STEP1', 'USMLE_STEP2CK', 'COMBINED'];
        }

        if ($dbPathway) {
            $totalQ = $dbPathway->total_questions ?? 200;
            $durationMin = $dbPathway->duration_minutes ?? 180;
            $pace = $totalQ > 0 ? (int) round(($durationMin * 60) / $totalQ) : 54;

            $config = [
                'pathway' => $dbPathway->code,
                'name' => $dbPathway->name,
                'subtitle' => $dbPathway->full_name ?? $dbPathway->name,
                'total_questions' => $totalQ,
                'duration_minutes' => $durationMin,
                'pace_seconds_per_question' => $pace,
                'marking_rule' => $dbPathway->correct_marks > 0
                    ? "+{$dbPathway->correct_marks} Correct / -{$dbPathway->negative_marks} Incorrect"
                    : 'Pass / Fail',
                'negative_marking_penalty' => (float) $dbPathway->negative_marks,
                'scoring_type' => $dbPathway->scoring_type ?? 'NEGATIVE_DEDUCTION',
                'blueprint' => $dbPathway->blueprint_weights ?? ['All Subjects' => '100%'],
                'question_format' => 'Single Best Answer (SBA) and integrated clinical vignettes',
                'color' => '#55BDEB',
            ];

            return response()->json([
                'success' => true,
                'config' => $config,
                'available_pathways' => $availablePathways,
            ]);
        }

        $configs = [
            'MECEE_PG' => [
                'pathway' => 'MECEE_PG',
                'name' => 'Nepal: MECEE-PG',
                'subtitle' => 'Medical Education Commission Entrance Examination for MD/MS',
                'total_questions' => 200,
                'duration_minutes' => 180,
                'pace_seconds_per_question' => 54,
                'marking_rule' => '+1.0 Correct / -0.25 Incorrect',
                'negative_marking_penalty' => 0.25,
                'scoring_type' => 'NEGATIVE_DEDUCTION',
                'blueprint' => [
                    'Basic Sciences' => '50 Questions (25%)',
                    'Clinical Sciences' => '150 Questions (75%)',
                ],
                'question_format' => 'Single Best Answer (SBA), direct factual & integrated clinical vignettes',
                'color' => '#55BDEB',
            ],
            'INI_CET' => [
                'pathway' => 'INI_CET',
                'name' => 'India: INI-CET',
                'subtitle' => 'Institute of National Importance Combined Entrance Test (AIIMS, PGI, JIPMER, NIMHANS)',
                'total_questions' => 200,
                'duration_minutes' => 180,
                'pace_seconds_per_question' => 54,
                'marking_rule' => '+1.0 Correct / -0.33 Incorrect',
                'negative_marking_penalty' => 0.33,
                'scoring_type' => 'NEGATIVE_DEDUCTION',
                'blueprint' => [
                    'Pre-Clinical (Anat, Phys, Bio)' => '30 Questions',
                    'Para-Clinical (Path, Pharm, Micro, FMT, PSM)' => '70 Questions',
                    'Clinical Subjects (Med, Surg, OBG, Peds, Short)' => '100 Questions',
                ],
                'question_format' => 'Multiple Completion, Match the Following, Sequence-based, Clinical Image Stems',
                'color' => '#6366F1',
            ],
            'USMLE_STEP1' => [
                'pathway' => 'USMLE_STEP1',
                'name' => 'USA: USMLE Step 1',
                'subtitle' => 'United States Medical Licensing Examination - Step 1',
                'total_questions' => 280,
                'duration_minutes' => 420,
                'pace_seconds_per_question' => 90,
                'marking_rule' => 'Pass / Fail (Equivalent 3-Digit Score)',
                'negative_marking_penalty' => 0.0,
                'scoring_type' => 'PASS_FAIL',
                'blueprint' => [
                    'Pathology & Pathophysiology' => '45–52%',
                    'Pharmacology' => '15–22%',
                    'Biochemistry & Genetics' => '14–19%',
                    'Microbiology & Immunology' => '15–20%',
                ],
                'question_format' => 'Extended vignette, two-step reasoning, organ-system interdisciplinary',
                'color' => '#10B981',
            ],
            'USMLE_STEP2CK' => [
                'pathway' => 'USMLE_STEP2CK',
                'name' => 'USA: USMLE Step 2 CK',
                'subtitle' => 'United States Medical Licensing Examination - Clinical Knowledge',
                'total_questions' => 318,
                'duration_minutes' => 480,
                'pace_seconds_per_question' => 90,
                'marking_rule' => '3-Digit Scaled Score (1–300, Passing ~214)',
                'negative_marking_penalty' => 0.0,
                'scoring_type' => 'SCALED_SCORE',
                'blueprint' => [
                    'Internal Medicine' => '50–60%',
                    'Surgery & Perioperative' => '25–30%',
                    'Pediatrics' => '20–25%',
                    'Obstetrics & Gynecology' => '15–20%',
                    'Psychiatry' => '10–15%',
                ],
                'question_format' => 'Next best step in management, drug advertisements, prognostic triage',
                'color' => '#F59E0B',
            ],
            'COMBINED' => [
                'pathway' => 'COMBINED',
                'name' => 'Combined Global Track',
                'subtitle' => 'Comprehensive Medical Entrance Mastery (MECEE + INI-CET + USMLE)',
                'total_questions' => 200,
                'duration_minutes' => 180,
                'pace_seconds_per_question' => 54,
                'marking_rule' => '+1.0 Correct / -0.25 Incorrect',
                'negative_marking_penalty' => 0.25,
                'scoring_type' => 'NEGATIVE_DEDUCTION',
                'blueprint' => [
                    'Integrated 19-Subject High-Yield Coverage' => '100%',
                ],
                'question_format' => 'Comprehensive mixed SBA and clinical vignettes with multi-tier rationale',
                'color' => '#55BDEB',
            ],
        ];

        return response()->json([
            'success' => true,
            'config' => $configs[$pathwayUpper] ?? $configs['MECEE_PG'] ?? reset($configs),
            'available_pathways' => $availablePathways,
        ]);
    }
}
