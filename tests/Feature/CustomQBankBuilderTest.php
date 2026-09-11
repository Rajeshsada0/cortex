<?php

namespace Tests\Feature;

use App\Domain\TestSession\TestSessionService;
use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\Subject;
use App\Models\TestSession;
use App\Models\User;
use App\Models\UserNoteBookmark;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomQBankBuilderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_candidate_can_view_qbank_builder_with_pool_counts(): void
    {
        $candidate = User::factory()->create(['is_admin' => false, 'active_pathway' => 'INI_CET']);

        $response = $this->actingAs($candidate)->get('/qbank');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('qbank/index')
            ->has('counts.total')
            ->has('counts.unused')
            ->has('counts.incorrect')
            ->has('counts.bookmarked')
            ->has('subjects')
        );
    }

    public function test_runner_initializes_timed_exam_mode(): void
    {
        $candidate = User::factory()->create(['is_admin' => false, 'active_pathway' => 'INI_CET']);

        $response = $this->actingAs($candidate)->get('/qbank/runner?mode=TIMED&limit=5');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('qbank/runner')
            ->where('mode', 'TIMED')
            ->where('session.data.session_type', 'TIMED_BLOCK')
        );
    }

    public function test_runner_filters_by_attempt_status_unused(): void
    {
        $candidate = User::factory()->create(['is_admin' => false, 'active_pathway' => 'INI_CET']);
        $service = app(TestSessionService::class);

        // Attempt one question
        $question = Question::first();
        $session = TestSession::create([
            'user_id' => $candidate->id,
            'title' => 'Initial Session',
            'session_type' => 'PRACTICE',
            'exam_pathway' => 'INI_CET',
            'total_questions' => 1,
            'duration_seconds' => 60,
        ]);

        QuestionAttempt::create([
            'session_id' => $session->id,
            'user_id' => $candidate->id,
            'question_id' => $question->id,
            'selected_option' => $question->correct_option,
            'is_correct' => true,
            'confidence' => 'HIGH',
            'time_taken_seconds' => 30,
        ]);

        $result = $service->createSession(
            user: $candidate,
            title: 'Unused Test Block',
            sessionType: 'PRACTICE',
            examPathway: 'INI_CET',
            status: 'UNUSED',
            limit: 5
        );

        $attemptedQuestionIds = $result['questions']->pluck('id');
        $this->assertNotContains($question->id, $attemptedQuestionIds);
    }

    public function test_runner_filters_by_attempt_status_incorrect(): void
    {
        $candidate = User::factory()->create(['is_admin' => false, 'active_pathway' => 'INI_CET']);
        $service = app(TestSessionService::class);

        $incorrectQuestion = Question::first();
        $session = TestSession::create([
            'user_id' => $candidate->id,
            'title' => 'Mistake Session',
            'session_type' => 'PRACTICE',
            'exam_pathway' => 'INI_CET',
            'total_questions' => 1,
            'duration_seconds' => 60,
        ]);

        // Wrong option
        $wrongOpt = $incorrectQuestion->correct_option === 'A' ? 'B' : 'A';
        QuestionAttempt::create([
            'session_id' => $session->id,
            'user_id' => $candidate->id,
            'question_id' => $incorrectQuestion->id,
            'selected_option' => $wrongOpt,
            'is_correct' => false,
            'confidence' => 'HIGH',
            'time_taken_seconds' => 25,
        ]);

        $result = $service->createSession(
            user: $candidate,
            title: 'Remediation Block',
            sessionType: 'PRACTICE',
            examPathway: 'INI_CET',
            status: 'INCORRECT',
            limit: 5
        );

        $this->assertTrue($result['questions']->contains('id', $incorrectQuestion->id));
    }

    public function test_runner_filters_by_attempt_status_bookmarked(): void
    {
        $candidate = User::factory()->create(['is_admin' => false, 'active_pathway' => 'INI_CET']);
        $service = app(TestSessionService::class);

        $bookmarkedQuestion = Question::first();
        UserNoteBookmark::create([
            'user_id' => $candidate->id,
            'question_id' => $bookmarkedQuestion->id,
            'is_bookmarked' => true,
        ]);

        $result = $service->createSession(
            user: $candidate,
            title: 'Bookmarked Block',
            sessionType: 'PRACTICE',
            examPathway: 'INI_CET',
            status: 'BOOKMARKED',
            limit: 5
        );

        $this->assertTrue($result['questions']->contains('id', $bookmarkedQuestion->id));
    }

    public function test_runner_filters_by_multi_subject_ids(): void
    {
        $candidate = User::factory()->create(['is_admin' => false, 'active_pathway' => 'INI_CET']);
        $service = app(TestSessionService::class);

        $subjects = Subject::take(2)->get();
        $targetIds = $subjects->pluck('id')->toArray();

        $result = $service->createSession(
            user: $candidate,
            title: 'Dual Subject Block',
            sessionType: 'PRACTICE',
            examPathway: 'INI_CET',
            subjectId: $targetIds,
            limit: 10
        );

        foreach ($result['questions'] as $q) {
            $this->assertContains($q->subject_id, $targetIds);
        }
    }
}
