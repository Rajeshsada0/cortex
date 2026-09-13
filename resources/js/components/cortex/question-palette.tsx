import React, { useState } from 'react';
import { Bookmark, CheckCircle2, HelpCircle } from 'lucide-react';

export interface QuestionStatusItem {
    index: number;
    id: string;
    isAnswered: boolean;
    isMarked: boolean;
    isVisited: boolean;
}

interface QuestionPaletteProps {
    questions: { id: string }[];
    currentIndex: number;
    answers: Record<string, string>; // questionId -> selectedOption
    markedQuestions: Set<string>; // Set of questionIds
    visitedQuestions: Set<string>;
    onSelectQuestion: (index: number) => void;
}

export function QuestionPalette({
    questions,
    currentIndex,
    answers,
    markedQuestions,
    visitedQuestions,
    onSelectQuestion,
}: QuestionPaletteProps) {
    const [filter, setFilter] = useState<
        'all' | 'answered' | 'unanswered' | 'marked'
    >('all');

    const answeredCount = Object.keys(answers).length;
    const markedCount = markedQuestions.size;
    const totalCount = questions.length;
    const unansweredCount = Math.max(0, totalCount - answeredCount);

    const filteredQuestions = questions
        .map((q, idx) => ({ q, idx }))
        .filter(({ q }) => {
            if (filter === 'answered') return Boolean(answers[q.id]);
            if (filter === 'unanswered') return !answers[q.id];
            if (filter === 'marked') return markedQuestions.has(q.id);
            return true;
        });

    return (
        <div className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-sm">
            <div className="border-border flex items-center justify-between border-b pb-2">
                <span className="text-foreground text-xs font-bold tracking-wider uppercase">
                    Question Palette ({totalCount} Qs)
                </span>
                <span className="text-muted-foreground text-[11px] font-medium">
                    {answeredCount}/{totalCount} Answered
                </span>
            </div>

            {/* Filter Selector Tabs */}
            <div className="border-border bg-muted/40 flex items-center gap-1 rounded-lg border p-0.5 text-[10px]">
                <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className={`flex-1 rounded py-1 font-semibold transition-all ${
                        filter === 'all'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    All ({totalCount})
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('answered')}
                    className={`flex-1 rounded py-1 font-semibold transition-all ${
                        filter === 'answered'
                            ? 'bg-card text-[#2FB36F] shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Ans ({answeredCount})
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('unanswered')}
                    className={`flex-1 rounded py-1 font-semibold transition-all ${
                        filter === 'unanswered'
                            ? 'bg-card text-amber-500 shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Unans ({unansweredCount})
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('marked')}
                    className={`flex-1 rounded py-1 font-semibold transition-all ${
                        filter === 'marked'
                            ? 'bg-card text-indigo-500 shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Mark ({markedCount})
                </button>
            </div>

            {/* Status Legend */}
            <div className="text-muted-foreground border-border grid grid-cols-2 gap-2 border-b pb-3 text-[10px]">
                <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm bg-[#2FB36F]" />
                    <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm bg-indigo-500" />
                    <span>Marked ({markedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm bg-amber-500" />
                    <span>Unanswered ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="bg-muted border-border size-2.5 rounded-sm border" />
                    <span>Not Visited</span>
                </div>
            </div>

            {/* Questions Grid Matrix */}
            <div className="grid max-h-56 grid-cols-5 gap-1.5 overflow-y-auto pr-1">
                {filteredQuestions.map(({ q, idx }) => {
                    const isCurrent = idx === currentIndex;
                    const isAnswered = Boolean(answers[q.id]);
                    const isMarked = markedQuestions.has(q.id);
                    const isVisited = visitedQuestions.has(q.id);

                    let bgClass =
                        'bg-muted/50 text-muted-foreground border-border';
                    if (isAnswered && isMarked) {
                        bgClass =
                            'bg-[#2FB36F] text-white ring-2 ring-indigo-500 font-bold';
                    } else if (isAnswered) {
                        bgClass = 'bg-[#2FB36F] text-white font-bold';
                    } else if (isMarked) {
                        bgClass = 'bg-indigo-600 text-white font-bold';
                    } else if (isVisited) {
                        bgClass =
                            'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40';
                    }

                    return (
                        <button
                            key={q.id}
                            type="button"
                            onClick={() => onSelectQuestion(idx)}
                            className={`relative flex h-8 cursor-pointer items-center justify-center rounded-md border text-xs transition-all ${bgClass} ${
                                isCurrent
                                    ? 'ring-primary ring-offset-background scale-105 shadow-sm ring-2 ring-offset-2'
                                    : 'hover:opacity-85'
                            }`}
                        >
                            {idx + 1}
                            {isMarked && (
                                <span className="absolute -top-1 -right-1 size-2 rounded-full bg-indigo-500" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
