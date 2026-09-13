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

            <div className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="border-border flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-1 inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                            <Award className="size-4" />
                            <span>
                                Postgraduate Testing Standards &amp; Examination
                                Blueprints
                            </span>
                        </div>
                        <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                            Exam Pathway Blueprints
                        </h1>
                        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                            Official negative marking coefficients, timing
                            synchronizations, and question quota calibrations.
                        </p>
                    </div>

                    <Link href="/admin/questions/create">
                        <Button className="gap-1.5 bg-[#0066FF] text-xs font-bold text-white shadow-md hover:bg-[#0052cc]">
                            Author Questions for Blueprint
                        </Button>
                    </Link>
                </div>

                {/* Pathways Grid */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(pathways).map(([key, p]) => {
                        const coveragePct = Math.min(
                            100,
                            Math.round(
                                (p.availableQuestions / p.totalQuestions) * 100,
                            ),
                        );
                        return (
                            <div
                                key={key}
                                className="border-border bg-card flex flex-col justify-between rounded-2xl border p-5 shadow-xs"
                            >
                                <div>
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <Badge
                                            variant="outline"
                                            className="border-sky-400 font-mono text-[10px] font-bold text-sky-700 dark:text-sky-300"
                                        >
                                            {key.replace('_', '-')}
                                        </Badge>
                                        <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-bold">
                                            <Clock className="size-3" />
                                            <span>
                                                {p.durationMinutes} mins
                                            </span>
                                        </span>
                                    </div>

                                    <h2 className="text-foreground text-base font-black">
                                        {p.name}
                                    </h2>
                                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                                        {p.fullName}
                                    </p>

                                    {/* Scoring Algorithm Box */}
                                    <div className="border-border bg-muted/20 mt-4 space-y-1 rounded-xl border p-3 text-xs">
                                        <div className="text-muted-foreground flex items-center justify-between">
                                            <span>Marking Scheme:</span>
                                            <span className="text-foreground font-bold">
                                                {p.scoringType}
                                            </span>
                                        </div>
                                        <div className="text-muted-foreground flex items-center justify-between">
                                            <span>Correct Answer:</span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                +{p.correctMarks}
                                            </span>
                                        </div>
                                        {p.negativeMarks > 0 && (
                                            <div className="text-muted-foreground flex items-center justify-between">
                                                <span>Penalty per Error:</span>
                                                <span className="text-destructive font-bold">
                                                    -{p.negativeMarks}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quota Progress */}
                                    <div className="mt-4 space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                            <span className="text-muted-foreground">
                                                Q-Bank Readiness
                                            </span>
                                            <span className="text-foreground font-bold">
                                                {p.availableQuestions} /{' '}
                                                {p.totalQuestions} Qs (
                                                {coveragePct}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
                                            <div
                                                style={{
                                                    width: `${coveragePct}%`,
                                                }}
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

                                <div className="border-border mt-5 flex items-center justify-between border-t pt-3">
                                    <Link
                                        href={`/admin/questions?exam=${key}`}
                                        className="flex items-center gap-1 text-xs font-bold text-[#0066FF] hover:underline"
                                    >
                                        <span>
                                            View {p.availableQuestions}{' '}
                                            Questions
                                        </span>
                                        <ArrowRight className="size-3" />
                                    </Link>
                                    <Badge
                                        variant="secondary"
                                        className="font-mono text-[10px]"
                                    >
                                        Quota: {p.totalQuestions}
                                    </Badge>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Subject Distribution Matrix */}
                <div className="border-border bg-card rounded-2xl border p-5 shadow-xs sm:p-6">
                    <div className="border-border/60 mb-4 flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                            <BookOpen className="size-4 text-indigo-500" />
                            <h2 className="text-foreground text-sm font-bold">
                                19-Subject Clinical Density Matrix
                            </h2>
                        </div>
                        <span className="text-muted-foreground text-xs font-medium">
                            Total:{' '}
                            <strong className="text-foreground">
                                {total_bank_questions}
                            </strong>{' '}
                            questions in bank
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {subjects.map((s) => (
                            <Link
                                key={s.id}
                                href={`/admin/questions?subject_id=${s.id}`}
                                className="border-border hover:bg-muted/20 flex items-center justify-between rounded-xl border p-3 text-xs transition-all hover:border-[#0066FF]"
                            >
                                <span className="text-foreground truncate pr-2 font-semibold">
                                    {s.name}
                                </span>
                                <Badge
                                    variant="secondary"
                                    className="shrink-0 font-mono text-[10px] font-bold"
                                >
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
