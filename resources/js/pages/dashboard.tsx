import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    PlaySquare,
    Repeat,
    Calendar,
    ArrowRight,
    CheckCircle2,
    Target,
    BookOpen,
    Bookmark,
    Award,
    Search,
    Sliders,
    Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ReadinessGauge } from '@/components/cortex/readiness-gauge';
import { PerformanceQuadrant } from '@/components/cortex/performance-quadrant';
import {
    NationalRankPredictor,
    RankPredictionData,
} from '@/components/cortex/national-rank-predictor';
import {
    StudyStreakHeatmap,
    StudyStreakData,
} from '@/components/cortex/study-streak-heatmap';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface DashboardProps {
    user: {
        id: number;
        name: string;
        email: string;
        active_pathway: string;
        pathway_label: string;
        target_exam_date: string | null;
        days_until_exam?: number | null;
        daily_study_hours: number;
        daily_mcq_target: number;
    };
    readiness: {
        readiness_score: number;
        components: {
            recent_accuracy: number;
            curriculum_coverage: number;
            mock_performance: number;
            srs_clearance_rate: number;
            stability_penalty: number;
        };
    };
    quadrants: any;
    rankPrediction?: RankPredictionData;
    studyStreak?: StudyStreakData;
    subjects: Array<{
        id: number;
        name: string;
        slug: string;
        questions_count: number;
        attempted_count: number;
        coverage_percentage: number;
        mastery_percentage: number;
    }>;
    dueCardsCount: number;
    bookmarkedCount?: number;
    recentSessions: any[];
    grandMocksCount?: number;
    completedSessionsCount?: number;
    avgScorePercent?: number | null;
    totalQuestions: number;
    totalAttempts: number;
}

