<?php

namespace App\Domain\Analytics;

use App\Models\QuestionAttempt;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

final class StudyStreakService
{
    /**
     * Calculate 30-day activity heatmap, current streak, and engagement metrics for a candidate.
     *
     * @return array{
     *     current_streak: int,
     *     longest_streak: int,
     *     total_30d_attempts: int,
     *     active_days_30d: int,
     *     target_met_days: int,
     *     target_completion_rate: float,
     *     daily_target: int,
     *     today_attempts: int,
     *     days: array<int, array{
     *         date: string,
     *         day_name: string,
     *         day_number: int,
     *         month_name: string,
     *         attempts_count: int,
     *         correct_count: int,
     *         accuracy: float,
     *         intensity_level: int,
     *         target_met: bool,
     *         is_today: bool,
     *     }>,
     * }
     */
    public function calculate(User $user, ?CarbonInterface $asOf = null): array
    {
        $asOf = $asOf ? Carbon::instance($asOf) : Carbon::now();
        $dailyTarget = max(10, (int) ($user->daily_mcq_target ?: 50));
        $thirtyDaysAgo = $asOf->copy()->subDays(29)->startOfDay();

        // 1. Fetch recent attempts for the 30-day window
        $recentAttempts = QuestionAttempt::where('user_id', $user->id)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->where('created_at', '<=', $asOf->copy()->endOfDay())
            ->get(['created_at', 'is_correct']);

        // Group attempts by 'Y-m-d'
        $groupedAttempts = $recentAttempts->groupBy(function ($attempt) {
            return Carbon::parse($attempt->created_at)->format('Y-m-d');
        });

        // 2. Fetch distinct attempt dates for the user to compute historical streaks
        $historicalDates = QuestionAttempt::where('user_id', $user->id)
            ->selectRaw('DATE(created_at) as attempt_date')
            ->distinct()
            ->pluck('attempt_date')
            ->map(fn ($d) => is_string($d) ? substr($d, 0, 10) : '')
            ->filter()
            ->unique()
            ->sort()
            ->values()
            ->all();

        // Calculate streaks
        $currentStreak = $this->calculateCurrentStreak($historicalDates, $asOf);
        $longestStreak = max($this->calculateLongestStreak($historicalDates), $currentStreak);

        // 3. Build 30-day heatmap data
        $days = [];
        $total30dAttempts = 0;
        $activeDays30d = 0;
        $targetMetDays = 0;
        $todayStr = $asOf->format('Y-m-d');
        $todayAttempts = 0;

        for ($i = 29; $i >= 0; $i--) {
            $dayCarbon = $asOf->copy()->subDays($i);
            $dateStr = $dayCarbon->format('Y-m-d');
            $dayAttempts = $groupedAttempts->get($dateStr, collect());
            $count = $dayAttempts->count();
            $correctCount = $dayAttempts->where('is_correct', true)->count();
            $accuracy = $count > 0 ? round(($correctCount / $count) * 100, 1) : 0.0;
            $isToday = $dateStr === $todayStr;

            if ($isToday) {
                $todayAttempts = $count;
            }

            if ($count > 0) {
                $activeDays30d++;
                $total30dAttempts += $count;
            }

            $targetMet = $count >= $dailyTarget;
            if ($targetMet) {
                $targetMetDays++;
            }

            // Intensity level (0 to 4)
            $intensity = match (true) {
                $count === 0 => 0,
                $count < ($dailyTarget * 0.4) => 1,
                $count < $dailyTarget => 2,
                $count < ($dailyTarget * 1.5) => 3,
                default => 4,
            };

            $days[] = [
                'date' => $dateStr,
                'day_name' => $dayCarbon->format('D'),
                'day_number' => (int) $dayCarbon->format('j'),
                'month_name' => $dayCarbon->format('M'),
                'attempts_count' => $count,
                'correct_count' => $correctCount,
                'accuracy' => $accuracy,
                'intensity_level' => $intensity,
                'target_met' => $targetMet,
                'is_today' => $isToday,
            ];
        }

        $targetCompletionRate = $activeDays30d > 0
            ? round(($targetMetDays / 30) * 100, 1)
            : 0.0;

        return [
            'current_streak' => $currentStreak,
            'longest_streak' => $longestStreak,
            'total_30d_attempts' => $total30dAttempts,
            'active_days_30d' => $activeDays30d,
            'target_met_days' => $targetMetDays,
            'target_completion_rate' => $targetCompletionRate,
            'daily_target' => $dailyTarget,
            'today_attempts' => $todayAttempts,
            'days' => $days,
        ];
    }

    /**
     * Calculate the current active streak ending today or yesterday.
     *
     * @param  array<int, string>  $sortedDatesAsc  Array of YYYY-MM-DD strings in ascending order
     */
    private function calculateCurrentStreak(array $sortedDatesAsc, CarbonInterface $asOf): int
    {
        if (empty($sortedDatesAsc)) {
            return 0;
        }

        $dateLookup = array_flip($sortedDatesAsc);
        $todayStr = $asOf->format('Y-m-d');
        $yesterdayStr = $asOf->copy()->subDay()->format('Y-m-d');

        $cursor = null;
        if (isset($dateLookup[$todayStr])) {
            $cursor = $asOf->copy();
        } elseif (isset($dateLookup[$yesterdayStr])) {
            $cursor = $asOf->copy()->subDay();
        } else {
            return 0;
        }

        $streak = 0;
        while (isset($dateLookup[$cursor->format('Y-m-d')])) {
            $streak++;
            $cursor->subDay();
        }

        return $streak;
    }

    /**
     * Calculate the longest historical streak in days.
     *
     * @param  array<int, string>  $sortedDatesAsc  Array of YYYY-MM-DD strings in ascending order
     */
    private function calculateLongestStreak(array $sortedDatesAsc): int
    {
        if (empty($sortedDatesAsc)) {
            return 0;
        }

        $longest = 1;
        $current = 1;

        $count = count($sortedDatesAsc);
        for ($i = 1; $i < $count; $i++) {
            $prevDate = Carbon::parse($sortedDatesAsc[$i - 1]);
            $currDateStr = $sortedDatesAsc[$i];

            if ($prevDate->addDay()->format('Y-m-d') === $currDateStr) {
                $current++;
                if ($current > $longest) {
                    $longest = $current;
                }
            } else {
                $current = 1;
            }
        }

        return $longest;
    }
}
