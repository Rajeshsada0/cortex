<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminQuestionMediaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        Storage::fake('public');
    }

    public function test_non_admin_cannot_upload_clinical_image(): void
    {
        $candidate = User::factory()->create(['is_admin' => false]);
        $file = UploadedFile::fake()->image('ecg_lead_ii.png', 800, 600);

        $response = $this->actingAs($candidate)->postJson(route('admin.questions.upload-image'), [
            'image' => $file,
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_upload_clinical_image(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();
        $file = UploadedFile::fake()->image('chest_xray.jpg', 1200, 900);

        $response = $this->actingAs($admin)->postJson(route('admin.questions.upload-image'), [
            'image' => $file,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['success', 'url', 'path']);

        $path = $response->json('path');
        Storage::disk('public')->assertExists($path);
    }

    public function test_admin_can_create_question_with_image_file(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();
        $subject = Subject::first();
        $topic = Topic::where('subject_id', $subject->id)->first();
        $file = UploadedFile::fake()->image('histopathology.png', 800, 600);

        $response = $this->actingAs($admin)->post('/admin/questions', [
            'code' => 'Q-IMG-TEST-01',
            'subject_id' => $subject->id,
            'topic_id' => $topic->id,
            'difficulty' => 'HARD',
            'stem' => 'A 60-year-old male with hemoptysis. Histopathology slide shown below.',
            'correct_option' => 'C',
            'image_file' => $file,
            'image_caption' => 'Keratin pearls consistent with squamous cell carcinoma.',
            'learning_objective' => 'Identify histopathologic hallmarks of lung carcinoma.',
            'foundation_explanation' => 'Squamous cell carcinoma arises centrally from bronchial epithelium.',
            'integration_explanation' => 'Strong association with smoking history and hypercalcemia via PTHrP.',
            'application_explanation' => 'Staging with contrast CT chest/abdomen and bronchoscopy.',
            'memory_peg' => 'Squamous = Central = Keratin pearls',
            'options' => [
                ['option_key' => 'A', 'option_text' => 'Adenocarcinoma', 'rationale' => 'Peripheral, gland-forming'],
                ['option_key' => 'B', 'option_text' => 'Small Cell Carcinoma', 'rationale' => 'Neuroendocrine small blue cells'],
                ['option_key' => 'C', 'option_text' => 'Squamous Cell Carcinoma', 'rationale' => 'Accurate choice with keratin pearls'],
                ['option_key' => 'D', 'option_text' => 'Large Cell Carcinoma', 'rationale' => 'Poorly differentiated'],
            ],
            'relevant_exams' => ['MECEE_PG', 'INI_CET'],
        ]);

        $response->assertRedirect(route('admin.questions.index'));

        $question = Question::where('code', 'Q-IMG-TEST-01')->first();
        $this->assertNotNull($question);
        $this->assertNotNull($question->image_url);
        $this->assertEquals('Keratin pearls consistent with squamous cell carcinoma.', $question->image_caption);
    }

    public function test_image_upload_validation_rejects_invalid_file_types(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();
        $file = UploadedFile::fake()->create('malicious.pdf', 100);

        $response = $this->actingAs($admin)->postJson(route('admin.questions.upload-image'), [
            'image' => $file,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_storage_fallback_route_serves_existing_file(): void
    {
        Storage::disk('public')->put('test_clinical_scan.jpg', 'dummy-image-bytes');

        $response = $this->get('/storage/test_clinical_scan.jpg');
        $response->assertOk();
    }

    public function test_storage_fallback_route_returns_404_for_missing_file(): void
    {
        $response = $this->get('/storage/non_existent_clinical_scan.jpg');
        $response->assertNotFound();
    }

    public function test_storage_fallback_route_blocks_directory_traversal(): void
    {
        $response = $this->get('/storage/../phpunit.xml');
        $response->assertNotFound();
    }

    public function test_admin_can_invoke_storage_link_route(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();

        $response = $this->actingAs($admin)->get(route('admin.storage-link'));
        $response->assertOk()
            ->assertJsonPath('success', true);
    }
}
