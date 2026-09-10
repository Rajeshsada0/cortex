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

export default function Welcome() {
    const { auth } = usePage().props as any;

    // Interactive preview state
    const [selectedOption, setSelectedOption] = useState<string | null>('C');
    const [activeTier, setActiveTier] = useState<'foundation' | 'integration' | 'application'>('foundation');

    return (
        <div className="relative min-h-screen bg-[#FDFDFC] text-[#102A43] dark:bg-[#070e17] dark:text-neutral-100 flex flex-col selection:bg-[#55BDEB]/30 overflow-x-hidden">
            <Head title="Cortex Medical — Postgraduate Doctor Entrance Preparation (MECEE-PG • INI-CET • USMLE)" />

            {/* Persistent Ambient Medical Background Elements */}
            <MedicalBackgroundElements />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md transition-colors">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <AppLogo />
                    </Link>

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
                        <a href="#pathways" className="text-muted-foreground hover:text-[#55BDEB] transition-colors">
                            Exam Pathways
                        </a>
                        <a href="#vignette-demo" className="text-muted-foreground hover:text-[#55BDEB] transition-colors">
                            Clinical Vignette
                        </a>
                        <a href="#features" className="text-muted-foreground hover:text-[#55BDEB] transition-colors">
                            Architecture
                        </a>
                        <a href="#subjects" className="text-muted-foreground hover:text-[#55BDEB] transition-colors">
                            19 Subjects
                        </a>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <Link href="/demo-login">
                            <Button
                                size="sm"
                                variant="outline"
                                className="hidden sm:inline-flex border-[#55BDEB]/40 bg-[#55BDEB]/10 text-xs font-bold text-[#55BDEB] hover:bg-[#55BDEB]/20 shadow-sm transition-all"
                            >
                                <Zap className="size-3.5 mr-1 text-[#55BDEB] animate-pulse" />
                                1-Click Demo (Dr. Cortex)
                            </Button>
                        </Link>

                        {auth?.user ? (
                            <Link href={auth.user.is_admin ? '/admin' : '/dashboard'}>
                                <Button size="sm" className="bg-[#102A43] dark:bg-[#55BDEB] text-white dark:text-neutral-950 font-bold text-xs h-9 shadow-sm hover:scale-[1.02] transition-transform">
                                    {auth.user.is_admin ? 'Admin Console →' : 'Dashboard →'}
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="text-xs font-semibold hover:text-[#55BDEB]">
                                        Log In
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" className="bg-[#102A43] dark:bg-[#55BDEB] text-white dark:text-neutral-950 font-bold text-xs h-9 shadow-sm hover:scale-[1.02] transition-transform">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section with Doctor Entrance Mockup Layout */}
            <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 lg:pt-14 bg-gradient-to-b from-[#F7FAFD] via-[#F4F9FD] to-[#EEF5FE] dark:from-[#070e17] dark:via-[#091524] dark:to-[#0c1c30]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Top 2-Column Grid: Text on Left, Doctor Graphic on Right */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
                        {/* Left Column (55% width) */}
                        <div className="lg:col-span-7 flex flex-col items-start text-left">
                            {/* Doctor Entrance Preparation Top Pill Badge */}
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#CDE5F7] bg-[#EBF5FC] px-4 py-1.5 text-xs font-bold text-[#1E65A4] shadow-sm mb-6 dark:border-sky-800/80 dark:bg-sky-950/60 dark:text-sky-300">
                                <Stethoscope className="size-4 text-[#1E65A4] dark:text-sky-400 shrink-0" />
                                <span className="tracking-wide">
                                    DOCTOR ENTRANCE PREPARATION · NEECE-PG · INI-CET · USMLE STEP 1 &amp; 2 CK
                                </span>
                            </div>

                            {/* Main Headline with Blue Gradient / Accent on Line 3 */}
                            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black tracking-tight leading-[1.12] text-[#0A1E34] dark:text-white">
                                Precision Postgraduate
                                <br />
                                Entrance Platform for
                                <br />
                                <span className="text-[#0066FF] dark:text-[#38BDF8]">Future Medical Specialists</span>
                            </h1>

                            {/* Subheadline Description */}
                            <p className="mt-5 text-sm sm:text-[15px] leading-relaxed text-[#4A5D73] dark:text-slate-300 max-w-xl font-normal">
                                Engineered specifically for medical graduates targeting MD/MS, AIIMS residency, and US medical licensure. Sub-second clinical vignette delivery, dual-metric confidence-adjusted spaced repetition, high-resolution DICOM windowing, and official negative marking algorithms.
                            </p>

                            {/* 3 Action Buttons - Kept in the Exact Same Row */}
                            <div className="mt-8 flex flex-row items-center gap-2.5 sm:gap-3 flex-nowrap overflow-x-auto no-scrollbar sm:overflow-visible pb-1 sm:pb-0 w-full">
                                {/* Primary Button: Instant Live Demo */}
                                <Link href="/demo-login" className="group shrink-0">
                                    <div className="h-[52px] flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#1762AB] to-[#0A4D94] text-white px-3.5 sm:px-4 shadow-[0_4px_14px_rgba(16,85,160,0.22)] hover:shadow-lg transition-all duration-200 whitespace-nowrap">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex size-7 items-center justify-center rounded-lg bg-white/20 text-white shrink-0">
                                                <Zap className="size-4 fill-white text-white" />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-xs sm:text-[13px] font-bold leading-tight text-white">Instant Live Demo</span>
                                                <span className="text-[10px] sm:text-[11px] text-sky-200 leading-tight mt-0.5">(Dr. Cortex, MBBS)</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="size-4 text-white/80 group-hover:translate-x-1 transition-transform ml-1 shrink-0" />
                                    </div>
                                </Link>

                                {/* Secondary Button: Interactive MCQ Runner */}
                                <Link href="/qbank/runner" className="group shrink-0">
                                    <div className="h-[52px] flex items-center gap-2.5 rounded-2xl border border-[#D5E3F0] dark:border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted/40 px-3.5 sm:px-4 shadow-sm hover:shadow text-[#0F2F53] dark:text-slate-100 text-xs sm:text-[13px] font-bold transition-all duration-200 whitespace-nowrap">
                                        <PlaySquare className="size-4 text-[#0066FF] shrink-0" />
                                        <span>Interactive MCQ Runner</span>
                                        <ArrowRight className="size-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-600 transition-all ml-0.5 shrink-0" />
                                    </div>
                                </Link>

                                {/* Secondary Button: Grand Mock Hall */}
                                <Link href="/mock-exam" className="group shrink-0">
                                    <div className="h-[52px] flex items-center gap-2.5 rounded-2xl border border-[#D5E3F0] dark:border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted/40 px-3.5 sm:px-4 shadow-sm hover:shadow text-[#0F2F53] dark:text-slate-100 text-xs sm:text-[13px] font-bold transition-all duration-200 whitespace-nowrap">
                                        <GraduationCap className="size-4 text-[#6366F1] shrink-0" />
                                        <span>Grand Mock Hall</span>
                                        <ArrowRight className="size-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-600 transition-all ml-0.5 shrink-0" />
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Right Column: Doctor Graphic with Floating UI Elements - Borderless seamless blend */}
                        <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
                            <div className="relative w-full max-w-[534px]">
                                <img
                                    src="/images/doctor-hero.png?v=3"
                                    alt="Medical Doctor Postgraduate Entrance Candidate preparing with Cortex Platform"
                                    className="w-full h-auto object-contain select-none pointer-events-none"
                                    loading="eager"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Full-Width Floating Stats Bar Underneath */}
                    <div className="mt-12 sm:mt-14 w-full rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white/95 dark:bg-card/90 p-5 sm:p-7 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.06)] dark:shadow-none backdrop-blur-md">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-border">
                            {/* Stat 1: 20,000+ */}
                            <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4 first:pt-0 first:px-0">
                                <div className="flex size-14 items-center justify-center rounded-full bg-[#E8FAF0] dark:bg-[#10B981]/15 text-[#10B981] shrink-0">
                                    <Users className="size-6" />
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-[#0A1E34] dark:text-white tracking-tight">
                                        20,000+
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-muted-foreground font-medium mt-0.5">
                                        Postgraduate Clinical Vignettes
                                    </div>
                                </div>
                            </div>

                            {/* Stat 2: 19 Subjects */}
                            <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
                                <div className="flex size-14 items-center justify-center rounded-full bg-[#EEF6FF] dark:bg-blue-500/15 text-[#0066FF] shrink-0">
                                    <BookOpen className="size-6" />
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-[#0066FF] dark:text-[#38BDF8] tracking-tight">
                                        19 Subjects
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-muted-foreground font-medium mt-0.5">
                                        Anatomy to Obstetrics &amp; Gyn
                                    </div>
                                </div>
                            </div>

                            {/* Stat 3: Dual-Metric */}
                            <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
                                <div className="flex size-14 items-center justify-center rounded-full bg-[#E8FAF0] dark:bg-[#10B981]/15 text-[#10B981] shrink-0">
                                    <Target className="size-6" />
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-[#10B981] dark:text-[#34D399] tracking-tight">
                                        Dual-Metric
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-muted-foreground font-medium mt-0.5">
                                        Confidence + Accuracy SRS
                                    </div>
                                </div>
                            </div>

                            {/* Stat 4: <100ms */}
                            <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
                                <div className="flex size-14 items-center justify-center rounded-full bg-[#F5F0FF] dark:bg-[#8B5CF6]/15 text-[#7C3AED] shrink-0">
                                    <Zap className="size-6 fill-[#7C3AED]" />
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-[#7C3AED] dark:text-[#A78BFA] tracking-tight">
                                        &lt;100ms
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-muted-foreground font-medium mt-0.5">
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
            <section id="vignette-demo" className="mx-auto max-w-5xl px-4 sm:px-6 py-6 w-full relative z-10">
                <div className="flex flex-col gap-2 text-center mb-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#55BDEB]">
                        HIGH-YIELD CLINICAL VIGNETTE ARCHITECTURE
                    </span>
                    <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
                        Integrated Clinical Vignette with 3-Tier Deconstruction
                    </h2>
                    <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                        Experience our split-screen runner: test your diagnostic choice below to view instant post-answer analysis across Foundation, Integration, and Application tiers.
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card/90 p-6 sm:p-8 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-[#55BDEB]/40">
                    {/* Top Stem Bar */}
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                            <span className="rounded bg-[#102A43] px-2.5 py-1 text-xs font-mono font-bold text-[#55BDEB]">
                                Q-MED-0401
                            </span>
                            <span className="text-xs font-semibold text-muted-foreground">
                                General Medicine • Cardiology &amp; Acute Coronary Syndrome
                            </span>
                        </div>
                        <span className="rounded bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                            HIGH-YIELD EXAM VIGNETTE
                        </span>
                    </div>

                    {/* Vignette Stem */}
                    <p className="mt-4 text-sm sm:text-base leading-relaxed text-foreground font-normal">
                        A 58-year-old male with long-standing type 2 diabetes presents with 2 hours of crushing retrosternal chest pain radiating to his epigastrium with profuse diaphoresis. Blood pressure is 88/56 mmHg, heart rate is 52 bpm, and JVP is elevated without pulmonary rales. ECG demonstrates acute ST-segment elevation in leads II, III, and aVF. Which of the following is the most appropriate next pharmacologic intervention?
                    </p>

                    {/* Interactive Choices */}
                    <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {[
                            { key: 'A', text: 'Sublingual Nitroglycerin 0.4 mg', correct: false },
                            { key: 'B', text: 'Intravenous Metoprolol 5 mg', correct: false },
                            { key: 'C', text: 'Intravenous Normal Saline 1000 mL Bolus', correct: true },
                            { key: 'D', text: 'Intravenous Morphine Sulfate 4 mg', correct: false },
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
                                                ? 'border-[#2FB36F] bg-[#2FB36F]/10 text-foreground font-bold shadow-sm'
                                                : 'border-[#E05252] bg-[#E05252]/10 text-foreground font-bold shadow-sm'
                                            : 'border-border bg-card/60 hover:bg-muted/50 text-muted-foreground'
                                    }`}
                                >
                                    <span
                                        className={`flex size-6 shrink-0 items-center justify-center rounded-lg font-mono font-bold text-xs ${
                                            isSelected
                                                ? opt.correct
                                                    ? 'bg-[#2FB36F] text-white'
                                                    : 'bg-[#E05252] text-white'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {opt.key}
                                    </span>
                                    <span className="flex-1">{opt.text}</span>
                                    {isSelected && (
                                        <span className="text-xs">
                                            {opt.correct ? (
                                                <span className="text-[#2FB36F] font-extrabold">✓ Correct Answer</span>
                                            ) : (
                                                <span className="text-[#E05252] font-bold">✗ Contraindicated</span>
                                            )}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* 3-Tier Clinical Breakdown Reveal */}
                    <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4">
                        <div className="flex items-center justify-between border-b border-border/80 pb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                3-Tier Clinical Breakdown
                            </span>
                            <div className="flex gap-1.5">
                                {(['foundation', 'integration', 'application'] as const).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setActiveTier(t)}
                                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize transition-colors ${
                                            activeTier === t
                                                ? 'bg-[#55BDEB] text-neutral-950 shadow-sm'
                                                : 'bg-muted text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-3 text-xs leading-relaxed text-muted-foreground">
                            {activeTier === 'foundation' && (
                                <p>
                                    <strong className="text-foreground">Tier 1 — Foundation:</strong> ST elevations in leads II, III, and aVF localize an acute transmural infarction to the inferior myocardium, most commonly supplied by the Right Coronary Artery (RCA). Concomitant hypotension, elevated JVP, and clear lung fields pathognomonically diagnose Right Ventricular Infarction (RVI).
                                </p>
                            )}
                            {activeTier === 'integration' && (
                                <p>
                                    <strong className="text-foreground">Tier 2 — Integration:</strong> The ischemic right ventricle loses contractile compliance and functions as a passive conduit. Left ventricular filling becomes entirely dependent on elevated right ventricular end-diastolic filling pressures (preload-dependent state). Nitrates and diuretics precipitously reduce venous return, precipitating profound cardiogenic shock.
                                </p>
                            )}
                            {activeTier === 'application' && (
                                <p>
                                    <strong className="text-foreground">Tier 3 — Application (Exam Key):</strong> First-line emergency intervention is rapid intravenous crystalloid bolus (0.9% Normal Saline 500–1000 mL) to elevate RV preload and maintain cardiac output before urgent primary PCI. Nitrates, morphine, and beta-blockers must be strictly withheld.
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
            <section id="pathways" className="py-6 relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-2 text-center mb-10">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#55BDEB]">
                            STANDARDIZED BLUEPRINT ALIGNMENT
                        </span>
                        <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
                            Tailored for Your Exact Postgraduate Medical Entrance Target
                        </h2>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                            Switch blueprints with a single click. Scoring algorithms and negative marks re-skin dynamically.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Nepal MECEE-PG */}
                        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/85 p-6 shadow-sm hover:border-[#55BDEB]/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase">
                                        Nepal MD/MS
                                    </span>
                                    <span className="font-bold text-xs text-[#E05252]">-0.25 Mark</span>
                                </div>
                                <h3 className="mt-3 text-lg font-bold text-foreground">
                                    MECEE-PG
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Medical Education Commission Entrance Examination for MD/MS.
                                </p>
                                <ul className="mt-4 flex flex-col gap-1.5 text-xs text-muted-foreground">
                                    <li>• 200 Questions / 180 Minutes</li>
                                    <li>• 50 Basic + 150 Clinical Sciences</li>
                                    <li>• +1.0 Correct / −0.25 Negative</li>
                                </ul>
                            </div>
                            <Link href="/qbank/runner?pathway=MECEE_PG" className="mt-6">
                                <Button variant="outline" size="sm" className="w-full text-xs font-bold border-border hover:border-[#55BDEB] hover:text-[#55BDEB]">
                                    Practice MECEE-PG →
                                </Button>
                            </Link>
                        </div>

                        {/* India INI-CET */}
                        <div className="flex flex-col justify-between rounded-2xl border-2 border-indigo-500/40 bg-card/90 p-6 shadow-md hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                                        India (AIIMS / PGI)
                                    </span>
                                    <span className="font-bold text-xs text-[#E05252]">-0.33 Mark</span>
                                </div>
                                <h3 className="mt-3 text-lg font-bold text-foreground">
                                    INI-CET
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    AIIMS, PGI Chandigarh, JIPMER &amp; NIMHANS combined entrance test.
                                </p>
                                <ul className="mt-4 flex flex-col gap-1.5 text-xs text-muted-foreground">
                                    <li>• 200 Questions / 180 Minutes</li>
                                    <li>• Severe −0.33 Negative Marking</li>
                                    <li>• High Clinical Image Integration</li>
                                </ul>
                            </div>
                            <Link href="/qbank/runner?pathway=INI_CET" className="mt-6">
                                <Button size="sm" className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs shadow-sm">
                                    Practice INI-CET →
                                </Button>
                            </Link>
                        </div>

                        {/* USA USMLE Step 1 */}
                        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/85 p-6 shadow-sm hover:border-emerald-500/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                                        USA Licensure
                                    </span>
                                    <span className="font-bold text-xs text-[#2FB36F]">Pass / Fail</span>
                                </div>
                                <h3 className="mt-3 text-lg font-bold text-foreground">
                                    USMLE Step 1
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    United States Medical Licensing Examination Foundations.
                                </p>
                                <ul className="mt-4 flex flex-col gap-1.5 text-xs text-muted-foreground">
                                    <li>• 280 Questions / 7 Timed Blocks</li>
                                    <li>• Zero Negative Marking</li>
                                    <li>• Two-Step Mechanistic Reasoning</li>
                                </ul>
                            </div>
                            <Link href="/qbank/runner?pathway=USMLE_STEP1" className="mt-6">
                                <Button variant="outline" size="sm" className="w-full text-xs font-bold border-border hover:border-[#2FB36F] hover:text-[#2FB36F]">
                                    Practice Step 1 →
                                </Button>
                            </Link>
                        </div>

                        {/* USA USMLE Step 2 CK */}
                        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/85 p-6 shadow-sm hover:border-amber-500/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                                        US Residency
                                    </span>
                                    <span className="font-bold text-xs text-amber-600">Scaled 1–300</span>
                                </div>
                                <h3 className="mt-3 text-lg font-bold text-foreground">
                                    USMLE Step 2 CK
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Clinical Knowledge &amp; Diagnostic Management.
                                </p>
                                <ul className="mt-4 flex flex-col gap-1.5 text-xs text-muted-foreground">
                                    <li>• 318 Questions / 8 Blocks</li>
                                    <li>• Next Best Step &amp; Triage</li>
                                    <li>• Drug Ads &amp; Scientific Abstracts</li>
                                </ul>
                            </div>
                            <Link href="/qbank/runner?pathway=USMLE_STEP2CK" className="mt-6">
                                <Button variant="outline" size="sm" className="w-full text-xs font-bold border-border hover:border-amber-500 hover:text-amber-500">
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
            <section id="features" className="py-6 relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-2 text-center mb-10">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#55BDEB]">
                            ENGINEERED FOR RESIDENCY SUCCESS
                        </span>
                        <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
                            Everything Required to Secure Top Medical Ranks
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/85 p-6 shadow-sm hover:shadow-md hover:border-[#55BDEB]/40 transition-all backdrop-blur-sm">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-[#55BDEB]/15 text-[#55BDEB]">
                                <Repeat className="size-5" />
                            </div>
                            <h3 className="font-bold text-base text-foreground">
                                Confidence-Adjusted Spaced Repetition
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Our modified SM-2 / FSRS algorithm adapts based on dual metrics: objective accuracy and subjective confidence. Guesses are re-tested in 2 days; failed items reset to 4 hours.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/85 p-6 shadow-sm hover:shadow-md hover:border-[#2FB36F]/40 transition-all backdrop-blur-sm">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-[#2FB36F]/15 text-[#2FB36F]">
                                <Eye className="size-5" />
                            </div>
                            <h3 className="font-bold text-base text-foreground">
                                DICOM Windowing &amp; Anti-Scraping DRM
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Diagnostic radiological viewer with real-time brightness (level) and contrast (width) windowing, zoom, pan, and dynamic anti-scraping watermarking overlaid on clinical images.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/85 p-6 shadow-sm hover:shadow-md hover:border-indigo-500/40 transition-all backdrop-blur-sm">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500">
                                <GraduationCap className="size-5" />
                            </div>
                            <h3 className="font-bold text-base text-foreground">
                                Standardized Grand Mock Hall
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Distraction-free fullscreen simulation with client-side tab-switch / window blur detection, authoritative live countdown timer, and automatic submission upon expiration.
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
            <section id="subjects" className="py-6 relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-2 text-center mb-8">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#55BDEB]">
                            COMPREHENSIVE MEDICAL CURRICULUM
                        </span>
                        <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
                            19-Subject Postgraduate Directory
                        </h2>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                            Full postgraduate syllabus breakdown with topic density, high-yield tags, and real-time mastery tracking.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {[
                            'Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology',
                            'Microbiology', 'Forensic Medicine', 'Community Medicine (PSM)',
                            'ENT (Otolaryngology)', 'Ophthalmology', 'General Medicine', 'General Surgery',
                            'Obstetrics & Gynecology', 'Pediatrics', 'Orthopedics', 'Dermatology',
                            'Psychiatry', 'Radiology', 'Anesthesiology'
                        ].map((sub, idx) => (
                            <span
                                key={sub}
                                className="rounded-xl border border-border bg-card/90 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-sm hover:border-[#55BDEB] hover:text-[#55BDEB] hover:scale-105 transition-all cursor-default backdrop-blur-sm"
                            >
                                #{idx + 1} {sub}
                            </span>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-center">
                        <Link href="/directory">
                            <Button className="bg-[#102A43] dark:bg-[#55BDEB] text-white dark:text-neutral-950 font-bold text-xs gap-2 shadow-sm hover:scale-[1.02] transition-transform">
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
            <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6 pb-16 w-full relative z-10">
                <div className="relative overflow-hidden flex flex-col items-center justify-between gap-6 rounded-3xl border border-[#55BDEB]/30 bg-gradient-to-r from-[#102A43] via-[#102A43] to-[#1a3854] p-8 sm:p-12 text-center text-white shadow-2xl">
                    {/* Background glow in card */}
                    <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[#55BDEB]/20 blur-3xl animate-pulse-glow" />

                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/40 bg-sky-500/20 px-3.5 py-1 text-xs font-bold text-sky-200 shadow-sm backdrop-blur-sm">
                            <HeartPulse className="size-3.5 text-sky-300 animate-pulse" />
                            <span>High-Stakes Postgraduate Simulation Engine</span>
                        </div>
                        <h2 className="text-2xl font-black sm:text-4xl text-balance text-white tracking-tight">
                            Ready to Master Your Doctor Entrance Examination?
                        </h2>
                        <p className="max-w-xl text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                            Join medical graduates preparing for Nepal MECEE-PG, India INI-CET, and USMLE with high-yield clinical reasoning, official negative marking simulations, and dual-metric spaced repetition.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center justify-center gap-4">
                        <Link href="/demo-login">
                            <Button size="lg" className="bg-[#38BDF8] hover:bg-[#0ea5e9] text-[#0A1E34] font-extrabold h-12 px-7 text-sm shadow-xl hover:scale-105 transition-all">
                                <Zap className="size-4 mr-1.5 fill-[#0A1E34] text-[#0A1E34]" />
                                Start With Instant Dr. Cortex Demo
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button size="lg" className="bg-white hover:bg-slate-100 text-[#0A1E34] font-extrabold h-12 px-8 text-sm shadow-xl hover:scale-105 transition-all">
                                Create Candidate Profile
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto border-t border-border bg-card/90 py-8 text-xs text-muted-foreground relative z-10 backdrop-blur-sm">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                        <Activity className="size-4 text-[#55BDEB] animate-pulse" />
                        <span>CORTEX MEDICAL ENTRANCE PLATFORM</span>
                    </div>
                    <div className="flex gap-6">
                        <Link href="/qbank/runner" className="hover:text-foreground transition-colors">MCQ Runner</Link>
                        <Link href="/directory" className="hover:text-foreground transition-colors">19 Subjects</Link>
                        <Link href="/mock-exam" className="hover:text-foreground transition-colors">Grand Mocks</Link>
                        <Link href="/spaced-repetition" className="hover:text-foreground transition-colors">Spaced Repetition</Link>
                    </div>
                    <span>© 2026 Cortex Med. High-Stakes Doctor Entrance Simulation Engine.</span>
                </div>
            </footer>
        </div>
    );
}
