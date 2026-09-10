import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    SlidersHorizontal,
    PlaySquare,
    Check,
    Filter,
    Layers,
    BookOpen,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopicData {
    id: number;
    name: string;
    slug: string;
    high_yield_priority: number;
}

interface SubjectData {
    id: number;
    name: string;
    slug: string;
    icon_key: string;
    order_index: number;
    topics: TopicData[];
}

interface QBankIndexProps {
    user: any;
    subjects: SubjectData[];
    activePathway: string;
    totalQuestions: number;
}

export default function QBankIndex({ user, subjects, activePathway, totalQuestions }: QBankIndexProps) {
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
    const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
    const [difficulty, setDifficulty] = useState<string>('ALL');
    const [statusMode, setStatusMode] = useState<string>('ALL');
    const [questionCount, setQuestionCount] = useState<number>(10);

    const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

    const handleLaunch = () => {
        const params = new URLSearchParams();
        if (selectedSubjectId) params.append('subject_id', selectedSubjectId.toString());
        if (selectedTopicId) params.append('topic_id', selectedTopicId.toString());
        if (difficulty !== 'ALL') params.append('difficulty', difficulty);
        if (statusMode !== 'ALL') params.append('status', statusMode);
        params.append('limit', questionCount.toString());

        router.visit(`/qbank/runner?${params.toString()}`);
    };

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full">
            <Head title="Custom Test Builder — Cortex Q-Bank" />

            {/* Header */}
            <div className="flex flex-col gap-1 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                    <span className="rounded bg-[#55BDEB]/15 px-2.5 py-0.5 text-xs font-bold text-[#55BDEB]">
                        Active Pathway: {activePathway}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        Total Questions in Pool: {totalQuestions}
                    </span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    Custom Test Builder
                </h1>
                <p className="text-xs text-muted-foreground max-w-2xl">
                    Build targeted clinical practice blocks customized by subject, high-yield topics, question difficulty, and prior attempt status.
                </p>
            </div>

            {/* Step 1: Select Subject */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#102A43] dark:bg-[#55BDEB] text-xs font-bold text-white dark:text-neutral-950">
                            1
                        </span>
                        <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                            Select Medical Subject
                        </h3>
                    </div>
                    {selectedSubjectId && (
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedSubjectId(null);
                                setSelectedTopicId(null);
                            }}
                            className="text-xs text-[#55BDEB] hover:underline"
                        >
                            Select All (Integrated)
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedSubjectId(null);
                            setSelectedTopicId(null);
                        }}
                        className={`flex items-center justify-between rounded-xl border p-3 text-left text-xs transition-all cursor-pointer ${
                            selectedSubjectId === null
                                ? 'border-[#55BDEB] bg-[#55BDEB]/15 text-foreground font-bold ring-1 ring-[#55BDEB]'
                                : 'border-border bg-background hover:bg-muted/40 text-muted-foreground'
                        }`}
                    >
                        <span>All 19 Subjects</span>
                        {selectedSubjectId === null && <Check className="size-4 text-[#55BDEB]" />}
                    </button>

                    {subjects.map((s) => {
                        const isSelected = selectedSubjectId === s.id;
                        return (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                    setSelectedSubjectId(s.id);
                                    setSelectedTopicId(null);
                                }}
                                className={`flex items-center justify-between rounded-xl border p-3 text-left text-xs transition-all cursor-pointer truncate ${
                                    isSelected
                                        ? 'border-[#55BDEB] bg-[#55BDEB]/15 text-foreground font-bold ring-1 ring-[#55BDEB]'
                                        : 'border-border bg-background hover:bg-muted/40 text-muted-foreground'
                                }`}
                            >
                                <span className="truncate">{s.name}</span>
                                {isSelected && <Check className="size-4 text-[#55BDEB] shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Step 2: Topics (If Subject Selected) */}
            {selectedSubject && selectedSubject.topics?.length > 0 && (
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#102A43] dark:bg-[#55BDEB] text-xs font-bold text-white dark:text-neutral-950">
                            2
                        </span>
                        <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                            Select Topic in {selectedSubject.name}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => setSelectedTopicId(null)}
                            className={`flex items-center justify-between rounded-xl border p-3 text-left text-xs transition-all cursor-pointer ${
                                selectedTopicId === null
                                    ? 'border-[#55BDEB] bg-[#55BDEB]/15 text-foreground font-bold ring-1 ring-[#55BDEB]'
                                    : 'border-border bg-background hover:bg-muted/40 text-muted-foreground'
                            }`}
                        >
                            <span>All Topics in {selectedSubject.name}</span>
                            {selectedTopicId === null && <Check className="size-4 text-[#55BDEB]" />}
                        </button>

                        {selectedSubject.topics.map((t) => {
                            const isSelected = selectedTopicId === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setSelectedTopicId(t.id)}
                                    className={`flex items-center justify-between rounded-xl border p-3 text-left text-xs transition-all cursor-pointer ${
                                        isSelected
                                            ? 'border-[#55BDEB] bg-[#55BDEB]/15 text-foreground font-bold ring-1 ring-[#55BDEB]'
                                            : 'border-border bg-background hover:bg-muted/40 text-muted-foreground'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{t.name}</span>
                                        {t.high_yield_priority >= 3 && (
                                            <span className="rounded bg-amber-500/15 px-1.5 py-0.2 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                                High Yield
                                            </span>
                                        )}
                                    </div>
                                    {isSelected && <Check className="size-4 text-[#55BDEB] shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Step 3: Difficulty & Status Filters */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Difficulty */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Difficulty Level
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                        {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((lvl) => (
                            <button
                                key={lvl}
                                type="button"
                                onClick={() => setDifficulty(lvl)}
                                className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-all cursor-pointer ${
                                    difficulty === lvl
                                        ? 'border-[#55BDEB] bg-[#55BDEB]/15 text-[#55BDEB] ring-1 ring-[#55BDEB]'
                                        : 'border-border bg-background hover:bg-muted/40 text-muted-foreground'
                                }`}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question Status Mode */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Question Status Filter
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { id: 'ALL', label: 'All' },
                            { id: 'UNUSED', label: 'Unused' },
                            { id: 'INCORRECT', label: 'Incorrect' },
                            { id: 'BOOKMARKED', label: 'Saved' },
                        ].map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => setStatusMode(m.id)}
                                className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-all cursor-pointer ${
                                    statusMode === m.id
                                        ? 'border-[#55BDEB] bg-[#55BDEB]/15 text-[#55BDEB] ring-1 ring-[#55BDEB]'
                                        : 'border-border bg-background hover:bg-muted/40 text-muted-foreground'
                                }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Step 4: Block Size & Launch */}
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Block Question Count: <span className="text-[#55BDEB] font-extrabold">{questionCount} Qs</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                        Est. Time: ~{questionCount * 1.5} minutes (with 3-tier review)
                    </span>
                </div>
                <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer accent-[#55BDEB]"
                />

                <Button
                    onClick={handleLaunch}
                    className="mt-2 h-12 w-full bg-[#102A43] dark:bg-[#55BDEB] text-white dark:text-neutral-950 font-bold hover:opacity-90 shadow-md gap-2 text-sm"
                >
                    <PlaySquare className="size-5" />
                    Launch Practice Block ({questionCount} Questions)
                </Button>
            </div>
        </div>
    );
}
