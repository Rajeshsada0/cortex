import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Bookmark,
    BookOpen,
    PlaySquare,
    Search,
    Edit3,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    Lightbulb,
    Sparkles,
    FileText,
    ListFilter,
    Info,
    ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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
    const [filterType, setFilterType] = useState<
        'all' | 'bookmarked' | 'notes'
    >('all');
    const [expandedQuestionIds, setExpandedQuestionIds] = useState<
        Record<string, boolean>
    >({});
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [noteDraft, setNoteDraft] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);

    // Dynamic reactive counts based on current items state
    const activeCounts = useMemo(() => {
        return {
            total: items.length,
            bookmarked: items.filter((b) => b.is_bookmarked).length,
            withNotes: items.filter(
                (b) => Boolean(b.note_content && b.note_content.trim() !== ''),
            ).length,
        };
    }, [items]);

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
            const currentItem = items.find((b) => b.question_id === questionId);
            const targetState = currentItem ? !currentItem.is_bookmarked : true;

            const res = await fetch('/api/v1/bookmarks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    question_id: questionId,
                    is_bookmarked: targetState,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setItems((prev) =>
                    prev.map((b) =>
                        b.question_id === questionId
                            ? { ...b, is_bookmarked: data.is_bookmarked }
                            : b,
                    ),
                );
                toast.success(
                    data.is_bookmarked ? 'Bookmark added' : 'Bookmark removed',
                );
            } else {
                toast.error('Failed to update bookmark');
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
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
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
                            : b,
                    ),
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
            if (filterType === 'bookmarked' && !item.is_bookmarked)
                return false;
            if (
                filterType === 'notes' &&
                (!item.note_content || item.note_content.trim() === '')
            )
                return false;

            // Subject Filter
            if (
                selectedSubject !== 'all' &&
                q.subject?.slug !== selectedSubject
            ) {
                return false;
            }

            // Keyword Search
            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                const stemMatch = q.stem.toLowerCase().includes(query);
                const codeMatch = q.code.toLowerCase().includes(query);
                const objMatch = q.learning_objective
                    .toLowerCase()
                    .includes(query);
                const noteMatch = (item.note_content || '')
                    .toLowerCase()
                    .includes(query);
                const subjectMatch = (q.subject?.name || '')
                    .toLowerCase()
                    .includes(query);

                if (
                    !stemMatch &&
                    !codeMatch &&
                    !objMatch &&
                    !noteMatch &&
                    !subjectMatch
                ) {
                    return false;
                }
            }

            return true;
        });
    }, [items, searchQuery, selectedSubject, filterType]);

    return (
        <TooltipProvider delayDuration={150}>
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <Head title="Bookmarks & Notes — Cortex Medical" />

                {/* Clean, Modern Header Bar */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                                    <Sparkles className="h-3 w-3" />
                                    Candidate Notebook
                                </span>
                                <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
                                    {activeCounts.bookmarked} Bookmarked
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Bookmarks & Notes
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link href="/qbank/runner?status=BOOKMARKED">
                                <Button
                                    size="sm"
                                    disabled={activeCounts.bookmarked === 0}
                                    className="h-9 gap-1.5 rounded-xl bg-cyan-600 px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
                                >
                                    <PlaySquare className="h-3.5 w-3.5" />
                                    <span>Practice Bookmarked</span>
                                    <span className="ml-1 rounded-full bg-black/15 px-1.5 py-0.2 font-mono text-[10px] dark:bg-white/20">
                                        {activeCounts.bookmarked}
                                    </span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Minimal Statistics Strip */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* 1. Total Notebook Entries */}
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-mono text-2xl font-bold text-foreground">
                                    {activeCounts.total}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Total Saved
                                </p>
                            </div>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-foreground"
                                    aria-label="Notebook entries info"
                                >
                                    <Info className="h-3.5 w-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Total questions saved with bookmarks or notes
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* 2. Active Bookmarks */}
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Bookmark className="h-5 w-5 fill-amber-500/20" />
                            </div>
                            <div>
                                <div className="font-mono text-2xl font-bold text-foreground">
                                    {activeCounts.bookmarked}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Flagged Vignettes
                                </p>
                            </div>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-foreground"
                                    aria-label="Active bookmarks info"
                                >
                                    <Info className="h-3.5 w-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Questions flagged for quick revision in Q-Bank
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* 3. Personal Notes */}
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Edit3 className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-mono text-2xl font-bold text-foreground">
                                    {activeCounts.withNotes}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Clinical Pearls
                                </p>
                            </div>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-foreground"
                                    aria-label="Clinical notes info"
                                >
                                    <Info className="h-3.5 w-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Questions with custom clinical pearls or mnemonics
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Minimal Search & Filter Toolbar */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search vignettes, disease entities, or personal notes..."
                            className="h-9 w-full rounded-xl border border-border bg-background pr-3 pl-9 text-xs text-foreground placeholder:text-muted-foreground transition focus:border-cyan-500 focus:outline-none"
                        />
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Discipline Select */}
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="h-9 cursor-pointer rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground transition focus:border-cyan-500 focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                        >
                            <option value="all">All Disciplines</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.slug}>
                                    {s.name}
                                </option>
                            ))}
                        </select>

                        {/* Segmented Filter Pills */}
                        <div className="flex items-center rounded-xl border border-border bg-muted/50 p-0.5 text-xs">
                            <button
                                type="button"
                                onClick={() => setFilterType('all')}
                                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                    filterType === 'all'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                All ({items.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterType('bookmarked')}
                                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                    filterType === 'bookmarked'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Bookmark className="h-3 w-3 fill-amber-500/30 text-amber-500" />
                                <span>Bookmarks ({activeCounts.bookmarked})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterType('notes')}
                                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                    filterType === 'notes'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <FileText className="h-3 w-3 text-emerald-500" />
                                <span>Notes ({activeCounts.withNotes})</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bookmarks List */}
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center shadow-xs">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Bookmark className="h-6 w-6" />
                        </div>
                        <h3 className="mt-4 text-base font-bold text-foreground">
                            No Saved Items Found
                        </h3>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            {searchQuery ||
                            selectedSubject !== 'all' ||
                            filterType !== 'all'
                                ? 'No entries match your search or filter criteria. Try resetting your search.'
                                : 'You have not saved any bookmarks or clinical pearls yet. Bookmark high-yield vignettes while practicing in the Q-Bank Runner!'}
                        </p>
                        <Link href="/qbank/runner" className="mt-4">
                            <Button
                                size="sm"
                                className="h-9 gap-1.5 rounded-xl bg-cyan-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
                            >
                                <PlaySquare className="h-3.5 w-3.5" />
                                <span>Explore Q-Bank Questions</span>
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredItems.map((item) => {
                            const q = item.question;
                            const isExpanded = Boolean(expandedQuestionIds[q.id]);
                            const isEditingThisNote = editingNoteId === q.id;

                            const difficultyBadge =
                                q.difficulty === 'HARD'
                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                    : q.difficulty === 'MEDIUM'
                                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';

                            return (
                                <div
                                    key={item.id}
                                    className="rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-slate-300 dark:hover:border-slate-700"
                                >
                                    {/* Card Header */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                                                {q.code}
                                            </span>
                                            {q.subject && (
                                                <span className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-foreground">
                                                    {q.subject.name}
                                                </span>
                                            )}
                                            {q.topic && (
                                                <span className="max-w-[180px] truncate text-[11px] text-muted-foreground">
                                                    {q.topic.name}
                                                </span>
                                            )}
                                            <span
                                                className={`rounded-md border px-1.5 py-0.2 font-mono text-[10px] font-bold ${difficultyBadge}`}
                                            >
                                                {q.difficulty}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleBookmark(q.id)}
                                                        className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border transition ${
                                                            item.is_bookmarked
                                                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 dark:text-amber-400'
                                                                : 'border-border text-muted-foreground hover:border-slate-300 hover:bg-muted hover:text-foreground'
                                                        }`}
                                                    >
                                                        <Bookmark
                                                            className={`h-3.5 w-3.5 ${
                                                                item.is_bookmarked
                                                                    ? 'fill-amber-500 dark:fill-amber-400'
                                                                    : ''
                                                            }`}
                                                        />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    {item.is_bookmarked
                                                        ? 'Remove Bookmark'
                                                        : 'Bookmark Vignette'}
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link href={`/qbank/runner?question_id=${q.id}`}>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-1 rounded-xl border-border px-2.5 text-xs font-medium"
                                                        >
                                                            <span>Practice</span>
                                                            <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                                                        </Button>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    Launch this vignette in Practice Runner
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    {/* Question Stem */}
                                    <div className="pt-3.5 pb-2">
                                        <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-line sm:text-sm">
                                            {q.stem}
                                        </p>
                                    </div>

                                    {/* Learning Objective (Clean Minimal Callout) */}
                                    {q.learning_objective && (
                                        <div className="my-2 flex items-start gap-2.5 rounded-xl border-l-2 border-cyan-500 bg-cyan-500/5 px-3 py-2 text-xs">
                                            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                                            <div>
                                                <span className="font-semibold text-cyan-700 dark:text-cyan-300">
                                                    High-Yield Takeaway:{' '}
                                                </span>
                                                <span className="text-foreground/80">
                                                    {q.learning_objective}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Personal Clinical Note Card */}
                                    <div className="my-2 rounded-xl border border-border bg-muted/40 p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                                <span>Personal Note / Mnemonic</span>
                                            </div>

                                            {!isEditingThisNote && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleStartEditNote(item)}
                                                    className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-cyan-600 hover:underline dark:text-cyan-400"
                                                >
                                                    <Edit3 className="h-3 w-3" />
                                                    <span>
                                                        {item.note_content ? 'Edit Note' : 'Add Note'}
                                                    </span>
                                                </button>
                                            )}
                                        </div>

                                        {isEditingThisNote ? (
                                            <div className="mt-2 space-y-2">
                                                <textarea
                                                    value={noteDraft}
                                                    onChange={(e) => setNoteDraft(e.target.value)}
                                                    rows={3}
                                                    placeholder="Enter your personal clinical pearl, diagnostic mnemonic, or key takeaway..."
                                                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none"
                                                />
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={isSavingNote}
                                                        onClick={() => setEditingNoteId(null)}
                                                        className="h-7 text-xs text-muted-foreground"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        disabled={isSavingNote}
                                                        onClick={() => handleSaveNote(q.id)}
                                                        className="h-7 rounded-lg bg-cyan-600 text-xs font-semibold text-white hover:bg-cyan-700 dark:bg-cyan-500 dark:text-neutral-950"
                                                    >
                                                        {isSavingNote ? 'Saving...' : 'Save Note'}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : item.note_content ? (
                                            <p className="mt-1 text-xs leading-relaxed text-foreground/80 italic">
                                                "{item.note_content}"
                                            </p>
                                        ) : (
                                            <p className="mt-1 text-xs text-muted-foreground italic">
                                                No personal notes added. Click "Add Note" to record your clinical pearl.
                                            </p>
                                        )}
                                    </div>

                                    {/* 3-Tier Rationale Collapsible Toggle */}
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleExpand(q.id)}
                                            className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                                        >
                                            {isExpanded ? (
                                                <>
                                                    <ChevronUp className="h-3.5 w-3.5" />
                                                    <span>Hide Explanations & Rationales</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="h-3.5 w-3.5" />
                                                    <span>View Explanations & Rationales</span>
                                                </>
                                            )}
                                        </button>

                                        {isExpanded && (
                                            <div className="mt-4 space-y-4 border-t border-border pt-4">
                                                <TierBreakdown
                                                    learningObjective={q.learning_objective}
                                                    foundationExplanation={q.foundation_explanation}
                                                    integrationExplanation={q.integration_explanation}
                                                    applicationExplanation={q.application_explanation}
                                                    memoryPeg={q.memory_peg}
                                                />

                                                <OptionRationaleTable
                                                    options={[...q.options]
                                                        .sort((a, b) =>
                                                            (a.option_key || '').localeCompare(b.option_key || '')
                                                        )
                                                        .map((opt, idx) => ({
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
        </TooltipProvider>
    );
}
