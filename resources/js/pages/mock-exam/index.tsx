import React from 'react';
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

export default function MockExamIndex({
    user,
    activePathway,
    pathwayName,
    targetQuestions,
    durationMinutes,
    markingRules,
    history = [],
}: MockIndexProps) {
    const handleLaunch = () => {
        router.post('/mock-exam/launch', { pathway: activePathway });
    };

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full">
            <Head title="Grand Mock Exam Hall — Cortex Medical" />

            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="rounded bg-[#55BDEB]/15 px-2.5 py-0.5 text-xs font-bold text-[#55BDEB]">
                            Official Simulation Mode
                        </span>
                        <span className="text-xs text-muted-foreground">{pathwayName}</span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl mt-1">
                        Standardized Grand Mock Exam Hall
                    </h1>
                    <p className="text-xs text-muted-foreground max-w-2xl">
                        Simulate authentic high-stakes postgraduate examinations with distraction-free fullscreen, precise timer enforcement, and official negative marking.
                    </p>
                </div>
                <PathwaySelector currentPathway={activePathway} />
            </div>

            {/* Exam Simulation Card */}
            <div className="flex flex-col gap-6 rounded-2xl border-2 border-[#55BDEB]/40 bg-gradient-to-br from-card via-card to-[#55BDEB]/5 p-6 sm:p-8 shadow-md">
                <div className="flex items-start justify-between">
                    <div>
                        <span className="text-xs font-bold text-[#55BDEB] uppercase tracking-wider">
                            Real-Time Exam Specifications
                        </span>
                        <h2 className="text-xl font-bold text-foreground sm:text-2xl mt-0.5">
                            {pathwayName} Grand Mock
                        </h2>
                    </div>
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[#102A43] text-[#55BDEB]">
                        <Trophy className="size-6" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 border-y border-border py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <Clock className="size-4" />
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground block">Session Duration</span>
                            <span className="text-sm font-bold text-foreground">
                                {durationMinutes} Minutes (Strict Auto-Submit)
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <GraduationCap className="size-4" />
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground block">Question Count</span>
                            <span className="text-sm font-bold text-foreground">
                                {targetQuestions} Questions (Integrated)
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <ShieldCheck className="size-4 text-[#2FB36F]" />
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground block">Negative Marking</span>
                            <span className="text-sm font-bold text-[#E05252]">
                                {markingRules}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Anti-cheat Proctoring Notice */}
                <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="size-5 shrink-0 text-amber-500 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold uppercase tracking-wider">
                            Proctoring & Exam Integrity Safeguards
                        </span>
                        <p className="leading-relaxed">
                            During active grand mock mode, distraction-free full-screen is engaged. Tab-switching, window blur, copy/paste, and stem text selection are monitored and flagged in real-time.
                        </p>
                    </div>
                </div>

                <Button
                    size="lg"
                    onClick={handleLaunch}
                    className="h-12 w-full bg-[#102A43] dark:bg-[#55BDEB] text-white dark:text-neutral-950 font-extrabold hover:opacity-90 shadow-md text-sm gap-2"
                >
                    <GraduationCap className="size-5" />
                    Enter Grand Mock Exam Hall (Timed Simulation)
                </Button>
            </div>

            {/* Historical Mock Performances */}
            {history.length > 0 && (
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                        Historical Grand Mock Records
                    </h3>
                    <div className="flex flex-col divide-y divide-border">
                        {history.map((mock) => (
                            <div key={mock.id} className="flex items-center justify-between py-3 text-xs">
                                <div>
                                    <span className="font-bold text-foreground block">{mock.title}</span>
                                    <span className="text-muted-foreground">
                                        Completed: {new Date(mock.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-[#55BDEB]">
                                            Score: {mock.score_obtained}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground block">
                                            {mock.total_questions} Questions
                                        </span>
                                    </div>
                                    <Link href={`/mock-exam/${mock.id}/result`}>
                                        <Button variant="outline" size="sm" className="h-7 text-xs">
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
