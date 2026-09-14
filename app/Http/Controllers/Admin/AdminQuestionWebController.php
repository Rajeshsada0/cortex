<?php

namespace App\Http\Controllers\Admin;

use App\Domain\QuestionBank\QuestionImportService;
use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\QuestionExamRelevance;
use App\Models\QuestionOption;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
                $q->where('exam', $exam);
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
        $pathways = \App\Models\ExamPathway::where('is_active', true)
            ->orderBy('order_index')
            ->orderBy('id')
            ->get(['code', 'name', 'region']);

        return Inertia::render('admin/questions/index', [
            'questions' => $questions,
            'subjects' => $subjects,
            'pathways' => $pathways,
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

        $pathways = \App\Models\ExamPathway::where('is_active', true)
            ->orderBy('order_index')
            ->orderBy('id')
            ->get(['code', 'name', 'region', 'badge_color']);

        return Inertia::render('admin/questions/form', [
            'question' => null,
            'subjects' => $subjects,
            'available_exams' => $pathways,
        ]);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        // Check if PHP dropped the file due to upload_max_filesize limit
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_INI_SIZE) {
            $maxPhpSize = ini_get('upload_max_filesize') ?: '2M';

            return response()->json([
                'success' => false,
                'message' => "The uploaded image exceeds the server upload limit ({$maxPhpSize}). Please upload an image under {$maxPhpSize}.",
            ], 422);
        }

        if (! $request->hasFile('image')) {
            return response()->json([
                'success' => false,
                'message' => 'No image file was received by the server. Please check the file format and size.',
            ], 422);
        }

        $validator = validator($request->all(), [
            'image' => 'required|file|mimes:jpeg,png,jpg,webp,svg,gif,bmp,jfif,avif|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first('image') ?: 'Invalid image file provided.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $path = $request->file('image')->store('questions', 'public');
        $url = Storage::url($path);

        return response()->json([
            'success' => true,
            'url' => $url,
            'path' => $path,
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
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:10240',
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
            'relevant_exams.*' => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    if (! \App\Models\ExamPathway::where('code', $value)->exists() && ! \App\Domain\Scoring\ExamPathway::tryFrom($value)) {
                        $fail("The selected pathway {$value} is invalid.");
                    }
                },
            ],
        ]);

        $code = ! empty($validated['code'])
            ? $validated['code']
            : 'Q-'.strtoupper(Str::random(8));

        $imageUrl = $validated['image_url'] ?? null;
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('questions', 'public');
            $imageUrl = Storage::url($path);
        }

        DB::transaction(function () use ($validated, $code, $imageUrl) {
            $question = Question::create([
                'code' => $code,
                'subject_id' => $validated['subject_id'],
                'topic_id' => $validated['topic_id'],
                'subtopic_id' => $validated['subtopic_id'] ?? null,
                'difficulty' => $validated['difficulty'],
                'question_type' => $validated['question_type'] ?? 'SINGLE_BEST_ANSWER',
                'stem' => $validated['stem'],
                'image_url' => $imageUrl,
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

    public function importView(): Response
    {
        $subjects = Subject::with('topics:id,subject_id,name')->orderBy('order_index')->get(['id', 'name']);

        return Inertia::render('admin/questions/import', [
            'subjects' => $subjects,
            'importResults' => session('import_results'),
        ]);
    }

    public function importProcess(Request $request, QuestionImportService $importService): RedirectResponse
    {
        ini_set('memory_limit', '1024M');
        set_time_limit(600);

        $validated = $request->validate([
            'file' => 'required|file|max:153600',
            'status' => 'nullable|in:active,draft',
            'subject_id' => 'nullable|exists:subjects,id',
        ], [
            'file.max' => 'The question file size must not exceed 150MB.',
            'file.required' => 'Please select a CSV or JSON question file to upload.',
            'file.file' => 'The uploaded file is invalid or exceeded the maximum upload limit.',
        ]);

        $publishAsActive = ($validated['status'] ?? 'active') === 'active';
        $defaultSubjectId = ! empty($validated['subject_id']) ? (int) $validated['subject_id'] : null;

        $results = $importService->import(
            file: $request->file('file'),
            publishAsActive: $publishAsActive,
            defaultSubjectId: $defaultSubjectId
        );

        $msg = "Bulk import completed: {$results['imported']} questions imported successfully.";
        if ($results['failed'] > 0) {
            $msg .= " ({$results['failed']} failed).";
        }

        return redirect()->route('admin.questions.import')
            ->with('success', $msg)
            ->with('import_results', $results);
    }

    public function downloadTemplate(string $format, QuestionImportService $importService): StreamedResponse
    {
        $format = strtolower($format);
        if ($format === 'json') {
            $content = $importService->getSampleJson();
            $filename = 'cortex_mcqs_template.json';
            $contentType = 'application/json';
        } else {
            $content = $importService->getSampleCsv();
            $filename = 'cortex_mcqs_template.csv';
            $contentType = 'text/csv';
        }

        return response()->streamDownload(function () use ($content) {
            echo $content;
        }, $filename, [
            'Content-Type' => $contentType,
        ]);
    }

    public function edit(Question $question): Response
    {
        $question->load(['options', 'relevantExams']);

        $subjects = Subject::with([
            'topics' => function ($q) {
                $q->orderBy('high_yield_priority', 'desc')->with('subtopics:id,topic_id,name');
            },
        ])->orderBy('order_index')->get(['id', 'name', 'slug']);

        $pathways = \App\Models\ExamPathway::where('is_active', true)
            ->orderBy('order_index')
            ->orderBy('id')
            ->get(['code', 'name', 'region', 'badge_color']);

        return Inertia::render('admin/questions/form', [
            'question' => $question,
            'subjects' => $subjects,
            'available_exams' => $pathways,
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
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:10240',
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
            'relevant_exams.*' => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    if (! \App\Models\ExamPathway::where('code', $value)->exists() && ! \App\Domain\Scoring\ExamPathway::tryFrom($value)) {
                        $fail("The selected pathway {$value} is invalid.");
                    }
                },
            ],
        ]);

        $imageUrl = $validated['image_url'] ?? $question->image_url;
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('questions', 'public');
            $imageUrl = Storage::url($path);
        }

        DB::transaction(function () use ($question, $validated, $imageUrl) {
            $question->update([
                'code' => $validated['code'],
                'subject_id' => $validated['subject_id'],
                'topic_id' => $validated['topic_id'],
                'subtopic_id' => $validated['subtopic_id'] ?? null,
                'difficulty' => $validated['difficulty'],
                'question_type' => $validated['question_type'] ?? 'SINGLE_BEST_ANSWER',
                'stem' => $validated['stem'],
                'image_url' => $imageUrl,
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
