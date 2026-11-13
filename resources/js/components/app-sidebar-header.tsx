import { usePage, Link } from '@inertiajs/react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { Auth, BreadcrumbItem as BreadcrumbItemType } from '@/types';
import {
    LayoutDashboard,
    HelpCircle,
    Stethoscope,
    BookOpen,
    Layers,
    Award,
    Users,
    Headset,
    Star,
    Globe,
    ChevronRight,
    PlaySquare,
    Shield,
    Bell,
    Repeat,
    Calendar,
    Bookmark,
    Sparkles,
    User,
    Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PathwaySelector } from '@/components/cortex/pathway-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import React from 'react';

interface HeaderConfig {
    title: string;
    parentTitle?: string;
    parentHref?: string;
    icon: React.ComponentType<{ className?: string }>;
}

function getPageHeaderInfo(urlPath: string): HeaderConfig {
    const path = urlPath.split('?')[0];

    // Admin sub-routes
    if (path === '/admin/questions/create') {
        return {
            title: 'Create Clinical Vignette',
            parentTitle: 'Question Bank',
            parentHref: '/admin/questions',
            icon: HelpCircle,
        };
    }
    if (path === '/admin/questions/import') {
        return {
            title: 'Bulk Question Import',
            parentTitle: 'Question Bank',
            parentHref: '/admin/questions',
            icon: HelpCircle,
        };
    }
    if (/^\/admin\/questions\/[^/]+\/edit$/.test(path)) {
        return {
            title: 'Edit Clinical Vignette',
            parentTitle: 'Question Bank',
            parentHref: '/admin/questions',
            icon: HelpCircle,
        };
    }
    if (path === '/admin/csq/create') {
        return {
            title: 'New CSQ Station',
            parentTitle: 'Clinical Scenarios (CSQ)',
            parentHref: '/admin/csq',
            icon: Stethoscope,
        };
    }
    if (/^\/admin\/csq\/[^/]+\/edit$/.test(path)) {
        return {
            title: 'Edit CSQ Station',
            parentTitle: 'Clinical Scenarios (CSQ)',
            parentHref: '/admin/csq',
            icon: Stethoscope,
        };
    }

    // Admin top-level routes
    if (path === '/admin') {
        return { title: 'Admin Overview', icon: LayoutDashboard };
    }
    if (path === '/admin/questions') {
        return { title: 'MCQ Question Bank', icon: HelpCircle };
    }
    if (path === '/admin/csq') {
        return { title: 'Clinical Scenarios (CSQ)', icon: Stethoscope };
    }
    if (path === '/admin/subjects') {
        return { title: 'Subject Curriculum', icon: BookOpen };
    }
    if (path === '/admin/topics') {
        return { title: 'Topics & Subtopics', icon: Layers };
    }
    if (path === '/admin/pathways') {
        return { title: 'Exam Pathways', icon: Award };
    }
    if (path === '/admin/users') {
        return { title: 'Candidate Directory', icon: Users };
    }
    if (path === '/admin/inquiries') {
        return { title: 'Support Helpdesk', icon: Headset };
    }
    if (path === '/admin/ratings') {
        return { title: 'Ratings & Reviews', icon: Star };
    }
    if (path === '/admin/settings') {
        return { title: 'Global Settings', icon: Globe };
    }
    if (path.startsWith('/admin')) {
        return { title: 'Faculty Admin', icon: Shield };
    }

    // Candidate sub-routes
    if (path === '/qbank/runner') {
        return {
            title: 'Interactive MCQ Runner',
            parentTitle: 'Question Bank',
            parentHref: '/qbank',
            icon: HelpCircle,
        };
    }
    if (/^\/mock-exam\/[^/]+\/hall$/.test(path) || path === '/mock-exam/hall') {
        return {
            title: 'Active Timed Simulation',
            parentTitle: 'Grand Mock Exam',
            parentHref: '/mock-exam',
            icon: Award,
        };
    }
    if (/^\/mock-exam\/[^/]+\/result$/.test(path) || path === '/mock-exam/result') {
        return {
            title: 'Diagnostic Score Report',
            parentTitle: 'Grand Mock Exam',
            parentHref: '/mock-exam',
            icon: Award,
        };
    }
    if (path === '/csq/runner') {
        return {
            title: 'CSQ Simulation Runner',
            parentTitle: 'Clinical Scenarios',
            parentHref: '/csq',
            icon: Stethoscope,
        };
    }
    if (/^\/subjects\/[^/]+$/.test(path)) {
        return {
            title: 'Curriculum Blueprint',
            parentTitle: 'Subject Directory',
            parentHref: '/subjects',
            icon: BookOpen,
        };
    }
    if (/^\/download\/[^/]+$/.test(path)) {
        return {
            title: 'Exam Diagnostic Scorecard',
            parentTitle: 'Grand Mock Exam',
            parentHref: '/mock-exam',
            icon: Award,
        };
    }

    // Candidate top-level routes
    switch (path) {
        case '/dashboard':
            return {
                title: 'Dashboard & Readiness',
                icon: LayoutDashboard,
            };
        case '/qbank':
            return {
                title: 'Custom Test Builder',
                icon: HelpCircle,
            };
        case '/directory':
            return {
                title: '19-Subject Medical Directory',
                icon: BookOpen,
            };
        case '/mock-exam':
            return {
                title: 'Grand Mock Exam Hall',
                icon: Award,
            };
        case '/spaced-repetition':
            return {
                title: 'Spaced Repetition Queue',
                icon: Repeat,
            };
        case '/planner':
            return {
                title: 'Study Planner & Timeline',
                icon: Calendar,
            };
        case '/bookmarks':
            return {
                title: 'Bookmarks & Notes',
                icon: Bookmark,
            };
        case '/csq':
            return {
                title: 'Clinical Scenarios (CSQ)',
                icon: Stethoscope,
            };
        case '/flashcards':
            return {
                title: 'Interactive Flashcards',
                icon: Layers,
            };
        case '/play':
            return {
                title: 'Gamified Play & Quiz',
                icon: PlaySquare,
            };
        case '/subjects':
            return {
                title: 'Subject Directory',
                icon: BookOpen,
            };
        case '/about-medai':
            return {
                title: 'About MedAI & Cortex',
                icon: Sparkles,
            };
        case '/settings/profile':
            return {
                title: 'Profile Settings',
                icon: User,
            };
        case '/settings/security':
            return {
                title: 'Security & Access',
                icon: Shield,
            };
        case '/settings/password':
            return {
                title: 'Password Security',
                icon: Shield,
            };
        case '/settings/two-factor':
            return {
                title: 'Two-Factor Authentication',
                icon: Shield,
            };
        case '/settings/appearance':
            return {
                title: 'Appearance Settings',
                icon: Sparkles,
            };
        default:
            return {
                title: 'Cortex Medical',
                icon: Activity,
            };
    }
}

