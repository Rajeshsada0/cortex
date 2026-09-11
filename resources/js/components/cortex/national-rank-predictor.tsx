import React from 'react';
import { Award, Compass, Sparkles, TrendingUp, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface RankPredictionData {
    pathway: string;
    pathway_label: string;
    readiness_score: number;
    cohort_size: number;
    percentile: number;
    predicted_rank: number;
    rank_range_min: number;
    rank_range_max: number;
    specialty_eligibility: string;
    confidence_band: string;
    tier_status: string;
}

interface NationalRankPredictorProps {
    prediction?: RankPredictionData;
}

export function NationalRankPredictor({ prediction }: NationalRankPredictorProps) {
    if (!prediction) {
        return null;
    }

    const {
        pathway_label,
        cohort_size,
        percentile,
        predicted_rank,
        rank_range_min,
        rank_range_max,
        specialty_eligibility,
        confidence_band,
        tier_status,
        readiness_score,
    } = prediction;

    const isTopTier = percentile >= 90;
    const isMidTier = percentile >= 65 && percentile < 90;

    const statusColor = isTopTier
        ? 'text-[#2FB36F]'
        : isMidTier
        ? 'text-[#55BDEB]'
        : 'text-amber-500';

    const statusBg = isTopTier
        ? 'bg-[#2FB36F]/10 border-[#2FB36F]/30'
        : isMidTier
        ? 'bg-[#55BDEB]/10 border-[#55BDEB]/30'
        : 'bg-amber-500/10 border-amber-500/30';

    return (
        <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
            {/* Header */}
            <div className="flex flex-col justify-between gap-2 border-b border-border pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Compass className="size-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold tracking-tight text-foreground">
                                NATIONAL COHORT RANK & PERCENTILE PREDICTOR
                            </h3>
                            <Badge variant="outline" className="text-[10px] font-mono uppercase bg-primary/5 text-primary border-primary/20">
                                AI Calibrated
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Predictive actuarial model mapped against official {pathway_label} counseling cutoffs ({cohort_size.toLocaleString()} candidates)
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Model Confidence:</span>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                        {confidence_band.split(' ')[0]}
                    </Badge>
                </div>
            </div>

            {/* Metrics Triad */}
            <div className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-3">
                {/* 1. Projected National Rank */}
                <div className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all shadow-xs ${statusBg}`}>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Predicted All-India / National Rank
                        </span>
                        <Award className={`size-5 ${statusColor}`} />
                    </div>
                    <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl sm:text-4xl font-black ${statusColor}`}>
                                #{predicted_rank.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                                / {cohort_size.toLocaleString()}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>Projected Range:</span>
                            <span className="font-mono font-bold text-foreground">
                                #{rank_range_min.toLocaleString()} — #{rank_range_max.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-foreground">{tier_status}</span>
                        <span className="text-muted-foreground">±15% Exam Variance</span>
                    </div>
                </div>

                {/* 2. Cohort Percentile */}
                <div className="relative flex flex-col justify-between rounded-xl border border-border bg-muted/20 p-5 transition-all shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Cohort Percentile
                        </span>
                        <TrendingUp className="size-5 text-[#55BDEB]" />
                    </div>
                    <div className="mt-3">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl sm:text-4xl font-black text-foreground">
                                {percentile}%
                            </span>
                            <span className="text-xs font-bold text-[#55BDEB] uppercase">
                                Percentile
                            </span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Scoring ahead of {Math.round((cohort_size * (percentile / 100))).toLocaleString()} postgraduate doctors in active pool.
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40">
                        {/* Progress Bar */}
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-[#55BDEB] to-[#2FB36F] transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(5, percentile))}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Counselling Forecast */}
                <div className="relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Seat Allocation Projection
                        </span>
                        <ShieldCheck className="size-5 text-emerald-500" />
                    </div>
                    <div className="mt-3">
                        <span className="text-sm font-bold text-foreground block line-clamp-2">
                            {specialty_eligibility}
                        </span>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Calibrated from central medical counselling admission registers and seat matrix cutoffs.
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1 text-[11px] text-[#2FB36F] font-semibold">
                        <CheckCircle2 className="size-3.5" />
                        <span>Based on current readiness index of {readiness_score}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
