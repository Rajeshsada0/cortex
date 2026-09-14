import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    Target,
    TrendingUp,
    ShieldAlert,
    Award,
    ArrowUpRight,
    Sliders,
    RotateCcw,
    Calendar,
    Sparkles,
    CheckCircle2,
    BookOpen,
    PlaySquare,
    Repeat,
    Layers,
    Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface ReadinessComponents {
    recent_accuracy: number;
    curriculum_coverage: number;
    mock_performance: number;
    srs_clearance_rate: number;
    stability_penalty: number;
}

interface ReadinessGaugeProps {
    score?: number;
    components?: ReadinessComponents;
    targetExamDate?: string | null;
    daysUntilExam?: number | null;
    pathwayName?: string;
    dueCardsCount?: number;
}

export function ReadinessGauge({
    score = 76.5,
    components = {
        recent_accuracy: 78.4,
        curriculum_coverage: 64.0,
        mock_performance: 82.5,
        srs_clearance_rate: 85.0,
        stability_penalty: 8.5,
    },
    targetExamDate,
    daysUntilExam,
    pathwayName = 'INI_CET',
    dueCardsCount = 0,
}: ReadinessGaugeProps) {
    // Simulator State
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulatedValues, setSimulatedValues] = useState<ReadinessComponents>(
        {
            recent_accuracy: components.recent_accuracy ?? 50,
            curriculum_coverage: components.curriculum_coverage ?? 50,
            mock_performance: components.mock_performance ?? 50,
            srs_clearance_rate: components.srs_clearance_rate ?? 50,
            stability_penalty: components.stability_penalty ?? 10,
        },
    );

    // Active sub-component detail view
    const [activeComponentKey, setActiveComponentKey] = useState<
        keyof ReadinessComponents | null
    >('recent_accuracy');

    // Calculate simulated score
    const currentComponents = isSimulating ? simulatedValues : components;

    const calculateScore = (c: ReadinessComponents) => {
        const raw =
            0.35 * (c.recent_accuracy / 100) +
            0.2 * (c.curriculum_coverage / 100) +
            0.2 * (c.mock_performance / 100) +
            0.15 * (c.srs_clearance_rate / 100) -
            0.1 * (c.stability_penalty / 100);
        return Math.round(Math.max(0, Math.min(100, raw * 100)) * 10) / 10;
    };

    const displayScore = isSimulating ? calculateScore(simulatedValues) : score;

    // SVG radial gauge circle math
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(100, Math.max(0, displayScore));
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const getScoreColor = (val: number) => {
        if (val >= 80) return '#2FB36F'; // Success green
        if (val >= 65) return '#55BDEB'; // Cortex blue
        if (val >= 50) return '#F59E0B'; // Warning amber
        return '#E05252'; // Alert red
    };

    const strokeColor = getScoreColor(progress);

    // Qualitative assessment
    const getAssessment = (val: number) => {
        if (val >= 80) {
            return {
                tier: 'Elite Distinction (AIR Top 1%)',
                prob: '98%+ Pass Probability',
                desc: 'Consistently high accuracy and spaced repetition clearance indicate strong board readiness.',
                color: 'text-[#2FB36F]',
                bg: 'bg-[#2FB36F]/10 border-[#2FB36F]/30',
            };
        }
        if (val >= 65) {
            return {
                tier: 'High Clinical Competency (Top 10%)',
                prob: '92% Pass Probability',
                desc: 'Solid diagnostic grasp. Targeted grand mocks will push you into the top percentile tier.',
                color: 'text-[#55BDEB]',
                bg: 'bg-[#55BDEB]/10 border-[#55BDEB]/30',
            };
        }
        if (val >= 50) {
            return {
                tier: 'Competitive Median (Passing Zone)',
                prob: '76% Pass Probability',
                desc: 'Passing baseline achieved. Clear overdue SRS cards and expand curriculum coverage.',
                color: 'text-[#F59E0B]',
                bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/30',
            };
        }
        return {
            tier: 'Remediation Recommended',
            prob: 'Borderline — Remediation Zone',
            desc: 'Foundational gaps identified. Daily deliberate retrieval practice is required.',
            color: 'text-[#E05252]',
            bg: 'bg-[#E05252]/10 border-[#E05252]/30',
        };
    };

    const assessment = getAssessment(displayScore);

    // Component configuration metadata
    const componentMeta: Record<
        keyof ReadinessComponents,
        {
            title: string;
            weight: string;
            maxPts: number;
            color: string;
            barColor: string;
            ctaLink: string;
            ctaLabel: string;
            ctaIcon: React.ReactNode;
            diagnosis: (val: number) => string;
        }
    > = {
        recent_accuracy: {
            title: 'Recent Retrieval Accuracy',
            weight: '35%',
            maxPts: 35.0,
            color: '#55BDEB',
            barColor: 'bg-[#55BDEB]',
            ctaLink: '/qbank/runner',
            ctaLabel: 'Launch MCQ Practice',
            ctaIcon: <PlaySquare className="size-3.5" />,
            diagnosis: (val) =>
                val >= 75
                    ? `Strong diagnostic accuracy (${val}%). Clinical pattern recognition is sharp.`
                    : val >= 55
                      ? `Moderate retrieval accuracy (${val}%). Review distractor rationales after each question.`
                      : `Low accuracy (${val}%). Prioritize high-yield topic drills before full timed mocks.`,
        },
        curriculum_coverage: {
            title: '19-Subject Curriculum Coverage',
            weight: '20%',
            maxPts: 20.0,
            color: '#818CF8',
            barColor: 'bg-indigo-500',
            ctaLink: '/directory',
            ctaLabel: 'Explore 19 Subjects',
            ctaIcon: <BookOpen className="size-3.5" />,
            diagnosis: (val) =>
                val >= 80
                    ? `Comprehensive syllabus breadth (${val}% covered). Low vulnerability to obscure topics.`
                    : val >= 50
                      ? `Intermediate coverage (${val}%). Continue expanding attempts into untouched specialties.`
                      : `Sparse coverage (${val}%). Several medical subjects remain unattempted.`,
        },
        mock_performance: {
            title: 'Grand Mock Performance',
            weight: '20%',
            maxPts: 20.0,
            color: '#2FB36F',
            barColor: 'bg-[#2FB36F]',
            ctaLink: '/mock-exam',
            ctaLabel: 'Enter Mock Hall',
            ctaIcon: <Award className="size-3.5" />,
            diagnosis: (val) =>
                val >= 75
                    ? `Excellent test endurance (${val}% average mock score). Exam pacing is well-calibrated.`
                    : val >= 50
                      ? `Competitive mock score (${val}%). Practice under strict timed conditions to reduce error rate.`
                      : `Limited mock data or score (${val}%). Take full-length grand mocks to calibrate pacing.`,
        },
        srs_clearance_rate: {
            title: 'Spaced Repetition (SRS) Clearance',
            weight: '15%',
            maxPts: 15.0,
            color: '#06B6D4',
            barColor: 'bg-cyan-500',
            ctaLink: '/spaced-repetition',
            ctaLabel: `Review SRS Queue (${dueCardsCount} Due)`,
            ctaIcon: <Repeat className="size-3.5" />,
            diagnosis: (val) =>
                val >= 80
                    ? `Optimal memory retention (${val}% cards cleared). Ebbinghaus decay is effectively countered.`
                    : val >= 50
                      ? `Moderate review backlog (${val}% cleared). Regular flashcard intervals will stabilize memory.`
                      : `High overdue backlog (${val}% cleared). Clear due cards to prevent long-term memory fade.`,
        },
        stability_penalty: {
            title: 'Stability & Answer-Switching Penalty',
            weight: '−10%',
            maxPts: 10.0,
            color: '#E05252',
            barColor: 'bg-[#E05252]',
            ctaLink: '/qbank/runner',
            ctaLabel: 'Practice First Instinct',
            ctaIcon: <ShieldAlert className="size-3.5" />,
            diagnosis: (val) =>
                val <= 10
                    ? `Minimal second-guessing penalty (−${val}%). High confidence and stable first-instinct choices.`
                    : val <= 30
                      ? `Moderate penalty (−${val}%). Be mindful of switching answers from correct to incorrect.`
                      : `Severe second-guessing penalty (−${val}%). Frequent harmful option changes detected.`,
        },
    };

    const handleSliderChange = (
        key: keyof ReadinessComponents,
        val: number,
    ) => {
        setSimulatedValues((prev) => ({
            ...prev,
            [key]: val,
        }));
    };

    const resetSimulation = () => {
        setSimulatedValues({
            recent_accuracy: components.recent_accuracy ?? 50,
            curriculum_coverage: components.curriculum_coverage ?? 50,
            mock_performance: components.mock_performance ?? 50,
            srs_clearance_rate: components.srs_clearance_rate ?? 50,
            stability_penalty: components.stability_penalty ?? 10,
        });
        setIsSimulating(false);
    };

    return (
        <div className="bg-cortex-card border-cortex-border card-glow flex flex-col justify-between rounded-2xl border p-6 shadow-xl">
            {/* Header */}
            <div>
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold tracking-wide text-foreground dark:text-white">
                            CORTEX READINESS SCORE™
                        </h3>
                        <span className="rounded border border-cyan-200 bg-cyan-50 px-2 py-0.5 font-mono text-[10px] text-cyan-700 uppercase dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                            Live Dual-Metric Engine
                        </span>
                        {isSimulating && (
                            <span className="animate-pulse rounded border border-amber-800 bg-amber-950 px-2 py-0.5 font-mono text-[10px] text-amber-300 uppercase">
                                Simulating
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={() => setIsSimulating(!isSimulating)}
                            className="flex cursor-pointer items-center space-x-1 rounded border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground transition hover:text-foreground dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:text-white"
                        >
                            <Sliders className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                            <span>
                                {isSimulating
                                    ? 'Exit Simulation'
                                    : 'What-If Simulator'}
                            </span>
                        </button>
                        {isSimulating && (
                            <button
                                type="button"
                                onClick={resetSimulation}
                                className="rounded border border-border bg-muted p-1 text-xs text-muted-foreground hover:text-foreground dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:text-white"
                                title="Reset simulation"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                    Algorithmic index:{' '}
                    <span className="text-foreground/80 dark:text-slate-300">
                        0.35A + 0.20V + 0.20M + 0.15R - 0.10S
                    </span>{' '}
                    (Target Track:{' '}
                    <span className="text-cyan-600 dark:text-cyan-400">
                        {pathwayName || 'India: INI-CET'}
                    </span>
                    )
                </p>
            </div>

            {/* Gauge Visualization and Status Center */}
            <div className="my-6 flex flex-col items-center">
                {/* SVG Semi-circle / Circular Gauge */}
                <div className="relative flex h-56 w-56 items-center justify-center">
                    <svg
                        className="h-full w-full -rotate-90 transform"
                        viewBox="0 0 120 120"
                    >
                        {/* Background Circle */}
                        <circle
                            cx="60"
                            cy="60"
                            fill="transparent"
                            r="50"
                            stroke="currentColor"
                            strokeWidth="10"
                            className="text-slate-200 dark:text-slate-800"
                        ></circle>
                        {/* Foreground Progress Circle */}
                        <circle
                            cx="60"
                            cy="60"
                            fill="transparent"
                            r="50"
                            stroke="url(#readiness-gradient)"
                            strokeDasharray="314.15"
                            strokeDashoffset={Math.max(
                                0,
                                314.15 * (1 - displayScore / 100),
                            )}
                            strokeLinecap="round"
                            strokeWidth="10"
                            className="transition-all duration-700 ease-out"
                        ></circle>
                        <defs>
                            <linearGradient
                                id="readiness-gradient"
                                x1="0%"
                                x2="100%"
                                y1="0%"
                                y2="100%"
                            >
                                <stop offset="0%" stopColor="#f43f5e"></stop>
                                <stop offset="50%" stopColor="#fb923c"></stop>
                                <stop offset="100%" stopColor="#22d3ee"></stop>
                            </linearGradient>
                        </defs>
                    </svg>
                    {/* Inside Gauge Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="font-mono text-5xl font-black tracking-tight text-foreground dark:text-white">
                            {displayScore}
                        </span>
                        <span className="mt-0.5 text-[11px] tracking-widest text-muted-foreground uppercase">
                            OUT OF 100
                        </span>
                        <span
                            className={`mt-2 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                                displayScore >= 75
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                    : displayScore >= 50
                                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                                      : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                            }`}
                        >
                            {displayScore >= 75
                                ? 'Exam Ready'
                                : displayScore >= 50
                                  ? 'Competitive'
                                  : 'Developing'}
                        </span>
                    </div>
                </div>

                {/* Remediation Warning Banner */}
                <div
                    className={`mt-4 w-full rounded-xl border p-4 text-center ${
                        displayScore >= 75
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-slate-300'
                            : displayScore >= 50
                              ? 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-slate-300'
                              : 'border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-slate-300'
                    }`}
                >
                    <span
                        className={`mb-1 block text-xs font-bold tracking-wider uppercase ${
                            displayScore >= 75
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : displayScore >= 50
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : 'text-rose-700 dark:text-rose-400'
                        }`}
                    >
                        {assessment.tier}
                    </span>
                    <p className="text-xs">
                        <strong className="text-foreground dark:text-white">
                            {assessment.prob}:
                        </strong>{' '}
                        {assessment.desc}
                    </p>
                </div>

                {/* Next Tier Target Callout */}
                <div className="border-cortex-border mt-3 flex w-full items-center justify-between rounded-xl border bg-muted/50 px-4 py-2.5 text-xs dark:bg-slate-900/60">
                    <div className="flex items-center space-x-2">
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-500"></span>
                        <span className="text-muted-foreground">
                            Next Score Target:{' '}
                            <strong className="text-foreground dark:text-white">
                                80% (Tier-1 Cutoff)
                            </strong>
                        </span>
                    </div>
                    <Link
                        href="/qbank/runner"
                        className="inline-flex items-center text-xs font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                    >
                        Drill Weak Points →
                    </Link>
                </div>
            </div>

            {/* Algorithmic Components Breakdown List */}
            <div className="space-y-3 border-t border-border pt-4 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase">
                    <span>
                        {isSimulating
                            ? 'SIMULATOR SLIDERS'
                            : 'ALGORITHMIC COMPONENTS (CLICK TO EXPAND)'}
                    </span>
                    <span>WEIGHTED CONTRIBUTION</span>
                </div>

                {/* 5 Components */}
                {(
                    Object.keys(componentMeta) as Array<
                        keyof ReadinessComponents
                    >
                ).map((key) => {
                    const meta = componentMeta[key];
                    const val = currentComponents[key];
                    const isPenalty = key === 'stability_penalty';
                    const pointsContributed = isPenalty
                        ? -(Math.round(val * 0.1 * 10) / 10)
                        : Math.round(
                              val * (parseFloat(meta.weight) / 100) * 10,
                          ) / 10;
                    const isExpanded = activeComponentKey === key;

                    return (
                        <div
                            key={key}
                            onClick={() =>
                                !isSimulating &&
                                setActiveComponentKey(isExpanded ? null : key)
                            }
                            className="cursor-pointer space-y-1 pt-1"
                        >
                            <div className="flex justify-between text-xs">
                                <span className="text-foreground/80 dark:text-slate-300">
                                    {meta.title} ({meta.weight})
                                </span>
                                <span
                                    className={`font-mono font-semibold ${
                                        isPenalty
                                            ? 'text-rose-600 dark:text-rose-400'
                                            : 'text-cyan-600 dark:text-cyan-400'
                                    }`}
                                >
                                    {val}%{' '}
                                    <span
                                        className={
                                            isPenalty
                                                ? 'text-rose-600 dark:text-rose-400'
                                                : 'text-emerald-600 dark:text-emerald-400'
                                        }
                                    >
                                        {pointsContributed > 0
                                            ? `+${pointsContributed}`
                                            : pointsContributed}{' '}
                                        pts
                                    </span>
                                </span>
                            </div>

                            {isSimulating ? (
                                <div className="flex items-center gap-2 pt-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={val}
                                        onChange={(e) =>
                                            handleSliderChange(
                                                key,
                                                parseFloat(e.target.value),
                                            )
                                        }
                                        className="h-1.5 w-full cursor-pointer rounded-lg bg-slate-200 accent-cyan-500 dark:bg-slate-800 dark:accent-cyan-400"
                                    />
                                    <span className="w-10 text-right font-mono text-xs text-cyan-600 dark:text-cyan-300">
                                        {val}%
                                    </span>
                                </div>
                            ) : (
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                    <div
                                        className={`h-2 rounded-full transition-all ${
                                            isPenalty
                                                ? 'bg-rose-500'
                                                : meta.barColor
                                        }`}
                                        style={{
                                            width: `${Math.min(100, Math.max(0, val))}%`,
                                        }}
                                    ></div>
                                </div>
                            )}

                            {/* Alert / Details when expanded or accuracy is low */}
                            {!isSimulating &&
                                (isExpanded ||
                                    (key === 'recent_accuracy' &&
                                        val < 60)) && (
                                    <div className="flex items-center justify-between pt-1 text-[11px] text-amber-700 dark:text-amber-300/90">
                                        <span className="flex items-center">
                                            <svg
                                                className="mr-1 h-3.5 w-3.5 flex-shrink-0 text-amber-600 dark:text-amber-400"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    clipRule="evenodd"
                                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                    fillRule="evenodd"
                                                ></path>
                                            </svg>
                                            {meta.diagnosis(val)}
                                        </span>
                                        <Link
                                            className="ml-2 font-semibold whitespace-nowrap text-cyan-600 hover:underline dark:text-cyan-400"
                                            href={meta.ctaLink}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {meta.ctaLabel}
                                        </Link>
                                    </div>
                                )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
