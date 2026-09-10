import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Trophy,
    CheckCircle2,
    XCircle,
    HelpCircle,
    ArrowRight,
    RotateCcw,
    Clock,
    Layers,
    Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TierBreakdown } from '@/components/cortex/tier-breakdown';
import { OptionRationaleTable } from '@/components/cortex/option-rationale-table';

interface ResultProps {
    user: any;
    session: any;
    questions: any;
    stats: {
        score: number;
        total: number;
        correct: number;
        incorrect: number;
        unanswered: number;
        accuracy: number;
        timeSpentMinutes: number;
    };
}

export default function MockExamResult({ user, session, questions: rawQuestions, stats }: ResultProps) {
    const questions = Array.isArray(rawQuestions)
        ? rawQuestions
        : (rawQuestions as any)?.data || [];

    const attempts = session.attempts || session.data?.attempts || [];
    const attemptsMap = new Map<string, any>(attempts.map((a: any) => [a.question_id, a]));

    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
    const activeQuestion = questions[selectedQuestionIndex];
    const activeAttempt = activeQuestion ? attemptsMap.get(activeQuestion.id) : null;

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full">
            <Head title={`Mock Exam Result — ${session.title || 'Grand Mock'}`} />

            {/* Top Score Banner */}
            <div className="flex flex-col justify-between gap-6 rounded-2xl border border-border bg-gradient-to-r from-[#102A43] via-[#102A43] to-[#1c3d5a] p-6 sm:p-8 text-white shadow-md sm:flex-row sm:items-center">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="rounded bg-[#55BDEB]/20 px-2.5 py-0.5 text-xs font-bold text-[#55BDEB]">
                            {session.exam_pathway || 'INI_CET'} Scoring
                        </span>
                        <span className="text-xs text-neutral-300">
                            Completed in {stats.timeSpentMinutes} mins
                        </span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                        Official Grand Mock Performance Report
                    </h1>
                    <p className="text-xs text-neutral-300 max-w-xl">
                        Scores calculated utilizing exact national examination negative-marking algorithms.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 px-6 py-4 backdrop-blur-md">
                        <span className="text-xs text-neutral-300 uppercase tracking-wider font-semibold">
                            Final Scaled Score
                        </span>
                        <span className="text-3xl font-extrabold text-[#55BDEB]">
                            {stats.score}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                            Out of {stats.total} Points
                        </span>
                    </div>
                </div>
            </div>

            {/* Performance Metric Counters */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                        Accuracy
                    </span>
                    <span className="text-2xl font-extrabold text-foreground mt-1">
                        {stats.accuracy}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {stats.correct} of {stats.total} questions
                    </span>
                </div>

                <div className="flex flex-col rounded-xl border border-[#2FB36F]/30 bg-[#2FB36F]/5 p-4 shadow-sm">
                    <span className="text-xs font-semibold text-[#2FB36F] uppercase">
                        Correct Answers
                    </span>
                    <span className="text-2xl font-extrabold text-[#2FB36F] mt-1">
                        {stats.correct}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        +1.0 per correct question
                    </span>
                </div>

                <div className="flex flex-col rounded-xl border border-[#E05252]/30 bg-[#E05252]/5 p-4 shadow-sm">
                    <span className="text-xs font-semibold text-[#E05252] uppercase">
                        Negative Marking
                    </span>
                    <span className="text-2xl font-extrabold text-[#E05252] mt-1">
                        {stats.incorrect}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        Penalty applied per pathway
                    </span>
                </div>

                <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                        Unanswered
                    </span>
                    <span className="text-2xl font-extrabold text-foreground mt-1">
                        {stats.unanswered}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        Zero penalty
                    </span>
                </div>
            </div>

            {/* Question Review Deconstruction Split View */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        Question-by-Question Diagnostic Review
                    </h3>
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm" className="text-xs">
                                Back to Dashboard
                            </Button>
                        </Link>
                        <Link href="/qbank/runner">
                            <Button size="sm" className="bg-[#55BDEB] text-neutral-950 font-bold text-xs">
                                Practice Weak Subjects
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Horizontal Question Strip */}
                <div className="flex gap-1.5 overflow-x-auto pb-2">
                    {questions.map((q: any, idx: number) => {
                        const att = attemptsMap.get(q.id);
                        const isCorrect = att?.is_correct;
                        const isSelected = idx === selectedQuestionIndex;

                        return (
                            <button
                                key={q.id}
                                type="button"
                                onClick={() => setSelectedQuestionIndex(idx)}
                                className={`flex size-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                    att
                                        ? isCorrect
                                            ? 'border-[#2FB36F] bg-[#2FB36F]/15 text-[#2FB36F]'
                                            : 'border-[#E05252] bg-[#E05252]/15 text-[#E05252]'
                                        : 'border-border bg-muted/30 text-muted-foreground'
                                } ${isSelected ? 'ring-2 ring-primary scale-105 shadow-sm' : ''}`}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Selected Question Deep Dive */}
                {activeQuestion && (
                    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-[#55BDEB]">
                                    {activeQuestion.code}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {activeQuestion.subject?.name}
                                </span>
                            </div>
                            <div>
                                {activeAttempt ? (
                                    activeAttempt.is_correct ? (
                                        <span className="flex items-center gap-1 rounded bg-[#2FB36F]/15 px-2.5 py-0.5 text-xs font-bold text-[#2FB36F]">
                                            <CheckCircle2 className="size-3.5" /> Correct (+1.0)
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 rounded bg-[#E05252]/15 px-2.5 py-0.5 text-xs font-bold text-[#E05252]">
                                            <XCircle className="size-3.5" /> Incorrect (Negative Marking Penalty)
                                        </span>
                                    )
                                ) : (
                                    <span className="rounded bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                                        Unanswered
                                    </span>
                                )}
                            </div>
                        </div>

                        <p className="text-sm leading-relaxed text-foreground whitespace-pre-line font-medium">
                            {activeQuestion.stem}
                        </p>

                        {/* Tier Breakdown */}
                        <TierBreakdown
                            learningObjective={activeQuestion.learning_objective}
                            foundationExplanation={activeQuestion.foundation_explanation}
                            integrationExplanation={activeQuestion.integration_explanation}
                            applicationExplanation={activeQuestion.application_explanation}
                            memoryPeg={activeQuestion.memory_peg}
                        />

                        {/* Option Rationale Table */}
                        <OptionRationaleTable
                            options={activeQuestion.options || []}
                            correctOption={activeQuestion.correct_option}
                            selectedOption={activeAttempt?.selected_option}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
