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
    BarChart3,
    Printer,
    Download,
    ShieldAlert,
    Award,
    TrendingDown,
    FileCheck2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TierBreakdown } from '@/components/cortex/tier-breakdown';
import { OptionRationaleTable } from '@/components/cortex/option-rationale-table';
import { RankPredictionData } from '@/components/cortex/national-rank-predictor';

interface SubjectStat {
    subject_id: string;
    name: string;
    total: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    penalty_lost: number;
    net_score: number;
    accuracy: number;
}

interface ResultProps {
    user: any;
    session: any;
    questions: any;
    subjectBreakdown?: SubjectStat[];
    rankPrediction?: RankPredictionData;
    stats: {
        score: number;
        total: number;
        maxMarks?: number;
        correct: number;
        incorrect: number;
        unanswered: number;
        accuracy: number;
        timeSpentMinutes: number;
        penaltyRate?: number;
    };
}

export default function MockExamResult({
    user,
    session,
    questions: rawQuestions,
    subjectBreakdown = [],
    rankPrediction,
    stats,
}: ResultProps) {
    const questions = Array.isArray(rawQuestions)
        ? rawQuestions
        : (rawQuestions as any)?.data || [];

    const attempts = session.attempts || session.data?.attempts || [];
    const attemptsMap = new Map<string, any>(
        attempts.map((a: any) => [a.question_id, a]),
    );

    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
    const activeQuestion = questions[selectedQuestionIndex];
    const activeAttempt = activeQuestion
        ? attemptsMap.get(activeQuestion.id)
        : null;

    // Diagnostic summaries
    const sortedByAccuracy = [...subjectBreakdown]
        .filter((s) => s.total > 0)
        .sort((a, b) => b.accuracy - a.accuracy);
    const topSubject = sortedByAccuracy.length > 0 ? sortedByAccuracy[0] : null;
    const weakestSubject =
        sortedByAccuracy.length > 0
            ? sortedByAccuracy[sortedByAccuracy.length - 1]
            : null;
    const totalPenaltyLost =
        Math.round(
            subjectBreakdown.reduce(
                (acc, curr) => acc + (curr.penalty_lost || 0),
                0,
            ) * 100,
        ) / 100;
    const sessionDate =
        session.completed_at || session.started_at || new Date().toISOString();
    const formattedDate = new Date(sessionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8 print:gap-4 print:bg-white print:p-0 print:text-black">
            <Head
                title={`Mock Exam Result — ${session.title || 'Grand Mock'}`}
            />

            {/* Top Score Banner (Hidden on Print) */}
            <div className="border-border flex flex-col justify-between gap-6 rounded-2xl border bg-gradient-to-r from-[#102A43] via-[#102A43] to-[#1c3d5a] p-6 text-white shadow-md sm:flex-row sm:items-center sm:p-8 print:hidden">
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
                    <p className="max-w-xl text-xs text-neutral-300">
                        Scores calculated utilizing exact national examination
                        negative-marking algorithms.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 px-5 py-4 backdrop-blur-md">
                        <span className="text-xs font-semibold tracking-wider text-neutral-300 uppercase">
                            Final Scaled Score
                        </span>
                        <span className="text-3xl font-extrabold text-[#55BDEB]">
                            {stats.score}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                            Out of {stats.maxMarks || stats.total} Points
                        </span>
                    </div>

                    {rankPrediction && (
                        <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 px-5 py-4 backdrop-blur-md">
                            <span className="text-xs font-semibold tracking-wider text-neutral-300 uppercase">
                                Projected Rank
                            </span>
                            <span className="text-3xl font-extrabold text-[#2FB36F]">
                                #
                                {rankPrediction.predicted_rank.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                                {rankPrediction.percentile}th Percentile
                            </span>
                        </div>
                    )}

                    <a
                        href={`/download/${session.id || session.data?.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button className="gap-2 bg-[#55BDEB] font-bold text-neutral-950 shadow-sm hover:bg-[#43a9d7]">
                            <Download className="size-4" />
                            Download PDF Report
                        </Button>
                    </a>

                    <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="gap-2 border-white/30 font-bold text-white shadow-sm hover:bg-white/10"
                    >
                        <Printer className="size-4" />
                        Print View
                    </Button>
                </div>
            </div>

            {/* Official Printable Transcript Header (Visible ONLY during print) */}
            <div className="mb-2 hidden flex-col border-b-2 border-neutral-900 pb-4 text-neutral-900 print:flex">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black tracking-wider text-black">
                                CORTEX MEDICAL AI
                            </span>
                            <span className="py-0.2 border border-black px-1.5 text-[9px] font-bold uppercase">
                                Official Examination Transcript
                            </span>
                        </div>
                        <h1 className="mt-1 text-lg font-black">
                            POSTGRADUATE MEDICAL ENTRANCE SCORECARD & AUDIT
                        </h1>
                        <p className="text-[10px] text-neutral-600">
                            Standardized Medical Assessment • Blueprint Quota &
                            Negative Marking Diagnostics
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="font-mono text-xs font-bold">
                            TRANSCRIPT ID: CTX-
                            {String(session.id).substring(0, 8).toUpperCase()}
                        </span>
                        <p className="text-[10px] text-neutral-600">
                            Date Issued: {formattedDate}
                        </p>
                    </div>
                </div>

                <div className="mt-3 grid grid-cols-5 gap-3 border-t border-neutral-300 pt-2.5 text-xs">
                    <div>
                        <span className="block text-[9px] text-neutral-500 uppercase">
                            Candidate
                        </span>
                        <span className="font-bold">
                            {user?.name || 'Dr. Candidate'}
                        </span>
                    </div>
                    <div>
                        <span className="block text-[9px] text-neutral-500 uppercase">
                            Exam Pathway
                        </span>
                        <span className="font-bold">
                            {session.exam_pathway}
                        </span>
                    </div>
                    <div>
                        <span className="block text-[9px] text-neutral-500 uppercase">
                            Configuration
                        </span>
                        <span className="font-bold">
                            {session.title || 'Grand Mock Exam'}
                        </span>
                    </div>
                    <div>
                        <span className="block text-[9px] text-neutral-500 uppercase">
                            Final Scaled Score
                        </span>
                        <span className="text-sm font-bold">
                            {stats.score} / {stats.total} ({stats.accuracy}%)
                        </span>
                    </div>
                    <div>
                        <span className="block text-[9px] text-neutral-500 uppercase">
                            Predicted National Rank
                        </span>
                        <span className="text-sm font-bold text-black">
                            #
                            {rankPrediction?.predicted_rank.toLocaleString() ??
                                '—'}{' '}
                            ({rankPrediction?.percentile ?? stats.accuracy}%ile)
                        </span>
                    </div>
                </div>
            </div>

            {/* Medical Audit & Executive Impact Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
                {/* 1. Negative Marking Impact */}
                <div className="flex flex-col justify-between rounded-xl border border-[#E05252]/30 bg-[#E05252]/5 p-4 print:border-neutral-300 print:bg-white">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="size-5 text-[#E05252]" />
                        <h3 className="text-foreground text-xs font-bold tracking-wider uppercase print:text-black">
                            Negative Marking Loss
                        </h3>
                    </div>
                    <div className="mt-2">
                        <span className="text-2xl font-black text-[#E05252]">
                            -
                            {totalPenaltyLost > 0
                                ? totalPenaltyLost
                                : (
                                      stats.incorrect * (stats.penaltyRate || 0)
                                  ).toFixed(2)}{' '}
                            pts
                        </span>
                        <p className="text-muted-foreground mt-1 text-[11px] print:text-neutral-600">
                            {stats.incorrect} questions missed at -
                            {stats.penaltyRate ?? 0.33} penalty deduction rate.
                        </p>
                    </div>
                </div>

                {/* 2. Top Performing Discipline */}
                <div className="flex flex-col justify-between rounded-xl border border-[#2FB36F]/30 bg-[#2FB36F]/5 p-4 print:border-neutral-300 print:bg-white">
                    <div className="flex items-center gap-2">
                        <Award className="size-5 text-[#2FB36F]" />
                        <h3 className="text-foreground text-xs font-bold tracking-wider uppercase print:text-black">
                            Highest Proficiency
                        </h3>
                    </div>
                    <div className="mt-2">
                        <span className="line-clamp-1 text-base font-bold text-[#2FB36F] print:text-neutral-900">
                            {topSubject ? topSubject.name : 'Core Curriculum'}
                        </span>
                        <p className="text-muted-foreground mt-1 text-[11px] print:text-neutral-600">
                            {topSubject
                                ? `${topSubject.accuracy}% accuracy (${topSubject.correct}/${topSubject.total} correct)`
                                : 'Awaiting subject attempts'}
                        </p>
                    </div>
                </div>

                {/* 3. Primary Vulnerability Discipline */}
                <div className="flex flex-col justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 print:border-neutral-300 print:bg-white">
                    <div className="flex items-center gap-2">
                        <TrendingDown className="size-5 text-amber-500" />
                        <h3 className="text-foreground text-xs font-bold tracking-wider uppercase print:text-black">
                            Remediation Priority
                        </h3>
                    </div>
                    <div className="mt-2">
                        <span className="line-clamp-1 text-base font-bold text-amber-600 dark:text-amber-400 print:text-neutral-900">
                            {weakestSubject
                                ? weakestSubject.name
                                : 'All Balanced'}
                        </span>
                        <p className="text-muted-foreground mt-1 text-[11px] print:text-neutral-600">
                            {weakestSubject
                                ? `${weakestSubject.accuracy}% accuracy (${weakestSubject.incorrect} wrong, -${weakestSubject.penalty_lost} pts lost)`
                                : 'No critical weaknesses'}
                        </p>
                    </div>
                </div>

                {/* 4. Projected National Rank & Counselling */}
                <div className="flex flex-col justify-between rounded-xl border border-[#55BDEB]/30 bg-[#55BDEB]/5 p-4 print:border-neutral-300 print:bg-white">
                    <div className="flex items-center gap-2">
                        <FileCheck2 className="size-5 text-[#55BDEB]" />
                        <h3 className="text-foreground text-xs font-bold tracking-wider uppercase print:text-black">
                            Predicted Rank & Seat
                        </h3>
                    </div>
                    <div className="mt-2">
                        <span className="text-2xl font-black text-[#55BDEB]">
                            #
                            {rankPrediction?.predicted_rank.toLocaleString() ??
                                '—'}
                        </span>
                        <p className="text-muted-foreground mt-1 line-clamp-1 text-[11px] print:text-neutral-600">
                            {rankPrediction?.tier_status ??
                                'AIR Top 10% Probability'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Performance Metric Counters */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="border-border bg-card flex flex-col rounded-xl border p-4 shadow-sm">
                    <span className="text-muted-foreground text-xs font-semibold uppercase">
                        Accuracy
                    </span>
                    <span className="text-foreground mt-1 text-2xl font-extrabold">
                        {stats.accuracy}%
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                        {stats.correct} of {stats.total} questions
                    </span>
                </div>

                <div className="flex flex-col rounded-xl border border-[#2FB36F]/30 bg-[#2FB36F]/5 p-4 shadow-sm">
                    <span className="text-xs font-semibold text-[#2FB36F] uppercase">
                        Correct Answers
                    </span>
                    <span className="mt-1 text-2xl font-extrabold text-[#2FB36F]">
                        {stats.correct}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                        +1.0 per correct question
                    </span>
                </div>

                <div className="flex flex-col rounded-xl border border-[#E05252]/30 bg-[#E05252]/5 p-4 shadow-sm">
                    <span className="text-xs font-semibold text-[#E05252] uppercase">
                        Negative Marking
                    </span>
                    <span className="mt-1 text-2xl font-extrabold text-[#E05252]">
                        {stats.incorrect}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                        Penalty applied per pathway
                    </span>
                </div>

                <div className="border-border bg-card flex flex-col rounded-xl border p-4 shadow-sm">
                    <span className="text-muted-foreground text-xs font-semibold uppercase">
                        Unanswered
                    </span>
                    <span className="text-foreground mt-1 text-2xl font-extrabold">
                        {stats.unanswered}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                        Zero penalty
                    </span>
                </div>
            </div>

            {/* Subject-Wise Diagnostic & Penalty Audit */}
            {subjectBreakdown && subjectBreakdown.length > 0 && (
                <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6 shadow-sm">
                    <div className="border-border flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="size-5 text-[#55BDEB]" />
                            <div>
                                <h2 className="text-foreground text-base font-bold">
                                    Subject-Wise Diagnostic & Penalty Audit
                                </h2>
                                <p className="text-muted-foreground text-xs">
                                    Curricular distribution and negative-marking
                                    impact per medical discipline.
                                </p>
                            </div>
                        </div>
                        {stats.penaltyRate !== undefined && (
                            <span className="bg-destructive/10 text-destructive self-start rounded px-2.5 py-1 text-xs font-semibold sm:self-auto">
                                Penalty Rate: -{stats.penaltyRate} per wrong
                                answer
                            </span>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-border bg-muted/40 text-muted-foreground border-b text-[10px] font-bold uppercase">
                                <tr>
                                    <th className="px-4 py-3">
                                        Discipline / Subject
                                    </th>
                                    <th className="px-3 py-3 text-center">
                                        Items
                                    </th>
                                    <th className="px-3 py-3 text-center">
                                        Correct (+1)
                                    </th>
                                    <th className="px-3 py-3 text-center">
                                        Wrong
                                    </th>
                                    <th className="px-3 py-3 text-center">
                                        Unanswered
                                    </th>
                                    <th className="text-destructive px-3 py-3 text-center">
                                        Penalty Lost
                                    </th>
                                    <th className="px-3 py-3 text-center font-bold">
                                        Net Score
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Accuracy
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-border divide-y">
                                {subjectBreakdown.map((sb) => {
                                    const accuracyClass =
                                        sb.accuracy >= 70
                                            ? 'text-[#2FB36F] font-bold'
                                            : sb.accuracy >= 50
                                              ? 'text-amber-500 font-semibold'
                                              : 'text-[#E05252] font-bold';

                                    return (
                                        <tr
                                            key={sb.subject_id}
                                            className="hover:bg-muted/20 transition-colors"
                                        >
                                            <td className="text-foreground px-4 py-3 font-semibold">
                                                {sb.name}
                                            </td>
                                            <td className="text-muted-foreground px-3 py-3 text-center font-mono">
                                                {sb.total}
                                            </td>
                                            <td className="px-3 py-3 text-center font-mono font-bold text-[#2FB36F]">
                                                {sb.correct}
                                            </td>
                                            <td className="px-3 py-3 text-center font-mono text-[#E05252]">
                                                {sb.incorrect}
                                            </td>
                                            <td className="text-muted-foreground px-3 py-3 text-center font-mono">
                                                {sb.unanswered}
                                            </td>
                                            <td className="text-destructive px-3 py-3 text-center font-mono">
                                                {sb.penalty_lost > 0
                                                    ? `-${sb.penalty_lost}`
                                                    : '0.00'}
                                            </td>
                                            <td className="text-foreground px-3 py-3 text-center font-mono font-extrabold">
                                                {sb.net_score}
                                            </td>
                                            <td
                                                className={`px-4 py-3 text-right font-mono ${accuracyClass}`}
                                            >
                                                {sb.accuracy}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Printable Security & Verification Footer */}
                    <div className="mt-4 hidden items-center justify-between border-t border-neutral-300 pt-3 text-[9px] text-neutral-500 print:flex">
                        <span>
                            Certified Transcript issued by Cortex Medical
                            Education Assessment Platform
                        </span>
                        <span className="font-mono">
                            Security Digest:{' '}
                            {String(session.id).substring(0, 16).toUpperCase()}{' '}
                            • Verified Authenticated
                        </span>
                    </div>
                </div>
            )}

            {/* Question Review Deconstruction Split View (Hidden on Print) */}
            <div className="flex flex-col gap-4 print:hidden">
                <div className="border-border flex items-center justify-between border-b pb-2">
                    <h3 className="text-foreground text-sm font-bold tracking-wider uppercase">
                        Question-by-Question Diagnostic Review
                    </h3>
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                            >
                                Back to Dashboard
                            </Button>
                        </Link>
                        <Link href="/qbank/runner">
                            <Button
                                size="sm"
                                className="bg-[#55BDEB] text-xs font-bold text-neutral-950"
                            >
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
                                className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border text-xs font-bold transition-all ${
                                    att
                                        ? isCorrect
                                            ? 'border-[#2FB36F] bg-[#2FB36F]/15 text-[#2FB36F]'
                                            : 'border-[#E05252] bg-[#E05252]/15 text-[#E05252]'
                                        : 'border-border bg-muted/30 text-muted-foreground'
                                } ${isSelected ? 'ring-primary scale-105 shadow-sm ring-2' : ''}`}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Selected Question Deep Dive */}
                {activeQuestion && (
                    <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6 shadow-sm">
                        <div className="border-border flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-[#55BDEB]">
                                    {activeQuestion.code}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                    {activeQuestion.subject?.name}
                                </span>
                            </div>
                            <div>
                                {activeAttempt ? (
                                    activeAttempt.is_correct ? (
                                        <span className="flex items-center gap-1 rounded bg-[#2FB36F]/15 px-2.5 py-0.5 text-xs font-bold text-[#2FB36F]">
                                            <CheckCircle2 className="size-3.5" />{' '}
                                            Correct (+1.0)
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 rounded bg-[#E05252]/15 px-2.5 py-0.5 text-xs font-bold text-[#E05252]">
                                            <XCircle className="size-3.5" />{' '}
                                            Incorrect (Negative Marking Penalty)
                                        </span>
                                    )
                                ) : (
                                    <span className="bg-muted text-muted-foreground rounded px-2.5 py-0.5 text-xs">
                                        Unanswered
                                    </span>
                                )}
                            </div>
                        </div>

                        <p className="text-foreground text-sm leading-relaxed font-medium whitespace-pre-line">
                            {activeQuestion.stem}
                        </p>

                        {/* Tier Breakdown */}
                        <TierBreakdown
                            learningObjective={
                                activeQuestion.learning_objective
                            }
                            foundationExplanation={
                                activeQuestion.foundation_explanation
                            }
                            integrationExplanation={
                                activeQuestion.integration_explanation
                            }
                            applicationExplanation={
                                activeQuestion.application_explanation
                            }
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
