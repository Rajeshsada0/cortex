import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Star,
    MessageSquare,
    Trash2,
    Award,
    TrendingUp,
    Heart,
    Smile,
    Calendar,
    User,
    CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface RatingItem {
    id: number;
    user_id?: number | null;
    name?: string | null;
    email?: string | null;
    rating: number;
    sentiment?: string | null;
    review?: string | null;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
        active_pathway?: string;
    } | null;
}

interface RatingsIndexProps {
    ratings: {
        data: RatingItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats: {
        total: number;
        average: number;
        stars_5: number;
        stars_4: number;
        stars_3: number;
        stars_2: number;
        stars_1: number;
    };
    ratingFilter: string;
}

export default function AdminRatingsIndex({
    ratings,
    stats,
    ratingFilter,
}: RatingsIndexProps) {
    const handleFilterChange = (filter: string) => {
        router.get(
            '/admin/ratings',
            filter === 'all' ? {} : { rating: filter },
            { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure you want to remove this rating?')) return;
        router.delete(`/admin/ratings/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Rating removed successfully.'),
        });
    };

    const total = stats.total || 1;

    return (
        <>
            <Head title="Candidate Ratings & Reviews — Faculty Admin" />

            <div className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Scorecard & Breakdown Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Average Score Card */}
                    <div className="flex flex-col items-center justify-center rounded-xl border border-amber-200/80 bg-gradient-to-b from-amber-50/60 to-background p-5 text-center shadow-2xs dark:border-amber-900/40 dark:from-amber-950/20">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                            Average Rating
                        </span>
                        <div className="mt-1 text-3xl font-bold text-amber-600 dark:text-amber-400">
                            {stats.average.toFixed(1)}
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    className={`h-5 w-5 ${
                                        s <= Math.round(stats.average)
                                            ? 'fill-amber-500 text-amber-500'
                                            : 'text-muted-foreground/30'
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="mt-2 text-xs text-muted-foreground">
                            Based on <strong>{stats.total}</strong> candidate reviews
                        </span>
                    </div>

                    {/* Star Distribution Bars */}
                    <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-2.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                            Rating Distribution
                        </h3>
                        {[
                            { star: 5, count: stats.stars_5 },
                            { star: 4, count: stats.stars_4 },
                            { star: 3, count: stats.stars_3 },
                            { star: 2, count: stats.stars_2 },
                            { star: 1, count: stats.stars_1 },
                        ].map((row) => {
                            const pct = Math.round((row.count / total) * 100);
                            return (
                                <div key={row.star} className="flex items-center gap-3 text-xs">
                                    <div className="flex w-16 items-center gap-1 font-semibold text-foreground">
                                        <span>{row.star}</span>
                                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                    </div>
                                    <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-amber-500 transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="w-12 text-right font-medium text-muted-foreground">
                                        {row.count} ({pct}%)
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
                    <span className="text-xs font-semibold text-muted-foreground mr-2">Filter Stars:</span>
                    {['all', '5', '4', '3', '2', '1'].map((st) => (
                        <button
                            key={st}
                            onClick={() => handleFilterChange(st)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                                ratingFilter === st
                                    ? 'bg-amber-500 text-white shadow-2xs'
                                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            {st === 'all' ? 'All Ratings' : `${st} Stars`}
                        </button>
                    ))}
                </div>

                {/* Reviews List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {ratings.data.length === 0 ? (
                        <div className="col-span-full py-12 text-center rounded-2xl border border-border bg-card p-8 text-muted-foreground">
                            <Star className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
                            <p className="font-semibold text-foreground">No candidate ratings found</p>
                            <p className="text-xs">Candidate ratings will populate automatically as users rate the platform.</p>
                        </div>
                    ) : (
                        ratings.data.map((item) => (
                            <div
                                key={item.id}
                                className="group relative rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs hover:border-amber-400/60 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        className={`h-4 w-4 ${
                                                            s <= item.rating
                                                                ? 'fill-amber-500 text-amber-500'
                                                                : 'text-muted-foreground/30'
                                                        }`}
                                                    />
                                                ))}
                                                <span className="ml-1 text-xs font-bold text-foreground">
                                                    {item.rating}.0
                                                </span>
                                            </div>
                                            {item.sentiment && (
                                                <Badge
                                                    variant="secondary"
                                                    className="mt-1.5 text-[10px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50"
                                                >
                                                    {item.sentiment}
                                                </Badge>
                                            )}
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(item.id)}
                                            className="h-7 w-7 p-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>

                                    {item.review ? (
                                        <p className="mt-3 text-xs text-foreground leading-relaxed italic">
                                            "{item.review}"
                                        </p>
                                    ) : (
                                        <p className="mt-3 text-xs text-muted-foreground italic">
                                            Candidate left star rating without text rationale.
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-3 w-3 text-muted-foreground" />
                                        <span className="font-semibold text-foreground">
                                            {item.name || item.user?.name || 'Candidate Doctor'}
                                        </span>
                                        {item.user?.active_pathway && (
                                            <span className="text-[10px] text-sky-600 dark:text-sky-400">
                                                • {item.user.active_pathway.replace('_', ' ')}
                                            </span>
                                        )}
                                    </div>
                                    <span>
                                        {new Date(item.created_at).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {ratings.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                        <span>Showing page {ratings.current_page} of {ratings.last_page}</span>
                        <div className="flex gap-1">
                            {ratings.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    preserveState
                                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                                        link.active
                                            ? 'bg-amber-500 text-white'
                                            : 'hover:bg-muted text-muted-foreground'
                                    } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
