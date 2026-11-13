import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
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
    Stethoscope,
    Globe,
    Puzzle,
    Headset,
    Star,
    Gavel,
    Share2,
    Settings,
    GraduationCap,
    ChevronRight,
    Sliders,
    User,
    ShieldCheck,
    Palette,
    Sparkles,
    LogOut,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    SidebarGroup,
    SidebarGroupLabel,
    SidebarTrigger,
    useSidebar,
} from '@/components/ui/sidebar';
import type { Auth, NavItem } from '@/types';
import { useSettings } from '@/hooks/use-settings';
import { logout } from '@/routes';
import {
    CourseSelectorModal,
    ContactUsModal,
    RateUsModal,
    TermsConditionsModal,
    ShareAppModal,
} from '@/components/cortex/support-modals';
import type { PathwayOption } from '@/components/cortex/pathway-selector';
import { toast } from 'sonner';

const candidateNavItems: NavItem[] = [
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
        title: 'CSQ Mock Exam',
        href: '/csq',
        icon: Stethoscope,
    },
    {
        title: 'Flashcards',
        href: '/flashcards',
        icon: Layers,
    },
    {
        title: 'Play Hub',
        href: '/play',
        icon: Puzzle,
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
        title: 'Clinical Scenarios (CSQ)',
        href: '/admin/csq',
        icon: Stethoscope,
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
    {
        title: 'Support Helpdesk',
        href: '/admin/inquiries',
        icon: Headset,
    },
    {
        title: 'Ratings & Reviews',
        href: '/admin/ratings',
        icon: Star,
    },
    {
        title: 'Global Settings',
        href: '/admin/settings',
        icon: Globe,
    },
];

const DEFAULT_PATHWAYS: PathwayOption[] = [
    {
        id: 'MECEE_PG',
        code: 'MECEE_PG',
        name: 'Nepal: MECEE-PG',
        region: 'Nepal',
        marking: '+1.0 / -0.25 Scheme • 200 Questions',
        penalty: 'Standard (-0.25)',
        badgeColor: 'border-sky-300 text-sky-700 bg-sky-50 dark:bg-sky-950/40',
    },
    {
        id: 'INI_CET',
        code: 'INI_CET',
        name: 'India: INI-CET',
        region: 'India',
        marking: '+1.0 / -0.33 Negative Marking (AIIMS/PGI)',
        penalty: 'Severe (-0.33)',
        badgeColor: 'border-indigo-300 text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
        id: 'USMLE_STEP1',
        code: 'USMLE_STEP1',
        name: 'USA: USMLE Step 1',
        region: 'USA',
        marking: 'Pass / Fail Licensure & Integrated Systems',
        penalty: 'No Negative',
        badgeColor: 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
        id: 'USMLE_STEP2CK',
        code: 'USMLE_STEP2CK',
        name: 'USA: USMLE Step 2 CK',
        region: 'USA',
        marking: '3-Digit Scaled Clinical Knowledge',
        penalty: 'No Negative',
        badgeColor: 'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/40',
    },
    {
        id: 'COMBINED',
        code: 'COMBINED',
        name: 'Combined Global Track',
        region: 'Global',
        marking: '+1.0 / -0.25 • 19-Subject Curriculum',
        penalty: 'Standard (-0.25)',
        badgeColor: 'border-cyan-300 text-cyan-700 bg-cyan-50 dark:bg-cyan-950/40',
    },
];

