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
    const [expandedSubjectId, setExpandedSubjectId] = useState<number | null>(
        null,
    );

    const filteredSubjects = subjects.filter(
        (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.topics.some((t) =>
                t.name.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
    );

    const startSubjectPractice = (subjectId: number) => {
        router.visit(`/qbank/runner?subject_id=${subjectId}&limit=10`);
    };

    const startTopicPractice = (subjectId: number, topicId: number) => {
        router.visit(
            `/qbank/runner?subject_id=${subjectId}&topic_id=${topicId}&limit=10`,
        );
    };

    return (
        <div className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <Head title="19-Subject Medical Directory — Cortex Medical" />

            {/* Header */}
            <div className="border-border flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
                        19-Subject Medical Curriculum Directory
                    </h1>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                        Structured postgraduate medical blueprint covering
                        Pre-Clinical, Para-Clinical, and Clinical disciplines.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search subjects or topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-border bg-background h-9 w-60 rounded-lg border pr-3 pl-9 text-xs focus:ring-1 focus:ring-[#55BDEB] focus:outline-none"
                        />
                    </div>

                    <div className="border-border bg-muted flex rounded-lg border p-0.5">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`rounded-md p-1.5 text-xs transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            <LayoutGrid className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`rounded-md p-1.5 text-xs transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            <List className="size-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid or List View */}
            <div
                className={
                    viewMode === 'grid'
                        ? 'grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'
                        : 'flex flex-col gap-4'
                }
            >
                {filteredSubjects.map((sub) => {
                    const isExpanded = expandedSubjectId === sub.id;

                    return (
                        <div
                            key={sub.id}
                            className="border-border bg-card flex flex-col justify-between rounded-2xl border p-5 shadow-sm transition-all hover:border-[#55BDEB]/40 hover:shadow-md"
                        >
                            <div>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex size-9 items-center justify-center rounded-xl bg-[#102A43] text-xs font-bold text-[#55BDEB] dark:bg-[#55BDEB]/15">
                                            #{sub.order_index}
                                        </div>
                                        <div>
                                            <h3 className="text-foreground text-sm font-bold">
                                                {sub.name}
                                            </h3>
                                            <span className="text-muted-foreground text-[11px]">
                                                {sub.topics_count} Topics •{' '}
                                                {sub.total_questions} Questions
                                                Pool
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
                                        <div className="text-muted-foreground flex justify-between text-[11px]">
                                            <span>Curriculum Coverage</span>
                                            <span>
                                                {sub.coverage_percentage}%
                                            </span>
                                        </div>
                                        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                                            <div
                                                className="h-full rounded-full bg-indigo-500"
                                                style={{
                                                    width: `${sub.coverage_percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <div className="text-muted-foreground flex justify-between text-[11px]">
                                            <span>Mastery Accuracy</span>
                                            <span>
                                                {sub.mastery_percentage}%
                                            </span>
                                        </div>
                                        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                                            <div
                                                className="h-full rounded-full bg-[#2FB36F]"
                                                style={{
                                                    width: `${sub.mastery_percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Topics Expandable List */}
                                {isExpanded && sub.topics?.length > 0 && (
                                    <div className="border-border mt-4 flex flex-col gap-2 border-t pt-3">
                                        <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                                            High-Yield Topics:
                                        </span>
                                        <div className="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
                                            {sub.topics.map((topic) => (
                                                <div
                                                    key={topic.id}
                                                    className="border-border bg-muted/20 flex items-center justify-between rounded-lg border p-2 text-xs"
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-foreground font-semibold">
                                                            {topic.name}
                                                        </span>
                                                        {topic.priority >=
                                                            3 && (
                                                            <span className="py-0.2 rounded bg-amber-500/15 px-1.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
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
                                                        className="h-6 px-2 text-[10px] font-semibold text-[#55BDEB] hover:bg-[#55BDEB]/10"
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
                            <div className="border-border mt-5 flex items-center justify-between border-t pt-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setExpandedSubjectId(
                                            isExpanded ? null : sub.id,
                                        )
                                    }
                                    className="text-muted-foreground hover:text-foreground text-xs font-semibold"
                                >
                                    {isExpanded
                                        ? 'Collapse Topics'
                                        : `View Topics (${sub.topics?.length || 0})`}
                                </button>

                                <Button
                                    size="sm"
                                    onClick={() => startSubjectPractice(sub.id)}
                                    className="h-8 gap-1.5 bg-[#102A43] text-xs font-bold text-white hover:opacity-90 dark:bg-[#55BDEB] dark:text-neutral-950"
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
