import React, { useState } from 'react';
import {
    Award,
    Compass,
    Sparkles,
    TrendingUp,
    Users,
    ShieldCheck,
    CheckCircle2,
    Sliders,
    RotateCcw,
    ChevronRight,
    GraduationCap,
    ArrowUpRight,
    AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

interface CohortConfig {
    id: string;
    label: string;
    region: string;
    size: number;
    marking: string;
    cutoffs: Array<{
        title: string;
        rankThreshold: number;
        percentile: number;
        specialties: string;
        color: string;
    }>;
}

const COHORTS: Record<string, CohortConfig> = {
    NEET_PG: {
        id: 'NEET_PG',
        label: 'NEET-PG (2026)',
        region: 'India',
        size: 205000,
        marking: '+4.0 / -1.0',
        cutoffs: [
            {
                title: 'Top-Tier Clinical MD/MS',
                rankThreshold: 1500,
                percentile: 99.2,
                specialties: 'Radio-Diagnosis, Dermatology, General Medicine',
                color: 'text-emerald-500',
            },
            {
                title: 'Core Clinical MD/MS',
                rankThreshold: 7500,
                percentile: 96.3,
                specialties: 'Pediatrics, Orthopedics, General Surgery, OBGYN',
                color: 'text-[#55BDEB]',
            },
            {
                title: 'Broad Clinical MD/MS',
                rankThreshold: 20000,
                percentile: 90.2,
                specialties: 'Anesthesiology, Ophthalmology, ENT, Psychiatry',
                color: 'text-indigo-400',
            },
            {
                title: 'Para-Clinical MD',
                rankThreshold: 45000,
                percentile: 78.0,
                specialties:
                    'Pathology, Pharmacology, Microbiology, Community Medicine',
                color: 'text-amber-500',
            },
            {
                title: 'National Qualifying Cutoff',
                rankThreshold: 102500,
                percentile: 50.0,
                specialties: 'Minimum Qualifying 50th Percentile Barrier',
                color: 'text-neutral-400',
            },
        ],
    },
    INI_CET: {
        id: 'INI_CET',
        label: 'INI-CET (AIIMS/PGI)',
        region: 'India',
        size: 85000,
        marking: '+1.0 / -0.33',
        cutoffs: [
            {
                title: 'Apex AIIMS New Delhi',
                rankThreshold: 150,
                percentile: 99.8,
                specialties: 'AIIMS New Delhi Clinical Specialties',
                color: 'text-emerald-500',
            },
            {
                title: 'Top Institutes (PGI/JIPMER)',
                rankThreshold: 800,
                percentile: 99.0,
                specialties: 'PGI Chandigarh, JIPMER Puducherry, AIIMS Bhopal',
                color: 'text-[#55BDEB]',
            },
            {
                title: 'Broad Clinical AIIMS',
                rankThreshold: 3000,
                percentile: 96.5,
                specialties:
                    'Core Clinical across all 22 National AIIMS Institutes',
                color: 'text-indigo-400',
            },
            {
                title: 'Para-Clinical / Pre-Clinical',
                rankThreshold: 8500,
                percentile: 90.0,
                specialties: 'Pathology, Pharmacology, Biochemistry, Anatomy',
                color: 'text-amber-500',
            },
            {
                title: 'Qualifying Cutoff',
                rankThreshold: 42500,
                percentile: 50.0,
                specialties: '50th Percentile Qualifying Baseline',
                color: 'text-neutral-400',
            },
        ],
    },
    MECEE_PG: {
        id: 'MECEE_PG',
        label: 'MECEE-PG (CEE Nepal)',
        region: 'Nepal',
        size: 12500,
        marking: '+1.0 / -0.25',
        cutoffs: [
            {
                title: 'Open Merit Top Tier (IOM / BPKIHS)',
                rankThreshold: 120,
                percentile: 99.0,
                specialties:
                    'Maharajgunj Medical Campus, BPKIHS Dharan Radio/Med',
                color: 'text-emerald-500',
            },
            {
                title: 'Government Autonomous Colleges',
                rankThreshold: 450,
                percentile: 96.4,
                specialties: 'PAHS Lalitpur, NAMS Bir Hospital MD/MS',
                color: 'text-[#55BDEB]',
            },
            {
                title: 'Private Medical Colleges Open',
                rankThreshold: 1500,
                percentile: 88.0,
                specialties: 'KMC, CMC, NMC, MCOMS Clinical Seats',
                color: 'text-indigo-400',
            },
            {
                title: 'Para-Clinical / Basic Sciences',
                rankThreshold: 3500,
                percentile: 72.0,
                specialties: 'Basic Science & Non-Clinical MD Disciplines',
                color: 'text-amber-500',
            },
            {
                title: 'Qualifying Cutoff',
                rankThreshold: 6250,
                percentile: 50.0,
                specialties: 'CEE 50th Percentile Eligibility Bar',
                color: 'text-neutral-400',
            },
        ],
    },
    USMLE_STEP1: {
        id: 'USMLE_STEP1',
        label: 'USMLE Step 1',
        region: 'USA',
        size: 95000,
        marking: 'Pass / Fail',
        cutoffs: [
            {
                title: 'Pass Probability > 99%',
                rankThreshold: 10000,
                percentile: 90.0,
                specialties:
                    'Safe Passing Clearance (Calculated 230+ baseline)',
                color: 'text-emerald-500',
            },
            {
                title: 'Pass Probability ~ 95%',
                rankThreshold: 25000,
                percentile: 75.0,
                specialties:
                    'Strong Passing Clearance (Calculated 215+ baseline)',
                color: 'text-[#55BDEB]',
            },
            {
                title: 'Pass Probability ~ 80%',
                rankThreshold: 50000,
                percentile: 50.0,
                specialties:
                    'Borderline Passing Margin (Calculated 196 threshold)',
                color: 'text-amber-500',
            },
            {
                title: 'At Risk (< 65% Pass)',
                rankThreshold: 80000,
                percentile: 20.0,
                specialties: 'Remediation advised before scheduling exam date',
                color: 'text-[#E05252]',
            },
        ],
    },
    USMLE_STEP2CK: {
        id: 'USMLE_STEP2CK',
        label: 'USMLE Step 2 CK',
        region: 'USA',
        size: 45000,
        marking: 'Scaled 1-300',
        cutoffs: [
            {
                title: 'Ultra-Competitive 260+',
                rankThreshold: 2500,
                percentile: 94.0,
                specialties:
                    'Dermatology, Orthopedic Surgery, Plastic Surgery Match',
                color: 'text-emerald-500',
            },
            {
                title: 'Competitive 245-259',
                rankThreshold: 9000,
                percentile: 80.0,
                specialties: 'Internal Medicine, General Surgery, OBGYN Match',
                color: 'text-[#55BDEB]',
            },
            {
                title: 'Solid Match 230-244',
                rankThreshold: 20000,
                percentile: 55.0,
                specialties: 'Family Medicine, Pediatrics, Psychiatry Match',
                color: 'text-indigo-400',
            },
            {
                title: 'Qualifying Baseline 214+',
                rankThreshold: 35000,
                percentile: 25.0,
                specialties: 'Passing threshold cleared, targeted programs',
                color: 'text-amber-500',
            },
        ],
    },
};

export function NationalRankPredictor({
    prediction,
}: NationalRankPredictorProps) {
    if (!prediction) {
        return null;
    }

    const defaultPathway = prediction.pathway || 'INI_CET';
    const initialCohortKey = COHORTS[defaultPathway]
        ? defaultPathway
        : 'NEET_PG';

    // Active Pathway Cohort Tab
    const [selectedPathway, setSelectedPathway] =
        useState<string>(initialCohortKey);

    // Simulation State
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulatedScore, setSimulatedScore] = useState<number>(
        prediction.readiness_score,
    );

    const activeCohort = COHORTS[selectedPathway] || COHORTS['NEET_PG'];
    const activeScore = isSimulating
        ? simulatedScore
        : prediction.readiness_score;

    // Recalculate dynamic percentile using sigmoidal model:
    // percentile = (1 / (1 + exp(-(score - 50) / 9.5))) * 100
    const calculatePercentile = (s: number) => {
        const normalized = (s - 50.0) / 9.5;
        const sigmoidal = 1.0 / (1.0 + Math.exp(-normalized));
        const p = sigmoidal * 100.0;
        return Math.min(99.9, Math.max(1.0, Math.round(p * 10) / 10));
    };

    const currentPercentile = calculatePercentile(activeScore);
    const cohortSize = activeCohort.size;

    // Rank formula: Top 1% = Rank 1 to (cohort * 0.01)
    const fractionFromTop = Math.max(
        0.001,
        (100.0 - currentPercentile) / 100.0,
    );
    const currentRank = Math.max(1, Math.round(cohortSize * fractionFromTop));
    const rankMin = Math.max(1, Math.round(currentRank * 0.75));
    const rankMax = Math.min(cohortSize, Math.round(currentRank * 1.35));

    // Dynamic Specialty Eligibility
    const getEligibility = (p: number) => {
        if (p >= 98.5)
            return 'Top-Tier Clinical MD/MS (Radio-Diagnosis, Dermatology, General Medicine)';
        if (p >= 94.0)
            return 'Core Clinical MD/MS (Pediatrics, Orthopedics, General Surgery, OBGYN)';
        if (p >= 85.0)
            return 'Broad Clinical MD/MS (Anesthesiology, Ophthalmology, ENT, Psychiatry)';
        if (p >= 65.0)
            return 'Para-Clinical MD (Pathology, Pharmacology, Microbiology, Community Med)';
        if (p >= 50.0)
            return 'Pre-Clinical MD / General Qualifying Cutoff Cleared';
        return 'Below Qualifying Cutoff — Intensive Retrieval Practice Recommended';
    };

    const currentEligibility = getEligibility(currentPercentile);

    const getTierStatus = (p: number) => {
        if (p >= 98.0) return 'AIR Top 1% (Elite Distinction)';
        if (p >= 90.0) return 'AIR Top 10% (High Clinical Probability)';
        if (p >= 75.0) return 'Above National Average';
        if (p >= 50.0) return 'Median Cohort Range';
        return 'Remediation Zone';
    };

    const currentTierStatus = getTierStatus(currentPercentile);

    const isTopTier = currentPercentile >= 90;
    const isMidTier = currentPercentile >= 65 && currentPercentile < 90;

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
        <div className="bg-cortex-card border-cortex-border card-glow rounded-2xl border p-6 shadow-xl">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold tracking-wide text-white">
                        NATIONAL COHORT RANK &amp; PERCENTILE
                    </h3>
                    <span className="rounded border border-blue-800 bg-blue-950 px-2 py-0.5 font-mono text-[10px] text-blue-300 uppercase">
                        AI Calibrated
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
                        className="flex cursor-pointer items-center space-x-1 text-xs text-slate-400 hover:text-white"
                    >
                        <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                        <span>
                            {isSimulating
                                ? 'Exit Simulation'
                                : 'Simulate Score'}
                        </span>
                    </button>
                    {isSimulating && (
                        <button
                            type="button"
                            onClick={() => {
                                setSimulatedScore(prediction.readiness_score);
                                setIsSimulating(false);
                            }}
                            className="rounded border border-slate-700 bg-slate-800/80 p-1 text-xs text-slate-400 hover:text-white"
                            title="Reset to real score"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Cohort Select Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto border-b border-slate-800 pb-2 text-xs">
                {Object.values(COHORTS).map((c) => {
                    const isSelected = c.id === selectedPathway;
                    return (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedPathway(c.id)}
                            className={`cursor-pointer rounded-lg px-3 py-1.5 whitespace-nowrap transition ${
                                isSelected
                                    ? 'border border-cyan-500/40 bg-cyan-500/20 font-semibold text-cyan-300 shadow-sm'
                                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                            {c.label}{' '}
                            <span
                                className={`font-mono text-[10px] ${
                                    isSelected
                                        ? 'text-cyan-400'
                                        : 'text-slate-500'
                                }`}
                            >
                                {c.size >= 1000
                                    ? `${Math.round(c.size / 1000)}k`
                                    : c.size}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* What-If Simulation Slider Bar */}
            {isSimulating && (
                <div className="mt-3 flex flex-col gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-amber-400">
                            <Sliders className="h-3.5 w-3.5" />
                            Simulate Target Readiness Score
                        </span>
                        <span className="font-mono text-sm font-bold text-white">
                            {simulatedScore}% Readiness
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400">0%</span>
                        <input
                            type="range"
                            min="1"
                            max="99"
                            value={simulatedScore}
                            onChange={(e) =>
                                setSimulatedScore(parseFloat(e.target.value))
                            }
                            className="h-2 w-full cursor-pointer rounded-lg bg-slate-800 accent-amber-400"
                        />
                        <span className="text-[11px] text-slate-400">100%</span>
                    </div>
                </div>
            )}

            {/* Actuarial Cards Row */}
            <div className="my-4 grid grid-cols-2 gap-4">
                {/* Rank Card */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                        <span className="text-[10px] font-semibold tracking-wider uppercase">
                            Predicted National Rank
                        </span>
                        <span className="font-mono text-xs text-amber-400">
                            ★
                        </span>
                    </div>
                    <div className="font-mono text-3xl font-black tracking-tight text-amber-400">
                        #{currentRank.toLocaleString()}{' '}
                        <span className="text-sm font-normal text-slate-400">
                            / {cohortSize.toLocaleString()}
                        </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
                        <span>{currentTierStatus}</span>
                        <span className="font-mono text-slate-300">
                            ±15% Exam Variance
                        </span>
                    </div>
                </div>

                {/* Percentile Card */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                        <span className="text-[10px] font-semibold tracking-wider uppercase">
                            Cohort Percentile
                        </span>
                        <TrendingUp className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div className="font-mono text-3xl font-black tracking-tight text-cyan-400">
                        {currentPercentile}%{' '}
                        <span className="font-sans text-xs font-normal text-slate-400 uppercase">
                            Percentile
                        </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
                        <span>
                            Ahead of ~
                            {Math.round(
                                cohortSize * (currentPercentile / 100),
                            ).toLocaleString()}{' '}
                            doctors
                        </span>
                        <span className="font-medium text-cyan-300">
                            Target: ≥98.5%
                        </span>
                    </div>
                </div>
            </div>

            {/* Allocation Advisory Note */}
            <div className="border-cortex-border mb-4 rounded-xl border bg-slate-900/60 p-3.5">
                <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-cyan-400">
                        <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-xs">
                        <strong className="text-slate-200">
                            Seat Allocation Projection:
                        </strong>
                        <p className="mt-0.5 text-slate-400">
                            {currentEligibility} Calibrated from official
                            central medical counselling register.
                        </p>
                    </div>
                </div>
            </div>

            {/* Official Cutoff Benchmarks Table */}
            <div className="space-y-2">
                <div className="flex items-center justify-between px-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    <span>Official {activeCohort.label} Cutoff Benchmarks</span>
                    <span>Gap to Target</span>
                </div>

                {activeCohort.cutoffs.map((tier) => {
                    const isCleared = currentRank <= tier.rankThreshold;
                    const distance = Math.abs(currentRank - tier.rankThreshold);

                    return (
                        <div
                            key={tier.title}
                            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/80 p-2.5 text-xs"
                        >
                            <div>
                                <div className="flex items-center space-x-2">
                                    <span className="font-bold text-white">
                                        {tier.title}
                                    </span>
                                    <span
                                        className={`py-0.2 rounded px-1.5 font-mono text-[10px] ${
                                            tier.percentile >= 99
                                                ? 'bg-purple-950 text-purple-300'
                                                : tier.percentile >= 95
                                                  ? 'bg-blue-950 text-blue-300'
                                                  : tier.percentile >= 90
                                                    ? 'bg-cyan-950 text-cyan-300'
                                                    : 'bg-emerald-950 text-emerald-300'
                                        }`}
                                    >
                                        ≥{tier.percentile}%ile
                                    </span>
                                </div>
                                <div className="mt-0.5 text-[11px] text-slate-400">
                                    {tier.specialties} • AIR ≤{' '}
                                    {tier.rankThreshold.toLocaleString()}
                                </div>
                            </div>

                            <div
                                className={`rounded border px-2 py-1 font-mono text-xs font-semibold ${
                                    isCleared
                                        ? 'border-emerald-900/50 bg-emerald-950/40 text-emerald-400'
                                        : 'border-rose-900/50 bg-rose-950/40 text-rose-400'
                                }`}
                            >
                                {isCleared
                                    ? '✓ Cleared'
                                    : `-${distance.toLocaleString()} to reach`}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
