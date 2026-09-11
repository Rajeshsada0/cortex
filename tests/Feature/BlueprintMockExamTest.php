<?php

namespace Tests\Feature;

use App\Domain\Scoring\ExamPathway;
use App\Domain\TestSession\TestSessionService;
use App\Models\Question;
use App\Models\TestSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BlueprintMockExamTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_exam_pathway_negative_marking_and_blueprint_weights(): void
    {
        $this->assertEquals(0.33, ExamPathway::INI_CET->penaltyPerIncorrect());
        $this->assertEquals(0.25, ExamPathway::MECEE_PG->penaltyPerIncorrect());
        $this->assertEquals(0.00, ExamPathway::USMLE_STEP1->penaltyPerIncorrect());
        $this->assertEquals(0.00, ExamPathway::USMLE_STEP2CK->penaltyPerIncorrect());

        $quota = ExamPathway::INI_CET->blueprintQuota(100);
        $this->assertArrayHasKey('anatomy', $quota);
        $this->assertArrayHasKey('pathology', $quota);
        $this->assertArrayHasKey('general-medicine', $quota);
        $this->assertEquals(100, array_sum($quota));
    }

    public function test_candidate_can_launch_blueprint_mock_session(): void
    {
        $candidate = User::factory()->create([
            'is_admin' => false,
            'active_pathway' => 'INI_CET',
        ]);

        $response = $this->actingAs($candidate)->post('/mock-exam/launch', [
            'pathway' => 'INI_CET',
            'target_questions' => 10,
        ]);

        $this->assertDatabaseHas('test_sessions', [
            'user_id' => $candidate->id,
            'session_type' => 'GRAND_MOCK',
            'exam_pathway' => 'INI_CET',
        ]);

        $session = TestSession::where('user_id', $candidate->id)->latest()->first();
        $this->assertNotNull($session);
        $response->assertRedirect(route('mock-exam.hall', ['id' => $session->id]));

        // Check attempts were pre-seeded for locked question ordering
        $this->assertGreaterThan(0, $session->attempts()->count());
    }

    public function test_candidate_can_launch_custom_mock_exam_presets(): void
    {
        $candidate = User::factory()->create([
            'is_admin' => false,
            'active_pathway' => 'MECEE_PG',
        ]);

        $response = $this->actingAs($candidate)->post('/mock-exam/launch', [
            'pathway' => 'MECEE_PG',
            'target_questions' => 50,
            'duration_minutes' => 45,
        ]);

        $session = TestSession::where('user_id', $candidate->id)->latest()->first();
        $this->assertNotNull($session);
        $this->assertEquals(45 * 60, $session->duration_seconds);
        $this->assertEquals('MECEE_PG', $session->exam_pathway);
        $response->assertRedirect(route('mock-exam.hall', ['id' => $session->id]));
    }

    public function test_candidate_can_view_mock_exam_hall(): void
    {
        $candidate = User::factory()->create([
            'is_admin' => false,
            'active_pathway' => 'MECEE_PG',
        ]);

        $service = app(TestSessionService::class);
        $result = $service->createBlueprintMockSession(
            user: $candidate,
            pathway: ExamPathway::MECEE_PG,
            targetQuestions: 5,
            durationMinutes: 30
        );

        $session = $result['session'];

        $response = $this->actingAs($candidate)->get(route('mock-exam.hall', ['id' => $session->id]));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('mock-exam/hall')
            ->where('session.data.id', $session->id)
            ->has('questions')
            ->has('attempts')
        );
    }

    public function test_mock_result_calculates_subject_breakdown_and_penalties(): void
    {
        $candidate = User::factory()->create([
            'is_admin' => false,
            'active_pathway' => 'INI_CET',
        ]);

        $service = app(TestSessionService::class);
        $result = $service->createBlueprintMockSession(
            user: $candidate,
            pathway: ExamPathway::INI_CET,
            targetQuestions: 6,
            durationMinutes: 30
        );

        $session = $result['session'];
        $attempts = $session->attempts()->with('question')->get();

        // Simulate answers: 1 correct, 1 incorrect, rest unanswered
        if ($attempts->count() >= 2) {
            $q1 = $attempts[0]->question;
            $attempts[0]->update([
                'selected_option' => $q1->correct_option,
                'is_correct' => true,
                'time_spent_seconds' => 45,
            ]);

            $incorrectOpt = ($q1->correct_option === 'A') ? 'B' : 'A';
            $attempts[1]->update([
                'selected_option' => $incorrectOpt,
                'is_correct' => false,
                'time_spent_seconds' => 30,
            ]);
        }

        $session->update([
            'completed_at' => now(),
            'score_obtained' => 0.67, // 1 - 0.33
            'time_spent_seconds' => 75,
        ]);

        $response = $this->actingAs($candidate)->get(route('mock-exam.result', ['id' => $session->id]));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('mock-exam/result')
            ->where('session.data.id', $session->id)
            ->has('subjectBreakdown')
            ->has('stats.penaltyRate')
            ->where('stats.penaltyRate', 0.33)
        );
    }
}
