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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    const easyPct = Math.round(((difficulty_breakdown.EASY || 0) / totalQuestions) * 100);
    const medPct = Math.round(((difficulty_breakdown.MEDIUM || 0) / totalQuestions) * 100);
    const hardPct = Math.round(((difficulty_breakdown.HARD || 0) / totalQuestions) * 100);

    const handleToggleActive = (id: string) => {
        router.post(`/admin/questions/${id}/toggle-active`, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Faculty Admin Console — Cortex Medical" />

            <div className="flex flex-col gap-8 p-4 sm:p-6 lg:p-8 w-full max-w-full">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-300 mb-2">
                            <Activity className="size-3.5 text-sky-600 dark:text-sky-400" />
                            <span>Faculty Medical Administration Suite</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                            Cortex Content &amp; Curriculum Admin
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Author clinical vignette questions, calibrate 3-tier rationales, organize 19-subject curriculum, and audit candidate testing intelligence.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Link href="/admin/questions/create">
                            <Button className="bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs gap-1.5 shadow-md">
                                <Plus className="size-4" />
                                New Clinical MCQ
                            </Button>
                        </Link>
                        <Link href="/admin/subjects">
                            <Button variant="outline" className="text-xs font-bold gap-1.5 border-border">
                                <BookOpen className="size-3.5 text-sky-500" />
                                Manage Subjects
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* 6 Metric KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {/* KPI 1: Questions */}
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total MCQs</span>
                            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#0066FF]">
                                <HelpCircle className="size-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-black text-foreground">{kpis.total_questions}</div>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{kpis.active_questions} active</span>
                                <span>•</span>
                                <span className="font-semibold text-amber-600 dark:text-amber-400">{kpis.draft_questions} draft</span>
                            </div>
                        </div>
                    </div>

                    {/* KPI 2: Subjects */}
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Subjects</span>
                            <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                                <BookOpen className="size-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-black text-foreground">{kpis.total_subjects}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                                Full 19-Subject Blueprint
                            </div>
                        </div>
                    </div>

                    {/* KPI 3: Topics */}
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Topics</span>
                            <div className="flex size-7 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600">
                                <Layers className="size-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-black text-foreground">{kpis.total_topics}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                                {kpis.total_subtopics} Subtopics mapped
                            </div>
                        </div>
                    </div>

                    {/* KPI 4: Candidates */}
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Candidates</span>
                            <div className="flex size-7 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600">
                                <Users className="size-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-black text-foreground">{kpis.total_users}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                                Registered Doctors
                            </div>
                        </div>
                    </div>

                    {/* KPI 5: Attempts */}
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">MCQ Attempts</span>
                            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                                <CheckCircle2 className="size-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-black text-foreground">{kpis.total_attempts}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                                Clinical responses logged
                            </div>
                        </div>
                    </div>

                    {/* KPI 6: Mock Sessions */}
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Mock Exams</span>
                            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                                <Award className="size-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-black text-foreground">{kpis.total_sessions}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                                Full-length simulations
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Two Columns: Difficulty Calibration & Pathway Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left 6 Columns: Difficulty Calibration */}
                    <div className="lg:col-span-6 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-sm font-bold text-foreground">Difficulty Calibration</h2>
                                <p className="text-xs text-muted-foreground">Distribution across clinical vignette tiers</p>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-bold">
                                {kpis.total_questions} Questions
                            </Badge>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800 flex">
                            <div style={{ width: `${easyPct}%` }} className="bg-emerald-500 transition-all" title={`EASY: ${easyPct}%`} />
                            <div style={{ width: `${medPct}%` }} className="bg-blue-500 transition-all" title={`MEDIUM: ${medPct}%`} />
                            <div style={{ width: `${hardPct}%` }} className="bg-amber-500 transition-all" title={`HARD: ${hardPct}%`} />
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border/60 text-center">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    <span className="size-2 rounded-full bg-emerald-500" />
                                    <span>EASY</span>
                                </div>
                                <span className="text-lg font-black text-foreground mt-1">{difficulty_breakdown.EASY || 0}</span>
                                <span className="text-[10px] text-muted-foreground">{easyPct}%</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                                    <span className="size-2 rounded-full bg-blue-500" />
                                    <span>MEDIUM</span>
                                </div>
                                <span className="text-lg font-black text-foreground mt-1">{difficulty_breakdown.MEDIUM || 0}</span>
                                <span className="text-[10px] text-muted-foreground">{medPct}%</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                                    <span className="size-2 rounded-full bg-amber-500" />
                                    <span>HARD</span>
                                </div>
                                <span className="text-lg font-black text-foreground mt-1">{difficulty_breakdown.HARD || 0}</span>
                                <span className="text-[10px] text-muted-foreground">{hardPct}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Right 6 Columns: Pathway Coverage */}
                    <div className="lg:col-span-6 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-sm font-bold text-foreground">Postgraduate Pathway Mapping</h2>
                                <p className="text-xs text-muted-foreground">Questions tagged per entrance board</p>
                            </div>
                            <Link href="/admin/pathways" className="text-xs text-[#0066FF] font-bold hover:underline">
                                View Details →
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {[
                                { key: 'MECEE_PG', name: 'Nepal MECEE-PG (MD/MS)', count: pathway_breakdown.MECEE_PG || 0, color: 'bg-emerald-500' },
                                { key: 'INI_CET', name: 'India INI-CET (AIIMS/PGI)', count: pathway_breakdown.INI_CET || 0, color: 'bg-blue-500' },
                                { key: 'USMLE_STEP1', name: 'USA USMLE Step 1', count: pathway_breakdown.USMLE_STEP1 || 0, color: 'bg-indigo-500' },
                                { key: 'USMLE_STEP2CK', name: 'USA USMLE Step 2 CK', count: pathway_breakdown.USMLE_STEP2CK || 0, color: 'bg-purple-500' },
                                { key: 'COMBINED', name: 'Global Combined Track', count: pathway_breakdown.COMBINED || 0, color: 'bg-sky-500' },
                            ].map((p) => {
                                const pct = Math.min(100, Math.round((p.count / (totalQuestions || 1)) * 100));
                                return (
                                    <div key={p.key} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-foreground">{p.name}</span>
                                            <span className="font-bold text-muted-foreground">{p.count} Qs ({pct}%)</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
                                            <div style={{ width: `${pct}%` }} className={`h-full ${p.color} transition-all`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recent Questions Table */}
                <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
                        <div>
                            <h2 className="text-sm font-bold text-foreground">Recent Clinical Vignette MCQs</h2>
                            <p className="text-xs text-muted-foreground">Recently authored questions across the curriculum</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/admin/questions">
                                <Button variant="outline" size="sm" className="text-xs font-bold gap-1">
                                    <span>Browse All Questions</span>
                                    <ArrowRight className="size-3.5" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Code</th>
                                    <th className="py-3 px-4">Subject &amp; Topic</th>
                                    <th className="py-3 px-4">Clinical Stem Preview</th>
                                    <th className="py-3 px-4">Difficulty</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {recent_questions.map((q) => (
                                    <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                                            {q.code}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-semibold text-foreground">{q.subject?.name}</div>
                                            <div className="text-[11px] text-muted-foreground">{q.topic?.name}</div>
                                        </td>
                                        <td className="py-3.5 px-4 max-w-md truncate text-muted-foreground" title={q.stem}>
                                            {q.stem}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] font-extrabold ${
                                                    q.difficulty === 'EASY'
                                                        ? 'border-emerald-300 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40'
                                                        : q.difficulty === 'MEDIUM'
                                                        ? 'border-blue-300 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40'
                                                        : 'border-amber-300 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40'
                                                }`}
                                            >
                                                {q.difficulty}
                                            </Badge>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <button
                                                onClick={() => handleToggleActive(q.id)}
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-all ${
                                                    q.is_active
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:opacity-80'
                                                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:opacity-80'
                                                }`}
                                                title="Click to toggle Active/Draft"
                                            >
                                                <span className={`size-1.5 rounded-full ${q.is_active ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                                                <span>{q.is_active ? 'Active' : 'Draft'}</span>
                                            </button>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/questions/${q.id}/edit`}>
                                                    <Button size="sm" variant="outline" className="h-7 text-[11px] font-semibold px-2.5">
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

                {/* Quick Management Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/admin/questions" className="group rounded-2xl border border-border bg-card p-5 hover:border-[#0066FF]/60 hover:shadow-md transition-all">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] mb-3 group-hover:scale-110 transition-transform">
                            <HelpCircle className="size-5" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">MCQ Question Bank</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Browse, filter, and author high-yield questions with 3-tier clinical explanations.
                        </p>
                    </Link>

                    <Link href="/admin/subjects" className="group rounded-2xl border border-border bg-card p-5 hover:border-indigo-500/60 hover:shadow-md transition-all">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                            <BookOpen className="size-5" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">19-Subject Curriculum</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Manage order indices, icons, and subject metadata across basic and clinical sciences.
                        </p>
                    </Link>

                    <Link href="/admin/topics" className="group rounded-2xl border border-border bg-card p-5 hover:border-sky-500/60 hover:shadow-md transition-all">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 mb-3 group-hover:scale-110 transition-transform">
                            <Layers className="size-5" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Topics &amp; Subtopics</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Organize high-yield priority ratings (1-5 stars) and subtopic hierarchies.
                        </p>
                    </Link>

                    <Link href="/admin/users" className="group rounded-2xl border border-border bg-card p-5 hover:border-purple-500/60 hover:shadow-md transition-all">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 mb-3 group-hover:scale-110 transition-transform">
                            <Users className="size-5" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Candidate Directory</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Monitor registered candidates, active pathways, and toggle administrator roles.
                        </p>
                    </Link>
                </div>
            </div>
        </>
    );
}
