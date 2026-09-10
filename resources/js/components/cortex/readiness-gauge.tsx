import React from 'react';
import { Target, TrendingUp, ShieldAlert, Award, ArrowUpRight } from 'lucide-react';

interface ReadinessGaugeProps {
    score: number;
    components?: {
        recent_accuracy?: number;
        curriculum_coverage?: number;
        mock_performance?: number;
        srs_clearance_rate?: number;
        stability_penalty?: number;
    };
    targetExamDate?: string;
    pathwayName?: string;
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
    pathwayName = 'INI_CET',
}: ReadinessGaugeProps) {
    // Circle math for SVG gauge
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(100, Math.max(0, score));
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const getScoreColor = (val: number) => {
        if (val >= 80) return '#2FB36F'; // Success green
        if (val >= 65) return '#55BDEB'; // Cortex blue
        if (val >= 50) return '#F59E0B'; // Warning amber
        return '#E05252'; // Error red
    };

    const strokeColor = getScoreColor(progress);

    return (
        <div className="relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-foreground tracking-tight">
                            CORTEX READINESS SCORE™
                        </h3>
                        <span className="rounded-full bg-[#55BDEB]/15 px-2.5 py-0.5 text-xs font-semibold text-[#55BDEB]">
                            Live Dual-Metric
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Algorithmic index: 0.35A + 0.20V + 0.20M + 0.15R - 0.10S
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Predicted Pass Probability
                    </span>
                    <div className="text-sm font-bold text-[#2FB36F]">
                        {progress >= 70 ? 'High (Tier 1 Rank Zone)' : 'Borderline (Consolidate High Yield)'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 items-center gap-8 py-6 md:grid-cols-12">
                {/* SVG Radial Gauge */}
                <div className="relative flex flex-col items-center justify-center md:col-span-5">
                    <div className="relative flex items-center justify-center">
                        <svg className="size-52 -rotate-90 transform" viewBox="0 0 200 200">
                            {/* Background Track */}
                            <circle
                                cx="100"
                                cy="100"
                                r={radius}
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="16"
                                className="text-muted/30"
                            />
                            {/* Gradient Def */}
                            <defs>
                                <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#55BDEB" />
                                    <stop offset="100%" stopColor={strokeColor} />
                                </linearGradient>
                            </defs>
                            {/* Animated Active Arc */}
                            <circle
                                cx="100"
                                cy="100"
                                r={radius}
                                fill="transparent"
                                stroke="url(#readinessGrad)"
                                strokeWidth="16"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>

                        {/* Gauge Inner Center Text */}
                        <div className="absolute flex flex-col items-center justify-center text-center">
                            <span className="text-4xl font-extrabold tracking-tight text-foreground">
                                {score}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                OUT OF 100
                            </span>
                            <span
                                className="mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white uppercase shadow-sm"
                                style={{ backgroundColor: strokeColor }}
                            >
                                {score >= 75 ? 'Exam Ready' : score >= 60 ? 'Competitive' : 'Developing'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Weighted Sub-components breakdown */}
                <div className="flex flex-col gap-3.5 md:col-span-7">
                    {/* Item 1: Recent Accuracy (w=0.35) */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-foreground">Recent Accuracy (w₁ = 35%)</span>
                            <span className="font-bold text-foreground">{components.recent_accuracy}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-[#55BDEB] transition-all"
                                style={{ width: `${components.recent_accuracy}%` }}
                            />
                        </div>
                    </div>

                    {/* Item 2: 19-Subject Coverage (w=0.20) */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-foreground">19-Subject Curriculum Coverage (w₂ = 20%)</span>
                            <span className="font-bold text-foreground">{components.curriculum_coverage}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-indigo-500 transition-all"
                                style={{ width: `${components.curriculum_coverage}%` }}
                            />
                        </div>
                    </div>

                    {/* Item 3: Grand Mock Percentile (w=0.20) */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-foreground">Grand Mock Performance (w₃ = 20%)</span>
                            <span className="font-bold text-foreground">{components.mock_performance}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-[#2FB36F] transition-all"
                                style={{ width: `${components.mock_performance}%` }}
                            />
                        </div>
                    </div>

                    {/* Item 4: SRS Clearance Rate (w=0.15) */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-foreground">Spaced Repetition Queue Clearance (w₄ = 15%)</span>
                            <span className="font-bold text-foreground">{components.srs_clearance_rate}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-cyan-500 transition-all"
                                style={{ width: `${components.srs_clearance_rate}%` }}
                            />
                        </div>
                    </div>

                    {/* Item 5: Stability Penalty (w=0.10) */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-[#E05252] flex items-center gap-1">
                                <ShieldAlert className="size-3.5" />
                                Stability & Answer-Switching Penalty (w₅ = −10%)
                            </span>
                            <span className="font-bold text-[#E05252]">−{components.stability_penalty}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-[#E05252] transition-all"
                                style={{ width: `${components.stability_penalty}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
