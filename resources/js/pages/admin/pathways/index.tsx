import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Award,
    Clock,
    HelpCircle,
    CheckCircle2,
    SlidersHorizontal,
    ArrowRight,
    Scale,
    Activity,
    BookOpen,
    Plus,
    Pencil,
    Trash2,
    Shield,
    AlertTriangle,
    Globe,
    Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export interface PathwayInfo {
    id: number;
    code: string;
    name: string;
    fullName: string;
    region?: string;
    totalQuestions: number;
    durationMinutes: number;
    correctMarks: number;
    negativeMarks: number;
    scoringType: string;
    penaltyLabel?: string;
    badgeColor?: string;
    isActive: boolean;
    isSystem: boolean;
    availableQuestions: number;
}

interface SubjectItem {
    id: number;
    name: string;
    slug: string;
    questions_count: number;
}

interface PathwaysIndexProps {
    pathways: Record<string, PathwayInfo>;
    subjects: SubjectItem[];
    total_bank_questions: number;
}

interface PathwayFormData {
    code: string;
    name: string;
    full_name: string;
    region: string;
    total_questions: number;
    duration_minutes: number;
    correct_marks: number;
    negative_marks: number;
    scoring_type: string;
    penalty_label: string;
    is_active: boolean;
}

export default function PathwaysIndex({
    pathways,
    subjects,
    total_bank_questions,
}: PathwaysIndexProps) {
    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [activePathway, setActivePathway] = useState<PathwayInfo | null>(null);

    // Create Form
    const createForm = useForm<PathwayFormData>({
        code: '',
        name: '',
        full_name: '',
        region: 'Global',
        total_questions: 200,
        duration_minutes: 180,
        correct_marks: 1.0,
        negative_marks: 0.25,
        scoring_type: 'Negative Marking (+1 / -0.25)',
        penalty_label: 'Standard (-0.25)',
        is_active: true,
    });

    // Edit Form
    const editForm = useForm<PathwayFormData>({
        code: '',
        name: '',
        full_name: '',
        region: '',
        total_questions: 200,
        duration_minutes: 180,
        correct_marks: 1.0,
        negative_marks: 0.25,
        scoring_type: '',
        penalty_label: '',
        is_active: true,
    });

    // Handle opening edit modal
    const handleOpenEdit = (p: PathwayInfo) => {
        setActivePathway(p);
        editForm.setData({
            code: p.code,
            name: p.name,
            full_name: p.fullName,
            region: p.region || 'Global',
            total_questions: p.totalQuestions,
            duration_minutes: p.durationMinutes,
            correct_marks: p.correctMarks,
            negative_marks: p.negativeMarks,
            scoring_type: p.scoringType,
            penalty_label: p.penaltyLabel || '',
            is_active: p.isActive,
        });
        editForm.clearErrors();
        setIsEditOpen(true);
    };

    // Handle opening delete modal
    const handleOpenDelete = (p: PathwayInfo) => {
        setActivePathway(p);
        setIsDeleteOpen(false);
        if (p.isSystem) {
            toast.error('Core System Pathway', {
                description: 'Core default blueprints cannot be deleted to preserve platform baseline consistency.',
            });
            return;
        }
        setIsDeleteOpen(true);
    };

    // Submit Create
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/pathways', {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
                toast.success('Exam Pathway created successfully!');
            },
            onError: () => {
                toast.error('Failed to create pathway. Please check validation errors.');
            },
        });
    };

    // Submit Edit
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activePathway) return;

        editForm.put(`/admin/pathways/${activePathway.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditOpen(false);
                toast.success(`Exam Pathway '${editForm.data.name}' updated successfully!`);
            },
            onError: () => {
                toast.error('Failed to update pathway. Please check validation errors.');
            },
        });
    };

    // Submit Delete
    const [isDeleting, setIsDeleting] = useState(false);
    const handleDeleteConfirm = () => {
        if (!activePathway) return;
        setIsDeleting(true);

        router.delete(`/admin/pathways/${activePathway.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteOpen(false);
                setIsDeleting(false);
                toast.success(`Exam Pathway '${activePathway.name}' deleted.`);
            },
            onError: () => {
                setIsDeleting(false);
                toast.error('Failed to delete pathway.');
            },
        });
    };

    return (
        <>
            <Head title="Exam Pathways & Blueprints — Cortex Admin" />

            <div className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="border-border flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-1 inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                            <Award className="size-4" />
                            <span>
                                Postgraduate Testing Standards &amp; Examination Blueprints
                            </span>
                        </div>
                        <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                            Exam Pathway Blueprints
                        </h1>
                        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                            Manage negative marking coefficients, question quotas, timing, and national curriculum rules.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link href="/admin/questions/create">
                            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-bold">
                                Author Questions
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            onClick={() => {
                                createForm.reset();
                                createForm.clearErrors();
                                setIsCreateOpen(true);
                            }}
                            className="h-9 gap-1.5 bg-[#0066FF] px-3 text-xs font-bold text-white shadow-xs hover:bg-[#0052cc] dark:bg-cyan-600 dark:hover:bg-cyan-500"
                        >
                            <Plus className="size-4" />
                            <span>Create New Blueprint</span>
                        </Button>
                    </div>
                </div>

                {/* Pathways Grid */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(pathways).map(([key, p]) => {
                        const coveragePct = Math.min(
                            100,
                            Math.round(
                                (p.availableQuestions / p.totalQuestions) * 100,
                            ),
                        );
                        return (
                            <div
                                key={key}
                                className={`border-border bg-card flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition hover:border-slate-300 dark:hover:border-slate-700 ${
                                    !p.isActive ? 'opacity-70' : ''
                                }`}
                            >
                                <div>
                                    {/* Top Row: Code, System Badge, and Actions */}
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <Badge
                                                variant="outline"
                                                className="border-sky-500/30 bg-sky-500/10 font-mono text-[10px] font-bold text-sky-700 dark:text-sky-300"
                                            >
                                                {p.code}
                                            </Badge>
                                            {p.region && (
                                                <Badge
                                                    variant="secondary"
                                                    className="gap-1 text-[10px] font-medium"
                                                >
                                                    <Globe className="size-2.5" />
                                                    <span>{p.region}</span>
                                                </Badge>
                                            )}
                                            {p.isSystem && (
                                                <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300">
                                                    <Shield className="size-2.5" />
                                                    Core
                                                </span>
                                            )}
                                            {!p.isActive && (
                                                <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 dark:text-rose-300">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>

                                        {/* Action buttons: Edit & Delete */}
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenEdit(p)}
                                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                title={`Edit ${p.name}`}
                                            >
                                                <Pencil className="size-3.5" />
                                                <span className="sr-only">Edit</span>
                                            </Button>

                                            {!p.isSystem && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenDelete(p)}
                                                    className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30"
                                                    title={`Delete ${p.name}`}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Titles */}
                                    <h2 className="text-foreground text-base font-black">
                                        {p.name}
                                    </h2>
                                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed line-clamp-2">
                                        {p.fullName}
                                    </p>

                                    {/* Scoring Algorithm Box */}
                                    <div className="border-border bg-muted/20 mt-4 space-y-1 rounded-xl border p-3 text-xs">
                                        <div className="text-muted-foreground flex items-center justify-between">
                                            <span>Marking Scheme:</span>
                                            <span className="text-foreground font-bold">
                                                {p.scoringType}
                                            </span>
                                        </div>
                                        <div className="text-muted-foreground flex items-center justify-between">
                                            <span>Correct Answer:</span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                +{p.correctMarks}
                                            </span>
                                        </div>
                                        <div className="text-muted-foreground flex items-center justify-between">
                                            <span>Penalty per Error:</span>
                                            {p.negativeMarks > 0 ? (
                                                <span className="text-destructive font-bold">
                                                    -{p.negativeMarks} ({p.penaltyLabel || 'Deduction'})
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground font-medium">
                                                    None (0.0)
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-muted-foreground flex items-center justify-between">
                                            <span>Duration:</span>
                                            <span className="text-foreground font-bold flex items-center gap-1">
                                                <Clock className="size-3 text-muted-foreground" />
                                                {p.durationMinutes} mins ({Math.round((p.durationMinutes / 60) * 10) / 10}h)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quota Progress */}
                                    <div className="mt-4 space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                            <span className="text-muted-foreground">
                                                Q-Bank Readiness
                                            </span>
                                            <span className="text-foreground font-bold">
                                                {p.availableQuestions} / {p.totalQuestions} Qs ({coveragePct}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
                                            <div
                                                style={{
                                                    width: `${coveragePct}%`,
                                                }}
                                                className={`h-full transition-all ${
                                                    coveragePct >= 100
                                                        ? 'bg-emerald-500'
                                                        : coveragePct >= 50
                                                          ? 'bg-blue-500'
                                                          : 'bg-amber-500'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Row */}
                                <div className="border-border mt-5 flex items-center justify-between border-t pt-3">
                                    <Link
                                        href={`/admin/questions?exam=${p.code}`}
                                        className="flex items-center gap-1 text-xs font-bold text-[#0066FF] hover:underline dark:text-cyan-400"
                                    >
                                        <span>
                                            View {p.availableQuestions} Questions
                                        </span>
                                        <ArrowRight className="size-3" />
                                    </Link>
                                    <Badge
                                        variant="secondary"
                                        className="font-mono text-[10px]"
                                    >
                                        Target Quota: {p.totalQuestions}
                                    </Badge>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Subject Distribution Matrix */}
                <div className="border-border bg-card rounded-2xl border p-5 shadow-xs sm:p-6">
                    <div className="border-border/60 mb-4 flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                            <BookOpen className="size-4 text-indigo-500" />
                            <h2 className="text-foreground text-sm font-bold">
                                19-Subject Clinical Density Matrix
                            </h2>
                        </div>
                        <span className="text-muted-foreground text-xs font-medium">
                            Total:{' '}
                            <strong className="text-foreground">
                                {total_bank_questions}
                            </strong>{' '}
                            questions in bank
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {subjects.map((s) => (
                            <Link
                                key={s.id}
                                href={`/admin/questions?subject_id=${s.id}`}
                                className="border-border hover:bg-muted/20 flex items-center justify-between rounded-xl border p-3 text-xs transition-all hover:border-[#0066FF]"
                            >
                                <span className="text-foreground truncate pr-2 font-semibold">
                                    {s.name}
                                </span>
                                <Badge
                                    variant="secondary"
                                    className="shrink-0 font-mono text-[10px] font-bold"
                                >
                                    {s.questions_count} Qs
                                </Badge>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* CREATE MODAL */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">
                            Create New Exam Pathway Blueprint
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Define standard timing, scoring rules, and question quotas for a postgraduate examination.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="create-code" className="text-xs font-semibold">
                                    Blueprint Code *
                                </Label>
                                <Input
                                    id="create-code"
                                    placeholder="e.g. PLAB_1, AMC_CAT"
                                    value={createForm.data.code}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'code',
                                            e.target.value.toUpperCase().replace(/\s+/g, '_'),
                                        )
                                    }
                                    className="font-mono text-xs uppercase"
                                    required
                                />
                                {createForm.errors.code && (
                                    <p className="text-destructive text-[11px]">{createForm.errors.code}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="create-region" className="text-xs font-semibold">
                                    Region / Jurisdiction
                                </Label>
                                <Input
                                    id="create-region"
                                    placeholder="e.g. United Kingdom, Nepal, USA"
                                    value={createForm.data.region}
                                    onChange={(e) => createForm.setData('region', e.target.value)}
                                    className="text-xs"
                                />
                                {createForm.errors.region && (
                                    <p className="text-destructive text-[11px]">{createForm.errors.region}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="create-name" className="text-xs font-semibold">
                                Short Display Name *
                            </Label>
                            <Input
                                id="create-name"
                                placeholder="e.g. UK PLAB 1 / UKMLA"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                className="text-xs"
                                required
                            />
                            {createForm.errors.name && (
                                <p className="text-destructive text-[11px]">{createForm.errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="create-full-name" className="text-xs font-semibold">
                                Full Title / Examination Body *
                            </Label>
                            <Input
                                id="create-full-name"
                                placeholder="e.g. GMC Professional and Linguistic Assessments Board Part 1"
                                value={createForm.data.full_name}
                                onChange={(e) => createForm.setData('full_name', e.target.value)}
                                className="text-xs"
                                required
                            />
                            {createForm.errors.full_name && (
                                <p className="text-destructive text-[11px]">{createForm.errors.full_name}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="create-questions" className="text-xs font-semibold">
                                    Total Qs *
                                </Label>
                                <Input
                                    id="create-questions"
                                    type="number"
                                    min="1"
                                    max="1000"
                                    value={createForm.data.total_questions}
                                    onChange={(e) =>
                                        createForm.setData('total_questions', parseInt(e.target.value) || 0)
                                    }
                                    className="font-mono text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="create-duration" className="text-xs font-semibold">
                                    Minutes *
                                </Label>
                                <Input
                                    id="create-duration"
                                    type="number"
                                    min="1"
                                    max="1440"
                                    value={createForm.data.duration_minutes}
                                    onChange={(e) =>
                                        createForm.setData('duration_minutes', parseInt(e.target.value) || 0)
                                    }
                                    className="font-mono text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="create-correct" className="text-xs font-semibold">
                                    Marks (+) *
                                </Label>
                                <Input
                                    id="create-correct"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={createForm.data.correct_marks}
                                    onChange={(e) =>
                                        createForm.setData('correct_marks', parseFloat(e.target.value) || 0)
                                    }
                                    className="font-mono text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="create-negative" className="text-xs font-semibold">
                                    Penalty (-) *
                                </Label>
                                <Input
                                    id="create-negative"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={createForm.data.negative_marks}
                                    onChange={(e) =>
                                        createForm.setData('negative_marks', parseFloat(e.target.value) || 0)
                                    }
                                    className="font-mono text-xs"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="create-scoring" className="text-xs font-semibold">
                                    Scoring Scheme Description *
                                </Label>
                                <Input
                                    id="create-scoring"
                                    placeholder="e.g. Negative Marking (+1 / -0.25)"
                                    value={createForm.data.scoring_type}
                                    onChange={(e) => createForm.setData('scoring_type', e.target.value)}
                                    className="text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="create-penalty" className="text-xs font-semibold">
                                    Penalty Label (Optional)
                                </Label>
                                <Input
                                    id="create-penalty"
                                    placeholder="e.g. Standard (-0.25) or No Negative"
                                    value={createForm.data.penalty_label}
                                    onChange={(e) => createForm.setData('penalty_label', e.target.value)}
                                    className="text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="create-active"
                                checked={createForm.data.is_active}
                                onCheckedChange={(checked) =>
                                    createForm.setData('is_active', Boolean(checked))
                                }
                            />
                            <Label
                                htmlFor="create-active"
                                className="text-xs font-medium cursor-pointer"
                            >
                                Active and available for candidates in Mock Exam Hall
                            </Label>
                        </div>

                        <DialogFooter className="pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={createForm.processing}
                                className="bg-[#0066FF] text-white hover:bg-[#0052cc] dark:bg-cyan-600 dark:hover:bg-cyan-500"
                            >
                                {createForm.processing ? 'Creating...' : 'Create Blueprint'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* EDIT MODAL */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">
                            Edit Exam Pathway: {activePathway?.name}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Update timing parameters, question targets, and scoring coefficients.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-code" className="text-xs font-semibold">
                                    Blueprint Code
                                </Label>
                                <Input
                                    id="edit-code"
                                    value={editForm.data.code}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'code',
                                            e.target.value.toUpperCase().replace(/\s+/g, '_'),
                                        )
                                    }
                                    disabled={activePathway?.isSystem}
                                    className={`font-mono text-xs uppercase ${
                                        activePathway?.isSystem ? 'bg-muted opacity-80 cursor-not-allowed' : ''
                                    }`}
                                    required
                                />
                                {activePathway?.isSystem && (
                                    <p className="text-muted-foreground text-[10px]">
                                        Core system code is protected from modification.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-region" className="text-xs font-semibold">
                                    Region / Jurisdiction
                                </Label>
                                <Input
                                    id="edit-region"
                                    value={editForm.data.region}
                                    onChange={(e) => editForm.setData('region', e.target.value)}
                                    className="text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-name" className="text-xs font-semibold">
                                Short Display Name *
                            </Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                className="text-xs"
                                required
                            />
                            {editForm.errors.name && (
                                <p className="text-destructive text-[11px]">{editForm.errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-full-name" className="text-xs font-semibold">
                                Full Title / Examination Body *
                            </Label>
                            <Input
                                id="edit-full-name"
                                value={editForm.data.full_name}
                                onChange={(e) => editForm.setData('full_name', e.target.value)}
                                className="text-xs"
                                required
                            />
                            {editForm.errors.full_name && (
                                <p className="text-destructive text-[11px]">{editForm.errors.full_name}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-questions" className="text-xs font-semibold">
                                    Total Qs *
                                </Label>
                                <Input
                                    id="edit-questions"
                                    type="number"
                                    min="1"
                                    max="1000"
                                    value={editForm.data.total_questions}
                                    onChange={(e) =>
                                        editForm.setData('total_questions', parseInt(e.target.value) || 0)
                                    }
                                    className="font-mono text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-duration" className="text-xs font-semibold">
                                    Minutes *
                                </Label>
                                <Input
                                    id="edit-duration"
                                    type="number"
                                    min="1"
                                    max="1440"
                                    value={editForm.data.duration_minutes}
                                    onChange={(e) =>
                                        editForm.setData('duration_minutes', parseInt(e.target.value) || 0)
                                    }
                                    className="font-mono text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-correct" className="text-xs font-semibold">
                                    Marks (+) *
                                </Label>
                                <Input
                                    id="edit-correct"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editForm.data.correct_marks}
                                    onChange={(e) =>
                                        editForm.setData('correct_marks', parseFloat(e.target.value) || 0)
                                    }
                                    className="font-mono text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-negative" className="text-xs font-semibold">
                                    Penalty (-) *
                                </Label>
                                <Input
                                    id="edit-negative"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editForm.data.negative_marks}
                                    onChange={(e) =>
                                        editForm.setData('negative_marks', parseFloat(e.target.value) || 0)
                                    }
                                    className="font-mono text-xs"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-scoring" className="text-xs font-semibold">
                                    Scoring Scheme Description *
                                </Label>
                                <Input
                                    id="edit-scoring"
                                    value={editForm.data.scoring_type}
                                    onChange={(e) => editForm.setData('scoring_type', e.target.value)}
                                    className="text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-penalty" className="text-xs font-semibold">
                                    Penalty Label (Optional)
                                </Label>
                                <Input
                                    id="edit-penalty"
                                    value={editForm.data.penalty_label}
                                    onChange={(e) => editForm.setData('penalty_label', e.target.value)}
                                    className="text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="edit-active"
                                checked={editForm.data.is_active}
                                onCheckedChange={(checked) =>
                                    editForm.setData('is_active', Boolean(checked))
                                }
                            />
                            <Label
                                htmlFor="edit-active"
                                className="text-xs font-medium cursor-pointer"
                            >
                                Active and available for candidates in Mock Exam Hall
                            </Label>
                        </div>

                        <DialogFooter className="pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={editForm.processing}
                                className="bg-[#0066FF] text-white hover:bg-[#0052cc] dark:bg-cyan-600 dark:hover:bg-cyan-500"
                            >
                                {editForm.processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DELETE CONFIRMATION MODAL */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="size-5" />
                            <DialogTitle className="text-base font-bold">
                                Delete Exam Pathway Blueprint
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs leading-relaxed pt-2">
                            Are you sure you want to delete{' '}
                            <strong className="text-foreground font-bold">
                                {activePathway?.name} ({activePathway?.code})
                            </strong>
                            ?
                            <br />
                            <br />
                            Questions tagged with this pathway code will remain safe in the question bank, but this pathway blueprint will no longer appear in the candidate portal.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="pt-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => setIsDeleteOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={handleDeleteConfirm}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Blueprint'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

