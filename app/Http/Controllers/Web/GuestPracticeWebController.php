<?php

namespace App\Http\Controllers\Web;

use App\Domain\Scoring\ExamPathway;
use App\Domain\TestSession\TestSessionService;
use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class GuestPracticeWebController extends Controller
{
    public function __construct(
        private readonly TestSessionService $testSessionService
    ) {}

    /**
     * Public Practice Hub (/choose) - Choose an Exam Track
     */
    public function choose(Request $request): Response
    {
        $user = $request->user();

        $tracks = [
            [
                'id' => 'usmle-step1',
                'pathway' => ExamPathway::USMLE_STEP1->value,
                'name' => 'USMLE Step 1',
                'region' => 'United States',
                'description' => 'Integrated basic science vignettes. Systems-based, mechanism-heavy practice.',
                'questions' => 280,
                'blocks' => 7,
                'duration' => '7 Blocks (60 min each)',
                'marking' => 'Pass / Fail Target',
                'color' => 'from-blue-600 to-indigo-700',
                'accent' => '#0066FF',
                'badge' => 'NBME Style',
            ],
            [
                'id' => 'usmle-step2',
                'pathway' => ExamPathway::USMLE_STEP2CK->value,
                'name' => 'USMLE Step 2 CK',
                'region' => 'United States',
                'description' => 'Clinical decision-making, diagnosis vs next-best-step management, and patient safety.',
                'questions' => 318,
                'blocks' => 8,
                'duration' => '8 Blocks (60 min each)',
                'marking' => '3-Digit Scaled Score (1-300)',
                'color' => 'from-cyan-600 to-blue-700',
                'accent' => '#06B6D4',
                'badge' => 'Clinical Mastery',
            ],
            [
                'id' => 'neet-pg',
                'pathway' => ExamPathway::NEET_PG->value,
                'name' => 'NEET-PG (2026)',
                'region' => 'India',
                'description' => 'India’s national PG entrance. Rapid clinical stems, image-style findings, and strict negative marking.',
                'questions' => 180,
                'blocks' => 5,
                'duration' => '3.5 Hours (210 min)',
                'marking' => '+4.0 / -1.0 Marking (720 Marks)',
                'color' => 'from-emerald-600 to-teal-700',
                'accent' => '#10B981',
                'badge' => '+4 / -1 Marking',
            ],
            [
                'id' => 'cee',
                'pathway' => ExamPathway::MECEE_PG->value,
                'name' => 'CEE PG — Nepal',
                'region' => 'Nepal',
                'description' => 'MEC MECEE-PG for MD/MS. Concise stems, Nepal health guidelines, CPD module, and negative marking.',
                'questions' => 200,
                'blocks' => 4,
                'duration' => '3 Hours (180 min)',
                'marking' => '+1.0 / -0.25 Marking (200 Marks)',
                'color' => 'from-red-600 to-rose-700',
                'accent' => '#EF4444',
                'badge' => 'MEC MECEE-PG',
            ],
        ];

        $totalQuestions = Question::where('is_active', true)->count();
        $totalSubjects = Subject::count();

        return Inertia::render('choose', [
            'tracks' => $tracks,
            'totalQuestions' => $totalQuestions,
            'totalSubjects' => $totalSubjects,
            'currentUser' => $user,
        ]);
    }

    /**
     * Public Subjects Directory (/subjects)
     */
    public function subjects(Request $request): Response
    {
        $user = $request->user();

        $subjects = Subject::withCount(['questions' => function ($q) {
            $q->where('is_active', true);
        }, 'topics'])->orderBy('name')->get();

        return Inertia::render('subjects/index', [
            'subjects' => $subjects,
            'currentUser' => $user,
        ]);
    }

    /**
     * Public Subject Topic Detail (/subjects/{slug})
     */
    public function subjectDetail(Request $request, string $slug): Response
    {
        $user = $request->user();

        $subject = Subject::where('slug', $slug)
            ->orWhere('id', $slug)
            ->with(['topics' => function ($q) {
                $q->withCount(['questions' => function ($qq) {
                    $qq->where('is_active', true);
                }]);
            }])
            ->firstOrFail();

        $totalSubjectQuestions = Question::where('subject_id', $subject->id)
            ->where('is_active', true)
            ->count();

        return Inertia::render('subjects/show', [
            'subject' => $subject,
            'totalQuestions' => $totalSubjectQuestions,
            'topics' => $subject->topics,
            'currentUser' => $user,
        ]);
    }

    /**
     * About MedAI Question Engine (/about-medai)
     */
    public function aboutMedAi(): Response
    {
        return Inertia::render('about-medai');
    }

    /**
     * 1-Click Frictionless Exam / Quiz Launcher (No Login Required)
     */
    public function launchGuestPractice(Request $request)
    {
        $user = $request->user();

        // If no user is logged in, transparently authenticate or provision a guest candidate session
        if (! $user) {
            $user = User::firstOrCreate(
                ['email' => 'guest.candidate@cortex.med'],
                [
                    'name' => 'Guest Candidate (No Login)',
                    'password' => bcrypt(str()->random(24)),
                    'is_admin' => false,
                    'active_pathway' => 'NEET_PG',
                    'daily_study_hours' => 4,
                    'daily_mcq_target' => 40,
                ]
            );

            Auth::login($user, true);
        }

        $pathwayInput = $request->input('pathway', $user->active_pathway ?? 'NEET_PG');
        $pathway = ExamPathway::tryFrom($pathwayInput) ?? ExamPathway::NEET_PG;

        // Check if subject or topic specific practice
        $subjectId = $request->input('subject_id');
        $topicId = $request->input('topic_id');
        $isStudyMode = $request->boolean('study_mode', ! empty($subjectId) || ! empty($topicId));

        $targetQuestions = (int) $request->input('target_questions', ($subjectId || $topicId) ? 40 : $pathway->targetQuestions());
        $durationMinutes = (int) $request->input('duration_minutes', ($subjectId || $topicId) ? 45 : $pathway->durationMinutes());

        if ($subjectId || $topicId) {
            $subject = $subjectId ? Subject::find($subjectId) : null;
            $topic = $topicId ? Topic::find($topicId) : null;
            $title = ($topic ? $topic->name : ($subject ? $subject->name : 'Specialty')) . ' Drill (40 MCQs)';

            $result = $this->testSessionService->createSession(
                user: $user,
                title: $title,
                sessionType: 'PRACTICE',
                examPathway: $pathway->value,
                subjectId: $subjectId,
                topicId: $topicId,
                limit: $targetQuestions,
                durationMinutes: $durationMinutes
            );

            return redirect()->route('mock-exam.hall', [
                'id' => $result['session']->id,
                'study_mode' => $isStudyMode ? '1' : '0',
            ]);
        }

        // Full blueprint mock
        $result = $this->testSessionService->createBlueprintMockSession(
            user: $user,
            pathway: $pathway,
            targetQuestions: $targetQuestions,
            durationMinutes: $durationMinutes
        );

        return redirect()->route('mock-exam.hall', ['id' => $result['session']->id]);
    }
}
