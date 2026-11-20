<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Flashcard;
use App\Models\FlashcardDeck;
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

        // Query user's real custom decks from database
        $customDecks = FlashcardDeck::with(['subject:id,name'])
            ->when($user, fn ($q) => $q->where(fn ($sq) => $sq->where('user_id', $user->id)->orWhere('is_public', true)))
            ->withCount('cards')
            ->latest()
            ->get()
            ->map(fn ($d) => [
                'id' => (string) $d->id,
                'title' => $d->title,
                'cardsCount' => $d->cards_count ?: $d->cards_count,
                'type' => $d->category === 'anki' ? 'anki' : 'custom',
                'lastReviewed' => $d->updated_at ? $d->updated_at->diffForHumans() : 'Recently',
                'subject' => $d->subject?->name ?? 'General',
            ])
            ->values()
            ->toArray();

        // Dynamically query high-yield flashcards from the database
        $dynamicFlashcards = Question::where('is_active', true)
            ->with(['subject', 'topic', 'options'])
            ->inRandomOrder()
            ->take(15)
            ->get()
            ->map(fn ($q) => self::formatQuestionToFlashcard($q))
            ->values()
            ->toArray();

        // Query user's custom flashcards
        $userCustomCards = Flashcard::with(['subject:id,name', 'deck:id,title', 'topic:id,name'])
            ->when($user, fn ($q) => $q->where('user_id', $user->id))
            ->latest()
            ->get()
            ->map(fn ($fc) => [
                'id' => (string) $fc->id,
                'deck_id' => (string) $fc->deck_id,
                'deck_title' => $fc->deck?->title,
                'subject' => $fc->subject?->name ?? 'General Medicine',
                'subject_id' => $fc->subject_id,
                'topic' => $fc->topic?->name ?? 'Clinical Pearl',
                'front' => $fc->front,
                'back' => $fc->back,
                'pearl' => $fc->pearl ?? '',
                'difficulty' => $fc->difficulty ?? 'MEDIUM',
                'is_high_yield' => (bool) $fc->is_high_yield,
                'is_past_year' => (bool) $fc->is_past_year,
                'past_year' => $fc->past_year ?? '',
                'created_at' => $fc->created_at?->diffForHumans() ?? 'Recently',
            ])
            ->values()
            ->toArray();

        $totalCustomCardsCount = Flashcard::when($user, fn ($q) => $q->where('user_id', $user->id))->count();
        $totalQBankCount = Question::where('is_active', true)->count();

        $subjects = Subject::orderBy('order_index')->get(['id', 'name', 'slug']);

        return Inertia::render('flashcards/index', [
            'user' => $user,
            'dueCount' => $dueCount,
            'sections' => $sections,
            'themes' => $themes,
            'initialDecks' => $customDecks,
            'subjects' => $subjects,
            'sampleCards' => $dynamicFlashcards,
            'customCards' => $userCustomCards,
            'totalCustomCardsCount' => $totalCustomCardsCount,
            'totalQBankCount' => $totalQBankCount,
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
            'is_high_yield' => (bool) $q->is_high_yield,
            'is_past_year' => (bool) $q->is_past_year,
            'past_year' => $q->past_year,
        ];
    }

    /**
     * Format a Flashcard model into standard Flashcard array
     */
    public static function formatFlashcardModelToFlashcard(Flashcard $fc): array
    {
        return [
            'id' => (string) $fc->id,
            'subject' => $fc->subject?->name ?? 'Custom Deck',
            'topic' => $fc->topic?->name ?? 'Clinical Pearl',
            'front' => $fc->front,
            'back' => $fc->back,
            'pearl' => $fc->pearl ?? '',
            'difficulty' => $fc->difficulty ?? 'MEDIUM',
            'is_high_yield' => (bool) $fc->is_high_yield,
            'is_past_year' => (bool) $fc->is_past_year,
            'past_year' => $fc->past_year,
        ];
    }

    /**
     * Dynamic deck retrieval
     */
    public function getDecks(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $decks = FlashcardDeck::with('subject:id,name')
            ->when($user, fn ($q) => $q->where(fn ($sq) => $sq->where('user_id', $user->id)->orWhere('is_public', true)))
            ->withCount('cards')
            ->latest()
            ->get()
            ->map(fn ($d) => [
                'id' => (string) $d->id,
                'title' => $d->title,
                'cardsCount' => $d->cards_count ?: $d->cards_count,
                'type' => $d->category === 'anki' ? 'anki' : 'custom',
                'lastReviewed' => $d->updated_at ? $d->updated_at->diffForHumans() : 'Recently',
                'subject' => $d->subject?->name ?? 'General',
            ]);

        return response()->json([
            'success' => true,
            'decks' => $decks,
        ]);
    }

    /**
     * Create a custom deck
     */
    public function storeDeck(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'subject_id' => 'nullable|exists:subjects,id',
            'category' => 'nullable|string|max:50',
        ]);

        $deck = FlashcardDeck::create([
            'user_id' => $user?->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'subject_id' => $validated['subject_id'] ?? null,
            'category' => $validated['category'] ?? 'custom',
            'cards_count' => 0,
            'is_public' => true,
        ]);

        return response()->json([
            'success' => true,
            'deck' => [
                'id' => (string) $deck->id,
                'title' => $deck->title,
                'cardsCount' => 0,
                'type' => $deck->category === 'anki' ? 'anki' : 'custom',
                'lastReviewed' => 'Just now',
            ],
        ]);
    }

    /**
     * Delete a custom deck
     */
    public function deleteDeck(Request $request, string $id): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $deck = FlashcardDeck::where('id', $id)
            ->when($user, fn ($q) => $q->where('user_id', $user->id))
            ->first();

        if ($deck) {
            $deck->cards()->delete();
            $deck->delete();
        }

        return response()->json(['success' => true]);
    }

    /**
     * Delete a custom flashcard
     */
    public function deleteCard(Request $request, string $id): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $card = Flashcard::where('id', $id)
            ->when($user, fn ($q) => $q->where('user_id', $user->id))
            ->first();

        if ($card) {
            if ($card->deck_id) {
                FlashcardDeck::where('id', $card->deck_id)->decrement('cards_count');
            }
            $card->delete();
        }

        return response()->json(['success' => true]);
    }

    /**
     * Create a custom flashcard
     */
    public function storeCard(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $validated = $request->validate([
            'front' => 'required|string',
            'back' => 'required|string',
            'pearl' => 'nullable|string',
            'deck_id' => 'nullable|exists:flashcard_decks,id',
            'subject_id' => 'nullable|exists:subjects,id',
            'topic_id' => 'nullable|exists:topics,id',
            'difficulty' => 'nullable|in:EASY,MEDIUM,HARD',
            'is_high_yield' => 'nullable|boolean',
            'is_past_year' => 'nullable|boolean',
            'past_year' => 'nullable|string|max:30',
        ]);

        $card = Flashcard::create([
            'user_id' => $user?->id,
            'deck_id' => $validated['deck_id'] ?? null,
            'subject_id' => $validated['subject_id'] ?? null,
            'topic_id' => $validated['topic_id'] ?? null,
            'front' => $validated['front'],
            'back' => $validated['back'],
            'pearl' => $validated['pearl'] ?? null,
            'difficulty' => $validated['difficulty'] ?? 'MEDIUM',
            'is_high_yield' => $validated['is_high_yield'] ?? false,
            'is_past_year' => $validated['is_past_year'] ?? false,
            'past_year' => $validated['past_year'] ?? null,
        ]);

        if (! empty($validated['deck_id'])) {
            FlashcardDeck::where('id', $validated['deck_id'])->increment('cards_count');
        }

        return response()->json([
            'success' => true,
            'card' => self::formatFlashcardModelToFlashcard($card),
        ]);
    }

    /**
     * Dynamic card retrieval for study sessions by subject, theme, deck, or due queue
     */
    public function getCards(Request $request): JsonResponse
    {
        $subject = $request->query('subject');
        $theme = $request->query('theme');
        $deckId = $request->query('deck_id') ?? $request->query('deck');
        $source = $request->query('source');
        $isHighYield = $request->boolean('is_high_yield') || $request->query('filter') === 'high_yield';
        $isPastYear = $request->boolean('is_past_year') || $request->query('filter') === 'past_year';
        $limit = min(50, max(1, (int) $request->query('limit', 15)));

        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        // 1. If specific deck_id is requested, pull directly from Flashcard table
        if ($deckId) {
            $customCards = Flashcard::where('deck_id', $deckId)
                ->with(['subject', 'topic'])
                ->latest()
                ->take($limit)
                ->get()
                ->map(fn ($fc) => self::formatFlashcardModelToFlashcard($fc));

            return response()->json([
                'success' => true,
                'count' => $customCards->count(),
                'cards' => $customCards,
            ]);
        }

        // 2. Query questions and custom flashcards
        $customCards = collect();
        if ($subject && $subject !== 'all' && $subject !== 'due') {
            $slug = Str::slug($subject);
            $customCards = Flashcard::whereHas('subject', function ($q) use ($slug, $subject) {
                $q->where('slug', 'like', "%{$slug}%")
                    ->orWhere('name', 'like', "%{$subject}%");
            })
            ->with(['subject', 'topic'])
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn ($fc) => self::formatFlashcardModelToFlashcard($fc));
        }

        $query = Question::query()
            ->where('is_active', true)
            ->with(['subject', 'topic', 'options']);

        if ($isHighYield) {
            $query->where('is_high_yield', true);
        }

        if ($isPastYear) {
            $query->where('is_past_year', true);
        }

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
                $query->where(fn ($q) => $q->whereNotNull('memory_peg')->orWhere('is_high_yield', true));
            } elseif (str_contains($themeLower, 'past-year') || str_contains($themeLower, 'pyq')) {
                $query->where('is_past_year', true);
            } elseif (str_contains($themeLower, 'bacteriology') || str_contains($themeLower, 'virology')) {
                $query->whereHas('subject', fn ($q) => $q->where('name', 'like', '%Microbiology%'));
            } elseif (str_contains($themeLower, 'biochem')) {
                $query->whereHas('subject', fn ($q) => $q->where('name', 'like', '%Biochem%'));
            }
        }

        $questions = $query->inRandomOrder()->take($limit)->get();

        if ($questions->isEmpty()) {
            $fallbackQuery = Question::where('is_active', true)
                ->with(['subject', 'topic', 'options']);
            if ($isHighYield) {
                $fallbackQuery->where('is_high_yield', true);
            }
            if ($isPastYear) {
                $fallbackQuery->where('is_past_year', true);
            }
            $questions = $fallbackQuery->inRandomOrder()->take($limit)->get();
        }

        if ($questions->isEmpty()) {
            $questions = Question::where('is_active', true)
                ->with(['subject', 'topic', 'options'])
                ->inRandomOrder()
                ->take($limit)
                ->get();
        }

        $cards = $customCards->concat($questions->map(fn ($q) => self::formatQuestionToFlashcard($q)))->take($limit)->values();

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
