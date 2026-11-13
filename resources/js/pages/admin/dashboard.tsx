import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    HelpCircle,
    BookOpen,
    Layers,
    Users,
    Award,
    Plus,
    CheckCircle2,
    Clock,
    Flame,
    ArrowRight,
    TrendingUp,
    FileText,
    Sparkles,
    SlidersHorizontal,
    Activity,
    Stethoscope,
    Globe,
    Headset,
    Star,
    PlaySquare,
    Landmark,
    Puzzle,
    Repeat,
    Calendar,
    Bookmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/hooks/use-settings';

interface KPIProps {
    total_questions: number;
    active_questions: number;
    draft_questions: number;
    total_subjects: number;
    total_topics: number;
    total_subtopics: number;
    total_users: number;
    total_attempts: number;
    total_sessions: number;
    total_csq_scenarios?: number;
    total_inquiries?: number;
    pending_inquiries?: number;
    total_ratings?: number;
    average_rating?: number;
}

interface SubjectSummary {
    id: number;
    name: string;
    slug: string;
    icon_key: string;
    order_index: number;
    topics_count: number;
    questions_count: number;
}

interface RecentQuestion {
    id: string;
    code: string;
    stem: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    is_active: boolean;
    created_at: string;
    subject: { id: number; name: string };
    topic: { id: number; name: string };
    relevant_exams: Array<{ exam: string }>;
}

interface AdminDashboardProps {
    kpis: KPIProps;
    difficulty_breakdown: Record<string, number>;
    pathway_breakdown: Record<string, number>;
    subjects_summary: SubjectSummary[];
    recent_questions: RecentQuestion[];
}

