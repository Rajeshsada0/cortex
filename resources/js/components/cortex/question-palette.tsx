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
    const [filter, setFilter] = useState<'all' | 'answered' | 'unanswered' | 'marked'>('all');

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
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Question Palette ({totalCount} Qs)
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                    {answeredCount}/{totalCount} Answered
                </span>
            </div>

            {/* Filter Selector Tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5 text-[10px]">
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
            <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground border-b border-border pb-3">
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
                    <span className="size-2.5 rounded-sm bg-muted border border-border" />
                    <span>Not Visited</span>
                </div>
            </div>

            {/* Questions Grid Matrix */}
            <div className="grid grid-cols-5 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {filteredQuestions.map(({ q, idx }) => {
                    const isCurrent = idx === currentIndex;
                    const isAnswered = Boolean(answers[q.id]);
                    const isMarked = markedQuestions.has(q.id);
                    const isVisited = visitedQuestions.has(q.id);

                    let bgClass = 'bg-muted/50 text-muted-foreground border-border';
                    if (isAnswered && isMarked) {
                        bgClass = 'bg-[#2FB36F] text-white ring-2 ring-indigo-500 font-bold';
                    } else if (isAnswered) {
                        bgClass = 'bg-[#2FB36F] text-white font-bold';
                    } else if (isMarked) {
                        bgClass = 'bg-indigo-600 text-white font-bold';
                    } else if (isVisited) {
                        bgClass = 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40';
                    }

                    return (
                        <button
                            key={q.id}
                            type="button"
                            onClick={() => onSelectQuestion(idx)}
                            className={`relative flex h-8 items-center justify-center rounded-md border text-xs transition-all cursor-pointer ${bgClass} ${
                                isCurrent
                                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 shadow-sm'
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
