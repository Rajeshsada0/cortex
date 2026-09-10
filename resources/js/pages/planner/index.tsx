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

export default function PlannerIndex({ user, plan: initialPlan }: PlannerProps) {
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
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    target_exam_date: targetDate,
                    daily_study_hours: hours,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success('Study Timeline Recalculated!', {
                    description: `Daily target adjusted to ${data.recalculated.daily_mcq_target} MCQs across ${data.recalculated.days_remaining} days.`,
                });
                setPlan((prev) => ({
                    ...prev,
                    target_exam_date: targetDate,
                    daily_study_hours: hours,
                    daily_mcq_target: data.recalculated.daily_mcq_target,
                    days_remaining: data.recalculated.days_remaining,
                    recommended_daily_pace: data.recalculated.daily_mcq_target,
                }));
            }
        } catch (err) {
            toast.error('Failed to recalculate study plan');
        } finally {
            setIsRecalculating(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full">
            <Head title="Study Planner & Schedule Recalculator — Cortex Medical" />

            {/* Header */}
            <div className="flex flex-col gap-1 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                    <span className="rounded bg-[#55BDEB]/15 px-2.5 py-0.5 text-xs font-bold text-[#55BDEB]">
                        Personalized Timeline Engine
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {plan.days_remaining} Days Remaining Until Target Exam
                    </span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    High-Yield Study Planner & Recalculator
                </h1>
                <p className="text-xs text-muted-foreground max-w-2xl">
                    Dynamically recalculates your daily MCQ volume, revision blocks, and mock simulations based on time constraints.
                </p>
            </div>

            {/* Pacing Overview Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                        Countdown
                    </span>
                    <span className="text-2xl font-extrabold text-foreground mt-1">
                        {plan.days_remaining}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        Days until test day
                    </span>
                </div>

                <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                        Daily Capacity
                    </span>
                    <span className="text-2xl font-extrabold text-[#55BDEB] mt-1">
                        {plan.daily_study_hours} hrs
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        Allocated study time
                    </span>
                </div>

                <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                        Required Pace
                    </span>
                    <span className="text-2xl font-extrabold text-[#2FB36F] mt-1">
                        {plan.daily_mcq_target}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        MCQs daily target
                    </span>
                </div>

                <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                        Remaining Pool
                    </span>
                    <span className="text-2xl font-extrabold text-foreground mt-1">
                        {plan.remaining_questions}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        Questions to master
                    </span>
                </div>
            </div>

            {/* Recalculator Form */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
                    <Calculator className="size-4 text-[#55BDEB]" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        Mathematical Schedule Recalculator
                    </h3>
                </div>

                <form onSubmit={handleRecalculate} className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">
                            Target Examination Date
                        </label>
                        <input
                            type="date"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            className="h-10 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#55BDEB]"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">
                            Daily Dedicated Hours ({hours} hrs/day)
                        </label>
                        <input
                            type="range"
                            min="2"
                            max="14"
                            value={hours}
                            onChange={(e) => setHours(Number(e.target.value))}
                            className="h-2 w-full cursor-pointer accent-[#55BDEB] mt-3"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isRecalculating}
                        className="h-10 bg-[#102A43] dark:bg-[#55BDEB] text-white dark:text-neutral-950 font-bold text-xs shadow-sm"
                    >
                        {isRecalculating ? 'Calculating...' : 'Recalculate Pacing'}
                    </Button>
                </form>
            </div>

            {/* Daily Schedule Task Blocks */}
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Recommended Daily Architecture (Circadian Block Schedule)
                </h3>

                <div className="flex flex-col divide-y divide-border">
                    {[
                        {
                            slot: '07:00 – 08:30',
                            title: 'Spaced Repetition Flashcard Queue',
                            desc: 'Clear SM-2 due cards using active recall before clinical rounds or lectures.',
                            tag: 'Active Recall',
                            badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
                        },
                        {
                            slot: '09:00 – 12:00',
                            title: 'Timed High-Yield Clinical MCQ Block',
                            desc: 'Execute 40–60 question blocks in split-screen vignette mode with strict pacing.',
                            tag: 'Exam Simulation',
                            badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
                        },
                        {
                            slot: '14:00 – 16:30',
                            title: '3-Tier Clinical Rationale Review',
                            desc: 'Deconstruct Foundation, Pathophysiologic Integration, and Clinical Next Steps.',
                            tag: 'Deep Review',
                            badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                        },
                        {
                            slot: '17:00 – 18:30',
                            title: 'Hazardous Blind Spot Remediation',
                            desc: 'Target High-Confidence Incorrect items identified in the 4-Quadrant diagnostic matrix.',
                            tag: 'Targeted Remediation',
                            badgeColor: 'bg-[#E05252]/10 text-[#E05252]',
                        },
                    ].map((b, idx) => (
                        <div key={idx} className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-[#55BDEB]">
                                        {b.slot}
                                    </span>
                                    <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${b.badgeColor}`}>
                                        {b.tag}
                                    </span>
                                </div>
                                <span className="font-bold text-xs text-foreground mt-0.5">{b.title}</span>
                                <p className="text-[11px] text-muted-foreground">{b.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
