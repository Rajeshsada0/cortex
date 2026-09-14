import { usePage, Link } from '@inertiajs/react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType, Auth } from '@/types';
import { PlaySquare, Plus, Shield, Bell, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PathwaySelector } from '@/components/cortex/pathway-selector';
import { ThemeToggle } from '@/components/theme-toggle';

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
        <header className="border-cortex-border bg-cortex-bg flex h-14 shrink-0 items-center justify-between border-b px-4 transition-[width,height] ease-linear sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
                <div className="h-4 w-px bg-border" />
                <Breadcrumbs breadcrumbs={resolvedBreadcrumbs} />
            </div>

            {user && (
                <div className="flex items-center gap-2.5 sm:gap-3">
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

                            <button
                                type="button"
                                className="relative rounded-xl border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                title="Notifications"
                            >
                                <Bell className="size-4" />
                                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400" />
                            </button>

                            {url !== '/qbank/runner' &&
                                !url.startsWith('/mock-exam/hall') && (
                                    <Link href="/qbank/runner">
                                        <Button
                                            size="sm"
                                            className="h-9 gap-2 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500 to-sky-500 px-3.5 font-bold text-slate-950 shadow-md shadow-cyan-500/25 hover:from-cyan-400 hover:to-sky-400 hover:brightness-105"
                                        >
                                            <Zap className="size-4 fill-current" />
                                            <span className="text-xs font-bold">
                                                Launch MCQ Runner
                                            </span>
                                            <span className="hidden rounded bg-slate-950/20 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-slate-950 uppercase sm:inline-block">
                                                Adaptive AI
                                            </span>
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
