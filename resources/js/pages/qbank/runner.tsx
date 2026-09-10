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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
}

export default function MCQRunner({ user, session, questions: rawQuestions, attempts = [] }: RunnerProps) {
    const questions: QuestionData[] = Array.isArray(rawQuestions)
        ? rawQuestions
        : (rawQuestions as any)?.data || [];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [initialOption, setInitialOption] = useState<string | null>(null);
    const [wasSwitched, setWasSwitched] = useState(false);
    const [confidence, setConfidence] = useState<ConfidenceType>('HIGH');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Load any existing attempt for the active question
    useEffect(() => {
        if (!currentQuestion) return;

        setVisitedQuestions((prev) => new Set(prev).add(currentQuestion.id));

        const existingResult = results[currentQuestion.id];
        if (existingResult) {
            setSelectedOption(existingResult.selected);
            setIsSubmitted(true);
        } else if (answers[currentQuestion.id]) {
            setSelectedOption(answers[currentQuestion.id]);
            setIsSubmitted(false);
        } else {
            setSelectedOption(null);
            setInitialOption(null);
            setWasSwitched(false);
            setIsSubmitted(false);
        }
    }, [currentIndex, currentQuestion?.id]);

    // Track active question timer
    useEffect(() => {
        if (isSubmitted) return;
        const interval = setInterval(() => {
            setSecondsElapsed((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isSubmitted, currentIndex]);

    // Handle Option Selection
    const handleSelectOption = (key: string) => {
        if (isSubmitted) return;

        if (selectedOption && selectedOption !== key) {
            setWasSwitched(true);
            if (!initialOption) {
                setInitialOption(selectedOption);
            }
        }
        setSelectedOption(key);
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: key }));
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

    // Submit Answer
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
                const data = await res.json();
                setIsSubmitted(true);
                setResults((prev) => ({
                    ...prev,
                    [currentQuestion.id]: { isCorrect, selected: selectedOption },
                }));

                if (isCorrect) {
                    toast.success('Correct Answer!', {
                        description: `Confidence: ${confidence} • Added to SM-2 Spaced Repetition Queue`,
                    });
                } else {
                    toast.error('Incorrect Choice', {
                        description: `Correct was Option ${currentQuestion.correct_option}. Reset to Stage 0 (Due in 4h).`,
                    });
                }
            }
        } catch (err) {
            // Local fallback
            setIsSubmitted(true);
            setResults((prev) => ({
                ...prev,
                [currentQuestion.id]: { isCorrect, selected: selectedOption },
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Keyboard Shortcuts (A, B, C, D, 1-4, Enter, M, Arrows)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showNoteModal) return; // Don't trigger when typing note

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
                if (!isSubmitted) {
                    handleSubmitAnswer();
                } else if (currentIndex < questions.length - 1) {
                    setCurrentIndex((prev) => prev + 1);
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
    }, [isSubmitted, selectedOption, currentIndex, questions.length, showNoteModal]);

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
                <h2 className="text-xl font-bold">No Questions Found</h2>
                <p className="text-sm text-muted-foreground mt-2">
                    Please return to Q-Bank builder to configure questions.
                </p>
                <Link href="/qbank" className="mt-4">
                    <Button>Go to Q-Bank Builder</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-3 sm:p-5 lg:p-6 w-full min-h-[90vh]">
            <Head title={`MCQ Runner — ${currentQuestion.code}`} />

            {/* Runner Top Navigation Bar */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="rounded bg-[#102A43] px-2.5 py-1 text-xs font-mono font-bold text-[#55BDEB]">
                        {currentQuestion.code}
                    </span>
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
                </div>
            </div>

            {/* Split-Screen Clinical Layout: Stem & Images (Left) | Options & Rationale (Right) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
                {/* LEFT COLUMN: Clinical Vignette & Image Viewer */}
                <div className="flex flex-col gap-4 lg:col-span-7">
                    {/* Clinical Vignette Stem */}
                    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#55BDEB]">
                                Clinical Vignette
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                                Keyboard: A/B/C/D or 1/2/3/4 • Enter: Submit
                            </span>
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed text-foreground font-normal whitespace-pre-line">
                            {currentQuestion.stem}
                        </p>
                    </div>

                    {/* High-Fidelity DICOM/Clinical Image Viewer (If Present) */}
                    {currentQuestion.image_url && (
                        <ClinicalImageViewer
                            imageUrl={currentQuestion.image_url}
                            caption={currentQuestion.image_caption}
                            watermark={currentQuestion.watermark}
                        />
                    )}

                    {/* Action Tray: Bookmark, Note, Flashcard */}
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

                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground hidden sm:inline">
                                Spaced Repetition: SM-2 Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Options Palette, Confidence Rating, and 3-Tier Rationale */}
                <div className="flex flex-col gap-4 lg:col-span-5">
                    {/* Pre-Submission Confidence Rating */}
                    {!isSubmitted && (
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
                            {isSubmitted && (
                                <span className="text-xs font-bold text-[#2FB36F]">
                                    Correct: Option {currentQuestion.correct_option}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            {currentQuestion.options.map((opt) => {
                                const isSelected = selectedOption === opt.option_key;
                                const isCorrect = opt.option_key.toUpperCase() === currentQuestion.correct_option.toUpperCase();

                                let optionStyle = 'border-border bg-background hover:bg-muted/40 text-foreground';
                                let badgeStyle = 'bg-muted text-muted-foreground font-bold';

                                if (isSubmitted) {
                                    if (isCorrect) {
                                        optionStyle = 'border-[#2FB36F] bg-[#2FB36F]/15 text-[#1e7e4c] dark:text-[#2FB36F] font-semibold ring-1 ring-[#2FB36F]';
                                        badgeStyle = 'bg-[#2FB36F] text-white font-black shadow-xs';
                                    } else if (isSelected) {
                                        optionStyle = 'border-[#E05252] bg-[#E05252]/15 text-[#a82828] dark:text-[#E05252] font-semibold ring-1 ring-[#E05252]';
                                        badgeStyle = 'bg-[#E05252] text-white font-black shadow-xs';
                                    } else {
                                        optionStyle = 'border-border/60 opacity-60 text-muted-foreground';
                                        badgeStyle = 'bg-muted text-muted-foreground font-semibold';
                                    }
                                } else if (isSelected) {
                                    optionStyle = 'border-[#0066FF] dark:border-[#55BDEB] bg-[#EBF5FC] dark:bg-sky-950/40 text-[#0A1E34] dark:text-slate-100 ring-1.5 ring-[#0066FF] dark:ring-[#55BDEB] font-semibold shadow-xs';
                                    badgeStyle = 'bg-[#0066FF] dark:bg-[#55BDEB] text-white dark:text-neutral-950 font-black shadow-xs';
                                }

                                return (
                                    <button
                                        key={opt.id || opt.option_key}
                                        type="button"
                                        disabled={isSubmitted}
                                        onClick={() => handleSelectOption(opt.option_key)}
                                        className={`flex items-start gap-3 rounded-xl border p-3.5 text-left text-xs transition-all cursor-pointer ${optionStyle}`}
                                    >
                                        <span
                                            className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs ${badgeStyle}`}
                                        >
                                            {opt.option_key}
                                        </span>
                                        <span className="flex-1 leading-relaxed">{opt.option_text}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Submit Button */}
                        {!isSubmitted ? (
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

                    {/* Immediate Post-Answer 3-Tier Clinical Breakdown */}
                    {isSubmitted && (
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
