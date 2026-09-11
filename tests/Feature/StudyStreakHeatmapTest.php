<?php

use App\Domain\Analytics\StudyStreakService;
use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\TestSession;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

function createTestAttempt(User $user, TestSession $session, Question $question, $createdAt, bool $isCorrect = true): QuestionAttempt
{
    $attempt = new QuestionAttempt([
        'user_id' => $user->id,
        'session_id' => $session->id,
        'question_id' => $question->id,
        'selected_option' => 'A',
        'is_correct' => $isCorrect,
    ]);
    $attempt->timestamps = false;
    $attempt->created_at = $createdAt;
    $attempt->updated_at = $createdAt;
    $attempt->save();

    return $attempt;
}

test('StudyStreakService calculates consecutive daily streak and 30-day punchcard', function () {
    $candidate = User::factory()->create([
        'is_admin' => false,
        'daily_mcq_target' => 50,
    ]);

    $session = TestSession::create([
        'user_id' => $candidate->id,
        'title' => 'Streak Test Session',
        'session_type' => 'PRACTICE',
        'exam_pathway' => 'INI_CET',
        'total_questions' => 10,
        'duration_seconds' => 1800,
        'started_at' => now(),
    ]);

    $question = Question::firstOrFail();
    $now = Carbon::now();

    // Create attempts for today, yesterday, and 2 days ago (3-day streak)
    createTestAttempt($candidate, $session, $question, $now->copy()->subDays(2));
    createTestAttempt($candidate, $session, $question, $now->copy()->subDays(1));
    createTestAttempt($candidate, $session, $question, $now->copy(), true);
    createTestAttempt($candidate, $session, $question, $now->copy(), false);

    $service = app(StudyStreakService::class);
    $result = $service->calculate($candidate, $now);

    expect($result)->toHaveKeys([
        'current_streak',
        'longest_streak',
        'total_30d_attempts',
        'active_days_30d',
        'target_met_days',
        'target_completion_rate',
        'daily_target',
        'today_attempts',
        'days',
    ]);

    expect($result['current_streak'])->toBe(3);
    expect($result['longest_streak'])->toBeGreaterThanOrEqual(3);
    expect($result['total_30d_attempts'])->toBe(4);
    expect($result['active_days_30d'])->toBe(3);
    expect($result['today_attempts'])->toBe(2);
    expect($result['days'])->toHaveCount(30);

    // Verify today's cell (last item in 30-day array)
    $todayCell = end($result['days']);
    expect($todayCell['date'])->toBe($now->format('Y-m-d'));
    expect($todayCell['is_today'])->toBeTrue();
    expect($todayCell['attempts_count'])->toBe(2);
    expect($todayCell['correct_count'])->toBe(1);
    expect($todayCell['accuracy'])->toBe(50.0);
});

test('StudyStreakService keeps streak active if user studied yesterday but has not studied today yet', function () {
    $candidate = User::factory()->create([
        'is_admin' => false,
        'daily_mcq_target' => 50,
    ]);

    $session = TestSession::create([
        'user_id' => $candidate->id,
        'title' => 'Streak Test Session',
        'session_type' => 'PRACTICE',
        'exam_pathway' => 'INI_CET',
        'total_questions' => 10,
        'duration_seconds' => 1800,
        'started_at' => now(),
    ]);

    $question = Question::firstOrFail();
    $now = Carbon::now();

    // Attempts yesterday and 2 days ago, but NONE today
    createTestAttempt($candidate, $session, $question, $now->copy()->subDays(2));
    createTestAttempt($candidate, $session, $question, $now->copy()->subDays(1));

    $service = app(StudyStreakService::class);
    $result = $service->calculate($candidate, $now);

    expect($result['current_streak'])->toBe(2);
    expect($result['today_attempts'])->toBe(0);
});

test('StudyStreakService resets streak to 0 if no attempts in the last 2 days', function () {
    $candidate = User::factory()->create([
        'is_admin' => false,
    ]);

    $session = TestSession::create([
        'user_id' => $candidate->id,
        'title' => 'Streak Test Session',
        'session_type' => 'PRACTICE',
        'exam_pathway' => 'INI_CET',
        'total_questions' => 10,
        'duration_seconds' => 1800,
        'started_at' => now(),
    ]);

    $question = Question::firstOrFail();
    $now = Carbon::now();

    // Attempt 3 days ago only
    createTestAttempt($candidate, $session, $question, $now->copy()->subDays(3));

    $service = app(StudyStreakService::class);
    $result = $service->calculate($candidate, $now);

    expect($result['current_streak'])->toBe(0);
    expect($result['longest_streak'])->toBeGreaterThanOrEqual(1);
});

test('Dashboard route passes studyStreak to Inertia page', function () {
    $user = User::where('email', 'dr.cortex@example.com')->firstOrFail();
    $user->update(['is_admin' => false]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('studyStreak')
        ->has('studyStreak.current_streak')
        ->has('studyStreak.longest_streak')
        ->has('studyStreak.days')
        ->where('studyStreak.days', fn ($days) => count($days) === 30)
    );
});
