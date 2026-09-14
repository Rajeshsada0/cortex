import { usePage, Link } from '@inertiajs/react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType, Auth } from '@/types';
import { PlaySquare, Plus, Shield, Bell, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PathwaySelector } from '@/components/cortex/pathway-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

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
    const resolvedBreadcrumbs: BreadcrumbItemType[] =
        breadcrumbs.length > 0
            ? breadcrumbs
            : (() => {
                  const path = url.split('?')[0];
                  switch (path) {
                      case '/admin':
                          return [
                              {
                                  title: 'Faculty & Content Admin',
                                  href: '/admin',
                              },
                          ];
                      case '/admin/questions':
                          return [
                              { title: 'Faculty Admin', href: '/admin' },
                              {
                                  title: 'MCQ Question Bank',
                                  href: '/admin/questions',
                              },
                          ];
                      case '/admin/questions/create':
                          return [
                              {
                                  title: 'MCQ Question Bank',
                                  href: '/admin/questions',
                              },
                              {
                                  title: 'Create Clinical Vignette',
                                  href: '/admin/questions/create',
                              },
                          ];
                      case '/admin/subjects':
                          return [
                              { title: 'Faculty Admin', href: '/admin' },
                              {
                                  title: 'Subject Curriculum',
                                  href: '/admin/subjects',
                              },
                          ];
                      case '/admin/topics':
                          return [
                              { title: 'Faculty Admin', href: '/admin' },
                              {
                                  title: 'Topics & Subtopics',
                                  href: '/admin/topics',
                              },
                          ];
                      case '/admin/pathways':
                          return [
                              { title: 'Faculty Admin', href: '/admin' },
                              {
                                  title: 'Exam Pathways',
                                  href: '/admin/pathways',
                              },
                          ];
                      case '/admin/users':
                          return [
                              { title: 'Faculty Admin', href: '/admin' },
                              {
                                  title: 'Candidate Directory',
                                  href: '/admin/users',
                              },
                          ];
                      case '/dashboard':
                          return [
                              {
                                  title: 'Dashboard & Readiness',
                                  href: '/dashboard',
                              },
                          ];
                      case '/qbank':
                          return [
                              { title: 'Custom Test Builder', href: '/qbank' },
                          ];
                      case '/qbank/runner':
                          return [
                              { title: 'Question Bank', href: '/qbank' },
                              {
                                  title: 'Interactive MCQ Runner',
                                  href: '/qbank/runner',
                              },
                          ];
                      case '/directory':
                          return [
                              {
                                  title: '19-Subject Medical Directory',
                                  href: '/directory',
                              },
                          ];
                      case '/mock-exam':
                          return [
                              {
                                  title: 'Grand Mock Exam Hall',
                                  href: '/mock-exam',
                              },
                          ];
                      case '/mock-exam/hall':
                          return [
                              { title: 'Grand Mock Exam', href: '/mock-exam' },
                              {
                                  title: 'Active Timed Simulation',
                                  href: '/mock-exam/hall',
                              },
                          ];
                      case '/mock-exam/result':
                          return [
                              { title: 'Grand Mock Exam', href: '/mock-exam' },
                              {
                                  title: 'Diagnostic Score Report',
                                  href: '/mock-exam/result',
                              },
                          ];
                      case '/spaced-repetition':
                          return [
                              {
                                  title: 'Spaced Repetition Queue',
                                  href: '/spaced-repetition',
                              },
                          ];
                      case '/planner':
                          return [
                              {
                                  title: 'Study Planner & Timeline',
                                  href: '/planner',
                              },
                          ];
                      default:
                          return [];
                  }
              })();

    const pathwayLabel =
        user?.pathway_label ||
        (user?.active_pathway ? user.active_pathway.replace('_', ' ') : null);

    return (
        <TooltipProvider delayDuration={150}>
            <header className="border-cortex-border bg-cortex-bg flex h-14 shrink-0 items-center justify-between border-b px-3 sm:px-6 lg:px-8 transition-[width,height] ease-linear">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <SidebarTrigger />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <span>Toggle Sidebar</span>
                        </TooltipContent>
                    </Tooltip>

                    <div className="hidden h-4 w-px bg-border md:block" />

                    <div className="hidden md:flex min-w-0 items-center">
                        <Breadcrumbs breadcrumbs={resolvedBreadcrumbs} />
                    </div>

                    {resolvedBreadcrumbs.length > 0 && (
                        <span className="truncate text-xs font-semibold text-foreground md:hidden max-w-[120px] xs:max-w-[160px] sm:max-w-[240px]">
                            {resolvedBreadcrumbs[resolvedBreadcrumbs.length - 1]?.title}
                        </span>
                    )}
                </div>

                {user && (
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
                        <ThemeToggle />

                        {isAdmin ? (
                            <>
                                <div className="hidden items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600 sm:flex dark:text-purple-400">
                                    <Shield className="size-3 text-purple-500" />
                                    <span>Faculty &amp; Content Admin</span>
                                </div>
                                {url !== '/admin/questions/create' && (
                                    <Link href="/admin/questions/create">
                                        <Button
                                            size="sm"
                                            className="hidden h-8 gap-1.5 bg-cyan-600 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 sm:flex dark:bg-[#55BDEB] dark:text-neutral-950 dark:hover:opacity-90"
                                        >
                                            <Plus className="size-3.5" />
                                            <span>New MCQ</span>
                                        </Button>
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <PathwaySelector
                                    currentPathway={user?.active_pathway}
                                />

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
