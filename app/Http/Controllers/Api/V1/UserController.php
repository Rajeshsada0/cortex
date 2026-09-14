<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
            ],
        ]);
    }

    /**
     * Update pathway and study settings
     */
    public function updatePathway(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        if (! $user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'active_pathway' => 'nullable|string|in:MECEE_PG,INI_CET,NEET_PG,USMLE_STEP1,USMLE_STEP2CK,COMBINED',
            'target_exam_date' => 'nullable|date',
            'daily_study_hours' => 'nullable|integer|min:1|max:18',
            'daily_mcq_target' => 'nullable|integer|min:10|max:500',
            'dashboard_preferences' => 'nullable|array',
        ]);

        $user->update(array_filter($validated, fn ($val) => ! is_null($val)));

        return response()->json([
            'success' => true,
            'message' => 'Study pathway updated successfully',
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
            ],
        ]);
    }
}
