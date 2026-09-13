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
        ?array $questionIds = null
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

        /** @var Collection<int, Question> $questions */
        $questions = $query->inRandomOrder()->limit($limit)->get();

        // If not enough questions found for strict filters and status is ALL, fallback
        if ($questions->isEmpty() && empty($questionIds) && (! $status || strtoupper($status) === 'ALL')) {
            $questions = Question::query()
                ->where('is_active', true)
                ->forExam($pathway)
                ->inRandomOrder()
                ->limit($limit)
                ->get();

            if ($questions->isEmpty()) {
                $questions = Question::query()
                    ->where('is_active', true)
                    ->inRandomOrder()
                    ->limit($limit)
                    ->get();
            }
        }

        $totalQuestions = $questions->count();
        $calcDuration = $durationMinutes
            ? ($durationMinutes * 60)
            : ($sessionType === 'GRAND_MOCK' ? 180 * 60 : max(60, $totalQuestions * 60));

        $session = TestSession::create([
            'user_id' => $user->id,
            'title' => $title,
            'session_type' => $sessionType,
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

        // Sample per subject according to blueprint quota
        foreach ($quota as $slug => $count) {
            $subject = $subjects->get($slug);
            if (! $subject) {
                continue;
            }

            $subjectQuestions = Question::where('is_active', true)
                ->where('subject_id', $subject->id)
                ->forExam($pathway->value)
                ->inRandomOrder()
                ->limit($count)
                ->pluck('id');

            $selectedQuestionIds = $selectedQuestionIds->merge($subjectQuestions);
        }

        // Fill up remainder from active pathway questions if quota is not met
        $needed = $targetQuestions - $selectedQuestionIds->count();
        if ($needed > 0) {
            $filler = Question::where('is_active', true)
                ->whereNotIn('id', $selectedQuestionIds)
                ->forExam($pathway->value)
                ->inRandomOrder()
                ->limit($needed)
                ->pluck('id');

            $selectedQuestionIds = $selectedQuestionIds->merge($filler);
        }

        // If still needed (e.g. limited total seeded pool in local demo), fill from any active questions
        $stillNeeded = $targetQuestions - $selectedQuestionIds->count();
        if ($stillNeeded > 0) {
            $genericFiller = Question::where('is_active', true)
                ->whereNotIn('id', $selectedQuestionIds)
                ->inRandomOrder()
                ->limit($stillNeeded)
                ->pluck('id');

            $selectedQuestionIds = $selectedQuestionIds->merge($genericFiller);
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
