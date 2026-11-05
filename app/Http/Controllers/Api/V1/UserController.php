<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Get current user profile
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user?->id,
                'name' => $user?->name,
                'email' => $user?->email,
                'active_pathway' => $user?->active_pathway ?? 'INI_CET',
                'pathway_label' => $user?->pathway_label,
                'target_exam_date' => $user?->target_exam_date?->toDateString(),
                'daily_study_hours' => $user?->daily_study_hours ?? 6,
                'daily_mcq_target' => $user?->daily_mcq_target ?? 100,
                'dashboard_preferences' => $user?->dashboard_preferences,
                'created_at' => $user?->created_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Update candidate profile information (Name, Email, Password, Pathway, Goals)
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Candidate user not found.'], 404);
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'active_pathway' => 'nullable|string',
            'target_exam_date' => 'nullable|date',
            'daily_study_hours' => 'nullable|integer|min:1|max:18',
            'daily_mcq_target' => 'nullable|integer|min:10|max:500',
            'dashboard_preferences' => 'nullable|array',
            'current_password' => 'nullable|string',
            'password' => 'nullable|string|min:6',
        ]);

        // If changing password, verify current password
        if (! empty($validated['password'])) {
            if (empty($validated['current_password']) || ! Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'The provided current password does not match our records.',
                ], 422);
            }
            $user->password = Hash::make($validated['password']);
        }

        if (! empty($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (! empty($validated['email']) && $validated['email'] !== $user->email) {
            $user->email = $validated['email'];
            $user->email_verified_at = null;
        }

        if (array_key_exists('active_pathway', $validated) && ! empty($validated['active_pathway'])) {
            $user->active_pathway = $validated['active_pathway'];
        }

        if (array_key_exists('target_exam_date', $validated)) {
            $user->target_exam_date = $validated['target_exam_date'];
        }

        if (! empty($validated['daily_study_hours'])) {
            $user->daily_study_hours = (int) $validated['daily_study_hours'];
        }

        if (! empty($validated['daily_mcq_target'])) {
            $user->daily_mcq_target = (int) $validated['daily_mcq_target'];
        }

        if (isset($validated['dashboard_preferences'])) {
            $current = $user->dashboard_preferences ?? [];
            $user->dashboard_preferences = array_merge($current, $validated['dashboard_preferences']);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'active_pathway' => $user->active_pathway,
                'pathway_label' => $user->pathway_label,
                'target_exam_date' => $user->target_exam_date?->toDateString(),
                'daily_study_hours' => $user->daily_study_hours,
                'daily_mcq_target' => $user->daily_mcq_target,
                'dashboard_preferences' => $user->dashboard_preferences,
                'created_at' => $user->created_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Update pathway and study settings
     */
    public function updatePathway(Request $request): JsonResponse
    {
        return $this->updateProfile($request);
    }
}
