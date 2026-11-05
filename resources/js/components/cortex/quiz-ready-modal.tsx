import React from 'react';
import { X, FileText, Sparkles, Pause, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

export interface QuizReadyModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectName: string;
    topicName?: string;
    topicsCount?: number;
    questionsCount?: number;
    subjectId?: number | string;
    topicId?: number | string;
    selectedTopicIds?: (number | string)[];
    onEdit?: () => void;
    onStartQuiz?: () => void;
}

export function QuizReadyModal({
    isOpen,
    onClose,
    subjectName,
    topicName,
    topicsCount = 1,
    questionsCount = 40,
    subjectId,
    topicId,
    selectedTopicIds,
    onEdit,
    onStartQuiz,
}: QuizReadyModalProps) {
    if (!isOpen) return null;

    const handleStart = () => {
        if (onStartQuiz) {
            onStartQuiz();
            return;
        }

        // Default navigation to /qbank/runner
        let url = `/qbank/runner?limit=${questionsCount > 0 ? Math.min(questionsCount, 40) : 10}`;
        if (subjectId) url += `&subject_id=${subjectId}`;
        if (topicId) url += `&topic_id=${topicId}`;
        router.visit(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
            {/* Modal Dialog container */}
            <div
                className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-card max-h-[92vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Pull handle on mobile */}
                <div className="mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full bg-slate-300 sm:hidden dark:bg-slate-700" />

                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    aria-label="Close dialog"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Header */}
                <div className="text-center pt-2 pb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-[#0066FF] sm:text-[26px]">
                        Your Quiz is Ready
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Questions difficulty adapts to your answers. So you learn optimally.
                    </p>
                </div>

                {/* Quiz Metadata Breakdown Table */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                    <div className="flex items-center justify-between py-3">
                        <span className="font-bold text-slate-900 dark:text-slate-100">Questions</span>
                        <span className="font-medium text-slate-600 dark:text-slate-300">{questionsCount}</span>
                    </div>

                    <div className="flex items-center justify-between py-3">
                        <span className="font-bold text-slate-900 dark:text-slate-100">Mode</span>
                        <span className="font-medium text-slate-600 dark:text-slate-300">Practice</span>
                    </div>

                    <div className="flex items-center justify-between py-3">
                        <span className="font-bold text-slate-900 dark:text-slate-100">Subject</span>
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                            {subjectName} {topicName ? `· ${topicName}` : `· ${topicsCount} Topic${topicsCount > 1 ? 's' : ''}`}
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-3">
                        <span className="font-bold text-slate-900 dark:text-slate-100">Tags</span>
                        <span className="font-medium text-slate-600 dark:text-slate-300">#USMLE - Step 1</span>
                    </div>
                </div>

                {/* Features Highlights Box */}
                <div className="mt-6 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-muted/40">
                    <div className="grid grid-cols-3 gap-3 text-center">
                        {/* Cortex AI Tutor */}
                        <div className="flex flex-col items-center">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
                                <FileText className="h-5 w-5" />
                            </div>
                            <span className="mt-2 text-[11px] font-semibold leading-tight text-slate-700 dark:text-slate-300">
                                Discuss answers with Cortex AI
                            </span>
                        </div>

                        {/* AI Weak-Spot */}
                        <div className="flex flex-col items-center">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-500 dark:bg-rose-950/70 dark:text-rose-400">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <span className="mt-2 text-[11px] font-semibold leading-tight text-slate-700 dark:text-slate-300">
                                AI weak-spot analysis
                            </span>
                        </div>

                        {/* Pause & Resume */}
                        <div className="flex flex-col items-center">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400">
                                <Pause className="h-5 w-5 fill-amber-500/40" />
                            </div>
                            <span className="mt-2 text-[11px] font-semibold leading-tight text-slate-700 dark:text-slate-300">
                                Pause & Resume
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-7 flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onEdit}
                        className="h-12 w-28 rounded-xl border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        Edit
                    </Button>
                    <Button
                        type="button"
                        onClick={handleStart}
                        className="h-12 flex-1 rounded-xl bg-[#0066FF] text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 hover:bg-blue-600 active:scale-[0.99] transition-all"
                    >
                        Start Quiz
                    </Button>
                </div>
            </div>
        </div>
    );
}
