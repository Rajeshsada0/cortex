import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    GraduationCap,
    HelpCircle,
    LayoutGrid,
    Sparkles,
    Stethoscope,
    Zap,
    Shield,
    FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLogo from '@/components/app-logo';
import { MedicalBackgroundElements } from '@/components/cortex/medical-background-elements';

interface TrackItem {
    id: string;
    pathway: string;
    name: string;
    region: string;
    description: string;
    questions: number;
    blocks: number;
    duration: string;
    marking: string;
    color: string;
    accent: string;
    badge: string;
}

interface ChooseProps {
    tracks: TrackItem[];
    totalQuestions: number;
    totalSubjects: number;
    currentUser: any;
}

export default function Choose({
    tracks,
    totalQuestions,
    totalSubjects,
    currentUser,
}: ChooseProps) {
    const handleLaunchTrack = (pathway: string) => {
        router.post('/practice/guest-launch', { pathway });
    };

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#FDFDFC] text-[#102A43] selection:bg-[#0066FF]/30 dark:bg-[#070e17] dark:text-neutral-100">
            <Head title="Choose Practice Mode — USMLE, NEET-PG, CEE Nepal | Cortex Medical" />

            <MedicalBackgroundElements />

            {/* Top Navigation */}
            <header className="border-border/70 bg-background/85 sticky top-0 z-50 border-b backdrop-blur-md transition-colors">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="group flex items-center gap-2">
                        <AppLogo />
                    </Link>

                    <nav className="hidden items-center gap-6 text-xs font-semibold md:flex">
                        <Link
                            href="/choose"
                            className="font-bold text-[#0066FF] transition-colors dark:text-sky-400"
                        >
                            Exam Tracks
                        </Link>
                        <Link
                            href="/subjects"
                            className="text-muted-foreground transition-colors hover:text-[#0066FF]"
                        >
                            Subjects
                        </Link>
                        <Link
                            href="/about-medai"
                            className="text-muted-foreground transition-colors hover:text-[#0066FF]"
                        >
                            About MedAI
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        {currentUser ? (
                            <Link href="/dashboard">
                                <Button
                                    size="sm"
                                    className="h-9 bg-[#102A43] text-xs font-bold text-white shadow-sm dark:bg-[#0066FF]"
                                >
                                    Dashboard →
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs font-semibold hover:text-[#0066FF]"
                                >
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Heading */}
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <div className="mb-10 max-w-3xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-bold text-sky-800 dark:border-sky-800/80 dark:bg-sky-950/60 dark:text-sky-300">
                        <Sparkles className="size-3.5 text-sky-600 dark:text-sky-400" />
                        <span>
                            ZERO LOGIN REQUIRED · INSTANT TIMED PRACTICE ·
                            VERIFIED RATIONALES
                        </span>
                    </div>
                    <h1 className="text-3xl leading-[1.15] font-black tracking-tight text-[#0A1E34] sm:text-4xl lg:text-5xl dark:text-white">
                        Pick your postgraduate exam track
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                        Full-length national simulation mocks for USMLE,
                        NEET-PG, and CEE Nepal — calibrated to each exam's
                        official question style, block timing, and
                        negative-marking criteria.
                    </p>
                </div>

                {/* 4 Tracks Grid */}
                <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
                    {tracks.map((track) => (
                        <div
                            key={track.id}
                            className="group dark:border-border/80 dark:bg-card relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)] sm:p-8 dark:hover:border-sky-500/50"
                        >
                            <div className="flex flex-col">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                                        {track.region}
                                    </span>
                                    <span className="dark:bg-muted dark:border-border inline-flex items-center rounded-full border border-slate-200/80 bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                        {track.badge}
                                    </span>
                                </div>

                                <h2 className="text-2xl font-black text-[#0A1E34] transition-colors group-hover:text-[#0066FF] dark:text-white dark:group-hover:text-sky-400">
                                    {track.name}
                                </h2>

                                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
                                    {track.description}
                                </p>

                                {/* Pills Strip */}
                                <div className="mt-6 flex flex-wrap gap-2 text-xs">
                                    <span className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-1 font-semibold text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/70 dark:text-sky-300">
                                        {track.questions} questions
                                    </span>
                                    <span className="dark:bg-muted/70 dark:border-border rounded-lg border border-slate-200/70 bg-slate-50 px-3 py-1 font-semibold text-slate-700 dark:text-slate-300">
                                        {track.duration}
                                    </span>
                                    <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1 font-semibold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/70 dark:text-emerald-300">
                                        {track.marking}
                                    </span>
                                </div>
                            </div>

                            <div className="dark:border-border/80 mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                                    No signup needed · Auto-scored
                                </span>
                                <Button
                                    onClick={() =>
                                        handleLaunchTrack(track.pathway)
                                    }
                                    className="h-10 rounded-xl bg-[#0A1E34] px-5 text-xs font-bold text-white shadow-md transition-all group-hover:translate-x-0.5 hover:bg-[#0066FF] dark:bg-[#0066FF] dark:hover:bg-sky-500"
                                >
                                    Start {track.name}
                                    <ArrowRight className="ml-2 size-3.5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Drill by Specialty Banner */}
                <div className="mb-16 rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-sky-50 p-8 shadow-sm sm:p-10 dark:from-sky-950/30 dark:via-blue-950/20 dark:to-indigo-950/30">
                    <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                        <div className="max-w-2xl">
                            <span className="text-xs font-bold tracking-wider text-[#0066FF] uppercase dark:text-sky-400">
                                Targeted Subject Training
                            </span>
                            <h2 className="mt-1 text-2xl font-black text-[#0A1E34] sm:text-3xl dark:text-white">
                                Drill high-yield subjects & specialties
                            </h2>
                            <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
                                Internal Medicine, Pediatrics, Surgery,
                                Pathology, Pharmacology, and 14 more medical
                                specialties. Practice focused 40-question sets
                                with <strong>immediate reveal</strong> and
                                comprehensive option rationales.
                            </p>
                        </div>
                        <Link href="/subjects" className="shrink-0">
                            <Button className="h-12 rounded-2xl bg-[#0066FF] px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700">
                                <LayoutGrid className="mr-2 size-4" />
                                Browse 19 Subjects
                                <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Trust & Methodology Strip */}
                <div className="dark:border-border grid grid-cols-1 gap-6 border-t border-slate-200 pt-4 sm:grid-cols-3">
                    <div className="flex items-start gap-3.5">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-[#0066FF] dark:bg-sky-900/50 dark:text-sky-400">
                            <Zap className="size-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#0A1E34] dark:text-white">
                                Zero Signup Barrier
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                Start test sessions instantly. Guest sessions
                                are preserved locally in your browser.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3.5">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                            <CheckCircle2 className="size-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#0A1E34] dark:text-white">
                                Accurate Negative Marking
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                Calibrated +4/−1 (NEET-PG), +1/−0.25 (CEE
                                Nepal), and USMLE 3-digit scaled scoring.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3.5">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                            <FileText className="size-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#0A1E34] dark:text-white">
                                Downloadable PDF Reports
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                Export full exam transcripts, scorecards, and
                                distractor rationales for offline review.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="dark:border-border dark:bg-card/40 mt-auto border-t border-slate-200 bg-slate-50/60 py-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
                    <div>
                        © {new Date().getFullYear()} Cortex Medical. MedAI
                        Practice Engine for Medical Graduates.
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/choose" className="hover:text-foreground">
                            Exam Tracks
                        </Link>
                        <Link
                            href="/subjects"
                            className="hover:text-foreground"
                        >
                            Subjects
                        </Link>
                        <Link
                            href="/about-medai"
                            className="hover:text-foreground"
                        >
                            About MedAI
                        </Link>

                    </div>
                </div>
            </footer>
        </div>
    );
}
