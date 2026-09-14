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
        <div className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <Head title="Clinical Bookmarks & Notes — Cortex Medical" />

            {/* Top Bar Banner */}
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center dark:border-slate-800">
                <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                            <Sparkles className="size-3.5" />
                            Candidate Notebook
                        </span>
                        <span className="text-xs text-muted-foreground">
                            High-Yield Revision & Personal Clinical Notes
                        </span>
                    </div>
                    <h1 className="font-heading text-2xl font-black tracking-tight text-foreground dark:text-white sm:text-3xl">
                        Clinical Bookmarks & High-Yield Pearls
                    </h1>
                    <p className="max-w-2xl text-xs text-muted-foreground sm:text-sm">
                        Comprehensive repository of your flagged diagnostic
                        vignettes, personal clinical mnemonics, and 3-tier
                        rationales.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/qbank/runner?status=BOOKMARKED">
                        <Button className="h-11 gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-cyan-400 px-5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-sky-300 hover:shadow-cyan-500/30 active:scale-[0.98]">
                            <PlaySquare className="size-4" />
                            Practice Bookmarked ({activeCounts.bookmarked})
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Statistics Counters */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4.5 shadow-sm transition-all hover:border-cyan-500/40 dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-[#0d1322]">
                    <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                            <BookOpen className="size-5" />
                        </div>
                        <div>
                            <span className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Total Notebook Entries
                            </span>
                            <span className="font-mono text-2xl font-black text-foreground dark:text-white sm:text-3xl">
                                {activeCounts.total}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4.5 shadow-sm transition-all hover:border-amber-500/40 dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-[#0d1322]">
                    <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500 dark:text-amber-400">
                            <Bookmark className="size-5 fill-amber-500 dark:fill-amber-400" />
                        </div>
                        <div>
                            <span className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Active Bookmarks
                            </span>
                            <span className="font-mono text-2xl font-black text-amber-600 dark:text-amber-400 sm:text-3xl">
                                {activeCounts.bookmarked}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4.5 shadow-sm transition-all hover:border-emerald-500/40 dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-[#0d1322]">
                    <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Edit3 className="size-5" />
                        </div>
                        <div>
                            <span className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Personal Clinical Notes
                            </span>
                            <span className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400 sm:text-3xl">
                                {activeCounts.withNotes}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters Strip */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-[#0d1322]">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search vignettes, disease entities, or personal notes..."
                        className="h-10 w-full rounded-xl border border-border bg-background pr-4 pl-10 text-xs font-medium text-foreground placeholder:text-muted-foreground transition-colors focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950/80 dark:text-white"
                    />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Subject Filter Dropdown */}
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="h-10 cursor-pointer rounded-xl border border-border bg-background px-3.5 text-xs font-semibold text-foreground transition-colors focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950/80 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                    >
                        <option value="all">All 19 Disciplines</option>
                        {subjects.map((s) => (
                            <option key={s.id} value={s.slug}>
                                {s.name}
                            </option>
                        ))}
                    </select>

                    {/* Filter Type Pills */}
                    <div className="flex items-center rounded-xl border border-border bg-muted/60 p-1 text-xs dark:border-slate-700 dark:bg-slate-950/80">
                        <button
                            type="button"
                            onClick={() => setFilterType('all')}
                            className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                                filterType === 'all'
                                    ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-sm dark:from-cyan-500 dark:to-sky-500 dark:text-slate-950'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            All ({items.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType('bookmarked')}
                            className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                                filterType === 'bookmarked'
                                    ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-sm dark:from-cyan-500 dark:to-sky-500 dark:text-slate-950'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Bookmarks ({activeCounts.bookmarked})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType('notes')}
                            className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                                filterType === 'notes'
                                    ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-sm dark:from-cyan-500 dark:to-sky-500 dark:text-slate-950'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Notes ({activeCounts.withNotes})
                        </button>
                    </div>
                </div>
            </div>

            {/* Bookmarks List */}
            {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900/50 dark:to-[#0d1322]">
                    <div className="mb-3 flex size-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Bookmark className="size-7" />
                    </div>
                    <h3 className="text-base font-bold text-foreground dark:text-white">
                        No Saved Items Found
                    </h3>
                    <p className="mt-1 mb-5 max-w-sm text-xs text-muted-foreground">
                        {searchQuery ||
                        selectedSubject !== 'all' ||
                        filterType !== 'all'
                            ? 'No entries match your current search and discipline filters. Try clearing your search.'
                            : 'You have not bookmarked any questions or saved clinical notes yet. Bookmark high-yield vignettes while practicing in the Q-Bank Runner!'}
                    </p>
                    <Link href="/qbank/runner">
                        <Button className="h-10 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-cyan-400 px-5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-sky-300">
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
                                ? 'bg-destructive/15 text-destructive border-destructive/20'
                                : q.difficulty === 'MEDIUM'
                                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';

                        return (
                            <div
                                key={item.id}
                                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-[#0d1322] dark:hover:border-slate-700"
                            >
                                {/* Card Header */}
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 dark:border-slate-800/80">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                                            {q.code}
                                        </span>
                                        {q.subject && (
                                            <span className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                                                {q.subject.name}
                                            </span>
                                        )}
                                        {q.topic && (
                                            <span className="max-w-[200px] truncate text-xs text-muted-foreground">
                                                • {q.topic.name}
                                            </span>
                                        )}
                                        <span
                                            className={`rounded border px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${difficultyClass}`}
                                        >
                                            {q.difficulty}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleToggleBookmark(q.id)
                                            }
                                            title={
                                                item.is_bookmarked
                                                    ? 'Remove Bookmark'
                                                    : 'Add Bookmark'
                                            }
                                            className={`flex size-8 cursor-pointer items-center justify-center rounded-lg border transition-colors ${
                                                item.is_bookmarked
                                                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-500 dark:text-amber-400'
                                                    : 'border-border text-muted-foreground hover:bg-muted dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <Bookmark
                                                className={`size-4 ${item.is_bookmarked ? 'fill-amber-500 dark:fill-amber-400' : ''}`}
                                            />
                                        </button>

                                        <Link href={`/qbank/runner?question_id=${q.id}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 border-border bg-muted text-xs font-semibold text-foreground hover:bg-muted/80 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-700"
                                            >
                                                Practice Item
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                {/* Question Stem */}
                                <p className="text-xs leading-relaxed font-medium whitespace-pre-line text-foreground/90 dark:text-slate-200">
                                    {q.stem}
                                </p>

                                {/* Learning Objective Highlight */}
                                {q.learning_objective && (
                                    <div className="flex items-start gap-2.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-xs">
                                        <Lightbulb className="mt-0.5 size-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                                        <div>
                                            <span className="text-[10px] font-bold tracking-wider text-cyan-700 dark:text-cyan-400 uppercase">
                                                High-Yield Objective
                                            </span>
                                            <p className="mt-0.5 leading-snug text-foreground/90 dark:text-slate-200">
                                                {q.learning_objective}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Personal Clinical Note Box */}
                                <div className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-700 dark:text-amber-400 uppercase">
                                            <Sparkles className="size-3.5" />
                                            <span>
                                                Personal Clinical Pearl & Memory
                                                Note
                                            </span>
                                        </div>

                                        {!isEditingThisNote && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleStartEditNote(item)
                                                }
                                                className="flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-amber-700 hover:underline dark:text-amber-400"
                                            >
                                                <Edit3 className="size-3" />
                                                {item.note_content
                                                    ? 'Edit Pearl'
                                                    : 'Add Note'}
                                            </button>
                                        )}
                                    </div>

                                    {isEditingThisNote ? (
                                        <div className="mt-1 flex flex-col gap-2">
                                            <textarea
                                                value={noteDraft}
                                                onChange={(e) =>
                                                    setNoteDraft(e.target.value)
                                                }
                                                rows={3}
                                                placeholder="Enter your personalized high-yield clinical mnemonic, key takeaway, or diagnostic rule..."
                                                className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-white"
                                            />
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={isSavingNote}
                                                    onClick={() =>
                                                        setEditingNoteId(null)
                                                    }
                                                    className="h-7 text-xs text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    disabled={isSavingNote}
                                                    onClick={() =>
                                                        handleSaveNote(q.id)
                                                    }
                                                    className="h-7 bg-amber-500 text-xs font-bold text-slate-950 hover:bg-amber-400"
                                                >
                                                    {isSavingNote
                                                        ? 'Saving...'
                                                        : 'Save Note'}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : item.note_content ? (
                                        <p className="mt-0.5 text-xs leading-relaxed whitespace-pre-line text-foreground/90 italic dark:text-slate-200">
                                            "{item.note_content}"
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">
                                            No personal notes added yet. Click
                                            "Add Note" to annotate your mnemonic
                                            or clinical pearl.
                                        </p>
                                    )}
                                </div>

                                {/* Toggle Full 3-Tier Rationale and Options Table */}
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => toggleExpand(q.id)}
                                        className="flex cursor-pointer items-center gap-1 text-xs font-bold text-cyan-600 hover:underline dark:text-cyan-400"
                                    >
                                        {isExpanded ? (
                                            <>
                                                <ChevronUp className="size-3.5" />
                                                Hide 3-Tier Deconstruction &
                                                Distractor Rationale
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="size-3.5" />
                                                Show 3-Tier Deconstruction &
                                                Distractor Rationale
                                            </>
                                        )}
                                    </button>

                                    {isExpanded && (
                                        <div className="mt-4 flex flex-col gap-4">
                                            <TierBreakdown
                                                learningObjective={
                                                    q.learning_objective
                                                }
                                                foundationExplanation={
                                                    q.foundation_explanation
                                                }
                                                integrationExplanation={
                                                    q.integration_explanation
                                                }
                                                applicationExplanation={
                                                    q.application_explanation
                                                }
                                                memoryPeg={q.memory_peg}
                                            />

                                            <OptionRationaleTable
                                                options={[...q.options]
                                                    .sort((a, b) =>
                                                        (a.option_key || '').localeCompare(b.option_key || '')
                                                    )
                                                    .map((opt, idx) => ({
                                                        id: `${q.id}-${opt.option_key}-${idx}`,
                                                        option_key:
                                                            opt.option_key,
                                                        option_text:
                                                            opt.option_text,
                                                        rationale:
                                                            opt.rationale,
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
