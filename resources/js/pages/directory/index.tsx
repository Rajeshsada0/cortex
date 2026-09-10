import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    PlaySquare,
    ChevronRight,
    Search,
    SlidersHorizontal,
    LayoutGrid,
    List,
    Sparkles,
    CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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

    const filteredSubjects = subjects.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.topics.some((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const startSubjectPractice = (subjectId: number) => {
        router.visit(`/qbank/runner?subject_id=${subjectId}&limit=10`);
    };

    const startTopicPractice = (subjectId: number, topicId: number) => {
        router.visit(`/qbank/runner?subject_id=${subjectId}&topic_id=${topicId}&limit=10`);
    };

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full">
            <Head title="19-Subject Medical Directory — Cortex Medical" />

            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                        19-Subject Medical Curriculum Directory
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Structured postgraduate medical blueprint covering Pre-Clinical, Para-Clinical, and Clinical disciplines.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search subjects or topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 w-60 rounded-lg border border-border bg-background pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#55BDEB]"
                        />
                    </div>

                    <div className="flex rounded-lg border border-border bg-muted p-0.5">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md text-xs transition-colors ${
                                viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                            }`}
                        >
                            <LayoutGrid className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md text-xs transition-colors ${
                                viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                            }`}
                        >
                            <List className="size-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid or List View */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-4'}>
                {filteredSubjects.map((sub) => {
                    const isExpanded = expandedSubjectId === sub.id;

                    return (
                        <div
                            key={sub.id}
                            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-[#55BDEB]/40 hover:shadow-md"
                        >
                            <div>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex size-9 items-center justify-center rounded-xl bg-[#102A43] dark:bg-[#55BDEB]/15 text-[#55BDEB] font-bold text-xs">
                                            #{sub.order_index}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-foreground">
                                                {sub.name}
                                            </h3>
                                            <span className="text-[11px] text-muted-foreground">
                                                {sub.topics_count} Topics • {sub.total_questions} Questions Pool
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-extrabold text-[#55BDEB]">
                                        {sub.mastery_percentage}%
                                    </span>
                                </div>

                                {/* Progress Bars */}
                                <div className="mt-4 flex flex-col gap-2">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between text-[11px] text-muted-foreground">
                                            <span>Curriculum Coverage</span>
                                            <span>{sub.coverage_percentage}%</span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-indigo-500"
                                                style={{ width: `${sub.coverage_percentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between text-[11px] text-muted-foreground">
                                            <span>Mastery Accuracy</span>
                                            <span>{sub.mastery_percentage}%</span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-[#2FB36F]"
                                                style={{ width: `${sub.mastery_percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Topics Expandable List */}
                                {isExpanded && sub.topics?.length > 0 && (
                                    <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3">
                                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                            High-Yield Topics:
                                        </span>
                                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                                            {sub.topics.map((topic) => (
                                                <div
                                                    key={topic.id}
                                                    className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2 text-xs"
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-foreground">
                                                            {topic.name}
                                                        </span>
                                                        {topic.priority >= 3 && (
                                                            <span className="rounded bg-amber-500/15 px-1.5 py-0.2 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                                                HY
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => startTopicPractice(sub.id, topic.id)}
                                                        className="h-6 px-2 text-[10px] text-[#55BDEB] hover:bg-[#55BDEB]/10 font-semibold"
                                                    >
                                                        Solve →
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Card Footer Actions */}
                            <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
                                <button
                                    type="button"
                                    onClick={() => setExpandedSubjectId(isExpanded ? null : sub.id)}
                                    className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                                >
                                    {isExpanded ? 'Collapse Topics' : `View Topics (${sub.topics?.length || 0})`}
                                </button>

                                <Button
                                    size="sm"
                                    onClick={() => startSubjectPractice(sub.id)}
                                    className="h-8 gap-1.5 bg-[#102A43] dark:bg-[#55BDEB] text-white dark:text-neutral-950 font-bold hover:opacity-90 text-xs"
                                >
                                    <PlaySquare className="size-3.5" />
                                    Practice Subject
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
