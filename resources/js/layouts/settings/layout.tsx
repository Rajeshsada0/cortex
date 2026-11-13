import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';
import { User, Shield, Palette } from 'lucide-react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile & Clinical Track',
        href: edit(),
        icon: User,
    },
    {
        title: 'Security & Access',
        href: editSecurity(),
        icon: Shield,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <div className="mb-6">
                <Heading
                    title="Account & Clinical Settings"
                    description="Manage candidate credentials, licensing examination tracks, daily prep goals, and account security."
                />
            </div>

            <div className="flex flex-col lg:flex-row lg:space-x-8">
                <aside className="w-full lg:w-64 shrink-0 mb-6 lg:mb-0">
                    <nav
                        className="flex flex-col space-y-1 rounded-2xl border border-border bg-card p-2 shadow-2xs"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => {
                            const active = isCurrentOrParentUrl(item.href);
                            return (
                                <Button
                                    key={`${toUrl(item.href)}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn(
                                        'w-full justify-start rounded-xl font-bold text-xs h-10 px-3 transition-colors',
                                        active
                                            ? 'bg-sky-50 text-sky-800 font-extrabold shadow-2xs dark:bg-sky-950/50 dark:text-sky-300'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    )}
                                >
                                    <Link href={item.href} className="flex items-center gap-2.5">
                                        {item.icon && (
                                            <item.icon
                                                className={cn(
                                                    'h-4 w-4 shrink-0',
                                                    active
                                                        ? 'text-sky-600 dark:text-sky-400'
                                                        : 'text-muted-foreground'
                                                )}
                                            />
                                        )}
                                        <span>{item.title}</span>
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                <div className="flex-1 min-w-0">
                    <div className="w-full space-y-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
