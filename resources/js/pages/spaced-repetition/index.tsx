import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Repeat,
    Calendar,
    Sparkles,
    CheckCircle2,
    XCircle,
    Eye,
    Zap,
    ArrowRight,
    HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TierBreakdown } from '@/components/cortex/tier-breakdown';
import { toast } from 'sonner';

interface DueCardItem {
    id: string;
    repetition_stage: number;
    interval_days: number;
    consecutive_correct: number;
    next_review_due: string | null;
    question: any;
}

interface SpacedRepetitionProps {
    user: any;
    totalInQueue: number;
    dueCount: number;
    dueCards: DueCardItem[];
    stageCounts: Record<number, number>;
}

export default function SpacedRepetitionIndex({
    user,
    totalInQueue,
    dueCount,
    dueCards: initialDueCards,
    stageCounts,
}: SpacedRepetitionProps) {
    const [dueCards, setDueCards] = useState<DueCardItem[]>(initialDueCards);
    const [cardIndex, setCardIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const activeCard = dueCards[cardIndex];
    const question = activeCard?.question?.data || activeCard?.question;

    const handleReview = async (isCorrect: boolean, confidence: 'LOW' | 'MEDIUM' | 'HIGH') => {
        if (!question || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/v1/spaced-repetition/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    question_id: question.id,
                    is_correct: isCorrect,
                    confidence: confidence,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success('Recall Recorded', {
                    description: `Card scheduled to Stage ${data.data.repetition_stage} (Interval: ${data.data.interval_days} days).`,
                });

                // Remove card from active due deck
                setDueCards((prev) => prev.filter((_, idx) => idx !== cardIndex));
                setIsRevealed(false);
            }
        } catch (e) {
            toast.error('Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full">
            <Head title="Spaced Repetition Engine — Cortex Medical" />

            {/* Top Banner */}
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="rounded bg-[#55BDEB]/15 px-2.5 py-0.5 text-xs font-bold text-[#55BDEB]">
                            Modified SM-2 / FSRS Dual-Metric
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Consolidates Short-Term Recall into Long-Term Synaptic Memory
                        </span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl mt-1">
                        Spaced Repetition Memory Deck
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                        Total Cards in Queue: <strong className="text-foreground">{totalInQueue}</strong>
                    </span>
                </div>
            </div>

            {/* Stage Distribution Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                    { stage: 0, label: 'Stage 0 (Relearning)', interval: '4 Hours', count: stageCounts[0] || 0, color: 'text-[#E05252] border-[#E05252]/30 bg-[#E05252]/5' },
                    { stage: 1, label: 'Stage 1 (Initial)', interval: '2 Days', count: stageCounts[1] || 0, color: 'text-amber-500 border-amber-500/30 bg-amber-500/5' },
                    { stage: 2, label: 'Stage 2 (Consolidation)', interval: '7 Days', count: stageCounts[2] || 0, color: 'text-[#55BDEB] border-[#55BDEB]/30 bg-[#55BDEB]/5' },
                    { stage: 3, label: 'Stage 3 (Retention)', interval: '21 Days', count: stageCounts[3] || 0, color: 'text-indigo-500 border-indigo-500/30 bg-indigo-500/5' },
                    { stage: 4, label: 'Stage 4 (Mastered)', interval: '45–90 Days', count: stageCounts[4] || 0, color: 'text-[#2FB36F] border-[#2FB36F]/30 bg-[#2FB36F]/5' },
                ].map((s) => (
                    <div key={s.stage} className={`flex flex-col rounded-xl border p-3 ${s.color}`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{s.label}</span>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold">{s.count}</span>
                            <span className="text-[10px] opacity-75">{s.interval}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Active Card Deck or Empty State */}
            {activeCard && question ? (
                <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-md">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#55BDEB]">
                                {question.code}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {question.subject?.name} • Stage {activeCard.repetition_stage}
                            </span>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">
                            Due Card {cardIndex + 1} of {dueCards.length}
                        </span>
                    </div>

                    {/* Question Stem */}
                    <p className="text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-line">
                        {question.stem}
                    </p>

                    {/* Reveal Button or Answer Rationale View */}
                    {!isRevealed ? (
                        <div className="flex flex-col items-center justify-center py-6 border-t border-border">
                            <Button
                                size="lg"
                                onClick={() => setIsRevealed(true)}
                                className="bg-[#102A43] dark:bg-[#55BDEB] text-white dark:text-neutral-950 font-bold px-8 shadow-sm gap-2"
                            >
                                <Eye className="size-4" />
                                Reveal Clinical Answer & 3-Tier Rationale
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5 border-t border-border pt-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-[#2FB36F]">
                                <CheckCircle2 className="size-5" />
                                <span>Correct Answer: Option {question.correct_option}</span>
                            </div>

                            <TierBreakdown
                                learningObjective={question.learning_objective}
                                foundationExplanation={question.foundation_explanation}
                                integrationExplanation={question.integration_explanation}
                                applicationExplanation={question.application_explanation}
                                memoryPeg={question.memory_peg}
                            />

                            {/* Self-Rating Recall Options */}
                            <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/20 p-4">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    How accurately did you recall this concept?
                                </span>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isSubmitting}
                                        onClick={() => handleReview(false, 'LOW')}
                                        className="border-[#E05252]/40 bg-[#E05252]/10 text-[#E05252] hover:bg-[#E05252]/20 font-bold h-12 flex-col text-xs"
                                    >
                                        <span>Failed Recall</span>
                                        <span className="text-[10px] font-normal">Reset (4h)</span>
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isSubmitting}
                                        onClick={() => handleReview(true, 'LOW')}
                                        className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold h-12 flex-col text-xs"
                                    >
                                        <span>Hard / Guessed</span>
                                        <span className="text-[10px] font-normal">Stage 1 (+2 days)</span>
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isSubmitting}
                                        onClick={() => handleReview(true, 'MEDIUM')}
                                        className="border-[#55BDEB]/40 bg-[#55BDEB]/10 text-[#55BDEB] hover:bg-[#55BDEB]/20 font-bold h-12 flex-col text-xs"
                                    >
                                        <span>Good / Probable</span>
                                        <span className="text-[10px] font-normal">+7 days</span>
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isSubmitting}
                                        onClick={() => handleReview(true, 'HIGH')}
                                        className="border-[#2FB36F]/40 bg-[#2FB36F]/10 text-[#2FB36F] hover:bg-[#2FB36F]/20 font-bold h-12 flex-col text-xs"
                                    >
                                        <span>Mastered / Easy</span>
                                        <span className="text-[10px] font-normal">Exponential (up to 90d)</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-sm">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-[#2FB36F]/15 text-[#2FB36F] mb-4">
                        <CheckCircle2 className="size-8" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                        Spaced Repetition Queue Clear!
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                        You have reviewed all due cards for today. Your long-term memory retention curve is optimized.
                    </p>
                    <Link href="/dashboard" className="mt-5">
                        <Button className="bg-[#55BDEB] text-neutral-950 font-bold">
                            Return to Dashboard
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
