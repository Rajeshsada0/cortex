<?php

namespace App\Domain\TestSession;

use App\Domain\Scoring\ExamPathway;
use App\Domain\Scoring\MarkingEngine;
use App\Models\Question;
use App\Models\QuestionAttempt;
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
        ?int $subjectId = null,
        ?int $topicId = null,
        ?string $difficulty = null,
        int $limit = 20,
        ?int $durationMinutes = null
    ): array {
        $pathway = $examPathway ?? $user->active_pathway ?? 'INI_CET';

        $query = Question::query()
            ->where('is_active', true)
            ->forExam($pathway);

        if ($subjectId) {
            $query->where('subject_id', $subjectId);
        }

        if ($topicId) {
            $query->where('topic_id', $topicId);
        }

        if ($difficulty) {
            $query->where('difficulty', $difficulty);
        }

        /** @var Collection<int, Question> $questions */
        $questions = $query->inRandomOrder()->limit($limit)->get();

        // If not enough questions found for strict filters, fallback to all active for the exam
        if ($questions->isEmpty()) {
            $questions = Question::query()
                ->where('is_active', true)
                ->inRandomOrder()
                ->limit($limit)
                ->get();
        }

        $totalQuestions = $questions->count();
        $calcDuration = $durationMinutes
            ? ($durationMinutes * 60)
            : ($sessionType === 'GRAND_MOCK' ? 180 * 60 : $totalQuestions * 54); // ~0.9 min/Q

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
            'questions' => $questions->load(['subject', 'topic', 'options']),
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
