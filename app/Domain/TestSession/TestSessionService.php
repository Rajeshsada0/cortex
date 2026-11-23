<?php

namespace App\Domain\TestSession;

use App\Domain\Scoring\ExamPathway;
use App\Domain\Scoring\MarkingEngine;
use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\Subject;
use App\Models\TestSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

final class TestSessionService
{
    public function __construct(
        private readonly MarkingEngine $markingEngine
    ) {}

    /**
     * Initialize a new Test Session
     */
    public function createSession(
        User $user,
        string $title,
        string $sessionType = 'PRACTICE',
        ?string $examPathway = null,
        int|array|null $subjectId = null,
        int|array|null $topicId = null,
        ?string $difficulty = null,
        int $limit = 20,
        ?int $durationMinutes = null,
        ?string $status = null,
        ?array $questionIds = null,
        ?bool $isPastYear = null,
        ?bool $isHighYield = null,
        ?string $pastYear = null
    ): array {
        $pathway = $examPathway ?? $user->active_pathway ?? 'INI_CET';

        $query = Question::query()
            ->where('is_active', true);

        if (! empty($questionIds)) {
            $query->whereIn('id', $questionIds);
        } elseif ($status && strtoupper($status) === 'BOOKMARKED') {
            // Include user's bookmarked questions across their curriculum
        } else {
            $query->forExam($pathway);
        }

        if (! empty($pastYear)) {
            $cleanYear = trim((string) $pastYear);
            $query->where(function ($q) use ($cleanYear) {
                $q->where('past_year', 'LIKE', "%{$cleanYear}%")
                    ->orWhere('stem', 'LIKE', "%{$cleanYear}%");
            });
        } elseif ($isPastYear && \Illuminate\Support\Facades\Schema::hasColumn('questions', 'is_past_year')) {
            $query->where(function ($q) {
                $q->where('is_past_year', true)->orWhereNotNull('past_year');
            });
        }

        if ($isHighYield && \Illuminate\Support\Facades\Schema::hasColumn('questions', 'is_high_yield')) {
            $query->where(function ($q) {
                $q->where('is_high_yield', true)
                    ->orWhereHas('topic', fn ($t) => $t->where('high_yield_priority', '>=', 3));
            });
        }

        if (! empty($subjectId)) {
            if (is_array($subjectId)) {
                $cleanSubjectIds = array_values(array_filter($subjectId));
                if (! empty($cleanSubjectIds)) {
                    $query->whereIn('subject_id', $cleanSubjectIds);
                }
            } else {
                $query->where('subject_id', $subjectId);
            }
        }

        if (! empty($topicId)) {
            if (is_array($topicId)) {
                $cleanTopicIds = array_values(array_filter($topicId));
                if (! empty($cleanTopicIds)) {
                    $query->whereIn('topic_id', $cleanTopicIds);
                }
            } else {
                $query->where('topic_id', $topicId);
            }
        }

        if ($difficulty && strtoupper($difficulty) !== 'ALL') {
            $query->where('difficulty', strtoupper($difficulty));
        }

        if ($status && strtoupper($status) !== 'ALL') {
            $query->status($user, $status);
        }

        // Get questions the user has already attempted to guarantee non-repeating tests
        $attemptedQuestionIds = QuestionAttempt::where('user_id', $user->id)
            ->pluck('question_id')
            ->filter()
            ->unique()
            ->toArray();

        // If Grand Mock, also prioritize questions flagged as is_grand_mock
        $isGrandMockMode = ($sessionType === 'GRAND_MOCK' || $sessionType === 'MOCK' || $limit >= 200);

        /** @var Collection<int, Question> $questions */
        if ($isGrandMockMode && Question::where('is_grand_mock', true)->exists()) {
            $grandMockUnattempted = (clone $query)
                ->where('is_grand_mock', true)
                ->whereNotIn('id', $attemptedQuestionIds)
                ->inRandomOrder()
                ->limit($limit)
                ->get();

            if ($grandMockUnattempted->count() >= $limit) {
                $questions = $grandMockUnattempted;
            } else {
                $questions = $grandMockUnattempted;
            }
        } else {
            $questions = collect();
        }

        if ($questions->count() < $limit) {
            $stillNeeded = $limit - $questions->count();
            $existingSelectedIds = $questions->pluck('id')->toArray();

            // Prioritize unattempted questions to avoid repetition across tests
            $unattemptedQuery = (clone $query)
                ->whereNotIn('id', array_merge($attemptedQuestionIds, $existingSelectedIds));

            $unattemptedCount = $unattemptedQuery->count();

            if ($unattemptedCount >= $stillNeeded) {
                $freshQuestions = $unattemptedQuery->inRandomOrder()->limit($stillNeeded)->get();
                $questions = $questions->concat($freshQuestions);
            } else {
                $freshQuestions = $unattemptedQuery->inRandomOrder()->get();
                $questions = $questions->concat($freshQuestions);

                $remainderNeeded = $limit - $questions->count();
                if ($remainderNeeded > 0) {
                    $existingSelectedIds = $questions->pluck('id')->toArray();
                    $repeatFiller = (clone $query)
                        ->whereNotIn('id', $existingSelectedIds)
                        ->inRandomOrder()
                        ->limit($remainderNeeded)
                        ->get();
                    $questions = $questions->concat($repeatFiller);
                }
            }
        }

        // Deduplicate to guarantee no question ever repeats within the test
        $questions = $questions->unique('id')->values();

        // If not enough questions found for strict filters, provide smart fallback:
        if ($questions->count() < $limit && empty($questionIds)) {
            $existingSelectedIds = $questions->pluck('id')->toArray();
            $neededFallback = $limit - $questions->count();

            $fallbackQuery = Question::query()
                ->where('is_active', true)
                ->forExam($pathway)
                ->whereNotIn('id', $existingSelectedIds);

            if (! empty($pastYear)) {
                $cleanYear = trim((string) $pastYear);
                $fallbackQuery->where(function ($q) use ($cleanYear) {
                    $q->where('past_year', 'LIKE', "%{$cleanYear}%")
                        ->orWhere('stem', 'LIKE', "%{$cleanYear}%");
                });
            } elseif ($isPastYear) {
                $fallbackQuery->where(function ($q) {
                    $q->where('is_past_year', true)->orWhereNotNull('past_year');
                });
            } elseif ($isHighYield) {
                $fallbackQuery->where(function ($q) {
                    $q->where('is_high_yield', true)
                        ->orWhereHas('topic', fn ($t) => $t->where('high_yield_priority', '>=', 3));
                });
            }

            // Prioritize unattempted from fallback
            $fallbackUnattempted = (clone $fallbackQuery)
                ->whereNotIn('id', $attemptedQuestionIds)
                ->inRandomOrder()
                ->limit($neededFallback)
                ->get();

            $questions = $questions->concat($fallbackUnattempted)->unique('id')->values();

            if ($questions->count() < $limit) {
                $moreNeeded = $limit - $questions->count();
                $existingSelectedIds = $questions->pluck('id')->toArray();
                $fallbackRemainder = $fallbackQuery
                    ->whereNotIn('id', $existingSelectedIds)
                    ->inRandomOrder()
                    ->limit($moreNeeded)
                    ->get();
                $questions = $questions->concat($fallbackRemainder)->unique('id')->values();
            }

            // Ultimate safety net fallback within pathway (except when specific past year requested)
            if ($questions->count() < $limit && empty($pastYear)) {
                $lastNeeded = $limit - $questions->count();
                $existingSelectedIds = $questions->pluck('id')->toArray();
                $pathwaySafety = Question::query()
                    ->where('is_active', true)
                    ->forExam($pathway)
                    ->whereNotIn('id', $existingSelectedIds)
                    ->inRandomOrder()
                    ->limit($lastNeeded)
                    ->get();
                $questions = $questions->concat($pathwaySafety)->unique('id')->values();
            }
        }

        $totalQuestions = $questions->count();
        $calcDuration = $durationMinutes
            ? ($durationMinutes * 60)
            : ($sessionType === 'GRAND_MOCK' || $sessionType === 'MOCK' || $limit >= 200 ? 180 * 60 : max(60, $totalQuestions * 60));

        $session = TestSession::create([
            'user_id' => $user->id,
            'title' => $title,
            'session_type' => ($sessionType === 'MOCK' ? 'GRAND_MOCK' : $sessionType),
            'exam_pathway' => $pathway,
            'total_questions' => $totalQuestions,
            'duration_seconds' => $calcDuration,
            'time_spent_seconds' => 0,
            'score_obtained' => 0.0,
            'is_completed' => false,
            'started_at' => Carbon::now(),
        ]);

        return [
            'session' => $session,
            'questions' => $questions->load(['subject', 'topic', 'subtopic', 'options']),
        ];
    }

