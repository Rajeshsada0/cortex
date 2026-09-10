import React from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, AlertCircle, Shuffle } from 'lucide-react';

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
            description: 'Solidified medical knowledge ready for high-stakes test day.',
        },
        hazardous: {
            title: 'Hazardous Blind Spot',
            subtitle: 'Incorrect + High Confidence',
            count: 7,
            percentage: 14.0,
            status: 'critical',
            color: '#E05252',
            description: 'High-risk misconception triggers severe negative marking penalties!',
        },
        unstable: {
            title: 'Unstable / Lucky Guess',
            subtitle: 'Correct + Low/Med Confidence',
            count: 9,
            percentage: 18.0,
            status: 'warning',
            color: '#F59E0B',
            description: 'Intuitive recall that requires spaced repetition consolidation.',
        },
        gap: {
            title: 'Recognized Knowledge Gap',
            subtitle: 'Incorrect + Low/Med Confidence',
            count: 10,
            percentage: 20.0,
            status: 'info',
            color: '#52606D',
            description: 'Identified weak areas requiring primary conceptual review in directory.',
        },
    },
    answerSwitching = {
        total_switched: 12,
        switched_to_incorrect: 8,
        switched_to_correct: 4,
    },
}: PerformanceQuadrantProps) {
    return (
        <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-2 border-b border-border pb-4 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground">
                        PERFORMANCE VS. CONFIDENCE MATRIX
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Dual-metric classification identifying deadly clinical blind spots before the real exam
                    </p>
                </div>
                {/* Answer-switching metric pill */}
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs">
                    <Shuffle className="size-4 text-muted-foreground" />
                    <div>
                        <span className="font-semibold text-foreground">Answer Switching Penalty: </span>
                        <span className="font-bold text-[#E05252]">
                            {answerSwitching.total_switched > 0
                                ? `${Math.round((answerSwitching.switched_to_incorrect / answerSwitching.total_switched) * 100)}% harmful`
                                : '0%'}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1">
                            ({answerSwitching.switched_to_incorrect} of {answerSwitching.total_switched} switched to wrong)
                        </span>
                    </div>
                </div>
            </div>

            {/* 2x2 Quadrant Grid */}
            <div className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-2">
                {/* Quadrant 1: Mastered */}
                <div className="relative flex flex-col justify-between rounded-xl border border-[#2FB36F]/30 bg-[#2FB36F]/5 p-4 transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-[#2FB36F]/15 text-[#2FB36F]">
                                <CheckCircle2 className="size-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-foreground">
                                    {quadrants.mastered.title}
                                </h4>
                                <span className="text-[11px] text-[#2FB36F] font-medium">
                                    {quadrants.mastered.subtitle}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-extrabold text-[#2FB36F]">
                                {quadrants.mastered.count}
                            </span>
                            <span className="text-xs text-muted-foreground block">
                                {quadrants.mastered.percentage}%
                            </span>
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                        {quadrants.mastered.description}
                    </p>
                </div>

                {/* Quadrant 2: Hazardous Blind Spot (DANGER ZONE) */}
                <div className="relative flex flex-col justify-between rounded-xl border-2 border-[#E05252]/40 bg-[#E05252]/10 p-4 transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-[#E05252]/20 text-[#E05252]">
                                <AlertTriangle className="size-5 animate-pulse" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-[#E05252] flex items-center gap-1.5">
                                    {quadrants.hazardous.title}
                                    <span className="rounded bg-[#E05252] px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">
                                        Danger
                                    </span>
                                </h4>
                                <span className="text-[11px] text-[#E05252] font-medium">
                                    {quadrants.hazardous.subtitle}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-extrabold text-[#E05252]">
                                {quadrants.hazardous.count}
                            </span>
                            <span className="text-xs text-muted-foreground block">
                                {quadrants.hazardous.percentage}%
                            </span>
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                        {quadrants.hazardous.description}
                    </p>
                </div>

                {/* Quadrant 3: Unstable / Lucky Guess */}
                <div className="relative flex flex-col justify-between rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-4 transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-[#F59E0B]/15 text-[#F59E0B]">
                                <HelpCircle className="size-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-foreground">
                                    {quadrants.unstable.title}
                                </h4>
                                <span className="text-[11px] text-[#F59E0B] font-medium">
                                    {quadrants.unstable.subtitle}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-extrabold text-[#F59E0B]">
                                {quadrants.unstable.count}
                            </span>
                            <span className="text-xs text-muted-foreground block">
                                {quadrants.unstable.percentage}%
                            </span>
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                        {quadrants.unstable.description}
                    </p>
                </div>

                {/* Quadrant 4: Recognized Gap */}
                <div className="relative flex flex-col justify-between rounded-xl border border-border bg-muted/20 p-4 transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <AlertCircle className="size-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-foreground">
                                    {quadrants.gap.title}
                                </h4>
                                <span className="text-[11px] text-muted-foreground font-medium">
                                    {quadrants.gap.subtitle}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-extrabold text-foreground">
                                {quadrants.gap.count}
                            </span>
                            <span className="text-xs text-muted-foreground block">
                                {quadrants.gap.percentage}%
                            </span>
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                        {quadrants.gap.description}
                    </p>
                </div>
            </div>
        </div>
    );
}
