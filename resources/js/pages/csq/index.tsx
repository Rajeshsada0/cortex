import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    Award,
    CheckCircle2,
    Clock,
    FileText,
    HelpCircle,
    PlaySquare,
    RotateCcw,
    ShieldCheck,
    Stethoscope,
    Trophy,
    XCircle,
    ArrowRight,
    AlertCircle,
    BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Attempt {
    id: number;
    pathway_code: string;
    total_stations: number;
    total_questions: number;
    total_score: number;
    percentage: number;
    is_passed: boolean;
    time_spent_seconds: number;
    created_at: string;
}

interface CsqIndexProps {
    user: any;
    activePathway: string;
    pathwayName: string;
    pathwayScenariosCount: number;
    totalActiveScenarios: number;
    attempts: Attempt[];
    stats: {
        total_attempts: number;
        passed_attempts: number;
        pass_rate: number;
        best_score: string | null;
        last_attempt_at: string | null;
    };
}

export default function CsqIndex({
    user,
    activePathway,
    pathwayName,
    pathwayScenariosCount,
    totalActiveScenarios,
    attempts,
    stats,
}: CsqIndexProps) {
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
    };

    return (
        <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <Head title="Clinical Scenario Question (CSQ) Mock Exam - Cortex Med" />

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-900/10 via-background to-blue-900/10 p-6 sm:p-8">
                <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div className="max-w-2xl space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                                <Stethoscope className="h-3.5 w-3.5" />
                                NMC Special Exam Mode
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                                Active Track: {pathwayName}
                            </span>
                        </div>

                        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                            Clinical Scenario Question (CSQ) Mock Examination
                        </h1>

                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Computerized clinical case examination modeled on the official Nepal Medical Council (NMC)
                            licensing format. Analyze patient vignettes, interpret real-time diagnostic markers and vitals,
                            and answer 5 linked sequential MCQs per station with immediate evidence-based rationales.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
                        <Link href="/csq/runner">
                            <Button
                                size="lg"
                                className="h-12 w-full gap-2 rounded-2xl bg-cyan-600 px-6 text-sm font-bold text-white shadow-md transition hover:bg-cyan-700 sm:w-auto dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
                            >
                                <PlaySquare className="h-4 w-4" />
                                <span>Start CSQ Examination</span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Examination Metrics & Quick Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-border bg-card p-4 transition shadow-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Exam Format</span>
                        <FileText className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="mt-2 font-mono text-2xl font-bold text-foreground">
                        {pathwayScenariosCount} Stations
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        {pathwayScenariosCount * 5} Linked Questions
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 transition shadow-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Time Limit</span>
                        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="mt-2 font-mono text-2xl font-bold text-foreground">
                        30 Mins
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        Computerized countdown timer
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 transition shadow-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">NMC Benchmark</span>
                        <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="mt-2 font-mono text-2xl font-bold text-foreground">
                        50% Pass
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        Minimum 10 / 20 correct
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 transition shadow-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Your Best Score</span>
                        <Trophy className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="mt-2 font-mono text-2xl font-bold text-foreground">
                        {stats.best_score || '—'}
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        {stats.total_attempts > 0 ? `${stats.pass_rate}% pass rate` : 'No attempts yet'}
                    </p>
                </div>
            </div>

            {/* Examination Structure & Rules */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                    <ShieldCheck className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    Nepal Medical Council CSQ Examination Protocol
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <div className="flex items-center gap-2 font-semibold text-foreground text-xs sm:text-sm">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                                1
                            </span>
                            Sequential Station Locking
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                            Each station features a real-world clinical vignette with 5 linked questions. You must select
                            an answer for all 5 questions before submitting to unlock explanations.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <div className="flex items-center gap-2 font-semibold text-foreground text-xs sm:text-sm">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                                2
                            </span>
                            High-Yield Diagnostic Vitals
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                            Interpret complete vital sign profiles, hematology, electrolytes, and physical exam signs
                            directly integrated into the clinical scenario sidebar.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <div className="flex items-center gap-2 font-semibold text-foreground text-xs sm:text-sm">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                                3
                            </span>
                            Evidence-Based Rationales
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                            Receive immediate station scores and thorough clinical explanations after submitting each station,
                            followed by a comprehensive NMC proficiency scorecard.
                        </p>
                    </div>
                </div>
            </div>

            {/* Past Examination Attempts */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <h2 className="text-base font-bold text-foreground">Recent CSQ Mock Exam Sessions</h2>
                        <p className="text-xs text-muted-foreground">
                            Record of your past computerized mock examinations and performance outcomes
                        </p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                        {attempts.length} Recorded
                    </span>
                </div>

                {attempts.length > 0 ? (
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Stations</th>
                                    <th className="px-4 py-3">Score</th>
                                    <th className="px-4 py-3">Percentage</th>
                                    <th className="px-4 py-3">Time Spent</th>
                                    <th className="px-4 py-3">Outcome</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {attempts.map((att) => (
                                    <tr key={att.id} className="hover:bg-muted/20">
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            {new Date(att.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {att.total_stations} Stations ({att.total_questions} MCQs)
                                        </td>
                                        <td className="px-4 py-3 font-mono font-bold text-foreground">
                                            {att.total_score} / {att.total_questions}
                                        </td>
                                        <td className="px-4 py-3 font-mono font-semibold text-foreground">
                                            {att.percentage}%
                                        </td>
                                        <td className="px-4 py-3 font-mono text-muted-foreground">
                                            {formatDuration(att.time_spent_seconds)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                                                    att.is_passed
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                }`}
                                            >
                                                {att.is_passed ? (
                                                    <>
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        PASSED
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-3 w-3" />
                                                        FAILED
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <BarChart3 className="h-10 w-10 text-muted-foreground/60" />
                        <h3 className="mt-3 text-sm font-bold text-foreground">No CSQ Sessions Recorded Yet</h3>
                        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                            Take your first Computerized Mock Examination to benchmark your clinical reasoning skills
                            against NMC licensing standards.
                        </p>
                        <Link href="/csq/runner" className="mt-4">
                            <Button size="sm" className="gap-1.5 rounded-xl bg-cyan-600 text-xs font-semibold text-white hover:bg-cyan-700">
                                <PlaySquare className="h-3.5 w-3.5" />
                                Launch CSQ Mock Exam
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
