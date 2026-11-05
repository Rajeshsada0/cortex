<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\SpacedRepetition\SpacedRepetitionService;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\QuestionResource;
use App\Models\Question;
use App\Models\SpacedRepetitionQueue;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class SpacedRepetitionController extends Controller
{
    public function __construct(
        private readonly SpacedRepetitionService $spacedRepetitionService,
    ) {}

    /**
     * Get spaced repetition queue and due questions
     */
    public function due(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $userId = $user?->id ?? 0;

        $now = Carbon::now();

        $dueQuery = SpacedRepetitionQueue::where('user_id', $userId)
            ->whereHas('question')
            ->where(function ($q) use ($now) {
                $q->whereNull('next_review_due')
                    ->orWhere('next_review_due', '<=', $now);
            })
            ->with(['question.subject', 'question.topic', 'question.options', 'question.relevantExams']);

        $dueItems = $dueQuery->get()->filter(fn ($i) => $i->question)->values();
        $totalInQueue = SpacedRepetitionQueue::where('user_id', $userId)->whereHas('question')->count();

        // Count per stage (0..4)
        $stageCounts = [
            0 => SpacedRepetitionQueue::where('user_id', $userId)->whereHas('question')->where('repetition_stage', 0)->count(),
            1 => SpacedRepetitionQueue::where('user_id', $userId)->whereHas('question')->where('repetition_stage', 1)->count(),
            2 => SpacedRepetitionQueue::where('user_id', $userId)->whereHas('question')->where('repetition_stage', 2)->count(),
            3 => SpacedRepetitionQueue::where('user_id', $userId)->whereHas('question')->where('repetition_stage', 3)->count(),
            4 => SpacedRepetitionQueue::where('user_id', $userId)->whereHas('question')->where('repetition_stage', '>=', 4)->count(),
        ];

        return response()->json([
            'success' => true,
            'summary' => [
                'due_count' => $dueItems->count(),
                'total_in_queue' => $totalInQueue,
                'stage_counts' => $stageCounts,
            ],
            'due_cards' => $dueItems->map(fn ($item) => [
                'id' => $item->id,
                'repetition_stage' => $item->repetition_stage,
                'interval_days' => $item->interval_days,
                'consecutive_correct' => $item->consecutive_correct,
                'next_review_due' => $item->next_review_due?->toIso8601String(),
                'question' => new QuestionResource($item->question),
            ]),
        ]);
    }

    /**
     * Get dynamic flashcards by subject, theme, or due queue
     */
    public function flashcards(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();
        $source = $request->query('source');
        $subjectParam = $request->query('subject') ?? $request->query('subject_id');
        $themeParam = $request->query('theme');
        $limit = min(50, max(1, (int) $request->query('limit', 15)));

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

        if ($subjectParam && $subjectParam !== 'all' && $subjectParam !== 'due') {
            if (is_numeric($subjectParam)) {
                $query->where('subject_id', (int) $subjectParam);
            } else {
                $slug = Str::slug($subjectParam);
                $query->whereHas('subject', function ($q) use ($slug, $subjectParam) {
                    $q->where('slug', 'like', "%{$slug}%")
                        ->orWhere('name', 'like', "%{$subjectParam}%");
                });
            }
        }

        if ($themeParam) {
            $themeLower = strtolower($themeParam);
            if (str_contains($themeLower, 'first-aid') || str_contains($themeLower, 'hy') || str_contains($themeLower, 'high-yield')) {
                $query->whereNotNull('memory_peg');
            } elseif (str_contains($themeLower, 'bacteriology') || str_contains($themeLower, 'virology')) {
                $query->whereHas('subject', fn ($q) => $q->where('name', 'like', '%Microbiology%'));
            } elseif (str_contains($themeLower, 'biochem')) {
                $query->whereHas('subject', fn ($q) => $q->where('name', 'like', '%Biochem%'));
            }
        }

        $questions = $query->inRandomOrder()->take($limit)->get();

        // Fallback: If no questions match specific filter, grab active questions
        if ($questions->isEmpty()) {
            $questions = Question::where('is_active', true)
                ->with(['subject', 'topic', 'options'])
                ->inRandomOrder()
                ->take($limit)
                ->get();
        }

        $cards = $questions->map(function ($q) {
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
        });

        return response()->json([
            'success' => true,
            'count' => $cards->count(),
            'cards' => $cards,
        ]);
    }

    /**
     * Submit a spaced repetition card review
     */
    public function review(Request $request): JsonResponse
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

        $srsItem = $this->spacedRepetitionService->recordAttempt(
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
            'message' => 'Spaced repetition card updated successfully',
            'data' => [
                'due_count' => $dueCount,
                'repetition_stage' => $srsItem->repetition_stage,
                'next_review_due' => $srsItem->next_review_due?->toIso8601String(),
                'interval_days' => $srsItem->interval_days,
                'consecutive_correct' => $srsItem->consecutive_correct,
            ],
        ]);
    }
}