export default function Dashboard({
    user,
    readiness,
    quadrants,
    rankPrediction,
    studyStreak,
    subjects,
    dueCardsCount,
    bookmarkedCount = 0,
    recentSessions,
    grandMocksCount = 0,
    completedSessionsCount = 0,
    avgScorePercent = null,
    totalQuestions,
    totalAttempts,
}: DashboardProps) {
    const [phaseFilter, setPhaseFilter] = useState<
        'ALL' | 'PRE' | 'PARA' | 'CLINICAL'
    >('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAllSubjects, setShowAllSubjects] = useState(false);

    // Exam Date Setting State
    const [isSettingDate, setIsSettingDate] = useState(false);
    const [targetDateInput, setTargetDateInput] = useState(
        user.target_exam_date || '',
    );
    const [isSavingDate, setIsSavingDate] = useState(false);

    const handleSaveDate = async () => {
        if (!targetDateInput) return;
        setIsSavingDate(true);
        try {
            const res = await fetch('/api/v1/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ target_exam_date: targetDateInput }),
            });
            if (res.ok) {
                toast.success('Target exam date updated!');
                setIsSettingDate(false);
                window.location.reload();
            }
        } catch {
            toast.error('Failed to update exam date');
        } finally {
            setIsSavingDate(false);
        }
    };

    const getSubtopicsCount = (slug: string, id: number): number => {
        const counts: Record<string, number> = {
            'general-medicine': 14,
            medicine: 14,
            'general-surgery': 11,
            surgery: 11,
            'obstetrics-gynecology': 9,
            obgyn: 9,
            pediatrics: 8,
            pathology: 12,
            pharmacology: 11,
            anatomy: 10,
            physiology: 9,
            biochemistry: 8,
            microbiology: 10,
            'forensic-medicine': 7,
            'community-medicine': 12,
            psm: 12,
            ophthalmology: 7,
            ent: 6,
            dermatology: 6,
            psychiatry: 6,
            radiology: 7,
            anesthesia: 6,
            orthopedics: 8,
        };
        return counts[slug?.toLowerCase()] || 8 + (id % 7);
    };

    const getSubjectPhase = (
        name: string,
    ): {
        phase: 'Pre-Clinical' | 'Para-Clinical' | 'Clinical';
        category: 'PRE' | 'PARA' | 'CLINICAL';
    } => {
        const lower = name.toLowerCase();
        if (
            lower.includes('anatomy') ||
            lower.includes('physiology') ||
            lower.includes('biochemistry')
        ) {
            return {
                phase: 'Pre-Clinical',
                category: 'PRE',
            };
        }
        if (
            lower.includes('pathology') ||
            lower.includes('pharmacology') ||
            lower.includes('microbiology') ||
            lower.includes('forensic')
        ) {
            return {
                phase: 'Para-Clinical',
                category: 'PARA',
            };
        }
        return {
            phase: 'Clinical',
            category: 'CLINICAL',
        };
    };

    const filteredSubjects = subjects.filter((sub) => {
        const info = getSubjectPhase(sub.name);
        const matchesPhase =
            phaseFilter === 'ALL' || info.category === phaseFilter;
        const matchesSearch = sub.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        return matchesPhase && matchesSearch;
    });

    const displayedSubjects =
        showAllSubjects || searchQuery.length > 0 || phaseFilter !== 'ALL'
            ? filteredSubjects
            : filteredSubjects.slice(0, 6);

    const avgMastery =
        subjects.length > 0
            ? Math.round(
                  subjects.reduce((acc, s) => acc + s.mastery_percentage, 0) /
                      subjects.length,
              )
            : 0;

    const dailyProgressPct = Math.min(
        100,
        Math.round(
            ((studyStreak?.today_attempts ?? 0) /
                (user.daily_mcq_target || 100)) *
                100,
        ),
    );

    const overallQBankPct =
        totalQuestions > 0
            ? Math.min(100, Math.round((totalAttempts / totalQuestions) * 100))
            : 0;

    return (
        <TooltipProvider delayDuration={150}>
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <Head title="Cortex Med - Clinical Readiness & Dashboard" />

                {/* Clean, Modern Header Bar */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                                    {user.pathway_label || 'Combined Track'}
                                </span>

                                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {user.days_until_exam !== null &&
                                    user.days_until_exam !== undefined ? (
                                        <span>
                                            <strong className="text-foreground">
                                                {user.days_until_exam}
                                            </strong>{' '}
                                            days to exam
                                        </span>
                                    ) : user.target_exam_date ? (
                                        <span>Exam: {user.target_exam_date}</span>
                                    ) : (
                                        <span>Target date not set</span>
                                    )}
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Welcome back, {user.name}
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsSettingDate(!isSettingDate)}
                                        className="h-9 gap-1.5 rounded-xl border-border text-xs font-medium"
                                    >
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>
                                            {user.target_exam_date ? 'Edit Date' : 'Set Date'}
                                        </span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    Target exam date for study scheduling
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a href="#readiness-section">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 gap-1.5 rounded-xl border-border text-xs font-medium"
                                        >
                                            <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>Simulator</span>
                                        </Button>
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    Simulate readiness score improvements
                                </TooltipContent>
                            </Tooltip>

                            <Link href="/qbank/runner">
                                <Button
                                    size="sm"
                                    className="h-9 gap-1.5 rounded-xl bg-cyan-600 px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
                                >
                                    <PlaySquare className="h-3.5 w-3.5" />
                                    <span>Practice MCQs</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Inline Exam Date Picker Dropdown */}
                    {isSettingDate && (
                        <div className="mt-4 flex flex-wrap items-center gap-2.5 rounded-xl border border-border bg-muted/40 p-3.5 shadow-xs">
                            <span className="text-xs font-semibold text-foreground">
                                Target Exam Date:
                            </span>
                            <Input
                                type="date"
                                value={targetDateInput}
                                onChange={(e) => setTargetDateInput(e.target.value)}
                                className="h-8 w-44 border-border bg-background text-xs text-foreground [color-scheme:light] dark:[color-scheme:dark]"
                            />
                            <Button
                                size="sm"
                                onClick={handleSaveDate}
                                disabled={isSavingDate}
                                className="h-8 bg-cyan-600 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
                            >
                                {isSavingDate ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsSettingDate(false)}
                                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                            >
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>

                {/* Minimal, High-Contrast 5-Stat KPI Grid */}
                <section
                    className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5"
                    data-purpose="kpi-metrics-row"
                >
                    {/* Card 1: Daily Target */}
                    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition hover:border-slate-300 dark:hover:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                <Target className="h-4 w-4" />
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-muted-foreground hover:text-foreground"
                                        aria-label="Daily target info"
                                    >
                                        <Info className="h-3.5 w-3.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    Target: {user.daily_mcq_target || 100} MCQs/day (
                                    {user.daily_study_hours || 6}h planned)
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="mt-3">
                            <div className="flex items-baseline gap-1 font-mono">
                                <span className="text-2xl font-bold text-foreground">
                                    {studyStreak?.today_attempts ?? 0}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    / {user.daily_mcq_target || 100}
                                </span>
                            </div>
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-1.5 rounded-full bg-cyan-500 transition-all"
                                    style={{ width: `${dailyProgressPct}%` }}
                                />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Daily Goal</span>
                            <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                                {dailyProgressPct}%
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Spaced Repetition */}
                    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition hover:border-slate-300 dark:hover:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Repeat className="h-4 w-4" />
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-muted-foreground hover:text-foreground"
                                        aria-label="Spaced repetition info"
                                    >
                                        <Info className="h-3.5 w-3.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    Overdue cards ready for memory consolidation
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="mt-3">
                            <div className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {dueCardsCount}
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Due for Review
                            </p>
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[11px]">
                            <span className="text-muted-foreground">Flashcards</span>
                            <Link
                                href="/spaced-repetition"
                                className="inline-flex items-center font-semibold text-amber-600 hover:underline dark:text-amber-400"
                            >
                                Review →
                            </Link>
                        </div>
                    </div>

                    {/* Card 3: Saved Pearls */}
                    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition hover:border-slate-300 dark:hover:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <Bookmark className="h-4 w-4" />
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-muted-foreground hover:text-foreground"
                                        aria-label="Notebook info"
                                    >
                                        <Info className="h-3.5 w-3.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    Bookmarked clinical vignettes & high-yield pearls
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="mt-3">
                            <div className="font-mono text-2xl font-bold text-foreground">
                                {bookmarkedCount}
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Saved Pearls
                            </p>
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[11px]">
                            <span className="text-muted-foreground">Notebook</span>
                            <Link
                                href="/bookmarks"
                                className="inline-flex items-center font-semibold text-purple-600 hover:underline dark:text-purple-400"
                            >
                                Open →
                            </Link>
                        </div>
                    </div>

                    {/* Card 4: Q-Bank Progress */}
                    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition hover:border-slate-300 dark:hover:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-muted-foreground hover:text-foreground"
                                        aria-label="Q-Bank progress info"
                                    >
                                        <Info className="h-3.5 w-3.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    {totalAttempts} attempted out of {totalQuestions} active questions
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="mt-3">
                            <div className="flex items-baseline gap-1 font-mono">
                                <span className="text-2xl font-bold text-foreground">
                                    {totalAttempts}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    / {totalQuestions}
                                </span>
                            </div>
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-1.5 rounded-full bg-emerald-500 transition-all"
                                    style={{ width: `${overallQBankPct}%` }}
                                />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Q-Bank Solved</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {overallQBankPct}%
                            </span>
                        </div>
                    </div>

                    {/* Card 5: Mock Exam Hall */}
                    <div className="col-span-2 sm:col-span-1 flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition hover:border-slate-300 dark:hover:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                <Award className="h-4 w-4" />
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-muted-foreground hover:text-foreground"
                                        aria-label="Mock exams info"
                                    >
                                        <Info className="h-3.5 w-3.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    Full-length timed mock exams taken
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="mt-3">
                            <div className="font-mono text-2xl font-bold text-foreground">
                                {grandMocksCount}
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Grand Mocks Taken
                            </p>
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[11px]">
                            <span className="text-muted-foreground">
                                {completedSessionsCount} Sessions
                            </span>
                            <Link
                                href="/mock-exam"
                                className="inline-flex items-center font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                                Hall →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Core 2-Column Analytics Section */}
                <div
                    id="readiness-section"
                    className="grid grid-cols-1 gap-6 lg:grid-cols-12"
                >
                    {/* Left Column: Readiness Score & Performance Matrix */}
                    <div className="flex flex-col gap-6 lg:col-span-6">
                        <ReadinessGauge
                            score={readiness.readiness_score}
                            components={readiness.components}
                            targetExamDate={user.target_exam_date ?? undefined}
                            daysUntilExam={user.days_until_exam}
                            pathwayName={user.pathway_label}
                            dueCardsCount={dueCardsCount}
                        />

                        <PerformanceQuadrant
                            quadrants={quadrants.quadrants}
                            answerSwitching={quadrants.answer_switching}
                        />
                    </div>

                    {/* Right Column: National Rank Predictor & Daily Study Streak */}
                    <div className="flex flex-col gap-6 lg:col-span-6">
                        <NationalRankPredictor prediction={rankPrediction} />

                        <StudyStreakHeatmap streakData={studyStreak} />
                    </div>
                </div>

                {/* 19-Subject Curriculum Mastery Section */}
                <section
                    className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-xs"
                    data-purpose="curriculum-mastery"
                >
                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <h2 className="text-base font-bold tracking-tight text-foreground">
                                    Curriculum Mastery
                                </h2>
                                <span className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                                    {subjects.length} Subjects
                                </span>
                                <span className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                                    Avg: {avgMastery}%
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Pre-Clinical, Para-Clinical, and Clinical syllabus progress
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <input
                                    className="w-48 rounded-lg border border-border bg-background py-1.5 pr-3 pl-8 text-xs text-foreground transition placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none"
                                    placeholder="Search subjects..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <Link
                                className="inline-flex items-center text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
                                href="/directory"
                            >
                                Full Directory →
                            </Link>
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center space-x-2">
                            {(
                                [
                                    {
                                        id: 'ALL',
                                        label: `All (${subjects.length})`,
                                    },
                                    { id: 'PRE', label: 'Pre-Clinical' },
                                    { id: 'PARA', label: 'Para-Clinical' },
                                    { id: 'CLINICAL', label: 'Clinical' },
                                ] as const
                            ).map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setPhaseFilter(tab.id)}
                                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                        phaseFilter === tab.id
                                            ? 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {showAllSubjects
                                ? `All ${filteredSubjects.length} subjects`
                                : `${displayedSubjects.length} high-yield subjects`}
                        </span>
                    </div>

                    {/* Subjects Grid */}
                    {displayedSubjects.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {displayedSubjects.map((sub) => {
                                const info = getSubjectPhase(sub.name);
                                return (
                                    <div
                                        key={sub.id}
                                        className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition hover:border-cyan-500/40"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                                                        info.category === 'PRE'
                                                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                            : info.category === 'PARA'
                                                              ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                                              : 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400'
                                                    }`}
                                                >
                                                    {info.phase}
                                                </span>
                                                <span className="font-mono text-xs font-bold text-muted-foreground transition group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                                                    {sub.mastery_percentage}%
                                                </span>
                                            </div>

                                            <h3 className="mt-2 truncate text-sm font-bold text-foreground transition group-hover:text-cyan-600 dark:group-hover:text-cyan-300">
                                                {sub.name}
                                            </h3>

                                            <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                                                <div className="flex justify-between text-[11px]">
                                                    <span>Coverage</span>
                                                    <span className="font-mono font-medium text-foreground">
                                                        {sub.attempted_count} / {sub.questions_count} ({sub.coverage_percentage}%)
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-1.5 rounded-full bg-cyan-500 transition-all"
                                                        style={{
                                                            width: `${Math.min(
                                                                100,
                                                                Math.max(
                                                                    0,
                                                                    sub.coverage_percentage,
                                                                ),
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3.5 flex items-center justify-between border-t border-border pt-3 text-xs">
                                            <span className="text-[11px] text-muted-foreground">
                                                {getSubtopicsCount(
                                                    sub.slug,
                                                    sub.id,
                                                )}{' '}
                                                Subtopics
                                            </span>
                                            <Link
                                                href={`/qbank/runner?mode=TUTOR&subject_id=${sub.id}`}
                                                className="inline-flex items-center font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
                                            >
                                                Practice →
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <p className="text-xs font-medium text-muted-foreground">
                                No subjects found matching "{searchQuery}".
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('');
                                    setPhaseFilter('ALL');
                                }}
                                className="mt-2 text-xs text-cyan-600 hover:underline dark:text-cyan-400"
                            >
                                Reset filters
                            </Button>
                        </div>
                    )}

                    {/* Bottom Expand Toggle */}
                    <div className="pt-2 text-center">
                        <button
                            type="button"
                            onClick={() => setShowAllSubjects(!showAllSubjects)}
                            className="inline-flex cursor-pointer items-center text-xs font-medium text-muted-foreground transition hover:text-foreground"
                        >
                            {showAllSubjects
                                ? 'Show High-Yield Subjects Only ↑'
                                : `View All ${filteredSubjects.length} Subjects →`}
                        </button>
                    </div>
                </section>

                {/* Minimal Footer */}
                <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
                    <p>
                        © {new Date().getFullYear()} Cortex Med Actuarial Engine. Strict Medical Confidentiality Standard.
                    </p>
                </footer>
            </div>
        </TooltipProvider>
    );
}
