<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
                'avatar' => $user?->avatar,
                'avatar_url' => $user?->avatar_url,
                'institution' => $user?->institution,
                'medical_council_no' => $user?->medical_council_no,
                'phone' => $user?->phone,
                'is_admin' => (bool) $user?->is_admin,
                'active_pathway' => $user?->active_pathway ?? 'INI_CET',
                'pathway_label' => $user?->pathway_label,
                'target_exam_date' => $user?->target_exam_date?->toDateString(),
                'daily_study_hours' => $user?->daily_study_hours ?? 6,
                'daily_mcq_target' => $user?->daily_mcq_target ?? 100,
                'ai_credits' => $user?->ai_credits ?? 50,
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

        if ($request->hasFile('avatar')) {
            $request->validate([
                'avatar' => 'image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            ]);
            $rawAvatar = $user->getRawOriginal('avatar');
            if ($rawAvatar && Storage::disk('public')->exists($rawAvatar)) {
                Storage::disk('public')->delete($rawAvatar);
            }
            $user->avatar = $request->file('avatar')->store('avatars', 'public');
        } elseif ($request->boolean('remove_avatar')) {
            $rawAvatar = $user->getRawOriginal('avatar');
            if ($rawAvatar && Storage::disk('public')->exists($rawAvatar)) {
                Storage::disk('public')->delete($rawAvatar);
            }
            $user->avatar = null;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar_url,
                'institution' => $user->institution,
                'medical_council_no' => $user->medical_council_no,
                'phone' => $user->phone,
                'is_admin' => (bool) $user->is_admin,
                'active_pathway' => $user->active_pathway,
                'pathway_label' => $user->pathway_label,
                'target_exam_date' => $user->target_exam_date?->toDateString(),
                'daily_study_hours' => $user->daily_study_hours,
                'daily_mcq_target' => $user->daily_mcq_target,
                'ai_credits' => $user->ai_credits,
                'dashboard_preferences' => $user->dashboard_preferences,
                'created_at' => $user->created_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Upload avatar image from web or Flutter mobile app
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Candidate user not found.'], 404);
        }

        // 1. Multipart file upload (Standard from Flutter / Web)
        if ($request->hasFile('avatar')) {
            $request->validate([
                'avatar' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            ]);

            $rawAvatar = $user->getRawOriginal('avatar');
            if ($rawAvatar && Storage::disk('public')->exists($rawAvatar)) {
                Storage::disk('public')->delete($rawAvatar);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Profile picture uploaded successfully',
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar_url,
                'user' => $user,
            ]);
        }

        // 2. Base64 encoded string upload (commonly used in Flutter camera/gallery pickers)
        if ($request->filled('avatar_base64')) {
            $base64 = $request->input('avatar_base64');
            $type = 'jpg';
            if (preg_match('/^data:image\/(\w+);base64,/', $base64, $matches)) {
                $type = strtolower($matches[1]);
                $base64 = substr($base64, strpos($base64, ',') + 1);
            }

            $decoded = base64_decode($base64);
            if ($decoded === false) {
                return response()->json(['success' => false, 'message' => 'Invalid image base64 data.'], 422);
            }

            $rawAvatar = $user->getRawOriginal('avatar');
            if ($rawAvatar && Storage::disk('public')->exists($rawAvatar)) {
                Storage::disk('public')->delete($rawAvatar);
            }

            $filename = 'avatars/' . Str::random(40) . '.' . $type;
            Storage::disk('public')->put($filename, $decoded);
            $user->avatar = $filename;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Profile picture uploaded successfully',
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar_url,
                'user' => $user,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Please provide an image file under "avatar" or a base64 encoded string under "avatar_base64".',
        ], 422);
    }

    /**
     * Delete user avatar photo
     */
    public function deleteAvatar(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Candidate user not found.'], 404);
        }

        $rawAvatar = $user->getRawOriginal('avatar');
        if ($rawAvatar && Storage::disk('public')->exists($rawAvatar)) {
            Storage::disk('public')->delete($rawAvatar);
        }

        $user->avatar = null;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile picture removed successfully',
            'avatar' => null,
            'avatar_url' => null,
            'user' => $user,
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
