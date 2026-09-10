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
}
