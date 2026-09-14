import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    BookOpen,
    PlaySquare,
    Search,
    LayoutGrid,
    List,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Layers,
    Target,
    HelpCircle,
    Info,
    X,
    ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface SubtopicData {
    name: string;
}

interface TopicData {
    id: number;
    name: string;
    slug: string;
    priority: number;
    subtopics: string[];
    questions_count: number;
}

interface SubjectData {
    id: number;
    name: string;
    slug: string;
    icon_key: string;
    order_index: number;
    total_questions: number;
    attempted_count: number;
    topics_count: number;
    coverage_percentage: number;
    mastery_percentage: number;
    topics: TopicData[];
}

interface DirectoryProps {
    user: any;
    subjects: SubjectData[];
}

export default function DirectoryIndex({ user, subjects }: DirectoryProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [expandedSubjectId, setExpandedSubjectId] = useState<number | null>(null);

    // Curriculum statistics
    const stats = useMemo(() => {
        const totalQuestions = subjects.reduce(
            (acc, s) => acc + (s.total_questions || 0),
            0,
        );
        const totalTopics = subjects.reduce(
            (acc, s) => acc + (s.topics_count || 0),
            0,
        );
        const avgMastery =
            subjects.length > 0
                ? Math.round(
                      subjects.reduce(
                          (acc, s) => acc + (s.mastery_percentage || 0),
                          0,
                      ) / subjects.length,
                  )
                : 0;
        const avgCoverage =
            subjects.length > 0
                ? Math.round(
                      subjects.reduce(
                          (acc, s) => acc + (s.coverage_percentage || 0),
                          0,
                      ) / subjects.length,
                  )
                : 0;

        return {
            totalSubjects: subjects.length,
            totalQuestions,
            totalTopics,
            avgMastery,
            avgCoverage,
        };
    }, [subjects]);

    const filteredSubjects = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return subjects;

        return subjects.filter(
            (s) =>
                s.name.toLowerCase().includes(query) ||
                s.topics?.some((t) => t.name.toLowerCase().includes(query)),
        );
    }, [subjects, searchQuery]);

    const startSubjectPractice = (subjectId: number) => {
        router.visit(`/qbank/runner?subject_id=${subjectId}&limit=10`);
    };

    const startTopicPractice = (subjectId: number, topicId: number) => {
        router.visit(
            `/qbank/runner?subject_id=${subjectId}&topic_id=${topicId}&limit=10`,
        );
    };

    return (
        <TooltipProvider delayDuration={150}>
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <Head title="19-Subject Medical Directory — Cortex Medical" />

                {/* Header Bar */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                                    <Sparkles className="h-3 w-3" />
                                    Postgraduate Curriculum
                                </span>
                                <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
                                    {stats.totalSubjects} Disciplines
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                19-Subject Medical Directory
                            </h1>
                        </div>

                        {/* Search & Layout Toggles */}
                        <div className="flex items-center gap-2.5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search subjects or topics..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-9 w-52 rounded-xl border border-border bg-background pl-8.5 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none sm:w-64"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center rounded-xl border border-border bg-muted/40 p-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={() => setViewMode('grid')}
                                            className={`rounded-lg p-1.5 transition-colors ${
                                                viewMode === 'grid'
                                                    ? 'bg-card text-foreground shadow-xs'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                            aria-label="Grid view"
                                        >
                                            <LayoutGrid className="h-4 w-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Grid layout</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={() => setViewMode('list')}
                                            className={`rounded-lg p-1.5 transition-colors ${
                                                viewMode === 'list'
                                                    ? 'bg-card text-foreground shadow-xs'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                            aria-label="List view"
                                        >
                                            <List className="h-4 w-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Compact list layout</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Minimal Statistics Strip */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {/* Total Disciplines */}
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-mono text-2xl font-bold text-foreground">
                                    {stats.totalSubjects}
                                </div>
                                <p className="text-xs text-muted-foreground">Disciplines</p>
                            </div>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-foreground"
                                    aria-label="Disciplines info"
                                >
                                    <Info className="h-4 w-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Full 19-discipline curriculum mapped to national blueprint
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Total Questions Pool */}
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                <HelpCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-mono text-2xl font-bold text-foreground">
                                    {stats.totalQuestions.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">Question Pool</p>
                            </div>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-foreground"
                                    aria-label="Question pool info"
                                >
                                    <Info className="h-4 w-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Total verified high-yield clinical MCQs
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* High-Yield Topics */}
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Layers className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-mono text-2xl font-bold text-foreground">
                                    {stats.totalTopics}
                                </div>
                                <p className="text-xs text-muted-foreground">High-Yield Topics</p>
                            </div>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-foreground"
                                    aria-label="Topics info"
                                >
                                    <Info className="h-4 w-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                High-priority sub-specialty clinical topics
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Average Mastery */}
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Target className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-mono text-2xl font-bold text-foreground">
                                    {stats.avgMastery}%
                                </div>
                                <p className="text-xs text-muted-foreground">Avg Mastery</p>
                            </div>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-foreground"
                                    aria-label="Mastery info"
                                >
                                    <Info className="h-4 w-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Candidate average mastery accuracy across all attempted subjects
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Empty State */}
                {filteredSubjects.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <Search className="h-6 w-6" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-foreground">
                            No disciplines found
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            No subjects or topics matched &ldquo;{searchQuery}&rdquo;.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSearchQuery('')}
                            className="mt-4 h-8 text-xs"
                        >
                            Reset Search
                        </Button>
                    </div>
                )}

                {/* Grid View */}
                {viewMode === 'grid' && filteredSubjects.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredSubjects.map((sub) => {
                            const isExpanded = expandedSubjectId === sub.id;

                            return (
                                <div
                                    key={sub.id}
                                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-border/80 hover:shadow-sm"
                                >
                                    <div>
                                        {/* Card Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted font-mono text-xs font-bold text-foreground">
                                                    #{sub.order_index}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-foreground">
                                                        {sub.name}
                                                    </h3>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {sub.topics_count} Topics • {sub.total_questions} Questions
                                                    </span>
                                                </div>
                                            </div>

                                            <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                                                {sub.mastery_percentage}%
                                            </span>
                                        </div>

                                        {/* Progress Metrics */}
                                        <div className="mt-4 space-y-2.5">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[11px] text-muted-foreground">
                                                    <span>Coverage</span>
                                                    <span className="font-mono font-medium">
                                                        {sub.coverage_percentage}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-indigo-500 transition-all duration-300 dark:bg-indigo-400"
                                                        style={{ width: `${Math.min(100, sub.coverage_percentage)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[11px] text-muted-foreground">
                                                    <span>Mastery</span>
                                                    <span className="font-mono font-medium">
                                                        {sub.mastery_percentage}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-emerald-500 transition-all duration-300 dark:bg-emerald-400"
                                                        style={{ width: `${Math.min(100, sub.mastery_percentage)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Topics Expandable Drawer */}
                                        {isExpanded && sub.topics?.length > 0 && (
                                            <div className="mt-4 space-y-2 border-t border-border pt-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-semibold text-muted-foreground">
                                                        High-Yield Topics
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {sub.topics.length} items
                                                    </span>
                                                </div>

                                                <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                                                    {sub.topics.map((topic) => (
                                                        <div
                                                            key={topic.id}
                                                            className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs transition hover:bg-muted/60"
                                                        >
                                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                                <span className="truncate font-medium text-foreground">
                                                                    {topic.name}
                                                                </span>
                                                                {topic.priority >= 3 && (
                                                                    <span className="shrink-0 rounded bg-amber-500/15 px-1 py-0.2 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                                                        HY
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() =>
                                                                            startTopicPractice(
                                                                                sub.id,
                                                                                topic.id,
                                                                            )
                                                                        }
                                                                        className="h-6 px-2 text-[11px] font-semibold text-cyan-600 hover:bg-cyan-500/10 hover:text-cyan-700 dark:text-cyan-400"
                                                                    >
                                                                        <span>Practice</span>
                                                                        <ArrowUpRight className="ml-1 h-3 w-3" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="left">
                                                                    Practice {topic.name}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Footer Actions */}
                                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandedSubjectId(
                                                    isExpanded ? null : sub.id,
                                                )
                                            }
                                            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                                        >
                                            {isExpanded ? (
                                                <>
                                                    <span>Hide Topics</span>
                                                    <ChevronUp className="h-3.5 w-3.5" />
                                                </>
                                            ) : (
                                                <>
                                                    <span>Topics ({sub.topics?.length || 0})</span>
                                                    <ChevronDown className="h-3.5 w-3.5" />
                                                </>
                                            )}
                                        </button>

                                        <Button
                                            size="sm"
                                            onClick={() => startSubjectPractice(sub.id)}
                                            className="h-8 gap-1.5 rounded-xl bg-cyan-600 px-3 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
                                        >
                                            <PlaySquare className="h-3.5 w-3.5" />
                                            <span>Practice</span>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && filteredSubjects.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
                        <div className="divide-y divide-border">
                            {filteredSubjects.map((sub) => {
                                const isExpanded = expandedSubjectId === sub.id;

                                return (
                                    <div key={sub.id} className="p-4 transition hover:bg-muted/20">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            {/* Subject Identity */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted font-mono text-xs font-bold text-foreground">
                                                    #{sub.order_index}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-foreground">
                                                        {sub.name}
                                                    </h3>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {sub.topics_count} Topics • {sub.total_questions} Questions Pool
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Progress Indicators & Action Buttons */}
                                            <div className="flex items-center gap-4 sm:gap-6">
                                                <div className="flex items-center gap-4 text-xs">
                                                    <div className="w-24 space-y-1">
                                                        <div className="flex justify-between text-[10px] text-muted-foreground">
                                                            <span>Cov</span>
                                                            <span className="font-mono">{sub.coverage_percentage}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400"
                                                                style={{ width: `${Math.min(100, sub.coverage_percentage)}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="w-24 space-y-1">
                                                        <div className="flex justify-between text-[10px] text-muted-foreground">
                                                            <span>Mast</span>
                                                            <span className="font-mono text-emerald-600 dark:text-emerald-400">
                                                                {sub.mastery_percentage}%
                                                            </span>
                                                        </div>
                                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
                                                                style={{ width: `${Math.min(100, sub.mastery_percentage)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            setExpandedSubjectId(
                                                                isExpanded ? null : sub.id,
                                                            )
                                                        }
                                                        className="h-8 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                                                    >
                                                        <span>{sub.topics?.length || 0}</span>
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <ChevronDown className="h-3.5 w-3.5" />
                                                        )}
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        onClick={() => startSubjectPractice(sub.id)}
                                                        className="h-8 gap-1.5 rounded-xl bg-cyan-600 px-3 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
                                                    >
                                                        <PlaySquare className="h-3.5 w-3.5" />
                                                        <span>Practice</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Topics in List View */}
                                        {isExpanded && sub.topics?.length > 0 && (
                                            <div className="mt-3 grid grid-cols-1 gap-2 border-t border-border pt-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {sub.topics.map((topic) => (
                                                    <div
                                                        key={topic.id}
                                                        className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs transition hover:bg-muted/60"
                                                    >
                                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                                            <span className="truncate font-medium text-foreground">
                                                                {topic.name}
                                                            </span>
                                                            {topic.priority >= 3 && (
                                                                <span className="shrink-0 rounded bg-amber-500/15 px-1 py-0.2 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                                                    HY
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                startTopicPractice(
                                                                    sub.id,
                                                                    topic.id,
                                                                )
                                                            }
                                                            className="h-6 px-1.5 text-[11px] font-semibold text-cyan-600 hover:bg-cyan-500/10 hover:text-cyan-700 dark:text-cyan-400"
                                                        >
                                                            Practice →
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}
