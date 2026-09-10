<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\QuestionExamRelevance;
use App\Models\Subject;
use App\Models\Subtopic;
use App\Models\TestSession;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardWebController extends Controller
{
    public function index(Request $request): Response
    {
        $totalQuestions = Question::count();
        $activeQuestions = Question::where('is_active', true)->count();
        $draftQuestions = $totalQuestions - $activeQuestions;

        $totalSubjects = Subject::count();
        $totalTopics = Topic::count();
        $totalSubtopics = Subtopic::count();
        $totalUsers = User::count();
        $totalAttempts = QuestionAttempt::count();
        $totalSessions = TestSession::count();

        // Difficulty counts
        $difficultyBreakdown = [
            'EASY' => Question::where('difficulty', 'EASY')->count(),
            'MEDIUM' => Question::where('difficulty', 'MEDIUM')->count(),
            'HARD' => Question::where('difficulty', 'HARD')->count(),
        ];

        // Pathway distribution
        $pathwayBreakdown = [
            'MECEE_PG' => QuestionExamRelevance::whereIn('exam', ['MECEE_PG', 'COMBINED'])->distinct('question_id')->count('question_id'),
            'INI_CET' => QuestionExamRelevance::whereIn('exam', ['INI_CET', 'COMBINED'])->distinct('question_id')->count('question_id'),
            'USMLE_STEP1' => QuestionExamRelevance::whereIn('exam', ['USMLE_STEP1', 'COMBINED'])->distinct('question_id')->count('question_id'),
            'USMLE_STEP2CK' => QuestionExamRelevance::whereIn('exam', ['USMLE_STEP2CK', 'COMBINED'])->distinct('question_id')->count('question_id'),
            'COMBINED' => QuestionExamRelevance::where('exam', 'COMBINED')->distinct('question_id')->count('question_id'),
        ];

        // Subjects with question counts
        $subjectsSummary = Subject::withCount(['questions', 'topics'])
            ->orderBy('order_index')
            ->get(['id', 'name', 'slug', 'icon_key', 'order_index']);

        // Recent 10 questions
        $recentQuestions = Question::with(['subject:id,name', 'topic:id,name', 'relevantExams'])
            ->latest()
            ->take(10)
            ->get(['id', 'code', 'subject_id', 'topic_id', 'difficulty', 'is_active', 'stem', 'created_at']);

        return Inertia::render('admin/dashboard', [
            'kpis' => [
                'total_questions' => $totalQuestions,
                'active_questions' => $activeQuestions,
                'draft_questions' => $draftQuestions,
                'total_subjects' => $totalSubjects,
                'total_topics' => $totalTopics,
                'total_subtopics' => $totalSubtopics,
                'total_users' => $totalUsers,
                'total_attempts' => $totalAttempts,
                'total_sessions' => $totalSessions,
            ],
            'difficulty_breakdown' => $difficultyBreakdown,
            'pathway_breakdown' => $pathwayBreakdown,
            'subjects_summary' => $subjectsSummary,
            'recent_questions' => $recentQuestions,
        ]);
    }
}
