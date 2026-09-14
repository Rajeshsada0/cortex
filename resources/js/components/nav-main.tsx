import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({
    items,
    label = 'Platform',
}: {
    items: NavItem[];
    label?: string;
}) {
    const { isCurrentUrl } = useCurrentUrl();
    const { isMobile, setOpenMobile } = useSidebar();

    return (
        <SidebarGroup className="px-2 py-1">
            <SidebarGroupLabel className="mb-1 px-2.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                {label}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1">
                {items.map((item) => {
                    const active = isCurrentUrl(item.href);
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                className={`group h-10 rounded-xl px-3 transition-colors ${
                                    active
                                        ? 'border border-cyan-500/40 bg-sky-50 font-semibold text-cyan-800 shadow-xs hover:bg-sky-50 dark:border-cyan-500/35 dark:bg-[#0e2238] dark:text-cyan-300'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
                                }`}
                            >
                                <Link
                                    href={item.href}
                                    prefetch
                                    onClick={() => {
                                        if (isMobile) {
                                            setOpenMobile(false);
                                        }
                                    }}
                                    className="flex w-full items-center justify-between"
                                >
                                    <div className="flex items-center gap-3 truncate">
                                        {item.icon && (
                                            <item.icon
                                                className={`size-4.5 shrink-0 transition-colors ${
                                                    active
                                                        ? 'text-cyan-600 dark:text-cyan-400'
                                                        : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300'
                                                }`}
                                            />
                                        )}
                                        <span className="truncate text-xs font-medium">
                                            {item.title}
                                        </span>
                                    </div>
                                    {item.badge && (
                                        <span className="ml-auto rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-600 dark:bg-[#0c1e33] dark:text-cyan-400">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
