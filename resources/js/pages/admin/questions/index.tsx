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

interface QuestionsIndexProps {
    questions: {
        data: QuestionItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    subjects: SubjectOption[];
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
    const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(null);

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
        router.post(`/admin/questions/${id}/toggle-active`, {}, { preserveScroll: true });
    };

    const handleDelete = (q: QuestionItem) => {
        if (confirm(`Are you sure you want to delete question "${q.code}"?`)) {
            router.delete(`/admin/questions/${q.id}`);
        }
    };

    return (
        <>
            <Head title="MCQ Question Bank — Cortex Admin" />

            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 mb-1">
                            <HelpCircle className="size-4" />
                            <span>Postgraduate Clinical Vignette Q-Bank</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                            MCQ Question Bank Management
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Review, calibrate, and author clinical vignettes with multi-tiered diagnostic rationales.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Link href="/admin/questions/create">
                            <Button className="bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs gap-1.5 shadow-md">
                                <Plus className="size-4" />
                                New Clinical MCQ
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* KPI Status Badges */}
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => { setStatus('all'); router.get('/admin/questions', { ...filters, status: 'all' }); }}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all ${
                            status === 'all'
                                ? 'border-[#0066FF] bg-blue-50 text-[#0066FF] dark:bg-blue-950/50'
                                : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                        }`}
                    >
                        <span>All Questions</span>
                        <Badge variant="secondary" className="text-[10px] font-mono h-5 px-1.5">{stats.total}</Badge>
                    </button>

                    <button
                        onClick={() => { setStatus('active'); router.get('/admin/questions', { ...filters, status: 'active' }); }}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all ${
                            status === 'active'
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                        }`}
                    >
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <span>Active Published</span>
                        <Badge variant="secondary" className="text-[10px] font-mono h-5 px-1.5">{stats.active}</Badge>
                    </button>

                    <button
                        onClick={() => { setStatus('draft'); router.get('/admin/questions', { ...filters, status: 'draft' }); }}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all ${
                            status === 'draft'
                                ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                                : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                        }`}
                    >
                        <span className="size-2 rounded-full bg-amber-500" />
                        <span>Drafts</span>
                        <Badge variant="secondary" className="text-[10px] font-mono h-5 px-1.5">{stats.draft}</Badge>
                    </button>
                </div>

                {/* Filter Controls Card */}
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                        {/* Search Input */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search question code, stem text..."
                                    className="pl-9 text-xs"
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
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
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-[#0066FF] focus:outline-none"
                            >
                                <option value="">All Subjects</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Topic Filter */}
                        <div>
                            <select
                                value={topicId}
                                onChange={(e) => setTopicId(e.target.value)}
                                disabled={!subjectId || availableTopics.length === 0}
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-[#0066FF] focus:outline-none disabled:opacity-50"
                            >
                                <option value="">All Topics</option>
                                {availableTopics.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty Filter */}
                        <div>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-[#0066FF] focus:outline-none"
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
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-[#0066FF] focus:outline-none"
                            >
                                <option value="ALL">All Pathways</option>
                                <option value="MECEE_PG">Nepal MECEE-PG</option>
                                <option value="INI_CET">India INI-CET</option>
                                <option value="USMLE_STEP1">USMLE Step 1</option>
                                <option value="USMLE_STEP2CK">USMLE Step 2 CK</option>
                                <option value="COMBINED">Combined Track</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/60 pt-3">
                        <div className="text-xs text-muted-foreground font-medium">
                            Found <span className="font-bold text-foreground">{questions.total}</span> questions
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
                                className="h-8 bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-bold px-4"
                            >
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Questions Table */}
                <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4 w-32">Code</th>
                                    <th className="py-3 px-4 w-44">Subject / Topic</th>
                                    <th className="py-3 px-4 min-w-[280px]">Clinical Vignette Stem</th>
                                    <th className="py-3 px-4 text-center w-20">Key</th>
                                    <th className="py-3 px-4 text-center w-24">Difficulty</th>
                                    <th className="py-3 px-4 w-40">Relevant Pathways</th>
                                    <th className="py-3 px-4 text-center w-24">Status</th>
                                    <th className="py-3 px-4 text-right w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {questions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-muted-foreground">
                                            <FileText className="size-8 mx-auto mb-2 opacity-50" />
                                            <div className="font-bold text-foreground">No questions match your filter</div>
                                            <div className="text-xs mt-1">Try resetting filters or author a new question.</div>
                                        </td>
                                    </tr>
                                ) : (
                                    questions.data.map((q) => (
                                        <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="py-3.5 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                                                {q.code}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-foreground text-xs">{q.subject?.name}</div>
                                                <div className="text-[11px] text-muted-foreground truncate max-w-[160px]" title={q.topic?.name}>
                                                    {q.topic?.name}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="line-clamp-2 text-xs text-foreground/90 font-normal leading-relaxed" title={q.stem}>
                                                    {q.stem}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/70 font-black text-xs text-emerald-800 dark:text-emerald-300">
                                                    {q.correct_option}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] font-extrabold ${
                                                        q.difficulty === 'EASY'
                                                            ? 'border-emerald-300 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40'
                                                            : q.difficulty === 'MEDIUM'
                                                            ? 'border-blue-300 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40'
                                                            : 'border-amber-300 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40'
                                                    }`}
                                                >
                                                    {q.difficulty}
                                                </Badge>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-wrap gap-1 max-w-[160px]">
                                                    {q.relevant_exams?.map((re) => (
                                                        <span
                                                            key={re.exam}
                                                            className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground"
                                                        >
                                                            {re.exam.replace('_', '-')}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    onClick={() => handleToggleActive(q.id)}
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-all ${
                                                        q.is_active
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:opacity-80'
                                                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:opacity-80'
                                                    }`}
                                                    title="Click to toggle Active/Draft"
                                                >
                                                    <span className={`size-1.5 rounded-full ${q.is_active ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                                                    <span>{q.is_active ? 'Active' : 'Draft'}</span>
                                                </button>
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                        onClick={() => setPreviewQuestion(q)}
                                                        title="Quick Preview"
                                                    >
                                                        <Eye className="size-3.5" />
                                                    </Button>

                                                    <Link href={`/admin/questions/${q.id}/edit`}>
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
                                                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDelete(q)}
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
                        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/10 text-xs">
                            <div className="text-muted-foreground">
                                Page <span className="font-bold text-foreground">{questions.current_page}</span> of{' '}
                                <span className="font-bold text-foreground">{questions.last_page}</span>
                            </div>

                            <div className="flex items-center gap-1">
                                {questions.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveState
                                        className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
                                            link.active
                                                ? 'border-[#0066FF] bg-[#0066FF] text-white'
                                                : link.url
                                                ? 'border-border bg-card text-foreground hover:bg-muted'
                                                : 'border-transparent text-muted-foreground cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Preview Modal */}
                <Dialog open={Boolean(previewQuestion)} onOpenChange={(open) => !open && setPreviewQuestion(null)}>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        {previewQuestion && (
                            <>
                                <DialogHeader>
                                    <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                                        <div>
                                            <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                                                {previewQuestion.code}
                                            </span>
                                            <DialogTitle className="text-base font-bold mt-1">
                                                {previewQuestion.subject?.name} · {previewQuestion.topic?.name}
                                            </DialogTitle>
                                        </div>
                                        <Badge variant="outline" className="text-xs font-bold">
                                            {previewQuestion.difficulty}
                                        </Badge>
                                    </div>
                                </DialogHeader>

                                <div className="space-y-4 py-2">
                                    <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs sm:text-sm leading-relaxed text-foreground">
                                        {previewQuestion.stem}
                                    </div>

                                    {/* Options */}
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            Options
                                        </div>
                                        {previewQuestion.options?.map((opt) => (
                                            <div
                                                key={opt.id}
                                                className={`flex items-start gap-3 rounded-xl border p-3 text-xs transition-all ${
                                                    opt.option_key === previewQuestion.correct_option
                                                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-semibold'
                                                        : 'border-border bg-card text-foreground'
                                                }`}
                                            >
                                                <span
                                                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                        opt.option_key === previewQuestion.correct_option
                                                            ? 'bg-emerald-500 text-white'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {opt.option_key}
                                                </span>
                                                <span className="pt-0.5 leading-relaxed">{opt.option_text}</span>
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
