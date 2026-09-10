import React, { useState, useEffect, useCallback } from 'react';
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
    ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClinicalImageViewer } from '@/components/cortex/clinical-image-viewer';
import { QuestionPalette } from '@/components/cortex/question-palette';
import { toast } from 'sonner';

interface QuestionOptionData {
    id: string;
    option_key: string;
    option_text: string;
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
    watermark?: any;
}

interface MockHallProps {
    user: any;
    session: any;
    questions: { data: QuestionData[] } | QuestionData[];
    attempts?: any[];
}

export default function MockExamHall({ user, session, questions: rawQuestions, attempts = [] }: MockHallProps) {
    const questions: QuestionData[] = Array.isArray(rawQuestions)
        ? rawQuestions
        : (rawQuestions as any)?.data || [];

    const sessionId = session.id || session.data?.id;
    const initialDuration = session.duration_seconds || session.data?.duration_seconds || 45 * 60;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());
    const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set([questions[0]?.id]));

    // Timers
    const [secondsRemaining, setSecondsRemaining] = useState(initialDuration);
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Proctoring & Blur Violation Tracking
    const [blurViolations, setBlurViolations] = useState(0);
    const [showBlurWarning, setShowBlurWarning] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentQuestion = questions[currentIndex];

    // Load any existing attempts into state
    useEffect(() => {
        if (attempts && attempts.length > 0) {
            const mappedAnswers: Record<string, string> = {};
            attempts.forEach((att: any) => {
                if (att.question_id && att.selected_option) {
                    mappedAnswers[att.question_id] = att.selected_option;
                }
            });
            setAnswers(mappedAnswers);
        }
    }, []);

    // Track visited question
    useEffect(() => {
        if (currentQuestion?.id) {
            setVisitedQuestions((prev) => new Set(prev).add(currentQuestion.id));
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
                toast.error('Proctoring Alert: Tab switch / Window blur detected!', {
                    description: `Security violation logged (${updated} incidents). Continuous violations invalidate score.`,
                });
                return updated;
            });
        };

        window.addEventListener('blur', handleWindowBlur);
        return () => window.removeEventListener('blur', handleWindowBlur);
    }, []);

    // Toggle Fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
        }
    };

    // Handle Option Selection
    const handleSelectOption = (key: string) => {
        if (!currentQuestion) return;

        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: key }));

        // Optimistically record attempt to API
        fetch(`/api/v1/test-sessions/${sessionId}/attempts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
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
            const res = await fetch(`/api/v1/test-sessions/${sessionId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    time_spent_seconds: secondsElapsed,
                }),
            });

            if (res.ok) {
                if (document.fullscreenElement) {
                    await document.exitFullscreen().catch(() => {});
                }
                router.visit(`/mock-exam/${sessionId}/result`);
            }
        } catch (e) {
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
        return <div className="p-10 text-center">Loading Examination Vignette...</div>;
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground select-none">
            <Head title="Grand Mock Exam Hall — Active Timed Mode" />

            {/* Top Bar: Exam Info, Blur Warning, Countdown Timer, and Actions */}
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <span className="rounded bg-[#102A43] px-2.5 py-1 text-xs font-mono font-bold text-[#55BDEB]">
                        GRAND MOCK MODE
                    </span>
                    <span className="text-xs font-semibold text-foreground hidden sm:inline">
                        Question {currentIndex + 1} of {questions.length}
                    </span>
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

                {/* Right: Fullscreen Toggle & Submit */}
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="h-8 w-8 p-0"
                        title="Toggle Fullscreen Mode"
                    >
                        {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        onClick={() => setShowConfirmSubmit(true)}
                        className="bg-[#E05252] text-white font-bold hover:bg-[#E05252]/90 text-xs h-8"
                    >
                        Finish Exam
                    </Button>
                </div>
            </header>

            {/* Main Hall Layout */}
            <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 w-full lg:grid lg:grid-cols-12 items-start">
                {/* Left Area: Clinical Stem & Media */}
                <div className="flex flex-col gap-4 lg:col-span-8">
                    {/* Clinical Vignette (Anti-scraping user-select disabled) */}
                    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <span className="font-mono text-xs font-bold text-[#55BDEB]">
                                {currentQuestion.code}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                High-Stakes Simulation
                            </span>
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-line select-none">
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
                    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                            Select Single Best Answer
                        </span>

                        <div className="flex flex-col gap-2.5">
                            {currentQuestion.options.map((opt) => {
                                const isSelected = answers[currentQuestion.id] === opt.option_key;

                                return (
                                    <button
                                        key={opt.id || opt.option_key}
                                        type="button"
                                        onClick={() => handleSelectOption(opt.option_key)}
                                        className={`flex items-start gap-3 rounded-xl border p-3.5 text-left text-xs transition-all cursor-pointer ${
                                            isSelected
                                                ? 'border-[#0066FF] dark:border-[#55BDEB] bg-[#EBF5FC] dark:bg-sky-950/40 text-[#0A1E34] dark:text-slate-100 font-semibold ring-1.5 ring-[#0066FF] dark:ring-[#55BDEB] shadow-xs'
                                                : 'border-border bg-background hover:bg-muted/40 text-foreground'
                                        }`}
                                    >
                                        <span
                                            className={`flex size-6 shrink-0 items-center justify-center rounded-md font-black text-xs ${
                                                isSelected
                                                    ? 'bg-[#0066FF] dark:bg-[#55BDEB] text-white dark:text-neutral-950 shadow-xs'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {opt.option_key}
                                        </span>
                                        <span className="flex-1 leading-relaxed">{opt.option_text}</span>
                                    </button>
                                );
                            })}
                        </div>
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
                            {markedQuestions.has(currentQuestion.id) ? 'Marked for Review' : 'Mark for Review'}
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            disabled={currentIndex === questions.length - 1}
                            onClick={() => setCurrentIndex((prev) => prev + 1)}
                            className="gap-1 bg-[#102A43] dark:bg-[#55BDEB] text-white dark:text-neutral-950 font-bold text-xs"
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
                    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-xs">
                        <span className="font-bold text-foreground">Examination Progress</span>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Answered:</span>
                            <span className="font-bold text-[#2FB36F]">
                                {Object.keys(answers).length} / {questions.length}
                            </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Marked for Review:</span>
                            <span className="font-bold text-indigo-500">{markedQuestions.size}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
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
                    <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-xl">
                        <h3 className="font-bold text-base text-foreground">
                            Ready to Submit Grand Mock?
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            You have answered <span className="font-bold text-foreground">{Object.keys(answers).length}</span> out of <span className="font-bold text-foreground">{questions.length}</span> questions. Once submitted, your answers will be graded by the Marking Engine and negative marking will be computed.
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
                                className="bg-[#E05252] text-white font-bold"
                            >
                                {isSubmitting ? 'Grading...' : 'Yes, Submit & Grade'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
