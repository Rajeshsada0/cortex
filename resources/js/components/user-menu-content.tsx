import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Settings, User as UserIcon, ShieldCheck, Palette, Sparkles, Shield } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { useSidebar } from '@/components/ui/sidebar';
import { logout } from '@/routes';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const { isMobile, setOpenMobile } = useSidebar();
    const { url } = usePage();
    const isAdmin = Boolean((user as any)?.is_admin);
    const isAdminRoute = url.startsWith('/admin');

    const handleCloseMobile = () => {
        cleanup();
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    const handleLogout = () => {
        handleCloseMobile();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1.5 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="flex w-full items-center gap-2 cursor-pointer text-xs"
                        href="/settings/profile"
                        prefetch
                        onClick={handleCloseMobile}
                    >
                        <UserIcon className="size-3.5 text-sky-500" />
                        <span>Profile &amp; Credentials</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="flex w-full items-center gap-2 cursor-pointer text-xs"
                        href="/settings/security"
                        prefetch
                        onClick={handleCloseMobile}
                    >
                        <ShieldCheck className="size-3.5 text-emerald-500" />
                        <span>Security &amp; Password</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="flex w-full items-center gap-2 cursor-pointer text-xs"
                        href="/settings/appearance"
                        prefetch
                        onClick={handleCloseMobile}
                    >
                        <Palette className="size-3.5 text-purple-500" />
                        <span>Appearance &amp; Theme</span>
                    </Link>
                </DropdownMenuItem>
                {isAdmin && (
                    <DropdownMenuItem asChild>
                        <Link
                            className="flex w-full items-center gap-2 cursor-pointer text-xs font-semibold text-amber-600 dark:text-amber-400"
                            href={isAdminRoute ? '/dashboard' : '/admin'}
                            prefetch
                            onClick={handleCloseMobile}
                        >
                            {isAdminRoute ? (
                                <>
                                    <Sparkles className="size-3.5" />
                                    <span>Candidate Portal</span>
                                </>
                            ) : (
                                <>
                                    <Shield className="size-3.5" />
                                    <span>Faculty Admin Console</span>
                                </>
                            )}
                        </Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="flex w-full items-center gap-2 cursor-pointer text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="size-3.5" />
                    <span>Log out</span>
                </Link>
            </DropdownMenuItem>
        </>
    );
}
