<?php

use App\Domain\Analytics\PerformanceQuadrantService;
use App\Domain\Analytics\ReadinessScoreCalculator;
use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

test('Database has 19 subjects and seeded questions', function () {
    expect(Subject::count())->toBe(19);
    expect(Question::count())->toBeGreaterThanOrEqual(7);
});

test('ReadinessScoreCalculator computes score for seeded user', function () {
    $user = User::where('email', 'dr.cortex@example.com')->firstOrFail();
    $calculator = new ReadinessScoreCalculator;
    $result = $calculator->calculate($user);

    expect($result)->toHaveKeys(['readiness_score', 'components', 'weights']);
    expect($result['readiness_score'])->toBeGreaterThan(0.0)->toBeLessThanOrEqual(100.0);
    expect($result['components'])->toHaveKeys([
        'recent_accuracy',
        'curriculum_coverage',
        'mock_performance',
        'srs_clearance_rate',
        'stability_penalty',
    ]);
});

test('PerformanceQuadrantService categorizes into 4 quadrants', function () {
    $user = User::where('email', 'dr.cortex@example.com')->firstOrFail();
    $quadrantService = new PerformanceQuadrantService;
    $breakdown = $quadrantService->getQuadrantBreakdown($user);

    expect($breakdown['quadrants'])->toHaveKeys(['mastered', 'hazardous', 'unstable', 'gap']);
    expect($breakdown['quadrants']['mastered']['count'])->toBeGreaterThanOrEqual(1);
    expect($breakdown['quadrants']['hazardous']['count'])->toBeGreaterThanOrEqual(1);
    expect($breakdown['quadrants']['unstable']['count'])->toBeGreaterThanOrEqual(1);
    expect($breakdown['quadrants']['gap']['count'])->toBeGreaterThanOrEqual(1);
});
