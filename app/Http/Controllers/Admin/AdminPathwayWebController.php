<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Scoring\ExamPathway;
use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\QuestionExamRelevance;
use App\Models\Subject;
use Inertia\Inertia;
use Inertia\Response;

class AdminPathwayWebController extends Controller
{
    public function index(): Response
    {
        $pathways = [
            'MECEE_PG' => [
                'name' => 'Nepal MECEE-PG',
                'fullName' => 'Medical Education Commission Entrance Examination (MD/MS)',
                'totalQuestions' => 200,
                'durationMinutes' => 180,
                'correctMarks' => 1.0,
                'negativeMarks' => 0.25,
                'scoringType' => 'Negative Marking (+1 / -0.25)',
                'availableQuestions' => QuestionExamRelevance::whereIn('exam', ['MECEE_PG', 'COMBINED'])->distinct('question_id')->count('question_id'),
            ],
            'INI_CET' => [
                'name' => 'India INI-CET',
                'fullName' => 'Institute of National Importance Combined Entrance Test (AIIMS, PGI, JIPMER, NIMHANS)',
                'totalQuestions' => 200,
                'durationMinutes' => 180,
                'correctMarks' => 1.0,
                'negativeMarks' => 0.33,
                'scoringType' => 'Negative Marking (+1 / -0.333)',
                'availableQuestions' => QuestionExamRelevance::whereIn('exam', ['INI_CET', 'COMBINED'])->distinct('question_id')->count('question_id'),
            ],
            'USMLE_STEP1' => [
                'name' => 'USA USMLE Step 1',
                'fullName' => 'United States Medical Licensing Examination Step 1 (Basic Biomedical Sciences)',
                'totalQuestions' => 280,
                'durationMinutes' => 420,
                'correctMarks' => 1.0,
                'negativeMarks' => 0.0,
                'scoringType' => 'Pass / Fail (Standard Minimum 196)',
                'availableQuestions' => QuestionExamRelevance::whereIn('exam', ['USMLE_STEP1', 'COMBINED'])->distinct('question_id')->count('question_id'),
            ],
            'USMLE_STEP2CK' => [
                'name' => 'USA USMLE Step 2 CK',
                'fullName' => 'United States Medical Licensing Examination Step 2 Clinical Knowledge',
                'totalQuestions' => 318,
                'durationMinutes' => 540,
                'correctMarks' => 1.0,
                'negativeMarks' => 0.0,
                'scoringType' => 'Three-Digit Scaled Score (1–300, Passing ~214)',
                'availableQuestions' => QuestionExamRelevance::whereIn('exam', ['USMLE_STEP2CK', 'COMBINED'])->distinct('question_id')->count('question_id'),
            ],
            'COMBINED' => [
                'name' => 'Combined Global Track',
                'fullName' => 'Integrated Tri-Pathway Medical Curriculum (MECEE + INI-CET + USMLE)',
                'totalQuestions' => 200,
                'durationMinutes' => 180,
                'correctMarks' => 1.0,
                'negativeMarks' => 0.25,
                'scoringType' => 'Comprehensive Dual-Metric Scoring',
                'availableQuestions' => Question::count(),
            ],
        ];

        $subjectDistribution = Subject::withCount('questions')
            ->orderBy('order_index')
            ->get(['id', 'name', 'slug', 'questions_count']);

        return Inertia::render('admin/pathways/index', [
            'pathways' => $pathways,
            'subjects' => $subjectDistribution,
            'total_bank_questions' => Question::count(),
        ]);
    }
}
