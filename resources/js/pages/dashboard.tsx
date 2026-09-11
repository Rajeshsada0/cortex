import React from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReadinessGauge } from '@/components/cortex/readiness-gauge';
import { PerformanceQuadrant } from '@/components/cortex/performance-quadrant';
import { NationalRankPredictor, RankPredictionData } from '@/components/cortex/national-rank-predictor';
import { StudyStreakHeatmap, StudyStreakData } from '@/components/cortex/study-streak-heatmap';
import { PathwaySelector } from '@/components/cortex/pathway-selector';

interface DashboardProps {
    user: {
        id: number;
        name: string;
        email: string;
        active_pathway: string;
        pathway_label: string;
        target_exam_date: string | null;
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
    totalQuestions,
    totalAttempts,
}: DashboardProps) {
    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full">
            <Head title="Cortex Medical Dashboard" />

            {/* Top Bar: Active Pathway & Countdown Banner */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#55BDEB]/20 bg-gradient-to-r from-[#102A43] via-[#102A43] to-[#1c3d5a] p-6 text-white shadow-md sm:flex-row sm:items-center">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="rounded bg-[#55BDEB]/20 px-2 py-0.5 text-xs font-semibold text-[#55BDEB]">
                            {user.pathway_label}
                        </span>
                        <span className="text-xs text-neutral-300">
                            Exam Target: {user.target_exam_date || 'Target date not set'}
                        </span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                        Welcome, {user.name}
                    </h1>
                    <p className="text-xs text-neutral-300 max-w-xl">
                        Dual-metric clinical analytics, high-yield spaced repetition queues, and sub-second vignette delivery.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <PathwaySelector currentPathway={user.active_pathway} />
                    <Link href="/qbank/runner">
                        <Button className="bg-[#55BDEB] text-neutral-950 font-bold hover:bg-[#55BDEB]/90 shadow-sm gap-2">
                            <PlaySquare className="size-4" />
                            Launch MCQ Runner
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Metric Stats Banner */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Daily Target
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-foreground">{user.daily_mcq_target}</span>
                        <span className="text-xs text-muted-foreground">MCQs / day</span>
                    </div>
                    <span className="mt-1 text-[11px] text-[#55BDEB] font-medium">
                        Capacity: {user.daily_study_hours} hrs/day
                    </span>
                </div>

                <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Spaced Repetition
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-[#F59E0B]">{dueCardsCount}</span>
                        <span className="text-xs text-muted-foreground">Cards Due</span>
                    </div>
                    <Link
                        href="/spaced-repetition"
                        className="mt-1 flex items-center text-[11px] font-semibold text-[#55BDEB] hover:underline"
                    >
                        Review Due Deck <ArrowRight className="size-3 ml-1" />
                    </Link>
                </div>

                <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Clinical Bookmarks
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-amber-500">{bookmarkedCount}</span>
                        <span className="text-xs text-muted-foreground">Flagged</span>
                    </div>
                    <Link
                        href="/bookmarks"
                        className="mt-1 flex items-center text-[11px] font-semibold text-[#55BDEB] hover:underline"
                    >
                        Open Notebook <ArrowRight className="size-3 ml-1" />
                    </Link>
                </div>

                <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Total Solved
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-[#2FB36F]">{totalAttempts}</span>
                        <span className="text-xs text-muted-foreground">/ {totalQuestions}</span>
                    </div>
                    <span className="mt-1 text-[11px] text-muted-foreground">
                        {totalQuestions > 0 ? Math.round((totalAttempts / totalQuestions) * 100) : 0}% Q-Bank completed
                    </span>
                </div>

                <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm col-span-2 sm:col-span-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Mock Exam Status
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-foreground">
                            {recentSessions.length}
                        </span>
                        <span className="text-xs text-muted-foreground">Grand Mocks</span>
                    </div>
                    <Link
                        href="/mock-exam"
                        className="mt-1 flex items-center text-[11px] font-semibold text-[#55BDEB] hover:underline"
                    >
                        Enter Mock Hall <ArrowRight className="size-3 ml-1" />
                    </Link>
                </div>
            </div>

            {/* Core Analytics: Readiness Gauge & Performance Quadrant */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-12">
                    <ReadinessGauge
                        score={readiness.readiness_score}
                        components={readiness.components}
                        targetExamDate={user.target_exam_date ?? undefined}
                        pathwayName={user.pathway_label}
                    />
                </div>

                <div className="lg:col-span-12">
                    <PerformanceQuadrant
                        quadrants={quadrants.quadrants}
                        answerSwitching={quadrants.answer_switching}
                    />
                </div>

                <div className="lg:col-span-12">
                    <NationalRankPredictor prediction={rankPrediction} />
                </div>

                <div className="lg:col-span-12">
                    <StudyStreakHeatmap streakData={studyStreak} />
                </div>
            </div>

            {/* 19-Subject Medical Directory Snapshot */}
            <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <h3 className="text-lg font-bold tracking-tight text-foreground">
                            19-SUBJECT CURRICULUM MASTERY
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Comprehensive coverage metrics from Anatomy to Obstetrics & Gynecology
                        </p>
                    </div>
                    <Link href="/directory">
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                            View Full 19-Subject Directory <ArrowRight className="size-3.5" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                    {subjects.slice(0, 6).map((sub) => (
                        <div
                            key={sub.id}
                            className="flex flex-col gap-2 rounded-xl border border-border bg-muted/20 p-4 transition-all hover:bg-muted/40"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground truncate">
                                    {sub.name}
                                </span>
                                <span className="text-xs font-extrabold text-[#55BDEB]">
                                    {sub.mastery_percentage}%
                                </span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>Mastery</span>
                                    <span>{sub.attempted_count}/{sub.questions_count} Solved</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-[#55BDEB]"
                                        style={{ width: `${sub.mastery_percentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
