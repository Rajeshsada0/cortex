<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\ClinicalScenario;
use App\Models\ClinicalScenarioAttempt;
use App\Models\ExamPathway;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CsqWebController extends Controller
{
    /**
     * Display the CSQ Computerized Mock Exam Hub / Overview.
     */
    public function index(Request $request): Response
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $pathwayCode = $user->active_pathway ?? 'NMC';

        // Check if there are scenarios for the user's pathway; fallback to all active
        $pathwayCount = ClinicalScenario::active()->forPathway($pathwayCode)->count();
        $totalActiveScenarios = ClinicalScenario::active()->count();

        // Get past attempts
        $attempts = ClinicalScenarioAttempt::where('user_id', $user->id)
            ->latest('created_at')
            ->take(10)
            ->get();

        $totalAttempts = ClinicalScenarioAttempt::where('user_id', $user->id)->count();
        $passedAttempts = ClinicalScenarioAttempt::where('user_id', $user->id)->where('is_passed', true)->count();
        $bestAttempt = ClinicalScenarioAttempt::where('user_id', $user->id)->orderByDesc('percentage')->first();

        $pathwayModel = ExamPathway::where('code', $pathwayCode)->first();

        return Inertia::render('csq/index', [
            'user' => $user,
            'activePathway' => $pathwayCode,
            'pathwayName' => $pathwayModel?->name ?? 'Nepal Medical Council (NMC)',
            'pathwayScenariosCount' => $pathwayCount > 0 ? $pathwayCount : $totalActiveScenarios,
            'totalActiveScenarios' => $totalActiveScenarios,
            'attempts' => $attempts,
            'stats' => [
                'total_attempts' => $totalAttempts,
                'passed_attempts' => $passedAttempts,
                'pass_rate' => $totalAttempts > 0 ? round(($passedAttempts / $totalAttempts) * 100) : 0,
                'best_score' => $bestAttempt ? "{$bestAttempt->total_score} / {$bestAttempt->total_questions} ({$bestAttempt->percentage}%)" : null,
                'last_attempt_at' => $attempts->first()?->created_at?->diffForHumans(),
            ],
        ]);
    }

    /**
     * Active Computerized CSQ Examination Hall.
     */
    public function runner(Request $request): Response
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $requestedPathway = $request->query('pathway', $user->active_pathway ?? 'NMC');

        // Fetch scenarios for pathway, or all active if none specific
        $scenariosQuery = ClinicalScenario::active()
            ->with(['questions' => fn ($q) => $q->orderBy('question_number')->orderBy('order_index')])
            ->forPathway($requestedPathway)
            ->orderBy('order_index');

        $scenarios = $scenariosQuery->get();

        if ($scenarios->isEmpty()) {
            $scenarios = ClinicalScenario::active()
                ->with(['questions' => fn ($q) => $q->orderBy('question_number')->orderBy('order_index')])
                ->orderBy('order_index')
                ->get();
        }

        $formattedScenarios = $scenarios->map(function ($s) {
            return [
                'id' => $s->id,
                'discipline' => $s->discipline,
                'title' => $s->title,
                'stem' => $s->stem,
                'vitals' => $s->vitals,
                'questions' => $s->questions->map(function ($q) {
                    return [
                        'id' => $q->id,
                        'question_number' => $q->question_number,
                        'stem' => $q->stem,
                        'options' => $q->options,
                        'correct_option' => $q->correct_option,
                        'explanation' => $q->explanation,
                    ];
                }),
            ];
        });

        $pathwayModel = ExamPathway::where('code', $requestedPathway)->first();

        return Inertia::render('csq/runner', [
            'scenarios' => $formattedScenarios,
            'durationMinutes' => 30, // Standard 30-minute block for 4 CSQ stations
            'pathwayCode' => $requestedPathway,
            'pathwayName' => $pathwayModel?->name ?? 'Nepal Medical Council (NMC)',
            'passingBenchmark' => 50, // NMC 50% cutoff
        ]);
    }

    /**
     * Submit completed CSQ exam results.
     */
    public function submit(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $validated = $request->validate([
            'pathway_code' => 'nullable|string|max:50',
            'time_spent_seconds' => 'required|integer|min:0',
            'total_stations' => 'required|integer|min:1',
            'total_questions' => 'required|integer|min:1',
            'total_score' => 'required|integer|min:0',
            'percentage' => 'required|numeric|min:0|max:100',
            'is_passed' => 'required|boolean',
            'station_results' => 'required|array',
        ]);

        $attempt = ClinicalScenarioAttempt::create([
            'user_id' => $user->id,
            'pathway_code' => $validated['pathway_code'] ?? 'NMC',
            'total_stations' => $validated['total_stations'],
            'total_questions' => $validated['total_questions'],
            'total_score' => $validated['total_score'],
            'percentage' => $validated['percentage'],
            'is_passed' => $validated['is_passed'],
            'time_spent_seconds' => $validated['time_spent_seconds'],
            'station_results' => $validated['station_results'],
        ]);

        return response()->json([
            'success' => true,
            'attempt_id' => $attempt->id,
            'message' => 'Examination session successfully recorded.',
        ]);
    }
}
