import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    PlaySquare,
    GraduationCap,
    Repeat,
    Calendar,
    BookOpen,
    Shield,
    CheckCircle2,
    Sparkles,
    ArrowRight,
    Sliders,
    Layers,
    Lightbulb,
    Lock,
    Eye,
    TrendingUp,
    Zap,
    HeartPulse,
    Award,
    Stethoscope,
    Compass,
    Users,
    Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLogo from '@/components/app-logo';
import { MedicalDivider } from '@/components/cortex/medical-divider';
import { MedicalBackgroundElements } from '@/components/cortex/medical-background-elements';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Welcome() {
    const { auth } = usePage().props as any;

    // Interactive preview state
    const [selectedOption, setSelectedOption] = useState<string | null>('C');
    const [activeTier, setActiveTier] = useState<
        'foundation' | 'integration' | 'application'
    >('foundation');

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground selection:bg-cyan-500/30">
            <Head title="Cortex Medical — Postgraduate Doctor Entrance Preparation (MECEE-PG • INI-CET • USMLE)" />

            {/* Persistent Ambient Medical Background Elements */}
            <MedicalBackgroundElements />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md transition-colors">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="group flex items-center gap-2">
                        <AppLogo />
                    </Link>

                    {/* Nav Links */}
                    <nav className="hidden items-center gap-6 text-xs font-semibold md:flex">
                        <Link
                            href="/choose"
                            className="font-bold text-cyan-600 dark:text-cyan-400 transition-colors hover:underline"
                        >
                            Practice Tracks (No Login)
                        </Link>
                        <Link
                            href="/subjects"
                            className="text-slate-600 transition-colors hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-400"
                        >
                            19 Subjects
                        </Link>
                        <Link
                            href="/about-medai"
                            className="text-slate-600 transition-colors hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-400"
                        >
                            About MedAI
                        </Link>
                        <a
                            href="#vignette-demo"
                            className="text-slate-600 transition-colors hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-400"
                        >
                            Clinical Vignette
                        </a>
                        <a
                            href="#features"
                            className="text-slate-600 transition-colors hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-400"
                        >
                            Architecture
                        </a>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <ThemeToggle />

                        <Link href="/demo-login">
                            <Button
                                size="sm"
                                variant="outline"
                                className="hidden border-cyan-500/40 bg-cyan-500/10 text-xs font-bold text-cyan-700 dark:text-cyan-400 shadow-sm transition-all hover:bg-cyan-500/20 sm:inline-flex"
                            >
                                <Zap className="mr-1 size-3.5 animate-pulse text-cyan-500 dark:text-cyan-400" />
                                1-Click Demo (Dr. Cortex)
                            </Button>
                        </Link>

                        {auth?.user ? (
                            <Link
                                href={
                                    auth.user.is_admin ? '/admin' : '/dashboard'
                                }
                            >
                                <Button
                                    size="sm"
                                    className="h-9 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-cyan-400 px-4 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition-transform hover:scale-[1.02]"
                                >
                                    {auth.user.is_admin
                                        ? 'Admin Console →'
                                        : 'Dashboard →'}
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs font-semibold text-slate-700 hover:text-foreground dark:text-slate-300 dark:hover:text-white"
                                    >
                                        Log In
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button
                                        size="sm"
                                        className="h-9 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-cyan-400 px-4 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition-transform hover:scale-[1.02]"
                                    >
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section with Doctor Entrance Mockup Layout */}
            <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/80 via-background to-background dark:from-[#0a1426] dark:via-[#070b14] dark:to-[#070b14] pt-8 pb-12 sm:pt-14 sm:pb-16">
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Top 2-Column Grid: Text on Left, Doctor Graphic on Right */}
                    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8">
                        {/* Left Column (58% width) */}
                        <div className="flex flex-col items-start text-left lg:col-span-7">
                            {/* Doctor Entrance Preparation Top Pill Badge */}
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-300 shadow-sm">
                                <Stethoscope className="size-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                                <span className="tracking-wide">
                                    DOCTOR ENTRANCE PREPARATION · MECEE-PG ·
                                    NEET-PG · INI-CET · USMLE
                                </span>
                            </div>

                            {/* Main Headline with Blue Gradient */}
                            <h1 className="text-4xl leading-[1.14] font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.3rem]">
                                Precision Postgraduate
                                <br />
                                Entrance Platform for
                                <br />
                                <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 dark:from-cyan-400 dark:via-sky-300 dark:to-blue-400 bg-clip-text text-transparent">
                                    Future Medical Specialists
                                </span>
                            </h1>

                            {/* Subheadline Description */}
                            <p className="mt-5 max-w-xl text-sm leading-relaxed font-normal text-slate-600 dark:text-slate-300 sm:text-[15px]">
                                Inspired by the best medical question banks
                                (Easy-PG • NBME • AIIMS). Zero-friction instant
                                practice, authentic national negative marking
                                (+4/−1 NEET-PG, +1/−0.25 CEE), immediate-reveal
                                subject drills, and downloadable official PDF
                                performance reports.
                            </p>

                            {/* 4 Action Buttons */}
                            <div className="no-scrollbar mt-8 flex w-full flex-row flex-nowrap items-center gap-2.5 overflow-x-auto pb-1 sm:gap-3 sm:overflow-visible sm:pb-0">
                                {/* Primary Button: Start Practice (Zero Login) */}
                                <Link href="/choose" className="group shrink-0">
                                    <div className="flex h-[52px] items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-4 whitespace-nowrap font-bold text-slate-950 shadow-[0_4px_18px_rgba(6,182,212,0.3)] transition-all duration-200 hover:shadow-cyan-500/50 hover:scale-[1.02]">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-950/20 text-slate-950">
                                                <Sparkles className="size-4 fill-slate-950 text-slate-950" />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-xs leading-tight font-extrabold text-slate-950 sm:text-[13px]">
                                                    Start Practice Now
                                                </span>
                                                <span className="mt-0.5 text-[10px] leading-tight font-semibold text-slate-900/80 sm:text-[11px]">
                                                    No Login Required
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowRight className="ml-1 size-4 shrink-0 text-slate-950 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>

                                {/* 1-Click Demo */}
                                <Link
                                    href="/demo-login"
                                    className="group shrink-0"
                                >
                                    <div className="flex h-[52px] items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 text-xs font-bold whitespace-nowrap text-foreground shadow-sm transition-all duration-200 hover:bg-muted dark:border-slate-700 dark:bg-slate-900/90 dark:text-white dark:hover:bg-slate-800 sm:px-4 sm:text-[13px]">
                                        <Zap className="size-4 shrink-0 text-amber-500 dark:text-amber-400" />
                                        <span>1-Click Demo</span>
                                    </div>
                                </Link>

                                {/* Secondary Button: 19 Subjects Drill */}
                                <Link
                                    href="/subjects"
                                    className="group shrink-0"
                                >
                                    <div className="flex h-[52px] items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 text-xs font-bold whitespace-nowrap text-foreground shadow-sm transition-all duration-200 hover:bg-muted dark:border-slate-700 dark:bg-slate-900/90 dark:text-white dark:hover:bg-slate-800 sm:px-4 sm:text-[13px]">
                                        <PlaySquare className="size-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                                        <span>19 Subjects</span>
                                    </div>
                                </Link>

                                {/* Secondary Button: Grand Mock Hall */}
                                <Link
                                    href="/mock-exam"
                                    className="group shrink-0"
                                >
                                    <div className="flex h-[52px] items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 text-xs font-bold whitespace-nowrap text-foreground shadow-sm transition-all duration-200 hover:bg-muted dark:border-slate-700 dark:bg-slate-900/90 dark:text-white dark:hover:bg-slate-800 sm:px-4 sm:text-[13px]">
                                        <GraduationCap className="size-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                                        <span>Mock Hall</span>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Right Column: Clean Transparent Doctor Graphic */}
                        <div className="relative flex items-center justify-center lg:col-span-5 lg:justify-end">
                            <div className="relative flex w-full max-w-[520px] items-center justify-center">
                                <img
                                    src="/images/doctor-hero.png?v=5"
                                    alt="Medical Doctor Postgraduate Entrance Candidate preparing with Cortex Platform"
                                    className="pointer-events-none h-auto w-full object-contain select-none"
                                    loading="eager"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Full-Width Floating Stats Bar Underneath */}
                    <div className="mt-12 w-full rounded-2xl border border-border bg-card p-5 shadow-xl sm:mt-14 sm:rounded-3xl sm:p-7 dark:border-slate-800/90 dark:bg-gradient-to-r dark:from-slate-900/95 dark:via-[#0d1527] dark:to-slate-900/95">
                        <div className="grid grid-cols-1 items-center gap-6 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:divide-border dark:divide-slate-800 lg:grid-cols-4">
                            {/* Stat 1: 20,000+ */}
                            <div className="flex items-center gap-4 pt-4 first:px-0 first:pt-0 sm:px-4 sm:pt-0">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <Users className="size-6" />
                                </div>
                                <div>
                                    <div className="font-mono text-2xl font-black tracking-tight text-foreground sm:text-3xl dark:text-white">
                                        20,000+
                                    </div>
                                    <div className="mt-0.5 text-xs font-medium text-muted-foreground">
                                        Postgraduate Clinical Vignettes
                                    </div>
                                </div>
                            </div>

                            {/* Stat 2: 19 Subjects */}
                            <div className="flex items-center gap-4 pt-4 sm:px-4 sm:pt-0">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                    <BookOpen className="size-6" />
                                </div>
                                <div>
                                    <div className="font-mono text-2xl font-black tracking-tight text-cyan-600 dark:text-cyan-400 sm:text-3xl">
                                        19 Subjects
                                    </div>
                                    <div className="mt-0.5 text-xs font-medium text-muted-foreground">
                                        Anatomy to Obstetrics &amp; Gyn
                                    </div>
                                </div>
                            </div>

                            {/* Stat 3: Dual-Metric */}
                            <div className="flex items-center gap-4 pt-4 sm:px-4 sm:pt-0">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <Target className="size-6" />
                                </div>
                                <div>
                                    <div className="font-mono text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 sm:text-3xl">
                                        Dual-Metric
                                    </div>
                                    <div className="mt-0.5 text-xs font-medium text-muted-foreground">
                                        Confidence + Accuracy SRS
                                    </div>
                                </div>
                            </div>

                            {/* Stat 4: <100ms */}
                            <div className="flex items-center gap-4 pt-4 sm:px-4 sm:pt-0">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                    <Zap className="size-6 fill-current" />
                                </div>
                                <div>
                                    <div className="font-mono text-2xl font-black tracking-tight text-purple-600 dark:text-purple-400 sm:text-3xl">
                                        &lt;100ms
                                    </div>
                                    <div className="mt-0.5 text-xs font-medium text-muted-foreground">
                                        Instant Vignette Delivery
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modern Section Divider 1 */}
            <MedicalDivider
                label="Interactive Clinical Vignette"
                subtitle="Emergency Diagnostic Reasoning Deconstruction"
                icon={Activity}
                accentColor="blue"
            />

            {/* Interactive Clinical Vignette Demo Card */}
            <section
                id="vignette-demo"
                className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 sm:px-6"
            >
                <div className="mb-8 flex flex-col gap-2 text-center">
                    <span className="text-xs font-bold tracking-wider text-cyan-600 dark:text-cyan-400 uppercase">
                        HIGH-YIELD CLINICAL VIGNETTE ARCHITECTURE
                    </span>
                    <h2 className="text-2xl font-black tracking-tight text-foreground dark:text-white sm:text-3xl">
                        Integrated Clinical Vignette with 3-Tier Deconstruction
                    </h2>
                    <p className="mx-auto max-w-lg text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                        Experience our split-screen runner: test your diagnostic
                        choice below to view instant post-answer analysis across
                        Foundation, Integration, and Application tiers.
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-xl transition-all duration-300 hover:border-cyan-500/40 sm:p-8 dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-[#0d1322]">
                    {/* Top Stem Bar */}
                    <div className="flex items-center justify-between border-b border-border pb-3 dark:border-slate-800/80">
                        <div className="flex items-center gap-2">
                            <span className="rounded-lg border border-border bg-muted px-2.5 py-1 font-mono text-xs font-bold text-cyan-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-cyan-400">
                                Q-MED-0401
                            </span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                General Medicine • Cardiology &amp; Acute
                                Coronary Syndrome
                            </span>
                        </div>
                        <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-amber-600 dark:text-amber-400 uppercase">
                            HIGH-YIELD EXAM VIGNETTE
                        </span>
                    </div>

                    {/* Vignette Stem */}
                    <p className="mt-4 text-sm leading-relaxed font-medium text-foreground dark:text-slate-100 sm:text-base">
                        A 58-year-old male with long-standing type 2 diabetes
                        presents with 2 hours of crushing retrosternal chest pain
                        radiating to his epigastrium with profuse diaphoresis.
                        Blood pressure is 88/56 mmHg, heart rate is 52 bpm, and
                        JVP is elevated without pulmonary rales. ECG
                        demonstrates acute ST-segment elevation in leads II,
                        III, and aVF. Which of the following is the most
                        appropriate next pharmacologic intervention?
                    </p>

                    {/* Interactive Choices */}
                    <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {[
                            {
                                key: 'A',
                                text: 'Sublingual Nitroglycerin 0.4 mg',
                                correct: false,
                            },
                            {
                                key: 'B',
                                text: 'Intravenous Metoprolol 5 mg',
                                correct: false,
                            },
                            {
                                key: 'C',
                                text: 'Intravenous Normal Saline 1000 mL Bolus',
                                correct: true,
                            },
                            {
                                key: 'D',
                                text: 'Intravenous Morphine Sulfate 4 mg',
                                correct: false,
                            },
                        ].map((opt) => {
                            const isSelected = selectedOption === opt.key;
                            return (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setSelectedOption(opt.key)}
                                    className={`flex items-center gap-3 rounded-xl border p-3.5 text-left text-xs font-medium transition-all ${
                                        isSelected
                                            ? opt.correct
                                                ? 'border-emerald-500/80 bg-emerald-500/15 font-bold text-emerald-950 shadow-sm shadow-emerald-500/10 dark:text-white'
                                                : 'border-rose-500/80 bg-rose-500/15 font-bold text-rose-950 shadow-sm shadow-rose-500/10 dark:text-white'
                                            : 'border-border bg-muted/40 text-foreground hover:border-slate-300 hover:bg-muted/80 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <span
                                        className={`flex size-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                                            isSelected
                                                ? opt.correct
                                                    ? 'bg-emerald-500 text-white dark:text-slate-950'
                                                    : 'bg-rose-500 text-white'
                                                : 'border border-border bg-muted text-muted-foreground dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                        }`}
                                    >
                                        {opt.key}
                                    </span>
                                    <span className="flex-1">{opt.text}</span>
                                    {isSelected && (
                                        <span className="text-xs">
                                            {opt.correct ? (
                                                <span className="font-black text-emerald-600 dark:text-emerald-400">
                                                    ✓ Correct Answer
                                                </span>
                                            ) : (
                                                <span className="font-bold text-rose-600 dark:text-rose-400">
                                                    ✗ Contraindicated
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* 3-Tier Clinical Breakdown Reveal */}
                    <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-950/70">
                        <div className="flex items-center justify-between border-b border-border pb-3 dark:border-slate-800">
                            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                3-Tier Clinical Breakdown
                            </span>
                            <div className="flex gap-1.5">
                                {(
                                    [
                                        'foundation',
                                        'integration',
                                        'application',
                                    ] as const
                                ).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setActiveTier(t)}
                                        className={`rounded-lg px-3 py-1 text-[11px] font-bold capitalize transition-all ${
                                            activeTier === t
                                                ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-sm dark:from-cyan-500 dark:to-sky-500 dark:text-slate-950'
                                                : 'border border-border bg-card text-muted-foreground hover:text-foreground dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-white'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-3.5 text-xs leading-relaxed text-foreground/90 sm:text-sm dark:text-slate-200">
                            {activeTier === 'foundation' && (
                                <p>
                                    <strong className="text-cyan-700 dark:text-cyan-400">
                                        Tier 1 — Foundation:
                                    </strong>{' '}
                                    ST elevations in leads II, III, and aVF
                                    localize an acute transmural infarction to
                                    the inferior myocardium, most commonly
                                    supplied by the Right Coronary Artery (RCA).
                                    Concomitant hypotension, elevated JVP, and
                                    clear lung fields pathognomonically diagnose
                                    Right Ventricular Infarction (RVI).
                                </p>
                            )}
                            {activeTier === 'integration' && (
                                <p>
                                    <strong className="text-cyan-700 dark:text-cyan-400">
                                        Tier 2 — Integration:
                                    </strong>{' '}
                                    The ischemic right ventricle loses
                                    contractile compliance and functions as a
                                    passive conduit. Left ventricular filling
                                    becomes entirely dependent on elevated right
                                    ventricular end-diastolic filling pressures
                                    (preload-dependent state). Nitrates and
                                    diuretics precipitously reduce venous
                                    return, precipitating profound cardiogenic
                                    shock.
                                </p>
                            )}
                            {activeTier === 'application' && (
                                <p>
                                    <strong className="text-cyan-700 dark:text-cyan-400">
                                        Tier 3 — Application (Exam Key):
                                    </strong>{' '}
                                    First-line emergency intervention is rapid
                                    intravenous crystalloid bolus (0.9% Normal
                                    Saline 500–1000 mL) to elevate RV preload
                                    and maintain cardiac output before urgent
                                    primary PCI. Nitrates, morphine, and
                                    beta-blockers must be strictly withheld.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Modern Section Divider 2 */}
            <MedicalDivider
                label="Standardized Exam Blueprints"
                subtitle="Official Postgraduate Scoring Formulas & Syllabi"
                icon={GraduationCap}
                accentColor="indigo"
            />

            {/* Examination Pathways Matrix */}
            <section id="pathways" className="relative z-10 py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 flex flex-col gap-2 text-center">
                        <span className="text-xs font-bold tracking-wider text-cyan-600 dark:text-cyan-400 uppercase">
                            STANDARDIZED BLUEPRINT ALIGNMENT
                        </span>
                        <h2 className="text-2xl font-black tracking-tight text-foreground dark:text-white sm:text-3xl">
                            Tailored for Your Exact Postgraduate Medical
                            Entrance Target
                        </h2>
                        <p className="mx-auto max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
                            Switch blueprints with a single click. Scoring
                            algorithms and negative marks re-skin dynamically.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Nepal MECEE-PG */}
                        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-xl dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-[#0d1322]">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="rounded border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase">
                                        Nepal MD/MS
                                    </span>
                                    <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                                        -0.25 Mark
                                    </span>
                                </div>
                                <h3 className="mt-3 text-lg font-bold text-foreground dark:text-white">
                                    MECEE-PG
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Medical Education Commission Entrance
                                    Examination for MD/MS.
                                </p>
                                <ul className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground">
                                    <li>• 200 Questions / 180 Minutes</li>
                                    <li>• 50 Basic + 150 Clinical Sciences</li>
                                    <li>• +1.0 Correct / −0.25 Negative</li>
                                </ul>
                            </div>
                            <Link
                                href="/qbank/runner?pathway=MECEE_PG"
                                className="mt-6"
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-border bg-muted/60 text-xs font-bold text-foreground hover:border-cyan-500 hover:bg-muted hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:hover:border-cyan-400 dark:hover:bg-slate-800 dark:hover:text-cyan-400"
                                >
                                    Practice MECEE-PG →
                                </Button>
                            </Link>
                        </div>

                        {/* India INI-CET */}
                        <div className="flex flex-col justify-between rounded-2xl border-2 border-indigo-500/40 bg-card p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500 hover:shadow-xl dark:border-indigo-500/50 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-[#0d1322]">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="rounded border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase">
                                        India (AIIMS / PGI)
                                    </span>
                                    <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                                        -0.33 Mark
                                    </span>
                                </div>
                                <h3 className="mt-3 text-lg font-bold text-foreground dark:text-white">
                                    INI-CET
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    AIIMS, PGI Chandigarh, JIPMER &amp; NIMHANS
                                    combined entrance test.
                                </p>
                                <ul className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground">
                                    <li>• 200 Questions / 180 Minutes</li>
                                    <li>• Severe −0.33 Negative Marking</li>
                                    <li>• High Clinical Image Integration</li>
                                </ul>
                            </div>
                            <Link
                                href="/qbank/runner?pathway=INI_CET"
                                className="mt-6"
                            >
                                <Button
                                    size="sm"
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500"
                                >
                                    Practice INI-CET →
                                </Button>
                            </Link>
                        </div>

                        {/* USA USMLE Step 1 */}
                        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-lg dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-[#0d1322]">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                                        USA Licensure
                                    </span>
                                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        Pass / Fail
                                    </span>
                                </div>
                                <h3 className="mt-3 text-lg font-bold text-foreground dark:text-white">
                                    USMLE Step 1
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    United States Medical Licensing Examination
                                    Foundations.
                                </p>
                                <ul className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground">
                                    <li>• 280 Questions / 7 Timed Blocks</li>
                                    <li>• Zero Negative Marking</li>
                                    <li>• Two-Step Mechanistic Reasoning</li>
                                </ul>
                            </div>
                            <Link
                                href="/qbank/runner?pathway=USMLE_STEP1"
                                className="mt-6"
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-border bg-muted/60 text-xs font-bold text-foreground hover:border-emerald-500 hover:bg-muted hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:hover:border-emerald-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
                                >
                                    Practice Step 1 →
                                </Button>
                            </Link>
                        </div>

                        {/* USA USMLE Step 2 CK */}
                        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-lg dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-[#0d1322]">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                                        US Residency
                                    </span>
                                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                                        Scaled 1–300
                                    </span>
                                </div>
                                <h3 className="mt-3 text-lg font-bold text-foreground dark:text-white">
                                    USMLE Step 2 CK
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Clinical Knowledge &amp; Diagnostic
                                    Management.
                                </p>
                                <ul className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground">
                                    <li>• 318 Questions / 8 Blocks</li>
                                    <li>• Next Best Step &amp; Triage</li>
                                    <li>
                                        • Drug Ads &amp; Scientific Abstracts
                                    </li>
                                </ul>
                            </div>
                            <Link
                                href="/qbank/runner?pathway=USMLE_STEP2CK"
                                className="mt-6"
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-border bg-muted/60 text-xs font-bold text-foreground hover:border-amber-500 hover:bg-muted hover:text-amber-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:hover:border-amber-400 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                                >
                                    Practice Step 2 CK →
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modern Section Divider 3 */}
            <MedicalDivider
                label="High-Stakes Architecture"
                subtitle="Dual-Metric SRS • High-Resolution DICOM • Anti-Scraping DRM"
                icon={Layers}
                accentColor="emerald"
            />

            {/* Core Architecture Features Grid */}
            <section id="features" className="relative z-10 py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 flex flex-col gap-2 text-center">
                        <span className="text-xs font-bold tracking-wider text-cyan-600 dark:text-cyan-400 uppercase">
                            ENGINEERED FOR RESIDENCY SUCCESS
                        </span>
                        <h2 className="text-2xl font-black tracking-tight text-foreground dark:text-white sm:text-3xl">
                            Everything Required to Secure Top Medical Ranks
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-cyan-500/40 hover:shadow-md dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-[#0d1322]">
                            <div className="flex size-11 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                <Repeat className="size-5" />
                            </div>
                            <h3 className="text-base font-bold text-foreground dark:text-white">
                                Confidence-Adjusted Spaced Repetition
                            </h3>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Our modified SM-2 / FSRS algorithm adapts based
                                on dual metrics: objective accuracy and
                                subjective confidence. Guesses are re-tested in
                                2 days; failed items reset to 4 hours.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-emerald-500/40 hover:shadow-md dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-[#0d1322]">
                            <div className="flex size-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Eye className="size-5" />
                            </div>
                            <h3 className="text-base font-bold text-foreground dark:text-white">
                                DICOM Windowing &amp; Anti-Scraping DRM
                            </h3>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Diagnostic radiological viewer with real-time
                                brightness (level) and contrast (width)
                                windowing, zoom, pan, and dynamic anti-scraping
                                watermarking overlaid on clinical images.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-indigo-500/40 hover:shadow-md dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-[#0d1322]">
                            <div className="flex size-11 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                <GraduationCap className="size-5" />
                            </div>
                            <h3 className="text-base font-bold text-foreground dark:text-white">
                                Standardized Grand Mock Hall
                            </h3>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Distraction-free fullscreen simulation with
                                client-side tab-switch / window blur detection,
                                authoritative live countdown timer, and
                                automatic submission upon expiration.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modern Section Divider 4 */}
            <MedicalDivider
                label="19-Subject Postgraduate Blueprint"
                subtitle="Complete Syllabus Breakdown Across Basic, Para-Clinical & Clinical Sciences"
                icon={BookOpen}
                accentColor="blue"
            />

            {/* 19 Subjects Banner */}
            <section id="subjects" className="relative z-10 py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col gap-2 text-center">
                        <span className="text-xs font-bold tracking-wider text-cyan-600 dark:text-cyan-400 uppercase">
                            COMPREHENSIVE MEDICAL CURRICULUM
                        </span>
                        <h2 className="text-2xl font-black tracking-tight text-foreground dark:text-white sm:text-3xl">
                            19-Subject Postgraduate Directory
                        </h2>
                        <p className="mx-auto max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
                            Full postgraduate syllabus breakdown with topic
                            density, high-yield tags, and real-time mastery
                            tracking.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                        {[
                            'Anatomy',
                            'Physiology',
                            'Biochemistry',
                            'Pathology',
                            'Pharmacology',
                            'Microbiology',
                            'Forensic Medicine',
                            'Community Medicine (PSM)',
                            'ENT (Otolaryngology)',
                            'Ophthalmology',
                            'General Medicine',
                            'General Surgery',
                            'Obstetrics & Gynecology',
                            'Pediatrics',
                            'Orthopedics',
                            'Dermatology',
                            'Psychiatry',
                            'Radiology',
                            'Anesthesiology',
                        ].map((sub, idx) => (
                            <span
                                key={sub}
                                className="cursor-default rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground/90 shadow-sm transition-all hover:scale-105 hover:border-cyan-500 hover:bg-muted hover:text-cyan-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:bg-slate-800 dark:hover:text-cyan-300"
                            >
                                #{idx + 1} {sub}
                            </span>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-center">
                        <Link href="/directory">
                            <Button className="h-11 gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-cyan-400 px-6 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-transform hover:scale-[1.02] hover:from-cyan-400 hover:to-sky-300">
                                <BookOpen className="size-4" />
                                Browse Full 19-Subject Directory →
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Modern Section Divider 5 */}
            <MedicalDivider
                label="Doctor Entrance Excellence"
                subtitle="Join Candidates Preparing for High-Stakes Postgraduate Entrance"
                icon={Award}
                accentColor="amber"
            />

            {/* Bottom CTA Card */}
            <section className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 pb-16 sm:px-6">
                <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-[#0e1b2e] to-slate-950 p-8 text-center text-white shadow-2xl sm:p-12">
                    {/* Background glow in card */}
                    <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-cyan-500/15 blur-3xl" />

                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/40 bg-sky-500/20 px-3.5 py-1 text-xs font-bold text-sky-200 shadow-sm backdrop-blur-sm">
                            <HeartPulse className="size-3.5 animate-pulse text-sky-300" />
                            <span>
                                High-Stakes Postgraduate Simulation Engine
                            </span>
                        </div>
                        <h2 className="text-balance text-2xl font-black tracking-tight text-white sm:text-4xl">
                            Ready to Master Your Doctor Entrance Examination?
                        </h2>
                        <p className="max-w-xl text-xs leading-relaxed font-normal text-slate-300 sm:text-sm">
                            Join medical graduates preparing for Nepal MECEE-PG,
                            India INI-CET, and USMLE with high-yield clinical
                            reasoning, official negative marking simulations,
                            and dual-metric spaced repetition.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center justify-center gap-4">
                        <Link href="/demo-login">
                            <Button
                                size="lg"
                                className="h-12 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-cyan-400 px-7 text-sm font-extrabold text-slate-950 shadow-xl shadow-cyan-500/25 transition-all hover:scale-105 hover:from-cyan-400 hover:to-sky-300"
                            >
                                <Zap className="mr-1.5 size-4 fill-slate-950 text-slate-950" />
                                Start With Instant Dr. Cortex Demo
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button
                                size="lg"
                                className="h-12 rounded-xl border border-slate-700 bg-slate-900/90 px-8 text-sm font-extrabold text-white shadow-xl transition-all hover:scale-105 hover:border-slate-600 hover:bg-slate-800"
                            >
                                Create Candidate Profile
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 mt-auto border-t border-border bg-card/80 py-8 text-xs text-muted-foreground backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#050811] dark:text-slate-400">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 font-bold text-foreground dark:text-white">
                        <Activity className="size-4 animate-pulse text-cyan-600 dark:text-cyan-400" />
                        <span>CORTEX MEDICAL ENTRANCE PLATFORM</span>
                    </div>
                    <div className="flex gap-6">
                        <Link
                            href="/qbank/runner"
                            className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-400"
                        >
                            MCQ Runner
                        </Link>
                        <Link
                            href="/directory"
                            className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-400"
                        >
                            19 Subjects
                        </Link>
                        <Link
                            href="/mock-exam"
                            className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-400"
                        >
                            Grand Mocks
                        </Link>
                        <Link
                            href="/spaced-repetition"
                            className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-400"
                        >
                            Spaced Repetition
                        </Link>
                    </div>
                    <span>
                        © 2026 Cortex Med. High-Stakes Doctor Entrance
                        Simulation Engine.
                    </span>
                </div>
            </footer>
        </div>
    );
}
