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
    RotateCcw,
    ThumbsUp,
    Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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
        <TooltipProvider delayDuration={150}>
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <Head title="Spaced Repetition — Cortex Medical" />

                {/* Clean, Modern Header Bar */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                                    <Repeat className="h-3 w-3" />
                                    FSRS Spaced Repetition
                                </span>
                                <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
                                    {dueCards.length} Due Now
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Memory Deck
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                                Total Queue:{' '}
                                <strong className="font-mono font-bold text-foreground">
                                    {totalInQueue}
                                </strong>
                            </span>
                        </div>
                    </div>
                </div>

                {/* 5-Stage Schedule Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {[
                        {
                            stage: 0,
                            label: 'Stage 0',
                            sublabel: 'Relearning',
                            interval: '4h',
                            count: stageCounts[0] || 0,
                            color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
                        },
                        {
                            stage: 1,
                            label: 'Stage 1',
                            sublabel: 'Initial',
                            interval: '2d',
                            count: stageCounts[1] || 0,
                            color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
                        },
                        {
                            stage: 2,
                            label: 'Stage 2',
                            sublabel: 'Consolidation',
                            interval: '7d',
                            count: stageCounts[2] || 0,
                            color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
                        },
                        {
                            stage: 3,
                            label: 'Stage 3',
                            sublabel: 'Retention',
                            interval: '21d',
                            count: stageCounts[3] || 0,
                            color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                        },
                        {
                            stage: 4,
                            label: 'Stage 4',
                            sublabel: 'Mastered',
                            interval: '45–90d',
                            count: stageCounts[4] || 0,
                            color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                        },
                    ].map((s) => (
                        <div
                            key={s.stage}
                            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-3.5 shadow-xs transition hover:border-slate-300 dark:hover:border-slate-700"
                        >
                            <div className="flex items-center justify-between">
                                <span className={`rounded-md border px-1.5 py-0.2 font-mono text-[10px] font-bold ${s.color}`}>
                                    {s.label}
                                </span>
                                <span className="font-mono text-[11px] text-muted-foreground">
                                    {s.interval}
                                </span>
                            </div>
                            <div className="mt-3 flex items-baseline justify-between">
                                <span className="font-mono text-2xl font-bold text-foreground">
                                    {s.count}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    {s.sublabel}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Active Card Deck or Clean Empty State */}
                {activeCard && question ? (
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
                        {/* Card Header Bar */}
                        <div className="flex items-center justify-between border-b border-border pb-3.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                                    {question.code}
                                </span>
                                {question.subject && (
                                    <span className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium text-foreground">
                                        {question.subject.name}
                                    </span>
                                )}
                                <span className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-cyan-700 dark:text-cyan-300">
                                    Stage {activeCard.repetition_stage}
                                </span>
                            </div>
                            <span className="font-mono text-xs text-muted-foreground">
                                Card {cardIndex + 1} of {dueCards.length}
                            </span>
                        </div>

                        {/* Question Stem */}
                        <div className="py-5">
                            <p className="text-sm leading-relaxed text-foreground whitespace-pre-line sm:text-base">
                                {question.stem}
                            </p>
                        </div>

                        {/* Reveal Button or Answer Rationale View */}
                        {!isRevealed ? (
                            <div className="flex flex-col items-center justify-center border-t border-border pt-6">
                                <Button
                                    size="lg"
                                    onClick={() => setIsRevealed(true)}
                                    className="gap-2 rounded-xl bg-cyan-600 px-6 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
                                >
                                    <Eye className="h-4 w-4" />
                                    <span>Reveal Answer & Explanations</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-5 border-t border-border pt-5">
                                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>
                                        Correct Key: Option {question.correct_option}
                                    </span>
                                </div>

                                <TierBreakdown
                                    learningObjective={question.learning_objective}
                                    foundationExplanation={question.foundation_explanation}
                                    integrationExplanation={question.integration_explanation}
                                    applicationExplanation={question.application_explanation}
                                    memoryPeg={question.memory_peg}
                                />

                                {/* Self-Rating Recall Options */}
                                <div className="space-y-2.5 rounded-xl border border-border bg-muted/30 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-foreground">
                                            How accurately did you recall this concept?
                                        </span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="text-muted-foreground hover:text-foreground"
                                                    aria-label="Recall rating info"
                                                >
                                                    <Info className="h-3.5 w-3.5" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                Select how easily you recalled the key to optimize the FSRS review schedule
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={isSubmitting}
                                            onClick={() => handleReview(false, 'LOW')}
                                            className="h-12 flex-col rounded-xl border-rose-500/30 bg-rose-500/5 text-xs font-semibold text-rose-600 hover:bg-rose-500/15 dark:text-rose-400"
                                        >
                                            <div className="flex items-center gap-1">
                                                <RotateCcw className="h-3 w-3" />
                                                <span>Failed</span>
                                            </div>
                                            <span className="font-mono text-[10px] text-muted-foreground">
                                                Reset (4h)
                                            </span>
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={isSubmitting}
                                            onClick={() => handleReview(true, 'LOW')}
                                            className="h-12 flex-col rounded-xl border-amber-500/30 bg-amber-500/5 text-xs font-semibold text-amber-600 hover:bg-amber-500/15 dark:text-amber-400"
                                        >
                                            <div className="flex items-center gap-1">
                                                <HelpCircle className="h-3 w-3" />
                                                <span>Hard</span>
                                            </div>
                                            <span className="font-mono text-[10px] text-muted-foreground">
                                                +2 days
                                            </span>
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={isSubmitting}
                                            onClick={() => handleReview(true, 'MEDIUM')}
                                            className="h-12 flex-col rounded-xl border-cyan-500/30 bg-cyan-500/5 text-xs font-semibold text-cyan-700 hover:bg-cyan-500/15 dark:text-cyan-300"
                                        >
                                            <div className="flex items-center gap-1">
                                                <ThumbsUp className="h-3 w-3" />
                                                <span>Good</span>
                                            </div>
                                            <span className="font-mono text-[10px] text-muted-foreground">
                                                +7 days
                                            </span>
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={isSubmitting}
                                            onClick={() => handleReview(true, 'HIGH')}
                                            className="h-12 flex-col rounded-xl border-emerald-500/30 bg-emerald-500/5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400"
                                        >
                                            <div className="flex items-center gap-1">
                                                <Sparkles className="h-3 w-3" />
                                                <span>Easy</span>
                                            </div>
                                            <span className="font-mono text-[10px] text-muted-foreground">
                                                Exponential (up to 90d)
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center shadow-xs">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <h3 className="mt-4 text-base font-bold text-foreground">
                            Spaced Repetition Queue Clear
                        </h3>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            You have reviewed all cards due for today. Your long-term memory retention curve is optimized.
                        </p>
                        <Link href="/dashboard" className="mt-4">
                            <Button
                                size="sm"
                                className="h-9 rounded-xl bg-cyan-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
                            >
                                Return to Dashboard
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}
