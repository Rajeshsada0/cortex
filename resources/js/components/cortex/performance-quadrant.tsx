import React from 'react';
import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    HelpCircle,
    AlertCircle,
    Shuffle,
    ArrowRight,
} from 'lucide-react';

interface QuadrantItem {
    title: string;
    subtitle: string;
    count: number;
    percentage: number;
    status: string;
    color: string;
    description: string;
}

interface PerformanceQuadrantProps {
    quadrants?: {
        mastered: QuadrantItem;
        hazardous: QuadrantItem;
        unstable: QuadrantItem;
        gap: QuadrantItem;
    };
    answerSwitching?: {
        total_switched: number;
        switched_to_incorrect: number;
        switched_to_correct: number;
    };
}

export function PerformanceQuadrant({
    quadrants = {
        mastered: {
            title: 'Mastered',
            subtitle: 'High Accuracy + High Confidence',
            count: 24,
            percentage: 48.0,
            status: 'excellent',
            color: '#2FB36F',
            description:
                'Solidified medical knowledge ready for high-stakes test day.',
        },
        hazardous: {
            title: 'Hazardous Blind Spot',
            subtitle: 'Incorrect + High Confidence',
            count: 7,
            percentage: 14.0,
            status: 'critical',
            color: '#E05252',
            description:
                'High-risk misconception triggers severe negative marking penalties!',
        },
        unstable: {
            title: 'Unstable / Lucky Guess',
            subtitle: 'Correct + Low/Med Confidence',
            count: 9,
            percentage: 18.0,
            status: 'warning',
            color: '#F59E0B',
            description:
                'Intuitive recall that requires spaced repetition consolidation.',
        },
        gap: {
            title: 'Recognized Knowledge Gap',
            subtitle: 'Incorrect + Low/Med Confidence',
            count: 10,
            percentage: 20.0,
            status: 'info',
            color: '#52606D',
            description:
                'Identified weak areas requiring primary conceptual review in directory.',
        },
    },
    answerSwitching = {
        total_switched: 12,
        switched_to_incorrect: 8,
        switched_to_correct: 4,
    },
}: PerformanceQuadrantProps) {
    const totalClassified =
        (quadrants.mastered?.count ?? 0) +
        (quadrants.hazardous?.count ?? 0) +
        (quadrants.unstable?.count ?? 0) +
        (quadrants.gap?.count ?? 0);

    const penaltyPercent =
        answerSwitching.total_switched > 0
            ? Math.round(
                  (answerSwitching.switched_to_incorrect /
                      answerSwitching.total_switched) *
                      100,
              )
            : 0;

    return (
        <div className="bg-cortex-card border-cortex-border card-glow rounded-2xl border p-6 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold tracking-tight text-foreground dark:text-white">
                        Performance vs. Confidence
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Diagnostic accuracy mapped against subjective confidence
                    </p>
                </div>
                <div className="rounded-lg border border-border bg-card px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                    Switching Penalty:{' '}
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                        {penaltyPercent}%
                    </span>
                </div>
            </div>

            {/* 2x2 Matrix Quad Box */}
            <div className="my-4 grid grid-cols-2 gap-3.5">
                {/* Quad 1: Mastered (Top Left) */}
                <div className="flex flex-col justify-between rounded-xl border border-emerald-500/30 bg-emerald-50/70 p-3.5 dark:border-emerald-500/30 dark:bg-emerald-950/20">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center text-xs font-bold tracking-wide text-emerald-700 uppercase dark:text-emerald-400">
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                Mastered
                            </span>
                            <span className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-400">
                                {quadrants.mastered?.count ?? 0}
                            </span>
                        </div>
                        <span className="font-mono text-[10px] text-emerald-800/80 dark:text-emerald-300/80">
                            High Accuracy + High Conf.
                        </span>
                        <p className="mt-2 text-xs text-foreground/80 dark:text-slate-300">
                            {quadrants.mastered?.description ||
                                'Solidified clinical knowledge ready for the real exam.'}
                        </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-emerald-200 pt-2 text-[10px] text-muted-foreground dark:border-emerald-900/40">
                        <span>High accuracy recall</span>
                        <span>
                            • {quadrants.mastered?.count ?? 0} questions
                        </span>
                    </div>
                </div>

                {/* Quad 2: Hazardous Blind Spot (Top Right - High Danger) */}
                <div className="flex flex-col justify-between rounded-xl border border-rose-500/30 bg-rose-50/70 p-3.5 dark:border-rose-500/40 dark:bg-rose-950/30">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center text-xs font-bold tracking-wide text-rose-700 uppercase dark:text-rose-400">
                                <AlertTriangle className="mr-1 h-3.5 w-3.5 text-rose-600 dark:text-rose-500" />
                                Blind Spot
                                <span className="py-0.2 ml-1 rounded bg-rose-600 px-1 font-mono text-[9px] font-bold text-white">
                                    DANGER
                                </span>
                            </span>
                            <span className="font-mono text-lg font-bold text-rose-700 dark:text-rose-400">
                                {quadrants.hazardous?.count ?? 0}
                            </span>
                        </div>
                        <span className="font-mono text-[10px] text-rose-800/80 dark:text-rose-300/80">
                            Incorrect + High Conf.
                        </span>
                        <p className="mt-2 text-xs text-foreground/80 dark:text-slate-300">
                            {quadrants.hazardous?.description ||
                                'Dangerous misconceptions that cause severe negative marks in INI-CET.'}
                        </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-rose-200 pt-2 text-[10px] dark:border-rose-900/40">
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                            Priority 1 Remediation
                        </span>
                        <span
                            className={
                                quadrants.hazardous?.count > 0
                                    ? 'font-semibold text-rose-600 dark:text-rose-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
                            }
                        >
                            {quadrants.hazardous?.count > 0
                                ? `⚠ ${quadrants.hazardous.count} blind spots`
                                : '✓ 0 blind spots'}
                        </span>
                    </div>
                </div>

                {/* Quad 3: Unstable / Lucky Guess (Bottom Left) */}
                <div className="flex flex-col justify-between rounded-xl border border-amber-500/30 bg-amber-50/70 p-3.5 dark:border-amber-500/30 dark:bg-amber-950/20">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center text-xs font-bold tracking-wide text-amber-700 uppercase dark:text-amber-400">
                                <HelpCircle className="mr-1 h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                Unstable / Guess
                            </span>
                            <span className="font-mono text-lg font-bold text-amber-700 dark:text-amber-400">
                                {quadrants.unstable?.count ?? 0}
                            </span>
                        </div>
                        <span className="font-mono text-[10px] text-amber-800/80 dark:text-amber-300/80">
                            Correct + Low/Med Conf.
                        </span>
                        <p className="mt-2 text-xs text-foreground/80 dark:text-slate-300">
                            {quadrants.unstable?.description ||
                                'Correctly guessed or intuitive recall that needs SRS consolidation.'}
                        </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-amber-200 pt-2 text-[10px] text-muted-foreground dark:border-amber-900/40">
                        <span>Spaced consolidation</span>
                        <span>
                            • {quadrants.unstable?.count ?? 0} unstable items
                        </span>
                    </div>
                </div>

                {/* Quad 4: Recognized Knowledge Gap (Bottom Right) */}
                <div className="flex flex-col justify-between rounded-xl border border-border bg-muted/40 p-3.5 dark:border-slate-700/60 dark:bg-slate-900/80">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center text-xs font-bold tracking-wide text-muted-foreground uppercase dark:text-slate-300">
                                <AlertCircle className="mr-1 h-3.5 w-3.5 text-muted-foreground dark:text-slate-400" />
                                Knowledge Gap
                            </span>
                            <span className="font-mono text-lg font-bold text-foreground dark:text-slate-300">
                                {quadrants.gap?.count ?? 0}
                            </span>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground dark:text-slate-400">
                            Incorrect + Low/Med Conf.
                        </span>
                        <p className="mt-2 text-xs text-foreground/80 dark:text-slate-300">
                            {quadrants.gap?.description ||
                                'Identified weak areas requiring targeted study in curriculum.'}
                        </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[10px] text-muted-foreground dark:border-slate-800">
                        <span>Targeted study drill</span>
                        <span>• {quadrants.gap?.count ?? 0} gaps detected</span>
                    </div>
                </div>
            </div>

            {/* Calibration Prompt */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 shadow-xs">
                <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <HelpCircle className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-foreground dark:text-white">
                            Confidence Calibration
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                            Rate your confidence during practice to uncover blind spots.
                        </p>
                    </div>
                </div>
                <Link
                    href="/qbank/runner?mode=TUTOR"
                    className="inline-flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-xs transition hover:bg-cyan-700 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
                >
                    <span>Practice Drill →</span>
                </Link>
            </div>
        </div>
    );
}
