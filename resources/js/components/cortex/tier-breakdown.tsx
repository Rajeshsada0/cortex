import React, { useState } from 'react';
import { Layers, Lightbulb, Compass, Zap, BookOpen } from 'lucide-react';

interface TierBreakdownProps {
    learningObjective?: string;
    foundationExplanation?: string;
    integrationExplanation?: string;
    applicationExplanation?: string;
    memoryPeg?: string | null;
}

export function TierBreakdown({
    learningObjective,
    foundationExplanation,
    integrationExplanation,
    applicationExplanation,
    memoryPeg,
}: TierBreakdownProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'layer1' | 'layer2' | 'layer3'>('all');

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            {/* Learning Objective Header */}
            {learningObjective && (
                <div className="flex items-start gap-3 rounded-lg border border-[#55BDEB]/30 bg-[#55BDEB]/5 p-3.5">
                    <Lightbulb className="size-5 shrink-0 text-[#55BDEB] mt-0.5" />
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#55BDEB]">
                            Core Clinical Learning Objective
                        </span>
                        <p className="mt-1 text-xs leading-relaxed text-foreground font-medium">
                            {learningObjective}
                        </p>
                    </div>
                </div>
            )}

            {/* Layer Filter Tabs */}
            <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
                    <Layers className="size-4 text-[#55BDEB]" />
                    <span>3-Tier Clinical Deconstruction</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('all')}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            activeTab === 'all' ? 'bg-[#55BDEB] text-white' : 'text-muted-foreground hover:bg-muted'
                        }`}
                    >
                        Full Integration
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('layer1')}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            activeTab === 'layer1' ? 'bg-sky-600 text-white' : 'text-muted-foreground hover:bg-muted'
                        }`}
                    >
                        L1: Foundation
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('layer2')}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            activeTab === 'layer2' ? 'bg-indigo-600 text-white' : 'text-muted-foreground hover:bg-muted'
                        }`}
                    >
                        L2: Integration
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('layer3')}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            activeTab === 'layer3' ? 'bg-emerald-600 text-white' : 'text-muted-foreground hover:bg-muted'
                        }`}
                    >
                        L3: Application
                    </button>
                </div>
            </div>

            {/* Tier Layers */}
            <div className="flex flex-col gap-3">
                {/* Layer 1: Foundation (Basic Science) */}
                {(activeTab === 'all' || activeTab === 'layer1') && foundationExplanation && (
                    <div className="flex flex-col rounded-lg border border-sky-500/20 bg-sky-500/5 p-3.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400">
                            <span className="flex size-5 items-center justify-center rounded-full bg-sky-500 text-[10px] text-white">
                                1
                            </span>
                            <span>LAYER 1: FOUNDATION (BASIC SCIENCES)</span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-foreground">
                            {foundationExplanation}
                        </p>
                    </div>
                )}

                {/* Layer 2: Integration (Pathology / Pharmacology) */}
                {(activeTab === 'all' || activeTab === 'layer2') && integrationExplanation && (
                    <div className="flex flex-col rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            <span className="flex size-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] text-white">
                                2
                            </span>
                            <span>LAYER 2: PATHOPHYSIOLOGIC INTEGRATION</span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-foreground">
                            {integrationExplanation}
                        </p>
                    </div>
                )}

                {/* Layer 3: Application (Clinical Correlation & Next Best Step) */}
                {(activeTab === 'all' || activeTab === 'layer3') && applicationExplanation && (
                    <div className="flex flex-col rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                                3
                            </span>
                            <span>LAYER 3: CLINICAL APPLICATION & DECISION RULE</span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-foreground">
                            {applicationExplanation}
                        </p>
                    </div>
                )}
            </div>

            {/* Memory Peg Card */}
            {memoryPeg && (
                <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
                    <Zap className="size-4 text-amber-500 shrink-0" />
                    <div>
                        <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            High-Yield Memory Peg:
                        </span>
                        <span className="ml-2 font-medium text-foreground">{memoryPeg}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
