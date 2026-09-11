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
    counts = { total: 0, unused: 0, incorrect: 0, bookmarked: 0, hazardous: 0, unstable: 0 },
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
            prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
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
    const selectedSubjectsCount = selectedSubjectIds.length > 0 ? selectedSubjectIds.length : subjects.length;

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
            <Head title="Custom Test Builder — Cortex Q-Bank" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#0066FF]/20 bg-[#0066FF]/10 px-3 py-1 text-xs font-bold text-[#0066FF] mb-2">
                        <Sparkles className="size-3.5" />
                        <span>Adaptive Clinical Test Generator</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                        Custom Q-Bank Test Builder
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Tailor high-yield clinical practice blocks by exam simulation mode, prior attempts, and 19-subject disciplines.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Badge variant="outline" className="text-xs font-mono py-1 px-2.5 border-border">
                        Pathway: <span className="font-bold text-[#0066FF] ml-1">{activePathway}</span>
                    </Badge>
                </div>
            </div>

            {/* Step 1: Test Mode Selection */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[#0066FF] text-xs font-bold text-white">
                        1
                    </span>
                    <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                        Choose Test Mode
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tutor Mode */}
                    <div
                        onClick={() => setMode('TUTOR')}
                        className={`cursor-pointer rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${
                            mode === 'TUTOR'
                                ? 'border-[#0066FF] bg-blue-50/50 dark:bg-blue-950/20 shadow-sm ring-1 ring-[#0066FF]'
                                : 'border-border bg-card hover:border-border/80 hover:bg-muted/20'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-[#0066FF]">
                                    <Sparkles className="size-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <span>Tutor Mode</span>
                                        <Badge className="bg-[#0066FF] text-[10px] text-white">Recommended</Badge>
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Immediate feedback and multi-tiered rationale after each question.
                                    </p>
                                </div>
                            </div>
                            {mode === 'TUTOR' && <CheckCircle2 className="size-5 text-[#0066FF]" />}
                        </div>
                        <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-muted-foreground flex items-center gap-3">
                            <span className="flex items-center gap-1">✓ Instant Foundation Explanations</span>
                            <span className="flex items-center gap-1">✓ SM-2 Confidence Rating</span>
                        </div>
                    </div>

                    {/* Timed Exam Mode */}
                    <div
                        onClick={() => setMode('TIMED')}
                        className={`cursor-pointer rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${
                            mode === 'TIMED'
                                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm ring-1 ring-amber-500'
                                : 'border-border bg-card hover:border-border/80 hover:bg-muted/20'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                                    <Clock className="size-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">
                                        Timed Simulation Mode
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Strict countdown timer, answers hidden until test submission.
                                    </p>
                                </div>
                            </div>
                            {mode === 'TIMED' && <CheckCircle2 className="size-5 text-amber-500" />}
                        </div>
                        <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-muted-foreground flex items-center gap-3">
                            <span className="flex items-center gap-1">✓ Realistic Exam Speed (60s/Q)</span>
                            <span className="flex items-center gap-1">✓ End-of-block Scorecard</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 2: Question Pool Status Filter */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[#0066FF] text-xs font-bold text-white">
                        2
                    </span>
                    <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                        Question Status Filter
                    </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/* All */}
                    <div
                        onClick={() => setStatusMode('ALL')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            statusMode === 'ALL'
                                ? 'border-[#0066FF] bg-[#0066FF]/10 text-[#0066FF] font-bold shadow-xs'
                                : 'border-border bg-card hover:bg-muted/30 text-muted-foreground'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs">All Questions</span>
                            <Badge variant="secondary" className="text-[10px] font-mono">{counts.total}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Entire question bank</p>
                    </div>

                    {/* Unused */}
                    <div
                        onClick={() => setStatusMode('UNUSED')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            statusMode === 'UNUSED'
                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                                : 'border-border bg-card hover:bg-muted/30 text-muted-foreground'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs">Unattempted</span>
                            <Badge variant="secondary" className="text-[10px] font-mono">{counts.unused}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Never attempted yet</p>
                    </div>

                    {/* Incorrect */}
                    <div
                        onClick={() => setStatusMode('INCORRECT')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            statusMode === 'INCORRECT'
                                ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold shadow-xs'
                                : 'border-border bg-card hover:bg-muted/30 text-muted-foreground'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs">Missed / Wrong</span>
                            <Badge variant="secondary" className="text-[10px] font-mono">{counts.incorrect}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">General remediation</p>
                    </div>

                    {/* Hazardous Blind Spots */}
                    <div
                        onClick={() => setStatusMode('HAZARDOUS')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            statusMode === 'HAZARDOUS'
                                ? 'border-[#E05252] bg-[#E05252]/10 text-[#E05252] font-bold shadow-xs ring-1 ring-[#E05252]'
                                : 'border-border bg-card hover:border-[#E05252]/50 hover:bg-[#E05252]/5 text-muted-foreground'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-[#E05252] font-semibold">Hazardous Blind Spots</span>
                            <Badge className="bg-[#E05252] text-[10px] font-mono text-white">{counts.hazardous ?? 0}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">High-confidence misses</p>
                    </div>

                    {/* Lucky Guesses / Unstable */}
                    <div
                        onClick={() => setStatusMode('UNSTABLE')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            statusMode === 'UNSTABLE'
                                ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold shadow-xs ring-1 ring-amber-500'
                                : 'border-border bg-card hover:border-amber-500/50 hover:bg-amber-500/5 text-muted-foreground'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Lucky Guesses</span>
                            <Badge className="bg-amber-500 text-[10px] font-mono text-white">{counts.unstable ?? 0}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Low-confidence hits</p>
                    </div>

                    {/* Bookmarked */}
                    <div
                        onClick={() => setStatusMode('BOOKMARKED')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            statusMode === 'BOOKMARKED'
                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold shadow-xs'
                                : 'border-border bg-card hover:bg-muted/30 text-muted-foreground'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs">Bookmarked</span>
                            <Badge variant="secondary" className="text-[10px] font-mono">{counts.bookmarked}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Saved to personal binder</p>
                    </div>
                </div>
            </div>

            {/* Step 3: Medical Subjects Multi-Select */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#0066FF] text-xs font-bold text-white">
                            3
                        </span>
                        <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                            Medical Curriculum Disciplines
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <button
                            type="button"
                            onClick={selectAllSubjects}
                            className="font-bold text-[#0066FF] hover:underline"
                        >
                            Select All
                        </button>
                        <span className="text-muted-foreground">•</span>
                        <button
                            type="button"
                            onClick={clearAllSubjects}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Clear (All Integrated)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                    {subjects.map((sub) => {
                        const isSelected = selectedSubjectIds.length === 0 || selectedSubjectIds.includes(sub.id);
                        const isExplicitlyPicked = selectedSubjectIds.includes(sub.id);

                        return (
                            <button
                                key={sub.id}
                                type="button"
                                onClick={() => toggleSubject(sub.id)}
                                className={`rounded-xl border p-3 text-left transition-all flex flex-col justify-between gap-1.5 ${
                                    isExplicitlyPicked
                                        ? 'border-[#0066FF] bg-blue-50/70 dark:bg-blue-950/40 text-foreground ring-1 ring-[#0066FF]'
                                        : selectedSubjectIds.length === 0
                                          ? 'border-border bg-card text-foreground hover:bg-muted/30'
                                          : 'border-border/50 bg-muted/20 text-muted-foreground opacity-60 hover:opacity-100'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-1">
                                    <span className="text-xs font-bold truncate">{sub.name}</span>
                                    {isExplicitlyPicked && <Check className="size-3.5 text-[#0066FF] shrink-0" />}
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                    <span>{sub.topics?.length || 0} topics</span>
                                    {sub.questions_count !== undefined && (
                                        <Badge variant="secondary" className="text-[9px] px-1 h-4 font-mono">
                                            {sub.questions_count} Qs
                                        </Badge>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Step 4: Test Size & Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Difficulty */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#0066FF] text-xs font-bold text-white">
                            4
                        </span>
                        <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                            Difficulty Level
                        </h2>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
                            <button
                                key={diff}
                                type="button"
                                onClick={() => setDifficulty(diff)}
                                className={`rounded-xl border py-2.5 px-3 text-xs font-bold transition-all text-center ${
                                    difficulty === diff
                                        ? 'border-[#0066FF] bg-[#0066FF] text-white shadow-xs'
                                        : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                                }`}
                            >
                                {diff === 'ALL' ? 'Mixed' : diff}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question Count */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#0066FF] text-xs font-bold text-white">
                            5
                        </span>
                        <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                            Number of Questions
                        </h2>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                        {[5, 10, 20, 40, 50].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => setQuestionCount(num)}
                                className={`rounded-xl border py-2.5 px-3 text-xs font-bold transition-all text-center ${
                                    questionCount === num
                                        ? 'border-[#0066FF] bg-[#0066FF] text-white shadow-xs'
                                        : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                                }`}
                            >
                                {num} Qs
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Launch Action Banner */}
            <div className="rounded-2xl border-2 border-[#0066FF]/30 bg-gradient-to-r from-blue-50/60 to-sky-50/60 dark:from-blue-950/30 dark:to-sky-950/20 p-5 sm:p-6 shadow-sm mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0066FF] uppercase tracking-wider">
                            Ready to Launch
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono border-[#0066FF]/40">
                            {mode === 'TUTOR' ? 'Tutor Mode' : 'Timed Simulation'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-mono border-border">
                            {statusMode}
                        </Badge>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-foreground">
                        {questionCount} Clinical Vignette MCQs • {selectedSubjectsCount} Disciplines
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Estimated duration: ~{Math.round(questionCount * 1.0)} minutes at official examination pacing.
                    </p>
                </div>

                <Button
                    onClick={handleLaunch}
                    size="lg"
                    className="bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-sm gap-2 shadow-lg hover:scale-[1.02] transition-all shrink-0 px-7"
                >
                    <PlaySquare className="size-5" />
                    <span>Start Practice Session</span>
                    <ArrowRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}
