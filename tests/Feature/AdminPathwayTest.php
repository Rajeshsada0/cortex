<?php

namespace Tests\Feature;

use App\Models\ExamPathway;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPathwayTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_non_admin_cannot_access_pathways(): void
    {
        $candidate = User::factory()->create([
            'is_admin' => false,
        ]);

        $response = $this->actingAs($candidate)->get(route('admin.pathways.index'));
        $response->assertRedirect('/dashboard');
    }

    public function test_admin_can_view_pathways_index(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();

        $response = $this->actingAs($admin)->get(route('admin.pathways.index'));
        $response->assertOk();
    }

    public function test_admin_can_create_new_exam_pathway(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();

        $response = $this->actingAs($admin)->post(route('admin.pathways.store'), [
            'code' => 'PLAB_1',
            'name' => 'PLAB Part 1',
            'full_name' => 'Professional and Linguistic Assessments Board Part 1',
            'region' => 'United Kingdom',
            'total_questions' => 180,
            'duration_minutes' => 180,
            'correct_marks' => 1.0,
            'negative_marks' => 0.0,
            'scoring_type' => 'Standard Angoff Passing Threshold',
            'penalty_label' => 'No Negative Marking',
            'badge_color' => 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
            'is_active' => true,
        ]);

        $response->assertRedirect(route('admin.pathways.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('exam_pathways', [
            'code' => 'PLAB_1',
            'name' => 'PLAB Part 1',
            'total_questions' => 180,
            'is_system' => false,
        ]);
    }

    public function test_create_pathway_validates_code_uniqueness(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();

        // MECEE_PG already exists from seeder
        $response = $this->actingAs($admin)->post(route('admin.pathways.store'), [
            'code' => 'MECEE_PG',
            'name' => 'Duplicate Pathway',
            'full_name' => 'Duplicate Pathway Blueprint',
            'region' => 'Nepal',
            'total_questions' => 200,
            'duration_minutes' => 180,
            'correct_marks' => 1.0,
            'negative_marks' => 0.25,
            'scoring_type' => 'Negative Deductions',
            'is_active' => true,
        ]);

        $response->assertSessionHasErrors(['code']);
    }

    public function test_admin_can_update_exam_pathway(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();
        $pathway = ExamPathway::where('code', 'MECEE_PG')->first();

        $response = $this->actingAs($admin)->put(route('admin.pathways.update', $pathway), [
            'name' => 'MECEE PG Updated',
            'full_name' => 'Medical Education Commission Entrance Examination PG - Revised',
            'region' => 'Nepal & SAARC',
            'total_questions' => 200,
            'duration_minutes' => 190,
            'correct_marks' => 1.0,
            'negative_marks' => 0.25,
            'scoring_type' => 'Standard Negative Marking (-0.25)',
            'penalty_label' => '-0.25 Penalty',
            'is_active' => true,
        ]);

        $response->assertRedirect(route('admin.pathways.index'));
        $response->assertSessionHas('success');

        $pathway->refresh();
        $this->assertEquals('MECEE PG Updated', $pathway->name);
        $this->assertEquals(190, $pathway->duration_minutes);
    }

    public function test_admin_can_delete_pathway(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();
        $pathway = ExamPathway::create([
            'code' => 'TEST_DEL',
            'name' => 'Test Deletable',
            'full_name' => 'Test Deletable Pathway',
            'region' => 'Nepal',
            'total_questions' => 100,
            'duration_minutes' => 120,
            'correct_marks' => 1.0,
            'negative_marks' => 0.25,
            'scoring_type' => 'Negative Marking',
            'penalty_label' => 'Standard',
            'is_active' => true,
            'is_system' => true,
            'order_index' => 50,
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.pathways.destroy', $pathway));

        $response->assertRedirect(route('admin.pathways.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('exam_pathways', [
            'id' => $pathway->id,
            'code' => 'TEST_DEL',
        ]);
    }

    public function test_admin_can_delete_custom_pathway(): void
    {
        $admin = User::where('email', 'dr.cortex@example.com')->first();
        $customPathway = ExamPathway::create([
            'code' => 'AMC_CAT',
            'name' => 'AMC MCQ',
            'full_name' => 'Australian Medical Council MCQ Exam',
            'region' => 'Australia',
            'total_questions' => 150,
            'duration_minutes' => 210,
            'correct_marks' => 1.0,
            'negative_marks' => 0.0,
            'scoring_type' => 'Adaptive Scoring',
            'penalty_label' => 'No Negative',
            'badge_color' => 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
            'is_active' => true,
            'is_system' => false,
            'order_index' => 99,
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.pathways.destroy', $customPathway));

        $response->assertRedirect(route('admin.pathways.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('exam_pathways', [
            'id' => $customPathway->id,
            'code' => 'AMC_CAT',
        ]);
    }

    public function test_api_pathways_returns_only_active_pathways(): void
    {
        $inactive = ExamPathway::create([
            'code' => 'INACTIVE_TEST',
            'name' => 'Inactive Pathway',
            'full_name' => 'Inactive Pathway Long Name',
            'region' => 'Nepal',
            'total_questions' => 100,
            'duration_minutes' => 120,
            'correct_marks' => 1.0,
            'negative_marks' => 0.25,
            'scoring_type' => 'Negative Marking',
            'penalty_label' => 'Standard',
            'is_active' => false,
            'is_system' => false,
            'order_index' => 100,
        ]);

        $response = $this->getJson(route('api.v1.pathways.index'));

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $codes = collect($response->json('data'))->pluck('code');
        $this->assertNotContains('INACTIVE_TEST', $codes);
    }
}
