import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    PlaySquare,
    GraduationCap,
    Repeat,
    Calendar,
    ArrowRight,
    CheckCircle2,
    Clock,
    Target,
    BookOpen,
    Layers,
    Sparkles,
    Bookmark,
    Award,
    Search,
    Sliders,
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
import { PathwaySelector } from '@/components/cortex/pathway-selector';

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
        color: string;
        badgeBg: string;
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
                color: 'text-emerald-500',
                badgeBg:
                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
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
                color: 'text-amber-500',
                badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            };
        }
        return {
            phase: 'Clinical',
            category: 'CLINICAL',
            color: 'text-[#55BDEB]',
            badgeBg: 'bg-[#55BDEB]/10 text-[#55BDEB] border-[#55BDEB]/20',
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

    return (
        <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <Head title="Cortex Med - Clinical Readiness & Dashboard" />

            {/* Welcome Banner Sub-bar */}
            <div className="border-cortex-border card-glow relative overflow-hidden rounded-2xl border bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 p-6 shadow-xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="mb-1.5 flex items-center space-x-2">
                            <span className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-300">
                                <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400"></span>
                                {user.pathway_label ||
                                    'India: INI-CET Nov Track'}
                            </span>
                            <span className="text-xs text-slate-400">
                                Target Exam:{' '}
                                {user.target_exam_date || 'Date not set'}
                                {user.days_until_exam !== null &&
                                    user.days_until_exam !== undefined && (
                                        <span className="ml-1 font-medium text-cyan-400">
                                            ({user.days_until_exam} days to go)
                                        </span>
                                    )}
                            </span>
                        </div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-white">
                            Welcome, {user.name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Dual-metric clinical analytics, high-yield spaced
                            repetition queues, and sub-second vignette delivery.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsSettingDate(!isSettingDate)}
                            className="flex cursor-pointer items-center space-x-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                        >
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>Set Exam Date</span>
                        </button>
                        <a href="#readiness-section">
                            <button
                                type="button"
                                className="flex cursor-pointer items-center space-x-1.5 rounded-lg border border-cyan-500/30 bg-cyan-600/20 px-3.5 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-600/30"
                            >
                                <Sliders className="h-4 w-4 text-cyan-400" />
                                <span>What-If Simulator</span>
                            </button>
                        </a>
                    </div>
                </div>

                {/* Inline Exam Date Picker Dropdown */}
                {isSettingDate && (
                    <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/90 p-3">
                        <span className="text-xs font-semibold text-white">
                            Target Exam Date:
                        </span>
                        <Input
                            type="date"
                            value={targetDateInput}
                            onChange={(e) => setTargetDateInput(e.target.value)}
                            className="h-8 w-44 border-slate-600 bg-slate-800 text-xs text-white"
                        />
                        <Button
                            size="sm"
                            onClick={handleSaveDate}
                            disabled={isSavingDate}
                            className="h-8 bg-cyan-500 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                        >
                            {isSavingDate ? 'Saving...' : 'Save Date'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsSettingDate(false)}
                            className="h-8 text-xs text-slate-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            {/* BEGIN: FiveColumnStatMetrics */}
            <section
                className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5"
                data-purpose="top-metrics-row"
            >
                {/* Metric 1: Daily Target */}
                <div className="bg-cortex-card border-cortex-border card-glow flex flex-col justify-between rounded-xl border p-4 transition hover:border-slate-300 dark:hover:border-slate-600">
                    <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        <span>Daily Target</span>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-400">
                            <Target className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="mt-2 mb-3">
                        <div className="flex items-baseline space-x-1">
                            <span className="font-mono text-2xl font-extrabold text-foreground dark:text-white">
                                {studyStreak?.today_attempts ?? 0}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                / {user.daily_mcq_target || 100} MCQs
                            </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                            <div
                                className="h-1.5 rounded-full bg-cyan-500 transition-all"
                                style={{
                                    width: `${Math.min(
                                        100,
                                        Math.round(
                                            ((studyStreak?.today_attempts ??
                                                0) /
                                                (user.daily_mcq_target ||
                                                    100)) *
                                                100,
                                        ),
                                    )}%`,
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                        <span>Capacity:</span>
                        <span className="font-medium text-foreground dark:text-slate-300">
                            {user.daily_study_hours || 6} hrs/day
                        </span>
                    </div>
                </div>

                {/* Metric 2: Spaced Repetition */}
                <div className="bg-cortex-card border-cortex-border card-glow flex flex-col justify-between rounded-xl border p-4 transition hover:border-slate-300 dark:hover:border-slate-600">
                    <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        <span>Spaced Repetition</span>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/70 dark:text-amber-400">
                            <Repeat className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="mt-2 mb-3">
                        <div className="flex items-baseline space-x-1">
                            <span className="font-mono text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                                {dueCardsCount}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Cards Due
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Ready for consolidation
                        </p>
                    </div>
                    <div className="border-t border-border pt-2 text-[11px]">
                        <Link
                            href="/spaced-repetition"
                            className="inline-flex items-center font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                        >
                            Review Due Deck →
                        </Link>
                    </div>
                </div>

                {/* Metric 3: Clinical Notebook */}
                <div className="bg-cortex-card border-cortex-border card-glow flex flex-col justify-between rounded-xl border p-4 transition hover:border-slate-300 dark:hover:border-slate-600">
                    <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        <span>Clinical Notebook</span>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400">
                            <Bookmark className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="mt-2 mb-3">
                        <div className="flex items-baseline space-x-1">
                            <span className="font-mono text-2xl font-extrabold text-foreground dark:text-white">
                                {bookmarkedCount}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Flagged
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            High-yield pearls saved
                        </p>
                    </div>
                    <div className="border-t border-border pt-2 text-[11px]">
                        <Link
                            href="/bookmarks"
                            className="inline-flex items-center font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                            Open Notebook →
                        </Link>
                    </div>
                </div>

                {/* Metric 4: Total Solved */}
                <div className="bg-cortex-card border-cortex-border card-glow flex flex-col justify-between rounded-xl border p-4 transition hover:border-slate-300 dark:hover:border-slate-600">
                    <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        <span>Total Solved</span>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="mt-2 mb-3">
                        <div className="flex items-baseline space-x-1">
                            <span className="font-mono text-2xl font-extrabold text-foreground dark:text-white">
                                {totalAttempts}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                / {totalQuestions} Active
                            </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                            <div
                                className="h-1.5 rounded-full bg-emerald-500 transition-all"
                                style={{
                                    width: `${totalQuestions > 0 ? Math.min(100, Math.round((totalAttempts / totalQuestions) * 100)) : 0}%`,
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                        <span>Progress:</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {totalQuestions > 0
                                ? Math.round(
                                      (totalAttempts / totalQuestions) * 100,
                                  )
                                : 0}
                            % Q-Bank
                        </span>
                    </div>
                </div>

                {/* Metric 5: Mock Exam Hall */}
                <div className="bg-cortex-card border-cortex-border card-glow flex flex-col justify-between rounded-xl border p-4 transition hover:border-slate-300 dark:hover:border-slate-600">
                    <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        <span>Mock Exam Hall</span>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-400">
                            <Award className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="mt-2 mb-3">
                        <div className="flex items-baseline space-x-1">
                            <span className="font-mono text-2xl font-extrabold text-foreground dark:text-white">
                                {grandMocksCount}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Grand Mocks
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Full 200Q AIIMS Pattern
                        </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                        <span>{completedSessionsCount} Sessions</span>
                        <Link
                            href="/mock-exam"
                            className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            Hall →
                        </Link>
                    </div>
                </div>
            </section>
            {/* END: FiveColumnStatMetrics */}

            {/* Core 2-Column Analytics Section (Stitch Web Design) */}
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

            {/* BEGIN: 19SubjectCurriculumSection */}
            <section
                className="bg-cortex-card border-cortex-border card-glow space-y-6 rounded-2xl border p-6 shadow-xl"
                data-purpose="curriculum-mastery"
            >
                {/* Subject Directory Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-bold tracking-wide text-foreground dark:text-white">
                                19-SUBJECT CURRICULUM MASTERY
                            </h3>
                            <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground dark:bg-slate-800 dark:text-slate-300">
                                {subjects.length} Subjects
                            </span>
                            <span className="rounded border border-cyan-200 bg-cyan-50 px-2 py-0.5 font-mono text-xs text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-400">
                                Avg Mastery: {avgMastery}%
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Pre-Clinical, Para-Clinical, and Clinical curriculum
                            tracking with instant MCQ drills
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {/* Search Bar */}
                        <div className="relative">
                            <input
                                className="w-48 rounded-lg border border-border bg-background py-1.5 pr-3 pl-8 text-xs text-foreground transition placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                placeholder="Filter subjects..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <Link
                            className="inline-flex items-center text-xs font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                            href="/directory"
                        >
                            View Full Directory →
                        </Link>
                    </div>
                </div>

                {/* Subject Classification Filter Pills */}
                <div className="flex items-center justify-between border-b border-border pb-3 dark:border-slate-800">
                    <div className="flex items-center space-x-2 text-xs">
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
                                        ? 'border border-cyan-500/40 bg-cyan-50 text-cyan-800 dark:border-cyan-500/30 dark:bg-cyan-500/20 dark:text-cyan-300'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {showAllSubjects
                            ? `Showing All ${filteredSubjects.length} Subjects`
                            : `Showing ${displayedSubjects.length} High-Yield Subjects`}
                    </span>
                </div>

                {/* Subjects Grid (3 Columns Desktop) */}
                {displayedSubjects.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {displayedSubjects.map((sub) => {
                            const info = getSubjectPhase(sub.name);
                            return (
                                <div
                                    key={sub.id}
                                    className="border-cortex-border group card-glow flex flex-col justify-between rounded-xl border bg-card p-4 transition hover:border-cyan-500/40 dark:bg-slate-900/80"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase ${
                                                    info.category === 'PRE'
                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                        : info.category ===
                                                            'PARA'
                                                          ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                          : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                }`}
                                            >
                                                {info.phase}
                                            </span>
                                            <span className="font-mono text-xs font-bold text-muted-foreground transition group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                                                {sub.mastery_percentage}%
                                                Mastery
                                            </span>
                                        </div>

                                        <h4 className="mt-2 truncate text-base font-bold text-foreground transition group-hover:text-cyan-600 dark:text-white dark:group-hover:text-cyan-300">
                                            {sub.name}
                                        </h4>

                                        <div className="mt-3 space-y-2 border-t border-border pt-3 text-xs text-muted-foreground dark:border-slate-800/80">
                                            <div className="flex justify-between">
                                                <span>Q-Bank Coverage:</span>
                                                <span className="font-mono font-medium text-foreground dark:text-slate-300">
                                                    {sub.attempted_count} /{' '}
                                                    {sub.questions_count} (
                                                    {sub.coverage_percentage}%)
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Accuracy Mastery:</span>
                                                <span className="font-mono font-medium text-foreground dark:text-slate-300">
                                                    {sub.mastery_percentage}%
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                                <div
                                                    className="h-1.5 rounded-full bg-cyan-500 transition-all"
                                                    style={{
                                                        width: `${Math.min(100, Math.max(0, sub.coverage_percentage))}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3 dark:border-slate-800">
                                        <span className="text-[11px] text-muted-foreground">
                                            {getSubtopicsCount(
                                                sub.slug,
                                                sub.id,
                                            )}{' '}
                                            High-Yield Subtopics
                                        </span>
                                        <Link
                                            href={`/qbank/runner?mode=TUTOR&subject_id=${sub.id}`}
                                            className="inline-flex items-center text-xs font-semibold text-cyan-600 group-hover:underline hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                                        >
                                            Drill MCQs →
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <p className="text-xs font-semibold text-muted-foreground">
                            No subjects found matching "{searchQuery}".
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchQuery('');
                                setPhaseFilter('ALL');
                            }}
                            className="mt-2 text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                        >
                            Reset filters
                        </Button>
                    </div>
                )}

                {/* Bottom Expand Banner */}
                <div className="pt-2 text-center">
                    <button
                        type="button"
                        onClick={() => setShowAllSubjects(!showAllSubjects)}
                        className="inline-flex cursor-pointer items-center text-xs font-medium text-muted-foreground transition hover:text-cyan-600 dark:hover:text-cyan-400"
                    >
                        {showAllSubjects
                            ? 'Collapse to High-Yield Subjects ↑'
                            : 'View All 19 Subjects (Anatomy, Physiology, Biochemistry, Microbiology, PSM, Forensic...) →'}
                    </button>
                </div>
            </section>
            {/* END: 19SubjectCurriculumSection */}

            {/* BEGIN: MinimalFooter */}
            <footer className="border-cortex-border mt-auto border-t px-8 py-4 text-center text-xs text-slate-500">
                <p>
                    © 2025 Cortex Med AI Systems. India INI-CET, NEET-PG &amp;
                    USMLE Clinical Actuarial Engine. Strict Medical
                    Confidentiality Standard.
                </p>
            </footer>
            {/* END: MinimalFooter */}
        </div>
    );
}
