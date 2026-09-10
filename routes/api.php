<?php

use App\Http\Controllers\Api\V1\AnalyticsController;
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
    // Exam Configurations & Pathways
    Route::get('/exam-configs/{pathway}', [ExamConfigController::class, 'show'])->name('api.v1.exam-configs.show');

    // Current User Profile & Pathway Switcher
    Route::get('/users/me', [UserController::class, 'me'])->name('api.v1.users.me');
    Route::patch('/users/me', [UserController::class, 'updatePathway'])->name('api.v1.users.update-pathway');

    // 19 Medical Subjects & Progress
    Route::get('/subjects', [SubjectController::class, 'index'])->name('api.v1.subjects.index');
    Route::get('/analytics/subject-progress', [SubjectController::class, 'progress'])->name('api.v1.analytics.subject-progress');

    // Question Bank (Q-Bank)
    Route::get('/questions', [QuestionController::class, 'index'])->name('api.v1.questions.index');
    Route::get('/questions/{id}', [QuestionController::class, 'show'])->name('api.v1.questions.show');

    // Test Sessions & MCQ Runner
    Route::post('/test-sessions', [TestSessionController::class, 'store'])->name('api.v1.test-sessions.store');
    Route::get('/test-sessions/{id}', [TestSessionController::class, 'show'])->name('api.v1.test-sessions.show');
    Route::post('/test-sessions/{id}/attempts', [TestSessionController::class, 'recordAttempt'])->name('api.v1.test-sessions.attempts');
    Route::post('/test-sessions/{id}/submit', [TestSessionController::class, 'submit'])->name('api.v1.test-sessions.submit');

    // Spaced Repetition (SM-2 / FSRS Dual-Metric)
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
});
