<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ClinicalScenario;
use App\Models\ClinicalScenarioAttempt;
use App\Models\ExamPathway;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CsqController extends Controller
{
    /**
     * Get Clinical Scenarios for pathway with past attempts and stats
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $pathway = $request->query('pathway', $user?->active_pathway ?? 'MECEE_PG');

        $scenariosQuery = ClinicalScenario::active()
            ->with(['questions' => fn ($q) => $q->orderBy('question_number')->orderBy('order_index')])
            ->forPathway($pathway)
            ->orderBy('order_index');

        $scenarios = $scenariosQuery->get();
        if ($scenarios->isEmpty()) {
            $scenarios = ClinicalScenario::active()
                ->with(['questions' => fn ($q) => $q->orderBy('question_number')->orderBy('order_index')])
                ->orderBy('order_index')
                ->get();
        }

        $userId = $user?->id ?? 0;
        $totalAttempts = ClinicalScenarioAttempt::where('user_id', $userId)->count();
        $passedAttempts = ClinicalScenarioAttempt::where('user_id', $userId)->where('is_passed', true)->count();
        $bestAttempt = ClinicalScenarioAttempt::where('user_id', $userId)->orderByDesc('percentage')->first();
        $recentAttempts = ClinicalScenarioAttempt::where('user_id', $userId)->latest('created_at')->take(5)->get();

        $pathwayModel = ExamPathway::where('code', $pathway)->first();

        return response()->json([
            'success' => true,
            'pathway' => [
                'code' => $pathway,
                'name' => $pathwayModel?->name ?? $pathway,
            ],
            'stats' => [
                'total_attempts' => $totalAttempts,
                'passed_attempts' => $passedAttempts,
                'pass_rate' => $totalAttempts > 0 ? round(($passedAttempts / $totalAttempts) * 100) : 0,
                'best_score' => $bestAttempt ? "{$bestAttempt->total_score}/{$bestAttempt->total_questions} ({$bestAttempt->percentage}%)" : 'N/A',
            ],
            'scenarios' => $scenarios->map(fn ($s) => [
                'id' => $s->id,
                'discipline' => $s->discipline,
                'title' => $s->title,
                'stem' => $s->stem,
                'vitals' => $s->vitals,
                'questions_count' => $s->questions->count(),
                'questions' => $s->questions->map(fn ($q) => [
                    'id' => $q->id,
                    'question_number' => $q->question_number,
                    'stem' => $q->stem,
                    'options' => $q->options,
                    'correct_option' => $q->correct_option,
                    'explanation' => $q->explanation,
                ]),
            ]),
            'recent_attempts' => $recentAttempts,
        ]);
    }

    /**
     * Submit completed CSQ station exam
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
            'user_id' => $user?->id ?? 1,
            'pathway_code' => $validated['pathway_code'] ?? 'MECEE_PG',
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
            'message' => 'CSQ simulation successfully graded and recorded.',
            'summary' => [
                'total_score' => $attempt->total_score,
                'total_questions' => $attempt->total_questions,
                'percentage' => $attempt->percentage,
                'is_passed' => $attempt->is_passed,
            ],
        ]);
    }
}
