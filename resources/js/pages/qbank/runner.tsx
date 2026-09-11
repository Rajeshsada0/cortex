import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Bookmark,
    FileText,
    Flag,
    Zap,
    RotateCcw,
    CheckCircle2,
    XCircle,
    HelpCircle,
    Layers,
    Share2,
    Clock,
    Eye,
    Strikethrough,
    Award,
    Check,
    ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClinicalImageViewer } from '@/components/cortex/clinical-image-viewer';
import { ConfidenceSelector, ConfidenceType } from '@/components/cortex/confidence-selector';
import { TierBreakdown } from '@/components/cortex/tier-breakdown';
import { OptionRationaleTable } from '@/components/cortex/option-rationale-table';
import { QuestionPalette } from '@/components/cortex/question-palette';
import { toast } from 'sonner';

interface QuestionOptionData {
    id: string;
    option_key: string;
    option_text: string;
    rationale: string;
}

interface QuestionData {
    id: string;
    code: string;
    subject: { id: number; name: string; slug: string };
    topic: { id: number; name: string; slug: string };
    subtopic?: { id: number; name: string } | null;
    difficulty: string;
    question_type: string;
    stem: string;
    image_url?: string | null;
    image_caption?: string | null;
    correct_option: string;
    learning_objective?: string;
    foundation_explanation?: string;
    integration_explanation?: string;
    application_explanation?: string;
    memory_peg?: string | null;
    options: QuestionOptionData[];
    watermark?: any;
}

interface RunnerProps {
    user: any;
    session: any;
    questions: { data: QuestionData[] } | QuestionData[];
    attempts?: any[];
    mode?: 'TUTOR' | 'TIMED';
}

