import React from 'react';
import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { ShieldCheck, Lock, Zap, Stethoscope, Dna, HeartPulse } from 'lucide-react';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#06306b] via-[#041e46] to-[#02132d] p-4 selection:bg-cyan-500/30 sm:p-6 lg:p-8">
            {/* Ambient medical background graphics */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none">
                {/* 1. Deep Medical Vignette Radial Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_15%,rgba(14,165,233,0.25),transparent_75%)]" />
                <div className="absolute top-1/4 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />

                {/* 2. Side Organic Curves / Wave Lobes (Left & Right Framing) */}
                <div className="absolute top-0 -left-20 h-[85%] w-72 rounded-r-[160px] bg-gradient-to-br from-sky-500/15 via-blue-700/10 to-transparent blur-2xl sm:w-96" />
                <div className="absolute top-10 -right-20 h-[85%] w-72 rounded-l-[160px] bg-gradient-to-bl from-cyan-500/15 via-blue-700/10 to-transparent blur-2xl sm:w-96" />

                {/* 3. Top-left Dot Matrix (5x5 grid) */}
                <div className="absolute top-8 left-6 grid grid-cols-5 gap-2.5 opacity-45 sm:top-12 sm:left-12">
                    {Array.from({ length: 25 }).map((_, i) => (
                        <div
                            key={i}
                            className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_5px_rgba(34,211,238,0.85)]"
                        />
                    ))}
                </div>

                {/* 4. Top-right Dot Matrix (3x4 grid) */}
                <div className="absolute top-14 right-8 hidden grid-cols-4 gap-2.5 opacity-30 lg:grid">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className="size-1.5 rounded-full bg-sky-300 shadow-[0_0_4px_rgba(56,189,248,0.7)]"
                        />
                    ))}
                </div>

                {/* 5. Prominent Rounded Medical Crosses (+) matching mockup */}
                {/* Mid-Left Cross */}
                <div className="absolute top-52 left-6 text-cyan-400/30 drop-shadow-[0_0_12px_rgba(34,211,238,0.45)] sm:left-16">
                    <svg
                        className="size-10 sm:size-12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M8 2h8a1 1 0 0 1 1 1v5h5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-5v5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-5H2a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h5V3a1 1 0 0 1 1-1z" />
                    </svg>
                </div>

                {/* Top-Right Large Cross */}
                <div className="absolute top-24 right-8 text-cyan-400/35 drop-shadow-[0_0_16px_rgba(34,211,238,0.5)] sm:right-20">
                    <svg
                        className="size-14 sm:size-16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M8 2h8a1 1 0 0 1 1 1v5h5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-5v5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-5H2a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h5V3a1 1 0 0 1 1-1z" />
                    </svg>
                </div>

                {/* Bottom-Left Subtle Cross */}
                <div className="absolute bottom-40 left-10 hidden text-sky-400/25 sm:block">
                    <svg
                        className="size-8"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M8 2h8a1 1 0 0 1 1 1v5h5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-5v5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-5H2a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h5V3a1 1 0 0 1 1-1z" />
                    </svg>
                </div>

                {/* 6. Medical Graphic Floating Icons */}
                {/* Stethoscope on Left */}
                <div className="absolute top-[38%] left-4 -rotate-12 text-cyan-300/25 drop-shadow-[0_0_14px_rgba(34,211,238,0.35)] sm:left-12">
                    <Stethoscope
                        className="size-12 sm:size-16"
                        strokeWidth={1.5}
                    />
                </div>

                {/* DNA Double Helix on Right */}
                <div className="absolute top-[42%] right-4 rotate-12 text-sky-300/25 drop-shadow-[0_0_14px_rgba(56,189,248,0.35)] sm:right-12">
                    <Dna
                        className="size-12 sm:size-16"
                        strokeWidth={1.5}
                    />
                </div>

                {/* HeartPulse on Mid-Right */}
                <div className="absolute top-[64%] right-8 rotate-6 text-cyan-400/25 sm:right-24">
                    <HeartPulse
                        className="size-10 sm:size-12"
                        strokeWidth={1.5}
                    />
                </div>

                {/* Chevron Indicator on Upper-Right (matching mockup) */}
                <div className="absolute top-[32%] right-10 text-sky-300/40 sm:right-28">
                    <svg
                        className="size-6 animate-pulse"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m18 15-6-6-6 6" />
                    </svg>
                </div>

                {/* 7. Bottom Layered Waves & Glowing Cyan ECG Trace */}
                <div className="absolute inset-x-0 bottom-0 h-52 overflow-hidden">
                    <svg
                        className="absolute bottom-0 h-full w-full"
                        viewBox="0 0 1440 260"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M0,140 C280,240 460,80 780,170 C1100,260 1260,110 1440,180 L1440,260 L0,260 Z"
                            fill="rgba(3, 105, 161, 0.28)"
                        />
                        <path
                            d="M0,190 C340,120 700,250 1060,170 C1240,130 1360,200 1440,220 L1440,260 L0,260 Z"
                            fill="rgba(6, 182, 212, 0.22)"
                        />
                    </svg>

                    {/* Cyan ECG rhythm pulse wave line on bottom right */}
                    <div className="absolute right-0 bottom-2 h-20 w-80 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.85)] sm:w-96">
                        <svg
                            viewBox="0 0 320 80"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-full w-full"
                        >
                            <path d="M0 45 H100 L110 20 L120 70 L130 30 L138 52 L146 45 H320" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[500px]">
                <div className="flex flex-col gap-6">
                    {/* Brand Header */}
                    <div className="flex flex-col items-center gap-2 text-center">
                        <Link
                            href={home()}
                            className="group inline-flex items-center gap-3 transition-transform hover:scale-[1.02]"
                        >
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 via-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
                                <Zap className="size-6 fill-current text-white" />
                            </div>
                            <div className="text-left leading-none">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-black tracking-wider text-white">
                                        CORTEX<span className="text-cyan-400">MED</span>
                                    </span>
                                    <span className="rounded-full border border-cyan-400/40 bg-cyan-950/70 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                                        v4.2
                                    </span>
                                </div>
                                <p className="mt-1.5 text-xs font-medium text-sky-200/80">
                                    Candidate Readiness Portal
                                </p>
                            </div>
                        </Link>

                        <div className="mt-3 space-y-1">
                            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                                {title}
                            </h1>
                            <p className="mx-auto max-w-sm text-xs text-sky-200/90 sm:text-sm">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Auth Form Container Card (Pristine White Card) */}
                    <div className="rounded-[28px] border border-white/40 bg-white p-6 shadow-2xl shadow-sky-950/60 sm:p-8 [color-scheme:light]">
                        {children}
                    </div>

                    {/* Bottom Security Note */}
                    <div className="flex items-center justify-center gap-3 text-center text-xs font-semibold text-sky-100/90">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="size-4 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                            <span>HIPAA Compliant</span>
                        </div>
                        <span className="text-sky-300/40">•</span>
                        <div className="flex items-center gap-1.5">
                            <Lock className="size-3.5 text-sky-200" />
                            <span>256-Bit SSL Encrypted Session</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
