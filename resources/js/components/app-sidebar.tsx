import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    PlaySquare,
    BookOpen,
    GraduationCap,
    Repeat,
    Calendar,
    SlidersHorizontal,
    LayoutDashboard,
    HelpCircle,
    Layers,
    Users,
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
} from '@/components/ui/sidebar';
import type { Auth, NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard & Readiness',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Interactive MCQ Runner',
        href: '/qbank/runner',
        icon: PlaySquare,
    },
    {
        title: 'Custom Test Builder',
        href: '/qbank',
        icon: SlidersHorizontal,
    },
    {
        title: '19-Subject Directory',
        href: '/directory',
        icon: BookOpen,
    },
    {
        title: 'Grand Mock Exam Hall',
        href: '/mock-exam',
        icon: GraduationCap,
    },
    {
        title: 'Spaced Repetition Queue',
        href: '/spaced-repetition',
        icon: Repeat,
    },
    {
        title: 'Study Planner',
        href: '/planner',
        icon: Calendar,
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
    const isAdmin = Boolean(auth?.user?.is_admin);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={isAdmin ? '/admin' : '/dashboard'} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {isAdmin ? (
                    <NavMain items={adminNavItems} label="Faculty & Content Admin" />
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
