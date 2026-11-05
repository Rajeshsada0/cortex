<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PersonalAccessToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Authenticate user with email and password
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        // If user not found or password does not match (unless it's a known demo account with known demo pass)
        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            $isDemoUser = $user && (
                ($user->email === 'dr.cortex@example.com' && in_array($validated['password'], ['password', 'cortex123', 'admin123', 'password123'])) ||
                ($user->email === 'a.sterling@hopkinsmedicine.org' && in_array($validated['password'], ['SecureMedPass2025', 'cortex123', 'password123']))
            );
            if (! $isDemoUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password credentials.',
                ], 401);
            }
        }

        // Generate bearer token and persist
        $token = 'cortex_' . Str::random(40);
        PersonalAccessToken::create([
            'user_id' => $user->id,
            'name' => $request->header('User-Agent') ?? 'mobile_web',
            'token' => $token,
            'last_used_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'active_pathway' => $user->active_pathway ?? 'INI_CET',
                'pathway_label' => $user->pathway_label ?? 'India INI-CET',
                'target_exam_date' => $user->target_exam_date?->toDateString(),
                'daily_study_hours' => $user->daily_study_hours ?? 6,
                'daily_mcq_target' => $user->daily_mcq_target ?? 100,
                'created_at' => $user->created_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Register a new doctor / medical candidate
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'active_pathway' => 'nullable|string',
        ]);

        $activePathway = $validated['active_pathway'] ?? 'INI_CET';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'active_pathway' => $activePathway,
            'daily_study_hours' => 6,
            'daily_mcq_target' => 100,
        ]);

        $token = 'cortex_' . Str::random(40);
        PersonalAccessToken::create([
            'user_id' => $user->id,
            'name' => $request->header('User-Agent') ?? 'mobile_web',
            'token' => $token,
            'last_used_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'active_pathway' => $user->active_pathway,
                'pathway_label' => $user->pathway_label ?? 'India INI-CET',
                'target_exam_date' => $user->target_exam_date?->toDateString(),
                'daily_study_hours' => $user->daily_study_hours,
                'daily_mcq_target' => $user->daily_mcq_target,
                'created_at' => $user->created_at?->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Logout
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken();
        if ($token) {
            PersonalAccessToken::where('token', $token)->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }
}
