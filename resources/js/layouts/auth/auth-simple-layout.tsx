import React from 'react';
import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { ShieldCheck, Activity } from 'lucide-react';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] dark:bg-[#070e17] p-4 sm:p-6 lg:p-10 selection:bg-[#55BDEB]/30">
            {/* Background radial glow */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(85,189,235,0.15),transparent)]" />

            <div className="w-full max-w-md">
                <div className="flex flex-col gap-6">
                    {/* Brand Header */}
                    <div className="flex flex-col items-center gap-3 text-center">
                        <Link href={home()} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                            <AppLogo />
                        </Link>

                        <div className="space-y-1">
                            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                {title}
                            </h1>
                            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Auth Form Container Card */}
                    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl">
                        {children}
                    </div>

                    {/* Bottom Security Note */}
                    <div className="flex items-center justify-center gap-2 text-center text-[11px] text-muted-foreground">
                        <ShieldCheck className="size-3.5 text-[#2FB36F]" />
                        <span>HIPAA Compliant • 256-Bit SSL Encrypted Session</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
