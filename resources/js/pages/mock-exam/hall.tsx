import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Clock,
    AlertTriangle,
    Maximize2,
    Minimize2,
    Flag,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    CheckCircle2,
    XCircle,
    Lightbulb,
    BookOpen,
    ShieldAlert,
    ShieldCheck,
    WifiOff,
    Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClinicalImageViewer } from '@/components/cortex/clinical-image-viewer';
import { QuestionPalette } from '@/components/cortex/question-palette';
import { toast } from 'sonner';

interface QuestionOptionData {
    id: string;
    option_key: string;
    option_text: string;
    rationale?: string | null;
}

interface QuestionData {
    id: string;
    code: string;
    stem: string;
    image_url?: string | null;
    image_caption?: string | null;
    difficulty: string;
    subject?: { name: string };
    options: QuestionOptionData[];
    correct_option?: string;
    foundation_explanation?: string | null;
    learning_objective?: string | null;
    watermark?: any;
}

interface MockHallProps {
    user: any;
    session: any;
    questions: { data: QuestionData[] } | QuestionData[];
    attempts?: any[];
}

export default function MockExamHall({
    user,
    session,
    questions: rawQuestions,
    attempts = [],
}: MockHallProps) {
    const questions: QuestionData[] = Array.isArray(rawQuestions)
        ? rawQuestions
        : (rawQuestions as any)?.data || [];

    const sessionId = session.id || session.data?.id;
    const initialDuration =
        session.duration_seconds || session.data?.duration_seconds || 45 * 60;
    const storageKey = `cortex_mock_session_${sessionId}`;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(
        new Set(),
    );
    const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(
        new Set([questions[0]?.id].filter(Boolean)),
    );

    // Timers
    const [secondsRemaining, setSecondsRemaining] = useState(initialDuration);
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isOffline, setIsOffline] = useState(
        typeof navigator !== 'undefined' ? !navigator.onLine : false,
    );

    // Easy-PG style Immediate-Reveal Study Mode
    const [isStudyMode, setIsStudyMode] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('study_mode') === '1') return true;
            if (params.get('study_mode') === '0') return false;
        }
        return (
            (session.session_type || session.data?.session_type) === 'PRACTICE'
        );
    });

    // Proctoring & Blur Violation Tracking
    const [blurViolations, setBlurViolations] = useState(0);
    const [showBlurWarning, setShowBlurWarning] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentQuestion = questions[currentIndex];

    const sortedOptions = useMemo(() => {
        if (!currentQuestion?.options) return [];
        return [...currentQuestion.options].sort((a, b) =>
            (a.option_key || '').localeCompare(b.option_key || ''),
        );
    }, [currentQuestion]);

    // 1. Hydrate state from server attempts & local offline backup
    useEffect(() => {
        const mappedAnswers: Record<string, string> = {};

        // Seed from database attempts if available
        if (attempts && attempts.length > 0) {
            attempts.forEach((att: any) => {
                if (att.question_id && att.selected_option) {
                    mappedAnswers[att.question_id] = att.selected_option;
                }
            });
        }

        // Restore from client-side persistent storage
        try {
            const cached = localStorage.getItem(storageKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                let restoredCount = 0;

                if (parsed.answers && typeof parsed.answers === 'object') {
                    Object.assign(mappedAnswers, parsed.answers);
                    restoredCount = Object.keys(parsed.answers).length;
                }

                if (
                    Array.isArray(parsed.markedQuestions) &&
                    parsed.markedQuestions.length > 0
                ) {
                    setMarkedQuestions(new Set(parsed.markedQuestions));
                }

                if (
                    Array.isArray(parsed.visitedQuestions) &&
                    parsed.visitedQuestions.length > 0
                ) {
                    setVisitedQuestions(
                        new Set(
                            [
                                ...parsed.visitedQuestions,
                                questions[0]?.id,
                            ].filter(Boolean),
                        ),
                    );
                }

                if (
                    typeof parsed.currentIndex === 'number' &&
                    parsed.currentIndex >= 0 &&
                    parsed.currentIndex < questions.length
                ) {
                    setCurrentIndex(parsed.currentIndex);
                }

                if (
                    typeof parsed.secondsRemaining === 'number' &&
                    parsed.savedAt
                ) {
                    const drift = Math.max(
                        0,
                        Math.floor((Date.now() - parsed.savedAt) / 1000),
                    );
                    const adjustedRemaining = Math.max(
                        1,
                        parsed.secondsRemaining - drift,
                    );
                    const adjustedElapsed =
                        (parsed.secondsElapsed || 0) + drift;
                    setSecondsRemaining(adjustedRemaining);
                    setSecondsElapsed(adjustedElapsed);
                }

                if (
                    restoredCount > 0 ||
                    (parsed.markedQuestions &&
                        parsed.markedQuestions.length > 0)
                ) {
                    toast.success('Session Auto-Recovered', {
                        description: `Restored ${restoredCount} answered questions from crash-resilient local cache.`,
                    });
                }
            }
        } catch (e) {
            console.error('Storage recovery error', e);
        }

        setAnswers(mappedAnswers);
    }, [storageKey]);

    // 2. Auto-save session state to localStorage on updates
    useEffect(() => {
        if (!sessionId) return;
        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify({
                    sessionId,
                    answers,
                    markedQuestions: Array.from(markedQuestions),
                    visitedQuestions: Array.from(visitedQuestions),
                    secondsRemaining,
                    secondsElapsed,
                    currentIndex,
                    savedAt: Date.now(),
                }),
            );
        } catch (e) {
            // Storage quota full or disabled
        }
    }, [
        storageKey,
        sessionId,
        answers,
        markedQuestions,
        visitedQuestions,
        secondsRemaining,
        secondsElapsed,
        currentIndex,
    ]);

    // 3. Network status resilience listeners
    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            toast.success('Network Reconnected', {
                description:
                    'Examination connection re-established. Responses synced.',
            });
        };
        const handleOffline = () => {
            setIsOffline(true);
            toast.warning('Network Offline', {
                description:
                    'Local auto-save is protecting your responses. Do not refresh.',
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Track visited question
    useEffect(() => {
        if (currentQuestion?.id) {
            setVisitedQuestions((prev) =>
                new Set(prev).add(currentQuestion.id),
            );
        }
    }, [currentIndex, currentQuestion?.id]);

    // Live Authoritative Countdown Timer & Auto-Submit
    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsElapsed((prev: number) => prev + 1);
            setSecondsRemaining((prev: number) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleFinalSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Proctoring: Detect Window Blur / Tab Switching
    useEffect(() => {
        const handleWindowBlur = () => {
            setBlurViolations((prev: number) => {
                const updated = prev + 1;
                setShowBlurWarning(true);
                toast.error(
                    'Proctoring Alert: Tab switch / Window blur detected!',
                    {
                        description: `Security violation logged (${updated} incidents). Continuous violations invalidate score.`,
                    },
                );
                return updated;
            });
        };

        window.addEventListener('blur', handleWindowBlur);
        return () => window.removeEventListener('blur', handleWindowBlur);
    }, []);

    // Toggle Fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement
                .requestFullscreen()
                .then(() => setIsFullscreen(true))
                .catch(() => {});
        } else {
            document
                .exitFullscreen()
                .then(() => setIsFullscreen(false))
                .catch(() => {});
        }
    };

    // Handle Option Selection
    const handleSelectOption = (key: string) => {
        if (!currentQuestion) return;
        // In study mode, lock answer once selected (matching Easy-PG UX)
        if (isStudyMode && answers[currentQuestion.id] !== undefined) return;

        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: key }));

        // Optimistically record attempt to API
        fetch(`/api/v1/test-sessions/${sessionId}/attempts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                question_id: currentQuestion.id,
                selected_option: key,
                confidence: 'HIGH',
                time_taken_seconds: 30,
            }),
        }).catch(() => {});
    };

    // Toggle Mark for Review
    const toggleMark = useCallback(() => {
        if (!currentQuestion) return;
        setMarkedQuestions((prev) => {
            const next = new Set(prev);
            if (next.has(currentQuestion.id)) {
                next.delete(currentQuestion.id);
            } else {
                next.add(currentQuestion.id);
            }
            return next;
        });
    }, [currentQuestion?.id]);

    // Finalize and Submit Grand Mock
    const handleFinalSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const res = await fetch(
                `/api/v1/test-sessions/${sessionId}/submit`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        time_spent_seconds: secondsElapsed,
                    }),
                },
            );

            if (res.ok) {
                try {
                    localStorage.removeItem(storageKey);
                } catch (e) {}

                if (document.fullscreenElement) {
                    await document.exitFullscreen().catch(() => {});
                }
                router.visit(`/mock-exam/${sessionId}/result`);
            }
        } catch (e) {
            try {
                localStorage.removeItem(storageKey);
            } catch (err) {}
            router.visit(`/mock-exam/${sessionId}/result`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTimer = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (!currentQuestion) {
        return (
            <div className="p-10 text-center">
                Loading Examination Vignette...
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground flex min-h-screen flex-col select-none">
            <Head title="Grand Mock Exam Hall — Active Timed Mode" />

            {/* Top Bar: Exam Info, Blur Warning, Countdown Timer, and Actions */}
            <header className="border-border bg-card/95 sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <span className="rounded bg-[#102A43] px-2.5 py-1 font-mono text-xs font-bold text-[#55BDEB]">
                        GRAND MOCK MODE
                    </span>
                    <span className="text-foreground hidden text-xs font-semibold sm:inline">
                        Question {currentIndex + 1} of {questions.length}
                    </span>

                    {/* Auto-Save & Offline Status */}
                    {isOffline ? (
                        <span className="hidden items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 md:flex dark:text-amber-400">
                            <WifiOff className="size-3" />
                            Offline Mode (Local Cache Active)
                        </span>
                    ) : (
                        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 md:flex dark:text-emerald-400">
                            <ShieldCheck className="size-3 text-emerald-500" />
                            Auto-Save Protected
                        </span>
                    )}
                </div>

                {/* Center: Live Authoritative Countdown Timer */}
                <div className="flex items-center gap-2">
                    <div
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-mono text-sm font-extrabold ${
                            secondsRemaining < 300
                                ? 'animate-pulse bg-[#E05252] text-white'
                                : 'bg-[#102A43] text-[#55BDEB]'
                        }`}
                    >
                        <Clock className="size-4" />
                        <span>{formatTimer(secondsRemaining)}</span>
                    </div>

                    {blurViolations > 0 && (
                        <div className="flex items-center gap-1 rounded bg-[#E05252]/15 px-2 py-0.5 text-xs font-bold text-[#E05252]">
                            <ShieldAlert className="size-3.5" />
                            <span>{blurViolations} Violations</span>
                        </div>
                    )}
                </div>

                {/* Right: Study Mode Toggle, Fullscreen & Submit */}
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsStudyMode(!isStudyMode)}
                        className={`h-8 gap-1.5 text-xs font-bold ${
                            isStudyMode
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'text-muted-foreground'
                        }`}
                        title="Toggle Easy-PG style Instant Feedback Study Mode (reveal answer upon selection)"
                    >
                        <Lightbulb className="size-3.5" />
                        <span className="hidden sm:inline">
                            Study Mode:
                        </span>{' '}
                        {isStudyMode ? 'ON' : 'OFF'}
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="h-8 w-8 p-0"
                        title="Toggle Fullscreen Mode"
                    >
                        {isFullscreen ? (
                            <Minimize2 className="size-4" />
                        ) : (
                            <Maximize2 className="size-4" />
                        )}
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        onClick={() => setShowConfirmSubmit(true)}
                        className="h-8 bg-[#E05252] text-xs font-bold text-white hover:bg-[#E05252]/90"
                    >
                        Finish Exam
                    </Button>
                </div>
            </header>

            {/* Final 5-Minute Warning Banner */}
            {secondsRemaining <= 300 && secondsRemaining > 0 && (
                <div className="flex animate-pulse items-center justify-between border-b border-[#E05252]/30 bg-[#E05252]/15 px-4 py-2 text-xs font-bold text-[#E05252]">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>
                            FINAL 5-MINUTE WARNING: Exam will auto-submit at
                            00:00! Review your marked and unanswered questions
                            in the palette now.
                        </span>
                    </div>
                </div>
            )}

            {/* Main Hall Layout */}
            <main className="flex w-full flex-1 flex-col items-start gap-6 p-4 sm:p-6 lg:grid lg:grid-cols-12">
                {/* Left Area: Clinical Stem & Media */}
                <div className="flex flex-col gap-4 lg:col-span-8">
                    {/* Clinical Vignette (Anti-scraping user-select disabled) */}
                    <div className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-6 shadow-sm">
                        <div className="border-border flex items-center justify-between border-b pb-2">
                            <span className="font-mono text-xs font-bold text-[#55BDEB]">
                                {currentQuestion.code}
                            </span>
                            <span className="text-muted-foreground text-[10px] font-bold uppercase">
                                High-Stakes Simulation
                            </span>
                        </div>
                        <p className="text-foreground text-sm leading-relaxed whitespace-pre-line select-none sm:text-base">
                            {currentQuestion.stem}
                        </p>
                    </div>

                    {/* Image Viewer */}
                    {currentQuestion.image_url && (
                        <ClinicalImageViewer
                            imageUrl={currentQuestion.image_url}
                            caption={currentQuestion.image_caption}
                            watermark={currentQuestion.watermark}
                        />
                    )}

                    {/* Answer Choices */}
                    <div className="border-border bg-card flex flex-col gap-2 rounded-2xl border p-5 shadow-sm">
                        <div className="mb-1 flex items-center justify-between">
                            <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                                Select Single Best Answer
                            </span>
                            {isStudyMode && answers[currentQuestion.id] && (
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                    Instant Rationale Revealed
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-2.5">
                            {sortedOptions.map((opt) => {
                                const isSelected =
                                    answers[currentQuestion.id] ===
                                    opt.option_key;
                                const isRevealed =
                                    isStudyMode &&
                                    answers[currentQuestion.id] !== undefined;
                                const isCorrectOpt =
                                    currentQuestion.correct_option ===
                                    opt.option_key;

                                let optionStyle =
                                    'border-border bg-background hover:bg-muted/40 text-foreground cursor-pointer';
                                if (isRevealed) {
                                    if (isCorrectOpt) {
                                        optionStyle =
                                            'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500 shadow-sm cursor-default';
                                    } else if (isSelected) {
                                        optionStyle =
                                            'border-rose-500 bg-rose-50/90 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500 shadow-sm cursor-default';
                                    } else {
                                        optionStyle =
                                            'border-border/60 bg-muted/20 text-muted-foreground opacity-75 cursor-default';
                                    }
                                } else if (isSelected) {
                                    optionStyle =
                                        'border-[#0066FF] dark:border-[#55BDEB] bg-[#EBF5FC] dark:bg-sky-950/40 text-[#0A1E34] dark:text-slate-100 font-semibold ring-1.5 ring-[#0066FF] dark:ring-[#55BDEB] shadow-xs cursor-pointer';
                                }

                                return (
                                    <div
                                        key={opt.id || opt.option_key}
                                        onClick={() =>
                                            !isRevealed
                                                ? handleSelectOption(
                                                      opt.option_key,
                                                  )
                                                : null
                                        }
                                        className={`flex flex-col gap-1.5 rounded-xl border p-3.5 text-left text-xs transition-all ${optionStyle}`}
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-black ${
                                                        isRevealed
                                                            ? isCorrectOpt
                                                                ? 'bg-emerald-600 text-white'
                                                                : isSelected
                                                                  ? 'bg-rose-600 text-white'
                                                                  : 'bg-muted text-muted-foreground'
                                                            : isSelected
                                                              ? 'bg-[#0066FF] text-white'
                                                              : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {opt.option_key}
                                                </span>
                                                <span className="leading-relaxed font-medium">
                                                    {opt.option_text}
                                                </span>
                                            </div>

                                            {isRevealed && (
                                                <div className="ml-2 flex shrink-0 items-center gap-1.5 font-bold">
                                                    {isCorrectOpt && (
                                                        <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                                                            <CheckCircle2 className="size-4" />{' '}
                                                            (Key Answer)
                                                        </span>
                                                    )}
                                                    {isSelected &&
                                                        !isCorrectOpt && (
                                                            <span className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400">
                                                                <XCircle className="size-4" />{' '}
                                                                (Your Answer)
                                                            </span>
                                                        )}
                                                </div>
                                            )}
                                        </div>

                                        {isRevealed && opt.rationale && (
                                            <div className="mt-2 border-t border-current/10 pt-2 text-[11px] leading-relaxed font-normal text-slate-700 dark:text-slate-300">
                                                <strong className="font-semibold">
                                                    Distractor Analysis:
                                                </strong>{' '}
                                                {opt.rationale}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* High-Yield Learning Objective Card in Study Mode */}
                        {isStudyMode &&
                            answers[currentQuestion.id] &&
                            (currentQuestion.learning_objective ||
                                currentQuestion.foundation_explanation) && (
                                <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/80 p-4 text-xs dark:border-sky-800 dark:bg-sky-950/40">
                                    <div className="mb-1 flex items-center gap-1.5 font-bold text-[#0066FF] dark:text-sky-400">
                                        <Lightbulb className="size-4 text-[#0066FF] dark:text-sky-400" />
                                        Clinical Takeaway &amp; Learning
                                        Objective
                                    </div>
                                    <p className="leading-relaxed font-normal text-slate-700 dark:text-slate-300">
                                        {currentQuestion.learning_objective ||
                                            currentQuestion.foundation_explanation}
                                    </p>
                                </div>
                            )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex((prev) => prev - 1)}
                            className="gap-1 text-xs"
                        >
                            <ChevronLeft className="size-4" /> Previous
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={toggleMark}
                            className={`gap-1 text-xs ${
                                markedQuestions.has(currentQuestion.id)
                                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                    : ''
                            }`}
                        >
                            <Flag className="size-3.5" />
                            {markedQuestions.has(currentQuestion.id)
                                ? 'Marked for Review'
                                : 'Mark for Review'}
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            disabled={currentIndex === questions.length - 1}
                            onClick={() => setCurrentIndex((prev) => prev + 1)}
                            className="gap-1 bg-[#102A43] text-xs font-bold text-white dark:bg-[#55BDEB] dark:text-neutral-950"
                        >
                            Next <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>

                {/* Right Area: Question Palette Matrix */}
                <div className="flex flex-col gap-4 lg:col-span-4">
                    <QuestionPalette
                        questions={questions}
                        currentIndex={currentIndex}
                        answers={answers}
                        markedQuestions={markedQuestions}
                        visitedQuestions={visitedQuestions}
                        onSelectQuestion={setCurrentIndex}
                    />

                    {/* Summary Info Card */}
                    <div className="border-border bg-card flex flex-col gap-2 rounded-xl border p-4 text-xs">
                        <span className="text-foreground font-bold">
                            Examination Progress
                        </span>
                        <div className="text-muted-foreground flex justify-between">
                            <span>Answered:</span>
                            <span className="font-bold text-[#2FB36F]">
                                {Object.keys(answers).length} /{' '}
                                {questions.length}
                            </span>
                        </div>
                        <div className="text-muted-foreground flex justify-between">
                            <span>Marked for Review:</span>
                            <span className="font-bold text-indigo-500">
                                {markedQuestions.size}
                            </span>
                        </div>
                        <div className="text-muted-foreground flex justify-between">
                            <span>Unanswered:</span>
                            <span className="font-bold text-amber-500">
                                {questions.length - Object.keys(answers).length}
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Confirm Submission Modal */}
            {showConfirmSubmit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="border-border bg-card flex w-full max-w-md flex-col gap-4 rounded-2xl border p-6 shadow-xl">
                        <h3 className="text-foreground text-base font-bold">
                            Ready to Submit Grand Mock?
                        </h3>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                            You have answered{' '}
                            <span className="text-foreground font-bold">
                                {Object.keys(answers).length}
                            </span>{' '}
                            out of{' '}
                            <span className="text-foreground font-bold">
                                {questions.length}
                            </span>{' '}
                            questions. Once submitted, your answers will be
                            graded by the Marking Engine and negative marking
                            will be computed.
                        </p>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowConfirmSubmit(false)}
                            >
                                Continue Exam
                            </Button>
                            <Button
                                size="sm"
                                disabled={isSubmitting}
                                onClick={handleFinalSubmit}
                                className="bg-[#E05252] font-bold text-white"
                            >
                                {isSubmitting
                                    ? 'Grading...'
                                    : 'Yes, Submit & Grade'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
