<?php

use App\Domain\Analytics\NationalRankPredictor;
use App\Domain\Scoring\ExamPathway;
use App\Domain\TestSession\TestSessionService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

test('NationalRankPredictor predicts percentile, rank range, and specialty counselling', function () {
    $user = User::where('email', 'dr.cortex@example.com')->firstOrFail();
    $predictor = app(NationalRankPredictor::class);

    $prediction = $predictor->predict($user);

    expect($prediction)->toHaveKeys([
        'pathway',
        'pathway_label',
        'cohort_size',
        'percentile',
        'predicted_rank',
        'rank_range_min',
        'rank_range_max',
        'specialty_eligibility',
        'confidence_band',
        'tier_status',
    ]);

    expect($prediction['cohort_size'])->toBe(85000); // INI_CET cohort
    expect($prediction['percentile'])->toBeGreaterThan(0.0)->toBeLessThanOrEqual(100.0);
    expect($prediction['predicted_rank'])->toBeGreaterThanOrEqual(1)->toBeLessThanOrEqual(85000);
    expect($prediction['rank_range_min'])->toBeLessThanOrEqual($prediction['predicted_rank']);
    expect($prediction['rank_range_max'])->toBeGreaterThanOrEqual($prediction['predicted_rank']);
});

test('High score achieves top-tier rank and clinical branch eligibility', function () {
    $user = User::where('email', 'dr.cortex@example.com')->firstOrFail();
    $predictor = app(NationalRankPredictor::class);

    $topPrediction = $predictor->predict($user, 92.0);

    expect($topPrediction['percentile'])->toBeGreaterThanOrEqual(98.0);
    expect($topPrediction['predicted_rank'])->toBeLessThanOrEqual(2000);
    expect($topPrediction['tier_status'])->toContain('AIR Top 1%');
    expect($topPrediction['specialty_eligibility'])->toContain('Top-Tier Clinical MD/MS');
});

test('Dashboard renders NationalRankPredictor data correctly', function () {
    $user = User::where('email', 'dr.cortex@example.com')->firstOrFail();
    $user->update(['is_admin' => false]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('rankPrediction')
        ->has('rankPrediction.predicted_rank')
        ->has('rankPrediction.percentile')
        ->has('rankPrediction.specialty_eligibility')
    );
});

test('Mock Exam Result renders rank prediction on official scorecard', function () {
    $candidate = User::factory()->create([
        'is_admin' => false,
        'active_pathway' => 'INI_CET',
    ]);

    $service = app(TestSessionService::class);
    $result = $service->createBlueprintMockSession(
        user: $candidate,
        pathway: ExamPathway::INI_CET,
        targetQuestions: 5,
        durationMinutes: 30
    );

    $session = $result['session'];
    $session->update([
        'completed_at' => now(),
        'score_obtained' => 4.0,
    ]);

    $response = $this->actingAs($candidate)->get(route('mock-exam.result', ['id' => $session->id]));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('mock-exam/result')
        ->has('rankPrediction')
        ->has('rankPrediction.predicted_rank')
        ->has('rankPrediction.percentile')
    );
});
