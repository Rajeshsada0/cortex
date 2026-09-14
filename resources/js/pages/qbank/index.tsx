import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    SlidersHorizontal,
    PlaySquare,
    Check,
    Filter,
    Layers,
    BookOpen,
    Sparkles,
    Clock,
    HelpCircle,
    RotateCcw,
    Bookmark,
    CheckCircle2,
    Flame,
    Zap,
    ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TopicData {
    id: number;
    name: string;
    slug: string;
    high_yield_priority: number;
}

interface SubjectData {
    id: number;
    name: string;
    slug: string;
    icon_key: string;
    order_index: number;
    questions_count?: number;
    topics: TopicData[];
}

interface QBankCounts {
    total: number;
    unused: number;
    incorrect: number;
    bookmarked: number;
    hazardous?: number;
    unstable?: number;
}

interface QBankIndexProps {
    user: any;
    subjects: SubjectData[];
    activePathway: string;
    counts?: QBankCounts;
    totalQuestions: number;
}

export default function QBankIndex({
    user,
    subjects,
    activePathway,
    counts = {
        total: 0,
        unused: 0,
        incorrect: 0,
        bookmarked: 0,
        hazardous: 0,
        unstable: 0,
    },
    totalQuestions,
}: QBankIndexProps) {
    // Mode: TUTOR vs TIMED
    const [mode, setMode] = useState<'TUTOR' | 'TIMED'>('TUTOR');

    // Status: ALL, UNUSED, INCORRECT, BOOKMARKED
    const [statusMode, setStatusMode] = useState<string>('ALL');

    // Multi-subject selection (empty = all)
    const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);

    // Difficulty
    const [difficulty, setDifficulty] = useState<string>('ALL');

    // Question Count
    const [questionCount, setQuestionCount] = useState<number>(10);

    const toggleSubject = (id: number) => {
        setSelectedSubjectIds((prev) =>
            prev.includes(id)
                ? prev.filter((sId) => sId !== id)
                : [...prev, id],
        );
    };

    const selectAllSubjects = () => {
        setSelectedSubjectIds(subjects.map((s) => s.id));
    };

    const clearAllSubjects = () => {
        setSelectedSubjectIds([]);
    };

    const handleLaunch = () => {
        const params = new URLSearchParams();
        params.append('mode', mode);
        params.append('status', statusMode);
        params.append('limit', questionCount.toString());

        if (difficulty !== 'ALL') {
            params.append('difficulty', difficulty);
        }

        if (selectedSubjectIds.length > 0) {
            params.append('subject_ids', selectedSubjectIds.join(','));
        }

        router.visit(`/qbank/runner?${params.toString()}`);
    };

    // Calculate approximate questions available based on selection
    const selectedSubjectsCount =
        selectedSubjectIds.length > 0
            ? selectedSubjectIds.length
            : subjects.length;

    return (
        <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <Head title="Custom Test Builder — Cortex Q-Bank" />

            {/* Header */}
            <div className="border-cortex-border flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                        <Sparkles className="size-3.5" />
                        <span>Adaptive Clinical Test Generator</span>
                    </div>
                    <h1 className="font-heading text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                        Custom Q-Bank Test Builder
                    </h1>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
                        Tailor high-yield clinical practice blocks by exam
                        simulation mode, prior attempts, and 19-subject
                        disciplines.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                        Pathway:{' '}
                        <span className="ml-1 font-bold text-cyan-600 dark:text-cyan-400">
                            {activePathway}
                        </span>
                    </div>
                </div>
            </div>

            {/* Step 1: Test Mode Selection */}
            <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-cyan-500 text-xs font-black text-slate-950">
                        1
                    </span>
                    <h2 className="text-sm font-black tracking-wider text-slate-900 uppercase dark:text-white">
                        Choose Test Mode
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Tutor Mode */}
                    <div
                        onClick={() => setMode('TUTOR')}
                        className={`card-glow flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-5 transition-all ${
                            mode === 'TUTOR'
                                ? 'border-cyan-500 bg-sky-50/70 shadow-lg ring-1 shadow-cyan-500/10 ring-cyan-500/30 dark:border-cyan-400 dark:bg-[#0e2238] dark:shadow-cyan-950/40 dark:ring-cyan-400/50'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-cortex-border dark:bg-cortex-card dark:hover:border-slate-600 dark:hover:bg-cortex-hover'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-600 shadow-xs dark:bg-cyan-500/20 dark:text-cyan-400">
                                    <Sparkles className="size-5.5" />
                                </div>
                                <div>
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                                        <span>Tutor Mode</span>
                                        <span className="rounded-full bg-cyan-500 px-2.5 py-0.5 text-[10px] font-black text-slate-950">
                                            Recommended
                                        </span>
                                    </h3>
                                    <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                                        Immediate feedback and multi-tiered
                                        rationale after each question.
                                    </p>
                                </div>
                            </div>
                            {mode === 'TUTOR' && (
                                <CheckCircle2 className="size-5.5 text-cyan-600 dark:text-cyan-400" />
                            )}
                        </div>
                        <div className="mt-4 flex items-center gap-4 border-t border-slate-200 pt-3 text-xs font-medium text-cyan-700 dark:border-slate-800/80 dark:text-cyan-300">
                            <span className="flex items-center gap-1.5">
                                ✓ Instant Foundation Explanations
                            </span>
                            <span className="flex items-center gap-1.5">
                                ✓ SM-2 Confidence Rating
                            </span>
                        </div>
                    </div>

                    {/* Timed Exam Mode */}
                    <div
                        onClick={() => setMode('TIMED')}
                        className={`card-glow flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-5 transition-all ${
                            mode === 'TIMED'
                                ? 'border-amber-500 bg-amber-50/70 shadow-lg ring-1 shadow-amber-500/10 ring-amber-500/30 dark:border-amber-400 dark:bg-[#1c180e] dark:shadow-amber-950/40 dark:ring-amber-400/50'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-cortex-border dark:bg-cortex-card dark:hover:border-slate-600 dark:hover:bg-cortex-hover'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 shadow-xs dark:bg-amber-500/20 dark:text-amber-400">
                                    <Clock className="size-5.5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Timed Simulation Mode
                                    </h3>
                                    <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                                        Strict countdown timer, answers hidden
                                        until test submission.
                                    </p>
                                </div>
                            </div>
                            {mode === 'TIMED' && (
                                <CheckCircle2 className="size-5.5 text-amber-600 dark:text-amber-400" />
                            )}
                        </div>
                        <div className="mt-4 flex items-center gap-4 border-t border-slate-200 pt-3 text-xs font-medium text-amber-700 dark:border-slate-800/80 dark:text-amber-300">
                            <span className="flex items-center gap-1.5">
                                ✓ Realistic Exam Speed (60s/Q)
                            </span>
                            <span className="flex items-center gap-1.5">
                                ✓ End-of-block Scorecard
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 2: Question Pool Status Filter */}
            <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-cyan-500 text-xs font-black text-slate-950">
                        2
                    </span>
                    <h2 className="text-sm font-black tracking-wider text-slate-900 uppercase dark:text-white">
                        Question Status Filter
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {/* All */}
                    <div
                        onClick={() => setStatusMode('ALL')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            statusMode === 'ALL'
                                ? 'border-2 border-cyan-500 bg-cyan-50 shadow-md dark:border-cyan-400 dark:bg-[#0e2238]'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-cortex-border dark:bg-cortex-card dark:hover:border-slate-600 dark:hover:bg-cortex-hover'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                All Questions
                            </span>
                            <span
                                className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                                    statusMode === 'ALL'
                                        ? 'bg-cyan-500 text-slate-950'
                                        : 'border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                            >
                                {counts.total}
                            </span>
                        </div>
                        <p
                            className={`mt-1.5 text-[11px] ${
                                statusMode === 'ALL'
                                    ? 'font-medium text-cyan-700 dark:text-cyan-200'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            Entire question bank
                        </p>
                    </div>

                    {/* Unused */}
                    <div
                        onClick={() => setStatusMode('UNUSED')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            statusMode === 'UNUSED'
                                ? 'border-2 border-emerald-500 bg-emerald-50 shadow-md dark:border-emerald-400 dark:bg-emerald-950/40'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-cortex-border dark:bg-cortex-card dark:hover:border-slate-600 dark:hover:bg-cortex-hover'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                Unattempted
                            </span>
                            <span
                                className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                                    statusMode === 'UNUSED'
                                        ? 'bg-emerald-500 text-slate-950'
                                        : 'border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                            >
                                {counts.unused}
                            </span>
                        </div>
                        <p
                            className={`mt-1.5 text-[11px] ${
                                statusMode === 'UNUSED'
                                    ? 'font-medium text-emerald-700 dark:text-emerald-200'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            Never attempted yet
                        </p>
                    </div>

                    {/* Incorrect */}
                    <div
                        onClick={() => setStatusMode('INCORRECT')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            statusMode === 'INCORRECT'
                                ? 'border-2 border-rose-500 bg-rose-50 shadow-md dark:border-rose-400 dark:bg-rose-950/40'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-cortex-border dark:bg-cortex-card dark:hover:border-slate-600 dark:hover:bg-cortex-hover'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                Missed / Wrong
                            </span>
                            <span
                                className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                                    statusMode === 'INCORRECT'
                                        ? 'bg-rose-500 text-white'
                                        : 'border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                            >
                                {counts.incorrect}
                            </span>
                        </div>
                        <p
                            className={`mt-1.5 text-[11px] ${
                                statusMode === 'INCORRECT'
                                    ? 'font-medium text-rose-700 dark:text-rose-200'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            General remediation
                        </p>
                    </div>

                    {/* Hazardous Blind Spots */}
                    <div
                        onClick={() => setStatusMode('HAZARDOUS')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            statusMode === 'HAZARDOUS'
                                ? 'border-2 border-rose-500 bg-rose-50 shadow-md ring-1 ring-rose-500/40 dark:bg-rose-950/60'
                                : 'border border-rose-200 bg-white hover:border-rose-300 hover:bg-rose-50/50 dark:border-rose-900/50 dark:bg-cortex-card dark:hover:border-rose-700/60 dark:hover:bg-rose-950/20'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                Hazardous Blind Spots
                            </span>
                            <span className="rounded bg-rose-600 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                                {counts.hazardous ?? 0}
                            </span>
                        </div>
                        <p
                            className={`mt-1.5 text-[11px] ${
                                statusMode === 'HAZARDOUS'
                                    ? 'font-medium text-rose-700 dark:text-rose-200'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            High-confidence misses
                        </p>
                    </div>

                    {/* Lucky Guesses / Unstable */}
                    <div
                        onClick={() => setStatusMode('UNSTABLE')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            statusMode === 'UNSTABLE'
                                ? 'border-2 border-amber-500 bg-amber-50 shadow-md ring-1 ring-amber-500/40 dark:bg-amber-950/60'
                                : 'border border-amber-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 dark:border-amber-900/50 dark:bg-cortex-card dark:hover:border-amber-700/60 dark:hover:bg-amber-950/20'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                Lucky Guesses
                            </span>
                            <span className="rounded bg-amber-500 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-950">
                                {counts.unstable ?? 0}
                            </span>
                        </div>
                        <p
                            className={`mt-1.5 text-[11px] ${
                                statusMode === 'UNSTABLE'
                                    ? 'font-medium text-amber-700 dark:text-amber-200'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            Low-confidence hits
                        </p>
                    </div>

                    {/* Bookmarked */}
                    <div
                        onClick={() => setStatusMode('BOOKMARKED')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            statusMode === 'BOOKMARKED'
                                ? 'border-2 border-indigo-500 bg-indigo-50 shadow-md dark:border-indigo-400 dark:bg-indigo-950/40'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-cortex-border dark:bg-cortex-card dark:hover:border-slate-600 dark:hover:bg-cortex-hover'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                Bookmarked
                            </span>
                            <span
                                className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                                    statusMode === 'BOOKMARKED'
                                        ? 'bg-indigo-500 text-white'
                                        : 'border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                            >
                                {counts.bookmarked}
                            </span>
                        </div>
                        <p
                            className={`mt-1.5 text-[11px] ${
                                statusMode === 'BOOKMARKED'
                                    ? 'font-medium text-indigo-700 dark:text-indigo-200'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            Saved to personal binder
                        </p>
                    </div>
                </div>
            </div>

            {/* Step 3: Medical Subjects Multi-Select */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="flex size-6 items-center justify-center rounded-full bg-cyan-500 text-xs font-black text-slate-950">
                            3
                        </span>
                        <h2 className="text-sm font-black tracking-wider text-slate-900 uppercase dark:text-white">
                            Medical Curriculum Disciplines
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <button
                            type="button"
                            onClick={selectAllSubjects}
                            className="cursor-pointer font-bold text-cyan-600 transition hover:text-cyan-500 hover:underline dark:text-cyan-400 dark:hover:text-cyan-300"
                        >
                            Select All
                        </button>
                        <span className="text-slate-400 dark:text-slate-600">•</span>
                        <button
                            type="button"
                            onClick={clearAllSubjects}
                            className="cursor-pointer text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        >
                            Clear (All Integrated)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {subjects.map((sub) => {
                        const isExplicitlyPicked = selectedSubjectIds.includes(
                            sub.id,
                        );
                        const isAllSelected = selectedSubjectIds.length === 0;

                        return (
                            <button
                                key={sub.id}
                                type="button"
                                onClick={() => toggleSubject(sub.id)}
                                className={`flex cursor-pointer flex-col justify-between gap-2 rounded-xl p-3 text-left transition-all ${
                                    isExplicitlyPicked
                                        ? 'border-2 border-cyan-500 bg-cyan-50 shadow-md ring-1 shadow-cyan-500/10 ring-cyan-500/30 dark:border-cyan-400 dark:bg-[#0e2238] dark:shadow-cyan-950/40 dark:ring-cyan-400/40'
                                        : isAllSelected
                                          ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-cortex-border dark:bg-cortex-card dark:hover:border-slate-600 dark:hover:bg-cortex-hover'
                                          : 'border border-slate-200 bg-slate-100/60 opacity-40 hover:border-slate-300 hover:opacity-90 dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:border-slate-700'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-1.5">
                                    <span
                                        className={`truncate text-xs font-bold ${
                                            isExplicitlyPicked
                                                ? 'text-cyan-950 dark:text-white'
                                                : isAllSelected
                                                  ? 'text-slate-900 dark:text-slate-100'
                                                  : 'text-slate-400 dark:text-slate-400'
                                        }`}
                                    >
                                        {sub.name}
                                    </span>
                                    {isExplicitlyPicked && (
                                        <Check className="size-3.5 shrink-0 font-bold text-cyan-600 dark:text-cyan-400" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span
                                        className={
                                            isExplicitlyPicked
                                                ? 'font-semibold text-cyan-700 dark:text-cyan-300'
                                                : isAllSelected
                                                  ? 'text-slate-500 dark:text-slate-400'
                                                  : 'text-slate-400 dark:text-slate-500'
                                        }
                                    >
                                        {sub.topics?.length || 0} topics
                                    </span>
                                    {sub.questions_count !== undefined && (
                                        <span
                                            className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold ${
                                                isExplicitlyPicked
                                                    ? 'border border-cyan-300 bg-cyan-100 text-cyan-800 dark:border-cyan-500/40 dark:bg-cyan-950 dark:text-cyan-300'
                                                    : isAllSelected
                                                      ? 'border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                      : 'border border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500'
                                            }`}
                                        >
                                            {sub.questions_count} Qs
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Step 4: Test Size & Difficulty */}
            <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
                {/* Difficulty */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                        <span className="flex size-6 items-center justify-center rounded-full bg-cyan-500 text-xs font-black text-slate-950">
                            4
                        </span>
                        <h2 className="text-sm font-black tracking-wider text-slate-900 uppercase dark:text-white">
                            Difficulty Level
                        </h2>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
                            <button
                                key={diff}
                                type="button"
                                onClick={() => setDifficulty(diff)}
                                className={`cursor-pointer rounded-xl px-3 py-2.5 text-center text-xs font-bold transition-all ${
                                    difficulty === diff
                                        ? 'border-2 border-cyan-500 bg-cyan-500 font-black text-slate-950 shadow-md shadow-cyan-500/25'
                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-cortex-border dark:bg-cortex-card dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-cortex-hover dark:hover:text-white'
                                }`}
                            >
                                {diff === 'ALL' ? 'Mixed' : diff}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question Count */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                        <span className="flex size-6 items-center justify-center rounded-full bg-cyan-500 text-xs font-black text-slate-950">
                            5
                        </span>
                        <h2 className="text-sm font-black tracking-wider text-slate-900 uppercase dark:text-white">
                            Number of Questions
                        </h2>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                        {[5, 10, 20, 40, 50].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => setQuestionCount(num)}
                                className={`cursor-pointer rounded-xl px-3 py-2.5 text-center text-xs font-bold transition-all ${
                                    questionCount === num
                                        ? 'border-2 border-cyan-500 bg-cyan-500 font-black text-slate-950 shadow-md shadow-cyan-500/25'
                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-cortex-border dark:bg-cortex-card dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-cortex-hover dark:hover:text-white'
                                }`}
                            >
                                {num} Qs
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Launch Action Banner */}
            <div className="card-glow mt-2 flex flex-col justify-between gap-5 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 text-white shadow-xl dark:from-[#0c1e33] dark:via-[#0d1f36] dark:to-[#0a1626] sm:flex-row sm:items-center">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-wider text-cyan-400 uppercase">
                            Ready to Launch
                        </span>
                        <span className="rounded-md border border-cyan-500/40 bg-cyan-950/80 px-2.5 py-0.5 font-mono text-xs font-semibold text-cyan-300">
                            {mode === 'TUTOR'
                                ? 'Tutor Mode'
                                : 'Timed Simulation'}
                        </span>
                        <span className="rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 font-mono text-xs font-semibold text-slate-200">
                            {statusMode}
                        </span>
                    </div>
                    <h3 className="text-lg font-black text-white sm:text-xl">
                        {questionCount} Clinical Vignette MCQs •{' '}
                        {selectedSubjectsCount} Disciplines
                    </h3>
                    <p className="text-xs font-medium text-slate-300">
                        Estimated duration: ~{Math.round(questionCount * 1.0)}{' '}
                        minutes at official examination pacing.
                    </p>
                </div>

                <Button
                    onClick={handleLaunch}
                    size="lg"
                    className="shrink-0 cursor-pointer gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-8 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] hover:from-cyan-400 hover:to-sky-400"
                >
                    <PlaySquare className="size-5 fill-slate-950 text-cyan-400" />
                    <span>Start Practice Session</span>
                    <ArrowRight className="size-4.5" />
                </Button>
            </div>
        </div>
    );
}
