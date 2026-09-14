import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    GraduationCap,
    Clock,
    AlertTriangle,
    ShieldCheck,
    CheckCircle2,
    Trophy,
    Landmark,
    ArrowUpRight,
    Info,
    Calendar,
    Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PathwaySelector } from '@/components/cortex/pathway-selector';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface MockIndexProps {
    user: any;
    activePathway: string;
    pathwayName: string;
    targetQuestions: number;
    durationMinutes: number;
    markingRules: string;
    history: any[];
}

interface ExamPreset {
    id: string;
    title: string;
    subtitle: string;
    questions: number;
    duration: number;
    badge: string;
    badgeColor: string;
    description: string;
}

const EXAM_PRESETS: ExamPreset[] = [
    {
        id: 'full',
        title: 'Full Grand Mock',
        subtitle: 'Official National Blueprint',
        questions: 200,
        duration: 180,
        badge: '100% Curricular Blueprint',
        badgeColor: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
        description:
            'Full 3-hour marathon proportionally distributed across all 19 subjects (Pre-clinical 18%, Para-clinical 32%, Clinical 50%).',
    },
    {
        id: 'half',
        title: 'Half Mock Exam',
        subtitle: 'Condensed Block Simulation',
        questions: 100,
        duration: 90,
        badge: 'Balanced 50% Quota',
        badgeColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
        description:
            '90-minute mid-length exam balancing stamina with broad multi-discipline coverage.',
    },
    {
        id: 'block',
        title: 'Clinical Block',
        subtitle: 'Speed & Stamina Training',
        questions: 50,
        duration: 45,
        badge: '45-Min Block',
        badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        description:
            'Single high-yield block simulating test-day timing (54 sec/MCQ) for daily timed assessments.',
    },
    {
        id: 'sprint',
        title: 'Diagnostic Sprint',
        subtitle: 'Quick Knowledge Probe',
        questions: 20,
        duration: 20,
        badge: 'Quick 20-Min Check',
        badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
        description:
            'Rapid diagnostic run to calibrate recall speed and test negative-marking risk control.',
    },
];

export default function MockExamIndex({
    user,
    activePathway,
    pathwayName,
    targetQuestions: defaultQuestions,
    durationMinutes: defaultDuration,
    markingRules,
    history = [],
}: MockIndexProps) {
    const [selectedPreset, setSelectedPreset] = useState<ExamPreset>(
        EXAM_PRESETS[0],
    );

    const handleLaunch = () => {
        router.post('/mock-exam/launch', {
            pathway: activePathway,
            target_questions: selectedPreset.questions,
            duration_minutes: selectedPreset.duration,
        });
    };

    return (
        <TooltipProvider delayDuration={150}>
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <Head title="Grand Mock Exam Hall — Cortex Medical" />

                {/* Header Bar */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                                    <Landmark className="h-3 w-3" />
                                    Official Simulation Hall
                                </span>
                                <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
                                    {pathwayName}
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Standardized Grand Mock Hall
                            </h1>
                        </div>

                        <PathwaySelector currentPathway={activePathway} />
                    </div>
                </div>

                {/* Exam Format Presets Selector */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-foreground">
                            Examination Format & Blueprint Scale
                        </h2>
                        <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                            {selectedPreset.questions} Questions &bull; {selectedPreset.duration} mins
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                        {EXAM_PRESETS.map((preset) => {
                            const isSelected = selectedPreset.id === preset.id;
                            return (
                                <div
                                    key={preset.id}
                                    onClick={() => setSelectedPreset(preset)}
                                    className={`relative flex cursor-pointer flex-col justify-between gap-3 rounded-2xl border p-4.5 transition-all ${
                                        isSelected
                                            ? 'border-cyan-500/60 bg-cyan-500/5 ring-1 ring-cyan-500/30 shadow-xs'
                                            : 'border-border bg-card hover:border-border/80 hover:bg-muted/30'
                                    }`}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${preset.badgeColor}`}
                                            >
                                                {preset.badge}
                                            </span>
                                            {isSelected && (
                                                <CheckCircle2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                            )}
                                        </div>

                                        <h3 className="text-sm font-bold text-foreground">
                                            {preset.title}
                                        </h3>
                                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                                            {preset.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-border pt-2.5 text-xs">
                                        <span className="font-mono font-semibold text-foreground">
                                            {preset.questions} Items
                                        </span>
                                        <span className="font-mono text-muted-foreground">
                                            {preset.duration} Mins
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Exam Simulation Card */}
                <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-xs">
                    <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                                Live Session Specifications
                            </span>
                            <h2 className="text-xl font-bold text-foreground">
                                {pathwayName} &bull; {selectedPreset.title}
                            </h2>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                            <Trophy className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 border-y border-border py-4 sm:grid-cols-3">
                        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3.5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                    <span className="block text-[11px] text-muted-foreground">
                                        Session Duration
                                    </span>
                                    <span className="font-mono text-xs font-bold text-foreground">
                                        {selectedPreset.duration} Minutes
                                    </span>
                                </div>
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-muted-foreground hover:text-foreground">
                                        <Info className="h-3.5 w-3.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    Strict timer enforcement with automatic submission
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3.5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                    <GraduationCap className="h-4 w-4" />
                                </div>
                                <div>
                                    <span className="block text-[11px] text-muted-foreground">
                                        Question Count
                                    </span>
                                    <span className="font-mono text-xs font-bold text-foreground">
                                        {selectedPreset.questions} Questions
                                    </span>
                                </div>
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-muted-foreground hover:text-foreground">
                                        <Info className="h-3.5 w-3.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    Curricular blueprint representation
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3.5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <div>
                                    <span className="block text-[11px] text-muted-foreground">
                                        Negative Marking
                                    </span>
                                    <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">
                                        {markingRules}
                                    </span>
                                </div>
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-muted-foreground hover:text-foreground">
                                        <Info className="h-3.5 w-3.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    Exact national pathway penalty deductions
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Anti-cheat Notice */}
                    <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        <div className="space-y-0.5">
                            <span className="font-semibold">
                                Proctoring & Exam Integrity Safeguards
                            </span>
                            <p className="leading-relaxed opacity-90">
                                Fullscreen mode is engaged upon start. Tab switches, window blur, and stem copy/paste actions are monitored in real time.
                            </p>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        onClick={handleLaunch}
                        className="h-11 w-full gap-2 rounded-xl bg-cyan-600 text-sm font-semibold text-white shadow-xs hover:bg-cyan-700 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
                    >
                        <GraduationCap className="h-4 w-4" />
                        <span>Enter Grand Mock Exam Hall</span>
                    </Button>
                </div>

                {/* Historical Mock Performances */}
                {history.length > 0 && (
                    <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-foreground">
                                Past Simulation Records
                            </h3>
                            <span className="font-mono text-xs text-muted-foreground">
                                {history.length} Completed
                            </span>
                        </div>

                        <div className="divide-y divide-border">
                            {history.map((mock) => (
                                <div
                                    key={mock.id}
                                    className="flex items-center justify-between py-3 text-xs"
                                >
                                    <div className="space-y-0.5">
                                        <span className="font-semibold text-foreground">
                                            {mock.title}
                                        </span>
                                        <span className="block text-[11px] text-muted-foreground">
                                            {new Date(mock.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                                                Score: {mock.score_obtained}
                                            </span>
                                            <span className="block font-mono text-[10px] text-muted-foreground">
                                                {mock.total_questions} Questions
                                            </span>
                                        </div>

                                        <Link href={`/mock-exam/${mock.id}/result`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 rounded-lg text-xs"
                                            >
                                                <span>Report</span>
                                                <ArrowUpRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}

