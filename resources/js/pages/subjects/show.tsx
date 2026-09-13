import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowLeft,
    BookOpen,
    Layers,
    Play,
    Sparkles,
    Stethoscope,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLogo from '@/components/app-logo';
import { MedicalBackgroundElements } from '@/components/cortex/medical-background-elements';

interface TopicItem {
    id: string;
    name: string;
    slug?: string;
    questions_count: number;
}

interface SubjectDetailProps {
    subject: {
        id: string;
        name: string;
        slug: string;
        category?: string;
    };
    totalQuestions: number;
    topics: TopicItem[];
    currentUser: any;
}

export default function SubjectShow({
    subject,
    totalQuestions,
    topics,
    currentUser,
}: SubjectDetailProps) {
    const [selectedPathway, setSelectedPathway] = useState<string>('COMBINED');

    const handleStartFullSubject = () => {
        router.post('/practice/guest-launch', {
            subject_id: subject.id,
            pathway: selectedPathway,
            study_mode: '1',
            target_questions: 40,
        });
    };

    const handleStartTopicDrill = (topicId: string) => {
        router.post('/practice/guest-launch', {
            subject_id: subject.id,
            topic_id: topicId,
            pathway: selectedPathway,
            study_mode: '1',
            target_questions: 40,
        });
    };

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#FDFDFC] text-[#102A43] selection:bg-[#0066FF]/30 dark:bg-[#070e17] dark:text-neutral-100">
            <Head
                title={`${subject.name} MCQs & Topic Drills — Easy-PG Style | Cortex`}
            />

            <MedicalBackgroundElements />

            {/* Top Navigation */}
            <header className="border-border/70 bg-background/85 sticky top-0 z-50 border-b backdrop-blur-md transition-colors">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="group flex items-center gap-2">
                        <AppLogo />
                    </Link>

                    <nav className="hidden items-center gap-6 text-xs font-semibold md:flex">
                        <Link
                            href="/choose"
                            className="text-muted-foreground transition-colors hover:text-[#0066FF]"
                        >
                            Exam Tracks
                        </Link>
                        <Link
                            href="/subjects"
                            className="font-bold text-[#0066FF] transition-colors dark:text-sky-400"
                        >
                            Subjects
                        </Link>
                        <Link
                            href="/about-medai"
                            className="text-muted-foreground transition-colors hover:text-[#0066FF]"
                        >
                            About MedAI
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Link href="/demo-login">
                            <Button
                                size="sm"
                                variant="outline"
                                className="hidden border-[#0066FF]/40 bg-[#0066FF]/10 text-xs font-bold text-[#0066FF] shadow-sm transition-all hover:bg-[#0066FF]/20 sm:inline-flex dark:text-sky-400"
                            >
                                <Zap className="mr-1 size-3.5 animate-pulse text-[#0066FF]" />
                                1-Click Demo
                            </Button>
                        </Link>
                        {currentUser ? (
                            <Link href="/dashboard">
                                <Button
                                    size="sm"
                                    className="h-9 bg-[#102A43] text-xs font-bold text-white shadow-sm dark:bg-[#0066FF]"
                                >
                                    Dashboard →
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs font-semibold hover:text-[#0066FF]"
                                >
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href="/subjects"
                        className="inline-flex items-center text-xs font-bold text-slate-500 transition-colors hover:text-[#0066FF]"
                    >
                        <ArrowLeft className="mr-1.5 size-3.5" />
                        All Medical Specialties
                    </Link>
                </div>

                {/* Subject Header Banner */}
                <div className="dark:border-border/80 dark:bg-card mb-10 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-10">
                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-0.5 text-xs font-bold text-sky-800 dark:border-sky-800/80 dark:bg-sky-950/60 dark:text-sky-300">
                                <BookOpen className="size-3.5 text-sky-600 dark:text-sky-400" />
                                <span>
                                    SPECIALTY MCQ BANK · {totalQuestions}{' '}
                                    QUESTIONS
                                </span>
                            </div>
                            <h1 className="text-3xl font-black text-[#0A1E34] sm:text-4xl dark:text-white">
                                {subject.name} MCQ Practice
                            </h1>
                            <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
                                High-yield clinical vignettes covering core
                                pathologies, diagnostic algorithms, and
                                next-best-step management. Pick an exam style or
                                drill topic-by-topic.
                            </p>

                            {/* Exam Filter Chips */}
                            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
                                {[
                                    { key: 'COMBINED', label: 'All Exams' },
                                    {
                                        key: 'USMLE_STEP1',
                                        label: 'USMLE Step 1',
                                    },
                                    {
                                        key: 'USMLE_STEP2CK',
                                        label: 'USMLE Step 2 CK',
                                    },
                                    { key: 'NEET_PG', label: 'NEET-PG' },
                                    {
                                        key: 'MECEE_PG',
                                        label: 'CEE PG (Nepal)',
                                    },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() =>
                                            setSelectedPathway(tab.key)
                                        }
                                        className={`rounded-xl border px-3 py-1.5 text-xs transition-all ${
                                            selectedPathway === tab.key
                                                ? 'border-[#0066FF] bg-[#0066FF] text-white shadow-sm'
                                                : 'dark:border-border dark:bg-muted border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:text-slate-300'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 1-Click Launch full 40-Q set */}
                        <div className="flex shrink-0 flex-col gap-2">
                            <Button
                                onClick={handleStartFullSubject}
                                className="h-12 rounded-xl bg-[#0066FF] px-6 text-sm font-bold text-white shadow-md hover:bg-blue-700"
                            >
                                <Play className="mr-2 size-4 fill-white" />
                                Practice {subject.name} (40 MCQs)
                            </Button>
                            <span className="text-center text-[11px] font-medium text-slate-400">
                                Immediate reveal · No signup needed
                            </span>
                        </div>
                    </div>
                </div>

                {/* Topics Grid */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#0A1E34] dark:text-white">
                        Focused High-Yield Topics ({topics.length})
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Drill specific organ systems and clinical syndromes with
                        active recall.
                    </p>
                </div>

                <div className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {topics.map((topic) => (
                        <div
                            key={topic.id}
                            className="group dark:border-border/80 dark:bg-card flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-[#0066FF]/40 hover:shadow-md"
                        >
                            <div>
                                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                    Topic Drill
                                </span>
                                <h3 className="mt-0.5 text-base font-bold text-[#0A1E34] transition-colors group-hover:text-[#0066FF] dark:text-white">
                                    {topic.name}
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    {topic.questions_count > 0
                                        ? `${topic.questions_count} MCQs in database`
                                        : 'Curated clinical questions'}
                                </p>
                            </div>

                            <div className="dark:border-border mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    Free practice
                                </span>
                                <Button
                                    onClick={() =>
                                        handleStartTopicDrill(topic.id)
                                    }
                                    size="sm"
                                    variant="outline"
                                    className="h-8 border-[#0066FF]/30 text-xs font-bold text-[#0066FF] hover:bg-[#0066FF]/10"
                                >
                                    Practice Set
                                    <ArrowRight className="ml-1 size-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {topics.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
                        <p className="text-xs text-slate-500">
                            No individual topics listed under this subject yet.
                            You can still launch the full subject drill above.
                        </p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="dark:border-border dark:bg-card/40 mt-auto border-t border-slate-200 bg-slate-50/60 py-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
                    <div>
                        © {new Date().getFullYear()} Cortex Medical. MedAI
                        Practice Engine.
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/choose" className="hover:text-foreground">
                            Exam Tracks
                        </Link>
                        <Link
                            href="/subjects"
                            className="hover:text-foreground"
                        >
                            Subjects
                        </Link>
                        <Link
                            href="/about-medai"
                            className="hover:text-foreground"
                        >
                            About MedAI
                        </Link>
                        <Link
                            href="/demo-login"
                            className="hover:text-foreground"
                        >
                            Demo Login
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
