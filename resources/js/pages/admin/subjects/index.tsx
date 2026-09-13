import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Plus,
    Edit2,
    Trash2,
    Layers,
    HelpCircle,
    ArrowUpDown,
    Check,
    AlertTriangle,
    Stethoscope,
    Activity,
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

interface SubjectItem {
    id: number;
    name: string;
    slug: string;
    icon_key: string;
    order_index: number;
    topics_count: number;
    questions_count: number;
    created_at: string;
}

interface SubjectsIndexProps {
    subjects: SubjectItem[];
}

export default function SubjectsIndex({ subjects }: SubjectsIndexProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(
        null,
    );
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [iconKey, setIconKey] = useState('BookOpen');
    const [orderIndex, setOrderIndex] = useState(1);
    const [processing, setProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const openCreateDialog = () => {
        setEditingSubject(null);
        setName('');
        setSlug('');
        setIconKey('BookOpen');
        setOrderIndex(
            (subjects.length
                ? Math.max(...subjects.map((s) => s.order_index))
                : 0) + 1,
        );
        setErrorMsg('');
        setIsDialogOpen(true);
    };

    const openEditDialog = (subj: SubjectItem) => {
        setEditingSubject(subj);
        setName(subj.name);
        setSlug(subj.slug);
        setIconKey(subj.icon_key || 'BookOpen');
        setOrderIndex(subj.order_index);
        setErrorMsg('');
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrorMsg('');

        if (editingSubject) {
            router.put(
                `/admin/subjects/${editingSubject.id}`,
                { name, slug, icon_key: iconKey, order_index: orderIndex },
                {
                    onSuccess: () => {
                        setIsDialogOpen(false);
                        setProcessing(false);
                    },
                    onError: (errors) => {
                        setProcessing(false);
                        setErrorMsg(Object.values(errors)[0] as string);
                    },
                },
            );
        } else {
            router.post(
                '/admin/subjects',
                { name, slug, icon_key: iconKey, order_index: orderIndex },
                {
                    onSuccess: () => {
                        setIsDialogOpen(false);
                        setProcessing(false);
                    },
                    onError: (errors) => {
                        setProcessing(false);
                        setErrorMsg(Object.values(errors)[0] as string);
                    },
                },
            );
        }
    };

    const handleDelete = (subj: SubjectItem) => {
        if (
            confirm(
                `Are you sure you want to delete "${subj.name}"? This action cannot be undone.`,
            )
        ) {
            router.delete(`/admin/subjects/${subj.id}`);
        }
    };

    return (
        <>
            <Head title="Manage Subjects — Cortex Admin" />

            <div className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="border-border flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-1 inline-flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400">
                            <BookOpen className="size-4" />
                            <span>
                                19-Subject Postgraduate Curriculum Directory
                            </span>
                        </div>
                        <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                            Postgraduate Medical Subjects
                        </h1>
                        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                            Maintain the curriculum hierarchy across basic
                            sciences, paraclinical specialties, and clinical
                            disciplines.
                        </p>
                    </div>

                    <Button
                        onClick={openCreateDialog}
                        className="shrink-0 gap-1.5 bg-[#0066FF] text-xs font-bold text-white shadow-md hover:bg-[#0052cc]"
                    >
                        <Plus className="size-4" />
                        Add New Subject
                    </Button>
                </div>

                {/* Subjects Table */}
                <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-muted/40 border-border text-muted-foreground border-b text-[11px] font-bold tracking-wider uppercase">
                                <tr>
                                    <th className="w-16 px-4 py-3"># Order</th>
                                    <th className="px-4 py-3">
                                        Subject Name &amp; Slug
                                    </th>
                                    <th className="px-4 py-3">Icon Key</th>
                                    <th className="px-4 py-3 text-center">
                                        Topics Mapped
                                    </th>
                                    <th className="px-4 py-3 text-center">
                                        Questions
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-border divide-y">
                                {subjects.map((subj) => (
                                    <tr
                                        key={subj.id}
                                        className="hover:bg-muted/20 transition-colors"
                                    >
                                        <td className="text-muted-foreground px-4 py-3.5 font-mono font-bold">
                                            #{subj.order_index}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="text-foreground text-sm font-bold">
                                                {subj.name}
                                            </div>
                                            <div className="text-muted-foreground font-mono text-[11px]">
                                                {subj.slug}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <Badge
                                                variant="outline"
                                                className="font-mono text-[10px] font-medium"
                                            >
                                                {subj.icon_key || 'BookOpen'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <Link
                                                href={`/admin/topics?subject_id=${subj.id}`}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:underline dark:text-sky-400"
                                            >
                                                <Layers className="size-3.5" />
                                                <span>
                                                    {subj.topics_count} Topics
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <Link
                                                href={`/admin/questions?subject_id=${subj.id}`}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                                            >
                                                <HelpCircle className="size-3.5" />
                                                <span>
                                                    {subj.questions_count} Qs
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-2 text-xs font-semibold hover:text-sky-600"
                                                    onClick={() =>
                                                        openEditDialog(subj)
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
                                                        handleDelete(subj)
                                                    }
                                                >
                                                    <Trash2 className="mr-1 size-3.5" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create / Edit Subject Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">
                                {editingSubject
                                    ? 'Edit Subject'
                                    : 'Add New Medical Subject'}
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Configure curriculum details and syllabus order
                                index.
                            </DialogDescription>
                        </DialogHeader>

                        <form
                            onSubmit={handleSubmit}
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
                                    htmlFor="subject-name"
                                    className="text-xs font-bold"
                                >
                                    Subject Name
                                </Label>
                                <Input
                                    id="subject-name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (!editingSubject) {
                                            setSlug(
                                                e.target.value
                                                    .toLowerCase()
                                                    .replace(/[^a-z0-9]+/g, '-')
                                                    .replace(/^-|-$/g, ''),
                                            );
                                        }
                                    }}
                                    placeholder="e.g., General Pathology"
                                    required
                                    className="text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="subject-slug"
                                    className="text-xs font-bold"
                                >
                                    URL Slug
                                </Label>
                                <Input
                                    id="subject-slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="e.g., general-pathology"
                                    required
                                    className="font-mono text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="subject-icon"
                                        className="text-xs font-bold"
                                    >
                                        Icon Key
                                    </Label>
                                    <Input
                                        id="subject-icon"
                                        value={iconKey}
                                        onChange={(e) =>
                                            setIconKey(e.target.value)
                                        }
                                        placeholder="BookOpen, Heart, Activity..."
                                        className="text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="subject-order"
                                        className="text-xs font-bold"
                                    >
                                        Order Index
                                    </Label>
                                    <Input
                                        id="subject-order"
                                        type="number"
                                        value={orderIndex}
                                        onChange={(e) =>
                                            setOrderIndex(
                                                parseInt(e.target.value) || 1,
                                            )
                                        }
                                        className="text-xs"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="text-xs font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#0066FF] text-xs font-bold text-white hover:bg-[#0052cc]"
                                >
                                    {editingSubject
                                        ? 'Save Changes'
                                        : 'Create Subject'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