export function AppSidebarHeader({
    breadcrumbs,
}: {
    breadcrumbs?: BreadcrumbItemType[];
} = {}) {
    const { url } = usePage();
    const { auth } = usePage<{ auth?: Auth }>().props;
    const user = auth?.user as any;
    const isAdmin = Boolean(user?.is_admin);
    const isAdminRoute = url.startsWith('/admin');

    const header = getPageHeaderInfo(url);
    const HeaderIcon = header.icon;

    return (
        <TooltipProvider delayDuration={150}>
            <header className="border-cortex-border bg-cortex-bg flex h-14 shrink-0 items-center justify-between border-b px-3 sm:px-6 lg:px-8 transition-[width,height] ease-linear">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    {/* Mobile Only Sidebar Trigger */}
                    <div className="md:hidden">
                        <SidebarTrigger />
                    </div>

                    {/* Unified Page Title Header with Icon Badge (No breadcrumbs for all pages) */}
                    <div className="flex min-w-0 items-center gap-2">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
                            <HeaderIcon className="size-4" />
                        </div>

                        {header.parentTitle && header.parentHref ? (
                            <div className="flex min-w-0 items-center gap-1.5 text-xs sm:text-sm">
                                <Link
                                    href={header.parentHref}
                                    className="hidden truncate font-medium text-muted-foreground transition-colors hover:text-foreground xs:inline"
                                >
                                    {header.parentTitle}
                                </Link>
                                <ChevronRight className="hidden size-3.5 shrink-0 text-muted-foreground/60 xs:inline" />
                                <span className="truncate font-semibold text-foreground">
                                    {header.title}
                                </span>
                            </div>
                        ) : (
                            <div className="flex min-w-0 items-center">
                                <span className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
                                    {header.title}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {user && (
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
                        {isAdminRoute ? (
                            <>
                                {/* Candidate View Switcher: Seamless test preview for faculty */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link href="/dashboard">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1.5 rounded-lg border-border/80 px-2.5 text-xs font-semibold text-foreground hover:bg-muted/70 transition-colors"
                                            >
                                                <PlaySquare className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                                                <span className="hidden sm:inline">Candidate View</span>
                                            </Button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <span>Switch to Candidate / Student Experience</span>
                                    </TooltipContent>
                                </Tooltip>

                                <ThemeToggle />

                                <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                    <Shield className="size-3 text-purple-500" />
                                    <span>Faculty Admin</span>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* If faculty admin is in Candidate View, offer 1-click return to Admin Console */}
                                {isAdmin && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Link href="/admin">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-1.5 rounded-lg border-purple-500/30 bg-purple-500/10 px-2.5 text-xs font-semibold text-purple-600 hover:bg-purple-500/20 dark:text-purple-400 transition-colors"
                                                >
                                                    <Shield className="size-3.5 text-purple-500" />
                                                    <span className="hidden sm:inline">Admin Console</span>
                                                </Button>
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">
                                            <span>Return to Faculty Admin Console</span>
                                        </TooltipContent>
                                    </Tooltip>
                                )}

                                <PathwaySelector
                                    currentPathway={user?.active_pathway}
                                />

                                <ThemeToggle />

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
                                            aria-label="Notifications"
                                        >
                                            <Bell className="size-4" />
                                            <span className="absolute top-2 right-2 size-2 rounded-full bg-cyan-500 shadow-xs shadow-cyan-500/50" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <span>Notifications</span>
                                    </TooltipContent>
                                </Tooltip>

                                {url !== '/qbank/runner' &&
                                    !url.startsWith('/mock-exam/hall') && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link href="/qbank/runner" className="hidden sm:inline-flex">
                                                    <Button
                                                        size="sm"
                                                        className="h-9 gap-1.5 rounded-xl bg-cyan-600 px-3 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
                                                    >
                                                        <PlaySquare className="size-3.5" />
                                                        <span>Practice</span>
                                                    </Button>
                                                </Link>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <span>Adaptive MCQ Practice</span>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                            </>
                        )}
                    </div>
                )}
            </header>
        </TooltipProvider>
    );
}
