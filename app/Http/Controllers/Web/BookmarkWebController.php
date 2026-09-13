<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\User;
use App\Models\UserNoteBookmark;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookmarkWebController extends Controller
{
    /**
     * Display the candidate's Clinical Bookmarks & Notes notebook.
     */
    public function index(Request $request): Response
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $records = UserNoteBookmark::where('user_id', $user?->id ?? 0)
            ->where(function ($q) {
                $q->where('is_bookmarked', true)
                    ->orWhere(function ($sub) {
                        $sub->whereNotNull('note_content')->where('note_content', '!=', '');
                    });
            })
            ->with(['question.subject', 'question.topic', 'question.options'])
            ->latest('updated_at')
            ->get();

        $bookmarks = $records->map(function ($record) {
            $q = $record->question;

            return [
                'id' => $record->id,
                'question_id' => $record->question_id,
                'is_bookmarked' => (bool) $record->is_bookmarked,
                'note_content' => $record->note_content,
                'updated_at' => $record->updated_at->toIso8601String(),
                'question' => $q ? [
                    'id' => $q->id,
                    'code' => $q->code,
                    'stem' => $q->stem,
                    'difficulty' => $q->difficulty,
                    'correct_option' => $q->correct_option,
                    'image_url' => $q->image_url,
                    'image_caption' => $q->image_caption,
                    'learning_objective' => $q->learning_objective,
                    'foundation_explanation' => $q->foundation_explanation,
                    'integration_explanation' => $q->integration_explanation,
                    'application_explanation' => $q->application_explanation,
                    'memory_peg' => $q->memory_peg,
                    'subject' => $q->subject ? [
                        'id' => $q->subject->id,
                        'name' => $q->subject->name,
                        'slug' => $q->subject->slug,
                    ] : null,
                    'topic' => $q->topic ? [
                        'id' => $q->topic->id,
                        'name' => $q->topic->name,
                    ] : null,
                    'options' => $q->options->sortBy('option_key')->values()->map(fn ($opt) => [
                        'option_key' => $opt->option_key,
                        'option_text' => $opt->option_text,
                        'rationale' => $opt->rationale,
                    ]),
                ] : null,
            ];
        })->filter(fn ($item) => $item['question'] !== null)->values();

        $subjects = Subject::orderBy('name')->get(['id', 'name', 'slug']);

        $counts = [
            'total' => $bookmarks->count(),
            'bookmarked' => $bookmarks->where('is_bookmarked', true)->count(),
            'withNotes' => $bookmarks->filter(fn ($b) => ! empty($b['note_content']))->count(),
        ];

        return Inertia::render('bookmarks/index', [
            'user' => $user,
            'bookmarks' => $bookmarks,
            'subjects' => $subjects,
            'counts' => $counts,
        ]);
    }
}
