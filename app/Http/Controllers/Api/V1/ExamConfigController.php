<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Scoring\ExamPathway;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ExamConfigController extends Controller
{
    /**
     * Get exam blueprint, timing constraints, and negative marking rules
     */
    public function show(string $pathway): JsonResponse
    {
        $enum = ExamPathway::tryFrom(strtoupper($pathway)) ?? ExamPathway::INI_CET;

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
                'duration_minutes' => 420, // 7 blocks x 60 min
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
                'duration_minutes' => 480, // 8 blocks x 60 min
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
            'config' => $configs[$enum->value] ?? $configs['INI_CET'],
            'available_pathways' => array_keys($configs),
        ]);
    }
}
