<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class AdminQuestionImportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_non_admin_cannot_access_import_page(): void
    {
        $candidate = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($candidate)->get(route('admin.questions.import'));
        $response->assertRedirect('/dashboard');
    }

    public function test_admin_can_access_import_page(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();

        $response = $this->actingAs($admin)->get(route('admin.questions.import'));
        $response->assertOk();
    }

    public function test_admin_can_download_sample_csv_template(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();

        $response = $this->actingAs($admin)->get('/admin/questions/import/template/csv');
        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_admin_can_download_sample_json_template(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();

        $response = $this->actingAs($admin)->get('/admin/questions/import/template/json');
        $response->assertOk();
        $response->assertHeader('content-type', 'application/json');
    }

    public function test_admin_can_import_questions_via_csv(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();
        $subject = Subject::first();
        $topic = $subject->topics->first();

        $csvContent = implode("\n", [
            'code,subject,topic,difficulty,stem,option_a,option_b,option_c,option_d,correct_option,learning_objective,foundation_explanation,integration_explanation,application_explanation,memory_peg,relevant_exams',
            "\"Q-CSV-TEST-1\",\"{$subject->name}\",\"{$topic->name}\",\"HARD\",\"A 50-year-old patient presents with classic triad.\",\"Alpha Choice\",\"Beta Choice\",\"Gamma Choice\",\"Delta Choice\",\"C\",\"Objective test\",\"Foundation test\",\"Integration test\",\"Application test\",\"Peg test\",\"MECEE_PG,INI_CET\"",
        ]);

        $file = UploadedFile::fake()->createWithContent('questions.csv', $csvContent);

        $response = $this->actingAs($admin)->post('/admin/questions/import', [
            'file' => $file,
            'status' => 'active',
        ]);

        $response->assertRedirect(route('admin.questions.import'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('questions', [
            'code' => 'Q-CSV-TEST-1',
            'correct_option' => 'C',
            'difficulty' => 'HARD',
            'is_active' => true,
        ]);

        $question = Question::where('code', 'Q-CSV-TEST-1')->first();
        $this->assertNotNull($question);
        $this->assertCount(4, $question->options);
        $this->assertCount(2, $question->relevantExams);
    }

    public function test_admin_can_import_questions_via_json(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();
        $subject = Subject::first();
        $topic = $subject->topics->first();

        $jsonData = [
            'questions' => [
                [
                    'code' => 'Q-JSON-TEST-1',
                    'subject' => $subject->id,
                    'topic' => $topic->id,
                    'difficulty' => 'MEDIUM',
                    'stem' => 'A 29-year-old female presents with fever and cervical lymphadenopathy.',
                    'correct_option' => 'A',
                    'options' => [
                        ['option_key' => 'A', 'option_text' => 'Infectious Mononucleosis', 'rationale' => 'EBV viral infection'],
                        ['option_key' => 'B', 'option_text' => 'Streptococcal pharyngitis', 'rationale' => 'Bacterial cause'],
                        ['option_key' => 'C', 'option_text' => 'Cat scratch disease', 'rationale' => 'Bartonella'],
                        ['option_key' => 'D', 'option_text' => 'Toxoplasmosis', 'rationale' => 'Protozoan'],
                    ],
                    'learning_objective' => 'Differentiate causes of acute lymphadenopathy in young adults.',
                    'foundation_explanation' => 'EBV infects B-lymphocytes via CD21 receptor.',
                    'integration_explanation' => 'Atypical Downey lymphocytes on peripheral smear.',
                    'application_explanation' => 'Supportive therapy, avoid ampicillin due to rash.',
                    'memory_peg' => 'EBV = CD21 = Downey Type II T-cells',
                    'relevant_exams' => ['USMLE_STEP1', 'INI_CET'],
                ],
            ],
        ];

        $file = UploadedFile::fake()->createWithContent('questions.json', json_encode($jsonData));

        $response = $this->actingAs($admin)->post('/admin/questions/import', [
            'file' => $file,
            'status' => 'active',
        ]);

        $response->assertRedirect(route('admin.questions.import'));
        $this->assertDatabaseHas('questions', [
            'code' => 'Q-JSON-TEST-1',
            'correct_option' => 'A',
        ]);

        $question = Question::where('code', 'Q-JSON-TEST-1')->first();
        $this->assertCount(4, $question->options);
    }

    public function test_import_handles_invalid_rows_gracefully(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();

        // Row missing correct_option and options
        $csvContent = implode("\n", [
            'code,stem,correct_option,option_a,option_b,option_c,option_d',
            '"Q-FAIL-1","Incomplete question with invalid option","Z","Only A","","",""',
        ]);

        $file = UploadedFile::fake()->createWithContent('invalid.csv', $csvContent);

        $response = $this->actingAs($admin)->post('/admin/questions/import', [
            'file' => $file,
            'status' => 'draft',
        ]);

        $response->assertRedirect(route('admin.questions.import'));
        $this->assertDatabaseMissing('questions', ['code' => 'Q-FAIL-1']);

        $importResults = session('import_results');
        $this->assertNotNull($importResults);
        $this->assertEquals(1, $importResults['failed']);
        $this->assertNotEmpty($importResults['errors']);
    }

    public function test_import_rejects_files_exceeding_150mb(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();

        // 151MB file (154624 KB > 153600 KB limit)
        $file = UploadedFile::fake()->create('huge_questions.csv', 154624);

        $response = $this->actingAs($admin)->post('/admin/questions/import', [
            'file' => $file,
            'status' => 'draft',
        ]);

        $response->assertSessionHasErrors(['file' => 'The question file size must not exceed 150MB.']);
    }
}
