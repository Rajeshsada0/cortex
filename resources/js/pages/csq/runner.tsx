import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Clock,
    RotateCcw,
    ShieldCheck,
    XCircle,
    ChevronRight,
    Home,
    FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/use-settings';

interface Question {
    id: number;
    question_number: number;
    stem: string;
    options: string[];
    correct_option: number;
    explanation: string;
}

interface Scenario {
    id: number;
    discipline: string;
    title: string;
    stem: string;
    vitals: string | null;
    questions: Question[];
}

interface CsqRunnerProps {
    scenarios: Scenario[];
    durationMinutes: number;
    pathwayCode: string;
    pathwayName: string;
    passingBenchmark: number;
}

export default function CsqRunner({
    scenarios,
    durationMinutes = 30,
    pathwayCode = 'NMC',
    pathwayName = 'Nepal Medical Council (NMC)',
    passingBenchmark = 50,
}: CsqRunnerProps) {
    const settings = useSettings();
    const [currentStationIndex, setCurrentStationIndex] = useState(0);
    const [userSelections, setUserSelections] = useState<Record<number, number>>({});
    const [stationSubmitted, setStationSubmitted] = useState<Record<number, boolean>>({});
    const [stationScores, setStationScores] = useState<Record<number, number>>({});
    const [isFinished, setIsFinished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Timer
    const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
    const totalTimeAllowed = durationMinutes * 60;
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const currentStation = scenarios[currentStationIndex];
    const isCurrentSubmitted = Boolean(stationSubmitted[currentStationIndex]);

    // Timer countdown
    useEffect(() => {
        if (isFinished) return;

        timerRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    handleTimeExpired();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isFinished, scenarios]);

    const handleTimeExpired = () => {
        toast.error('Exam time has expired! Your computerized mock exam is now submitted.');
        finishExam();
    };

    const formatTimer = (totalSecs: number) => {
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSelectOption = (questionIndex: number, optionIndex: number) => {
        if (isCurrentSubmitted) return;
        setUserSelections((prev) => ({
            ...prev,
            [questionIndex]: optionIndex,
        }));
    };

    const answeredCount = Object.keys(userSelections).length;
    const currentQuestionsCount = currentStation?.questions?.length || 5;
    const allAnswered = answeredCount === currentQuestionsCount;

    const handleSubmitStation = () => {
        if (!allAnswered) {
            toast.error(
                'Nepal Medical Council CSQ Rule:\nYou must answer all 5 questions before submitting and viewing explanations.',
                { duration: 4000 }
            );
            return;
        }

        // Calculate score for this station
        let score = 0;
        currentStation.questions.forEach((q, idx) => {
            if (userSelections[idx] === q.correct_option) {
                score++;
            }
        });

        setStationSubmitted((prev) => ({ ...prev, [currentStationIndex]: true }));
        setStationScores((prev) => ({ ...prev, [currentStationIndex]: score }));

        toast.success(`Station ${currentStationIndex + 1} submitted! Score: ${score} / ${currentQuestionsCount}`);
    };

    const handleNextStation = () => {
        if (currentStationIndex < scenarios.length - 1) {
            setCurrentStationIndex((prev) => prev + 1);
            setUserSelections({});
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            finishExam();
        }
    };

    const finishExam = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsFinished(true);

        // Compute final score
        let totalScore = 0;
        const stationResults = scenarios.map((st, idx) => {
            const score = stationScores[idx] ?? 0;
            totalScore += score;
            return {
                station_number: idx + 1,
                discipline: st.discipline,
                title: st.title,
                score: score,
                max_score: st.questions.length,
                outcome: score >= 3 ? 'Proficient' : 'Needs Review',
            };
        });

        const totalQuestions = scenarios.reduce((acc, st) => acc + st.questions.length, 0);
        const percentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
        const isPassed = percentage >= passingBenchmark;
        const timeSpentSeconds = totalTimeAllowed - secondsLeft;

        // Persist attempt to database
        setIsSaving(true);
        fetch('/csq/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
            body: JSON.stringify({
                pathway_code: pathwayCode,
                time_spent_seconds: timeSpentSeconds,
                total_stations: scenarios.length,
                total_questions: totalQuestions,
                total_score: totalScore,
                percentage: percentage,
                is_passed: isPassed,
                station_results: stationResults,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setIsSaving(false);
            })
            .catch(() => {
                setIsSaving(false);
            });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!currentStation && !isFinished) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-neutral-950">
                <AlertCircle className="h-12 w-12 text-amber-500" />
                <h2 className="mt-4 text-xl font-bold text-foreground">No Clinical Scenarios Found</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    There are currently no active CSQ stations available for this pathway.
                </p>
                <Link href="/csq" className="mt-6">
                    <Button variant="outline">Return to CSQ Hub</Button>
                </Link>
            </div>
        );
    }

    const totalQuestionsOverall = scenarios.reduce((acc, st) => acc + st.questions.length, 0);
    const totalScoreAchieved = Object.values(stationScores).reduce((a, b) => a + b, 0);
    const finalPercentage = totalQuestionsOverall > 0 ? Math.round((totalScoreAchieved / totalQuestionsOverall) * 100) : 0;
    const hasPassed = finalPercentage >= passingBenchmark;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-neutral-950 dark:text-slate-100">
            <Head title="Clinical Scenario Question (CSQ) Mock Exam - Cortex Med" />

            {/* Application Header */}
            <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/80 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-8 dark:bg-neutral-900/95">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-1 shadow-xs dark:bg-cyan-950/40">
                        <img
                            src={settings.site_logo || '/images/cortex-logo.png'}
                            alt={settings.app_name}
                            className="h-7 w-7 object-contain drop-shadow-xs"
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
                                NMC Screening &amp; Licensing Portal
                            </h1>
                            <span className="hidden rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-700 sm:inline-block dark:text-cyan-400">
                                Computerized Examination
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Clinical Scenario Question (CSQ) Mock Examination
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {!isFinished && (
                        <>
                            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300">
                                Scenario {currentStationIndex + 1} of {scenarios.length}
                            </div>
                            <div
                                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 font-mono text-xs font-bold shadow-xs transition-colors ${
                                    secondsLeft < 300
                                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 animate-pulse dark:text-rose-400'
                                        : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                }`}
                            >
                                <Clock className="h-3.5 w-3.5" />
                                <span>{formatTimer(secondsLeft)}</span>
                            </div>
                        </>
                    )}

                    <Link href="/csq">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 rounded-lg text-xs text-muted-foreground hover:text-foreground"
                        >
                            <Home className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Exit Exam</span>
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                {!isFinished ? (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* Left Column: Clinical Scenario Vignette */}
                        <aside className="lg:col-span-5">
                            <div className="sticky top-20 flex flex-col rounded-2xl border border-border bg-white p-6 shadow-xs dark:bg-neutral-900">
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                                        <Activity className="h-3.5 w-3.5" />
                                        {currentStation.discipline}
                                    </span>
                                    <span className="font-mono text-xs text-muted-foreground">
                                        Station {currentStationIndex + 1}
                                    </span>
                                </div>

                                <h2 className="mt-4 text-lg font-bold leading-snug tracking-tight text-foreground sm:text-xl">
                                    {currentStation.title}
                                </h2>

                                <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                    {currentStation.stem}
                                </div>

                                {currentStation.vitals && (
                                    <div className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-50/50 p-4 dark:border-cyan-900/50 dark:bg-cyan-950/20">
                                        <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-cyan-800 uppercase dark:text-cyan-300">
                                            <FileText className="h-3.5 w-3.5" />
                                            Key Diagnostic Markers &amp; Vitals
                                        </h3>
                                        <div className="mt-2.5 whitespace-pre-line font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                                            {currentStation.vitals}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </aside>

                        {/* Right Column: 5 Linked Questions */}
                        <section className="space-y-6 lg:col-span-7">
                            <div className="space-y-5">
                                {currentStation.questions.map((q, qIdx) => {
                                    const selectedOption = userSelections[qIdx];
                                    const isAnswered = selectedOption !== undefined;
                                    const isCorrect = isCurrentSubmitted && selectedOption === q.correct_option;

                                    return (
                                        <div
                                            key={q.id || qIdx}
                                            className="rounded-2xl border border-border bg-white p-5 shadow-xs transition dark:bg-neutral-900"
                                        >
                                            {/* MCQ Header */}
                                            <div className="flex items-start gap-3">
                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-700 dark:bg-neutral-800 dark:text-slate-300">
                                                    {qIdx + 1}
                                                </span>
                                                <p className="text-sm font-semibold leading-snug text-foreground sm:text-base">
                                                    {q.stem}
                                                </p>
                                            </div>

                                            {/* Options Grid */}
                                            <div className="mt-4 space-y-2.5">
                                                {q.options.map((optionText, optIdx) => {
                                                    const isThisSelected = selectedOption === optIdx;
                                                    const isThisCorrect = isCurrentSubmitted && optIdx === q.correct_option;
                                                    const isThisWrong = isCurrentSubmitted && isThisSelected && !isCorrect;

                                                    let optionClasses =
                                                        'flex items-center gap-3 rounded-xl border p-3 text-xs sm:text-sm font-medium transition cursor-pointer select-none ';

                                                    if (!isCurrentSubmitted) {
                                                        if (isThisSelected) {
                                                            optionClasses +=
                                                                'border-cyan-600 bg-cyan-50/60 text-cyan-900 dark:border-cyan-500 dark:bg-cyan-950/30 dark:text-cyan-200 shadow-xs';
                                                        } else {
                                                            optionClasses +=
                                                                'border-border bg-card text-foreground hover:bg-muted/60';
                                                        }
                                                    } else {
                                                        if (isThisCorrect) {
                                                            optionClasses +=
                                                                'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold dark:border-emerald-500/80 dark:bg-emerald-950/30 dark:text-emerald-200';
                                                        } else if (isThisWrong) {
                                                            optionClasses +=
                                                                'border-rose-500 bg-rose-50 text-rose-900 dark:border-rose-500/80 dark:bg-rose-950/30 dark:text-rose-200';
                                                        } else {
                                                            optionClasses +=
                                                                'border-border/60 opacity-60 text-muted-foreground bg-muted/20';
                                                        }
                                                    }

                                                    return (
                                                        <label
                                                            key={optIdx}
                                                            className={optionClasses}
                                                            onClick={() => handleSelectOption(qIdx, optIdx)}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`station-q-${qIdx}`}
                                                                value={optIdx}
                                                                checked={isThisSelected}
                                                                disabled={isCurrentSubmitted}
                                                                onChange={() => handleSelectOption(qIdx, optIdx)}
                                                                className="h-4 w-4 border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                                            />
                                                            <span className="flex-1">
                                                                <strong className="mr-1.5 font-bold">
                                                                    {String.fromCharCode(65 + optIdx)}.
                                                                </strong>
                                                                {optionText}
                                                            </span>

                                                            {isCurrentSubmitted && isThisCorrect && (
                                                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                                            )}
                                                            {isCurrentSubmitted && isThisWrong && (
                                                                <XCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                            </div>

                                            {/* Explanation Box Revealed on Submit */}
                                            {isCurrentSubmitted && (
                                                <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-50/60 p-4 text-xs leading-relaxed text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                                                    <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400">
                                                        <ShieldCheck className="h-4 w-4" />
                                                        <span>Clinical Rationale</span>
                                                    </div>
                                                    <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300">
                                                        {q.explanation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Action Bar */}
                            <div className="sticky bottom-4 rounded-2xl border border-border bg-white/95 p-4 shadow-lg backdrop-blur-md dark:bg-neutral-900/95">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-xs font-medium text-muted-foreground">
                                        {!isCurrentSubmitted ? (
                                            allAnswered ? (
                                                <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                                                    ✓ All {currentQuestionsCount} questions answered. Ready to submit.
                                                </span>
                                            ) : (
                                                <span>
                                                    Answered {answeredCount} of {currentQuestionsCount} questions.
                                                </span>
                                            )
                                        ) : (
                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                Station {currentStationIndex + 1} Score:{' '}
                                                {stationScores[currentStationIndex] ?? 0} / {currentQuestionsCount}{' '}
                                                correct.
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!isCurrentSubmitted ? (
                                            <Button
                                                onClick={handleSubmitStation}
                                                disabled={!allAnswered}
                                                className="w-full rounded-xl bg-cyan-600 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 sm:w-auto dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
                                            >
                                                Submit &amp; Reveal Answers
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleNextStation}
                                                className="w-full gap-1.5 rounded-xl bg-slate-900 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 sm:w-auto dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                                            >
                                                <span>
                                                    {currentStationIndex === scenarios.length - 1
                                                        ? 'Finish & View Results'
                                                        : 'Next CSQ Station'}
                                                </span>
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                ) : (
                    /* End of Test Performance Report Screen */
                    <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-10 dark:bg-neutral-900">
                        <div className="text-center">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                                Nepal Medical Council Licensing Examination Benchmark
                            </span>
                            <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                Examination Session Completed
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                                Standard Passing Mark: 50% ({Math.ceil(totalQuestionsOverall * 0.5)} /{' '}
                                {totalQuestionsOverall} correct)
                            </p>
                        </div>

                        {/* Circular Score Display */}
                        <div className="my-8 flex flex-col items-center justify-center">
                            <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border-4 border-cyan-500/30 bg-cyan-500/5 shadow-inner">
                                <span className="font-mono text-4xl font-black text-foreground">
                                    {totalScoreAchieved}
                                </span>
                                <span className="font-mono text-xs font-medium text-muted-foreground">
                                    / {totalQuestionsOverall}
                                </span>
                            </div>

                            <div
                                className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-sm font-bold shadow-xs ${
                                    hasPassed
                                        ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                        : 'border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                }`}
                            >
                                {hasPassed ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>PASSED ({finalPercentage}%)</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4" />
                                        <span>FAILED ({finalPercentage}% - Pass mark is 50%)</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Breakdown Table */}
                        <div className="overflow-hidden rounded-2xl border border-border">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">Clinical Station</th>
                                        <th className="px-4 py-3">Discipline</th>
                                        <th className="px-4 py-3">Score</th>
                                        <th className="px-4 py-3">Outcome</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {scenarios.map((st, i) => {
                                        const score = stationScores[i] ?? 0;
                                        const isProficient = score >= 3;
                                        return (
                                            <tr key={st.id || i} className="hover:bg-muted/20">
                                                <td className="px-4 py-3 font-semibold text-foreground">
                                                    Station {i + 1}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{st.discipline}</td>
                                                <td className="px-4 py-3 font-mono font-bold text-foreground">
                                                    {score} / {st.questions.length}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                                                            isProficient
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                        }`}
                                                    >
                                                        {isProficient ? 'Proficient' : 'Needs Review'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                                className="gap-2 rounded-xl text-xs font-semibold"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Retake Examination
                            </Button>
                            <Link href="/csq">
                                <Button className="w-full gap-2 rounded-xl bg-cyan-600 text-xs font-semibold text-white hover:bg-cyan-700 sm:w-auto dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400">
                                    Return to CSQ Hub
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
