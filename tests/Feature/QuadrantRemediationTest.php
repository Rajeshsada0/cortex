<?php

use App\Domain\Analytics\PerformanceQuadrantService;
use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

test('PerformanceQuadrantService extracts quadrant question IDs accurately', function () {
    $user = User::where('email', 'dr.cortex@example.com')->firstOrFail();
    $service = new PerformanceQuadrantService;

    $hazardousIds = $service->getQuadrantQuestionIds($user, 'hazardous');
    $unstableIds = $service->getQuadrantQuestionIds($user, 'unstable');
    $masteredIds = $service->getQuadrantQuestionIds($user, 'mastered');
    $gapIds = $service->getQuadrantQuestionIds($user, 'gap');

    expect($hazardousIds)->toBeArray()->not->toBeEmpty();
    expect($unstableIds)->toBeArray()->not->toBeEmpty();
    expect($masteredIds)->toBeArray()->not->toBeEmpty();
    expect($gapIds)->toBeArray()->not->toBeEmpty();
});

test('Question scopeStatus filters HAZARDOUS and UNSTABLE questions', function () {
    $user = User::where('email', 'dr.cortex@example.com')->firstOrFail();

    $hazardousQuestions = Question::status($user, 'HAZARDOUS')->get();
    $unstableQuestions = Question::status($user, 'UNSTABLE')->get();

    expect($hazardousQuestions->count())->toBeGreaterThanOrEqual(1);
    expect($unstableQuestions->count())->toBeGreaterThanOrEqual(1);

    // Verify hazardous questions have an attempt with is_correct = false & confidence = HIGH
    foreach ($hazardousQuestions as $q) {
        $attempt = QuestionAttempt::where('user_id', $user->id)
            ->where('question_id', $q->id)
            ->where('is_correct', false)
            ->where('confidence', 'HIGH')
            ->first();
        expect($attempt)->not->toBeNull();
    }

    // Verify unstable questions have an attempt with is_correct = true & confidence != HIGH
    foreach ($unstableQuestions as $q) {
        $attempt = QuestionAttempt::where('user_id', $user->id)
            ->where('question_id', $q->id)
            ->where('is_correct', true)
            ->where('confidence', '!=', 'HIGH')
            ->first();
        expect($attempt)->not->toBeNull();
    }
});

test('Candidate can launch instant Hazardous Blind Spot remediation session', function () {
    $user = User::where('email', 'dr.cortex@example.com')->firstOrFail();
    $user->update(['is_admin' => false]);

    $response = $this->actingAs($user)
        ->get('/qbank/runner?quadrant=hazardous&mode=TUTOR');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('qbank/runner')
        ->has('session')
        ->where('session.data.title', 'Hazardous Blind Spot Remediation (INI_CET)')
        ->has('questions')
        ->where('mode', 'TUTOR')
    );
});

test('Candidate can launch instant Lucky Guess / Unstable remediation session', function () {
    $user = User::where('email', 'dr.cortex@example.com')->firstOrFail();
    $user->update(['is_admin' => false]);

    $response = $this->actingAs($user)
        ->get('/qbank/runner?quadrant=unstable&mode=TUTOR');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('qbank/runner')
        ->has('session')
        ->where('session.data.title', 'Lucky Guess & Unstable Remediation (INI_CET)')
        ->has('questions')
    );
});

test('Q-Bank builder index displays hazardous and unstable question counts', function () {
    $user = User::where('email', 'dr.cortex@example.com')->firstOrFail();
    $user->update(['is_admin' => false]);

    $response = $this->actingAs($user)->get('/qbank');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('qbank/index')
        ->has('counts.hazardous')
        ->has('counts.unstable')
        ->where('counts.hazardous', fn ($val) => $val >= 1)
        ->where('counts.unstable', fn ($val) => $val >= 1)
    );
});
