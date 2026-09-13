import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Layers,
    Plus,
    Edit2,
    Trash2,
    Star,
    ChevronDown,
    ChevronRight,
    HelpCircle,
    BookOpen,
    AlertTriangle,
    Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface SubtopicItem {
    id: number;
    topic_id: number;
    name: string;
}

interface TopicItem {
    id: number;
    subject_id: number;
    name: string;
    slug: string;
    high_yield_priority: number;
    questions_count: number;
    subject: { id: number; name: string; slug: string };
    subtopics: SubtopicItem[];
}

interface SubjectOption {
    id: number;
    name: string;
}

interface TopicsIndexProps {
    topics: TopicItem[];
    subjects: SubjectOption[];
    selected_subject_id: number | null;
}

export default function TopicsIndex({
    topics,
    subjects,
    selected_subject_id,
}: TopicsIndexProps) {
    const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState<TopicItem | null>(null);
    const [subjectId, setSubjectId] = useState<number>(
        selected_subject_id || (subjects[0]?.id ?? 1),
    );
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [priority, setPriority] = useState(3);
    const [processing, setProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Expanded topics for subtopic management
    const [expandedTopicIds, setExpandedTopicIds] = useState<
        Record<number, boolean>
    >({});
    const [newSubtopicName, setNewSubtopicName] = useState<
        Record<number, string>
    >({});

    const toggleExpand = (topicId: number) => {
        setExpandedTopicIds((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
    };

    const handleSubjectFilterChange = (id: string) => {
        if (id) {
            router.get(
                '/admin/topics',
                { subject_id: id },
                { preserveState: true },
            );
        } else {
            router.get('/admin/topics', {}, { preserveState: true });
        }
    };

    const openCreateTopicDialog = () => {
        setEditingTopic(null);
        setSubjectId(selected_subject_id || (subjects[0]?.id ?? 1));
        setName('');
        setSlug('');
        setPriority(3);
        setErrorMsg('');
        setIsTopicDialogOpen(true);
    };

    const openEditTopicDialog = (topic: TopicItem) => {
        setEditingTopic(topic);
        setSubjectId(topic.subject_id);
        setName(topic.name);
        setSlug(topic.slug);
        setPriority(topic.high_yield_priority || 3);
        setErrorMsg('');
        setIsTopicDialogOpen(true);
    };

    const handleTopicSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrorMsg('');

        if (editingTopic) {
            router.put(
                `/admin/topics/${editingTopic.id}`,
                {
                    subject_id: subjectId,
                    name,
                    slug,
                    high_yield_priority: priority,
                },
                {
                    onSuccess: () => {
                        setIsTopicDialogOpen(false);
                        setProcessing(false);
                    },
                    onError: (errs) => {
                        setProcessing(false);
                        setErrorMsg(Object.values(errs)[0] as string);
                    },
                },
            );
        } else {
            router.post(
                '/admin/topics',
                {
                    subject_id: subjectId,
                    name,
                    slug,
                    high_yield_priority: priority,
                },
                {
                    onSuccess: () => {
                        setIsTopicDialogOpen(false);
                        setProcessing(false);
                    },
                    onError: (errs) => {
                        setProcessing(false);
                        setErrorMsg(Object.values(errs)[0] as string);
                    },
                },
            );
        }
    };

    const handleDeleteTopic = (topic: TopicItem) => {
        if (confirm(`Delete topic "${topic.name}" and all its subtopics?`)) {
            router.delete(`/admin/topics/${topic.id}`);
        }
    };

    const handleAddSubtopic = (topicId: number) => {
        const subName = newSubtopicName[topicId]?.trim();
        if (!subName) return;

        router.post(
            `/admin/topics/${topicId}/subtopics`,
            { name: subName },
            {
                onSuccess: () => {
                    setNewSubtopicName((prev) => ({ ...prev, [topicId]: '' }));
                },
            },
        );
    };

    const handleDeleteSubtopic = (subtopicId: number) => {
        if (confirm('Delete this subtopic?')) {
            router.delete(`/admin/subtopics/${subtopicId}`);
        }
    };

    return (
        <>
            <Head title="Manage Topics & Subtopics — Cortex Admin" />

            <div className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="border-border flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-1 inline-flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400">
                            <Layers className="size-4" />
                            <span>
                                Curriculum Classification &amp; High-Yield
                                Priority Matrix
                            </span>
                        </div>
                        <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                            Topics &amp; Subtopics Hierarchy
                        </h1>
                        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                            Organize high-yield chapters, calibrate priority
                            star ratings, and map granular subtopics for
                            adaptive testing.
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                        <Button
                            onClick={openCreateTopicDialog}
                            className="gap-1.5 bg-[#0066FF] text-xs font-bold text-white shadow-md hover:bg-[#0052cc]"
                        >
                            <Plus className="size-4" />
                            New Topic
                        </Button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="border-border bg-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 shadow-xs">
                    <div className="flex items-center gap-2.5">
                        <Label
                            htmlFor="filter-subject"
                            className="text-muted-foreground shrink-0 text-xs font-bold"
                        >
                            Filter by Subject:
                        </Label>
                        <select
                            id="filter-subject"
                            value={selected_subject_id || ''}
                            onChange={(e) =>
                                handleSubjectFilterChange(e.target.value)
                            }
                            className="border-border bg-background text-foreground rounded-xl border px-3 py-1.5 text-xs font-semibold focus:border-[#0066FF] focus:outline-none"
                        >
                            <option value="">All 19 Subjects</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="text-muted-foreground text-xs font-bold">
                        Showing {topics.length} topics
                    </div>
                </div>

                {/* Topics List Table */}
                <div className="space-y-3">
                    {topics.length === 0 ? (
                        <div className="border-border bg-card rounded-2xl border border-dashed p-12 text-center">
                            <Layers className="text-muted-foreground mx-auto mb-3 size-10 opacity-50" />
                            <h3 className="text-foreground text-sm font-bold">
                                No Topics Found
                            </h3>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Create your first topic for this subject or
                                clear your filter.
                            </p>
                            <Button
                                onClick={openCreateTopicDialog}
                                size="sm"
                                className="mt-4 bg-[#0066FF] text-xs font-bold text-white"
                            >
                                <Plus className="mr-1 size-3.5" /> Add Topic
                            </Button>
                        </div>
                    ) : (
                        topics.map((topic) => {
                            const isExpanded = Boolean(
                                expandedTopicIds[topic.id],
                            );
                            return (
                                <div
                                    key={topic.id}
                                    className="border-border bg-card overflow-hidden rounded-2xl border shadow-xs transition-all"
                                >
                                    <div className="bg-card hover:bg-muted/10 flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() =>
                                                    toggleExpand(topic.id)
                                                }
                                                className="border-border bg-muted/30 text-muted-foreground hover:bg-muted flex size-7 items-center justify-center rounded-lg border transition-colors"
                                                title="Expand subtopics"
                                            >
                                                {isExpanded ? (
                                                    <ChevronDown className="size-4" />
                                                ) : (
                                                    <ChevronRight className="size-4" />
                                                )}
                                            </button>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-foreground text-sm font-bold">
                                                        {topic.name}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="font-mono text-[10px] font-medium"
                                                    >
                                                        {topic.subject?.name}
                                                    </Badge>
                                                </div>
                                                <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-xs">
                                                    <span className="font-mono text-[11px]">
                                                        {topic.slug}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {topic.subtopics
                                                            ?.length || 0}{' '}
                                                        Subtopics
                                                    </span>
                                                    <span>•</span>
                                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                        {topic.questions_count ||
                                                            0}{' '}
                                                        Qs
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* High Yield Priority Stars */}
                                            <div
                                                className="flex items-center gap-0.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 dark:border-amber-800/60 dark:bg-amber-950/40"
                                                title={`Priority ${topic.high_yield_priority}/5`}
                                            >
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`size-3 ${
                                                            star <=
                                                            (topic.high_yield_priority ||
                                                                3)
                                                                ? 'fill-amber-400 text-amber-500'
                                                                : 'text-amber-200 dark:text-neutral-700'
                                                        }`}
                                                    />
                                                ))}
                                                <span className="ml-1 text-[10px] font-black text-amber-800 dark:text-amber-300">
                                                    HY-
                                                    {topic.high_yield_priority}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-2 text-xs font-semibold hover:text-sky-600"
                                                    onClick={() =>
                                                        openEditTopicDialog(
                                                            topic,
                                                        )
                                                    }
                                                >
                                                    <Edit2 className="mr-1 size-3.5" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-destructive hover:bg-destructive/10 h-8 px-2 text-xs font-semibold"
                                                    onClick={() =>
                                                        handleDeleteTopic(topic)
                                                    }
                                                >
                                                    <Trash2 className="mr-1 size-3.5" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subtopics Drawer */}
                                    {isExpanded && (
                                        <div className="border-border bg-muted/20 border-t p-4 sm:p-5">
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="text-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                                    <Tag className="size-3.5 text-sky-500" />
                                                    <span>
                                                        Subtopics for{' '}
                                                        {topic.name}
                                                    </span>
                                                </span>
                                            </div>

                                            {/* Subtopic Badges */}
                                            <div className="mb-4 flex flex-wrap gap-2">
                                                {topic.subtopics &&
                                                topic.subtopics.length > 0 ? (
                                                    topic.subtopics.map(
                                                        (sub) => (
                                                            <div
                                                                key={sub.id}
                                                                className="border-border bg-card text-foreground inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium shadow-2xs"
                                                            >
                                                                <span>
                                                                    {sub.name}
                                                                </span>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDeleteSubtopic(
                                                                            sub.id,
                                                                        )
                                                                    }
                                                                    className="text-muted-foreground hover:text-destructive ml-1 transition-colors"
                                                                    title="Delete Subtopic"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ),
                                                    )
                                                ) : (
                                                    <span className="text-muted-foreground text-xs italic">
                                                        No subtopics yet. Add
                                                        one below.
                                                    </span>
                                                )}
                                            </div>

                                            {/* Add Subtopic Form */}
                                            <div className="flex max-w-md items-center gap-2">
                                                <Input
                                                    value={
                                                        newSubtopicName[
                                                            topic.id
                                                        ] || ''
                                                    }
                                                    onChange={(e) =>
                                                        setNewSubtopicName(
                                                            (prev) => ({
                                                                ...prev,
                                                                [topic.id]:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    placeholder="Add granular subtopic (e.g., Aortic Dissection)..."
                                                    className="h-8 text-xs"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddSubtopic(
                                                                topic.id,
                                                            );
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleAddSubtopic(
                                                            topic.id,
                                                        )
                                                    }
                                                    className="h-8 shrink-0 bg-[#0066FF] px-3 text-xs font-bold text-white hover:bg-[#0052cc]"
                                                >
                                                    <Plus className="mr-1 size-3" />{' '}
                                                    Add
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Create / Edit Topic Dialog */}
                <Dialog
                    open={isTopicDialogOpen}
                    onOpenChange={setIsTopicDialogOpen}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">
                                {editingTopic
                                    ? 'Edit Topic'
                                    : 'Add New Curriculum Topic'}
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Configure topic metadata and postgraduate
                                high-yield weight.
                            </DialogDescription>
                        </DialogHeader>

                        <form
                            onSubmit={handleTopicSubmit}
                            className="space-y-4 py-2"
                        >
                            {errorMsg && (
                                <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-xl border p-3 text-xs">
                                    <AlertTriangle className="size-4 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="topic-subject"
                                    className="text-xs font-bold"
                                >
                                    Parent Subject
                                </Label>
                                <select
                                    id="topic-subject"
                                    value={subjectId}
                                    onChange={(e) =>
                                        setSubjectId(parseInt(e.target.value))
                                    }
                                    className="border-border bg-background text-foreground w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:border-[#0066FF] focus:outline-none"
                                >
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="topic-name"
                                    className="text-xs font-bold"
                                >
                                    Topic Name
                                </Label>
                                <Input
                                    id="topic-name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (!editingTopic) {
                                            setSlug(
                                                e.target.value
                                                    .toLowerCase()
                                                    .replace(/[^a-z0-9]+/g, '-')
                                                    .replace(/^-|-$/g, ''),
                                            );
                                        }
                                    }}
                                    placeholder="e.g., Acute Coronary Syndromes"
                                    required
                                    className="text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="topic-slug"
                                    className="text-xs font-bold"
                                >
                                    URL Slug
                                </Label>
                                <Input
                                    id="topic-slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="e.g., acute-coronary-syndromes"
                                    required
                                    className="font-mono text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="topic-priority"
                                    className="text-xs font-bold"
                                >
                                    High-Yield Priority (1 to 5 Stars)
                                </Label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <button
                                            type="button"
                                            key={val}
                                            onClick={() => setPriority(val)}
                                            className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                                                priority === val
                                                    ? 'border-amber-400 bg-amber-50 text-amber-800 shadow-xs dark:bg-amber-950/60 dark:text-amber-300'
                                                    : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                                            }`}
                                        >
                                            <Star
                                                className={`size-3 ${priority >= val ? 'fill-amber-400 text-amber-500' : 'text-neutral-400'}`}
                                            />
                                            <span>{val}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsTopicDialogOpen(false)}
                                    className="text-xs font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#0066FF] text-xs font-bold text-white hover:bg-[#0052cc]"
                                >
                                    {editingTopic
                                        ? 'Save Changes'
                                        : 'Create Topic'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
