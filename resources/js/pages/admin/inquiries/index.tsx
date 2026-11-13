import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Headset,
    Mail,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertCircle,
    AlertTriangle,
    Trash2,
    MessageSquare,
    User,
    ExternalLink,
    Save,
    Calendar,
    Tag,
    Download,
    Plus,
    Send,
    Loader2,
    Sparkles,
    ShieldAlert,
    Check,
    CheckCheck,
    FileText,
    ArrowUpDown,
    RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Inquiry {
    id: number;
    ticket_number?: string | null;
    user_id?: number | null;
    name: string;
    email: string;
    category: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent' | string | null;
    message: string;
    reply?: string | null;
    replied_at?: string | null;
    assigned_to?: string | null;
    status: 'pending' | 'in_progress' | 'resolved';
    admin_notes?: string | null;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
        active_pathway?: string;
    } | null;
}

interface InquiriesIndexProps {
    inquiries: {
        data: Inquiry[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats: {
        total: number;
        pending: number;
        in_progress: number;
        resolved: number;
        urgent?: number;
        errata_count?: number;
    };
    filters: {
        status: string;
        category: string;
        priority: string;
        search: string;
    };
}

export default function AdminInquiriesIndex({
    inquiries,
    stats,
    filters,
}: InquiriesIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeInquiry, setActiveInquiry] = useState<Inquiry | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    // Review / Reply Modal Form State
    const [editStatus, setEditStatus] = useState<'pending' | 'in_progress' | 'resolved'>('pending');
    const [editPriority, setEditPriority] = useState<string>('normal');
    const [editReply, setEditReply] = useState<string>('');
    const [editAssignedTo, setEditAssignedTo] = useState<string>('');
    const [adminNotes, setAdminNotes] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState(false);

    // New Ticket Form State
    const [newTicket, setNewTicket] = useState({
        name: '',
        email: '',
        category: 'Clinical Question Query',
        priority: 'normal',
        status: 'pending',
        assigned_to: 'Clinical Board',
        message: '',
        admin_notes: '',
    });
    const [isCreating, setIsCreating] = useState(false);

    // Preset Response Templates for Medical Examination Faculty
    const responseTemplates = [
        {
            label: 'Errata Verified & Corrected',
            text: 'Thank you for your rigorous review. Our Clinical Review Board has verified your erratum report. The vignette stem, options, and 3-tier rationale have been corrected in the master database.',
        },
        {
            label: 'Rationale Clarification',
            text: 'Thank you for reaching out. Per current licensure guidelines (Harrison\'s Principles 21st Ed. / First Aid 2026), the specified option is preferred because the diagnostic sensitivity exceeds alternative markers.',
        },
        {
            label: 'Technical Cache Cleared',
            text: 'The platform synchronization issue has been resolved. We have cleared the server-side spaced repetition queue cache. Please refresh your browser or app to see the updated status.',
        },
        {
            label: 'Under Board Review',
            text: 'Your query has been escalated to our Academic Examination Committee for review in the upcoming curriculum calibration cycle.',
        },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/inquiries',
            { ...filters, search },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterChange = (key: 'status' | 'category' | 'priority', value: string) => {
        router.get(
            '/admin/inquiries',
            { ...filters, [key]: value, search },
            { preserveState: true, replace: true }
        );
    };

    const openManageModal = (inquiry: Inquiry) => {
        setActiveInquiry(inquiry);
        setEditStatus(inquiry.status);
        setEditPriority(inquiry.priority || 'normal');
        setEditReply(inquiry.reply || '');
        setEditAssignedTo(inquiry.assigned_to || 'Clinical Board');
        setAdminNotes(inquiry.admin_notes || '');
    };

    const handleUpdateTicket = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeInquiry) return;

        setIsUpdating(true);
        router.patch(
            `/admin/inquiries/${activeInquiry.id}/status`,
            {
                status: editStatus,
                priority: editPriority,
                reply: editReply,
                assigned_to: editAssignedTo,
                admin_notes: adminNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Ticket ${activeInquiry.ticket_number || ('#' + activeInquiry.id)} updated successfully.`);
                    setActiveInquiry(null);
                },
                onError: () => {
                    toast.error('Failed to update ticket.');
                },
                onFinish: () => setIsUpdating(false),
            }
        );
    };

    const handleQuickResolve = (inquiry: Inquiry) => {
        router.patch(
            `/admin/inquiries/${inquiry.id}/status`,
            {
                status: 'resolved',
                admin_notes: (inquiry.admin_notes ? inquiry.admin_notes + '\n' : '') + 'Quick marked as resolved by faculty admin.',
            },
            {
                preserveScroll: true,
                onSuccess: () => toast.success(`Ticket ${inquiry.ticket_number || ('#' + inquiry.id)} marked as resolved.`),
            }
        );
    };

    const handleCreateTicket = (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        router.post('/admin/inquiries', newTicket, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('New ticket created successfully.');
                setCreateModalOpen(false);
                setNewTicket({
                    name: '',
                    email: '',
                    category: 'Clinical Question Query',
                    priority: 'normal',
                    status: 'pending',
                    assigned_to: 'Clinical Board',
                    message: '',
                    admin_notes: '',
                });
            },
            onError: () => toast.error('Failed to create ticket. Please check input fields.'),
            onFinish: () => setIsCreating(false),
        });
    };

    const handleDelete = (id: number, ticketNum: string) => {
        if (!confirm(`Are you sure you want to permanently delete ticket ${ticketNum}?`)) return;
        router.delete(`/admin/inquiries/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Inquiry permanently removed.'),
        });
    };

