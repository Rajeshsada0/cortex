<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $examPathways = \App\Models\ExamPathway::where('is_active', true)
            ->orderBy('order_index')
            ->orderBy('id')
            ->get()
            ->map(function ($p) {
                $marking = match ($p->code) {
                    'USMLE_STEP1' => 'Pass / Fail',
                    'USMLE_STEP2CK' => 'Scaled 1–300',
                    default => $p->negative_marks > 0
                        ? sprintf('+%.1f / -%s', (float) $p->correct_marks, rtrim(rtrim(sprintf('%.2f', (float) $p->negative_marks), '0'), '.'))
                        : ($p->scoring_type ?? 'Standard'),
                };

                return [
                    'id' => $p->code,
                    'code' => $p->code,
                    'name' => $p->name,
                    'fullName' => $p->full_name ?? $p->name,
                    'region' => $p->region ?? 'Global',
                    'marking' => $marking,
                    'penalty' => $p->penalty_label ?? ($p->negative_marks > 0 ? "Penalty (-{$p->negative_marks})" : 'No Negative'),
                    'badgeColor' => $p->badge_color ?? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
                    'totalQuestions' => $p->total_questions,
                    'durationMinutes' => $p->duration_minutes,
                ];
            });

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'exam_pathways' => $examPathways,
        ];
    }
}
