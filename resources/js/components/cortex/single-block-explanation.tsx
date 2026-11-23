import React from 'react';
import { Lightbulb, CheckCircle2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface SingleBlockExplanationProps {
    correctOption?: string;
    foundationExplanation?: string | null;
    integrationExplanation?: string | null;
    applicationExplanation?: string | null;
    learningObjective?: string | null;
    explanation?: string | null;
}

export function SingleBlockExplanation({
    correctOption,
    foundationExplanation,
    integrationExplanation,
    applicationExplanation,
    learningObjective,
    explanation,
}: SingleBlockExplanationProps) {
    const parts = [
        explanation,
        foundationExplanation,
        integrationExplanation,
        applicationExplanation,
    ].filter((p): p is string => Boolean(p && p.trim().length > 0));

    if (parts.length === 0 && !learningObjective) {
        return null;
    }

    return (
        <div className="border-border bg-card rounded-2xl border p-5 shadow-xs transition-all space-y-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Lightbulb className="size-4" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">
                        Comprehensive Clinical Explanation
                    </h4>
                </div>
                {correctOption && (
                    <Badge
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1.5 font-bold text-xs"
                    >
                        <CheckCircle2 className="size-3.5" />
                        Correct Answer: Option {correctOption.toUpperCase()}
                    </Badge>
                )}
            </div>

            {/* Consolidated Explanation Body */}
            {parts.length > 0 && (
                <div className="space-y-3 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
                    {parts.map((paragraph, idx) => (
                        <p key={idx} className="whitespace-pre-line text-foreground/90">
                            {paragraph}
                        </p>
                    ))}
                </div>
            )}

            {/* Key Learning Objective / Takeaway Banner */}
            {learningObjective && learningObjective.trim().length > 0 && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                    <div className="flex items-start gap-2.5">
                        <Sparkles className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <div>
                            <span className="block font-mono text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                High-Yield Learning Takeaway
                            </span>
                            <p className="mt-1 text-xs text-foreground/90 leading-relaxed">
                                {learningObjective}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
