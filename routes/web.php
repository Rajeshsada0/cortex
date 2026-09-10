<?php

use App\Http\Controllers\Web\DashboardWebController;
use App\Http\Controllers\Web\DirectoryWebController;
use App\Http\Controllers\Web\MockExamWebController;
use App\Http\Controllers\Web\QBankWebController;
use App\Http\Controllers\Web\SpacedRepetitionWebController;
use App\Http\Controllers\Web\StudyPlannerWebController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Welcome landing page
Route::inertia('/', 'welcome')->name('home');

// Quick 1-click demo login helper for Dr. Cortex
Route::get('/demo-login', function () {
    $user = User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
    if ($user) {
        Auth::login($user);
    }

    if ($user && $user->is_admin) {
        return redirect()->route('admin.dashboard');
    }

    return redirect()->route('dashboard');
})->name('demo-login');

Route::middleware(['auth', 'candidate'])->group(function () {
    Route::get('/dashboard', DashboardWebController::class)->name('dashboard');

    // Q-Bank & Interactive MCQ Runner
    Route::get('/qbank', [QBankWebController::class, 'index'])->name('qbank.index');
    Route::get('/qbank/runner', [QBankWebController::class, 'runner'])->name('qbank.runner');

    // 19-Subject Medical Directory
    Route::get('/directory', DirectoryWebController::class)->name('directory.index');

    // Standardized Mock Exam Hall
    Route::get('/mock-exam', [MockExamWebController::class, 'index'])->name('mock-exam.index');
    Route::post('/mock-exam/launch', [MockExamWebController::class, 'launch'])->name('mock-exam.launch');
    Route::get('/mock-exam/{id}/hall', [MockExamWebController::class, 'hall'])->name('mock-exam.hall');
    Route::get('/mock-exam/{id}/result', [MockExamWebController::class, 'result'])->name('mock-exam.result');

    // Spaced Repetition Queue Review
    Route::get('/spaced-repetition', SpacedRepetitionWebController::class)->name('spaced-repetition.index');

    // Study Planner
    Route::get('/planner', StudyPlannerWebController::class)->name('planner.index');
});

// Admin Console & Content Management System
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\AdminDashboardWebController::class, 'index'])->name('dashboard');

    // Subject Curriculum
    Route::get('/subjects', [\App\Http\Controllers\Admin\AdminSubjectWebController::class, 'index'])->name('subjects.index');
    Route::post('/subjects', [\App\Http\Controllers\Admin\AdminSubjectWebController::class, 'store'])->name('subjects.store');
    Route::put('/subjects/{subject}', [\App\Http\Controllers\Admin\AdminSubjectWebController::class, 'update'])->name('subjects.update');
    Route::delete('/subjects/{subject}', [\App\Http\Controllers\Admin\AdminSubjectWebController::class, 'destroy'])->name('subjects.destroy');

    // Topic & Subtopic Hierarchy
    Route::get('/topics', [\App\Http\Controllers\Admin\AdminTopicWebController::class, 'index'])->name('topics.index');
    Route::post('/topics', [\App\Http\Controllers\Admin\AdminTopicWebController::class, 'store'])->name('topics.store');
    Route::put('/topics/{topic}', [\App\Http\Controllers\Admin\AdminTopicWebController::class, 'update'])->name('topics.update');
    Route::delete('/topics/{topic}', [\App\Http\Controllers\Admin\AdminTopicWebController::class, 'destroy'])->name('topics.destroy');
    Route::post('/topics/{topic}/subtopics', [\App\Http\Controllers\Admin\AdminTopicWebController::class, 'storeSubtopic'])->name('subtopics.store');
    Route::delete('/subtopics/{subtopic}', [\App\Http\Controllers\Admin\AdminTopicWebController::class, 'destroySubtopic'])->name('subtopics.destroy');

    // MCQ Questions Bank
    Route::get('/questions', [\App\Http\Controllers\Admin\AdminQuestionWebController::class, 'index'])->name('questions.index');
    Route::get('/questions/create', [\App\Http\Controllers\Admin\AdminQuestionWebController::class, 'create'])->name('questions.create');
    Route::post('/questions', [\App\Http\Controllers\Admin\AdminQuestionWebController::class, 'store'])->name('questions.store');
    Route::get('/questions/{question}/edit', [\App\Http\Controllers\Admin\AdminQuestionWebController::class, 'edit'])->name('questions.edit');
    Route::put('/questions/{question}', [\App\Http\Controllers\Admin\AdminQuestionWebController::class, 'update'])->name('questions.update');
    Route::delete('/questions/{question}', [\App\Http\Controllers\Admin\AdminQuestionWebController::class, 'destroy'])->name('questions.destroy');
    Route::post('/questions/{question}/toggle-active', [\App\Http\Controllers\Admin\AdminQuestionWebController::class, 'toggleActive'])->name('questions.toggle-active');

    // Exam Pathways & Blueprints
    Route::get('/pathways', [\App\Http\Controllers\Admin\AdminPathwayWebController::class, 'index'])->name('pathways.index');

    // User Directory & Role Assignment
    Route::get('/users', [\App\Http\Controllers\Admin\AdminUserWebController::class, 'index'])->name('users.index');
    Route::post('/users/{user}/toggle-admin', [\App\Http\Controllers\Admin\AdminUserWebController::class, 'toggleAdmin'])->name('users.toggle-admin');
});

require __DIR__.'/settings.php';
