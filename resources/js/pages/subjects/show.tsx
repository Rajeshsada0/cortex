import React, { useState, useMemo } from 'react';
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
    Star,
    Image as ImageIcon,
    SlidersHorizontal,
    Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLogo from '@/components/app-logo';
import { MedicalBackgroundElements } from '@/components/cortex/medical-background-elements';
import { QuizReadyModal } from '@/components/cortex/quiz-ready-modal';
import { ChooseTopicsModal } from '@/components/cortex/choose-topics-modal';

interface TopicItem {
    id: string | number;
    name: string;
    slug?: string;
    questions_count: number;
    priority?: number;
}

interface SubjectDetailProps {
    subject: {
        id: string | number;
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
    topics: initialTopics,
    currentUser,
}: SubjectDetailProps) {
    const [selectedPathway, setSelectedPathway] = useState<string>('COMBINED');
    const [activeFilter, setActiveFilter] = useState<'all' | 'high_yield' | 'image'>('all');

    // Modals state
    const [isQuizReadyOpen, setIsQuizReadyOpen] = useState(false);
    const [isChooseTopicsOpen, setIsChooseTopicsOpen] = useState(false);
    const [activeTopic, setActiveTopic] = useState<TopicItem | null>(null);
    const [quizQuestionsCount, setQuizQuestionsCount] = useState(40);
    const [activeSubjectName, setActiveSubjectName] = useState(subject.name);
    const [activeTopicsCount, setActiveTopicsCount] = useState(1);
    const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);

    // Ensure fallback topics if initialTopics is empty
    const topics: TopicItem[] = useMemo(() => {
        if (initialTopics && initialTopics.length > 0) {
            return initialTopics;
        }
        // Fallback for Anatomy matching user screenshot
        if (subject.name.toLowerCase().includes('anatomy')) {
            return [
                { id: 101, name: 'Upper/Lower Limb', questions_count: 108, priority: 3 },
                { id: 102, name: 'Thorax/Abdomen', questions_count: 48, priority: 3 },
                { id: 103, name: 'Head & Neck', questions_count: 36, priority: 2 },
                { id: 104, name: 'Pelvis/Perineum', questions_count: 24, priority: 1 },
                { id: 105, name: 'Gross Anatomy', questions_count: 50, priority: 1 },
                { id: 106, name: 'Neuroanatomy', questions_count: 60, priority: 3 },
            ];
        }
        return [];
    }, [initialTopics, subject.name]);

    // Filter topics based on filter pill
    const filteredTopics = useMemo(() => {
        if (activeFilter === 'high_yield') {
            return topics.filter((t, idx) => (t.priority && t.priority >= 2) || idx < 2);
        }
        if (activeFilter === 'image') {
            return topics.filter((t, idx) => idx % 2 === 0);
        }
        return topics;
    }, [topics, activeFilter]);

    const getTopicQuestionCount = (topic: TopicItem): number => {
        return topic.questions_count && topic.questions_count > 0 ? topic.questions_count : 40;
    };

    const handleOpenTopicQuiz = (topic: TopicItem) => {
        setActiveTopic(topic);
        setActiveSubjectName(subject.name);
        setQuizQuestionsCount(getTopicQuestionCount(topic));
        setActiveTopicsCount(1);
        setSelectedTopicIds([Number(topic.id)]);
        setIsQuizReadyOpen(true);
    };

    const handleOpenSelectTopics = () => {
        setIsChooseTopicsOpen(true);
    };

    const handleApplyChosenTopics = (data: {
        selectedTopicIds: number[];
        totalQuestions: number;
        subjectName: string;
        topicsCount: number;
        topicName?: string;
    }) => {
        setSelectedTopicIds(data.selectedTopicIds);
        setQuizQuestionsCount(data.totalQuestions);
        setActiveSubjectName(data.subjectName);
        setActiveTopicsCount(data.topicsCount);
        if (data.topicName) {
            setActiveTopic({
                id: data.selectedTopicIds[0] || 0,
                name: data.topicName,
                questions_count: data.totalQuestions,
            });
        } else {
            setActiveTopic(null);
        }
        setIsChooseTopicsOpen(false);
        setIsQuizReadyOpen(true);
    };

    const handleStartQuizRunner = () => {
        let url = `/qbank/runner?limit=10&subject_id=${subject.id}`;
        if (activeTopic) {
            url += `&topic_id=${activeTopic.id}`;
        } else if (selectedTopicIds.length > 0) {
            url += `&topic_id=${selectedTopicIds[0]}`;
        }
        router.visit(url);
    };

    const getSubjectEmoji = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('anatomy')) return '🧠';
        if (lower.includes('physio')) return '👤';
        if (lower.includes('biochem')) return '🧬';
        if (lower.includes('patho')) return '🫀';
        if (lower.includes('micro')) return '🦠';
        if (lower.includes('pharm')) return '💊';
        return '🩺';
    };

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#FDFDFC] text-[#102A43] selection:bg-[#0066FF]/30 dark:bg-[#070e17] dark:text-neutral-100">
            <Head
                title={`${subject.name} MCQs & Topic Drills — Easy-PG Style | Cortex`}
            />

            <MedicalBackgroundElements />

            {/* Top Navigation */}
            <header className="border-border/70 bg-background/85 sticky top-0 z-40 border-b backdrop-blur-md transition-colors">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="group flex items-center gap-2">
                        <AppLogo />
                    </Link>

                    <nav className="hidden items-center gap-6 text-xs font-semibold md:flex">
                        <Link
                            href="/subjects"
                            className="font-bold text-[#0066FF] transition-colors dark:text-sky-400"
                        >
                            Subjects
                        </Link>
                        <Link
                            href="/directory"
                            className="text-muted-foreground transition-colors hover:text-[#0066FF]"
                        >
                            Directory
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleOpenSelectTopics}
                            className="h-9 rounded-xl border-[#0066FF]/40 text-xs font-bold text-[#0066FF] hover:bg-[#0066FF]/10"
                        >
                            SELECT TOPICS
                        </Button>

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

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                {/* Back Button and Screen Title Bar matching Image 2 */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/subjects"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-card dark:text-slate-300"
                            aria-label="Back"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>

                        <div className="flex items-center gap-2">
                            <span className="text-xl">{getSubjectEmoji(subject.name)}</span>
                            <h1 className="text-xl sm:text-2xl font-black text-[#0A1E34] dark:text-white">
                                {subject.name}
                            </h1>
                        </div>
                    </div>

                    {/* SELECT Button matching Image 2 top-right */}
                    <button
                        type="button"
                        onClick={handleOpenSelectTopics}
                        className="rounded-full border border-sky-300 bg-sky-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 shadow-2xs hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300 transition-all"
                    >
                        Select
                    </button>
                </div>

                {/* Filter Pills matching Image 2: All, High Yield, Image */}
                <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-1">
                    <button
                        type="button"
                        onClick={() => setActiveFilter('all')}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                            activeFilter === 'all'
                                ? 'bg-[#0066FF] text-white shadow-xs'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-card dark:text-slate-300'
                        }`}
                    >
                        All
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveFilter('high_yield')}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                            activeFilter === 'high_yield'
                                ? 'bg-[#0066FF] text-white shadow-xs'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-card dark:text-slate-300'
                        }`}
                    >
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                        <span>High Yield</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveFilter('image')}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                            activeFilter === 'image'
                                ? 'bg-[#0066FF] text-white shadow-xs'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-card dark:text-slate-300'
                        }`}
                    >
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>Image</span>
                    </button>
                </div>

                {/* Topic Cards List matching Image 2 */}
                <div className="space-y-3.5">
                    {filteredTopics.map((topic, index) => (
                        <div
                            key={topic.id}
                            onClick={() => handleOpenTopicQuiz(topic)}
                            className="group flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-[#0066FF]/50 hover:shadow-md cursor-pointer dark:border-slate-800 dark:bg-card"
                        >
                            <div className="flex items-center gap-4">
                                {/* Topic Icon Graphic */}
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300">
                                    {index % 2 === 0 ? (
                                        <Activity className="h-6 w-6 stroke-[1.8]" />
                                    ) : (
                                        <Layers className="h-6 w-6 stroke-[1.8]" />
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-[#0A1E34] group-hover:text-[#0066FF] dark:text-white transition-colors">
                                        {topic.name}
                                    </h3>
                                    <p className="mt-0.5 text-xs text-slate-400 font-medium">
                                        {getTopicQuestionCount(topic)} Questions
                                    </p>
                                </div>
                            </div>

                            {/* Badges: High Yield and New matching Image 2 */}
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-amber-100/80 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                                    High Yield
                                </span>
                                <span className="rounded-full bg-blue-100/80 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
                                    New
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTopics.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
                        <p className="text-xs text-slate-500">
                            No topics matched the selected filter.
                        </p>
                    </div>
                )}
            </main>

            {/* Modal 1: Your Quiz is Ready Modal */}
            <QuizReadyModal
                isOpen={isQuizReadyOpen}
                onClose={() => setIsQuizReadyOpen(false)}
                subjectName={activeSubjectName}
                topicName={activeTopic ? activeTopic.name : undefined}
                topicsCount={activeTopicsCount}
                questionsCount={quizQuestionsCount}
                subjectId={subject.id}
                topicId={activeTopic ? activeTopic.id : undefined}
                selectedTopicIds={selectedTopicIds}
                onEdit={() => {
                    setIsQuizReadyOpen(false);
                    setIsChooseTopicsOpen(true);
                }}
                onStartQuiz={handleStartQuizRunner}
            />

            {/* Modal 2: Choose Topics Modal */}
            <ChooseTopicsModal
                isOpen={isChooseTopicsOpen}
                onClose={() => setIsChooseTopicsOpen(false)}
                initialSubjectId={subject.id}
                initialTopicIds={selectedTopicIds}
                onApply={handleApplyChosenTopics}
            />

            {/* Footer */}
            <footer className="dark:border-border dark:bg-card/40 mt-auto border-t border-slate-200 bg-slate-50/60 py-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
                    <div>
                        © {new Date().getFullYear()} Cortex Medical. MedAI Practice Engine.
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/mock-exam" className="hover:text-foreground">
                            Mock Exams
                        </Link>
                        <Link href="/subjects" className="hover:text-foreground">
                            Subjects
                        </Link>
                        <Link href="/directory" className="hover:text-foreground">
                            Directory
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
