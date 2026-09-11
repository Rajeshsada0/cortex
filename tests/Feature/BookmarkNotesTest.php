<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\User;
use App\Models\UserNoteBookmark;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookmarkNotesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_candidate_can_view_bookmarks_page_with_saved_items(): void
    {
        $candidate = User::factory()->create([
            'is_admin' => false,
            'active_pathway' => 'INI_CET',
        ]);

        $question = Question::first();
        $this->assertNotNull($question);

        UserNoteBookmark::create([
            'user_id' => $candidate->id,
            'question_id' => $question->id,
            'is_bookmarked' => true,
            'note_content' => 'High-yield note: Remember to rule out right ventricular infarction!',
        ]);

        $response = $this->actingAs($candidate)->get(route('bookmarks.index'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('bookmarks/index')
            ->has('bookmarks', 1)
            ->has('subjects')
            ->where('counts.total', 1)
            ->where('counts.bookmarked', 1)
            ->where('counts.withNotes', 1)
            ->where('bookmarks.0.question_id', $question->id)
            ->where('bookmarks.0.is_bookmarked', true)
            ->where('bookmarks.0.note_content', 'High-yield note: Remember to rule out right ventricular infarction!')
        );
    }

    public function test_candidate_can_toggle_bookmark_via_api(): void
    {
        $candidate = User::factory()->create(['is_admin' => false]);
        $question = Question::first();

        // 1. First toggle -> should set bookmark = true
        $res1 = $this->actingAs($candidate)->postJson('/api/v1/bookmarks', [
            'question_id' => $question->id,
        ]);

        $res1->assertOk();
        $res1->assertJson([
            'success' => true,
            'is_bookmarked' => true,
        ]);

        $this->assertDatabaseHas('user_notes_bookmarks', [
            'user_id' => $candidate->id,
            'question_id' => $question->id,
            'is_bookmarked' => true,
        ]);

        // 2. Second toggle -> should set bookmark = false
        $res2 = $this->actingAs($candidate)->postJson('/api/v1/bookmarks', [
            'question_id' => $question->id,
        ]);

        $res2->assertOk();
        $res2->assertJson([
            'success' => true,
            'is_bookmarked' => false,
        ]);

        $this->assertDatabaseHas('user_notes_bookmarks', [
            'user_id' => $candidate->id,
            'question_id' => $question->id,
            'is_bookmarked' => false,
        ]);
    }

    public function test_candidate_can_save_and_update_personal_clinical_note(): void
    {
        $candidate = User::factory()->create(['is_admin' => false]);
        $question = Question::first();

        $response = $this->actingAs($candidate)->postJson('/api/v1/notes', [
            'question_id' => $question->id,
            'note_content' => 'Gold standard pearl: Atropine until pulmonary secretions are dry in OP poisoning.',
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'note_content' => 'Gold standard pearl: Atropine until pulmonary secretions are dry in OP poisoning.',
        ]);

        $this->assertDatabaseHas('user_notes_bookmarks', [
            'user_id' => $candidate->id,
            'question_id' => $question->id,
            'note_content' => 'Gold standard pearl: Atropine until pulmonary secretions are dry in OP poisoning.',
        ]);
    }

    public function test_guest_cannot_access_bookmarks_web_route(): void
    {
        $response = $this->get(route('bookmarks.index'));
        $response->assertRedirect('/login');
    }
}
