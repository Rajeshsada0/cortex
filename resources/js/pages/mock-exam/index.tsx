import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    GraduationCap,
    Clock,
    AlertTriangle,
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PathwaySelector } from '@/components/cortex/pathway-selector';

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
        badgeColor: 'bg-[#55BDEB]/15 text-[#55BDEB] border-[#55BDEB]/30',
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
        badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
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
        badgeColor: 'bg-[#2FB36F]/15 text-[#2FB36F] border-[#2FB36F]/30',
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
        badgeColor: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
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
        <div className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <Head title="Grand Mock Exam Hall — Cortex Medical" />

            {/* Header */}
            <div className="border-border flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="rounded bg-[#55BDEB]/15 px-2.5 py-0.5 text-xs font-bold text-[#55BDEB]">
                            Official Simulation Mode
                        </span>
                        <span className="text-muted-foreground text-xs">
                            {pathwayName}
                        </span>
                    </div>
                    <h1 className="text-foreground mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                        Standardized Grand Mock Exam Hall
                    </h1>
                    <p className="text-muted-foreground max-w-2xl text-xs">
                        Simulate authentic high-stakes postgraduate examinations
                        with distraction-free fullscreen, precise timer
                        enforcement, and official negative marking.
                    </p>
                </div>
                <PathwaySelector currentPathway={activePathway} />
            </div>

            {/* Exam Format Presets Selector */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-foreground text-sm font-bold tracking-wider uppercase">
                            1. Select Examination Format & Blueprint Scale
                        </h3>
                        <p className="text-muted-foreground text-xs">
                            Choose between a full national marathon or targeted
                            timed blocks.
                        </p>
                    </div>
                    <span className="bg-muted text-muted-foreground rounded px-2.5 py-0.5 text-xs font-semibold">
                        Selected: {selectedPreset.title} (
                        {selectedPreset.questions} Qs)
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {EXAM_PRESETS.map((preset) => {
                        const isSelected = selectedPreset.id === preset.id;
                        return (
                            <div
                                key={preset.id}
                                onClick={() => setSelectedPreset(preset)}
                                className={`flex cursor-pointer flex-col justify-between gap-3 rounded-2xl border p-5 transition-all ${
                                    isSelected
                                        ? 'scale-[1.02] border-[#55BDEB] bg-[#55BDEB]/10 shadow-md ring-2 ring-[#55BDEB]/30'
                                        : 'border-border bg-card hover:border-border/80 hover:bg-muted/30'
                                }`}
                            >
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${preset.badgeColor}`}
                                        >
                                            {preset.badge}
                                        </span>
                                        {isSelected && (
                                            <CheckCircle2 className="size-4 text-[#55BDEB]" />
                                        )}
                                    </div>
                                    <h4 className="text-foreground mt-1 text-base font-extrabold">
                                        {preset.title}
                                    </h4>
                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                        {preset.description}
                                    </p>
                                </div>

                                <div className="border-border/60 flex items-center justify-between border-t pt-3 text-xs">
                                    <span className="text-foreground font-bold">
                                        {preset.questions} Items
                                    </span>
                                    <span className="text-muted-foreground">
                                        {preset.duration} Mins
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Exam Simulation Card */}
            <div className="from-card via-card flex flex-col gap-6 rounded-2xl border-2 border-[#55BDEB]/40 bg-gradient-to-br to-[#55BDEB]/5 p-6 shadow-md sm:p-8">
                <div className="flex items-start justify-between">
                    <div>
                        <span className="text-xs font-bold tracking-wider text-[#55BDEB] uppercase">
                            2. Real-Time Exam Specifications
                        </span>
                        <h2 className="text-foreground mt-0.5 text-xl font-bold sm:text-2xl">
                            {pathwayName} {selectedPreset.title}
                        </h2>
                    </div>
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[#102A43] text-[#55BDEB]">
                        <Trophy className="size-6" />
                    </div>
                </div>

                <div className="border-border grid grid-cols-1 gap-4 border-y py-4 sm:grid-cols-3">
                    <div className="flex items-center gap-3">
                        <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-lg">
                            <Clock className="size-4" />
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-xs">
                                Session Duration
                            </span>
                            <span className="text-foreground text-sm font-bold">
                                {selectedPreset.duration} Minutes (Strict
                                Auto-Submit)
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-lg">
                            <GraduationCap className="size-4" />
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-xs">
                                Question Count
                            </span>
                            <span className="text-foreground text-sm font-bold">
                                {selectedPreset.questions} Questions (Curriculum
                                Blueprint)
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-lg">
                            <ShieldCheck className="size-4 text-[#2FB36F]" />
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-xs">
                                Negative Marking
                            </span>
                            <span className="text-sm font-bold text-[#E05252]">
                                {markingRules}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Anti-cheat Proctoring Notice */}
                <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold tracking-wider uppercase">
                            Proctoring & Exam Integrity Safeguards
                        </span>
                        <p className="leading-relaxed">
                            During active grand mock mode, distraction-free
                            full-screen is engaged. Tab-switching, window blur,
                            copy/paste, and stem text selection are monitored
                            and flagged in real-time.
                        </p>
                    </div>
                </div>

                <Button
                    size="lg"
                    onClick={handleLaunch}
                    className="h-12 w-full gap-2 bg-[#102A43] text-sm font-extrabold text-white shadow-md hover:opacity-90 dark:bg-[#55BDEB] dark:text-neutral-950"
                >
                    <GraduationCap className="size-5" />
                    Enter Grand Mock Exam Hall (Timed Simulation)
                </Button>
            </div>

            {/* Historical Mock Performances */}
            {history.length > 0 && (
                <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6 shadow-sm">
                    <h3 className="text-foreground text-sm font-bold tracking-wider uppercase">
                        Historical Grand Mock Records
                    </h3>
                    <div className="divide-border flex flex-col divide-y">
                        {history.map((mock) => (
                            <div
                                key={mock.id}
                                className="flex items-center justify-between py-3 text-xs"
                            >
                                <div>
                                    <span className="text-foreground block font-bold">
                                        {mock.title}
                                    </span>
                                    <span className="text-muted-foreground">
                                        Completed:{' '}
                                        {new Date(
                                            mock.created_at,
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-[#55BDEB]">
                                            Score: {mock.score_obtained}
                                        </span>
                                        <span className="text-muted-foreground block text-[10px]">
                                            {mock.total_questions} Questions
                                        </span>
                                    </div>
                                    <Link href={`/mock-exam/${mock.id}/result`}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs"
                                        >
                                            Score Report →
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
