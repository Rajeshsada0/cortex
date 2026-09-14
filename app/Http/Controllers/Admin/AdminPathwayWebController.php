<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExamPathway;
use App\Models\Question;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminPathwayWebController extends Controller
{
    public function index(): Response
    {
        $pathways = ExamPathway::orderBy('order_index')
            ->orderBy('id')
            ->get();

        $pathwaysMap = [];
        foreach ($pathways as $p) {
            $pathwaysMap[$p->code] = [
                'id' => $p->id,
                'code' => $p->code,
                'name' => $p->name,
                'fullName' => $p->full_name,
                'region' => $p->region,
                'totalQuestions' => (int) $p->total_questions,
                'durationMinutes' => (int) $p->duration_minutes,
                'correctMarks' => (float) $p->correct_marks,
                'negativeMarks' => (float) $p->negative_marks,
                'scoringType' => $p->scoring_type,
                'penaltyLabel' => $p->penalty_label,
                'badgeColor' => $p->badge_color,
                'isActive' => (bool) $p->is_active,
                'isSystem' => (bool) $p->is_system,
                'availableQuestions' => $p->getAvailableQuestionsCount(),
            ];
        }

        $subjectDistribution = Subject::withCount('questions')
            ->orderBy('order_index')
            ->get(['id', 'name', 'slug', 'questions_count']);

        return Inertia::render('admin/pathways/index', [
            'pathways' => $pathwaysMap,
            'subjects' => $subjectDistribution,
            'total_bank_questions' => Question::count(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|alpha_dash|unique:exam_pathways,code',
            'name' => 'required|string|max:100',
            'full_name' => 'required|string|max:255',
            'region' => 'nullable|string|max:50',
            'total_questions' => 'required|integer|min:1|max:1000',
            'duration_minutes' => 'required|integer|min:1|max:1440',
            'correct_marks' => 'required|numeric|min:0|max:100',
            'negative_marks' => 'required|numeric|min:0|max:100',
            'scoring_type' => 'required|string|max:150',
            'penalty_label' => 'nullable|string|max:100',
            'badge_color' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $code = strtoupper(trim($validated['code']));
        $neg = (float) $validated['negative_marks'];
        $penaltyLabel = $validated['penalty_label']
            ?: ($neg > 0 ? "-{$neg}" : 'No Negative');

        $maxOrder = (int) ExamPathway::max('order_index');

        ExamPathway::create([
            'code' => $code,
            'name' => $validated['name'],
            'full_name' => $validated['full_name'],
            'region' => $validated['region'] ?? 'Global',
            'total_questions' => (int) $validated['total_questions'],
            'duration_minutes' => (int) $validated['duration_minutes'],
            'correct_marks' => (float) $validated['correct_marks'],
            'negative_marks' => $neg,
            'scoring_type' => $validated['scoring_type'],
            'penalty_label' => $penaltyLabel,
            'badge_color' => $validated['badge_color'] ?? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
            'is_active' => $request->boolean('is_active', true),
            'is_system' => false,
            'order_index' => $maxOrder + 1,
        ]);

        return redirect()->route('admin.pathways.index')
            ->with('success', "Exam Pathway '{$validated['name']}' created successfully.");
    }

    public function update(Request $request, ExamPathway $pathway): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'full_name' => 'required|string|max:255',
            'region' => 'nullable|string|max:50',
            'total_questions' => 'required|integer|min:1|max:1000',
            'duration_minutes' => 'required|integer|min:1|max:1440',
            'correct_marks' => 'required|numeric|min:0|max:100',
            'negative_marks' => 'required|numeric|min:0|max:100',
            'scoring_type' => 'required|string|max:150',
            'penalty_label' => 'nullable|string|max:100',
            'badge_color' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $neg = (float) $validated['negative_marks'];
        $penaltyLabel = $validated['penalty_label']
            ?: ($neg > 0 ? "-{$neg}" : 'No Negative');

        $data = [
            'name' => $validated['name'],
            'full_name' => $validated['full_name'],
            'region' => $validated['region'] ?? 'Global',
            'total_questions' => (int) $validated['total_questions'],
            'duration_minutes' => (int) $validated['duration_minutes'],
            'correct_marks' => (float) $validated['correct_marks'],
            'negative_marks' => $neg,
            'scoring_type' => $validated['scoring_type'],
            'penalty_label' => $penaltyLabel,
            'badge_color' => $validated['badge_color'] ?? $pathway->badge_color,
            'is_active' => $request->boolean('is_active', true),
        ];

        if (! $pathway->is_system && $request->filled('code')) {
            $codeValidation = $request->validate([
                'code' => 'required|string|max:50|alpha_dash|unique:exam_pathways,code,' . $pathway->id,
            ]);
            $data['code'] = strtoupper(trim($codeValidation['code']));
        }

        $pathway->update($data);

        return redirect()->route('admin.pathways.index')
            ->with('success', "Exam Pathway '{$pathway->name}' updated successfully.");
    }

    public function destroy(ExamPathway $pathway): RedirectResponse
    {
        if ($pathway->is_system) {
            return redirect()->route('admin.pathways.index')
                ->with('error', "Core system pathway '{$pathway->name}' cannot be deleted as it is required for baseline clinical simulations.");
        }

        $name = $pathway->name;
        $pathway->delete();

        return redirect()->route('admin.pathways.index')
            ->with('success', "Exam Pathway '{$name}' deleted successfully.");
    }
}