    const getPriorityBadge = (priority?: string | null) => {
        switch (priority) {
            case 'urgent':
                return (
                    <span className="inline-flex items-center gap-1 rounded-md border border-rose-400 bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                        <AlertTriangle className="h-3 w-3 animate-pulse text-rose-600" />
                        URGENT
                    </span>
                );
            case 'high':
                return (
                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-400 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                        HIGH
                    </span>
                );
            case 'low':
                return (
                    <span className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-900/40 dark:text-slate-400">
                        LOW
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded-md border border-sky-300 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                        NORMAL
                    </span>
                );
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending Triage
                    </Badge>
                );
            case 'in_progress':
                return (
                    <Badge variant="outline" className="border-sky-400 bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        In Progress
                    </Badge>
                );
            case 'resolved':
                return (
                    <Badge variant="outline" className="border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Resolved
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <>
            <Head title="Candidate Support & Clinical Helpdesk — Faculty Admin" />

            <div className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Action Toolbar */}
                <div className="flex items-center justify-end">
                    <div className="flex items-center gap-2">
                        <a href="/admin/inquiries/export">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg border-border text-xs font-medium gap-1.5 hover:bg-muted"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Export CSV
                            </Button>
                        </a>
                        <Button
                            onClick={() => setCreateModalOpen(true)}
                            size="sm"
                            className="h-8 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            New Ticket
                        </Button>
                    </div>
                </div>

                {/* 5 KPI Metric Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
                    <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Total Inquiries
                        </span>
                        <div className="mt-1 text-xl font-bold text-foreground">
                            {stats.total}
                        </div>
                        <span className="text-[10px] text-muted-foreground">All logged tickets</span>
                    </div>

                    <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 shadow-2xs dark:border-amber-900/40 dark:bg-amber-950/20">
                        <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                            Pending Review
                        </span>
                        <div className="mt-1 text-xl font-bold text-amber-700 dark:text-amber-400">
                            {stats.pending}
                        </div>
                        <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80">Awaiting review</span>
                    </div>

                    <div className="rounded-xl border border-sky-200/80 bg-sky-50/50 p-3.5 shadow-2xs dark:border-sky-900/40 dark:bg-sky-950/20">
                        <span className="text-[11px] font-semibold text-sky-800 dark:text-sky-300 uppercase tracking-wider">
                            In Progress
                        </span>
                        <div className="mt-1 text-xl font-bold text-sky-700 dark:text-sky-400">
                            {stats.in_progress}
                        </div>
                        <span className="text-[10px] text-sky-600/80 dark:text-sky-400/80">Under investigation</span>
                    </div>

                    <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 shadow-2xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
                        <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                            Resolved
                        </span>
                        <div className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-400">
                            {stats.resolved}
                        </div>
                        <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">Closed &amp; answered</span>
                    </div>

                    <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5 shadow-2xs dark:border-rose-900/40 dark:bg-rose-950/20">
                        <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                            Errata Reports
                        </span>
                        <div className="mt-1 text-xl font-bold text-rose-700 dark:text-rose-400">
                            {stats.errata_count ?? 0}
                        </div>
                        <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80">Question stem checks</span>
                    </div>
                </div>

                {/* Search & Multifaceted Filter Bar */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-2xs">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                        {/* Search Input */}
                        <form onSubmit={handleSearch} className="relative flex-1 max-w-lg">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by Ticket ID (#MED-1001), Candidate, Email, or Question query..."
                                className="h-9 pl-9 text-xs rounded-xl"
                            />
                        </form>

                        {/* Dropdown Filters */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Category Filter */}
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="all">All Categories</option>
                                <option value="Clinical Question Query">Clinical Question Query (Errata)</option>
                                <option value="Technical Support">Technical Support</option>
                                <option value="Course & Pathway Help">Course &amp; Pathway Help</option>
                                <option value="Billing & License">Billing &amp; License</option>
                                <option value="General Feedback">General Feedback</option>
                            </select>

                            {/* Priority Filter */}
                            <select
                                value={filters.priority}
                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                                className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="all">All Priorities</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="normal">Normal</option>
                                <option value="low">Low</option>
                            </select>

                            {(filters.status !== 'all' || filters.category !== 'all' || filters.priority !== 'all' || filters.search) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/admin/inquiries', {}, { replace: true })}
                                    className="h-9 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Status Tabs Bar */}
                    <div className="flex items-center gap-1.5 border-t border-border pt-3">
                        <span className="text-[11px] font-bold text-muted-foreground mr-1 uppercase tracking-wider">
                            Status:
                        </span>
                        {[
                            { key: 'all', label: 'All Inquiries', count: stats.total },
                            { key: 'pending', label: 'Pending Triage', count: stats.pending },
                            { key: 'in_progress', label: 'In Progress', count: stats.in_progress },
                            { key: 'resolved', label: 'Resolved', count: stats.resolved },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleFilterChange('status', tab.key)}
                                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                                    filters.status === tab.key
                                        ? 'bg-teal-600 text-white shadow-2xs'
                                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                                        filters.status === tab.key
                                            ? 'bg-white/20 text-white'
                                            : 'bg-background text-muted-foreground'
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Inquiries Table */}
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Ticket</th>
                                    <th className="py-3 px-4">Candidate Doctor</th>
                                    <th className="py-3 px-4">Category &amp; Priority</th>
                                    <th className="py-3 px-4">Inquiry Summary</th>
                                    <th className="py-3 px-4">Assigned / Faculty</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {inquiries.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center text-muted-foreground">
                                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                                                <Headset className="h-7 w-7" />
                                            </div>
                                            <p className="text-sm font-bold text-foreground">No candidate tickets found</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Try adjusting your filter keywords or create a new inquiry above.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    inquiries.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-muted/40 transition-colors group">
                                            {/* Ticket ID */}
                                            <td className="py-3.5 px-4 font-mono font-bold text-teal-700 dark:text-teal-400">
                                                {item.ticket_number || `#MED-${1000 + item.id}`}
                                            </td>

                                            {/* Candidate Info */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 font-extrabold text-teal-800 text-xs dark:bg-teal-950 dark:text-teal-300">
                                                        {item.name ? item.name.charAt(0).toUpperCase() : 'D'}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-bold text-foreground truncate max-w-[150px]">
                                                            {item.name}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                                                            {item.email}
                                                        </span>
                                                        {item.user?.active_pathway && (
                                                            <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                                                                {item.user.active_pathway.replace('_', ' ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category & Priority */}
                                            <td className="py-3.5 px-4 space-y-1">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] font-semibold bg-muted text-foreground block w-fit"
                                                >
                                                    {item.category}
                                                </Badge>
                                                <div>{getPriorityBadge(item.priority)}</div>
                                            </td>

                                            {/* Message Body Snippet */}
                                            <td className="py-3.5 px-4 max-w-xs">
                                                <p className="line-clamp-2 text-foreground/90 leading-relaxed font-medium">
                                                    {item.message}
                                                </p>
                                                {item.reply && (
                                                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                                        <CheckCheck className="h-3 w-3" />
                                                        <span>Faculty Replied</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Assigned To */}
                                            <td className="py-3.5 px-4 whitespace-nowrap text-muted-foreground font-medium">
                                                {item.assigned_to || 'Unassigned'}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {getStatusBadge(item.status)}
                                            </td>

                                            {/* Date */}
                                            <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                                                {new Date(item.created_at).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openManageModal(item)}
                                                        className="h-8 rounded-xl text-xs font-bold gap-1 bg-background hover:bg-muted"
                                                    >
                                                        Review &amp; Reply
                                                    </Button>

                                                    {item.status !== 'resolved' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleQuickResolve(item)}
                                                            title="Quick mark as resolved"
                                                            className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(item.id, item.ticket_number || ('#' + item.id))}
                                                        className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {inquiries.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
                            <span>
                                Showing page {inquiries.current_page} of {inquiries.last_page} ({inquiries.total} total inquiries)
                            </span>
                            <div className="flex gap-1">
                                {inquiries.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveState
                                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                                            link.active
                                                ? 'bg-teal-600 text-white'
                                                : 'hover:bg-muted text-muted-foreground'
                                        } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 1. TICKET INSPECTOR & FACULTY REPLY MODAL */}
                {activeInquiry && (
                    <Dialog open={Boolean(activeInquiry)} onOpenChange={(open) => !open && setActiveInquiry(null)}>
                        <DialogContent className="max-w-2xl rounded-2xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
                            <DialogHeader className="space-y-1 pb-1 text-left">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
                                            <MessageSquare className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                                                <span>Ticket {activeInquiry.ticket_number || ('#' + activeInquiry.id)}</span>
                                                {getPriorityBadge(activeInquiry.priority)}
                                            </DialogTitle>
                                            <DialogDescription className="text-xs text-muted-foreground">
                                                Category: <strong className="text-foreground">{activeInquiry.category}</strong> • Logged{' '}
                                                {new Date(activeInquiry.created_at).toLocaleString()}
                                            </DialogDescription>
                                        </div>
                                    </div>
                                    <div>{getStatusBadge(activeInquiry.status)}</div>
                                </div>
                            </DialogHeader>

                            {/* Candidate Profile Details Card */}
                            <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3.5 space-y-2 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-muted-foreground block text-[11px] font-semibold">Candidate Doctor:</span>
                                        <span className="font-bold text-foreground text-sm">{activeInquiry.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-[11px] font-semibold">Reply Email Address:</span>
                                        <a href={`mailto:${activeInquiry.email}`} className="font-semibold text-teal-600 hover:underline">
                                            {activeInquiry.email}
                                        </a>
                                    </div>
                                </div>
                                {activeInquiry.user?.active_pathway && (
                                    <div className="border-t border-border/50 pt-2 flex items-center gap-2">
                                        <span className="text-muted-foreground text-[11px]">Target Licensure Track:</span>
                                        <Badge variant="outline" className="text-[10px] font-semibold border-sky-400 text-sky-700 bg-sky-50 dark:bg-sky-950/40">
                                            {activeInquiry.user.active_pathway.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Candidate Message Body */}
                            <div className="mt-3 space-y-1 text-left">
                                <Label className="text-xs font-bold text-foreground">Candidate Clinical Query / Message:</Label>
                                <div className="rounded-xl border border-border bg-card p-3.5 text-xs text-foreground whitespace-pre-wrap leading-relaxed shadow-2xs">
                                    {activeInquiry.message}
                                </div>
                            </div>

                            {/* Faculty Response / Reply Composer */}
                            <form onSubmit={handleUpdateTicket} className="mt-4 space-y-4 text-left">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="faculty-reply" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Send className="h-3.5 w-3.5 text-teal-600" />
                                            Official Faculty Response / Resolution Message:
                                        </Label>
                                        <span className="text-[10px] text-muted-foreground">Logged as official reply</span>
                                    </div>

                                    {/* Medical Quick Template Chips */}
                                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                                        {responseTemplates.map((tmpl) => (
                                            <button
                                                key={tmpl.label}
                                                type="button"
                                                onClick={() => {
                                                    setEditReply(tmpl.text);
                                                    setEditStatus('resolved');
                                                }}
                                                className="rounded-lg border border-teal-200/80 bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-800 hover:bg-teal-100 transition-colors dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300"
                                            >
                                                + {tmpl.label}
                                            </button>
                                        ))}
                                    </div>

                                    <Textarea
                                        id="faculty-reply"
                                        value={editReply}
                                        onChange={(e) => setEditReply(e.target.value)}
                                        placeholder="Type candidate resolution, cite medical textbook (e.g. Harrison's 21st Ed. / Robbins Path), or confirm errata correction..."
                                        className="min-h-[90px] rounded-xl text-xs leading-relaxed"
                                    />
                                    {activeInquiry.replied_at && (
                                        <p className="text-[10px] text-muted-foreground">
                                            Last replied on: {new Date(activeInquiry.replied_at).toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                {/* Status, Priority & Assignment Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* Status */}
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-foreground">Status:</Label>
                                        <select
                                            value={editStatus}
                                            onChange={(e) => setEditStatus(e.target.value as any)}
                                            className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-bold"
                                        >
                                            <option value="pending">Pending Triage</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                    </div>

                                    {/* Priority */}
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-foreground">Priority:</Label>
                                        <select
                                            value={editPriority}
                                            onChange={(e) => setEditPriority(e.target.value)}
                                            className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-bold"
                                        >
                                            <option value="low">Low</option>
                                            <option value="normal">Normal</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent / Critical Errata</option>
                                        </select>
                                    </div>

                                    {/* Assigned Faculty */}
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-foreground">Assigned Faculty:</Label>
                                        <Input
                                            value={editAssignedTo}
                                            onChange={(e) => setEditAssignedTo(e.target.value)}
                                            placeholder="e.g. Dr. Aayush / Clinical Board"
                                            className="h-9 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                {/* Internal Faculty Notes */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-foreground">Internal Clinical / Admin Notes (Private):</Label>
                                    <Textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Private notes for examination committee, rationale references, bug ticket IDs..."
                                        className="min-h-[70px] rounded-xl text-xs"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setActiveInquiry(null)}
                                        className="rounded-xl text-xs"
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
                                    >
                                        {isUpdating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                                        Save Ticket Changes
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}

                {/* 2. MANUAL TICKET CREATOR MODAL */}
                <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                    <DialogContent className="max-w-lg rounded-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="space-y-1 pb-1 text-left">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                                        Log New Candidate Ticket
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground">
                                        Manually record an inquiry received via phone, Discord, or clinical committee
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleCreateTicket} className="mt-3 space-y-3.5 text-left">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Candidate Name</Label>
                                    <Input
                                        value={newTicket.name}
                                        onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                                        placeholder="Dr. Candidate"
                                        className="h-9 rounded-xl text-xs"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Candidate Email</Label>
                                    <Input
                                        type="email"
                                        value={newTicket.email}
                                        onChange={(e) => setNewTicket({ ...newTicket, email: e.target.value })}
                                        placeholder="candidate@hospital.edu"
                                        className="h-9 rounded-xl text-xs"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Category</Label>
                                    <select
                                        value={newTicket.category}
                                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                        className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs"
                                    >
                                        <option value="Clinical Question Query">Clinical Question Query (Errata)</option>
                                        <option value="Technical Support">Technical Support</option>
                                        <option value="Course & Pathway Help">Course &amp; Pathway Help</option>
                                        <option value="Billing & License">Billing &amp; License</option>
                                        <option value="General Feedback">General Feedback</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Priority</Label>
                                    <select
                                        value={newTicket.priority}
                                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                        className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs"
                                    >
                                        <option value="low">Low</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Inquiry Details / Errata Stem</Label>
                                <Textarea
                                    value={newTicket.message}
                                    onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                                    placeholder="Describe the clinical issue, question number, or technical request..."
                                    className="min-h-[90px] rounded-xl text-xs leading-relaxed"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Initial Status</Label>
                                    <select
                                        value={newTicket.status}
                                        onChange={(e) => setNewTicket({ ...newTicket, status: e.target.value })}
                                        className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs"
                                    >
                                        <option value="pending">Pending Triage</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Assigned To</Label>
                                    <Input
                                        value={newTicket.assigned_to}
                                        onChange={(e) => setNewTicket({ ...newTicket, assigned_to: e.target.value })}
                                        placeholder="Clinical Board"
                                        className="h-9 rounded-xl text-xs"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-border">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="rounded-xl text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isCreating}
                                    className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
                                >
                                    {isCreating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                                    Create Ticket
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
