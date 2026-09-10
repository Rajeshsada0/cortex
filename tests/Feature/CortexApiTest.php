<?php

use App\Models\Question;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

test('GET /api/v1/exam-configs/{pathway} returns blueprint and negative marking rules', function () {
    $response = $this->getJson('/api/v1/exam-configs/MECEE_PG');
    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('config.negative_marking_penalty', 0.25)
        ->assertJsonPath('config.total_questions', 200);

    $response2 = $this->getJson('/api/v1/exam-configs/INI_CET');
    $response2->assertOk()
        ->assertJsonPath('config.negative_marking_penalty', 0.33);

    $response3 = $this->getJson('/api/v1/exam-configs/USMLE_STEP1');
    $response3->assertOk()
        ->assertJsonPath('config.scoring_type', 'PASS_FAIL');
});

test('GET /api/v1/questions returns paginated questions with anti-scraping watermark', function () {
    $response = $this->getJson('/api/v1/questions');
    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id', 'code', 'stem', 'correct_option', 'options', 'watermark',
                ],
            ],
            'meta',
        ]);
});

test('POST /api/v1/test-sessions initializes session and accepts attempts', function () {
    $user = User::where('email', 'dr.cortex@example.com')->firstOrFail();

    $response = $this->actingAs($user)->postJson('/api/v1/test-sessions', [
        'title' => 'Cardiology Sprint Test',
        'session_type' => 'PRACTICE',
        'exam_pathway' => 'INI_CET',
        'limit' => 5,
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true);

    $sessionId = $response->json('session.id');
    $question = Question::firstOrFail();

    // Record attempt
    $attemptResponse = $this->actingAs($user)->postJson("/api/v1/test-sessions/{$sessionId}/attempts", [
        'question_id' => $question->id,
        'selected_option' => $question->correct_option,
        'confidence' => 'HIGH',
        'time_taken_seconds' => 40,
    ]);

    $attemptResponse->assertOk()
        ->assertJsonPath('is_correct', true);

    // Submit session
    $submitResponse = $this->actingAs($user)->postJson("/api/v1/test-sessions/{$sessionId}/submit", [
        'time_spent_seconds' => 120,
    ]);

    $submitResponse->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('session.is_completed', true);
});

test('GET /api/v1/analytics/readiness returns 5 weighted components', function () {
    $response = $this->getJson('/api/v1/analytics/readiness');
    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure([
            'data' => [
                'readiness_score',
                'components' => [
                    'recent_accuracy',
                    'curriculum_coverage',
                    'mock_performance',
                    'srs_clearance_rate',
                    'stability_penalty',
                ],
            ],
        ]);
});
