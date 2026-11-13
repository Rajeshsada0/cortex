<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AppRating;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppRatingController extends Controller
{
    /**
     * Submit an app rating and optional candidate review.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'sentiment' => 'nullable|string|max:100',
            'review' => 'nullable|string|max:2000',
            'name' => 'nullable|string|max:120',
            'email' => 'nullable|email|max:150',
        ]);

        $user = $request->user();

        $rating = AppRating::create([
            'user_id' => $user?->id,
            'name' => $validated['name'] ?? $user?->name ?? 'Candidate Doctor',
            'email' => $validated['email'] ?? $user?->email ?? 'candidate@cortex.med',
            'rating' => $validated['rating'],
            'sentiment' => $validated['sentiment'],
            'review' => $validated['review'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for rating Cortex Medical! Your clinical feedback empowers medical aspirants worldwide.',
            'rating' => $rating,
        ], 201);
    }

    /**
     * Get aggregate ratings summary.
     */
    public function summary(): JsonResponse
    {
        $total = AppRating::count();
        $average = $total > 0 ? round((float) AppRating::avg('rating'), 1) : 5.0;

        $distribution = [
            5 => AppRating::where('rating', 5)->count(),
            4 => AppRating::where('rating', 4)->count(),
            3 => AppRating::where('rating', 3)->count(),
            2 => AppRating::where('rating', 2)->count(),
            1 => AppRating::where('rating', 1)->count(),
        ];

        return response()->json([
            'average' => $average,
            'total' => $total,
            'distribution' => $distribution,
        ]);
    }
}
