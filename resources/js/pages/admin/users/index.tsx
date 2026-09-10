import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Users,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Calendar,
    Target,
    Activity,
    CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface UserItem {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    active_pathway: string;
    target_exam_date: string | null;
    daily_study_hours: number;
    daily_mcq_target: number;
    created_at: string;
    test_sessions_count: number;
    question_attempts_count: number;
}

interface UsersIndexProps {
    users: {
        data: UserItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        search: string;
    };
    current_user_id: number;
}

export default function UsersIndex({
    users,
    filters,
    current_user_id,
}: UsersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = () => {
        router.get('/admin/users', { search }, { preserveState: true });
    };

    const handleToggleAdmin = (u: UserItem) => {
        if (u.id === current_user_id) {
            alert('You cannot revoke your own administrator role.');
            return;
        }

        const action = u.is_admin ? 'revoke administrator privileges from' : 'grant administrator privileges to';
        if (confirm(`Are you sure you want to ${action} ${u.name}?`)) {
            router.post(`/admin/users/${u.id}/toggle-admin`, {}, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Candidate & User Directory — Cortex Admin" />

            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                            <Users className="size-4" />
                            <span>Candidate Accounts, Readiness Trajectories &amp; Faculty Permissions</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                            Candidate Directory &amp; Role Management
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Audit enrolled medical doctors, examination targets, study metrics, and administrator privileges.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-bold py-1 px-3">
                            Total Candidates: {users.total}
                        </Badge>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search candidate by name or email..."
                            className="pl-9 text-xs"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>

                    <Button size="sm" onClick={handleSearch} className="bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-bold px-4">
                        Search
                    </Button>
                </div>

                {/* Users Table */}
                <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Candidate / Doctor</th>
                                    <th className="py-3 px-4">Active Pathway</th>
                                    <th className="py-3 px-4">Daily Targets</th>
                                    <th className="py-3 px-4 text-center">Attempts</th>
                                    <th className="py-3 px-4 text-center">Mocks</th>
                                    <th className="py-3 px-4 text-center">Role</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.data.map((u) => (
                                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                                                <span>{u.name}</span>
                                                {u.id === current_user_id && (
                                                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">(You)</span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground font-mono">{u.email}</div>
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <Badge variant="outline" className="font-mono text-[10px] font-bold border-sky-300 text-sky-700 dark:text-sky-300">
                                                {u.active_pathway || 'INI_CET'}
                                            </Badge>
                                        </td>

                                        <td className="py-3.5 px-4 text-muted-foreground">
                                            <div className="font-semibold text-foreground">
                                                {u.daily_study_hours || 0} hrs / day
                                            </div>
                                            <div className="text-[10px]">
                                                {u.daily_mcq_target || 0} MCQs target
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4 text-center font-bold text-foreground">
                                            {u.question_attempts_count}
                                        </td>

                                        <td className="py-3.5 px-4 text-center font-bold text-foreground">
                                            {u.test_sessions_count}
                                        </td>

                                        <td className="py-3.5 px-4 text-center">
                                            {u.is_admin ? (
                                                <Badge className="bg-purple-600 hover:bg-purple-600 text-white font-bold text-[10px] gap-1">
                                                    <ShieldCheck className="size-3" />
                                                    Admin
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-[10px] text-muted-foreground">
                                                    Candidate
                                                </Badge>
                                            )}
                                        </td>

                                        <td className="py-3.5 px-4 text-right">
                                            {u.id !== current_user_id ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleToggleAdmin(u)}
                                                    className={`h-7 text-[11px] font-bold ${
                                                        u.is_admin
                                                            ? 'text-destructive hover:bg-destructive/10 border-destructive/30'
                                                            : 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 border-purple-300'
                                                    }`}
                                                >
                                                    {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                                                </Button>
                                            ) : (
                                                <span className="text-[11px] text-muted-foreground italic">Current Account</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.links.length > 3 && (
                        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/10 text-xs">
                            <div className="text-muted-foreground">
                                Page <span className="font-bold text-foreground">{users.current_page}</span> of{' '}
                                <span className="font-bold text-foreground">{users.last_page}</span>
                            </div>

                            <div className="flex items-center gap-1">
                                {users.links.map((link, idx) => (
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
            </div>
        </>
    );
}
