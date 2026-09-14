import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    Target,
    Calculator,
    CheckCircle2,
    BookOpen,
    PlaySquare,
    Sparkles,
    AlertCircle,
    Flame,
    Compass,
    ArrowRight,
    Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface PlannerProps {
    user: any;
    plan: {
        target_exam_date: string;
        days_remaining: number;
        daily_study_hours: number;
        daily_mcq_target: number;
        total_questions: number;
        attempted_questions: number;
        remaining_questions: number;
        recommended_daily_pace: number;
    };
}

export default function PlannerIndex({
    user,
    plan: initialPlan,
}: PlannerProps) {
    const [plan, setPlan] = useState(initialPlan);
    const [targetDate, setTargetDate] = useState(plan.target_exam_date);
    const [hours, setHours] = useState(plan.daily_study_hours);
    const [isRecalculating, setIsRecalculating] = useState(false);

    const handleRecalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRecalculating(true);

        try {
            const res = await fetch('/api/v1/study-planner/recalculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    target_exam_date: targetDate,
                    daily_study_hours: hours,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const roundedDays = Number(data.recalculated.days_remaining).toFixed(2);
                toast.success('Study Timeline Recalculated!', {
                    description: `Daily target adjusted to ${data.recalculated.daily_mcq_target} MCQs across ${roundedDays} days.`,
                });
                setPlan((prev) => ({
                    ...prev,
                    target_exam_date: targetDate,
                    daily_study_hours: hours,
                    daily_mcq_target: data.recalculated.daily_mcq_target,
                    days_remaining: data.recalculated.days_remaining,
                    recommended_daily_pace: data.recalculated.daily_mcq_target,
                }));
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || 'Failed to recalculate study plan');
            }
        } catch (err) {
            toast.error('Failed to recalculate study plan');
        } finally {
            setIsRecalculating(false);
        }
    };

    return (
        <TooltipProvider delayDuration={150}>
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <Head title="Study Planner — Cortex Medical" />

                {/* Clean, Modern Header Bar */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                                    <Sparkles className="h-3 w-3" />
                                    Dynamic Study Architecture
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    Target: <strong className="font-mono text-foreground">{plan.target_exam_date || 'Not Set'}</strong>
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Study Planner & Pace Calibrator
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="rounded-xl border border-border bg-muted/40 px-3 py-1.5 font-mono text-xs text-muted-foreground">
                                <strong className="font-bold text-foreground">{Math.max(0, Math.ceil(Number(plan.days_remaining)))}</strong> days remaining
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pacing Overview Metric Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {/* 1. Countdown */}
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-mono text-2xl font-bold text-foreground">
                                    {Math.max(0, Math.ceil(Number(plan.days_remaining)))}
                                </div>
                                <p className="text-xs text-muted-foreground">Days to Exam</p>
                            </div>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button type="button" className="text-muted-foreground hover:text-foreground" aria-label="Countdown info">
                                    <Info className="h-3.5 w-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Days remaining until scheduled examination</TooltipContent>
                        </Tooltip>
                    </div>

                    {/* 2. Daily Capacity */}
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Flame className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-mono text-2xl font-bold text-foreground">
                                    {plan.daily_study_hours}
                                </div>
                                <p className="text-xs text-muted-foreground">Hours / Day</p>
                            </div>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button type="button" className="text-muted-foreground hover:text-foreground" aria-label="Daily capacity info">
                                    <Info className="h-3.5 w-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Allocated daily study commitment</TooltipContent>
                        </Tooltip>
                    </div>

                    {/* 3. Required Pace */}
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Target className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-mono text-2xl font-bold text-foreground">
                                    {plan.daily_mcq_target}
                                </div>
                                <p className="text-xs text-muted-foreground">MCQs / Day</p>
                            </div>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button type="button" className="text-muted-foreground hover:text-foreground" aria-label="Required pace info">
                                    <Info className="h-3.5 w-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Daily question target required to complete curriculum</TooltipContent>
                        </Tooltip>
                    </div>

                    {/* 4. Remaining Pool */}
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-mono text-2xl font-bold text-foreground">
                                    {plan.remaining_questions}
                                </div>
                                <p className="text-xs text-muted-foreground">Unmastered</p>
                            </div>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button type="button" className="text-muted-foreground hover:text-foreground" aria-label="Remaining pool info">
                                    <Info className="h-3.5 w-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Questions remaining out of {plan.total_questions} total</TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Recalculator Form */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition">
                    <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                            <Calculator className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                Schedule Recalibration
                            </h3>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            Pacing adapts automatically to exam timeline changes
                        </span>
                    </div>

                    <form
                        onSubmit={handleRecalculate}
                        className="grid grid-cols-1 items-end gap-5 lg:grid-cols-3"
                    >
                        {/* Target Date Picker */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="target-exam-date"
                                className="flex items-center gap-1.5 text-xs font-semibold text-foreground"
                            >
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Exam Target Date</span>
                            </label>
                            <input
                                id="target-exam-date"
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                className="h-9 w-full cursor-pointer rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground transition focus:border-cyan-500 focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                                required
                            />
                        </div>

                        {/* Daily Dedicated Hours */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="study-hours"
                                    className="flex items-center gap-1.5 text-xs font-semibold text-foreground"
                                >
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>Daily Study Hours</span>
                                </label>
                                <span className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.2 font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300">
                                    {hours} hrs/day
                                </span>
                            </div>
                            <div className="pt-1">
                                <input
                                    id="study-hours"
                                    type="range"
                                    min="2"
                                    max="14"
                                    step="1"
                                    value={hours}
                                    onChange={(e) => setHours(Number(e.target.value))}
                                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-cyan-600 transition"
                                />
                                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                                    <span>2h (Min)</span>
                                    <span>6–8h (Standard)</span>
                                    <span>14h (Intense)</span>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <Button
                                type="submit"
                                disabled={isRecalculating}
                                className="h-9 w-full rounded-xl bg-cyan-600 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
                            >
                                <Calculator className="h-3.5 w-3.5 mr-1.5" />
                                {isRecalculating ? 'Recalculating...' : 'Recalculate Pace'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Daily Schedule Task Blocks */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition">
                    <div className="mb-4 flex flex-col gap-1 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                Circadian Study Architecture
                            </h3>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            Calibrated for cognitive endurance and retrieval practice
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                            {
                                slot: '07:00 – 08:30',
                                title: 'Spaced Repetition Queue',
                                desc: 'Clear SM-2 due cards using active recall before clinical duties or classes.',
                                tag: 'Active Recall',
                                borderColor: 'border-l-sky-500',
                                badgeColor: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300',
                            },
                            {
                                slot: '09:00 – 12:00',
                                title: 'Timed Clinical MCQ Block',
                                desc: 'Execute 40–60 question blocks in test mode with strict exam pacing.',
                                tag: 'Simulation',
                                borderColor: 'border-l-indigo-500',
                                badgeColor: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
                            },
                            {
                                slot: '14:00 – 16:30',
                                title: '3-Tier Rationale Review',
                                desc: 'Deconstruct Foundation, Integration, and Clinical Next Steps.',
                                tag: 'Deep Review',
                                borderColor: 'border-l-amber-500',
                                badgeColor: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
                            },
                            {
                                slot: '17:00 – 18:30',
                                title: 'Blind Spot Remediation',
                                desc: 'Target High-Confidence Incorrect items from the diagnostic matrix.',
                                tag: 'Remediation',
                                borderColor: 'border-l-rose-500',
                                badgeColor: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
                            },
                        ].map((b, idx) => (
                            <div
                                key={idx}
                                className={`flex flex-col justify-between rounded-xl border border-border bg-muted/30 p-4 border-l-4 ${b.borderColor} transition hover:border-slate-300 dark:hover:border-slate-700`}
                            >
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                                            {b.slot}
                                        </span>
                                        <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold ${b.badgeColor}`}>
                                            {b.tag}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-foreground">
                                        {b.title}
                                    </h4>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        {b.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