export default function MCQRunner({
    user,
    session,
    questions: rawQuestions,
    attempts = [],
    mode: propMode,
}: RunnerProps) {
    const questions: QuestionData[] = Array.isArray(rawQuestions)
        ? rawQuestions
        : (rawQuestions as any)?.data || [];

    const activeMode: 'TUTOR' | 'TIMED' =
        propMode ||
        (session?.session_type === 'TIMED_BLOCK' || session?.data?.session_type === 'TIMED_BLOCK'
            ? 'TIMED'
            : 'TUTOR');

    const [isBlockFinished, setIsBlockFinished] = useState<boolean>(
        Boolean(session?.is_completed || session?.data?.is_completed)
    );

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [initialOption, setInitialOption] = useState<string | null>(null);
    const [wasSwitched, setWasSwitched] = useState(false);
    const [confidence, setConfidence] = useState<ConfidenceType>('HIGH');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Strikethrough eliminated distractors: maps questionId -> array of option keys
    const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, string[]>>({});

    // Session state
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [results, setResults] = useState<Record<string, { isCorrect: boolean; selected: string }>>({});
    const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());
    const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set([questions[0]?.id]));
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());

    // Personal Note modal
    const [noteContent, setNoteContent] = useState('');
    const [showNoteModal, setShowNoteModal] = useState(false);

    // Timer
    const [secondsElapsed, setSecondsElapsed] = useState(0);

    const currentQuestion = questions[currentIndex];

    // Load attempts initially
    useEffect(() => {
        if (attempts && attempts.length > 0) {
            const initialAnswers: Record<string, string> = {};
            const initialResults: Record<string, { isCorrect: boolean; selected: string }> = {};

            attempts.forEach((att: any) => {
                initialAnswers[att.question_id] = att.selected_option;
                initialResults[att.question_id] = {
                    isCorrect: att.is_correct,
                    selected: att.selected_option,
                };
            });

            setAnswers(initialAnswers);
            setResults(initialResults);
        }
    }, []);

    // Load any existing attempt for the active question
    useEffect(() => {
        if (!currentQuestion) return;

        setVisitedQuestions((prev) => new Set(prev).add(currentQuestion.id));

        const existingResult = results[currentQuestion.id];
        if (existingResult && (activeMode === 'TUTOR' || isBlockFinished)) {
            setSelectedOption(existingResult.selected);
            setIsSubmitted(true);
        } else if (answers[currentQuestion.id]) {
            setSelectedOption(answers[currentQuestion.id]);
            setIsSubmitted(isBlockFinished);
        } else {
            setSelectedOption(null);
            setInitialOption(null);
            setWasSwitched(false);
            setIsSubmitted(false);
        }
    }, [currentIndex, currentQuestion?.id, isBlockFinished, activeMode]);

    // Track active question timer
    useEffect(() => {
        if (isBlockFinished || (activeMode === 'TUTOR' && isSubmitted)) return;
        const interval = setInterval(() => {
            setSecondsElapsed((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isSubmitted, isBlockFinished, activeMode, currentIndex]);

    // Handle Option Selection
    const handleSelectOption = (key: string) => {
        if (isSubmitted || isBlockFinished) return;

        if (selectedOption && selectedOption !== key) {
            setWasSwitched(true);
            if (!initialOption) {
                setInitialOption(selectedOption);
            }
        }
        setSelectedOption(key);
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: key }));

        // In TIMED mode, silently persist candidate answer attempt
        if (activeMode === 'TIMED' && currentQuestion) {
            const isCorrect = key.toUpperCase() === currentQuestion.correct_option.toUpperCase();
            setResults((prev) => ({
                ...prev,
                [currentQuestion.id]: { isCorrect, selected: key },
            }));

            const sessId = session.id || session.data?.id;
            fetch(`/api/v1/test-sessions/${sessId}/attempts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    question_id: currentQuestion.id,
                    selected_option: key,
                    confidence: confidence,
                    time_taken_seconds: secondsElapsed,
                    was_switched: wasSwitched,
                    initial_option: initialOption,
                }),
            }).catch(() => {});
        }
    };

    // Toggle Strikethrough for a distractor option
    const toggleStrikethrough = (e: React.MouseEvent, optionKey: string) => {
        e.stopPropagation();
        if (!currentQuestion) return;

        setEliminatedOptions((prev) => {
            const currentList = prev[currentQuestion.id] || [];
            const updated = currentList.includes(optionKey)
                ? currentList.filter((k) => k !== optionKey)
                : [...currentList, optionKey];
            return { ...prev, [currentQuestion.id]: updated };
        });
    };

    // Toggle Mark for Review
    const toggleMark = useCallback(() => {
        if (!currentQuestion) return;
        setMarkedQuestions((prev) => {
            const next = new Set(prev);
            if (next.has(currentQuestion.id)) {
                next.delete(currentQuestion.id);
                toast.info('Removed mark for review');
            } else {
                next.add(currentQuestion.id);
                toast.success('Marked for review');
            }
            return next;
        });
    }, [currentQuestion?.id]);

    // Submit Answer (in Tutor Mode)
    const handleSubmitAnswer = async () => {
        if (!selectedOption || !currentQuestion || isSubmitted || isSubmitting) return;

        setIsSubmitting(true);
        const isCorrect = selectedOption.toUpperCase() === currentQuestion.correct_option.toUpperCase();

        try {
            const res = await fetch(`/api/v1/test-sessions/${session.id || session.data?.id}/attempts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    question_id: currentQuestion.id,
                    selected_option: selectedOption,
                    confidence: confidence,
                    time_taken_seconds: secondsElapsed,
                    was_switched: wasSwitched,
                    initial_option: initialOption,
                }),
            });

            if (res.ok) {
                setIsSubmitted(true);
                setResults((prev) => ({
                    ...prev,
                    [currentQuestion.id]: { isCorrect, selected: selectedOption },
                }));

                if (isCorrect) {
                    toast.success('Correct Answer!', {
                        description: `Confidence: ${confidence} • Synced to SM-2 Spaced Repetition Queue`,
                    });
                } else {
                    toast.error('Incorrect Choice', {
                        description: `Correct was Option ${currentQuestion.correct_option}. Scheduled for rapid review.`,
                    });
                }
            }
        } catch (err) {
            setIsSubmitted(true);
            setResults((prev) => ({
                ...prev,
                [currentQuestion.id]: { isCorrect, selected: selectedOption },
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Finish Block in Timed Mode
    const handleFinishTimedBlock = async () => {
        setIsSubmitting(true);
        const sessId = session.id || session.data?.id;

        try {
            await fetch(`/api/v1/test-sessions/${sessId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    time_spent_seconds: secondsElapsed,
                }),
            });
            setIsBlockFinished(true);
            setIsSubmitted(true);
            toast.success('Practice Block Submitted!', {
                description: 'Scorecard generated. Explanations unlocked for review.',
            });
        } catch (e) {
            setIsBlockFinished(true);
            setIsSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showNoteModal) return;

            const key = e.key.toUpperCase();
            if (['A', 'B', 'C', 'D'].includes(key)) {
                e.preventDefault();
                handleSelectOption(key);
            } else if (['1', '2', '3', '4'].includes(key)) {
                e.preventDefault();
                const map: Record<string, string> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
                handleSelectOption(map[key]);
            } else if (key === 'ENTER') {
                e.preventDefault();
                if (activeMode === 'TUTOR') {
                    if (!isSubmitted) {
                        handleSubmitAnswer();
                    } else if (currentIndex < questions.length - 1) {
                        setCurrentIndex((prev) => prev + 1);
                    }
                } else {
                    if (currentIndex < questions.length - 1) {
                        setCurrentIndex((prev) => prev + 1);
                    }
                }
            } else if (key === 'M') {
                e.preventDefault();
                toggleMark();
            } else if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                setCurrentIndex((prev) => prev - 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSubmitted, selectedOption, currentIndex, questions.length, showNoteModal, activeMode]);

    // Toggle Bookmark
    const toggleBookmark = async () => {
        if (!currentQuestion) return;
        try {
            await fetch('/api/v1/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ question_id: currentQuestion.id }),
            });

            setBookmarkedQuestions((prev) => {
                const next = new Set(prev);
                if (next.has(currentQuestion.id)) {
                    next.delete(currentQuestion.id);
                    toast.info('Bookmark removed');
                } else {
                    next.add(currentQuestion.id);
                    toast.success('Question added to Personal Library');
                }
                return next;
            });
        } catch (e) {
            toast.error('Could not toggle bookmark');
        }
    };

    // Save Note
    const saveNote = async () => {
        if (!currentQuestion) return;
        try {
            await fetch('/api/v1/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ question_id: currentQuestion.id, note_content: noteContent }),
            });
            toast.success('Clinical note saved');
            setShowNoteModal(false);
        } catch (e) {
            toast.error('Could not save note');
        }
    };

    if (!currentQuestion) {
        return (
            <div className="flex h-[70vh] flex-col items-center justify-center p-6 text-center">
                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm max-w-md">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                        <CheckCircle2 className="size-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">No Questions In This Queue</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        {session?.data?.title ?? 'This session'} currently has no questions matching the filter. Great work maintaining your clinical accuracy!
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <Link href="/dashboard">
                            <Button variant="outline">Dashboard</Button>
                        </Link>
                        <Link href="/qbank">
                            <Button>Go to Q-Bank Builder</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Score calculations when block is finished in Timed mode
    const totalAnswered = Object.keys(answers).length;
    const correctCount = Object.values(results).filter((r) => r.isCorrect).length;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

    const currentEliminations = eliminatedOptions[currentQuestion.id] || [];

    // Should we show explanations for this question?
    const showExplanation = activeMode === 'TUTOR' ? isSubmitted : isBlockFinished;

    return (
        <div className="flex flex-col gap-4 p-3 sm:p-5 lg:p-6 w-full min-h-[90vh]">
            <Head title={`MCQ Runner — ${currentQuestion.code}`} />

            {/* Runner Top Navigation Bar */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="rounded bg-[#102A43] px-2.5 py-1 text-xs font-mono font-bold text-[#55BDEB]">
                        {currentQuestion.code}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                        {activeMode === 'TIMED' ? 'Timed Exam Block' : 'Tutor Mode'}
                    </Badge>
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                        {currentQuestion.subject?.name} • {currentQuestion.topic?.name}
                    </span>
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                        {currentQuestion.difficulty}
                    </span>
                </div>

                {/* Right controls: Timer and Quick Navigation */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1 text-xs font-mono">
                        <Clock className="size-3.5 text-muted-foreground" />
                        <span>
                            {Math.floor(secondsElapsed / 60)}:
                            {(secondsElapsed % 60).toString().padStart(2, '0')}
                        </span>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={toggleMark}
                        className={`h-8 gap-1 text-xs ${
                            markedQuestions.has(currentQuestion.id)
                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                : ''
                        }`}
                        title="Keyboard Shortcut: M"
                    >
                        <Flag className="size-3.5" />
                        <span className="hidden sm:inline">
                            {markedQuestions.has(currentQuestion.id) ? 'Marked' : 'Mark (M)'}
                        </span>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentIndex === 0}
                        onClick={() => setCurrentIndex((prev) => prev - 1)}
                        className="h-8 w-8 p-0"
                        title="Previous Question (Left Arrow)"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    <span className="text-xs font-bold text-foreground">
                        {currentIndex + 1} / {questions.length}
                    </span>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentIndex === questions.length - 1}
                        onClick={() => setCurrentIndex((prev) => prev + 1)}
                        className="h-8 w-8 p-0"
                        title="Next Question (Right Arrow)"
                    >
                        <ChevronRight className="size-4" />
                    </Button>

                    {/* Finish Timed Block Button */}
                    {activeMode === 'TIMED' && !isBlockFinished && (
                        <Button
                            size="sm"
                            onClick={handleFinishTimedBlock}
                            disabled={isSubmitting}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-8 ml-2"
                        >
                            {isSubmitting ? 'Grading...' : 'Finish Block'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Timed Mode Scorecard Banner (When Finished) */}
            {activeMode === 'TIMED' && isBlockFinished && (
                <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md">
                            <Award className="size-7" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-foreground">
                                Block Complete — Scorecard: {correctCount} / {questions.length} ({accuracy}%)
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Completed in {Math.round(secondsElapsed / 60)} minutes • Explanations and multi-tier rationales now unlocked below.
                            </p>
                        </div>
                    </div>
                    <Link href="/qbank">
                        <Button variant="outline" size="sm" className="text-xs font-bold">
                            Back to Test Builder
                        </Button>
                    </Link>
                </div>
            )}

            {/* Split-Screen Clinical Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
                {/* LEFT COLUMN: Clinical Vignette & Image Viewer */}
                <div className="flex flex-col gap-4 lg:col-span-7">
                    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#55BDEB]">
                                Clinical Vignette
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                                Shortcuts: A/B/C/D or 1/2/3/4 • Arrow keys navigate
                            </span>
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed text-foreground font-normal whitespace-pre-line">
                            {currentQuestion.stem}
                        </p>
                    </div>

                    {/* Clinical Image Viewer */}
                    {currentQuestion.image_url && (
                        <ClinicalImageViewer
                            imageUrl={currentQuestion.image_url}
                            caption={currentQuestion.image_caption}
                            watermark={currentQuestion.watermark}
                        />
                    )}

                    {/* Action Tray: Bookmark, Note, Strikethrough Hint */}
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={toggleBookmark}
                                className={`h-8 gap-1.5 text-xs ${
                                    bookmarkedQuestions.has(currentQuestion.id)
                                        ? 'text-[#55BDEB]'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                <Bookmark className="size-3.5" />
                                {bookmarkedQuestions.has(currentQuestion.id) ? 'Bookmarked' : 'Bookmark'}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowNoteModal(true)}
                                className="h-8 gap-1.5 text-xs text-muted-foreground"
                            >
                                <FileText className="size-3.5" />
                                Clinical Note
                            </Button>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Strikethrough className="size-3.5 text-muted-foreground" />
                            <span>Click cross/icon to rule out distractors</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Options Palette, Confidence Rating, and 3-Tier Rationale */}
                <div className="flex flex-col gap-4 lg:col-span-5">
                    {/* Pre-Submission Confidence Rating in Tutor mode */}
                    {activeMode === 'TUTOR' && !isSubmitted && (
                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                            <ConfidenceSelector
                                value={confidence}
                                onChange={setConfidence}
                                disabled={isSubmitted}
                            />
                        </div>
                    )}

                    {/* Option Choices Selector */}
                    <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                                Answer Choices
                            </span>
                            {showExplanation && (
                                <span className="text-xs font-bold text-[#2FB36F]">
                                    Correct: Option {currentQuestion.correct_option}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            {currentQuestion.options.map((opt) => {
                                const isSelected = selectedOption === opt.option_key;
                                const isEliminated = currentEliminations.includes(opt.option_key);
                                const isCorrect =
                                    opt.option_key.toUpperCase() === currentQuestion.correct_option.toUpperCase();

                                let optionStyle = 'border-border bg-background hover:bg-muted/40 text-foreground';
                                let badgeStyle = 'bg-muted text-muted-foreground font-bold';

                                if (showExplanation) {
                                    if (isCorrect) {
                                        optionStyle =
                                            'border-[#2FB36F] bg-[#2FB36F]/15 text-[#1e7e4c] dark:text-[#2FB36F] font-semibold ring-1 ring-[#2FB36F]';
                                        badgeStyle = 'bg-[#2FB36F] text-white font-black shadow-xs';
                                    } else if (isSelected) {
                                        optionStyle =
                                            'border-[#E05252] bg-[#E05252]/15 text-[#a82828] dark:text-[#E05252] font-semibold ring-1 ring-[#E05252]';
                                        badgeStyle = 'bg-[#E05252] text-white font-black shadow-xs';
                                    } else {
                                        optionStyle = 'border-border/60 opacity-60 text-muted-foreground';
                                        badgeStyle = 'bg-muted text-muted-foreground font-semibold';
                                    }
                                } else if (isSelected) {
                                    optionStyle =
                                        'border-[#0066FF] dark:border-[#55BDEB] bg-[#EBF5FC] dark:bg-sky-950/40 text-[#0A1E34] dark:text-slate-100 ring-1.5 ring-[#0066FF] dark:ring-[#55BDEB] font-semibold shadow-xs';
                                    badgeStyle =
                                        'bg-[#0066FF] dark:bg-[#55BDEB] text-white dark:text-neutral-950 font-black shadow-xs';
                                } else if (isEliminated) {
                                    optionStyle =
                                        'border-border/40 bg-muted/20 text-muted-foreground opacity-45 line-through';
                                }

                                return (
                                    <div
                                        key={opt.id || opt.option_key}
                                        onClick={() => handleSelectOption(opt.option_key)}
                                        className={`group relative flex items-start gap-3 rounded-xl border p-3.5 text-left text-xs transition-all cursor-pointer ${optionStyle}`}
                                    >
                                        <span
                                            className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs ${badgeStyle}`}
                                        >
                                            {opt.option_key}
                                        </span>
                                        <span className={`flex-1 leading-relaxed ${isEliminated ? 'line-through' : ''}`}>
                                            {opt.option_text}
                                        </span>

                                        {/* Strikethrough action icon */}
                                        {!showExplanation && (
                                            <button
                                                type="button"
                                                onClick={(e) => toggleStrikethrough(e, opt.option_key)}
                                                className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted/80 text-muted-foreground ${
                                                    isEliminated ? '!opacity-100 text-rose-500 font-bold' : ''
                                                }`}
                                                title="Strike through this distractor"
                                            >
                                                <Strikethrough className="size-3.5" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Navigation / Action button based on mode */}
                        {activeMode === 'TUTOR' ? (
                            !isSubmitted ? (
                                <Button
                                    type="button"
                                    disabled={!selectedOption || isSubmitting}
                                    onClick={handleSubmitAnswer}
                                    className="mt-3 w-full bg-[#102A43] dark:bg-[#55BDEB] text-white dark:text-neutral-950 font-bold hover:opacity-90 h-10 shadow-sm"
                                >
                                    {isSubmitting ? 'Verifying...' : 'Submit Answer (Enter)'}
                                </Button>
                            ) : (
                                <div className="mt-3 flex gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (currentIndex < questions.length - 1) {
                                                setCurrentIndex((prev) => prev + 1);
                                            } else {
                                                toast.info('Completed all questions in this block!');
                                            }
                                        }}
                                        className="w-full bg-[#55BDEB] text-neutral-950 font-bold hover:bg-[#55BDEB]/90 h-10"
                                    >
                                        Next Question →
                                    </Button>
                                </div>
                            )
                        ) : (
                            <div className="mt-3 flex items-center justify-between gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={currentIndex === 0}
                                    onClick={() => setCurrentIndex((prev) => prev - 1)}
                                    className="w-1/2 text-xs font-bold"
                                >
                                    ← Previous
                                </Button>
                                {currentIndex < questions.length - 1 ? (
                                    <Button
                                        type="button"
                                        onClick={() => setCurrentIndex((prev) => prev + 1)}
                                        className="w-1/2 bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs"
                                    >
                                        Next Question →
                                    </Button>
                                ) : (
                                    !isBlockFinished && (
                                        <Button
                                            type="button"
                                            onClick={handleFinishTimedBlock}
                                            disabled={isSubmitting}
                                            className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                        >
                                            Submit Block
                                        </Button>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* Question Palette Widget */}
                    <QuestionPalette
                        questions={questions}
                        currentIndex={currentIndex}
                        answers={answers}
                        markedQuestions={markedQuestions}
                        visitedQuestions={visitedQuestions}
                        onSelectQuestion={setCurrentIndex}
                    />

                    {/* 3-Tier Clinical Breakdown & Rationale Table (Unlocked when submitted or review) */}
                    {showExplanation && (
                        <>
                            <TierBreakdown
                                learningObjective={currentQuestion.learning_objective}
                                foundationExplanation={currentQuestion.foundation_explanation}
                                integrationExplanation={currentQuestion.integration_explanation}
                                applicationExplanation={currentQuestion.application_explanation}
                                memoryPeg={currentQuestion.memory_peg}
                            />

                            <OptionRationaleTable
                                options={currentQuestion.options}
                                correctOption={currentQuestion.correct_option}
                                selectedOption={selectedOption}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Clinical Note Modal */}
            {showNoteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <h3 className="font-bold text-sm text-foreground">
                                Add Personal Clinical Note — {currentQuestion.code}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowNoteModal(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                ✕
                            </button>
                        </div>
                        <textarea
                            rows={5}
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Write your personal mnemonics, differential diagnoses, or clinical associations..."
                            className="w-full rounded-lg border border-border bg-background p-3 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#55BDEB]"
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowNoteModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button size="sm" onClick={saveNote} className="bg-[#55BDEB] text-neutral-950 font-bold">
                                Save Note
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
