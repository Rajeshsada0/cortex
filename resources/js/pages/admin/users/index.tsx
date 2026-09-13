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

        const action = u.is_admin
            ? 'revoke administrator privileges from'
            : 'grant administrator privileges to';
        if (confirm(`Are you sure you want to ${action} ${u.name}?`)) {
            router.post(
                `/admin/users/${u.id}/toggle-admin`,
                {},
                { preserveScroll: true },
            );
        }
    };

    return (
        <>
            <Head title="Candidate & User Directory — Cortex Admin" />

            <div className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="border-border flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-1 inline-flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                            <Users className="size-4" />
                            <span>
                                Candidate Accounts, Readiness Trajectories &amp;
                                Faculty Permissions
                            </span>
                        </div>
                        <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                            Candidate Directory &amp; Role Management
                        </h1>
                        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                            Audit enrolled medical doctors, examination targets,
                            study metrics, and administrator privileges.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="px-3 py-1 text-xs font-bold"
                        >
                            Total Candidates: {users.total}
                        </Badge>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="border-border bg-card flex items-center justify-between gap-4 rounded-2xl border p-4 shadow-xs">
                    <div className="relative w-full max-w-md">
                        <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search candidate by name or email..."
                            className="pl-9 text-xs"
                            onKeyDown={(e) =>
                                e.key === 'Enter' && handleSearch()
                            }
                        />
                    </div>

                    <Button
                        size="sm"
                        onClick={handleSearch}
                        className="bg-[#0066FF] px-4 text-xs font-bold text-white hover:bg-[#0052cc]"
                    >
                        Search
                    </Button>
                </div>

                {/* Users Table */}
                <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-muted/40 border-border text-muted-foreground border-b text-[11px] font-bold tracking-wider uppercase">
                                <tr>
                                    <th className="px-4 py-3">
                                        Candidate / Doctor
                                    </th>
                                    <th className="px-4 py-3">
                                        Active Pathway
                                    </th>
                                    <th className="px-4 py-3">Daily Targets</th>
                                    <th className="px-4 py-3 text-center">
                                        Attempts
                                    </th>
                                    <th className="px-4 py-3 text-center">
                                        Mocks
                                    </th>
                                    <th className="px-4 py-3 text-center">
                                        Role
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-border divide-y">
                                {users.data.map((u) => (
                                    <tr
                                        key={u.id}
                                        className="hover:bg-muted/20 transition-colors"
                                    >
                                        <td className="px-4 py-3.5">
                                            <div className="text-foreground flex items-center gap-1.5 text-sm font-bold">
                                                <span>{u.name}</span>
                                                {u.id === current_user_id && (
                                                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
                                                        (You)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-muted-foreground font-mono text-[11px]">
                                                {u.email}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <Badge
                                                variant="outline"
                                                className="border-sky-300 font-mono text-[10px] font-bold text-sky-700 dark:text-sky-300"
                                            >
                                                {u.active_pathway || 'INI_CET'}
                                            </Badge>
                                        </td>

                                        <td className="text-muted-foreground px-4 py-3.5">
                                            <div className="text-foreground font-semibold">
                                                {u.daily_study_hours || 0} hrs /
                                                day
                                            </div>
                                            <div className="text-[10px]">
                                                {u.daily_mcq_target || 0} MCQs
                                                target
                                            </div>
                                        </td>

                                        <td className="text-foreground px-4 py-3.5 text-center font-bold">
                                            {u.question_attempts_count}
                                        </td>

                                        <td className="text-foreground px-4 py-3.5 text-center font-bold">
                                            {u.test_sessions_count}
                                        </td>

                                        <td className="px-4 py-3.5 text-center">
                                            {u.is_admin ? (
                                                <Badge className="gap-1 bg-purple-600 text-[10px] font-bold text-white hover:bg-purple-600">
                                                    <ShieldCheck className="size-3" />
                                                    Admin
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-muted-foreground text-[10px]"
                                                >
                                                    Candidate
                                                </Badge>
                                            )}
                                        </td>

                                        <td className="px-4 py-3.5 text-right">
                                            {u.id !== current_user_id ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleToggleAdmin(u)
                                                    }
                                                    className={`h-7 text-[11px] font-bold ${
                                                        u.is_admin
                                                            ? 'text-destructive hover:bg-destructive/10 border-destructive/30'
                                                            : 'border-purple-300 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                                                    }`}
                                                >
                                                    {u.is_admin
                                                        ? 'Revoke Admin'
                                                        : 'Make Admin'}
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground text-[11px] italic">
                                                    Current Account
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.links.length > 3 && (
                        <div className="border-border bg-muted/10 flex items-center justify-between border-t p-4 text-xs">
                            <div className="text-muted-foreground">
                                Page{' '}
                                <span className="text-foreground font-bold">
                                    {users.current_page}
                                </span>{' '}
                                of{' '}
                                <span className="text-foreground font-bold">
                                    {users.last_page}
                                </span>
                            </div>

                            <div className="flex items-center gap-1">
                                {users.links.map((link, idx) => (
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
            </div>
        </>
    );
}
