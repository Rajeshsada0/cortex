import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    Award,
    CheckCircle2,
    Clock,
    FileText,
    HelpCircle,
    Pencil,
    Plus,
    Search,
    Stethoscope,
    Trash2,
    XCircle,
    Eye,
    SlidersHorizontal,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ScenarioItem {
    id: number;
    title: string;
    discipline: string;
    pathway_code: string;
    vitals_preview: string | null;
    stem_preview: string;
    questions_count: number;
    order_index: number;
    is_active: boolean;
    created_at: string;
}

interface AdminCsqIndexProps {
    scenarios: ScenarioItem[];
    pathways: Array<{ code: string; name: string }>;
    disciplines: string[];
    filters: {
        pathway: string;
        discipline: string;
        search: string;
    };
    stats: {
        total_scenarios: number;
        active_scenarios: number;
        total_questions: number;
    };
}

export default function AdminCsqIndex({
    scenarios,
    pathways,
    disciplines,
    filters,
    stats,
}: AdminCsqIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [pathwayFilter, setPathwayFilter] = useState(filters.pathway || 'ALL');
    const [disciplineFilter, setDisciplineFilter] = useState(filters.discipline || 'ALL');

    // Delete confirmation dialog
    const [scenarioToDelete, setScenarioToDelete] = useState<ScenarioItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const applyFilters = (newPathway = pathwayFilter, newDiscipline = disciplineFilter, newSearch = search) => {
        router.get(
            '/admin/csq',
            {
                pathway: newPathway,
                discipline: newDiscipline,
                search: newSearch,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(pathwayFilter, disciplineFilter, search);
    };

    const handleToggleActive = (scenario: ScenarioItem) => {
        router.post(
            `/admin/csq/${scenario.id}/toggle-active`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Station "${scenario.title}" status updated.`);
                },
            }
        );
    };

    const confirmDelete = () => {
        if (!scenarioToDelete) return;
        setIsDeleting(true);
        router.delete(`/admin/csq/${scenarioToDelete.id}`, {
            onSuccess: () => {
                setIsDeleting(false);
                setScenarioToDelete(null);
                toast.success('Clinical Scenario Station removed successfully.');
            },
            onError: () => {
                setIsDeleting(false);
                toast.error('Failed to remove scenario station.');
            },
        });
    };

    return (
        <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <Head title="CSQ Clinical Scenarios - Admin Portal" />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                            <Stethoscope className="h-3.5 w-3.5" />
                            Clinical Examination CMS
                        </span>
                    </div>
                    <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                        Clinical Scenario Questions (CSQ)
                    </h1>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                        Manage clinical case stations, diagnostic markers, and 5-question sequential vignettes.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link href="/csq/runner">
                        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs font-semibold">
                            <Eye className="h-3.5 w-3.5" />
                            <span>Preview Exam Runner</span>
                        </Button>
                    </Link>
                    <Link href="/admin/csq/create">
                        <Button size="sm" className="gap-1.5 rounded-xl bg-cyan-600 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400">
                            <Plus className="h-4 w-4" />
                            <span>New CSQ Station</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Total Clinical Stations</span>
                        <FileText className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="mt-3 font-mono text-3xl font-black text-foreground">
                        {stats.total_scenarios}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {stats.active_scenarios} Active Stations
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Total Linked Questions</span>
                        <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="mt-3 font-mono text-3xl font-black text-foreground">
                        {stats.total_questions}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        5 MCQs per clinical scenario
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Target Pathway</span>
                        <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="mt-3 font-mono text-2xl font-bold text-foreground">
                        NMC Licensing
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        50% Passing Cutoff Standard
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
                <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search stations by title, discipline, or stem content..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 text-xs rounded-xl"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Pathway selector */}
                        <select
                            value={pathwayFilter}
                            onChange={(e) => {
                                setPathwayFilter(e.target.value);
                                applyFilters(e.target.value, disciplineFilter, search);
                            }}
                            className="h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                            <option value="ALL">All Pathways</option>
                            {pathways.map((p) => (
                                <option key={p.code} value={p.code}>
                                    {p.name}
                                </option>
                            ))}
                        </select>

                        {/* Discipline selector */}
                        <select
                            value={disciplineFilter}
                            onChange={(e) => {
                                setDisciplineFilter(e.target.value);
                                applyFilters(pathwayFilter, e.target.value, search);
                            }}
                            className="h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                            <option value="ALL">All Disciplines</option>
                            {disciplines.map((d) => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>

                        <Button type="submit" size="sm" variant="secondary" className="h-9 text-xs rounded-xl">
                            Filter
                        </Button>
                    </div>
                </form>
            </div>

            {/* Stations Table */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3.5">#</th>
                                <th className="px-4 py-3.5">Title &amp; Clinical Stem</th>
                                <th className="px-4 py-3.5">Discipline</th>
                                <th className="px-4 py-3.5">Pathway</th>
                                <th className="px-4 py-3.5">Questions</th>
                                <th className="px-4 py-3.5">Status</th>
                                <th className="px-4 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {scenarios.length > 0 ? (
                                scenarios.map((scenario, index) => (
                                    <tr key={scenario.id} className="hover:bg-muted/20">
                                        <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                                            {scenario.order_index || index + 1}
                                        </td>
                                        <td className="max-w-md px-4 py-4">
                                            <div className="font-semibold text-foreground">
                                                {scenario.title}
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                                {scenario.stem_preview}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                                                {scenario.discipline}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 font-mono text-xs">
                                            <Badge variant="outline" className="font-normal text-xs">
                                                {scenario.pathway_code || 'GLOBAL'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 font-mono text-xs font-semibold text-foreground">
                                            {scenario.questions_count} / 5 MCQs
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => handleToggleActive(scenario)}
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition ${
                                                    scenario.is_active
                                                        ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
                                                        : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 dark:text-slate-400'
                                                }`}
                                            >
                                                {scenario.is_active ? (
                                                    <>
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-3 w-3" />
                                                        Inactive
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link href={`/admin/csq/${scenario.id}/edit`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                                                        title="Edit Station"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setScenarioToDelete(scenario)}
                                                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-rose-600"
                                                    title="Delete Station"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                        No clinical scenario stations match the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={Boolean(scenarioToDelete)} onOpenChange={(open) => !open && setScenarioToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Clinical Scenario Station</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove &quot;{scenarioToDelete?.title}&quot;? All 5 linked multiple-choice
                            questions and associated rationales will be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setScenarioToDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Station'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