export function AppSidebar() {
    const { auth, exam_pathways } = usePage<{
        auth: Auth;
        exam_pathways?: PathwayOption[];
    }>().props;
    const { url } = usePage();
    const { isMobile, setOpenMobile, state } = useSidebar();
    const isCollapsed = state === 'collapsed';
    const settings = useSettings();

    const user = auth?.user as any;
    const isAdmin = Boolean(user?.is_admin);
    const isAdminRoute = url.startsWith('/admin');

    const displayName = user?.name || 'Rajesh Sada';
    const displayEmail = user?.email || 'rsada.54@gmail.com';
    const activePathwayLabel = user?.pathway_label || 'Nepal MECEE-PG';
    const activePathwayCode = user?.active_pathway || 'MECEE_PG';

    const initials =
        displayName
            .split(' ')
            .map((n: string) => n[0])
            .filter(Boolean)
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'MD';

    const handleLogout = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
        router.flushAll();
    };

    const pathwaysList =
        exam_pathways && exam_pathways.length > 0 ? exam_pathways : DEFAULT_PATHWAYS;

    // Modal Visibility States
    const [courseModalOpen, setCourseModalOpen] = useState(false);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [rateModalOpen, setRateModalOpen] = useState(false);
    const [termsModalOpen, setTermsModalOpen] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);

    const handleSelectPathway = async (pathwayId: string) => {
        if (pathwayId === activePathwayCode) {
            setCourseModalOpen(false);
            return;
        }

        try {
            const res = await fetch('/api/v1/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ active_pathway: pathwayId }),
            });

            if (res.ok) {
                const target = pathwaysList.find((p) => p.id === pathwayId || p.code === pathwayId);
                toast.success(`Active course updated to ${target?.name || pathwayId}!`, {
                    description: 'Marking rules & questions calibrated.',
                });
                setCourseModalOpen(false);
                window.location.reload();
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.message || 'Failed to update active course.');
            }
        } catch {
            toast.error('Network error updating active course.');
        }
    };

    return (
        <>
            <Sidebar
                collapsible="icon"
                variant="sidebar"
                className="border-cortex-border bg-cortex-bg border-r"
            >
                {/* 1. PROFILE & BRAND HEADER */}
                <SidebarHeader className="border-cortex-border/40 border-b p-3 space-y-2">
                    <div className="flex items-center justify-between gap-1 group-data-[collapsible=icon]:justify-center">
                        <Link
                            href={isAdmin ? '/admin' : '/dashboard'}
                            prefetch
                            onClick={() => {
                                if (isMobile) {
                                    setOpenMobile(false);
                                }
                            }}
                            className="flex items-center min-w-0 flex-1 rounded-xl p-1 hover:bg-muted/80 transition-colors group-data-[collapsible=icon]:hidden"
                        >
                            <AppLogo />
                        </Link>
                        <div className="shrink-0 flex items-center justify-center">
                            <SidebarTrigger className="size-8.5 rounded-xl border border-border bg-card text-muted-foreground shadow-xs hover:border-slate-300 hover:bg-muted hover:text-foreground active:scale-95 dark:border-slate-700/80 dark:bg-[#0d1627] dark:hover:border-slate-600 dark:hover:bg-[#121f36]" />
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarContent className="space-y-1 overflow-y-auto max-h-full pr-0.5 [scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.25)_transparent]">
                    {/* 2. ACADEMIC PATHWAY CARD (Featured Course - ONLY in Candidate Portal) */}
                    {!isAdminRoute && (
                        <SidebarGroup className="px-2 pt-2 pb-1 group-data-[collapsible=icon]:hidden">
                            <SidebarGroupLabel className="mb-1.5 px-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                Academic Pathway
                            </SidebarGroupLabel>

                            <div
                                onClick={() => setCourseModalOpen(true)}
                                className="group flex cursor-pointer items-center justify-between rounded-xl border border-sky-200/80 bg-sky-50/50 p-2.5 transition-all hover:border-sky-400 hover:bg-sky-50 dark:border-sky-900/60 dark:bg-sky-950/20 dark:hover:bg-sky-950/40"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="truncate text-xs font-bold text-foreground">
                                                Your Course
                                            </span>
                                            <span className="rounded-md bg-sky-500/15 px-1.5 py-0.2 text-[9px] font-extrabold text-sky-700 dark:text-sky-300">
                                                Active
                                            </span>
                                        </div>
                                        <p className="truncate text-[11px] text-muted-foreground">
                                            {activePathwayLabel}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60 group-hover:text-foreground" />
                            </div>
                        </SidebarGroup>
                    )}

                    {/* 3. PRIMARY NAVIGATION */}
                    {isAdminRoute ? (
                        <>
                            <NavMain
                                items={adminNavItems}
                                label="Faculty & Content Admin"
                            />
                            <SidebarGroup className="px-2 py-1">
                                <SidebarGroupLabel className="mb-1 px-2.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                    Candidate Portal
                                </SidebarGroupLabel>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={{ children: 'Candidate Portal View' }}
                                            className="h-10 rounded-xl px-3 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                                        >
                                            <Link
                                                href="/dashboard"
                                                prefetch
                                                onClick={() => {
                                                    if (isMobile) {
                                                        setOpenMobile(false);
                                                    }
                                                }}
                                                className="flex w-full items-center justify-between text-slate-600 dark:text-slate-400"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <LayoutGrid className="size-4.5 text-slate-400" />
                                                    <span className="text-xs font-medium">Candidate Portal View</span>
                                                </div>
                                                <ChevronRight className="size-3.5 text-muted-foreground/60" />
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroup>
                        </>
                    ) : (
                        <NavMain
                            items={candidateNavItems}
                            label="Candidate Portal"
                        />
                    )}

                    {/* 4. SUPPORT & COMMUNITY SECTION */}
                    <SidebarGroup className="px-2 py-1">
                        <SidebarGroupLabel className="mb-1 px-2.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            Support &amp; Community
                        </SidebarGroupLabel>
                        <div className="space-y-0.5">
                            {/* Contact Us */}
                            <button
                                type="button"
                                onClick={() => setContactModalOpen(true)}
                                className="group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted/70"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
                                        <Headset className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                                        <span className="block truncate text-xs font-semibold text-foreground">
                                            Contact Us
                                        </span>
                                        <span className="block truncate text-[10px] text-muted-foreground">
                                            24/7 Clinical &amp; technical helpdesk
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 group-hover:text-foreground group-data-[collapsible=icon]:hidden" />
                            </button>

                            {/* Rate Us */}
                            <button
                                type="button"
                                onClick={() => setRateModalOpen(true)}
                                className="group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted/70"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                                        <Star className="h-4 w-4 fill-current" />
                                    </div>
                                    <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                                        <div className="flex items-center gap-1.5">
                                            <span className="truncate text-xs font-semibold text-foreground">
                                                Rate Us
                                            </span>
                                            <span className="flex items-center gap-0.5 rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                                                ★ 5.0
                                            </span>
                                        </div>
                                        <span className="block truncate text-[10px] text-muted-foreground">
                                            Love Cortex? Leave your 5-star review
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 group-hover:text-foreground group-data-[collapsible=icon]:hidden" />
                            </button>

                            {/* T&C */}
                            <button
                                type="button"
                                onClick={() => setTermsModalOpen(true)}
                                className="group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted/70"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                                        <Gavel className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                                        <span className="block truncate text-xs font-semibold text-foreground">
                                            T&amp;C
                                        </span>
                                        <span className="block truncate text-[10px] text-muted-foreground">
                                            Terms, disclaimer &amp; honor code
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 group-hover:text-foreground group-data-[collapsible=icon]:hidden" />
                            </button>

                            {/* Share the App */}
                            <button
                                type="button"
                                onClick={() => setShareModalOpen(true)}
                                className="group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted/70"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
                                        <Share2 className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                                        <div className="flex items-center gap-1.5">
                                            <span className="truncate text-xs font-semibold text-foreground">
                                                Share the App
                                            </span>
                                            <span className="rounded-md bg-purple-500/15 px-1.5 py-0.2 text-[9px] font-extrabold text-purple-700 dark:text-purple-300">
                                                Gift 1 Mo
                                            </span>
                                        </div>
                                        <span className="block truncate text-[10px] text-muted-foreground">
                                            Invite colleagues &amp; study partners
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 group-hover:text-foreground group-data-[collapsible=icon]:hidden" />
                            </button>
                        </div>
                    </SidebarGroup>

                    {/* 5. SETTINGS & PREFERENCES */}
                    <SidebarGroup className="px-2 py-1">
                        <SidebarGroupLabel className="mb-1 px-2.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            Settings &amp; Preferences
                        </SidebarGroupLabel>
                        <Link
                            href="/settings/profile"
                            onClick={() => {
                                if (isMobile) setOpenMobile(false);
                            }}
                            className="group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted/70"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    <Sliders className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                                    <span className="block truncate text-xs font-semibold text-foreground">
                                        Settings &amp; Preferences
                                    </span>
                                    <span className="block truncate text-[10px] text-muted-foreground">
                                        Daily target, notifications &amp; account
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 group-hover:text-foreground group-data-[collapsible=icon]:hidden" />
                        </Link>
                    </SidebarGroup>
                </SidebarContent>

                {/* 6. BRANDED FOOTER WITH VERSION */}
                <SidebarFooter className="border-cortex-border/40 border-t p-2 space-y-1">
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-2 text-center group-data-[collapsible=icon]:hidden">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
                                    <Stethoscope className="h-3.5 w-3.5" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-[11px] font-extrabold tracking-tight text-foreground uppercase">
                                        {settings.app_name || 'CORTEX MEDICAL'}
                                    </span>
                                    <span className="block text-[9px] font-medium text-muted-foreground">
                                        Clinical Licensure &amp; AI Engine
                                    </span>
                                </div>
                            </div>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold text-muted-foreground">
                                {settings.app_version || 'v1.0.0 (1)'}
                            </span>
                        </div>
                        <p className="mt-1.5 text-[9px] text-muted-foreground/80 leading-snug">
                            © 2026 Cortex Medical Technologies Inc. All rights reserved.
                        </p>
                    </div>

                    {/* Bottom User Profile Section */}
                    <NavUser />
                </SidebarFooter>
            </Sidebar>

            {/* Support & Community Interactive Modals */}
            <CourseSelectorModal
                open={courseModalOpen}
                onOpenChange={setCourseModalOpen}
                currentPathway={activePathwayCode}
                pathways={pathwaysList}
                onSelectPathway={handleSelectPathway}
            />

            <ContactUsModal
                open={contactModalOpen}
                onOpenChange={setContactModalOpen}
                user={{ name: displayName, email: displayEmail }}
            />

            <RateUsModal
                open={rateModalOpen}
                onOpenChange={setRateModalOpen}
                user={{ name: displayName, email: displayEmail }}
            />

            <TermsConditionsModal
                open={termsModalOpen}
                onOpenChange={setTermsModalOpen}
            />

            <ShareAppModal
                open={shareModalOpen}
                onOpenChange={setShareModalOpen}
                user={{ name: displayName, email: displayEmail }}
            />
        </>
    );
}
