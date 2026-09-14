import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    HelpCircle,
    Plus,
    Edit2,
    Trash2,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    Eye,
    Tag,
    BookOpen,
    Layers,
    Activity,
    FileText,
    Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface SubjectOption {
    id: number;
    name: string;
    topics: Array<{ id: number; subject_id: number; name: string }>;
}

interface QuestionItem {
    id: string;
    code: string;
    stem: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    correct_option: 'A' | 'B' | 'C' | 'D';
    is_active: boolean;
    created_at: string;
    subject: { id: number; name: string };
    topic: { id: number; name: string };
    relevant_exams: Array<{ exam: string }>;
    options: Array<{ id: string; option_key: string; option_text: string }>;
}

interface PathwayFilterOption {
    code: string;
    name: string;
    region?: string;
}

interface QuestionsIndexProps {
    questions: {
        data: QuestionItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    subjects: SubjectOption[];
    pathways?: PathwayFilterOption[];
    filters: {
        search: string;
        subject_id: string | number;
        topic_id: string | number;
        difficulty: string;
        exam: string;
        status: string;
    };
    stats: {
        total: number;
        active: number;
        draft: number;
    };
}

export default function QuestionsIndex({
    questions,
    subjects,
    pathways,
    filters,
    stats,
}: QuestionsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [subjectId, setSubjectId] = useState(filters.subject_id || '');
    const [topicId, setTopicId] = useState(filters.topic_id || '');
    const [difficulty, setDifficulty] = useState(filters.difficulty || 'ALL');
    const [exam, setExam] = useState(filters.exam || 'ALL');
    const [status, setStatus] = useState(filters.status || 'all');

    // Quick Preview Modal
    const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(
        null,
    );

    const selectedSubject = subjects.find((s) => s.id === Number(subjectId));
    const availableTopics = selectedSubject ? selectedSubject.topics : [];

    const handleApplyFilters = () => {
        const query: Record<string, string> = {};
        if (search) query.search = search;
        if (subjectId) query.subject_id = String(subjectId);
        if (topicId) query.topic_id = String(topicId);
        if (difficulty !== 'ALL') query.difficulty = difficulty;
        if (exam !== 'ALL') query.exam = exam;
        if (status !== 'all') query.status = status;

        router.get('/admin/questions', query, { preserveState: true });
    };

    const handleResetFilters = () => {
        setSearch('');
        setSubjectId('');
        setTopicId('');
        setDifficulty('ALL');
        setExam('ALL');
        setStatus('all');
        router.get('/admin/questions');
    };

    const handleToggleActive = (id: string) => {
        router.post(
            `/admin/questions/${id}/toggle-active`,
            {},
            { preserveScroll: true },
        );
    };

    const handleDelete = (q: QuestionItem) => {
        if (confirm(`Are you sure you want to delete question "${q.code}"?`)) {
            router.delete(`/admin/questions/${q.id}`);
        }
    };

    return (
        <>
            <Head title="MCQ Question Bank — Cortex Admin" />

            <div className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="border-border flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-1 inline-flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400">
                            <HelpCircle className="size-4" />
                            <span>Postgraduate Clinical Vignette Q-Bank</span>
                        </div>
                        <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                            MCQ Question Bank Management
                        </h1>
                        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                            Review, calibrate, and author clinical vignettes
                            with multi-tiered diagnostic rationales.
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                        <Link href="/admin/questions/import">
                            <Button
                                variant="outline"
                                className="border-border gap-1.5 text-xs font-bold shadow-xs hover:border-[#0066FF] hover:text-[#0066FF]"
                            >
                                <Upload className="size-4 text-[#0066FF]" />
                                Bulk Import
                            </Button>
                        </Link>
                        <Link href="/admin/questions/create">
                            <Button className="gap-1.5 bg-[#0066FF] text-xs font-bold text-white shadow-md hover:bg-[#0052cc]">
                                <Plus className="size-4" />
                                New Clinical MCQ
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* KPI Status Badges */}
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => {
                            setStatus('all');
                            router.get('/admin/questions', {
                                ...filters,
                                status: 'all',
                            });
                        }}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all ${
                            status === 'all'
                                ? 'border-[#0066FF] bg-blue-50 text-[#0066FF] dark:bg-blue-950/50'
                                : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                        }`}
                    >
                        <span>All Questions</span>
                        <Badge
                            variant="secondary"
                            className="h-5 px-1.5 font-mono text-[10px]"
                        >
                            {stats.total}
                        </Badge>
                    </button>

                    <button
                        onClick={() => {
                            setStatus('active');
                            router.get('/admin/questions', {
                                ...filters,
                                status: 'active',
                            });
                        }}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all ${
                            status === 'active'
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                        }`}
                    >
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <span>Active Published</span>
                        <Badge
                            variant="secondary"
                            className="h-5 px-1.5 font-mono text-[10px]"
                        >
                            {stats.active}
                        </Badge>
                    </button>

                    <button
                        onClick={() => {
                            setStatus('draft');
                            router.get('/admin/questions', {
                                ...filters,
                                status: 'draft',
                            });
                        }}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all ${
                            status === 'draft'
                                ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                                : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                        }`}
                    >
                        <span className="size-2 rounded-full bg-amber-500" />
                        <span>Drafts</span>
                        <Badge
                            variant="secondary"
                            className="h-5 px-1.5 font-mono text-[10px]"
                        >
                            {stats.draft}
                        </Badge>
                    </button>
                </div>

                {/* Filter Controls Card */}
                <div className="border-border bg-card space-y-4 rounded-2xl border p-4 shadow-xs sm:p-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                        {/* Search Input */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search question code, stem text..."
                                    className="pl-9 text-xs"
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' &&
                                        handleApplyFilters()
                                    }
                                />
                            </div>
                        </div>

                        {/* Subject Filter */}
                        <div>
                            <select
                                value={subjectId}
                                onChange={(e) => {
                                    setSubjectId(e.target.value);
                                    setTopicId('');
                                }}
                                className="border-border bg-background text-foreground w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:border-[#0066FF] focus:outline-none"
                            >
                                <option value="">All Subjects</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Topic Filter */}
                        <div>
                            <select
                                value={topicId}
                                onChange={(e) => setTopicId(e.target.value)}
                                disabled={
                                    !subjectId || availableTopics.length === 0
                                }
                                className="border-border bg-background text-foreground w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:border-[#0066FF] focus:outline-none disabled:opacity-50"
                            >
                                <option value="">All Topics</option>
                                {availableTopics.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty Filter */}
                        <div>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="border-border bg-background text-foreground w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:border-[#0066FF] focus:outline-none"
                            >
                                <option value="ALL">All Difficulties</option>
                                <option value="EASY">EASY</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HARD">HARD</option>
                            </select>
                        </div>

                        {/* Pathway Filter */}
                        <div>
                            <select
                                value={exam}
                                onChange={(e) => setExam(e.target.value)}
                                className="border-border bg-background text-foreground w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:border-[#0066FF] focus:outline-none"
                            >
                                <option value="ALL">All Pathways</option>
                                {pathways && pathways.length > 0 ? (
                                    pathways.map((p) => (
                                        <option key={p.code} value={p.code}>
                                            {p.name}
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <option value="MECEE_PG">Nepal MECEE-PG</option>
                                        <option value="INI_CET">India INI-CET</option>
                                        <option value="USMLE_STEP1">
                                            USMLE Step 1
                                        </option>
                                        <option value="USMLE_STEP2CK">
                                            USMLE Step 2 CK
                                        </option>
                                        <option value="COMBINED">Combined Track</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="border-border/60 flex items-center justify-between border-t pt-3">
                        <div className="text-muted-foreground text-xs font-medium">
                            Found{' '}
                            <span className="text-foreground font-bold">
                                {questions.total}
                            </span>{' '}
                            questions
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleResetFilters}
                                className="h-8 text-xs font-semibold"
                            >
                                Reset Filters
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleApplyFilters}
                                className="h-8 bg-[#0066FF] px-4 text-xs font-bold text-white hover:bg-[#0052cc]"
                            >
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Questions Table */}
                <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-muted/40 border-border text-muted-foreground border-b text-[11px] font-bold tracking-wider uppercase">
                                <tr>
                                    <th className="w-32 px-4 py-3">Code</th>
                                    <th className="w-44 px-4 py-3">
                                        Subject / Topic
                                    </th>
                                    <th className="min-w-[280px] px-4 py-3">
                                        Clinical Vignette Stem
                                    </th>
                                    <th className="w-20 px-4 py-3 text-center">
                                        Key
                                    </th>
                                    <th className="w-24 px-4 py-3 text-center">
                                        Difficulty
                                    </th>
                                    <th className="w-40 px-4 py-3">
                                        Relevant Pathways
                                    </th>
                                    <th className="w-24 px-4 py-3 text-center">
                                        Status
                                    </th>
                                    <th className="w-28 px-4 py-3 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-border divide-y">
                                {questions.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="text-muted-foreground py-12 text-center"
                                        >
                                            <FileText className="mx-auto mb-2 size-8 opacity-50" />
                                            <div className="text-foreground font-bold">
                                                No questions match your filter
                                            </div>
                                            <div className="mt-1 text-xs">
                                                Try resetting filters or author
                                                a new question.
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    questions.data.map((q) => (
                                        <tr
                                            key={q.id}
                                            className="hover:bg-muted/20 transition-colors"
                                        >
                                            <td className="px-4 py-3.5 font-mono font-bold text-sky-600 dark:text-sky-400">
                                                {q.code}
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <div className="text-foreground text-xs font-bold">
                                                    {q.subject?.name}
                                                </div>
                                                <div
                                                    className="text-muted-foreground max-w-[160px] truncate text-[11px]"
                                                    title={q.topic?.name}
                                                >
                                                    {q.topic?.name}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <div
                                                    className="text-foreground/90 line-clamp-2 text-xs leading-relaxed font-normal"
                                                    title={q.stem}
                                                >
                                                    {q.stem}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5 text-center">
                                                <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                                                    {q.correct_option}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3.5 text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] font-extrabold ${
                                                        q.difficulty === 'EASY'
                                                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                            : q.difficulty ===
                                                                'MEDIUM'
                                                              ? 'border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                                                              : 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                                    }`}
                                                >
                                                    {q.difficulty}
                                                </Badge>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <div className="flex max-w-[160px] flex-wrap gap-1">
                                                    {q.relevant_exams?.map(
                                                        (re) => (
                                                            <span
                                                                key={re.exam}
                                                                className="border-border bg-muted/40 text-muted-foreground rounded-md border px-1.5 py-0.5 text-[9px] font-bold"
                                                            >
                                                                {re.exam.replace(
                                                                    '_',
                                                                    '-',
                                                                )}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5 text-center">
                                                <button
                                                    onClick={() =>
                                                        handleToggleActive(q.id)
                                                    }
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-all ${
                                                        q.is_active
                                                            ? 'bg-emerald-100 text-emerald-800 hover:opacity-80 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                            : 'bg-neutral-100 text-neutral-600 hover:opacity-80 dark:bg-neutral-800 dark:text-neutral-400'
                                                    }`}
                                                    title="Click to toggle Active/Draft"
                                                >
                                                    <span
                                                        className={`size-1.5 rounded-full ${q.is_active ? 'bg-emerald-500' : 'bg-neutral-400'}`}
                                                    />
                                                    <span>
                                                        {q.is_active
                                                            ? 'Active'
                                                            : 'Draft'}
                                                    </span>
                                                </button>
                                            </td>

                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                                                        onClick={() =>
                                                            setPreviewQuestion(
                                                                q,
                                                            )
                                                        }
                                                        title="Quick Preview"
                                                    >
                                                        <Eye className="size-3.5" />
                                                    </Button>

                                                    <Link
                                                        href={`/admin/questions/${q.id}/edit`}
                                                    >
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-sky-600 hover:text-sky-700"
                                                            title="Edit Question"
                                                        >
                                                            <Edit2 className="size-3.5" />
                                                        </Button>
                                                    </Link>

                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                                        onClick={() =>
                                                            handleDelete(q)
                                                        }
                                                        title="Delete Question"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    {questions.links.length > 3 && (
                        <div className="border-border bg-muted/10 flex items-center justify-between border-t p-4 text-xs">
                            <div className="text-muted-foreground">
                                Page{' '}
                                <span className="text-foreground font-bold">
                                    {questions.current_page}
                                </span>{' '}
                                of{' '}
                                <span className="text-foreground font-bold">
                                    {questions.last_page}
                                </span>
                            </div>

                            <div className="flex items-center gap-1">
                                {questions.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveState
                                        className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-all ${
                                            link.active
                                                ? 'border-[#0066FF] bg-[#0066FF] text-white'
                                                : link.url
                                                  ? 'border-border bg-card text-foreground hover:bg-muted'
                                                  : 'text-muted-foreground cursor-not-allowed border-transparent'
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Preview Modal */}
                <Dialog
                    open={Boolean(previewQuestion)}
                    onOpenChange={(open) => !open && setPreviewQuestion(null)}
                >
                    <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                        {previewQuestion && (
                            <>
                                <DialogHeader>
                                    <div className="border-border flex items-center justify-between gap-2 border-b pb-3">
                                        <div>
                                            <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                                                {previewQuestion.code}
                                            </span>
                                            <DialogTitle className="mt-1 text-base font-bold">
                                                {previewQuestion.subject?.name}{' '}
                                                · {previewQuestion.topic?.name}
                                            </DialogTitle>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="text-xs font-bold"
                                        >
                                            {previewQuestion.difficulty}
                                        </Badge>
                                    </div>
                                </DialogHeader>

                                <div className="space-y-4 py-2">
                                    <div className="border-border bg-muted/20 text-foreground rounded-xl border p-4 text-xs leading-relaxed sm:text-sm">
                                        {previewQuestion.stem}
                                    </div>

                                    {/* Options */}
                                    <div className="space-y-2">
                                        <div className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                                            Options
                                        </div>
                                        {[...(previewQuestion.options || [])]
                                            .sort((a, b) =>
                                                (a.option_key || '').localeCompare(b.option_key || '')
                                            )
                                            .map((opt) => (
                                            <div
                                                key={opt.id}
                                                className={`flex items-start gap-3 rounded-xl border p-3 text-xs transition-all ${
                                                    opt.option_key ===
                                                    previewQuestion.correct_option
                                                        ? 'border-emerald-500 bg-emerald-50/70 font-semibold text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200'
                                                        : 'border-border bg-card text-foreground'
                                                }`}
                                            >
                                                <span
                                                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                        opt.option_key ===
                                                        previewQuestion.correct_option
                                                            ? 'bg-emerald-500 text-white'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {opt.option_key}
                                                </span>
                                                <span className="pt-0.5 leading-relaxed">
                                                    {opt.option_text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
