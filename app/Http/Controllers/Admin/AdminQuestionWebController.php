<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\QuestionExamRelevance;
use App\Models\QuestionOption;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminQuestionWebController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $subjectId = $request->query('subject_id');
        $topicId = $request->query('topic_id');
        $difficulty = $request->query('difficulty');
        $exam = $request->query('exam');
        $status = $request->query('status'); // 'all', 'active', 'draft'

        $query = Question::with([
            'subject:id,name',
            'topic:id,name',
            'relevantExams:question_id,exam',
            'options:id,question_id,option_key,option_text',
        ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('stem', 'like', "%{$search}%")
                    ->orWhere('learning_objective', 'like', "%{$search}%");
            });
        }

        if ($subjectId) {
            $query->where('subject_id', $subjectId);
        }

        if ($topicId) {
            $query->where('topic_id', $topicId);
        }

        if ($difficulty && $difficulty !== 'ALL') {
            $query->where('difficulty', $difficulty);
        }

        if ($exam && $exam !== 'ALL') {
            $query->whereHas('relevantExams', function ($q) use ($exam) {
                $q->where('exam', $exam)->orWhere('exam', 'COMBINED');
            });
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'draft') {
            $query->where('is_active', false);
        }

        $questions = $query->latest()
            ->paginate(15)
            ->withQueryString();

        $subjects = Subject::with('topics:id,subject_id,name')->orderBy('order_index')->get(['id', 'name']);

        return Inertia::render('admin/questions/index', [
            'questions' => $questions,
            'subjects' => $subjects,
            'filters' => [
                'search' => $search ?? '',
                'subject_id' => $subjectId ? (int) $subjectId : '',
                'topic_id' => $topicId ? (int) $topicId : '',
                'difficulty' => $difficulty ?? 'ALL',
                'exam' => $exam ?? 'ALL',
                'status' => $status ?? 'all',
            ],
            'stats' => [
                'total' => Question::count(),
                'active' => Question::where('is_active', true)->count(),
                'draft' => Question::where('is_active', false)->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        $subjects = Subject::with([
            'topics' => function ($q) {
                $q->orderBy('high_yield_priority', 'desc')->with('subtopics:id,topic_id,name');
            },
        ])->orderBy('order_index')->get(['id', 'name', 'slug']);

        return Inertia::render('admin/questions/form', [
            'question' => null,
            'subjects' => $subjects,
            'available_exams' => ['MECEE_PG', 'INI_CET', 'USMLE_STEP1', 'USMLE_STEP2CK', 'COMBINED'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'nullable|string|max:50|unique:questions,code',
            'subject_id' => 'required|exists:subjects,id',
            'topic_id' => 'required|exists:topics,id',
            'subtopic_id' => 'nullable|exists:subtopics,id',
            'difficulty' => 'required|in:EASY,MEDIUM,HARD',
            'question_type' => 'nullable|string|max:30',
            'stem' => 'required|string',
            'image_url' => 'nullable|string',
            'image_caption' => 'nullable|string|max:255',
            'correct_option' => 'required|in:A,B,C,D',
            'learning_objective' => 'required|string',
            'foundation_explanation' => 'required|string',
            'integration_explanation' => 'required|string',
            'application_explanation' => 'required|string',
            'memory_peg' => 'nullable|string',
            'is_active' => 'boolean',
            'options' => 'required|array|size:4',
            'options.*.option_key' => 'required|in:A,B,C,D',
            'options.*.option_text' => 'required|string',
            'options.*.rationale' => 'nullable|string',
            'relevant_exams' => 'required|array|min:1',
            'relevant_exams.*' => 'in:MECEE_PG,INI_CET,USMLE_STEP1,USMLE_STEP2CK,COMBINED',
        ]);

        $code = ! empty($validated['code'])
            ? $validated['code']
            : 'Q-'.strtoupper(Str::random(8));

        DB::transaction(function () use ($validated, $code) {
            $question = Question::create([
                'code' => $code,
                'subject_id' => $validated['subject_id'],
                'topic_id' => $validated['topic_id'],
                'subtopic_id' => $validated['subtopic_id'] ?? null,
                'difficulty' => $validated['difficulty'],
                'question_type' => $validated['question_type'] ?? 'SINGLE_BEST_ANSWER',
                'stem' => $validated['stem'],
                'image_url' => $validated['image_url'] ?? null,
                'image_caption' => $validated['image_caption'] ?? null,
                'correct_option' => $validated['correct_option'],
                'learning_objective' => $validated['learning_objective'],
                'foundation_explanation' => $validated['foundation_explanation'],
                'integration_explanation' => $validated['integration_explanation'],
                'application_explanation' => $validated['application_explanation'],
                'memory_peg' => $validated['memory_peg'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // Create Options
            foreach ($validated['options'] as $opt) {
                $question->options()->create([
                    'option_key' => $opt['option_key'],
                    'option_text' => $opt['option_text'],
                    'rationale' => $opt['rationale'] ?? '',
                ]);
            }

            // Create Relevant Exams
            foreach ($validated['relevant_exams'] as $exam) {
                QuestionExamRelevance::create([
                    'question_id' => $question->id,
                    'exam' => $exam,
                ]);
            }
        });

        return redirect()->route('admin.questions.index')->with('success', 'Clinical Vignette MCQ created successfully.');
    }

    public function edit(Question $question): Response
    {
        $question->load(['options', 'relevantExams']);

        $subjects = Subject::with([
            'topics' => function ($q) {
                $q->orderBy('high_yield_priority', 'desc')->with('subtopics:id,topic_id,name');
            },
        ])->orderBy('order_index')->get(['id', 'name', 'slug']);

        return Inertia::render('admin/questions/form', [
            'question' => $question,
            'subjects' => $subjects,
            'available_exams' => ['MECEE_PG', 'INI_CET', 'USMLE_STEP1', 'USMLE_STEP2CK', 'COMBINED'],
        ]);
    }

    public function update(Request $request, Question $question): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:questions,code,'.$question->id,
            'subject_id' => 'required|exists:subjects,id',
            'topic_id' => 'required|exists:topics,id',
            'subtopic_id' => 'nullable|exists:subtopics,id',
            'difficulty' => 'required|in:EASY,MEDIUM,HARD',
            'question_type' => 'nullable|string|max:30',
            'stem' => 'required|string',
            'image_url' => 'nullable|string',
            'image_caption' => 'nullable|string|max:255',
            'correct_option' => 'required|in:A,B,C,D',
            'learning_objective' => 'required|string',
            'foundation_explanation' => 'required|string',
            'integration_explanation' => 'required|string',
            'application_explanation' => 'required|string',
            'memory_peg' => 'nullable|string',
            'is_active' => 'boolean',
            'options' => 'required|array|size:4',
            'options.*.option_key' => 'required|in:A,B,C,D',
            'options.*.option_text' => 'required|string',
            'options.*.rationale' => 'nullable|string',
            'relevant_exams' => 'required|array|min:1',
            'relevant_exams.*' => 'in:MECEE_PG,INI_CET,USMLE_STEP1,USMLE_STEP2CK,COMBINED',
        ]);

        DB::transaction(function () use ($question, $validated) {
            $question->update([
                'code' => $validated['code'],
                'subject_id' => $validated['subject_id'],
                'topic_id' => $validated['topic_id'],
                'subtopic_id' => $validated['subtopic_id'] ?? null,
                'difficulty' => $validated['difficulty'],
                'question_type' => $validated['question_type'] ?? 'SINGLE_BEST_ANSWER',
                'stem' => $validated['stem'],
                'image_url' => $validated['image_url'] ?? null,
                'image_caption' => $validated['image_caption'] ?? null,
                'correct_option' => $validated['correct_option'],
                'learning_objective' => $validated['learning_objective'],
                'foundation_explanation' => $validated['foundation_explanation'],
                'integration_explanation' => $validated['integration_explanation'],
                'application_explanation' => $validated['application_explanation'],
                'memory_peg' => $validated['memory_peg'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // Sync Options
            foreach ($validated['options'] as $opt) {
                QuestionOption::updateOrCreate(
                    [
                        'question_id' => $question->id,
                        'option_key' => $opt['option_key'],
                    ],
                    [
                        'option_text' => $opt['option_text'],
                        'rationale' => $opt['rationale'] ?? '',
                    ]
                );
            }

            // Sync Relevant Exams
            QuestionExamRelevance::where('question_id', $question->id)->delete();
            foreach ($validated['relevant_exams'] as $exam) {
                QuestionExamRelevance::create([
                    'question_id' => $question->id,
                    'exam' => $exam,
                ]);
            }
        });

        return redirect()->route('admin.questions.index')->with('success', 'Question updated successfully.');
    }

    public function destroy(Question $question): RedirectResponse
    {
        $question->delete();

        return redirect()->route('admin.questions.index')->with('success', 'Question deleted successfully.');
    }

    public function toggleActive(Question $question): RedirectResponse
    {
        $question->update([
            'is_active' => ! $question->is_active,
        ]);

        $status = $question->is_active ? 'activated' : 'drafted';

        return back()->with('success', "Question {$question->code} is now {$status}.");
    }
}
