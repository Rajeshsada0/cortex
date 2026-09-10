import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Award,
    Clock,
    HelpCircle,
    CheckCircle2,
    SlidersHorizontal,
    ArrowRight,
    Scale,
    Activity,
    BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PathwayInfo {
    name: string;
    fullName: string;
    totalQuestions: number;
    durationMinutes: number;
    correctMarks: number;
    negativeMarks: number;
    scoringType: string;
    availableQuestions: number;
}

interface SubjectItem {
    id: number;
    name: string;
    slug: string;
    questions_count: number;
}

interface PathwaysIndexProps {
    pathways: Record<string, PathwayInfo>;
    subjects: SubjectItem[];
    total_bank_questions: number;
}

export default function PathwaysIndex({
    pathways,
    subjects,
    total_bank_questions,
}: PathwaysIndexProps) {
    return (
        <>
            <Head title="Exam Pathways & Blueprints — Cortex Admin" />

            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                            <Award className="size-4" />
                            <span>Postgraduate Testing Standards &amp; Examination Blueprints</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                            Exam Pathway Blueprints
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Official negative marking coefficients, timing synchronizations, and question quota calibrations.
                        </p>
                    </div>

                    <Link href="/admin/questions/create">
                        <Button className="bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs gap-1.5 shadow-md">
                            Author Questions for Blueprint
                        </Button>
                    </Link>
                </div>

                {/* Pathways Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Object.entries(pathways).map(([key, p]) => {
                        const coveragePct = Math.min(100, Math.round((p.availableQuestions / p.totalQuestions) * 100));
                        return (
                            <div
                                key={key}
                                className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <Badge
                                            variant="outline"
                                            className="font-mono text-[10px] font-bold border-sky-400 text-sky-700 dark:text-sky-300"
                                        >
                                            {key.replace('_', '-')}
                                        </Badge>
                                        <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                                            <Clock className="size-3" />
                                            <span>{p.durationMinutes} mins</span>
                                        </span>
                                    </div>

                                    <h2 className="text-base font-black text-foreground">{p.name}</h2>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        {p.fullName}
                                    </p>

                                    {/* Scoring Algorithm Box */}
                                    <div className="rounded-xl border border-border bg-muted/20 p-3 mt-4 space-y-1 text-xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span>Marking Scheme:</span>
                                            <span className="font-bold text-foreground">{p.scoringType}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span>Correct Answer:</span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">+{p.correctMarks}</span>
                                        </div>
                                        {p.negativeMarks > 0 && (
                                            <div className="flex items-center justify-between text-muted-foreground">
                                                <span>Penalty per Error:</span>
                                                <span className="font-bold text-destructive">-{p.negativeMarks}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quota Progress */}
                                    <div className="mt-4 space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                            <span className="text-muted-foreground">Q-Bank Readiness</span>
                                            <span className="text-foreground font-bold">
                                                {p.availableQuestions} / {p.totalQuestions} Qs ({coveragePct}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
                                            <div
                                                style={{ width: `${coveragePct}%` }}
                                                className={`h-full transition-all ${
                                                    coveragePct >= 100
                                                        ? 'bg-emerald-500'
                                                        : coveragePct >= 50
                                                        ? 'bg-blue-500'
                                                        : 'bg-amber-500'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                                    <Link
                                        href={`/admin/questions?exam=${key}`}
                                        className="text-xs font-bold text-[#0066FF] hover:underline flex items-center gap-1"
                                    >
                                        <span>View {p.availableQuestions} Questions</span>
                                        <ArrowRight className="size-3" />
                                    </Link>
                                    <Badge variant="secondary" className="text-[10px] font-mono">
                                        Quota: {p.totalQuestions}
                                    </Badge>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Subject Distribution Matrix */}
                <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
                        <div className="flex items-center gap-2">
                            <BookOpen className="size-4 text-indigo-500" />
                            <h2 className="text-sm font-bold text-foreground">19-Subject Clinical Density Matrix</h2>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                            Total: <strong className="text-foreground">{total_bank_questions}</strong> questions in bank
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {subjects.map((s) => (
                            <Link
                                key={s.id}
                                href={`/admin/questions?subject_id=${s.id}`}
                                className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-[#0066FF] hover:bg-muted/20 transition-all text-xs"
                            >
                                <span className="font-semibold text-foreground truncate pr-2">{s.name}</span>
                                <Badge variant="secondary" className="font-mono text-[10px] shrink-0 font-bold">
                                    {s.questions_count} Qs
                                </Badge>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
