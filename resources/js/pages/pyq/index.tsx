import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    History,
    Sparkles,
    Calendar,
    Clock,
    PlaySquare,
    BookOpen,
    Flame,
    ArrowRight,
    CheckCircle2,
    Check,
    Layers,
    Filter,
    ShieldCheck,
    HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface YearItem {
    year: string;
    label: string;
    description: string;
    count: number;
    badge?: string | null;
    is_featured?: boolean;
}

interface SubjectItem {
    id: number;
    name: string;
    slug: string;
    questions_count: number;
}

interface PyqIndexProps {
    user: any;
    activePathway: string;
    totalPyqCount: number;
    years: YearItem[];
    subjects: SubjectItem[];
}

export default function PyqIndex({
    user,
    activePathway,
    totalPyqCount,
    years = [],
    subjects = [],
}: PyqIndexProps) {
    // Selected Year (defaults to '2026' or first available, or 'all')
    const [selectedYear, setSelectedYear] = useState<string>(
        years.length > 0 ? years[0].year : '2026'
    );

    // Test Mode: TUTOR vs TIMED
    const [mode, setMode] = useState<'TUTOR' | 'TIMED'>('TUTOR');

    // Question limit
    const [questionCount, setQuestionCount] = useState<number>(20);
    const countOptions = [10, 15, 25, 50];

    const currentYearData = years.find((y) => y.year === selectedYear);

    const handleLaunch = (targetYear?: string) => {
        const yearToUse = targetYear || selectedYear;
        const params = new URLSearchParams();
        params.append('filter', 'past_year');
        if (yearToUse !== 'all') {
            params.append('year', yearToUse);
        }
        params.append('mode', mode);
        params.append('limit', questionCount.toString());

        router.visit(`/qbank/runner?${params.toString()}`);
    };

    return (
        <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <Head title="Past Year Questions (PYQs) — Cortex Medical" />

            {/* Header */}
            <div className="flex flex-col justify-between gap-4 pb-2 sm:flex-row sm:items-center">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <History className="size-3.5" />
                        <span>Authentic Exam Recall Papers</span>
                    </div>
                    <h1 className="font-heading text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                        Past Year Questions (PYQ)
                    </h1>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
                        Select an exam year to begin your targeted board recall session with verified explanations.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-1.5 font-mono text-xs text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
                        Pathway:{' '}
                        <span className="ml-1 font-bold text-blue-700 dark:text-blue-400">
                            {activePathway}
                        </span>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                            {totalPyqCount}
                        </span>{' '}
                        Total PYQs
                    </div>
                </div>
            </div>

            {/* Step 1: Select Year */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                            1
                        </span>
                        <h2 className="text-sm font-black tracking-wider text-slate-900 uppercase dark:text-white">
                            Select Exam Year
                        </h2>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        Targeting latest recalls & repeat themes
                    </span>
                </div>

                {/* Grid of Year Cards */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {years.map((y) => {
                        const isSelected = selectedYear === y.year;
                        return (
                            <div
                                key={y.year}
                                onClick={() => setSelectedYear(y.year)}
                                className={`group relative cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                                    isSelected
                                        ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/40'
                                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-900'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold transition ${
                                                isSelected
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                            }`}
                                        >
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="text-base font-black text-slate-900 dark:text-white">
                                                    {y.year}
                                                </h3>
                                                {y.badge && (
                                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-extrabold text-blue-700 uppercase dark:bg-blue-900/60 dark:text-blue-300">
                                                        {y.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                {y.count > 0
                                                    ? `${y.count} Authentic MCQs`
                                                    : 'Recall Questions'}
                                            </p>
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                                            <Check className="h-3 w-3" />
                                        </div>
                                    )}
                                </div>

                                <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                    {y.description}
                                </p>

                                <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2.5 dark:border-slate-800">
                                    <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                                        Solve {y.year} PYQs
                                    </span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLaunch(y.year);
                                        }}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                    >
                                        <span>Start</span>
                                        <ArrowRight className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* All Years Option */}
                    <div
                        onClick={() => setSelectedYear('all')}
                        className={`group relative cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                            selectedYear === 'all'
                                ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/40'
                                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-900'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold transition ${
                                        selectedYear === 'all'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                                    }`}
                                >
                                    <Layers className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                                        All Years
                                    </h3>
                                    <p className="text-[11px] text-muted-foreground">
                                        {totalPyqCount} Combined PYQs
                                    </p>
                                </div>
                            </div>
                            {selectedYear === 'all' && (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                                    <Check className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                        <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                            Comprehensive pool across all examination years (2020–2026).
                        </p>
                        <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2.5 dark:border-slate-800">
                            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                                Solve All PYQs
                            </span>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleLaunch('all');
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                            >
                                <span>Start</span>
                                <ArrowRight className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 2: Practice Settings & Launch */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Mode Selector */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 pb-3">
                        <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                            2
                        </span>
                        <h3 className="text-xs font-black tracking-wider text-slate-900 uppercase dark:text-white">
                            Test Mode
                        </h3>
                    </div>

                    <div className="space-y-2">
                        <div
                            onClick={() => setMode('TUTOR')}
                            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                                mode === 'TUTOR'
                                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-200'
                                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60'
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <div>
                                    <div className="text-xs font-bold">Tutor Mode</div>
                                    <div className="text-[10px] text-muted-foreground">
                                        Immediate answers & rationales
                                    </div>
                                </div>
                            </div>
                            {mode === 'TUTOR' && <Check className="h-4 w-4 text-blue-600" />}
                        </div>

                        <div
                            onClick={() => setMode('TIMED')}
                            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                                mode === 'TIMED'
                                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-200'
                                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60'
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <div>
                                    <div className="text-xs font-bold">Timed Exam Block</div>
                                    <div className="text-[10px] text-muted-foreground">
                                        Board exam speed simulation
                                    </div>
                                </div>
                            </div>
                            {mode === 'TIMED' && <Check className="h-4 w-4 text-blue-600" />}
                        </div>
                    </div>
                </div>

                {/* Question Limit */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 pb-3">
                        <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                            3
                        </span>
                        <h3 className="text-xs font-black tracking-wider text-slate-900 uppercase dark:text-white">
                            Question Count
                        </h3>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {countOptions.map((cnt) => (
                            <button
                                key={cnt}
                                type="button"
                                onClick={() => setQuestionCount(cnt)}
                                className={`rounded-xl border py-2 text-xs font-bold transition ${
                                    questionCount === cnt
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300'
                                }`}
                            >
                                {cnt} Qs
                            </button>
                        ))}
                    </div>

                    <p className="mt-3 text-[11px] text-muted-foreground">
                        Selected year{' '}
                        <strong className="text-foreground">
                            {selectedYear === 'all' ? 'All Years' : selectedYear}
                        </strong>{' '}
                        has{' '}
                        <strong className="text-blue-600 dark:text-blue-400">
                            {currentYearData?.count ?? totalPyqCount}
                        </strong>{' '}
                        questions available.
                    </p>
                </div>

                {/* Launch Action Card */}
                <div className="flex flex-col justify-between rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shadow-md dark:border-blue-900 dark:from-blue-700 dark:to-blue-900">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                                Ready to Practice
                            </span>
                            <span className="text-xs font-bold opacity-90">
                                {mode === 'TIMED' ? 'Timed Block' : 'Tutor Session'}
                            </span>
                        </div>
                        <h4 className="mt-2 text-base font-black">
                            {selectedYear === 'all'
                                ? 'All Past Year Questions'
                                : `${selectedYear} Exam Recall Block`}
                        </h4>
                        <p className="mt-0.5 text-xs text-blue-100">
                            Launch {questionCount} board questions from{' '}
                            {selectedYear === 'all' ? '2020-2026' : selectedYear}
                        </p>
                    </div>

                    <Button
                        size="lg"
                        onClick={() => handleLaunch()}
                        className="mt-4 w-full gap-2 rounded-xl bg-white font-bold text-blue-800 shadow-sm hover:bg-blue-50"
                    >
                        <span>Start {selectedYear === 'all' ? 'PYQ' : selectedYear} Session</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Subject Breakdown */}
            {subjects.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between pb-3">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <h3 className="text-xs font-black tracking-wider text-slate-900 uppercase dark:text-white">
                                19 Medical Subjects in Past Year Papers
                            </h3>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            Balanced coverage across Pre, Para & Clinical disciplines
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {subjects.map((sub) => (
                            <Link
                                key={sub.id}
                                href={`/qbank/runner?filter=past_year&subject_id=${sub.id}${
                                    selectedYear !== 'all' ? `&year=${selectedYear}` : ''
                                }`}
                                className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-2.5 transition hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-blue-800"
                            >
                                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 dark:text-slate-200 dark:group-hover:text-blue-300 line-clamp-1">
                                    {sub.name}
                                </span>
                                <span className="mt-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                                    {sub.questions_count} PYQs
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
