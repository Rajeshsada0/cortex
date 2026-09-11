import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Bookmark,
    BookOpen,
    PlaySquare,
    Search,
    Filter,
    Edit3,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    Lightbulb,
    Sparkles,
    CheckCircle2,
    Clock,
    Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TierBreakdown } from '@/components/cortex/tier-breakdown';
import { OptionRationaleTable } from '@/components/cortex/option-rationale-table';
import { toast } from 'sonner';

interface QuestionOptionItem {
    option_key: string;
    option_text: string;
    rationale: string;
}

interface QuestionItem {
    id: string;
    code: string;
    stem: string;
    difficulty: string;
    correct_option: string;
    image_url?: string | null;
    image_caption?: string | null;
    learning_objective: string;
    foundation_explanation: string;
    integration_explanation: string;
    application_explanation: string;
    memory_peg?: string | null;
    subject?: { id: number; name: string; slug: string } | null;
    topic?: { id: number; name: string } | null;
    options: QuestionOptionItem[];
}

interface BookmarkItem {
    id: string;
    question_id: string;
    is_bookmarked: boolean;
    note_content: string | null;
    updated_at: string;
    question: QuestionItem;
}

interface SubjectItem {
    id: number;
    name: string;
    slug: string;
}

interface BookmarksIndexProps {
    user: any;
    bookmarks: BookmarkItem[];
    subjects: SubjectItem[];
    counts: {
        total: number;
        bookmarked: number;
        withNotes: number;
    };
}

