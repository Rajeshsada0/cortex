import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Flame,
    Sparkles,
    Search,
    Clock,
    Check,
    CheckSquare,
    Square,
    BookOpen,
    Layers,
    ChevronDown,
    ChevronUp,
    ArrowRight,
    Star,
    Filter,
    RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TopicItem {
    id: number;
    name: string;
    slug: string;
    high_yield_priority: number;
    questions_count: number;
}

interface SubjectItem {
    id: number;
    name: string;
    slug: string;
    questions_count: number;
    topics: TopicItem[];
}

interface HighYieldIndexProps {
    user: any;
    activePathway: string;
    totalHyqCount: number;
    subjects: SubjectItem[];
}

export default function HighYieldIndex({
    user,
    activePathway,
    totalHyqCount,
    subjects = [],
}: HighYieldIndexProps) {
    const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
    const [mode, setMode] = useState<'TUTOR' | 'TIMED'>('TUTOR');
    const [questionCount, setQuestionCount] = useState<number>(25);
    const countOptions = [10, 15, 25, 50, 100];

    // Collapsed state per subject id (default: expanded)
    const [collapsedSubjects, setCollapsedSubjects] = useState<Record<number, boolean>>({});

    const toggleSubjectCollapse = (subjectId: number) => {
        setCollapsedSubjects((prev) => ({
            ...prev,
            [subjectId]: !prev[subjectId],
        }));
    };

    // Filter subjects and topics based on search query & subject filter
    const filteredSubjects = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return subjects
            .filter((sub) => {
                if (selectedSubjectFilter !== 'ALL' && sub.slug !== selectedSubjectFilter) {
                    return false;
                }
                return true;
            })
            .map((sub) => {
                if (!query) return sub;

                const matchingTopics = sub.topics.filter(
                    (t) =>
                        t.name.toLowerCase().includes(query) ||
                        sub.name.toLowerCase().includes(query)
                );

                return {
                    ...sub,
                    topics: matchingTopics,
                };
            })
            .filter((sub) => sub.topics.length > 0);
    }, [subjects, searchQuery, selectedSubjectFilter]);

    // Total available questions in selected topics
    const selectedStats = useMemo(() => {
        let totalQuestions = 0;
        const allTopics = subjects.flatMap((s) => s.topics);
        for (const topic of allTopics) {
            if (selectedTopicIds.includes(topic.id)) {
                totalQuestions += topic.questions_count;
            }
        }
        return {
            topicCount: selectedTopicIds.length,
            questionCount: totalQuestions,
        };
    }, [subjects, selectedTopicIds]);

    const toggleTopic = (id: number) => {
        setSelectedTopicIds((prev) =>
            prev.includes(id) ? prev.filter((tId) => tId !== id) : [...prev, id]
        );
    };

    const toggleAllTopicsInSubject = (subject: SubjectItem) => {
        const topicIds = subject.topics.map((t) => t.id);
        const allSelected = topicIds.every((id) => selectedTopicIds.includes(id));

        if (allSelected) {
            setSelectedTopicIds((prev) => prev.filter((id) => !topicIds.includes(id)));
        } else {
            setSelectedTopicIds((prev) => Array.from(new Set([...prev, ...topicIds])));
        }
    };

    const selectAllHighYieldTopics = () => {
        const allIds = filteredSubjects.flatMap((s) => s.topics.map((t) => t.id));
        setSelectedTopicIds(Array.from(new Set([...selectedTopicIds, ...allIds])));
    };

    const clearAllSelection = () => {
        setSelectedTopicIds([]);
    };

    const handleLaunch = () => {
        const params = new URLSearchParams();
        params.append('filter', 'high_yield');
        params.append('mode', mode);
        params.append('limit', questionCount.toString());

        if (selectedTopicIds.length > 0) {
            params.append('topic_ids', selectedTopicIds.join(','));
        }

        router.visit(`/qbank/runner?${params.toString()}`);
    };

    return (
        <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 pb-32">
            <Head title="High-Yield Questions (Topic-Wise) — Cortex Medical" />

            {/* Header */}
            <div className="flex flex-col justify-between gap-4 pb-2 sm:flex-row sm:items-center">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                        <Flame className="size-3.5 fill-amber-500 text-amber-500" />
                        <span>Core High-Yield Board Concepts</span>
                    </div>
                    <h1 className="font-heading text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                        High-Yield Questions by Topic
                    </h1>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
                        Select high-yield clinical topics across 19 medical disciplines for targeted high-yield question practice.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-1.5 font-mono text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                        Pathway:{' '}
                        <span className="ml-1 font-bold text-amber-700 dark:text-amber-400">
                            {activePathway}
                        </span>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                            {totalHyqCount}
                        </span>{' '}
                        Core HYQs
                    </div>
                </div>
            </div>

            {/* Step 1: Controls & Configuration Bar */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Search & Subject Filter */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search high-yield topics (e.g. coronary, stroke, sepsis, anemia)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-10 rounded-xl"
                            />
                        </div>
                        <select
                            value={selectedSubjectFilter}
                            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                            aria-label="Filter by subject"
                            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        >
                            <option value="ALL">All 19 Subjects</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.slug}>
                                    {s.name} ({s.questions_count} HYQs)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Quick Selection Actions */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={selectAllHighYieldTopics}
                                className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50/70 px-2.5 py-1 text-xs font-bold text-amber-800 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                            >
                                <CheckSquare className="h-3.5 w-3.5" />
                                <span>Select All Visible Topics</span>
                            </button>
                            {selectedTopicIds.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearAllSelection}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    <span>Clear ({selectedTopicIds.length})</span>
                                </button>
                            )}
                        </div>

                        <span className="text-xs text-muted-foreground">
                            {filteredSubjects.reduce((acc, s) => acc + s.topics.length, 0)} High-Yield Topics Available
                        </span>
                    </div>
                </div>

                {/* Mode & Question Limit */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    {/* Mode Toggle */}
                    <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                        <button
                            type="button"
                            onClick={() => setMode('TUTOR')}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition ${
                                mode === 'TUTOR'
                                    ? 'bg-white text-amber-700 shadow-xs dark:bg-slate-900 dark:text-amber-400'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                            }`}
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Tutor Mode</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('TIMED')}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition ${
                                mode === 'TIMED'
                                    ? 'bg-white text-amber-700 shadow-xs dark:bg-slate-900 dark:text-amber-400'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                            }`}
                        >
                            <Clock className="h-3.5 w-3.5" />
                            <span>Timed Block</span>
                        </button>
                    </div>

                    {/* Question Limit */}
                    <div className="mt-3">
                        <div className="text-[11px] font-bold text-muted-foreground uppercase">
                            Session Limit:
                        </div>
                        <div className="mt-1.5 flex gap-1.5">
                            {countOptions.map((cnt) => (
                                <button
                                    key={cnt}
                                    type="button"
                                    onClick={() => setQuestionCount(cnt)}
                                    className={`flex-1 rounded-lg border py-1 text-xs font-bold transition ${
                                        questionCount === cnt
                                            ? 'border-amber-600 bg-amber-600 text-white'
                                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                >
                                    {cnt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 2: Topic-Wise Selection Grouped by Subject */}
            <div className="space-y-4">
                {filteredSubjects.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                        <Filter className="mx-auto h-8 w-8 text-muted-foreground opacity-60" />
                        <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                            No matching high-yield topics found
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Try searching for another topic keyword or reset the subject filter.
                        </p>
                    </div>
                ) : (
                    filteredSubjects.map((subject) => {
                        const isCollapsed = !!collapsedSubjects[subject.id];
                        const subjectTopicIds = subject.topics.map((t) => t.id);
                        const selectedInSubjectCount = subjectTopicIds.filter((id) =>
                            selectedTopicIds.includes(id)
                        ).length;
                        const allSelected =
                            subjectTopicIds.length > 0 &&
                            selectedInSubjectCount === subjectTopicIds.length;

                        return (
                            <div
                                key={subject.id}
                                className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
                            >
                                {/* Subject Header */}
                                <div
                                    onClick={() => toggleSubjectCollapse(subject.id)}
                                    className="flex cursor-pointer items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3.5 transition hover:bg-slate-100/60 dark:border-slate-800 dark:bg-slate-800/40"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                                    {subject.name}
                                                </h3>
                                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                                                    {subject.questions_count} HYQs
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-muted-foreground">
                                                {subject.topics.length} High-Yield Topics • {selectedInSubjectCount} selected
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleAllTopicsInSubject(subject);
                                            }}
                                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                        >
                                            {allSelected ? 'Deselect All' : 'Select All Topics'}
                                        </button>
                                        <div className="p-1 text-muted-foreground">
                                            {isCollapsed ? (
                                                <ChevronDown className="h-5 w-5" />
                                            ) : (
                                                <ChevronUp className="h-5 w-5" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Topics Grid */}
                                {!isCollapsed && (
                                    <div className="grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {subject.topics.map((topic) => {
                                            const isSelected = selectedTopicIds.includes(topic.id);

                                            return (
                                                <div
                                                    key={topic.id}
                                                    onClick={() => toggleTopic(topic.id)}
                                                    className={`group relative flex cursor-pointer items-start justify-between rounded-xl border p-3 transition-all ${
                                                        isSelected
                                                            ? 'border-amber-500 bg-amber-50/80 shadow-xs ring-1 ring-amber-500/20 dark:border-amber-500 dark:bg-amber-950/40'
                                                            : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-2.5 pr-2">
                                                        <div className="mt-0.5">
                                                            {isSelected ? (
                                                                <div className="flex h-4 w-4 items-center justify-center rounded-md bg-amber-600 text-white">
                                                                    <Check className="h-3 w-3 stroke-[3]" />
                                                                </div>
                                                            ) : (
                                                                <div className="h-4 w-4 rounded-md border border-slate-300 group-hover:border-amber-400 dark:border-slate-700" />
                                                            )}
                                                        </div>

                                                        <div>
                                                            <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                                                                {topic.name}
                                                            </div>
                                                            <div className="mt-1.5 flex items-center gap-1.5">
                                                                {/* Star Priority */}
                                                                <span className="inline-flex items-center gap-0.5 rounded-sm bg-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                                                                    <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                                                                    Priority {topic.high_yield_priority}
                                                                </span>

                                                                <span className="text-[10px] font-semibold text-muted-foreground">
                                                                    {topic.questions_count} MCQs
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Sticky Launch Bar at Bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3.5 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                            <Flame className="h-5 w-5 fill-amber-500 text-amber-500" />
                        </div>
                        <div>
                            <div className="text-sm font-black text-slate-900 dark:text-white">
                                {selectedStats.topicCount > 0
                                    ? `${selectedStats.topicCount} High-Yield Topic${selectedStats.topicCount > 1 ? 's' : ''} Selected`
                                    : 'All High-Yield Topics Active'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {selectedStats.topicCount > 0
                                    ? `${selectedStats.questionCount} Available Questions • ${mode === 'TIMED' ? 'Timed Block' : 'Tutor Mode'}`
                                    : `Practice across entire ${totalHyqCount} high-yield question pool`}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            size="lg"
                            onClick={handleLaunch}
                            className="gap-2 rounded-xl bg-amber-600 px-6 font-bold text-white shadow-md hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500"
                        >
                            <span>
                                {selectedStats.topicCount > 0
                                    ? `Practice ${questionCount} HYQs`
                                    : `Solve High-Yield (${questionCount} Qs)`}
                            </span>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
