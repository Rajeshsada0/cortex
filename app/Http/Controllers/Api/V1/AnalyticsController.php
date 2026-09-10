<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Analytics\PerformanceQuadrantService;
use App\Domain\Analytics\ReadinessScoreCalculator;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(
        private readonly ReadinessScoreCalculator $readinessCalculator,
        private readonly PerformanceQuadrantService $quadrantService,
    ) {}

    /**
     * Compute and return the Cortex Readiness Score (0-100) and weighted components
     */
    public function readiness(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        if (! $user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $readinessData = $this->readinessCalculator->calculate($user);

        return response()->json([
            'success' => true,
            'data' => $readinessData,
        ]);
    }

    /**
     * Return 4-quadrant Performance vs Confidence distribution
     */
    public function quadrants(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'dr.cortex@example.com')->first() ?? User::first();

        if (! $user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $breakdown = $this->quadrantService->getQuadrantBreakdown($user);

        return response()->json([
            'success' => true,
            'data' => $breakdown,
        ]);
    }
}
