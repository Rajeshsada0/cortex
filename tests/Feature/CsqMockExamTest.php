<?php

namespace Tests\Feature;

use App\Models\ClinicalScenario;
use App\Models\ClinicalScenarioAttempt;
use App\Models\ClinicalScenarioQuestion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CsqMockExamTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        $this->seed(\Database\Seeders\ClinicalScenarioSeeder::class);
    }

    public function test_candidate_can_view_csq_hub(): void
    {
        $candidate = User::factory()->create(['is_admin' => false, 'active_pathway' => 'NMC']);

        $response = $this->actingAs($candidate)->get('/csq');
        $response->assertOk();
    }

    public function test_candidate_can_launch_csq_runner(): void
    {
        $candidate = User::factory()->create(['is_admin' => false, 'active_pathway' => 'NMC']);

        $response = $this->actingAs($candidate)->get('/csq/runner');
        $response->assertOk();
    }

    public function test_candidate_can_submit_csq_exam(): void
    {
        $candidate = User::factory()->create(['is_admin' => false, 'active_pathway' => 'NMC']);

        $payload = [
            'pathway_code' => 'NMC',
            'time_spent_seconds' => 450,
            'total_stations' => 4,
            'total_questions' => 20,
            'total_score' => 16,
            'percentage' => 80.0,
            'is_passed' => true,
            'station_results' => [
                [
                    'station_number' => 1,
                    'discipline' => 'Internal Medicine / Tropical Diseases',
                    'title' => 'Station 1',
                    'score' => 4,
                    'max_score' => 5,
                    'outcome' => 'Proficient',
                ],
            ],
        ];

        $response = $this->actingAs($candidate)->postJson('/csq/submit', $payload);
        $response->assertOk();
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('clinical_scenario_attempts', [
            'user_id' => $candidate->id,
            'total_score' => 16,
            'is_passed' => true,
        ]);
    }

    public function test_admin_can_view_csq_management(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first() ?? User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->get('/admin/csq');
        $response->assertOk();
    }

    public function test_admin_can_create_csq_station(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first() ?? User::factory()->create(['is_admin' => true]);

        $payload = [
            'title' => 'Station 5: Test Cardiology Case',
            'discipline' => 'Cardiology',
            'pathway_code' => 'NMC',
            'stem' => 'A 55yo male presents with acute substernal chest pain radiating to left arm.',
            'vitals' => '• BP: 140/90 mmHg | Pulse: 98 bpm',
            'order_index' => 5,
            'is_active' => true,
            'questions' => [
                [
                    'stem' => 'What is the most sensitive cardiac biomarker for acute myocardial infarction?',
                    'options' => ['CK-MB', 'Cardiac Troponin I', 'Myoglobin', 'LDH'],
                    'correct_option' => 1,
                    'explanation' => 'Cardiac Troponin I is highly sensitive and cardiac-specific.',
                ],
                [
                    'stem' => 'What is the immediate initial management?',
                    'options' => ['Morphine only', 'Aspirin 300mg chewed', 'Intravenous fluids', 'Beta blocker'],
                    'correct_option' => 1,
                    'explanation' => 'Immediate loading dose of chewed Aspirin reduces mortality in acute coronary syndrome.',
                ],
            ],
        ];

        $response = $this->actingAs($admin)->post('/admin/csq', $payload);
        $response->assertRedirect('/admin/csq');

        $this->assertDatabaseHas('clinical_scenarios', [
            'title' => 'Station 5: Test Cardiology Case',
            'discipline' => 'Cardiology',
        ]);
        $this->assertDatabaseHas('clinical_scenario_questions', [
            'stem' => 'What is the most sensitive cardiac biomarker for acute myocardial infarction?',
        ]);
    }

    public function test_admin_can_edit_and_toggle_csq_station(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first() ?? User::factory()->create(['is_admin' => true]);
        $scenario = ClinicalScenario::first();
        $this->assertNotNull($scenario);

        // Edit view
        $response = $this->actingAs($admin)->get("/admin/csq/{$scenario->id}/edit");
        $response->assertOk();

        // Toggle active
        $initialActive = $scenario->is_active;
        $toggleResponse = $this->actingAs($admin)->post("/admin/csq/{$scenario->id}/toggle-active");
        $toggleResponse->assertRedirect();
        $this->assertEquals(!$initialActive, $scenario->fresh()->is_active);
    }
}