export default function AdminDashboard({
    kpis,
    difficulty_breakdown,
    pathway_breakdown,
    subjects_summary,
    recent_questions,
}: AdminDashboardProps) {
    const totalQuestions = kpis.total_questions || 1;
    const easyPct = Math.round(
        ((difficulty_breakdown.EASY || 0) / totalQuestions) * 100,
    );
    const medPct = Math.round(
        ((difficulty_breakdown.MEDIUM || 0) / totalQuestions) * 100,
    );
    const hardPct = Math.round(
        ((difficulty_breakdown.HARD || 0) / totalQuestions) * 100,
    );

    const handleToggleActive = (id: string) => {
        router.post(
            `/admin/questions/${id}/toggle-active`,
            {},
            { preserveScroll: true },
        );
    };

    const settings = useSettings();

    return (
        <>
            <Head title={`Faculty Admin Console — ${settings.app_name}`} />

            <div className="flex w-full max-w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Contextual Action Bar */}
                <div className="flex items-center justify-end">
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Link href="/admin/inquiries">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-medium"
                            >
                                <Headset className="size-3.5" />
                                Support Desk
                                {(kpis.pending_inquiries || 0) > 0 && (
                                    <Badge className="h-4 px-1 text-[10px] bg-amber-500 text-white border-0">
                                        {kpis.pending_inquiries}
                                    </Badge>
                                )}
                            </Button>
                        </Link>
                        <Link href="/admin/ratings">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-medium"
                            >
                                <Star className="size-3.5 fill-current text-amber-500" />
                                Ratings ({kpis.average_rating || '5.0'} ★)
                            </Button>
                        </Link>
                        <Link href="/admin/settings">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-medium"
                            >
                                <Globe className="size-3.5" />
                                Settings
                            </Button>
                        </Link>
                        <Link href="/admin/questions/create">
                            <Button size="sm" className="h-8 gap-1.5 bg-[#0066FF] text-xs font-semibold text-white shadow-xs hover:bg-[#0052cc]">
                                <Plus className="size-3.5" />
                                New Question
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* 7 Metric KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
                    {/* KPI 1: Questions */}
                    <Link
                        href="/admin/questions"
                        className="border-border bg-card hover:border-[#0066FF]/60 flex flex-col justify-between rounded-xl border p-3.5 shadow-xs transition-all hover:shadow-xs group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider group-hover:text-foreground transition-colors">
                                Total MCQs
                            </span>
                            <div className="flex size-6 items-center justify-center rounded-md bg-blue-50 text-[#0066FF] dark:bg-blue-950/50">
                                <HelpCircle className="size-3.5" />
                            </div>
                        </div>
                        <div className="mt-1.5">
                            <div className="text-foreground text-xl font-bold">
                                {kpis.total_questions}
                            </div>
                            <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-[10px]">
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                    {kpis.active_questions} active
                                </span>
                                <span>•</span>
                                <span className="font-medium text-amber-600 dark:text-amber-400">
                                    {kpis.draft_questions} draft
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* KPI 2: CSQ Scenarios */}
                    <Link
                        href="/admin/csq"
                        className="border-border bg-card hover:border-cyan-500/60 flex flex-col justify-between rounded-xl border p-3.5 shadow-xs transition-all hover:shadow-xs group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider group-hover:text-foreground transition-colors">
                                CSQ Stations
                            </span>
                            <div className="flex size-6 items-center justify-center rounded-md bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50">
                                <Stethoscope className="size-3.5" />
                            </div>
                        </div>
                        <div className="mt-1.5">
                            <div className="text-foreground text-xl font-bold">
                                {kpis.total_csq_scenarios || 0}
                            </div>
                            <div className="text-muted-foreground mt-0.5 text-[10px]">
                                Clinical cases
                            </div>
                        </div>
                    </Link>

                    {/* KPI 3: Subjects */}
                    <Link
                        href="/admin/subjects"
                        className="border-border bg-card hover:border-indigo-500/60 flex flex-col justify-between rounded-xl border p-3.5 shadow-xs transition-all hover:shadow-xs group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider group-hover:text-foreground transition-colors">
                                Subjects
                            </span>
                            <div className="flex size-6 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50">
                                <BookOpen className="size-3.5" />
                            </div>
                        </div>
                        <div className="mt-1.5">
                            <div className="text-foreground text-xl font-bold">
                                {kpis.total_subjects}
                            </div>
                            <div className="text-muted-foreground mt-0.5 text-[10px]">
                                19 Curricula
                            </div>
                        </div>
                    </Link>

                    {/* KPI 4: Topics */}
                    <Link
                        href="/admin/topics"
                        className="border-border bg-card hover:border-sky-500/60 flex flex-col justify-between rounded-xl border p-3.5 shadow-xs transition-all hover:shadow-xs group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider group-hover:text-foreground transition-colors">
                                Topics
                            </span>
                            <div className="flex size-6 items-center justify-center rounded-md bg-sky-50 text-sky-600 dark:bg-sky-950/50">
                                <Layers className="size-3.5" />
                            </div>
                        </div>
                        <div className="mt-1.5">
                            <div className="text-foreground text-xl font-bold">
                                {kpis.total_topics}
                            </div>
                            <div className="text-muted-foreground mt-0.5 text-[10px]">
                                {kpis.total_subtopics} Subtopics
                            </div>
                        </div>
                    </Link>

                    {/* KPI 5: Candidates */}
                    <Link
                        href="/admin/users"
                        className="border-border bg-card hover:border-purple-500/60 flex flex-col justify-between rounded-xl border p-3.5 shadow-xs transition-all hover:shadow-xs group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider group-hover:text-foreground transition-colors">
                                Candidates
                            </span>
                            <div className="flex size-6 items-center justify-center rounded-md bg-purple-50 text-purple-600 dark:bg-purple-950/50">
                                <Users className="size-3.5" />
                            </div>
                        </div>
                        <div className="mt-1.5">
                            <div className="text-foreground text-xl font-bold">
                                {kpis.total_users}
                            </div>
                            <div className="text-muted-foreground mt-0.5 text-[10px]">
                                Registered Doctors
                            </div>
                        </div>
                    </Link>

                    {/* KPI 6: Attempts */}
                    <div className="border-border bg-card flex flex-col justify-between rounded-xl border p-3.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                                MCQ Attempts
                            </span>
                            <div className="flex size-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
                                <CheckCircle2 className="size-3.5" />
                            </div>
                        </div>
                        <div className="mt-1.5">
                            <div className="text-foreground text-xl font-bold">
                                {kpis.total_attempts}
                            </div>
                            <div className="text-muted-foreground mt-0.5 text-[10px]">
                                Total responses
                            </div>
                        </div>
                    </div>

                    {/* KPI 7: Mock Sessions */}
                    <div className="border-border bg-card flex flex-col justify-between rounded-xl border p-3.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                                Mock Exams
                            </span>
                            <div className="flex size-6 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950/50">
                                <Award className="size-3.5" />
                            </div>
                        </div>
                        <div className="mt-1.5">
                            <div className="text-foreground text-xl font-bold">
                                {kpis.total_sessions}
                            </div>
                            <div className="text-muted-foreground mt-0.5 text-[10px]">
                                Simulations
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Two Columns: Difficulty Calibration & Pathway Distribution */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left 6 Columns: Difficulty Calibration */}
                    <div className="border-border bg-card rounded-2xl border p-5 shadow-xs sm:p-6 lg:col-span-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-foreground text-sm font-bold">
                                    Difficulty Calibration
                                </h2>
                                <p className="text-muted-foreground text-xs">
                                    Distribution across clinical vignette tiers
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className="text-[10px] font-bold"
                            >
                                {kpis.total_questions} Questions
                            </Badge>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
                            <div
                                style={{ width: `${easyPct}%` }}
                                className="bg-emerald-500 transition-all"
                                title={`EASY: ${easyPct}%`}
                            />
                            <div
                                style={{ width: `${medPct}%` }}
                                className="bg-blue-500 transition-all"
                                title={`MEDIUM: ${medPct}%`}
                            />
                            <div
                                style={{ width: `${hardPct}%` }}
                                className="bg-amber-500 transition-all"
                                title={`HARD: ${hardPct}%`}
                            />
                        </div>

                        <div className="border-border/60 mt-6 grid grid-cols-3 gap-4 border-t pt-4 text-center">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    <span className="size-2 rounded-full bg-emerald-500" />
                                    <span>EASY</span>
                                </div>
                                <span className="text-foreground mt-1 text-base font-bold">
                                    {difficulty_breakdown.EASY || 0}
                                </span>
                                <span className="text-muted-foreground text-[10px]">
                                    {easyPct}%
                                </span>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                                    <span className="size-2 rounded-full bg-blue-500" />
                                    <span>MEDIUM</span>
                                </div>
                                <span className="text-foreground mt-1 text-base font-bold">
                                    {difficulty_breakdown.MEDIUM || 0}
                                </span>
                                <span className="text-muted-foreground text-[10px]">
                                    {medPct}%
                                </span>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                                    <span className="size-2 rounded-full bg-amber-500" />
                                    <span>HARD</span>
                                </div>
                                <span className="text-foreground mt-1 text-base font-bold">
                                    {difficulty_breakdown.HARD || 0}
                                </span>
                                <span className="text-muted-foreground text-[10px]">
                                    {hardPct}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right 6 Columns: Pathway Coverage */}
                    <div className="border-border bg-card rounded-2xl border p-5 shadow-xs sm:p-6 lg:col-span-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-foreground text-sm font-bold">
                                    Pathway Coverage
                                </h2>
                                <p className="text-muted-foreground text-xs">
                                    Questions tagged per entrance board
                                </p>
                            </div>
                            <Link
                                href="/admin/pathways"
                                className="text-xs font-bold text-[#0066FF] hover:underline"
                            >
                                View Details →
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {[
                                {
                                    key: 'MECEE_PG',
                                    name: 'Nepal MECEE-PG (MD/MS)',
                                    count: pathway_breakdown.MECEE_PG || 0,
                                    color: 'bg-emerald-500',
                                },
                                {
                                    key: 'INI_CET',
                                    name: 'India INI-CET (AIIMS/PGI)',
                                    count: pathway_breakdown.INI_CET || 0,
                                    color: 'bg-blue-500',
                                },
                                {
                                    key: 'USMLE_STEP1',
                                    name: 'USA USMLE Step 1',
                                    count: pathway_breakdown.USMLE_STEP1 || 0,
                                    color: 'bg-indigo-500',
                                },
                                {
                                    key: 'USMLE_STEP2CK',
                                    name: 'USA USMLE Step 2 CK',
                                    count: pathway_breakdown.USMLE_STEP2CK || 0,
                                    color: 'bg-purple-500',
                                },
                                {
                                    key: 'COMBINED',
                                    name: 'Global Combined Track',
                                    count: pathway_breakdown.COMBINED || 0,
                                    color: 'bg-sky-500',
                                },
                            ].map((p) => {
                                const pct = Math.min(
                                    100,
                                    Math.round(
                                        (p.count / (totalQuestions || 1)) * 100,
                                    ),
                                );
                                return (
                                    <div key={p.key} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-foreground font-semibold">
                                                {p.name}
                                            </span>
                                            <span className="text-muted-foreground font-bold">
                                                {p.count} Qs ({pct}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
                                            <div
                                                style={{ width: `${pct}%` }}
                                                className={`h-full ${p.color} transition-all`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recent Questions Table */}
                <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-xs">
                    <div className="border-border bg-muted/20 flex items-center justify-between border-b p-5">
                        <div>
                            <h2 className="text-foreground text-sm font-bold">
                                Recent Questions
                            </h2>
                            <p className="text-muted-foreground text-xs">
                                Latest additions to the question bank
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/admin/questions">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 text-xs font-bold"
                                >
                                    <span>Browse All Questions</span>
                                    <ArrowRight className="size-3.5" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-muted/40 border-border text-muted-foreground border-b text-[11px] font-bold tracking-wider uppercase">
                                <tr>
                                    <th className="px-4 py-3">Code</th>
                                    <th className="px-4 py-3">
                                        Subject &amp; Topic
                                    </th>
                                    <th className="px-4 py-3">
                                        Clinical Stem Preview
                                    </th>
                                    <th className="px-4 py-3">Difficulty</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-border divide-y">
                                {recent_questions.map((q) => (
                                    <tr
                                        key={q.id}
                                        className="hover:bg-muted/20 transition-colors"
                                    >
                                        <td className="px-4 py-3.5 font-mono font-bold text-sky-600 dark:text-sky-400">
                                            {q.code}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="text-foreground font-semibold">
                                                {q.subject?.name}
                                            </div>
                                            <div className="text-muted-foreground text-[11px]">
                                                {q.topic?.name}
                                            </div>
                                        </td>
                                        <td
                                            className="text-muted-foreground max-w-md truncate px-4 py-3.5"
                                            title={q.stem}
                                        >
                                            {q.stem}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] font-extrabold ${
                                                    q.difficulty === 'EASY'
                                                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                        : q.difficulty ===
                                                            'MEDIUM'
                                                          ? 'border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                                                          : 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                                }`}
                                            >
                                                {q.difficulty}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <button
                                                onClick={() =>
                                                    handleToggleActive(q.id)
                                                }
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-all ${
                                                    q.is_active
                                                        ? 'bg-emerald-100 text-emerald-800 hover:opacity-80 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                        : 'bg-neutral-100 text-neutral-600 hover:opacity-80 dark:bg-neutral-800 dark:text-neutral-400'
                                                }`}
                                                title="Click to toggle Active/Draft"
                                            >
                                                <span
                                                    className={`size-1.5 rounded-full ${q.is_active ? 'bg-emerald-500' : 'bg-neutral-400'}`}
                                                />
                                                <span>
                                                    {q.is_active
                                                        ? 'Active'
                                                        : 'Draft'}
                                                </span>
                                            </button>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/questions/${q.id}/edit`}
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 px-2.5 text-[11px] font-semibold"
                                                    >
                                                        Edit
                                                    </Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Faculty Management Quick Access */}
                <div className="space-y-3">
                    <h2 className="text-foreground text-sm font-bold tracking-tight uppercase tracking-wider text-muted-foreground">
                        Faculty Content &amp; Platform Management
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Link
                            href="/admin/questions"
                            className="group border-border bg-card rounded-2xl border p-5 transition-all hover:border-[#0066FF]/60 hover:shadow-md"
                        >
                            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#0066FF] transition-transform group-hover:scale-110 dark:bg-blue-950/60">
                                <HelpCircle className="size-5" />
                            </div>
                            <h3 className="text-foreground text-sm font-bold">
                                MCQ Question Bank
                            </h3>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Browse, filter, and author high-yield questions with 3-tier clinical explanations.
                            </p>
                        </Link>

                        <Link
                            href="/admin/csq"
                            className="group border-border bg-card rounded-2xl border p-5 transition-all hover:border-cyan-500/60 hover:shadow-md"
                        >
                            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 transition-transform group-hover:scale-110 dark:bg-cyan-950/60">
                                <Stethoscope className="size-5" />
                            </div>
                            <h3 className="text-foreground text-sm font-bold">
                                Clinical Scenarios (CSQ)
                            </h3>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Construct multi-station clinical patient vignettes and management decisions.
                            </p>
                        </Link>

                        <Link
                            href="/admin/subjects"
                            className="group border-border bg-card rounded-2xl border p-5 transition-all hover:border-indigo-500/60 hover:shadow-md"
                        >
                            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110 dark:bg-indigo-950/60">
                                <BookOpen className="size-5" />
                            </div>
                            <h3 className="text-foreground text-sm font-bold">
                                19-Subject Curriculum
                            </h3>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Manage order indices, icons, and subject metadata across basic and clinical sciences.
                            </p>
                        </Link>

                        <Link
                            href="/admin/topics"
                            className="group border-border bg-card rounded-2xl border p-5 transition-all hover:border-sky-500/60 hover:shadow-md"
                        >
                            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-transform group-hover:scale-110 dark:bg-sky-950/60">
                                <Layers className="size-5" />
                            </div>
                            <h3 className="text-foreground text-sm font-bold">
                                Topics &amp; Subtopics
                            </h3>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Organize high-yield priority ratings (1-5 stars) and subtopic hierarchies.
                            </p>
                        </Link>

                        <Link
                            href="/admin/pathways"
                            className="group border-border bg-card rounded-2xl border p-5 transition-all hover:border-amber-500/60 hover:shadow-md"
                        >
                            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-110 dark:bg-amber-950/60">
                                <Award className="size-5" />
                            </div>
                            <h3 className="text-foreground text-sm font-bold">
                                Exam Pathways
                            </h3>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Configure negative marks, time limits, and national blueprints (MECEE, INI-CET, USMLE).
                            </p>
                        </Link>

                        <Link
                            href="/admin/inquiries"
                            className="group border-border bg-card rounded-2xl border p-5 transition-all hover:border-teal-500/60 hover:shadow-md"
                        >
                            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition-transform group-hover:scale-110 dark:bg-teal-950/60">
                                <Headset className="size-5" />
                            </div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-foreground text-sm font-bold">
                                    Support Helpdesk
                                </h3>
                                {(kpis.pending_inquiries || 0) > 0 && (
                                    <Badge className="bg-amber-500 text-white border-0 text-[10px]">
                                        {kpis.pending_inquiries} new
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Review candidate errata submissions, technical inquiries, and help requests.
                            </p>
                        </Link>

                        <Link
                            href="/admin/ratings"
                            className="group border-border bg-card rounded-2xl border p-5 transition-all hover:border-amber-500/60 hover:shadow-md"
                        >
                            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-110 dark:bg-amber-950/60">
                                <Star className="size-5 fill-current" />
                            </div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-foreground text-sm font-bold">
                                    Ratings &amp; Reviews
                                </h3>
                                <Badge variant="secondary" className="text-[10px] font-bold">
                                    {kpis.average_rating || 5.0} ★
                                </Badge>
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Audit candidate satisfaction scores, sentiment distribution, and app feedback.
                            </p>
                        </Link>

                        <Link
                            href="/admin/settings"
                            className="group border-border bg-card rounded-2xl border p-5 transition-all hover:border-emerald-500/60 hover:shadow-md"
                        >
                            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110 dark:bg-emerald-950/60">
                                <Globe className="size-5" />
                            </div>
                            <h3 className="text-foreground text-sm font-bold">
                                Global Settings
                            </h3>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Branding, SEO tags, legal disclaimers, support channels, and referral parameters.
                            </p>
                        </Link>
                    </div>
                </div>

                {/* Candidate Portal Web Features Launchpad */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-foreground text-sm font-bold tracking-tight uppercase tracking-wider text-muted-foreground">
                                All Web Features — Candidate Simulation &amp; Live Audit
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Instant access to audit, preview, and test candidate-facing examination modules
                            </p>
                        </div>
                        <Link href="/dashboard">
                            <Button size="sm" variant="outline" className="text-xs font-semibold rounded-xl">
                                Open Candidate Dashboard &rarr;
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        <Link
                            href="/qbank/runner"
                            className="group rounded-xl border border-border bg-card p-3.5 transition-all hover:border-sky-500 hover:shadow-2xs"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 mb-2 group-hover:scale-105 transition-transform">
                                <PlaySquare className="h-4 w-4" />
                            </div>
                            <h4 className="text-xs font-bold text-foreground truncate">Practice MCQs</h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">Interactive runner &amp; timer</p>
                        </Link>

                        <Link
                            href="/qbank"
                            className="group rounded-xl border border-border bg-card p-3.5 transition-all hover:border-sky-500 hover:shadow-2xs"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 mb-2 group-hover:scale-105 transition-transform">
                                <SlidersHorizontal className="h-4 w-4" />
                            </div>
                            <h4 className="text-xs font-bold text-foreground truncate">Test Builder</h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">Custom question block sets</p>
                        </Link>

                        <Link
                            href="/directory"
                            className="group rounded-xl border border-border bg-card p-3.5 transition-all hover:border-sky-500 hover:shadow-2xs"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 mb-2 group-hover:scale-105 transition-transform">
                                <BookOpen className="h-4 w-4" />
                            </div>
                            <h4 className="text-xs font-bold text-foreground truncate">19 Subjects</h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">Complete curriculum directory</p>
                        </Link>

                        <Link
                            href="/mock-exam"
                            className="group rounded-xl border border-border bg-card p-3.5 transition-all hover:border-sky-500 hover:shadow-2xs"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 mb-2 group-hover:scale-105 transition-transform">
                                <Landmark className="h-4 w-4" />
                            </div>
                            <h4 className="text-xs font-bold text-foreground truncate">Mock Exam Hall</h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">Timed simulation &amp; negative marks</p>
                        </Link>

                        <Link
                            href="/csq"
                            className="group rounded-xl border border-border bg-card p-3.5 transition-all hover:border-sky-500 hover:shadow-2xs"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400 mb-2 group-hover:scale-105 transition-transform">
                                <Stethoscope className="h-4 w-4" />
                            </div>
                            <h4 className="text-xs font-bold text-foreground truncate">CSQ Simulator</h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">Clinical Scenario Examination</p>
                        </Link>

                        <Link
                            href="/flashcards"
                            className="group rounded-xl border border-border bg-card p-3.5 transition-all hover:border-sky-500 hover:shadow-2xs"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 mb-2 group-hover:scale-105 transition-transform">
                                <Layers className="h-4 w-4" />
                            </div>
                            <h4 className="text-xs font-bold text-foreground truncate">Flashcards</h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">Clinical card memory deck</p>
                        </Link>

                        <Link
                            href="/play"
                            className="group rounded-xl border border-border bg-card p-3.5 transition-all hover:border-sky-500 hover:shadow-2xs"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 mb-2 group-hover:scale-105 transition-transform">
                                <Puzzle className="h-4 w-4" />
                            </div>
                            <h4 className="text-xs font-bold text-foreground truncate">Play Gaming Hub</h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">Medle, Synapses, Image Rush</p>
                        </Link>

                        <Link
                            href="/spaced-repetition"
                            className="group rounded-xl border border-border bg-card p-3.5 transition-all hover:border-sky-500 hover:shadow-2xs"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 mb-2 group-hover:scale-105 transition-transform">
                                <Repeat className="h-4 w-4" />
                            </div>
                            <h4 className="text-xs font-bold text-foreground truncate">Spaced Repetition</h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">SM-2 / FSRS retention engine</p>
                        </Link>

                        <Link
                            href="/planner"
                            className="group rounded-xl border border-border bg-card p-3.5 transition-all hover:border-sky-500 hover:shadow-2xs"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 mb-2 group-hover:scale-105 transition-transform">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <h4 className="text-xs font-bold text-foreground truncate">Study Planner</h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">Target exam milestone roadmap</p>
                        </Link>

                        <Link
                            href="/bookmarks"
                            className="group rounded-xl border border-border bg-card p-3.5 transition-all hover:border-sky-500 hover:shadow-2xs"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
                                <Bookmark className="h-4 w-4" />
                            </div>
                            <h4 className="text-xs font-bold text-foreground truncate">Bookmarks &amp; Notes</h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">Saved clinical annotations</p>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
