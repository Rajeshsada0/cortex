import { usePage, Link } from '@inertiajs/react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType, Auth } from '@/types';
import { PlaySquare, Plus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { url } = usePage();
    const { auth } = usePage<{ auth?: Auth }>().props;
    const user = auth?.user as any;
    const isAdmin = Boolean(user?.is_admin);

    // Derive breadcrumb automatically if none provided
    const resolvedBreadcrumbs: BreadcrumbItemType[] = breadcrumbs.length > 0 ? breadcrumbs : (() => {
        const path = url.split('?')[0];
        switch (path) {
            case '/admin':
                return [{ title: 'Faculty & Content Admin', href: '/admin' }];
            case '/admin/questions':
                return [
                    { title: 'Faculty Admin', href: '/admin' },
                    { title: 'MCQ Question Bank', href: '/admin/questions' },
                ];
            case '/admin/questions/create':
                return [
                    { title: 'MCQ Question Bank', href: '/admin/questions' },
                    { title: 'Create Clinical Vignette', href: '/admin/questions/create' },
                ];
            case '/admin/subjects':
                return [
                    { title: 'Faculty Admin', href: '/admin' },
                    { title: 'Subject Curriculum', href: '/admin/subjects' },
                ];
            case '/admin/topics':
                return [
                    { title: 'Faculty Admin', href: '/admin' },
                    { title: 'Topics & Subtopics', href: '/admin/topics' },
                ];
            case '/admin/pathways':
                return [
                    { title: 'Faculty Admin', href: '/admin' },
                    { title: 'Exam Pathways', href: '/admin/pathways' },
                ];
            case '/admin/users':
                return [
                    { title: 'Faculty Admin', href: '/admin' },
                    { title: 'Candidate Directory', href: '/admin/users' },
                ];
            case '/dashboard':
                return [{ title: 'Dashboard & Readiness', href: '/dashboard' }];
            case '/qbank':
                return [{ title: 'Custom Test Builder', href: '/qbank' }];
            case '/qbank/runner':
                return [
                    { title: 'Question Bank', href: '/qbank' },
                    { title: 'Interactive MCQ Runner', href: '/qbank/runner' },
                ];
            case '/directory':
                return [{ title: '19-Subject Medical Directory', href: '/directory' }];
            case '/mock-exam':
                return [{ title: 'Grand Mock Exam Hall', href: '/mock-exam' }];
            case '/mock-exam/hall':
                return [
                    { title: 'Grand Mock Exam', href: '/mock-exam' },
                    { title: 'Active Timed Simulation', href: '/mock-exam/hall' },
                ];
            case '/mock-exam/result':
                return [
                    { title: 'Grand Mock Exam', href: '/mock-exam' },
                    { title: 'Diagnostic Score Report', href: '/mock-exam/result' },
                ];
            case '/spaced-repetition':
                return [{ title: 'Spaced Repetition Queue', href: '/spaced-repetition' }];
            case '/planner':
                return [{ title: 'Study Planner & Timeline', href: '/planner' }];
            default:
                return [];
        }
    })();

    const pathwayLabel = user?.pathway_label || (user?.active_pathway ? user.active_pathway.replace('_', ' ') : null);

    return (
        <header className="border-sidebar-border/50 flex h-14 shrink-0 items-center justify-between border-b px-4 sm:px-6 lg:px-8 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-3 min-w-0">
                <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
                <div className="h-4 w-px bg-border/80" />
                <Breadcrumbs breadcrumbs={resolvedBreadcrumbs} />
            </div>

            {user && (
                <div className="flex items-center gap-3">
                    {isAdmin ? (
                        <>
                            <div className="hidden items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400 sm:flex">
                                <Shield className="size-3 text-purple-500" />
                                <span>Faculty &amp; Content Admin</span>
                            </div>
                            {url !== '/admin/questions/create' && (
                                <Link href="/admin/questions/create">
                                    <Button size="sm" className="hidden sm:flex h-8 gap-1.5 text-xs font-semibold bg-[#102A43] dark:bg-[#55BDEB] text-white dark:text-neutral-950 shadow-xs">
                                        <Plus className="size-3.5" />
                                        <span>New MCQ</span>
                                    </Button>
                                </Link>
                            )}
                        </>
                    ) : (
                        <>
                            {pathwayLabel && (
                                <div className="hidden items-center gap-1.5 rounded-full border border-[#55BDEB]/30 bg-[#55BDEB]/10 px-3 py-1 text-xs font-semibold text-[#55BDEB] sm:flex">
                                    <span className="size-1.5 rounded-full bg-[#55BDEB] animate-pulse" />
                                    <span>{pathwayLabel}</span>
                                </div>
                            )}
                            {url !== '/qbank/runner' && !url.startsWith('/mock-exam/hall') && (
                                <Link href="/qbank/runner">
                                    <Button size="sm" variant="outline" className="hidden sm:flex h-8 gap-1.5 text-xs font-medium border-[#55BDEB]/30 text-foreground hover:bg-[#55BDEB]/10 hover:text-[#55BDEB]">
                                        <PlaySquare className="size-3.5 text-[#55BDEB]" />
                                        <span>MCQ Runner</span>
                                    </Button>
                                </Link>
                            )}
                        </>
                    )}
                </div>
            )}
        </header>
    );
}

