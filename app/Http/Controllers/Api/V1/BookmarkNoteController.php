<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\QuestionResource;
use App\Models\Question;
use App\Models\User;
use App\Models\UserNoteBookmark;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookmarkNoteController extends Controller
{
    /**
     * Get all bookmarked questions for the active user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $bookmarks = UserNoteBookmark::where('user_id', $user?->id ?? 0)
            ->where(function ($q) {
                $q->where('is_bookmarked', true)->orWhereNotNull('note_content');
            })
            ->with(['question.subject', 'question.topic', 'question.options'])
            ->latest('updated_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bookmarks->map(fn ($b) => [
                'id' => $b->id,
                'is_bookmarked' => $b->is_bookmarked,
                'note_content' => $b->note_content,
                'updated_at' => $b->updated_at->toIso8601String(),
                'question' => new QuestionResource($b->question),
            ]),
        ]);
    }

    /**
     * Toggle bookmark state on a question
     */
    public function toggleBookmark(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $validated = $request->validate([
            'question_id' => 'required|string',
            'is_bookmarked' => 'nullable|boolean',
        ]);

        $record = UserNoteBookmark::firstOrCreate(
            [
                'user_id' => $user->id,
                'question_id' => $validated['question_id'],
            ],
            [
                'is_bookmarked' => false,
            ]
        );

        if ($request->has('is_bookmarked')) {
            $record->is_bookmarked = $request->boolean('is_bookmarked');
        } else {
            $record->is_bookmarked = ! $record->is_bookmarked;
        }
        $record->save();

        return response()->json([
            'success' => true,
            'is_bookmarked' => $record->is_bookmarked,
            'message' => $record->is_bookmarked ? 'Question bookmarked' : 'Bookmark removed',
        ]);
    }

    /**
     * Save or update personal note on a question
     */
    public function saveNote(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        $validated = $request->validate([
            'question_id' => 'required|string',
            'note_content' => 'nullable|string|max:5000',
        ]);

        $record = UserNoteBookmark::updateOrCreate(
            [
                'user_id' => $user->id,
                'question_id' => $validated['question_id'],
            ],
            [
                'note_content' => $validated['note_content'],
            ]
        );

        return response()->json([
            'success' => true,
            'note_content' => $record->note_content,
            'message' => 'Clinical note saved successfully',
        ]);
    }
}
