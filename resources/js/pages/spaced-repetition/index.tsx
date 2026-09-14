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

    const handleReview = async (
        isCorrect: boolean,
        confidence: 'LOW' | 'MEDIUM' | 'HIGH',
    ) => {
        if (!question || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/v1/spaced-repetition/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
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
                setDueCards((prev) =>
                    prev.filter((_, idx) => idx !== cardIndex),
                );
                setIsRevealed(false);
            }
        } catch (e) {
            toast.error('Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <Head title="Spaced Repetition Engine — Cortex Medical" />

            {/* Top Banner */}
            <div className="border-border flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="rounded bg-[#55BDEB]/15 px-2.5 py-0.5 text-xs font-bold text-[#55BDEB]">
                            Modified SM-2 / FSRS Dual-Metric
                        </span>
                        <span className="text-muted-foreground text-xs">
                            Consolidates Short-Term Recall into Long-Term
                            Synaptic Memory
                        </span>
                    </div>
                    <h1 className="text-foreground mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                        Spaced Repetition Memory Deck
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                        Total Cards in Queue:{' '}
                        <strong className="text-foreground">
                            {totalInQueue}
                        </strong>
                    </span>
                </div>
            </div>

            {/* Stage Distribution Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                    {
                        stage: 0,
                        label: 'Stage 0 (Relearning)',
                        interval: '4 Hours',
                        count: stageCounts[0] || 0,
                        color: 'text-[#E05252] border-[#E05252]/30 bg-[#E05252]/5',
                    },
                    {
                        stage: 1,
                        label: 'Stage 1 (Initial)',
                        interval: '2 Days',
                        count: stageCounts[1] || 0,
                        color: 'text-amber-500 border-amber-500/30 bg-amber-500/5',
                    },
                    {
                        stage: 2,
                        label: 'Stage 2 (Consolidation)',
                        interval: '7 Days',
                        count: stageCounts[2] || 0,
                        color: 'text-[#55BDEB] border-[#55BDEB]/30 bg-[#55BDEB]/5',
                    },
                    {
                        stage: 3,
                        label: 'Stage 3 (Retention)',
                        interval: '21 Days',
                        count: stageCounts[3] || 0,
                        color: 'text-indigo-500 border-indigo-500/30 bg-indigo-500/5',
                    },
                    {
                        stage: 4,
                        label: 'Stage 4 (Mastered)',
                        interval: '45–90 Days',
                        count: stageCounts[4] || 0,
                        color: 'text-[#2FB36F] border-[#2FB36F]/30 bg-[#2FB36F]/5',
                    },
                ].map((s) => (
                    <div
                        key={s.stage}
                        className={`flex flex-col rounded-xl border p-3 ${s.color}`}
                    >
                        <span className="text-[10px] font-bold tracking-wider uppercase">
                            {s.label}
                        </span>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold">
                                {s.count}
                            </span>
                            <span className="text-[10px] opacity-75">
                                {s.interval}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Active Card Deck or Empty State */}
            {activeCard && question ? (
                <div className="border-border bg-card flex flex-col gap-6 rounded-2xl border p-6 shadow-md sm:p-8">
                    <div className="border-border flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#55BDEB]">
                                {question.code}
                            </span>
                            <span className="text-muted-foreground text-xs">
                                {question.subject?.name} • Stage{' '}
                                {activeCard.repetition_stage}
                            </span>
                        </div>
                        <span className="text-muted-foreground text-xs font-bold">
                            Due Card {cardIndex + 1} of {dueCards.length}
                        </span>
                    </div>

                    {/* Question Stem */}
                    <p className="text-foreground text-sm leading-relaxed whitespace-pre-line sm:text-base">
                        {question.stem}
                    </p>

                    {/* Reveal Button or Answer Rationale View */}
                    {!isRevealed ? (
                        <div className="border-border flex flex-col items-center justify-center border-t py-6">
                            <Button
                                size="lg"
                                onClick={() => setIsRevealed(true)}
                                className="gap-2 bg-cyan-600 px-8 font-bold text-white shadow-sm hover:bg-cyan-700 dark:bg-[#55BDEB] dark:text-neutral-950 dark:hover:opacity-90"
                            >
                                <Eye className="size-4" />
                                Reveal Clinical Answer & 3-Tier Rationale
                            </Button>
                        </div>
                    ) : (
                        <div className="border-border flex flex-col gap-5 border-t pt-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-[#2FB36F]">
                                <CheckCircle2 className="size-5" />
                                <span>
                                    Correct Answer: Option{' '}
                                    {question.correct_option}
                                </span>
                            </div>

                            <TierBreakdown
                                learningObjective={question.learning_objective}
                                foundationExplanation={
                                    question.foundation_explanation
                                }
                                integrationExplanation={
                                    question.integration_explanation
                                }
                                applicationExplanation={
                                    question.application_explanation
                                }
                                memoryPeg={question.memory_peg}
                            />

                            {/* Self-Rating Recall Options */}
                            <div className="border-border bg-muted/20 flex flex-col gap-2 rounded-xl border p-4">
                                <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                                    How accurately did you recall this concept?
                                </span>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isSubmitting}
                                        onClick={() =>
                                            handleReview(false, 'LOW')
                                        }
                                        className="h-12 flex-col border-[#E05252]/40 bg-[#E05252]/10 text-xs font-bold text-[#E05252] hover:bg-[#E05252]/20"
                                    >
                                        <span>Failed Recall</span>
                                        <span className="text-[10px] font-normal">
                                            Reset (4h)
                                        </span>
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isSubmitting}
                                        onClick={() =>
                                            handleReview(true, 'LOW')
                                        }
                                        className="h-12 flex-col border-amber-500/40 bg-amber-500/10 text-xs font-bold text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
                                    >
                                        <span>Hard / Guessed</span>
                                        <span className="text-[10px] font-normal">
                                            Stage 1 (+2 days)
                                        </span>
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isSubmitting}
                                        onClick={() =>
                                            handleReview(true, 'MEDIUM')
                                        }
                                        className="h-12 flex-col border-[#55BDEB]/40 bg-[#55BDEB]/10 text-xs font-bold text-[#55BDEB] hover:bg-[#55BDEB]/20"
                                    >
                                        <span>Good / Probable</span>
                                        <span className="text-[10px] font-normal">
                                            +7 days
                                        </span>
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isSubmitting}
                                        onClick={() =>
                                            handleReview(true, 'HIGH')
                                        }
                                        className="h-12 flex-col border-[#2FB36F]/40 bg-[#2FB36F]/10 text-xs font-bold text-[#2FB36F] hover:bg-[#2FB36F]/20"
                                    >
                                        <span>Mastered / Easy</span>
                                        <span className="text-[10px] font-normal">
                                            Exponential (up to 90d)
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="border-border bg-card flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center shadow-sm">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#2FB36F]/15 text-[#2FB36F]">
                        <CheckCircle2 className="size-8" />
                    </div>
                    <h3 className="text-foreground text-lg font-bold">
                        Spaced Repetition Queue Clear!
                    </h3>
                    <p className="text-muted-foreground mt-1 max-w-sm text-xs">
                        You have reviewed all due cards for today. Your
                        long-term memory retention curve is optimized.
                    </p>
                    <Link href="/dashboard" className="mt-5">
                        <Button className="bg-[#55BDEB] font-bold text-neutral-950">
                            Return to Dashboard
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
