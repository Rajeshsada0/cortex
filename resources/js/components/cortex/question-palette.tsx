import React from 'react';
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
    const answeredCount = Object.keys(answers).length;
    const markedCount = markedQuestions.size;
    const totalCount = questions.length;

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
                    <span>Unanswered</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm bg-muted border border-border" />
                    <span>Not Visited</span>
                </div>
            </div>

            {/* Questions Grid Matrix */}
            <div className="grid grid-cols-5 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {questions.map((q, idx) => {
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
