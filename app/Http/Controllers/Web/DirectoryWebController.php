<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DirectoryWebController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $pathway = $user?->active_pathway ?? 'INI_CET';

        // 1. Single aggregate query for user attempts by subject
        $userAttemptsQuery = QuestionAttempt::where('question_attempts.user_id', $user->id)
            ->join('questions', 'questions.id', '=', 'question_attempts.question_id')
            ->where('questions.is_active', true);

        if ($pathway && $pathway !== 'COMBINED') {
            $userAttemptsQuery->join('question_exam_relevance', 'question_exam_relevance.question_id', '=', 'questions.id')
                ->whereIn('question_exam_relevance.exam', [$pathway, 'COMBINED']);
        }

        $userAttemptsBySubject = $userAttemptsQuery
            ->groupBy('questions.subject_id')
            ->selectRaw('questions.subject_id, COUNT(DISTINCT question_attempts.question_id) as attempted, SUM(CASE WHEN question_attempts.is_correct = 1 THEN 1 ELSE 0 END) as correct')
            ->get()
            ->keyBy('subject_id');

        // 2. Single aggregate query for questions count by topic
        $topicQuestionCountsQuery = Question::where('is_active', true);
        if ($pathway && $pathway !== 'COMBINED') {
            $topicQuestionCountsQuery->forExam($pathway);
        }
        $topicQuestionCounts = $topicQuestionCountsQuery
            ->whereNotNull('topic_id')
            ->groupBy('topic_id')
            ->selectRaw('topic_id, COUNT(*) as count')
            ->pluck('count', 'topic_id');

        // 3. Eager load subjects with topics and subtopics
        $subjects = Subject::with(['topics.subtopics'])
            ->withCount([
                'questions' => fn ($q) => $q->where('is_active', true)->forExam($pathway),
                'topics',
            ])
            ->orderBy('order_index')
            ->get()
            ->map(function ($subject) use ($userAttemptsBySubject, $topicQuestionCounts) {
                $stat = $userAttemptsBySubject->get($subject->id);
                $attemptedCount = (int) ($stat?->attempted ?? 0);
                $correctCount = (int) ($stat?->correct ?? 0);
                $totalQuestions = (int) $subject->questions_count;

                return [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'slug' => $subject->slug,
                    'icon_key' => $subject->icon_key,
                    'order_index' => $subject->order_index,
                    'total_questions' => $totalQuestions,
                    'attempted_count' => $attemptedCount,
                    'topics_count' => $subject->topics_count,
                    'coverage_percentage' => $totalQuestions > 0 ? round(($attemptedCount / $totalQuestions) * 100) : 0,
                    'mastery_percentage' => $attemptedCount > 0 ? round(($correctCount / $attemptedCount) * 100) : 0,
                    'topics' => $subject->topics->map(fn ($topic) => [
                        'id' => $topic->id,
                        'name' => $topic->name,
                        'slug' => $topic->slug,
                        'priority' => $topic->high_yield_priority,
                        'subtopics' => $topic->subtopics->pluck('name'),
                        'questions_count' => (int) ($topicQuestionCounts[$topic->id] ?? 0),
                    ]),
                ];
            });

        return Inertia::render('directory/index', [
            'user' => $user,
            'subjects' => $subjects,
        ]);
    }
}
