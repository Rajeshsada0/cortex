import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    GraduationCap,
    LayoutGrid,
    Search,
    Sparkles,
    Stethoscope,
    Zap,
    Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLogo from '@/components/app-logo';
import { MedicalBackgroundElements } from '@/components/cortex/medical-background-elements';

interface SubjectItem {
    id: string;
    name: string;
    slug: string;
    category?: string;
    questions_count: number;
    topics_count: number;
}

interface SubjectsIndexProps {
    subjects: SubjectItem[];
    currentUser: any;
}

export default function SubjectsIndex({
    subjects,
    currentUser,
}: SubjectsIndexProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const filteredSubjects = subjects.filter((subject) => {
        const matchesQuery =
            subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subject.slug.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesQuery;
    });

    const handleQuickPractice = (subjectId: string) => {
        router.post('/practice/guest-launch', {
            subject_id: subjectId,
            study_mode: '1',
            target_questions: 40,
        });
    };

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#FDFDFC] text-[#102A43] selection:bg-[#0066FF]/30 dark:bg-[#070e17] dark:text-neutral-100">
            <Head title="Medical Subjects & Specialty Question Banks — Easy-PG Style | Cortex" />

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
                {/* Heading & Search Bar */}
                <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div className="max-w-2xl">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-bold text-sky-800 dark:border-sky-800/80 dark:bg-sky-950/60 dark:text-sky-300">
                            <BookOpen className="size-3.5 text-sky-600 dark:text-sky-400" />
                            <span>
                                19 MEDICAL SPECIALTIES · TOPIC DRILLS ·
                                IMMEDIATE REVEAL
                            </span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-[#0A1E34] sm:text-4xl dark:text-white">
                            Practice by Medical Subject
                        </h1>
                        <p className="mt-2 text-xs text-slate-600 sm:text-sm dark:text-slate-300">
                            Drill clinical reasoning and high-yield question
                            stems across all 19 medical disciplines. Instant
                            feedback reveals the correct answer and distractor
                            rationales after each choice.
                        </p>
                    </div>

                    <div className="w-full md:w-80">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Search subjects (e.g. Pathology, Medicine)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="dark:bg-card dark:border-border h-11 rounded-xl border-slate-200 bg-white pl-10 text-xs font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Subject Cards Grid */}
                <div className="mb-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredSubjects.map((subject) => (
                        <div
                            key={subject.id}
                            className="group dark:border-border/80 dark:bg-card flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#0066FF]/40 hover:shadow-md sm:p-6 dark:hover:border-sky-500/40"
                        >
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-[11px] font-bold tracking-wider text-[#0066FF] uppercase dark:text-sky-400">
                                        Specialty
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                                        {subject.topics_count} Topics
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-[#0A1E34] transition-colors group-hover:text-[#0066FF] dark:text-white dark:group-hover:text-sky-400">
                                    {subject.name}
                                </h3>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {subject.questions_count} verified clinical
                                    MCQs with option rationales.
                                </p>
                            </div>

                            <div className="dark:border-border/80 mt-6 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                                <Link
                                    href={`/subjects/${subject.slug || subject.id}`}
                                    className="text-xs font-bold text-slate-600 transition-colors hover:text-[#0066FF] dark:text-slate-300"
                                >
                                    Browse Topics →
                                </Link>
                                <Button
                                    onClick={() =>
                                        handleQuickPractice(subject.id)
                                    }
                                    size="sm"
                                    className="h-8 rounded-lg bg-[#0066FF] px-3.5 text-[11px] font-bold text-white shadow-sm hover:bg-blue-700"
                                >
                                    <Play className="mr-1 size-3 fill-white" />
                                    Quick 40 Drill
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredSubjects.length === 0 && (
                    <div className="dark:border-border rounded-3xl border border-dashed border-slate-200 py-16 text-center">
                        <p className="text-sm font-medium text-slate-500">
                            No subjects found matching "{searchQuery}".
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSearchQuery('')}
                            className="mt-3 text-xs"
                        >
                            Reset Search
                        </Button>
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

                    </div>
                </div>
            </footer>
        </div>
    );
}