    /**
     * Create a Grand Mock Exam session following the exact blueprint quota across medical subjects.
     *
     * @return array{session: TestSession, questions: Collection<int, Question>}
     */
    public function createBlueprintMockSession(
        User $user,
        ExamPathway $pathway,
        int $targetQuestions = 200,
        ?int $durationMinutes = null
    ): array {
        $quota = $pathway->blueprintQuota($targetQuestions);
        $subjects = Subject::all()->keyBy('slug');

        $selectedQuestionIds = collect();

        // Get questions the user has already attempted to avoid repeating questions
        $attemptedQuestionIds = QuestionAttempt::where('user_id', $user->id)
            ->pluck('question_id')
            ->filter()
            ->unique()
            ->toArray();

        // Sample per subject according to blueprint quota, prioritizing unattempted questions
        foreach ($quota as $slug => $count) {
            $subject = $subjects->get($slug);
            if (! $subject) {
                continue;
            }

            $currentSelected = $selectedQuestionIds->toArray();

            $subjectUnattempted = Question::where('is_active', true)
                ->where('subject_id', $subject->id)
                ->forExam($pathway->value)
                ->whereNotIn('id', array_merge($attemptedQuestionIds, $currentSelected))
                ->inRandomOrder()
                ->limit($count)
                ->pluck('id');

            $selectedQuestionIds = $selectedQuestionIds->merge($subjectUnattempted);

            if ($subjectUnattempted->count() < $count) {
                $rem = $count - $subjectUnattempted->count();
                $subjectFiller = Question::where('is_active', true)
                    ->where('subject_id', $subject->id)
                    ->forExam($pathway->value)
                    ->whereNotIn('id', $selectedQuestionIds->toArray())
                    ->inRandomOrder()
                    ->limit($rem)
                    ->pluck('id');

                $selectedQuestionIds = $selectedQuestionIds->merge($subjectFiller);
            }
        }

        // Fill up remainder from active pathway questions if quota is not met (prioritize unattempted)
        $needed = $targetQuestions - $selectedQuestionIds->count();
        if ($needed > 0) {
            $fillerUnattempted = Question::where('is_active', true)
                ->whereNotIn('id', array_merge($attemptedQuestionIds, $selectedQuestionIds->toArray()))
                ->forExam($pathway->value)
                ->inRandomOrder()
                ->limit($needed)
                ->pluck('id');

            $selectedQuestionIds = $selectedQuestionIds->merge($fillerUnattempted);
        }

        $stillNeeded = $targetQuestions - $selectedQuestionIds->count();
        if ($stillNeeded > 0) {
            $filler = Question::where('is_active', true)
                ->whereNotIn('id', $selectedQuestionIds->toArray())
                ->forExam($pathway->value)
                ->inRandomOrder()
                ->limit($stillNeeded)
                ->pluck('id');

            $selectedQuestionIds = $selectedQuestionIds->merge($filler);
        }


        $finalQuestionIds = $selectedQuestionIds->unique()->slice(0, $targetQuestions)->values();

        /** @var Collection<int, Question> $questions */
        $questions = Question::whereIn('id', $finalQuestionIds)
            ->with(['subject', 'topic', 'subtopic', 'options'])
            ->get();

        $totalQuestions = $questions->count();
        $calcDuration = ($durationMinutes ?? $pathway->durationMinutes()) * 60;

        $session = TestSession::create([
            'user_id' => $user->id,
            'title' => "{$pathway->label()} Official Grand Mock",
            'session_type' => 'GRAND_MOCK',
            'exam_pathway' => $pathway->value,
            'total_questions' => $totalQuestions,
            'duration_seconds' => $calcDuration,
            'time_spent_seconds' => 0,
            'score_obtained' => 0.0,
            'is_completed' => false,
            'started_at' => Carbon::now(),
        ]);

        // Pre-create placeholder question attempts for deterministic hall rendering
        foreach ($questions as $q) {
            QuestionAttempt::create([
                'session_id' => $session->id,
                'user_id' => $user->id,
                'question_id' => $q->id,
                'selected_option' => null,
                'is_correct' => false,
                'confidence' => 'HIGH',
                'time_taken_seconds' => 0,
            ]);
        }

        return [
            'session' => $session,
            'questions' => $questions,
        ];
    }

    /**
     * Complete and grade a Test Session
     */
    public function submitSession(TestSession $session, int $timeSpentSeconds): TestSession
    {
        $attempts = QuestionAttempt::where('session_id', $session->id)->get();

        $correct = $attempts->where('is_correct', true)->count();
        $incorrect = $attempts->where('is_correct', false)->count();
        $total = $session->total_questions > 0 ? $session->total_questions : $attempts->count();

        $score = $this->markingEngine->score(
            $session->exam_pathway,
            $correct,
            $incorrect,
            $total
        );

        $session->update([
            'is_completed' => true,
            'score_obtained' => $score,
            'time_spent_seconds' => $timeSpentSeconds,
            'completed_at' => Carbon::now(),
        ]);

        return $session;
    }
}
