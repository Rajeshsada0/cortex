import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    Flame,
    Calendar,
    CheckCircle2,
    TrendingUp,
    Zap,
    Award,
    ArrowRight,
    ShieldAlert,
    Sliders,
    Save,
    BarChart3,
    Eye,
    Target,
    Clock,
    Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
    onTargetUpdated?: (newTarget: number) => void;
}

export function StudyStreakHeatmap({
    streakData,
    onTargetUpdated,
}: StudyStreakHeatmapProps) {
    if (!streakData) {
        return null;
    }

    const {
        current_streak,
        longest_streak,
        total_30d_attempts,
        active_days_30d,
        daily_target: initialDailyTarget,
        today_attempts,
        days: initialDays,
    } = streakData;

    // Interactive States
    const [dailyTarget, setDailyTarget] = useState<number>(
        initialDailyTarget || 50,
    );
    const [selectedDay, setSelectedDay] = useState<StudyDayData | null>(
        initialDays.find((d) => d.is_today) ||
            initialDays[initialDays.length - 1] ||
            null,
    );
    const [hoveredDay, setHoveredDay] = useState<StudyDayData | null>(null);
    const [colorMode, setColorMode] = useState<'volume' | 'accuracy'>('volume');
    const [isSavingTarget, setIsSavingTarget] = useState(false);

    // Dynamic calculations based on active daily target
    const targetMetDays = initialDays.filter(
        (d) => d.attempts_count >= dailyTarget,
    ).length;
    const targetCompletionRate =
        active_days_30d > 0
            ? Math.round((targetMetDays / 30) * 1000) / 10
            : 0.0;
    const targetMetToday = today_attempts >= dailyTarget;
    const remainingToday = Math.max(0, dailyTarget - today_attempts);

    // Save Daily Target to Backend User Profile
    const handleSaveTarget = async (targetValue: number) => {
        setIsSavingTarget(true);
        try {
            const res = await fetch('/api/v1/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ daily_mcq_target: targetValue }),
            });

            if (res.ok) {
                toast.success(`Daily goal updated to ${targetValue} MCQs/day`, {
                    description:
                        'Streak engine and consistency metrics recalculated.',
                });
                if (onTargetUpdated) {
                    onTargetUpdated(targetValue);
                }
            } else {
                toast.error('Could not save daily target to server');
            }
        } catch (e) {
            toast.error('Network error saving daily target');
        } finally {
            setIsSavingTarget(false);
        }
    };

    // Calculate dynamic intensity class
    const getIntensityClass = (day: StudyDayData) => {
        const isSelected = selectedDay?.date === day.date;
        const ring = isSelected
            ? 'ring-2 ring-[#55BDEB] ring-offset-2 ring-offset-card scale-105 z-10'
            : day.is_today
              ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-card'
              : '';

        if (colorMode === 'accuracy') {
            if (day.attempts_count === 0) {
                return `bg-muted/20 border-border/30 text-muted-foreground/50 ${ring}`;
            }
            if (day.accuracy >= 80) {
                return `bg-[#2FB36F] border-[#2FB36F] text-white font-bold shadow-xs ${ring}`;
            }
            if (day.accuracy >= 65) {
                return `bg-[#55BDEB] border-[#55BDEB] text-slate-950 font-bold shadow-xs ${ring}`;
            }
            if (day.accuracy >= 50) {
                return `bg-amber-500 border-amber-500 text-slate-950 font-bold shadow-xs ${ring}`;
            }
            return `bg-[#E05252] border-[#E05252] text-white font-semibold shadow-xs ${ring}`;
        }

        // Volume Mode: relative to active daily target
        const count = day.attempts_count;
        if (count === 0) {
            return `bg-muted/30 border-border/40 text-muted-foreground/60 hover:border-border ${ring}`;
        }
        if (count >= dailyTarget) {
            return `bg-[#55BDEB] border-[#55BDEB] text-slate-950 font-bold shadow-sm shadow-[#55BDEB]/30 ${ring}`;
        }
        if (count >= dailyTarget * 0.7) {
            return `bg-[#2FB36F] border-[#2FB36F] text-white font-semibold shadow-sm ${ring}`;
        }
        if (count >= dailyTarget * 0.4) {
            return `bg-emerald-600/70 border-emerald-500/70 text-white ${ring}`;
        }
        return `bg-emerald-900/40 border-emerald-700/50 text-emerald-300 ${ring}`;
    };

    const targetPresets = [30, 50, 80, 100, 120, 150];
    const displayDay = hoveredDay || selectedDay;

    return (
        <div className="bg-cortex-card border-cortex-border card-glow rounded-2xl border p-6 shadow-xl">
            {/* Streak Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-lg shadow-orange-900/30">
                        <Flame className="h-6 w-6 fill-current" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h4 className="text-base font-bold text-white">
                                DAILY STUDY STREAK
                            </h4>
                            <span className="rounded border border-orange-800 bg-orange-950 px-2 py-0.5 text-xs font-bold text-orange-400">
                                {current_streak}{' '}
                                {current_streak === 1 ? 'Day' : 'Days'} Streak
                            </span>
                        </div>
                        <p className="text-xs text-slate-400">
                            Consistent deliberate retrieval practice builds
                            board exam automaticity.
                        </p>
                    </div>
                </div>
                <Link
                    href="/qbank/runner"
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
                >
                    Extend Streak
                </Link>
            </div>

            {/* Streak Stat Grid */}
            <div className="my-4 grid grid-cols-4 gap-2 text-center">
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">
                        Active Streak
                    </span>
                    <span className="font-mono text-lg font-bold text-white">
                        {current_streak}
                    </span>
                    <span className="block text-[10px] font-medium text-amber-400">
                        {today_attempts > 0 ? '• Active' : '• Action Needed'}
                    </span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">
                        Personal Best
                    </span>
                    <span className="font-mono text-lg font-bold text-white">
                        {longest_streak}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                        Days Longest
                    </span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">
                        30-Day Volume
                    </span>
                    <span className="font-mono text-lg font-bold text-white">
                        {total_30d_attempts}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                        MCQs Total
                    </span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">
                        Consistency
                    </span>
                    <span className="font-mono text-lg font-bold text-white">
                        {targetCompletionRate}%
                    </span>
                    <span className="block text-[10px] text-slate-400">
                        {targetMetDays} / 30 Target Days
                    </span>
                </div>
            </div>

            {/* Target Selector Bar */}
            <div className="flex items-center justify-between border-t border-b border-slate-800/80 py-2 text-xs">
                <span className="text-slate-400">Set Daily MCQ Target:</span>
                <div className="flex items-center space-x-1.5 font-mono">
                    {targetPresets.map((preset) => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => {
                                setDailyTarget(preset);
                                void handleSaveTarget(preset);
                            }}
                            className={`cursor-pointer rounded px-2.5 py-1 text-xs transition ${
                                dailyTarget === preset
                                    ? 'bg-cyan-600 font-bold text-white shadow'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                        >
                            {preset}
                        </button>
                    ))}
                </div>
            </div>

            {/* 30-Day Activity Punchcard Grid */}
            <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-slate-400">
                    <span>30-Day Practice Activity Punchcard</span>
                    <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] text-slate-500">
                            Inactive
                        </span>
                        <span className="h-2.5 w-2.5 rounded-sm border border-slate-700 bg-slate-800"></span>
                        <span className="h-2.5 w-2.5 rounded-sm bg-cyan-900"></span>
                        <span className="h-2.5 w-2.5 rounded-sm bg-cyan-600"></span>
                        <span className="h-2.5 w-2.5 rounded-sm bg-cyan-400"></span>
                        <span className="text-[10px] text-slate-400">
                            ≥{dailyTarget} MCQs
                        </span>
                    </div>
                </div>

                {/* 30 Days Mini Grid (6 cols sm:grid-cols-10 gap-1.5 text-center) */}
                <div className="grid grid-cols-6 gap-1.5 text-center sm:grid-cols-10">
                    {initialDays.map((day) => {
                        const isDayTargetMet =
                            day.attempts_count >= dailyTarget;
                        const isToday = day.is_today;

                        let cellClass =
                            'bg-slate-900/60 border border-slate-800/80 text-slate-500';
                        if (isToday) {
                            cellClass =
                                'bg-cyan-950/60 border-2 border-cyan-400 text-cyan-300 font-bold shadow-sm ring-2 ring-cyan-500/20';
                        } else if (isDayTargetMet) {
                            cellClass = 'bg-cyan-500 text-slate-950 font-bold';
                        } else if (day.attempts_count >= dailyTarget * 0.5) {
                            cellClass = 'bg-cyan-600 text-white font-semibold';
                        } else if (day.attempts_count > 0) {
                            cellClass = 'bg-cyan-900 text-cyan-300 font-medium';
                        }

                        return (
                            <div
                                key={day.date}
                                onClick={() => setSelectedDay(day)}
                                className={`cursor-pointer rounded p-1.5 font-mono text-[10px] transition hover:scale-105 ${cellClass}`}
                                title={`${day.date}: ${day.attempts_count} MCQs (${day.accuracy}%)`}
                            >
                                {day.day_number}
                                {isToday && (
                                    <span className="block font-sans text-[8px] text-cyan-400 uppercase">
                                        Today
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Streak Callout Action */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                    <span
                        className={`h-2 w-2 rounded-full ${today_attempts > 0 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                    ></span>
                    <span>
                        {today_attempts > 0
                            ? `Great job! You solved ${today_attempts} MCQs today. Streak is active!`
                            : 'No MCQs attempted yet today. Complete 1 question to activate your streak!'}
                    </span>
                </div>
                <Link href="/qbank/runner">
                    <button
                        type="button"
                        className="cursor-pointer rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow transition hover:bg-amber-400"
                    >
                        Solve Now
                    </button>
                </Link>
            </div>
        </div>
    );
}