export default function BookmarksIndex({
    user,
    bookmarks: initialBookmarks,
    subjects,
    counts,
}: BookmarksIndexProps) {
    const [items, setItems] = useState<BookmarkItem[]>(initialBookmarks);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string>('all');
    const [filterType, setFilterType] = useState<'all' | 'bookmarked' | 'notes'>('all');
    const [expandedQuestionIds, setExpandedQuestionIds] = useState<Record<string, boolean>>({});
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [noteDraft, setNoteDraft] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);

    // Toggle 3-Tier explanation breakdown
    const toggleExpand = (id: string) => {
        setExpandedQuestionIds((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Toggle bookmark state asynchronously
    const handleToggleBookmark = async (questionId: string) => {
        try {
            const res = await fetch('/api/v1/bookmarks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ question_id: questionId }),
            });

            if (res.ok) {
                const data = await res.json();
                setItems((prev) =>
                    prev.map((b) =>
                        b.question_id === questionId
                            ? { ...b, is_bookmarked: data.is_bookmarked }
                            : b
                    )
                );
                toast.success(
                    data.is_bookmarked ? 'Bookmark added' : 'Bookmark removed'
                );
            }
        } catch {
            toast.error('Failed to update bookmark');
        }
    };

    // Start editing personal clinical note
    const handleStartEditNote = (bookmark: BookmarkItem) => {
        setEditingNoteId(bookmark.question_id);
        setNoteDraft(bookmark.note_content || '');
    };

    // Save edited clinical note
    const handleSaveNote = async (questionId: string) => {
        setIsSavingNote(true);
        try {
            const res = await fetch('/api/v1/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    question_id: questionId,
                    note_content: noteDraft.trim() || null,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setItems((prev) =>
                    prev.map((b) =>
                        b.question_id === questionId
                            ? { ...b, note_content: data.note_content }
                            : b
                    )
                );
                setEditingNoteId(null);
                toast.success('Clinical note updated successfully');
            }
        } catch {
            toast.error('Failed to save clinical note');
        } finally {
            setIsSavingNote(false);
        }
    };

    // Client-side search and filters
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const q = item.question;
            if (!q) return false;

            // Filter Type
            if (filterType === 'bookmarked' && !item.is_bookmarked) return false;
            if (filterType === 'notes' && (!item.note_content || item.note_content.trim() === '')) return false;

            // Subject Filter
            if (selectedSubject !== 'all' && q.subject?.slug !== selectedSubject) {
                return false;
            }

            // Keyword Search
            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                const stemMatch = q.stem.toLowerCase().includes(query);
                const codeMatch = q.code.toLowerCase().includes(query);
                const objMatch = q.learning_objective.toLowerCase().includes(query);
                const noteMatch = (item.note_content || '').toLowerCase().includes(query);
                const subjectMatch = (q.subject?.name || '').toLowerCase().includes(query);

                if (!stemMatch && !codeMatch && !objMatch && !noteMatch && !subjectMatch) {
                    return false;
                }
            }

            return true;
        });
    }, [items, searchQuery, selectedSubject, filterType]);

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
            <Head title="Clinical Bookmarks & Notes — Cortex Medical" />

            {/* Top Bar Banner */}
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="rounded bg-[#55BDEB]/15 px-2.5 py-0.5 text-xs font-bold text-[#55BDEB]">
                            Candidate Notebook
                        </span>
                        <span className="text-xs text-muted-foreground">
                            High-Yield Revision & Personal Clinical Notes
                        </span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl mt-1">
                        Clinical Bookmarks & High-Yield Pearls
                    </h1>
                    <p className="text-xs text-muted-foreground max-w-2xl">
                        Comprehensive repository of your flagged diagnostic vignettes, personal clinical mnemonics, and 3-tier rationales.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/qbank/runner?status=BOOKMARKED">
                        <Button className="bg-[#55BDEB] text-neutral-950 font-bold hover:bg-[#55BDEB]/90 shadow-sm gap-2 text-xs">
                            <PlaySquare className="size-4" />
                            Practice Bookmarked ({counts.bookmarked})
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Statistics Counters */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-[#55BDEB]/15 text-[#55BDEB]">
                        <BookOpen className="size-5" />
                    </div>
                    <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                            Total Notebook Entries
                        </span>
                        <span className="text-2xl font-extrabold text-foreground">
                            {counts.total}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                        <Bookmark className="size-5 fill-amber-500" />
                    </div>
                    <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                            Active Bookmarks
                        </span>
                        <span className="text-2xl font-extrabold text-foreground">
                            {counts.bookmarked}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-[#2FB36F]/15 text-[#2FB36F]">
                        <Edit3 className="size-5" />
                    </div>
                    <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                            Personal Clinical Notes
                        </span>
                        <span className="text-2xl font-extrabold text-foreground">
                            {counts.withNotes}
                        </span>
                    </div>
                </div>
            </div>

            {/* Search and Filters Strip */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search vignettes, disease entities, or personal notes..."
                        className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-[#55BDEB] focus:outline-none focus:ring-1 focus:ring-[#55BDEB]"
                    />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Subject Filter Dropdown */}
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-[#55BDEB] focus:outline-none focus:ring-1 focus:ring-[#55BDEB]"
                    >
                        <option value="all">All 19 Disciplines</option>
                        {subjects.map((s) => (
                            <option key={s.id} value={s.slug}>
                                {s.name}
                            </option>
                        ))}
                    </select>

                    {/* Filter Type Pills */}
                    <div className="flex items-center rounded-xl border border-border bg-muted/30 p-0.5 text-xs">
                        <button
                            type="button"
                            onClick={() => setFilterType('all')}
                            className={`rounded-lg px-2.5 py-1.5 font-semibold transition-all ${
                                filterType === 'all'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            All ({items.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType('bookmarked')}
                            className={`rounded-lg px-2.5 py-1.5 font-semibold transition-all ${
                                filterType === 'bookmarked'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Bookmarks ({counts.bookmarked})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType('notes')}
                            className={`rounded-lg px-2.5 py-1.5 font-semibold transition-all ${
                                filterType === 'notes'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Notes ({counts.withNotes})
                        </button>
                    </div>
                </div>
            </div>

            {/* Bookmarks List */}
            {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                        <Bookmark className="size-7" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">No Saved Items Found</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                        {searchQuery || selectedSubject !== 'all' || filterType !== 'all'
                            ? 'No entries match your current search and discipline filters. Try clearing your search.'
                            : 'You have not bookmarked any questions or saved clinical notes yet. Bookmark high-yield vignettes while practicing in the Q-Bank Runner!'}
                    </p>
                    <Link href="/qbank/runner">
                        <Button className="bg-[#55BDEB] text-neutral-950 font-bold text-xs">
                            Explore Q-Bank Questions
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredItems.map((item) => {
                        const q = item.question;
                        const isExpanded = Boolean(expandedQuestionIds[q.id]);
                        const isEditingThisNote = editingNoteId === q.id;

                        const difficultyClass =
                            q.difficulty === 'HARD'
                                ? 'bg-destructive/15 text-destructive'
                                : q.difficulty === 'MEDIUM'
                                ? 'bg-amber-500/15 text-amber-500'
                                : 'bg-[#2FB36F]/15 text-[#2FB36F]';

                        return (
                            <div
                                key={item.id}
                                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-border/80"
                            >
                                {/* Card Header */}
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-xs font-bold text-[#55BDEB]">
                                            {q.code}
                                        </span>
                                        {q.subject && (
                                            <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                                                {q.subject.name}
                                            </span>
                                        )}
                                        {q.topic && (
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                • {q.topic.name}
                                            </span>
                                        )}
                                        <span
                                            className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${difficultyClass}`}
                                        >
                                            {q.difficulty}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleBookmark(q.id)}
                                            title={item.is_bookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                                            className={`flex size-8 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                                                item.is_bookmarked
                                                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                                                    : 'border-border text-muted-foreground hover:bg-muted'
                                            }`}
                                        >
                                            <Bookmark
                                                className={`size-4 ${item.is_bookmarked ? 'fill-amber-500' : ''}`}
                                            />
                                        </button>

                                        <Link href={`/qbank/runner?limit=1`}>
                                            <Button variant="outline" size="sm" className="text-xs h-8">
                                                Practice Item
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                {/* Question Stem */}
                                <p className="text-xs leading-relaxed text-foreground font-medium whitespace-pre-line">
                                    {q.stem}
                                </p>

                                {/* Learning Objective Highlight */}
                                {q.learning_objective && (
                                    <div className="flex items-start gap-2.5 rounded-xl border border-[#55BDEB]/20 bg-[#55BDEB]/5 p-3 text-xs">
                                        <Lightbulb className="size-4 shrink-0 text-[#55BDEB] mt-0.5" />
                                        <div>
                                            <span className="font-bold uppercase tracking-wider text-[#55BDEB] text-[10px]">
                                                High-Yield Objective
                                            </span>
                                            <p className="mt-0.5 text-foreground leading-snug">
                                                {q.learning_objective}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Personal Clinical Note Box */}
                                <div className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider">
                                            <Sparkles className="size-3.5" />
                                            <span>Personal Clinical Pearl & Memory Note</span>
                                        </div>

                                        {!isEditingThisNote && (
                                            <button
                                                type="button"
                                                onClick={() => handleStartEditNote(item)}
                                                className="flex items-center gap-1 text-[11px] font-semibold text-amber-500 hover:underline cursor-pointer"
                                            >
                                                <Edit3 className="size-3" />
                                                {item.note_content ? 'Edit Pearl' : 'Add Note'}
                                            </button>
                                        )}
                                    </div>

                                    {isEditingThisNote ? (
                                        <div className="flex flex-col gap-2 mt-1">
                                            <textarea
                                                value={noteDraft}
                                                onChange={(e) => setNoteDraft(e.target.value)}
                                                rows={3}
                                                placeholder="Enter your personalized high-yield clinical mnemonic, key takeaway, or diagnostic rule..."
                                                className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-[#55BDEB] focus:outline-none focus:ring-1 focus:ring-[#55BDEB]"
                                            />
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={isSavingNote}
                                                    onClick={() => setEditingNoteId(null)}
                                                    className="text-xs h-7"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    disabled={isSavingNote}
                                                    onClick={() => handleSaveNote(q.id)}
                                                    className="bg-amber-500 text-neutral-950 font-bold hover:bg-amber-500/90 text-xs h-7"
                                                >
                                                    {isSavingNote ? 'Saving...' : 'Save Note'}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : item.note_content ? (
                                        <p className="text-xs text-foreground italic whitespace-pre-line mt-0.5 leading-relaxed">
                                            "{item.note_content}"
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">
                                            No personal notes added yet. Click "Add Note" to annotate your mnemonic or clinical pearl.
                                        </p>
                                    )}
                                </div>

                                {/* Toggle Full 3-Tier Rationale and Options Table */}
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => toggleExpand(q.id)}
                                        className="flex items-center gap-1 text-xs font-bold text-[#55BDEB] hover:underline cursor-pointer"
                                    >
                                        {isExpanded ? (
                                            <>
                                                <ChevronUp className="size-3.5" />
                                                Hide 3-Tier Deconstruction & Distractor Rationale
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="size-3.5" />
                                                Show 3-Tier Deconstruction & Distractor Rationale
                                            </>
                                        )}
                                    </button>

                                    {isExpanded && (
                                        <div className="mt-4 flex flex-col gap-4">
                                            <TierBreakdown
                                                learningObjective={q.learning_objective}
                                                foundationExplanation={q.foundation_explanation}
                                                integrationExplanation={q.integration_explanation}
                                                applicationExplanation={q.application_explanation}
                                                memoryPeg={q.memory_peg}
                                            />

                                            <OptionRationaleTable
                                                options={q.options.map((opt, idx) => ({
                                                    id: `${q.id}-${opt.option_key}-${idx}`,
                                                    option_key: opt.option_key,
                                                    option_text: opt.option_text,
                                                    rationale: opt.rationale,
                                                }))}
                                                correctOption={q.correct_option}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
