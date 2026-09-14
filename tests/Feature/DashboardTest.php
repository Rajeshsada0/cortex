<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_candidates_can_visit_the_dashboard()
    {
        $candidate = User::factory()->create(['is_admin' => false]);
        $this->actingAs($candidate);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_authenticated_candidates_can_visit_all_candidate_portal_routes()
    {
        $this->seed();
        $candidate = User::factory()->create(['is_admin' => false]);
        $this->actingAs($candidate);

        $routes = [
            '/dashboard',
            '/planner',
            '/spaced-repetition',
            '/mock-exam',
            '/directory',
            '/qbank',
            '/qbank/runner',
        ];

        foreach ($routes as $route) {
            $response = $this->get($route);
            $response->assertOk();
        }
    }

    public function test_admins_cannot_access_candidate_portal_routes_and_are_redirected_to_admin()
    {
        $this->seed();
        $admin = User::where('email', 'dr.cortex@example.com')->first() ?? User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin);

        $candidateRoutes = [
            '/dashboard',
            '/planner',
            '/spaced-repetition',
            '/mock-exam',
            '/directory',
            '/qbank',
            '/qbank/runner',
        ];

        foreach ($candidateRoutes as $route) {
            $response = $this->get($route);
            $response->assertRedirect(route('admin.dashboard'));
        }
    }

    public function test_demo_login_redirects_admin_to_faculty_admin_portal()
    {
        $this->seed();
        $response = $this->get(route('demo-login'));
        $response->assertRedirect(route('admin.dashboard'));
    }

    public function test_user_can_update_dashboard_preferences_via_api(): void
    {
        $user = User::factory()->create([
            'is_admin' => false,
        ]);
        $this->actingAs($user);

        $preferences = [
            'readiness_score' => false,
            'cohort_rank' => true,
            'performance_quadrant' => false,
            'study_streak' => true,
        ];

        $response = $this->patchJson('/api/v1/users/me', [
            'dashboard_preferences' => $preferences,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.dashboard_preferences.readiness_score', false)
            ->assertJsonPath('user.dashboard_preferences.cohort_rank', true);

        $user->refresh();
        $this->assertEquals($preferences, $user->dashboard_preferences);
    }

    public function test_dashboard_renders_with_user_dashboard_preferences(): void
    {
        $preferences = [
            'readiness_score' => true,
            'cohort_rank' => false,
            'performance_quadrant' => true,
            'study_streak' => false,
        ];

        $candidate = User::factory()->create([
            'is_admin' => false,
            'dashboard_preferences' => $preferences,
        ]);
        $this->actingAs($candidate);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('user.dashboard_preferences.cohort_rank', false)
            ->where('user.dashboard_preferences.readiness_score', true)
        );
    }
}
