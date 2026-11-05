<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\SpacedRepetitionQueue;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class FlashcardWebController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = null;
        $dueCount = 0;

        try {
            $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
            if ($user) {
                $dueCount = SpacedRepetitionQueue::where('user_id', $user->id)
                    ->whereHas('question')
                    ->where(function ($q) {
                        $q->whereNull('next_review_due')
                            ->orWhere('next_review_due', '<=', now());
                    })
                    ->count();
            }
        } catch (\Throwable $e) {
            // Graceful fallback if database connection is unavailable
            $dueCount = 14;
        }

        // Sectioned subjects conforming to the medical flashcards design
        $sections = [
            [
                'title' => 'Foundational Sciences',
                'items' => [
                    [
                        'id' => 'anatomy',
                        'title' => 'Anatomy',
                        'cardsCount' => 2301,
                        'emoji' => '🧠',
                        'bgClass' => 'bg-red-50 text-red-500',
                        'isNew' => true,
                        'isSaved' => true,
                        'isHighYield' => true,
                        'category' => 'foundational',
                    ],
                    [
                        'id' => 'physiology',
                        'title' => 'Physiology',
                        'cardsCount' => 3535,
                        'emoji' => '👤',
                        'bgClass' => 'bg-blue-50 text-blue-500',
                        'isNew' => true,
                        'isSaved' => false,
                        'isHighYield' => true,
                        'category' => 'foundational',
                    ],
                    [
                        'id' => 'biochemistry',
                        'title' => 'Biochemistry',
                        'cardsCount' => 3108,
                        'emoji' => '🧬',
                        'bgClass' => 'bg-indigo-50 text-indigo-500',
                        'isNew' => true,
                        'isSaved' => true,
                        'isHighYield' => false,
                        'category' => 'foundational',
                    ],
                    [
                        'id' => 'immunology',
                        'title' => 'Immunology',
                        'cardsCount' => 1046,
                        'emoji' => '🧪',
                        'bgClass' => 'bg-emerald-50 text-emerald-500',
                        'isNew' => true,
                        'isSaved' => false,
                        'isHighYield' => true,
                        'category' => 'foundational',
                    ],
                ],
            ],
            [
                'title' => 'Disease Mechanisms',
                'items' => [
                    [
                        'id' => 'pathology',
                        'title' => 'Pathology',
                        'cardsCount' => 4211,
                        'emoji' => '🫀',
                        'bgClass' => 'bg-rose-50 text-rose-500',
                        'isNew' => true,
                        'isSaved' => true,
                        'isHighYield' => true,
                        'category' => 'disease',
                    ],
                    [
                        'id' => 'microbiology',
                        'title' => 'Microbiology',
                        'cardsCount' => 2607,
                        'emoji' => '🦠',
                        'bgClass' => 'bg-sky-50 text-sky-500',
                        'isNew' => true,
                        'isSaved' => false,
                        'isHighYield' => true,
                        'category' => 'disease',
                    ],
                    [
                        'id' => 'pharmacology',
                        'title' => 'Pharmacology',
                        'cardsCount' => 5975,
                        'emoji' => '💊',
                        'bgClass' => 'bg-blue-50 text-blue-500',
                        'isNew' => true,
                        'isSaved' => true,
                        'isHighYield' => true,
                        'category' => 'disease',
                    ],
                ],
            ],
            [
                'title' => 'Behavioral and Population Health',
                'items' => [
                    [
                        'id' => 'behavioral-science',
                        'title' => 'Behavioral Science',
                        'cardsCount' => 79,
                        'emoji' => '🧠',
                        'bgClass' => 'bg-cyan-50 text-cyan-500',
                        'isNew' => true,
                        'isSaved' => false,
                        'isHighYield' => false,
                        'category' => 'behavioral',
                    ],
                    [
                        'id' => 'biostatistics',
                        'title' => 'Biostatistics',
                        'cardsCount' => 282,
                        'emoji' => '📊',
                        'bgClass' => 'bg-pink-50 text-pink-500',
                        'isNew' => true,
                        'isSaved' => false,
                        'isHighYield' => true,
                        'category' => 'behavioral',
                    ],
                    [
                        'id' => 'patient-safety',
                        'title' => 'Patient Safety',
                        'cardsCount' => 69,
                        'emoji' => '🛡️',
                        'bgClass' => 'bg-sky-50 text-sky-500',
                        'isNew' => true,
                        'isSaved' => false,
                        'isHighYield' => false,
                        'category' => 'behavioral',
                    ],
                ],
            ],
            [
                'title' => 'Clinical',
                'items' => [
                    [
                        'id' => 'internal-medicine',
                        'title' => 'Internal Medicine',
                        'cardsCount' => 7069,
                        'emoji' => '🫁',
                        'bgClass' => 'bg-blue-50 text-blue-500',
                        'isNew' => true,
                        'isSaved' => true,
                        'isHighYield' => true,
                        'category' => 'clinical',
                    ],
                    [
                        'id' => 'surgery',
                        'title' => 'Surgery',
                        'cardsCount' => 1079,
                        'emoji' => '🩹',
                        'bgClass' => 'bg-teal-50 text-teal-500',
                        'isNew' => true,
                        'isSaved' => false,
                        'isHighYield' => true,
                        'category' => 'clinical',
                    ],
                    [
                        'id' => 'pediatrics',
                        'title' => 'Pediatrics',
                        'cardsCount' => 1588,
                        'emoji' => '👶',
                        'bgClass' => 'bg-cyan-50 text-cyan-500',
                        'isNew' => true,
                        'isSaved' => false,
                        'isHighYield' => true,
                        'category' => 'clinical',
                    ],
                ],
            ],
        ];

        // Themes list conforming to the design
        $themes = [
            [
                'id' => 'usmle-first-aid',
                'title' => 'USMLE First Aid',
                'cardsCount' => 1680,
                'progress' => 40,
                'emoji' => '🩹',
                'bgClass' => 'bg-neutral-100',
                'isHighYield' => true,
                'hasImage' => true,
            ],
            [
                'id' => 'usmle-step1-hy',
                'title' => 'USMLE High-Yield Step1',
                'cardsCount' => 13183,
                'progress' => 25,
                'emoji' => '💊',
                'bgClass' => 'bg-amber-50',
                'isHighYield' => true,
                'hasImage' => true,
            ],
            [
                'id' => 'lab-values',
                'title' => 'Lab Values',
                'cardsCount' => 116,
                'progress' => 33,
                'emoji' => '🥼',
                'bgClass' => 'bg-blue-50',
                'isHighYield' => true,
                'hasImage' => false,
            ],
            [
                'id' => 'biochemistry-hy',
                'title' => 'Biochemistry',
                'cardsCount' => 171,
                'progress' => 20,
                'emoji' => '🧫',
                'bgClass' => 'bg-rose-50',
                'isHighYield' => false,
                'hasImage' => true,
            ],
            [
                'id' => 'bacteriology-virology',
                'title' => 'Bacteriology and Virology (500+)',
                'cardsCount' => 250,
                'progress' => 50,
                'emoji' => '📚',
                'bgClass' => 'bg-orange-50',
                'isHighYield' => true,
                'hasImage' => true,
            ],
            [
                'id' => 'vitamins-coenzymes',
                'title' => 'Vitamins and Coenzymes (20)',
                'cardsCount' => 20,
                'progress' => 16,
                'emoji' => '📕',
                'bgClass' => 'bg-amber-50',
                'isHighYield' => false,
                'hasImage' => false,
            ],
            [
                'id' => 'investigation-of-choice',
                'title' => 'Investigation of Choice (70)',
                'cardsCount' => 70,
                'progress' => 66,
                'emoji' => '🔬',
                'bgClass' => 'bg-teal-50',
                'isHighYield' => true,
                'hasImage' => false,
            ],
        ];

        // Dynamically query high-yield flashcards from the database
        $dynamicFlashcards = Question::where('is_active', true)
            ->with(['subject', 'topic', 'options'])
            ->inRandomOrder()
            ->take(15)
            ->get()
            ->map(fn ($q) => self::formatQuestionToFlashcard($q))
            ->values()
            ->toArray();

        return Inertia::render('flashcards/index', [
            'user' => $user,
            'dueCount' => $dueCount,
            'sections' => $sections,
            'themes' => $themes,
            'sampleCards' => $dynamicFlashcards,
        ]);
    }

    /**
     * Format a Question model into standard Flashcard array
     */
    public static function formatQuestionToFlashcard(Question $q): array
    {
        $correctOption = $q->options->where('option_key', $q->correct_option)->first();
        $correctText = $correctOption ? "{$q->correct_option}. {$correctOption->option_text}" : "Key: {$q->correct_option}";

        $explanationParts = [];
        $explanationParts[] = $correctText;
        if ($q->foundation_explanation) {
            $explanationParts[] = $q->foundation_explanation;
        } elseif ($q->integration_explanation) {
            $explanationParts[] = $q->integration_explanation;
        } elseif ($q->learning_objective) {
            $explanationParts[] = $q->learning_objective;
        }

        return [
            'id' => (string) $q->id,
            'subject' => $q->subject?->name ?? 'General Medicine',
            'topic' => $q->topic?->name ?? 'High Yield Pearls',
            'front' => $q->stem,
            'back' => implode("\n\n", array_filter($explanationParts)),
            'pearl' => $q->memory_peg ?? $q->learning_objective ?? '',
            'difficulty' => $q->difficulty ?? 'MEDIUM',
        ];
    }

    /**
     * Dynamic card retrieval for study sessions by subject, theme, or due queue
     */
    public function getCards(Request $request): JsonResponse
    {
        $subject = $request->query('subject');
        $theme = $request->query('theme');
        $source = $request->query('source');
        $limit = min(50, max(1, (int) $request->query('limit', 15)));

        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $query = Question::query()
            ->where('is_active', true)
            ->with(['subject', 'topic', 'options']);

        if ($source === 'due' && $user) {
            $now = Carbon::now();
            $dueQuestionIds = SpacedRepetitionQueue::where('user_id', $user->id)
                ->where(function ($q) use ($now) {
                    $q->whereNull('next_review_due')
                        ->orWhere('next_review_due', '<=', $now);
                })
                ->pluck('question_id');

            if ($dueQuestionIds->isNotEmpty()) {
                $query->whereIn('id', $dueQuestionIds);
            }
        }

        if ($subject && $subject !== 'all' && $subject !== 'due') {
            $slug = Str::slug($subject);
            $query->whereHas('subject', function ($q) use ($slug, $subject) {
                $q->where('slug', 'like', "%{$slug}%")
                    ->orWhere('name', 'like', "%{$subject}%");
            });
        }

        if ($theme) {
            $themeLower = strtolower($theme);
            if (str_contains($themeLower, 'first-aid') || str_contains($themeLower, 'hy') || str_contains($themeLower, 'high-yield')) {
                $query->whereNotNull('memory_peg');
            } elseif (str_contains($themeLower, 'bacteriology') || str_contains($themeLower, 'virology')) {
                $query->whereHas('subject', fn ($q) => $q->where('name', 'like', '%Microbiology%'));
            } elseif (str_contains($themeLower, 'biochem')) {
                $query->whereHas('subject', fn ($q) => $q->where('name', 'like', '%Biochem%'));
            }
        }

        $questions = $query->inRandomOrder()->take($limit)->get();

        if ($questions->isEmpty()) {
            $questions = Question::where('is_active', true)
                ->with(['subject', 'topic', 'options'])
                ->inRandomOrder()
                ->take($limit)
                ->get();
        }

        $cards = $questions->map(fn ($q) => self::formatQuestionToFlashcard($q))->values();

        return response()->json([
            'success' => true,
            'count' => $cards->count(),
            'cards' => $cards,
        ]);
    }

    /**
     * Submit spaced repetition card review from web
     */
    public function reviewCard(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $validated = $request->validate([
            'question_id' => 'required|string',
            'is_correct' => 'required|boolean',
            'confidence' => 'required|string',
        ]);

        $rawConf = strtoupper($validated['confidence']);
        $confidence = match ($rawConf) {
            'LOW' => 'LOW',
            'MEDIUM' => 'MEDIUM',
            'EASY', 'HIGH' => 'HIGH',
            default => 'HIGH',
        };

        $srsService = app(\App\Domain\SpacedRepetition\SpacedRepetitionService::class);
        $srsItem = $srsService->recordAttempt(
            $user,
            $validated['question_id'],
            $validated['is_correct'],
            $confidence
        );

        $dueCount = SpacedRepetitionQueue::where('user_id', $user->id)
            ->whereHas('question')
            ->where(function ($q) {
                $q->whereNull('next_review_due')
                    ->orWhere('next_review_due', '<=', now());
            })
            ->count();

        return response()->json([
            'success' => true,
            'due_count' => $dueCount,
            'repetition_stage' => $srsItem->repetition_stage,
            'next_review_due' => $srsItem->next_review_due?->toIso8601String(),
            'interval_days' => $srsItem->interval_days,
        ]);
    }
}
