<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_non_admin_cannot_access_admin_dashboard(): void
    {
        $candidate = User::factory()->create([
            'is_admin' => false,
        ]);

        $response = $this->actingAs($candidate)->get('/admin');
        $response->assertRedirect('/dashboard');
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();
        $this->assertNotNull($admin);
        $this->assertTrue($admin->is_admin);

        $response = $this->actingAs($admin)->get('/admin');
        $response->assertOk();
    }

    public function test_admin_can_access_admin_subsections(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();

        $this->actingAs($admin)->get('/admin/subjects')->assertOk();
        $this->actingAs($admin)->get('/admin/topics')->assertOk();
        $this->actingAs($admin)->get('/admin/questions')->assertOk();
        $this->actingAs($admin)->get('/admin/pathways')->assertOk();
        $this->actingAs($admin)->get('/admin/users')->assertOk();
    }

    public function test_admin_can_create_and_manage_subject(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();

        $response = $this->actingAs($admin)->post('/admin/subjects', [
            'name' => 'Nuclear Medicine',
            'slug' => 'nuclear-medicine',
            'icon_key' => 'Activity',
            'order_index' => 20,
        ]);

        $response->assertRedirect(route('admin.subjects.index'));
        $this->assertDatabaseHas('subjects', ['name' => 'Nuclear Medicine']);

        $subject = Subject::where('name', 'Nuclear Medicine')->first();

        // Update
        $this->actingAs($admin)->put("/admin/subjects/{$subject->id}", [
            'name' => 'Nuclear Medicine Specialty',
            'slug' => 'nuclear-medicine-specialty',
            'icon_key' => 'Zap',
            'order_index' => 21,
        ])->assertRedirect(route('admin.subjects.index'));

        $this->assertDatabaseHas('subjects', ['name' => 'Nuclear Medicine Specialty']);

        // Delete
        $this->actingAs($admin)->delete("/admin/subjects/{$subject->id}")
            ->assertRedirect(route('admin.subjects.index'));
        $this->assertDatabaseMissing('subjects', ['id' => $subject->id]);
    }

    public function test_admin_can_create_and_toggle_mcq_question(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();
        $subject = Subject::first();
        $topic = Topic::where('subject_id', $subject->id)->first();

        $response = $this->actingAs($admin)->post('/admin/questions', [
            'code' => 'Q-TEST-9999',
            'subject_id' => $subject->id,
            'topic_id' => $topic->id,
            'difficulty' => 'HARD',
            'stem' => 'A 45-year-old physician presents for a fellowship exam simulation test question.',
            'correct_option' => 'B',
            'learning_objective' => 'Demonstrate clinical comprehension.',
            'foundation_explanation' => 'Foundation layer mechanism.',
            'integration_explanation' => 'Integration differential reasoning.',
            'application_explanation' => 'Application gold standard therapeutic.',
            'memory_peg' => 'Test Memory Peg',
            'is_active' => true,
            'options' => [
                ['option_key' => 'A', 'option_text' => 'Option A distractor', 'rationale' => 'Wrong choice'],
                ['option_key' => 'B', 'option_text' => 'Option B correct choice', 'rationale' => 'Accurate choice'],
                ['option_key' => 'C', 'option_text' => 'Option C distractor', 'rationale' => 'Wrong choice'],
                ['option_key' => 'D', 'option_text' => 'Option D distractor', 'rationale' => 'Wrong choice'],
            ],
            'relevant_exams' => ['MECEE_PG', 'INI_CET'],
        ]);

        $response->assertRedirect(route('admin.questions.index'));
        $this->assertDatabaseHas('questions', ['code' => 'Q-TEST-9999']);

        $question = Question::where('code', 'Q-TEST-9999')->first();
        $this->assertTrue($question->is_active);

        // Toggle active
        $this->actingAs($admin)->post("/admin/questions/{$question->id}/toggle-active");
        $question->refresh();
        $this->assertFalse($question->is_active);
    }
}
