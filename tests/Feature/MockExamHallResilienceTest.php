<?php

use App\Domain\Scoring\ExamPathway;
use App\Domain\TestSession\TestSessionService;
use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

test('Mock Exam Hall supports continuous attempt synchronization during active exam', function () {
    $candidate = User::factory()->create([
        'is_admin' => false,
        'active_pathway' => 'INI_CET',
    ]);

    $service = app(TestSessionService::class);
    $result = $service->createBlueprintMockSession(
        user: $candidate,
        pathway: ExamPathway::INI_CET,
        targetQuestions: 10,
        durationMinutes: 45
    );

    $session = $result['session'];
    $questions = $result['questions'];
    $q1 = $questions->first();

    // Simulate candidate answering question 1
    $response = $this->actingAs($candidate)->postJson("/api/v1/test-sessions/{$session->id}/attempts", [
        'question_id' => $q1->id,
        'selected_option' => $q1->correct_option,
        'confidence' => 'HIGH',
        'time_taken_seconds' => 45,
    ]);

    $response->assertStatus(200);

    // Verify attempt is recorded in database
    expect(QuestionAttempt::where('session_id', $session->id)->where('question_id', $q1->id)->exists())->toBeTrue();
});

test('Mock Exam Hall final submission updates session metrics and marks complete', function () {
    $candidate = User::factory()->create([
        'is_admin' => false,
        'active_pathway' => 'INI_CET',
    ]);

    $service = app(TestSessionService::class);
    $result = $service->createBlueprintMockSession(
        user: $candidate,
        pathway: ExamPathway::INI_CET,
        targetQuestions: 5,
        durationMinutes: 20
    );

    $session = $result['session'];
    $q = $result['questions']->first();

    // Record an answer
    $this->actingAs($candidate)->postJson("/api/v1/test-sessions/{$session->id}/attempts", [
        'question_id' => $q->id,
        'selected_option' => $q->correct_option,
        'confidence' => 'HIGH',
        'time_taken_seconds' => 30,
    ]);

    // Submit session
    $submitResponse = $this->actingAs($candidate)->postJson("/api/v1/test-sessions/{$session->id}/submit", [
        'time_spent_seconds' => 1200,
    ]);

    $submitResponse->assertStatus(200);

    $session->refresh();
    expect($session->is_completed)->toBeTrue();
    expect($session->time_spent_seconds)->toBe(1200);
    expect($session->completed_at)->not->toBeNull();
});

test('Mock Exam Hall reloads with persisted state and attempts', function () {
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

    // Reload exam hall (simulating browser reload / recovery)
    $response = $this->actingAs($candidate)->get(route('mock-exam.hall', ['id' => $session->id]));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('mock-exam/hall')
        ->where('session.data.id', $session->id)
        ->has('questions')
        ->has('attempts')
    );
});
