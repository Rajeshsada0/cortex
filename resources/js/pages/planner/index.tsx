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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        <div className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <Head title="Study Planner & Schedule Recalculator — Cortex Medical" />

            {/* Header */}
            <div className="flex flex-col gap-2 border-b border-slate-800 pb-5">
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400">
                        <Sparkles className="size-3.5" />
                        Personalized Timeline Engine
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-300">
                        <Clock className="size-3.5 text-cyan-400" />
                        <span className="font-mono font-bold text-white">
                            {Number(plan.days_remaining).toFixed(2)}
                        </span>{' '}
                        Days Remaining Until Target Exam
                    </span>
                </div>
                <h1 className="font-heading text-2xl font-black tracking-tight text-white sm:text-3xl">
                    High-Yield Study Planner & Recalculator
                </h1>
                <p className="max-w-2xl text-xs text-slate-300 sm:text-sm">
                    Dynamically recalculates your daily MCQ volume, revision
                    blocks, and mock simulations based on time constraints.
                </p>
            </div>

            {/* Pacing Overview Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {/* Countdown */}
                <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-[#0d1322] p-4.5 shadow-sm transition-all hover:border-cyan-500/40">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Countdown
                        </span>
                        <div className="flex size-7 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                            <Clock className="size-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="font-mono text-2xl font-black text-white sm:text-3xl">
                            {Number(plan.days_remaining).toFixed(2)}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">days</span>
                    </div>
                    <span className="mt-1 block text-[11px] font-medium text-slate-400">
                        Days until test day
                    </span>
                </div>

                {/* Daily Capacity */}
                <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-[#0d1322] p-4.5 shadow-sm transition-all hover:border-cyan-500/40">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Daily Capacity
                        </span>
                        <div className="flex size-7 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                            <Flame className="size-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="font-mono text-2xl font-black text-cyan-400 sm:text-3xl">
                            {plan.daily_study_hours}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">hrs/day</span>
                    </div>
                    <span className="mt-1 block text-[11px] font-medium text-slate-400">
                        Allocated study time
                    </span>
                </div>

                {/* Required Pace */}
                <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-[#0d1322] p-4.5 shadow-sm transition-all hover:border-emerald-500/40">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Required Pace
                        </span>
                        <div className="flex size-7 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                            <Target className="size-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="font-mono text-2xl font-black text-emerald-400 sm:text-3xl">
                            {plan.daily_mcq_target}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">MCQs/day</span>
                    </div>
                    <span className="mt-1 block text-[11px] font-medium text-slate-400">
                        Daily question target
                    </span>
                </div>

                {/* Remaining Pool */}
                <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-[#0d1322] p-4.5 shadow-sm transition-all hover:border-purple-500/40">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Remaining Pool
                        </span>
                        <div className="flex size-7 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400">
                            <BookOpen className="size-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="font-mono text-2xl font-black text-white sm:text-3xl">
                            {plan.remaining_questions}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">/ {plan.total_questions}</span>
                    </div>
                    <span className="mt-1 block text-[11px] font-medium text-slate-400">
                        Questions to master
                    </span>
                </div>
            </div>

            {/* Recalculator Form */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-[#0d1322] p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                        <Calculator className="size-4 text-cyan-400" />
                        <h3 className="text-sm font-bold tracking-wider text-white uppercase">
                            Mathematical Schedule Recalculator
                        </h3>
                    </div>
                    <span className="hidden text-xs text-slate-400 sm:inline-block">
                        Dynamic pace calibration based on available calendar days
                    </span>
                </div>

                <form
                    onSubmit={handleRecalculate}
                    className="grid grid-cols-1 items-end gap-5 lg:grid-cols-3"
                >
                    {/* Target Date Picker */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="target-exam-date"
                            className="flex items-center gap-2 text-xs font-bold tracking-wide text-slate-300"
                        >
                            <Calendar className="size-3.5 text-cyan-400" />
                            <span>Target Examination Date</span>
                        </label>
                        <div className="relative">
                            <input
                                id="target-exam-date"
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                className="h-11 w-full cursor-pointer rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 text-sm font-semibold text-white shadow-inner transition-all hover:border-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-90 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                                required
                            />
                        </div>
                        <span className="text-[11px] text-slate-400">
                            Select scheduled exam date to recalibrate study pacing
                        </span>
                    </div>

                    {/* Daily Dedicated Hours */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="study-hours"
                                className="flex items-center gap-2 text-xs font-bold tracking-wide text-slate-300"
                            >
                                <Clock className="size-3.5 text-cyan-400" />
                                <span>Daily Study Allocation</span>
                            </label>
                            <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-300">
                                {hours} hrs/day
                            </span>
                        </div>
                        <div className="flex flex-col gap-1.5 pt-1">
                            <input
                                id="study-hours"
                                type="range"
                                min="2"
                                max="14"
                                step="1"
                                value={hours}
                                onChange={(e) => setHours(Number(e.target.value))}
                                className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400 transition-all hover:bg-slate-700"
                            />
                            <div className="flex justify-between text-[10px] font-medium text-slate-400">
                                <span>2 hrs (Min)</span>
                                <span>6–8 hrs (Standard)</span>
                                <span>14 hrs (Intensive)</span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col justify-end">
                        <Button
                            type="submit"
                            disabled={isRecalculating}
                            className="h-11 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-cyan-400 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-sky-300 hover:shadow-cyan-500/30 active:scale-[0.98] disabled:opacity-50"
                        >
                            <Calculator className="mr-2 size-4 text-slate-950" />
                            {isRecalculating
                                ? 'Recalculating Timeline...'
                                : 'Recalculate Pacing'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Daily Schedule Task Blocks */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-[#0d1322] p-6 shadow-sm">
                <div className="flex flex-col gap-1 border-b border-slate-800/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="size-4 text-cyan-400" />
                        <h3 className="text-sm font-bold tracking-wider text-white uppercase">
                            Recommended Daily Architecture (Circadian Block Schedule)
                        </h3>
                    </div>
                    <span className="text-xs text-slate-400">
                        Calibrated for optimal clinical retention & recall
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                        {
                            slot: '07:00 – 08:30',
                            title: 'Spaced Repetition Flashcard Queue',
                            desc: 'Clear SM-2 due cards using active recall before clinical rounds or lectures.',
                            tag: 'Active Recall',
                            borderColor: 'border-l-sky-400',
                            badgeColor:
                                'border-sky-500/30 bg-sky-500/10 text-sky-400',
                        },
                        {
                            slot: '09:00 – 12:00',
                            title: 'Timed High-Yield Clinical MCQ Block',
                            desc: 'Execute 40–60 question blocks in split-screen vignette mode with strict pacing.',
                            tag: 'Exam Simulation',
                            borderColor: 'border-l-indigo-400',
                            badgeColor:
                                'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
                        },
                        {
                            slot: '14:00 – 16:30',
                            title: '3-Tier Clinical Rationale Review',
                            desc: 'Deconstruct Foundation, Pathophysiologic Integration, and Clinical Next Steps.',
                            tag: 'Deep Review',
                            borderColor: 'border-l-amber-400',
                            badgeColor:
                                'border-amber-500/30 bg-amber-500/10 text-amber-300',
                        },
                        {
                            slot: '17:00 – 18:30',
                            title: 'Hazardous Blind Spot Remediation',
                            desc: 'Target High-Confidence Incorrect items identified in the 4-Quadrant diagnostic matrix.',
                            tag: 'Targeted Remediation',
                            borderColor: 'border-l-rose-500',
                            badgeColor:
                                'border-rose-500/30 bg-rose-500/10 text-rose-300',
                        },
                    ].map((b, idx) => (
                        <div
                            key={idx}
                            className={`flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 border-l-4 ${b.borderColor} transition-all hover:border-slate-700`}
                        >
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono text-xs font-bold text-cyan-400">
                                        {b.slot}
                                    </span>
                                    <span
                                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${b.badgeColor}`}
                                    >
                                        {b.tag}
                                    </span>
                                </div>
                                <h4 className="mt-1 text-sm font-bold text-white">
                                    {b.title}
                                </h4>
                                <p className="text-xs leading-relaxed text-slate-300">
                                    {b.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
