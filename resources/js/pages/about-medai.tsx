import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Brain,
    CheckCircle2,
    FileText,
    GraduationCap,
    HelpCircle,
    LayoutGrid,
    ShieldAlert,
    Sparkles,
    Stethoscope,
    Target,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLogo from '@/components/app-logo';
import { MedicalBackgroundElements } from '@/components/cortex/medical-background-elements';

export default function AboutMedAi() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#FDFDFC] text-[#102A43] selection:bg-[#0066FF]/30 dark:bg-[#070e17] dark:text-neutral-100">
            <Head title="About MedAI Question Engine — Easy-PG Style | Cortex" />

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
                            className="text-muted-foreground transition-colors hover:text-[#0066FF]"
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
                            className="font-bold text-[#0066FF] transition-colors dark:text-sky-400"
                        >
                            About MedAI
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Link href="/demo-login">
                            <Button
                                size="sm"
                                variant="outline"
                                className="hidden border-[#0066FF]/40 bg-[#0066FF]/10 text-xs font-bold text-[#0066FF] shadow-sm transition-all hover:bg-[#0066FF]/20 sm:inline-flex dark:text-sky-400"
                            >
                                <Zap className="mr-1 size-3.5 animate-pulse text-[#0066FF]" />
                                1-Click Demo
                            </Button>
                        </Link>
                        <Link href="/choose">
                            <Button
                                size="sm"
                                className="h-9 bg-[#0066FF] text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                            >
                                Start Practice →
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
                {/* Badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-bold text-sky-800 dark:border-sky-800/80 dark:bg-sky-950/60 dark:text-sky-300">
                    <Brain className="size-3.5 text-sky-600 dark:text-sky-400" />
                    <span>
                        MEDAI QUESTION GENERATION &amp; SCORING ARCHITECTURE
                    </span>
                </div>

                <h1 className="text-3xl leading-[1.15] font-black tracking-tight text-[#0A1E34] sm:text-5xl dark:text-white">
                    About MedAI Question Engine
                </h1>

                <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                    MedAI is the question and active recall engine powering our
                    medical test sessions. It synthesizes exam-style clinical
                    vignettes, rigorously validates plausible distractors, and
                    pairs every question with immediate, detailed rationales.
                </p>

                {/* Quick Action CTAs */}
                <div className="dark:border-border mt-8 flex flex-wrap items-center gap-3 border-b border-slate-200 pb-8">
                    <Link href="/choose">
                        <Button className="h-11 rounded-xl bg-[#0066FF] px-5 text-xs font-bold text-white shadow-md hover:bg-blue-700">
                            Start a Mock Exam
                            <ArrowRight className="ml-1.5 size-3.5" />
                        </Button>
                    </Link>
                    <Link href="/subjects">
                        <Button
                            variant="outline"
                            className="h-11 rounded-xl px-5 text-xs font-bold"
                        >
                            <LayoutGrid className="mr-1.5 size-3.5" />
                            Browse 19 Specialties
                        </Button>
                    </Link>
                </div>

                {/* Section 1: What MedAI is */}
                <div className="mt-10 space-y-4">
                    <h2 className="text-2xl font-black text-[#0A1E34] dark:text-white">
                        What MedAI is
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        When you select an examination track or specialty topic,
                        MedAI provides a balanced set of multiple-choice
                        questions: a multi-sentence patient vignette, vital
                        signs and lab results, five realistic options, a
                        verified single best answer, and comprehensive
                        rationales for both the keyed option and why alternative
                        distractors fail.
                    </p>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        The loop is simple, friction-free, and laser-focused on
                        learning:{' '}
                        <strong>
                            Generate → Answer under authentic time or study
                            reveal → Review distractor logic → Download
                            printable PDF error log.
                        </strong>
                    </p>
                </div>

                {/* Section 2: What it covers */}
                <div className="mt-10 space-y-4">
                    <h2 className="text-2xl font-black text-[#0A1E34] dark:text-white">
                        What it covers
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        MedAI dynamically adapts to the exact requirements of
                        your target examination:
                    </p>
                    <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                        <div className="dark:border-border dark:bg-card rounded-2xl border border-slate-200/90 bg-white p-5">
                            <div className="text-xs font-bold text-[#0066FF] uppercase">
                                United States
                            </div>
                            <h3 className="mt-0.5 text-base font-bold text-[#0A1E34] dark:text-white">
                                USMLE Step 1
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                280 questions across 7 timed blocks.
                                Systems-based basic sciences, pathology
                                mechanisms, and drug receptors.
                            </p>
                        </div>
                        <div className="dark:border-border dark:bg-card rounded-2xl border border-slate-200/90 bg-white p-5">
                            <div className="text-xs font-bold text-[#0066FF] uppercase">
                                United States
                            </div>
                            <h3 className="mt-0.5 text-base font-bold text-[#0A1E34] dark:text-white">
                                USMLE Step 2 CK
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                318 questions across 8 blocks. Diagnosis vs
                                management algorithms, safety, and
                                next-best-step decisions.
                            </p>
                        </div>
                        <div className="dark:border-border dark:bg-card rounded-2xl border border-slate-200/90 bg-white p-5">
                            <div className="text-xs font-bold text-emerald-600 uppercase">
                                India
                            </div>
                            <h3 className="mt-0.5 text-base font-bold text-[#0A1E34] dark:text-white">
                                NEET-PG (2026)
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                180 questions, 5 time-locked sections, +4/−1
                                marking (720 max marks). High-yield clinical
                                stems.
                            </p>
                        </div>
                        <div className="dark:border-border dark:bg-card rounded-2xl border border-slate-200/90 bg-white p-5">
                            <div className="text-xs font-bold text-rose-600 uppercase">
                                Nepal
                            </div>
                            <h3 className="mt-0.5 text-base font-bold text-[#0A1E34] dark:text-white">
                                CEE PG / MECEE-PG
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                200 MCQs, 3 hours, +1/−0.25 negative marking.
                                Nepal health guidelines, CPD module, and
                                clinical branches.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 3: Study Mode vs Exam Mode */}
                <div className="mt-10 space-y-4">
                    <h2 className="text-2xl font-black text-[#0A1E34] dark:text-white">
                        Dual Delivery Modes
                    </h2>
                    <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:bg-emerald-950/20">
                            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                                1. Instant Study Mode (Topic Drills)
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-emerald-800/80 dark:text-emerald-400">
                                Selecting an option immediately reveals if it's
                                correct (green check) or wrong (red cross), tags
                                your pick, and reveals why that specific
                                distractor is wrong. Perfect for daily active
                                recall.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-5 dark:bg-sky-950/20">
                            <h3 className="text-sm font-bold text-sky-900 dark:text-sky-300">
                                2. Timed Grand Mock Mode (Hall)
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-sky-800/80 dark:text-sky-400">
                                Strict test-day simulation with fullscreen, live
                                block timer, crash-proof auto-recovery, and full
                                results scored only upon submission with
                                official national negative-marking calculations.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Final Call to Action Box */}
                <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-[#0A1E34] to-[#173859] p-8 text-white shadow-xl sm:flex-row">
                    <div>
                        <h3 className="text-xl font-bold">
                            Ready to test your clinical knowledge?
                        </h3>
                        <p className="mt-1 text-xs text-slate-300">
                            No signup required. Start a free timed set in under
                            5 seconds.
                        </p>
                    </div>
                    <Link href="/choose">
                        <Button className="h-11 shrink-0 rounded-xl bg-[#0066FF] px-6 text-xs font-bold text-white shadow-md hover:bg-blue-600">
                            Pick an Exam Track
                            <ArrowRight className="ml-2 size-4" />
                        </Button>
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="dark:border-border dark:bg-card/40 mt-auto border-t border-slate-200 bg-slate-50/60 py-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
                    <div>
                        © {new Date().getFullYear()} Cortex Medical. MedAI
                        Practice Engine.
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
                        <Link
                            href="/demo-login"
                            className="hover:text-foreground"
                        >
                            Demo Login
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
