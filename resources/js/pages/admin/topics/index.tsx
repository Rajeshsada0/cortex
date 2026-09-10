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

export default function TopicsIndex({ topics, subjects, selected_subject_id }: TopicsIndexProps) {
    const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState<TopicItem | null>(null);
    const [subjectId, setSubjectId] = useState<number>(selected_subject_id || (subjects[0]?.id ?? 1));
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [priority, setPriority] = useState(3);
    const [processing, setProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Expanded topics for subtopic management
    const [expandedTopicIds, setExpandedTopicIds] = useState<Record<number, boolean>>({});
    const [newSubtopicName, setNewSubtopicName] = useState<Record<number, string>>({});

    const toggleExpand = (topicId: number) => {
        setExpandedTopicIds((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
    };

    const handleSubjectFilterChange = (id: string) => {
        if (id) {
            router.get('/admin/topics', { subject_id: id }, { preserveState: true });
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
                { subject_id: subjectId, name, slug, high_yield_priority: priority },
                {
                    onSuccess: () => {
                        setIsTopicDialogOpen(false);
                        setProcessing(false);
                    },
                    onError: (errs) => {
                        setProcessing(false);
                        setErrorMsg(Object.values(errs)[0] as string);
                    },
                }
            );
        } else {
            router.post(
                '/admin/topics',
                { subject_id: subjectId, name, slug, high_yield_priority: priority },
                {
                    onSuccess: () => {
                        setIsTopicDialogOpen(false);
                        setProcessing(false);
                    },
                    onError: (errs) => {
                        setProcessing(false);
                        setErrorMsg(Object.values(errs)[0] as string);
                    },
                }
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
            }
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

            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 mb-1">
                            <Layers className="size-4" />
                            <span>Curriculum Classification &amp; High-Yield Priority Matrix</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                            Topics &amp; Subtopics Hierarchy
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Organize high-yield chapters, calibrate priority star ratings, and map granular subtopics for adaptive testing.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Button onClick={openCreateTopicDialog} className="bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs gap-1.5 shadow-md">
                            <Plus className="size-4" />
                            New Topic
                        </Button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
                    <div className="flex items-center gap-2.5">
                        <Label htmlFor="filter-subject" className="text-xs font-bold text-muted-foreground shrink-0">
                            Filter by Subject:
                        </Label>
                        <select
                            id="filter-subject"
                            value={selected_subject_id || ''}
                            onChange={(e) => handleSubjectFilterChange(e.target.value)}
                            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:border-[#0066FF] focus:outline-none"
                        >
                            <option value="">All 19 Subjects</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="text-xs font-bold text-muted-foreground">
                        Showing {topics.length} topics
                    </div>
                </div>

                {/* Topics List Table */}
                <div className="space-y-3">
                    {topics.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                            <Layers className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <h3 className="text-sm font-bold text-foreground">No Topics Found</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                Create your first topic for this subject or clear your filter.
                            </p>
                            <Button onClick={openCreateTopicDialog} size="sm" className="mt-4 bg-[#0066FF] text-white text-xs font-bold">
                                <Plus className="size-3.5 mr-1" /> Add Topic
                            </Button>
                        </div>
                    ) : (
                        topics.map((topic) => {
                            const isExpanded = Boolean(expandedTopicIds[topic.id]);
                            return (
                                <div
                                    key={topic.id}
                                    className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden transition-all"
                                >
                                    <div className="flex items-center justify-between p-4 bg-card hover:bg-muted/10">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleExpand(topic.id)}
                                                className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground hover:bg-muted transition-colors"
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
                                                    <span className="font-bold text-foreground text-sm">{topic.name}</span>
                                                    <Badge variant="outline" className="text-[10px] font-mono font-medium">
                                                        {topic.subject?.name}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                    <span className="font-mono text-[11px]">{topic.slug}</span>
                                                    <span>•</span>
                                                    <span>{topic.subtopics?.length || 0} Subtopics</span>
                                                    <span>•</span>
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{topic.questions_count || 0} Qs</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* High Yield Priority Stars */}
                                            <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-full px-2.5 py-1" title={`Priority ${topic.high_yield_priority}/5`}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`size-3 ${
                                                            star <= (topic.high_yield_priority || 3)
                                                                ? 'fill-amber-400 text-amber-500'
                                                                : 'text-amber-200 dark:text-neutral-700'
                                                        }`}
                                                    />
                                                ))}
                                                <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 ml-1">
                                                    HY-{topic.high_yield_priority}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-2 text-xs font-semibold hover:text-sky-600"
                                                    onClick={() => openEditTopicDialog(topic)}
                                                >
                                                    <Edit2 className="size-3.5 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteTopic(topic)}
                                                >
                                                    <Trash2 className="size-3.5 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subtopics Drawer */}
                                    {isExpanded && (
                                        <div className="border-t border-border bg-muted/20 p-4 sm:p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                    <Tag className="size-3.5 text-sky-500" />
                                                    <span>Subtopics for {topic.name}</span>
                                                </span>
                                            </div>

                                            {/* Subtopic Badges */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {topic.subtopics && topic.subtopics.length > 0 ? (
                                                    topic.subtopics.map((sub) => (
                                                        <div
                                                            key={sub.id}
                                                            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-2xs"
                                                        >
                                                            <span>{sub.name}</span>
                                                            <button
                                                                onClick={() => handleDeleteSubtopic(sub.id)}
                                                                className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                                                                title="Delete Subtopic"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">
                                                        No subtopics yet. Add one below.
                                                    </span>
                                                )}
                                            </div>

                                            {/* Add Subtopic Form */}
                                            <div className="flex items-center gap-2 max-w-md">
                                                <Input
                                                    value={newSubtopicName[topic.id] || ''}
                                                    onChange={(e) =>
                                                        setNewSubtopicName((prev) => ({
                                                            ...prev,
                                                            [topic.id]: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Add granular subtopic (e.g., Aortic Dissection)..."
                                                    className="h-8 text-xs"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddSubtopic(topic.id);
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAddSubtopic(topic.id)}
                                                    className="h-8 bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-bold px-3 shrink-0"
                                                >
                                                    <Plus className="size-3 mr-1" /> Add
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
                <Dialog open={isTopicDialogOpen} onOpenChange={setIsTopicDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">
                                {editingTopic ? 'Edit Topic' : 'Add New Curriculum Topic'}
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Configure topic metadata and postgraduate high-yield weight.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleTopicSubmit} className="space-y-4 py-2">
                            {errorMsg && (
                                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                                    <AlertTriangle className="size-4 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="topic-subject" className="text-xs font-bold">Parent Subject</Label>
                                <select
                                    id="topic-subject"
                                    value={subjectId}
                                    onChange={(e) => setSubjectId(parseInt(e.target.value))}
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-[#0066FF] focus:outline-none"
                                >
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="topic-name" className="text-xs font-bold">Topic Name</Label>
                                <Input
                                    id="topic-name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (!editingTopic) {
                                            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                                        }
                                    }}
                                    placeholder="e.g., Acute Coronary Syndromes"
                                    required
                                    className="text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="topic-slug" className="text-xs font-bold">URL Slug</Label>
                                <Input
                                    id="topic-slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="e.g., acute-coronary-syndromes"
                                    required
                                    className="text-xs font-mono"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="topic-priority" className="text-xs font-bold">
                                    High-Yield Priority (1 to 5 Stars)
                                </Label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <button
                                            type="button"
                                            key={val}
                                            onClick={() => setPriority(val)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                                                priority === val
                                                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shadow-xs'
                                                    : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                                            }`}
                                        >
                                            <Star className={`size-3 ${priority >= val ? 'fill-amber-400 text-amber-500' : 'text-neutral-400'}`} />
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
                                    className="bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-bold"
                                >
                                    {editingTopic ? 'Save Changes' : 'Create Topic'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
