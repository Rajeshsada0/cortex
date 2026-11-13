<?php

use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BookmarkNoteController;
use App\Http\Controllers\Api\V1\ExamConfigController;
use App\Http\Controllers\Api\V1\QuestionController;
use App\Http\Controllers\Api\V1\SpacedRepetitionController;
use App\Http\Controllers\Api\V1\StudyPlannerController;
use App\Http\Controllers\Api\V1\SubjectController;
use App\Http\Controllers\Api\V1\TestSessionController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Authentication Routes
    Route::post('/auth/login', [AuthController::class, 'login'])->name('api.v1.auth.login');
    Route::post('/auth/register', [AuthController::class, 'register'])->name('api.v1.auth.register');
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('api.v1.auth.logout');

    // Exam Configurations & Pathways
    Route::get('/exam-configs/{pathway}', [ExamConfigController::class, 'show'])->name('api.v1.exam-configs.show');

    // Clinical Dashboard Unified Data Feed
    Route::get('/dashboard', \App\Http\Controllers\Web\DashboardWebController::class)->name('api.v1.dashboard');

    // Current User Profile & Pathway Switcher
    Route::get('/users/me', [UserController::class, 'me'])->name('api.v1.users.me');
    Route::patch('/users/me', [UserController::class, 'updateProfile'])->name('api.v1.users.update-pathway');
    Route::match(['put', 'patch', 'post'], '/users/profile', [UserController::class, 'updateProfile'])->name('api.v1.users.update-profile');
    Route::post('/users/avatar', [UserController::class, 'updateAvatar'])->name('api.v1.users.avatar.update');
    Route::delete('/users/avatar', [UserController::class, 'deleteAvatar'])->name('api.v1.users.avatar.destroy');

    // 19 Medical Subjects & Progress
    Route::match(['get', 'post'], '/curriculum/seed', [SubjectController::class, 'seedCurriculum'])->name('api.v1.curriculum.seed');
    Route::get('/subjects', [SubjectController::class, 'index'])->name('api.v1.subjects.index');
    Route::get('/directory', [SubjectController::class, 'directory'])->name('api.v1.directory');
    Route::get('/analytics/subject-progress', [SubjectController::class, 'progress'])->name('api.v1.analytics.subject-progress');

    // Question Bank (Q-Bank)
    Route::get('/questions', [QuestionController::class, 'index'])->name('api.v1.questions.index');
    Route::get('/questions/{id}', [QuestionController::class, 'show'])->name('api.v1.questions.show');

    // Test Sessions & MCQ Runner
    Route::get('/test-sessions', [TestSessionController::class, 'index'])->name('api.v1.test-sessions.index');
    Route::post('/test-sessions', [TestSessionController::class, 'store'])->name('api.v1.test-sessions.store');
    Route::get('/test-sessions/{id}', [TestSessionController::class, 'show'])->name('api.v1.test-sessions.show');
    Route::post('/test-sessions/{id}/attempts', [TestSessionController::class, 'recordAttempt'])->name('api.v1.test-sessions.attempts');
    Route::post('/test-sessions/{id}/submit', [TestSessionController::class, 'submit'])->name('api.v1.test-sessions.submit');

    // Spaced Repetition (SM-2 / FSRS Dual-Metric) & Dynamic Flashcards
    Route::get('/flashcards', [SpacedRepetitionController::class, 'flashcards'])->name('api.v1.flashcards.index');
    Route::get('/spaced-repetition/due', [SpacedRepetitionController::class, 'due'])->name('api.v1.spaced-repetition.due');
    Route::post('/spaced-repetition/review', [SpacedRepetitionController::class, 'review'])->name('api.v1.spaced-repetition.review');

    // Analytics & Diagnostic Engine
    Route::get('/analytics/readiness', [AnalyticsController::class, 'readiness'])->name('api.v1.analytics.readiness');
    Route::get('/analytics/quadrants', [AnalyticsController::class, 'quadrants'])->name('api.v1.analytics.quadrants');

    // Study Planner
    Route::get('/study-planner', [StudyPlannerController::class, 'show'])->name('api.v1.study-planner.show');
    Route::post('/study-planner/recalculate', [StudyPlannerController::class, 'recalculate'])->name('api.v1.study-planner.recalculate');

    // Bookmarks & Personal Clinical Notes
    Route::get('/bookmarks', [BookmarkNoteController::class, 'index'])->name('api.v1.bookmarks.index');
    Route::post('/bookmarks', [BookmarkNoteController::class, 'toggleBookmark'])->name('api.v1.bookmarks.toggle');
    Route::post('/notes', [BookmarkNoteController::class, 'saveNote'])->name('api.v1.notes.save');

    // Clinical Scenario Questions (CSQ)
    Route::get('/csq', [\App\Http\Controllers\Api\V1\CsqController::class, 'index'])->name('api.v1.csq.index');
    Route::post('/csq/submit', [\App\Http\Controllers\Api\V1\CsqController::class, 'submit'])->name('api.v1.csq.submit');

    // Cortex AI Clinical Tutor & Medical Chatbot
    Route::post('/ai/chat', [\App\Http\Controllers\Api\V1\CortexAiController::class, 'chat'])->name('api.v1.ai.chat');
    Route::get('/ai/credits', [\App\Http\Controllers\Api\V1\CortexAiController::class, 'credits'])->name('api.v1.ai.credits');
    Route::post('/ai/credits/refill', [\App\Http\Controllers\Api\V1\CortexAiController::class, 'refillCredits'])->name('api.v1.ai.credits.refill');

    // Support Inquiries & Community Ratings
    Route::post('/support/inquiries', [\App\Http\Controllers\Api\V1\SupportInquiryController::class, 'store'])->name('api.v1.support.inquiries.store');
    Route::post('/app-ratings', [\App\Http\Controllers\Api\V1\AppRatingController::class, 'store'])->name('api.v1.app-ratings.store');
    Route::get('/app-ratings/summary', [\App\Http\Controllers\Api\V1\AppRatingController::class, 'summary'])->name('api.v1.app-ratings.summary');
});

