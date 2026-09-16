<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClinicalScenario;
use App\Models\ClinicalScenarioQuestion;
use App\Models\ExamPathway;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminCsqWebController extends Controller
{
    /**
     * Display a listing of clinical scenario stations.
     */
    public function index(Request $request): Response
    {
        $selectedPathway = $request->query('pathway');
        $selectedDiscipline = $request->query('discipline');
        $search = $request->query('search');

        $query = ClinicalScenario::withCount('questions')
            ->orderBy('order_index')
            ->orderBy('id');

        if ($selectedPathway && $selectedPathway !== 'ALL') {
            $query->where('pathway_code', $selectedPathway);
        }

        if ($selectedDiscipline && $selectedDiscipline !== 'ALL') {
            $query->where('discipline', $selectedDiscipline);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('discipline', 'like', "%{$search}%")
                    ->orWhere('stem', 'like', "%{$search}%");
            });
        }

        $scenarios = $query->get()->map(function ($s) {
            return [
                'id' => $s->id,
                'title' => $s->title,
                'discipline' => $s->discipline,
                'pathway_code' => $s->pathway_code,
                'vitals_preview' => $s->vitals ? substr($s->vitals, 0, 100) . '...' : null,
                'stem_preview' => substr($s->stem, 0, 140) . '...',
                'questions_count' => $s->questions_count,
                'order_index' => $s->order_index,
                'is_active' => $s->is_active,
                'created_at' => $s->created_at->format('M d, Y'),
            ];
        });

        $pathways = ExamPathway::where('is_active', true)
            ->orderBy('order_index')
            ->get(['code', 'name']);

        $disciplines = ClinicalScenario::distinct()
            ->whereNotNull('discipline')
            ->pluck('discipline');

        $totalScenarios = ClinicalScenario::count();
        $activeScenarios = ClinicalScenario::where('is_active', true)->count();
        $totalQuestions = ClinicalScenarioQuestion::count();

        return Inertia::render('admin/csq/index', [
            'scenarios' => $scenarios,
            'pathways' => $pathways,
            'disciplines' => $disciplines,
            'filters' => [
                'pathway' => $selectedPathway ?? 'ALL',
                'discipline' => $selectedDiscipline ?? 'ALL',
                'search' => $search ?? '',
            ],
            'stats' => [
                'total_scenarios' => $totalScenarios,
                'active_scenarios' => $activeScenarios,
                'total_questions' => $totalQuestions,
            ],
        ]);
    }

    /**
     * Show the form for creating a new clinical scenario.
     */
    public function create(): Response
    {
        $pathways = ExamPathway::where('is_active', true)
            ->orderBy('order_index')
            ->get(['code', 'name']);

        return Inertia::render('admin/csq/form', [
            'scenario' => null,
            'pathways' => $pathways,
        ]);
    }

    /**
     * Store a newly created clinical scenario and its 5 questions.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'discipline' => 'required|string|max:150',
            'pathway_code' => 'nullable|string|max:50',
            'stem' => 'required|string',
            'vitals' => 'nullable|string',
            'order_index' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'questions' => 'required|array|min:1',
            'questions.*.stem' => 'required|string',
            'questions.*.options' => 'required|array|min:2',
            'questions.*.correct_option' => 'required|integer|min:0|max:3',
            'questions.*.explanation' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            $scenario = ClinicalScenario::create([
                'title' => $validated['title'],
                'discipline' => $validated['discipline'],
                'pathway_code' => $validated['pathway_code'] ?? 'NMC',
                'stem' => $validated['stem'],
                'vitals' => $validated['vitals'] ?? null,
                'order_index' => $validated['order_index'] ?? 0,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            foreach ($validated['questions'] as $index => $qData) {
                ClinicalScenarioQuestion::create([
                    'clinical_scenario_id' => $scenario->id,
                    'question_number' => $index + 1,
                    'stem' => $qData['stem'],
                    'options' => $qData['options'],
                    'correct_option' => (int) $qData['correct_option'],
                    'explanation' => $qData['explanation'] ?? '',
                    'order_index' => $index + 1,
                ]);
            }
        });

        return redirect()->route('admin.csq.index')->with('success', 'Clinical Scenario Station created successfully!');
    }

    /**
     * Show the form for editing the clinical scenario.
     */
    public function edit(ClinicalScenario $csq): Response
    {
        $csq->load(['questions' => fn ($q) => $q->orderBy('question_number')]);

        $pathways = ExamPathway::where('is_active', true)
            ->orderBy('order_index')
            ->get(['code', 'name']);

        return Inertia::render('admin/csq/form', [
            'scenario' => [
                'id' => $csq->id,
                'title' => $csq->title,
                'discipline' => $csq->discipline,
                'pathway_code' => $csq->pathway_code,
                'stem' => $csq->stem,
                'vitals' => $csq->vitals,
                'order_index' => $csq->order_index,
                'is_active' => $csq->is_active,
                'questions' => $csq->questions->map(function ($q) {
                    return [
                        'id' => $q->id,
                        'question_number' => $q->question_number,
                        'stem' => $q->stem,
                        'options' => $q->options,
                        'correct_option' => $q->correct_option,
                        'explanation' => $q->explanation,
                    ];
                }),
            ],
            'pathways' => $pathways,
        ]);
    }

    /**
     * Update the specified clinical scenario and its questions.
     */
    public function update(Request $request, ClinicalScenario $csq): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'discipline' => 'required|string|max:150',
            'pathway_code' => 'nullable|string|max:50',
            'stem' => 'required|string',
            'vitals' => 'nullable|string',
            'order_index' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'questions' => 'required|array|min:1',
            'questions.*.stem' => 'required|string',
            'questions.*.options' => 'required|array|min:2',
            'questions.*.correct_option' => 'required|integer|min:0|max:3',
            'questions.*.explanation' => 'nullable|string',
        ]);

        DB::transaction(function () use ($csq, $validated) {
            $csq->update([
                'title' => $validated['title'],
                'discipline' => $validated['discipline'],
                'pathway_code' => $validated['pathway_code'] ?? 'NMC',
                'stem' => $validated['stem'],
                'vitals' => $validated['vitals'] ?? null,
                'order_index' => $validated['order_index'] ?? 0,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // Re-sync questions
            $csq->questions()->delete();

            foreach ($validated['questions'] as $index => $qData) {
                ClinicalScenarioQuestion::create([
                    'clinical_scenario_id' => $csq->id,
                    'question_number' => $index + 1,
                    'stem' => $qData['stem'],
                    'options' => $qData['options'],
                    'correct_option' => (int) $qData['correct_option'],
                    'explanation' => $qData['explanation'] ?? '',
                    'order_index' => $index + 1,
                ]);
            }
        });

        return redirect()->route('admin.csq.index')->with('success', 'Clinical Scenario Station updated successfully!');
    }

    /**
     * Remove the specified clinical scenario.
     */
    public function destroy(ClinicalScenario $csq): RedirectResponse
    {
        $csq->delete();

        return redirect()->route('admin.csq.index')->with('success', 'Clinical Scenario Station removed successfully.');
    }

    /**
     * Toggle active status.
     */
    public function toggleActive(ClinicalScenario $csq): RedirectResponse
    {
        $csq->update(['is_active' => ! $csq->is_active]);

        return back()->with('success', 'Scenario status toggled.');
    }
}
