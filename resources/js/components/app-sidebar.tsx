import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    CheckCircle2,
    BookOpen,
    Landmark,
    Repeat,
    Calendar,
    SlidersHorizontal,
    Bookmark,
    LayoutDashboard,
    HelpCircle,
    Layers,
    Users,
    PlaySquare,
    Award,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import type { Auth, NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Practice MCQs',
        href: '/qbank/runner',
        icon: PlaySquare,
    },
    {
        title: 'Test Builder',
        href: '/qbank',
        icon: SlidersHorizontal,
    },
    {
        title: '19-Subject Directory',
        href: '/directory',
        icon: BookOpen,
    },
    {
        title: 'Grand Mock Exam',
        href: '/mock-exam',
        icon: Landmark,
    },
    {
        title: 'Spaced Repetition',
        href: '/spaced-repetition',
        icon: Repeat,
    },
    {
        title: 'Study Planner',
        href: '/planner',
        icon: Calendar,
    },
    {
        title: 'Bookmarks & Notes',
        href: '/bookmarks',
        icon: Bookmark,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Admin Overview',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        title: 'MCQ Question Bank',
        href: '/admin/questions',
        icon: HelpCircle,
    },
    {
        title: 'Subject Curriculum',
        href: '/admin/subjects',
        icon: BookOpen,
    },
    {
        title: 'Topics & Subtopics',
        href: '/admin/topics',
        icon: Layers,
    },
    {
        title: 'Exam Pathways',
        href: '/admin/pathways',
        icon: Award,
    },
    {
        title: 'Candidate Directory',
        href: '/admin/users',
        icon: Users,
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { isMobile, setOpenMobile } = useSidebar();
    const isAdmin = Boolean(auth?.user?.is_admin);

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="border-cortex-border bg-cortex-bg border-r"
        >
            <SidebarHeader className="border-cortex-border/40 border-b pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="hover:bg-muted/80"
                        >
                            <Link
                                href={isAdmin ? '/admin' : '/dashboard'}
                                prefetch
                                onClick={() => {
                                    if (isMobile) {
                                        setOpenMobile(false);
                                    }
                                }}
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {!isAdmin && (
                    <div className="mt-2.5 px-1 group-data-[collapsible=icon]:hidden">
                        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5 text-xs shadow-xs">
                            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                Active Track
                            </span>
                            <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                                {(auth?.user as any)?.pathway_label || 'Active Pathway'}
                            </span>
                        </div>
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent>
                {isAdmin ? (
                    <NavMain
                        items={adminNavItems}
                        label="Faculty & Content Admin"
                    />
                ) : (
                    <NavMain items={mainNavItems} label="Candidate Portal" />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
