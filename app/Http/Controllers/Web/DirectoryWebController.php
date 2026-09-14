<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
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

        $subjects = Subject::with(['topics.subtopics'])
            ->withCount([
                'questions' => fn ($q) => $q->where('is_active', true)->forExam($pathway),
                'topics',
            ])
            ->orderBy('order_index')
            ->get()
            ->map(function ($subject) use ($user, $pathway) {
                $attempts = QuestionAttempt::where('user_id', $user->id)
                    ->whereHas('question', fn ($q) => $q->where('subject_id', $subject->id)->where('is_active', true)->forExam($pathway))
                    ->get();

                $attemptedCount = $attempts->unique('question_id')->count();
                $correctCount = $attempts->where('is_correct', true)->count();
                $totalQuestions = $subject->questions_count;

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
                        'questions_count' => $topic->questions()->where('is_active', true)->forExam($pathway)->count(),
                    ]),
                ];
            });

        return Inertia::render('directory/index', [
            'user' => $user,
            'subjects' => $subjects,
        ]);
    }
}
