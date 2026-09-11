import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Flame, Calendar, CheckCircle2, TrendingUp, Zap, Award, ArrowRight, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface StudyDayData {
    date: string;
    day_name: string;
    day_number: number;
    month_name: string;
    attempts_count: number;
    correct_count: number;
    accuracy: number;
    intensity_level: number; // 0 to 4
    target_met: boolean;
    is_today: boolean;
}

export interface StudyStreakData {
    current_streak: number;
    longest_streak: number;
    total_30d_attempts: number;
    active_days_30d: number;
    target_met_days: number;
    target_completion_rate: number;
    daily_target: number;
    today_attempts: number;
    days: StudyDayData[];
}

interface StudyStreakHeatmapProps {
    streakData?: StudyStreakData;
}

export function StudyStreakHeatmap({ streakData }: StudyStreakHeatmapProps) {
    if (!streakData) {
        return null;
    }

    const {
        current_streak,
        longest_streak,
        total_30d_attempts,
        active_days_30d,
        target_met_days,
        target_completion_rate,
        daily_target,
        today_attempts,
        days,
    } = streakData;

    const [hoveredDay, setHoveredDay] = useState<StudyDayData | null>(null);

    const getIntensityClass = (level: number, isToday: boolean) => {
        const ring = isToday ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-card' : '';

        switch (level) {
            case 4:
                return `bg-[#55BDEB] border-[#55BDEB] text-slate-950 font-bold shadow-sm shadow-[#55BDEB]/30 ${ring}`;
            case 3:
                return `bg-[#2FB36F] border-[#2FB36F] text-white font-semibold shadow-sm ${ring}`;
            case 2:
                return `bg-emerald-600/70 border-emerald-500/70 text-white ${ring}`;
            case 1:
                return `bg-emerald-900/40 border-emerald-700/50 text-emerald-300 ${ring}`;
            case 0:
            default:
                return `bg-muted/30 border-border/40 text-muted-foreground/60 hover:border-border ${ring}`;
        }
    };

    const targetMetToday = today_attempts >= daily_target;
    const remainingToday = Math.max(0, daily_target - today_attempts);

    return (
        <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-orange-500">
                        <Flame className="size-5 fill-orange-500 animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                                DAILY STUDY STREAK & 30-DAY ACTIVITY
                            </h3>
                            <Badge
                                variant="outline"
                                className="border-orange-500/30 bg-orange-500/10 text-orange-500 text-[11px] font-bold"
                            >
                                🔥 {current_streak} {current_streak === 1 ? 'Day' : 'Days'} Streak
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Consistent deliberate retrieval practice builds Board exam automaticity and long-term retention.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/qbank/runner">
                        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-semibold">
                            <Zap className="size-3.5 text-amber-500" />
                            Extend Streak
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 gap-3 py-4 sm:grid-cols-4">
                <div className="flex flex-col rounded-xl border border-border/60 bg-muted/15 p-3">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Active Streak
                    </span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-orange-500">{current_streak}</span>
                        <span className="text-xs text-muted-foreground">days</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                        {current_streak > 0 ? 'Streak is active' : 'Start streak today'}
                    </span>
                </div>

                <div className="flex flex-col rounded-xl border border-border/60 bg-muted/15 p-3">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Personal Best
                    </span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-[#55BDEB]">{longest_streak}</span>
                        <span className="text-xs text-muted-foreground">days</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                        All-time longest streak
                    </span>
                </div>

                <div className="flex flex-col rounded-xl border border-border/60 bg-muted/15 p-3">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        30-Day Volume
                    </span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-[#2FB36F]">{total_30d_attempts}</span>
                        <span className="text-xs text-muted-foreground">MCQs</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                        Across {active_days_30d} active study days
                    </span>
                </div>

                <div className="flex flex-col rounded-xl border border-border/60 bg-muted/15 p-3">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Target Consistency
                    </span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-foreground">{target_completion_rate}%</span>
                        <span className="text-xs text-muted-foreground">met</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                        {target_met_days} / 30 days hit target
                    </span>
                </div>
            </div>

            {/* 30-Day Punchcard Heatmap */}
            <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/10 p-4">
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground">
                            30-Day Practice Activity Punchcard
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span>Less</span>
                        <span className="size-3 rounded-sm bg-muted/40 border border-border/40" />
                        <span className="size-3 rounded-sm bg-emerald-900/50 border border-emerald-700/50" />
                        <span className="size-3 rounded-sm bg-emerald-600/70 border border-emerald-500/70" />
                        <span className="size-3 rounded-sm bg-[#2FB36F] border border-[#2FB36F]" />
                        <span className="size-3 rounded-sm bg-[#55BDEB] border border-[#55BDEB]" />
                        <span>More</span>
                    </div>
                </div>

                {/* Heatmap Grid */}
                <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-30 gap-1.5 pt-2">
                    {days.map((day) => (
                        <div
                            key={day.date}
                            onMouseEnter={() => setHoveredDay(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                            className={`group relative flex h-14 flex-col items-center justify-center rounded-lg border p-1 transition-all cursor-pointer hover:scale-105 ${getIntensityClass(
                                day.intensity_level,
                                day.is_today
                            )}`}
                        >
                            <span className="text-[9px] font-medium opacity-75">
                                {day.day_name.charAt(0)}
                            </span>
                            <span className="text-xs font-bold leading-none">
                                {day.day_number}
                            </span>
                            <span className="mt-0.5 text-[9px] font-semibold leading-none truncate max-w-full">
                                {day.attempts_count > 0 ? `${day.attempts_count}` : '-'}
                            </span>

                            {/* Indicator for target met */}
                            {day.target_met && (
                                <span className="absolute top-1 right-1 size-1 rounded-full bg-white" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Hover / Detail Status Strip */}
                <div className="mt-2 min-h-6 flex items-center justify-between rounded-lg bg-card/60 px-3 py-1.5 text-xs border border-border/40">
                    {hoveredDay ? (
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="font-semibold text-foreground">
                                📅 {hoveredDay.day_name}, {hoveredDay.month_name} {hoveredDay.day_number} ({hoveredDay.date})
                            </span>
                            <span className="text-muted-foreground">
                                Solved: <strong className="text-foreground">{hoveredDay.attempts_count} MCQs</strong>
                            </span>
                            {hoveredDay.attempts_count > 0 && (
                                <span className="text-muted-foreground">
                                    Accuracy: <strong className="text-[#2FB36F]">{hoveredDay.accuracy}%</strong> ({hoveredDay.correct_count} correct)
                                </span>
                            )}
                            <span className="text-muted-foreground">
                                Target: {hoveredDay.target_met ? (
                                    <span className="font-bold text-[#2FB36F]">✓ Target Met ({daily_target})</span>
                                ) : (
                                    <span className="text-muted-foreground">{hoveredDay.attempts_count}/{daily_target} MCQs</span>
                                )}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span>Hover over any calendar cell to view daily MCQ count, accuracy, and quota completion.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Motivational Banner / Call to Action */}
            <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-border/70 bg-gradient-to-r from-muted/30 to-muted/10 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                    {targetMetToday ? (
                        <CheckCircle2 className="size-5 text-[#2FB36F] shrink-0" />
                    ) : today_attempts > 0 ? (
                        <TrendingUp className="size-5 text-amber-500 shrink-0" />
                    ) : (
                        <Flame className="size-5 text-orange-500 shrink-0" />
                    )}
                    <div>
                        <p className="text-xs font-semibold text-foreground">
                            {targetMetToday
                                ? `🎉 Daily target achieved! You've completed ${today_attempts} MCQs today.`
                                : today_attempts > 0
                                ? `⚡ Active practice today: ${today_attempts}/${daily_target} MCQs solved. Solve ${remainingToday} more to hit full daily target!`
                                : `⏳ No MCQs attempted yet today. Complete at least 1 question to keep your ${current_streak}-day streak alive!`}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                            Daily Target: {daily_target} MCQs | Today's Solved: {today_attempts} MCQs
                        </p>
                    </div>
                </div>

                <Link href="/qbank/runner">
                    <Button size="sm" className="h-8 bg-[#55BDEB] text-neutral-950 font-bold hover:bg-[#55BDEB]/90 gap-1.5 text-xs">
                        Start Session <ArrowRight className="size-3.5" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
