<?php

use App\Http\Controllers\Admin\AdminDashboardWebController;
use App\Http\Controllers\Admin\AdminPathwayWebController;
use App\Http\Controllers\Admin\AdminQuestionWebController;
use App\Http\Controllers\Admin\AdminSubjectWebController;
use App\Http\Controllers\Admin\AdminTopicWebController;
use App\Http\Controllers\Admin\AdminUserWebController;
use App\Http\Controllers\Web\BookmarkWebController;
use App\Http\Controllers\Web\DashboardWebController;
use App\Http\Controllers\Web\DirectoryWebController;
use App\Http\Controllers\Web\MockExamWebController;
use App\Http\Controllers\Web\QBankWebController;
use App\Http\Controllers\Web\SpacedRepetitionWebController;
use App\Http\Controllers\Web\StudyPlannerWebController;
use App\Http\Controllers\Web\GuestPracticeWebController;
use App\Http\Controllers\Web\ExamReportDownloadController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Welcome landing page
Route::inertia('/', 'welcome')->name('home');

// Easy-PG Inspired Public Zero-Login Practice Features
Route::get('/choose', [GuestPracticeWebController::class, 'choose'])->name('choose');
Route::get('/subjects', [GuestPracticeWebController::class, 'subjects'])->name('public.subjects.index');
Route::get('/subjects/{slug}', [GuestPracticeWebController::class, 'subjectDetail'])->name('public.subjects.show');
Route::get('/about-medai', [GuestPracticeWebController::class, 'aboutMedAi'])->name('about-medai');
Route::match(['get', 'post'], '/practice/guest-launch', [GuestPracticeWebController::class, 'launchGuestPractice'])->name('practice.guest-launch');

// Standalone Printable / Downloadable Exam Report Scorecard
Route::get('/download/{id}', [ExamReportDownloadController::class, 'download'])->name('exam.download');

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

    // Clinical Bookmarks & Notes Notebook
    Route::get('/bookmarks', [BookmarkWebController::class, 'index'])->name('bookmarks.index');
});

// Admin Console & Content Management System
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardWebController::class, 'index'])->name('dashboard');

    // Subject Curriculum
    Route::get('/subjects', [AdminSubjectWebController::class, 'index'])->name('subjects.index');
    Route::post('/subjects', [AdminSubjectWebController::class, 'store'])->name('subjects.store');
    Route::put('/subjects/{subject}', [AdminSubjectWebController::class, 'update'])->name('subjects.update');
    Route::delete('/subjects/{subject}', [AdminSubjectWebController::class, 'destroy'])->name('subjects.destroy');

    // Topic & Subtopic Hierarchy
    Route::get('/topics', [AdminTopicWebController::class, 'index'])->name('topics.index');
    Route::post('/topics', [AdminTopicWebController::class, 'store'])->name('topics.store');
    Route::put('/topics/{topic}', [AdminTopicWebController::class, 'update'])->name('topics.update');
    Route::delete('/topics/{topic}', [AdminTopicWebController::class, 'destroy'])->name('topics.destroy');
    Route::post('/topics/{topic}/subtopics', [AdminTopicWebController::class, 'storeSubtopic'])->name('subtopics.store');
    Route::delete('/subtopics/{subtopic}', [AdminTopicWebController::class, 'destroySubtopic'])->name('subtopics.destroy');

    // MCQ Questions Bank
    Route::get('/questions', [AdminQuestionWebController::class, 'index'])->name('questions.index');
    Route::get('/questions/create', [AdminQuestionWebController::class, 'create'])->name('questions.create');
    Route::post('/questions', [AdminQuestionWebController::class, 'store'])->name('questions.store');
    Route::post('/questions/upload-image', [AdminQuestionWebController::class, 'uploadImage'])->name('questions.upload-image');
    Route::get('/questions/import', [AdminQuestionWebController::class, 'importView'])->name('questions.import');
    Route::post('/questions/import', [AdminQuestionWebController::class, 'importProcess'])->name('questions.import.process');
    Route::get('/questions/import/template/{format}', [AdminQuestionWebController::class, 'downloadTemplate'])->name('questions.import.template');
    Route::get('/questions/{question}/edit', [AdminQuestionWebController::class, 'edit'])->name('questions.edit');
    Route::put('/questions/{question}', [AdminQuestionWebController::class, 'update'])->name('questions.update');
    Route::delete('/questions/{question}', [AdminQuestionWebController::class, 'destroy'])->name('questions.destroy');
    Route::post('/questions/{question}/toggle-active', [AdminQuestionWebController::class, 'toggleActive'])->name('questions.toggle-active');

    // Exam Pathways & Blueprints
    Route::get('/pathways', [AdminPathwayWebController::class, 'index'])->name('pathways.index');
    Route::post('/pathways', [AdminPathwayWebController::class, 'store'])->name('pathways.store');
    Route::put('/pathways/{pathway}', [AdminPathwayWebController::class, 'update'])->name('pathways.update');
    Route::delete('/pathways/{pathway}', [AdminPathwayWebController::class, 'destroy'])->name('pathways.destroy');

    // User Directory & Role Assignment
    Route::get('/users', [AdminUserWebController::class, 'index'])->name('users.index');
    Route::post('/users/{user}/toggle-admin', [AdminUserWebController::class, 'toggleAdmin'])->name('users.toggle-admin');

    // 1-Click Storage Link Generator for Live Deployments
    Route::get('/storage-link', function () {
        try {
            \Illuminate\Support\Facades\Artisan::call('storage:link');
            $output = \Illuminate\Support\Facades\Artisan::output();
            return response()->json([
                'success' => true,
                'message' => 'Storage symlink created successfully (public/storage -> storage/app/public)',
                'output' => trim($output),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    })->name('storage-link');
});

// Fallback asset server for live environments where symlink() is missing or disabled
Route::get('/storage/{path}', function (string $path) {
    $basePath = realpath(storage_path('app/public'));
    $fullPath = realpath(storage_path('app/public/'.$path));
    if (! $basePath || ! $fullPath || ! str_starts_with($fullPath, $basePath) || is_dir($fullPath)) {
        abort(404);
    }
    return response()->file($fullPath, [
        'Cache-Control' => 'public, max-age=86400',
    ]);
})->where('path', '.*')->name('storage.fallback');

require __DIR__.'/settings.php';

