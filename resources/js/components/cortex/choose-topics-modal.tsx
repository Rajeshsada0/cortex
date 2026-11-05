import React, { useState, useEffect, useMemo } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Search,
    Check,
    Lock,
    ArrowLeft,
    SlidersHorizontal,
    X,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface TopicItem {
    id: number;
    name: string;
    questions_count?: number;
    priority?: number;
    is_high_yield?: boolean;
    is_locked?: boolean;
}

export interface SubjectGroup {
    id: number;
    name: string;
    slug?: string;
    category?: string;
    emoji?: string;
    topics: TopicItem[];
}

export interface ChooseTopicsModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSubjectId?: number | string;
    initialTopicIds?: (number | string)[];
    onApply: (data: {
        selectedTopicIds: number[];
        totalQuestions: number;
        subjectName: string;
        topicsCount: number;
        topicName?: string;
    }) => void;
}

export function ChooseTopicsModal({
    isOpen,
    onClose,
    initialSubjectId,
    initialTopicIds = [],
    onApply,
}: ChooseTopicsModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState<'foundations' | 'alphabetical'>('foundations');
    const [filterAllChecked, setFilterAllChecked] = useState(false);
    const [filterWeakTopChecked, setFilterWeakTopChecked] = useState(false);
    const [subjects, setSubjects] = useState<SubjectGroup[]>([]);
    const [selectedTopicIds, setSelectedTopicIds] = useState<Set<number>>(new Set());
    const [expandedSubjectIds, setExpandedSubjectIds] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);

    // Fetch subjects with topics from API directory
    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;
        setIsLoading(true);

        fetch('/api/v1/directory')
            .then((res) => res.json())
            .then((data) => {
                if (!isMounted) return;
                const rawSubjects = data.subjects || [];

                const mapped: SubjectGroup[] = rawSubjects.map((s: any) => {
                    const cat = categorizeSubject(s.name);
                    const emoji = getSubjectEmoji(s.name);
                    const rawTopics = s.topics || [];

                    const topicsList: TopicItem[] = rawTopics.map((t: any, idx: number) => ({
                        id: t.id,
                        name: t.name,
                        questions_count: t.questions_count || 40,
                        priority: t.priority || 1,
                        is_high_yield: t.priority >= 3 || idx < 3,
                        is_locked: idx > 4, // lock advanced topics to match prototype
                    }));

                    return {
                        id: s.id,
                        name: s.name,
                        slug: s.slug,
                        category: cat,
                        emoji: emoji,
                        topics: topicsList.length > 0 ? topicsList : getFallbackTopics(s.name, s.id),
                    };
                });

                setSubjects(mapped);

                // Auto-expand initial subject if provided, else Anatomy (id 7 or first found)
                const targetSub = mapped.find(
                    (s) => String(s.id) === String(initialSubjectId) || s.name.toLowerCase() === 'anatomy'
                ) || mapped[0];

                if (targetSub) {
                    setExpandedSubjectIds(new Set([targetSub.id]));
                    // Preselect initial topics or default high-yield topics of target subject
                    if (initialTopicIds.length > 0) {
                        setSelectedTopicIds(new Set(initialTopicIds.map(Number)));
                    } else if (targetSub.topics.length > 0) {
                        const preselect = targetSub.topics
                            .filter((t) => !t.is_locked)
                            .slice(0, 3)
                            .map((t) => t.id);
                        setSelectedTopicIds(new Set(preselect));
                    }
                }
            })
            .catch(() => {
                if (!isMounted) return;
                const fallback = getStaticCurriculum();
                setSubjects(fallback);
                setExpandedSubjectIds(new Set([fallback[0].id]));
                setSelectedTopicIds(new Set(fallback[0].topics.slice(0, 3).map((t) => t.id)));
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [isOpen, initialSubjectId]);

    // Categories mapping
    const categories = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        let filtered = subjects;
        if (query) {
            filtered = subjects
                .map((s) => ({
                    ...s,
                    topics: s.topics.filter(
                        (t) =>
                            t.name.toLowerCase().includes(query) ||
                            s.name.toLowerCase().includes(query)
                    ),
                }))
                .filter((s) => s.name.toLowerCase().includes(query) || s.topics.length > 0);
        }

        const groups = {
            'FOUNDATIONAL SCIENCES': filtered.filter(
                (s) => s.category === 'FOUNDATIONAL SCIENCES'
            ),
            'DISEASE MECHANISMS': filtered.filter(
                (s) => s.category === 'DISEASE MECHANISMS'
            ),
            'CLINICAL SCIENCES': filtered.filter(
                (s) => s.category === 'CLINICAL SCIENCES'
            ),
        };

        return groups;
    }, [subjects, searchQuery]);

    const toggleSubjectExpansion = (id: number) => {
        setExpandedSubjectIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleTopic = (topic: TopicItem) => {
        if (topic.is_locked) return; // locked topics cannot be toggled

        setSelectedTopicIds((prev) => {
            const next = new Set(prev);
            if (next.has(topic.id)) {
                next.delete(topic.id);
            } else {
                next.add(topic.id);
            }
            return next;
        });
    };

    const toggleSubjectAllTopics = (subject: SubjectGroup) => {
        const unlockedTopics = subject.topics.filter((t) => !t.is_locked);
        const allSelected = unlockedTopics.every((t) => selectedTopicIds.has(t.id));

        setSelectedTopicIds((prev) => {
            const next = new Set(prev);
            unlockedTopics.forEach((t) => {
                if (allSelected) {
                    next.delete(t.id);
                } else {
                    next.add(t.id);
                }
            });
            return next;
        });
    };

    const handleSelectAllTopics = (checked: boolean) => {
        setFilterAllChecked(checked);
        if (checked) {
            const allIds = new Set<number>();
            subjects.forEach((s) => {
                s.topics.filter((t) => !t.is_locked).forEach((t) => allIds.add(t.id));
            });
            setSelectedTopicIds(allIds);
        } else {
            setSelectedTopicIds(new Set());
        }
    };

    const handleSelectWeakTop = (checked: boolean) => {
        setFilterWeakTopChecked(checked);
        if (checked) {
            const weakIds = new Set<number>();
            subjects.forEach((s) => {
                s.topics
                    .filter((t) => !t.is_locked && (t.is_high_yield || t.priority >= 3))
                    .forEach((t) => weakIds.add(t.id));
            });
            setSelectedTopicIds(weakIds);
        }
    };

    const handleNext = () => {
        const chosenIds = Array.from(selectedTopicIds);

        // Find primary subject or summary
        let primarySubjectName = 'All Subjects';
        let totalQuestions = 0;
        let singleTopicName: string | undefined;

        for (const s of subjects) {
            const matched = s.topics.filter((t) => selectedTopicIds.has(t.id));
            if (matched.length > 0) {
                if (primarySubjectName === 'All Subjects') {
                    primarySubjectName = s.name;
                    if (matched.length === 1) {
                        singleTopicName = matched[0].name;
                    }
                }
                matched.forEach((t) => {
                    totalQuestions += t.questions_count || 40;
                });
            }
        }

        if (totalQuestions === 0) {
            totalQuestions = chosenIds.length > 0 ? chosenIds.length * 40 : 40;
        }

        onApply({
            selectedTopicIds: chosenIds,
            totalQuestions,
            subjectName: primarySubjectName,
            topicsCount: Math.max(chosenIds.length, 1),
            topicName: singleTopicName,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
            <div
                className="relative flex h-full sm:h-[90vh] w-full max-w-xl flex-col rounded-none sm:rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-card overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header matching Image 3 */}
                <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:px-6 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            aria-label="Back"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <h2 className="text-xl font-bold tracking-tight text-[#0A1E34] dark:text-white">
                            Choose Topics
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Search Bar matching Image 3 */}
                <div className="p-4 sm:px-6 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by keyword or browse topics"
                            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#0066FF] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Controls Row: Foundations first dropdown, ALL checkbox, WEAK TOP checkbox */}
                <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2 text-xs">
                    {/* Foundations first pill */}
                    <button
                        type="button"
                        onClick={() =>
                            setSortMode((prev) =>
                                prev === 'foundations' ? 'alphabetical' : 'foundations'
                            )
                        }
                        className="flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50/70 px-3 py-1.5 font-bold text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300"
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span>
                            {sortMode === 'foundations' ? 'Foundations first' : 'Alphabetical (A-Z)'}
                        </span>
                        <ChevronDown className="h-3 w-3" />
                    </button>

                    {/* Checkbox pills */}
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer select-none rounded-lg border border-slate-200 px-2.5 py-1 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={filterAllChecked}
                                onChange={(e) => handleSelectAllTopics(e.target.checked)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-[#0066FF] focus:ring-0"
                            />
                            <span className="font-bold text-[11px] uppercase tracking-wider">All</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer select-none rounded-lg border border-slate-200 px-2.5 py-1 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={filterWeakTopChecked}
                                onChange={(e) => handleSelectWeakTop(e.target.checked)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-[#0066FF] focus:ring-0"
                            />
                            <span className="font-bold text-[11px] uppercase tracking-wider">Weak Top</span>
                        </label>
                    </div>
                </div>

                {/* Categorized Subjects and Topic Chips List */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 space-y-6">
                    {isLoading && (
                        <div className="py-12 text-center text-xs text-slate-400">
                            Loading curriculum topics...
                        </div>
                    )}

                    {Object.entries(categories).map(([catName, subs]) => {
                        if (subs.length === 0) return null;

                        return (
                            <div key={catName} className="space-y-2.5">
                                {/* Category Header */}
                                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    {catName} · {subs.length} SUBJECT{subs.length > 1 ? 'S' : ''}
                                </div>

                                {/* Subjects List */}
                                <div className="space-y-2">
                                    {subs.map((subject) => {
                                        const isExpanded = expandedSubjectIds.has(subject.id);
                                        const unlockedTopics = subject.topics.filter((t) => !t.is_locked);
                                        const isSubjectChecked =
                                            unlockedTopics.length > 0 &&
                                            unlockedTopics.every((t) => selectedTopicIds.has(t.id));

                                        return (
                                            <div
                                                key={subject.id}
                                                className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-card/70 overflow-hidden shadow-xs transition-all"
                                            >
                                                {/* Subject Accordion Header */}
                                                <div
                                                    onClick={() => toggleSubjectExpansion(subject.id)}
                                                    className="flex items-center justify-between p-3.5 cursor-pointer select-none hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleSubjectAllTopics(subject);
                                                            }}
                                                            className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                                                                isSubjectChecked
                                                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                                                    : 'border-slate-300 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900'
                                                            }`}
                                                        >
                                                            {isSubjectChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                                        </button>

                                                        <span className="text-base">{subject.emoji || '🩺'}</span>
                                                        <span className="text-xs font-black tracking-wider uppercase text-slate-800 dark:text-slate-200">
                                                            {subject.name}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <span className="text-[11px] font-medium">
                                                            {subject.topics.filter((t) => selectedTopicIds.has(t.id)).length}/
                                                            {subject.topics.length}
                                                        </span>
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Topic Chips Container */}
                                                {isExpanded && (
                                                    <div className="border-t border-slate-100 bg-slate-50/40 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/30">
                                                        <div className="flex flex-wrap gap-2">
                                                            {/* Quick "ALL" chip */}
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleSubjectAllTopics(subject)}
                                                                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase transition-all ${
                                                                    isSubjectChecked
                                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                                }`}
                                                            >
                                                                {isSubjectChecked && <Check className="h-3 w-3 stroke-[3]" />}
                                                                ALL
                                                            </button>

                                                            {/* Topics Chips */}
                                                            {subject.topics.map((topic) => {
                                                                const isSelected = selectedTopicIds.has(topic.id);
                                                                const isLocked = topic.is_locked;

                                                                if (isLocked) {
                                                                    return (
                                                                        <div
                                                                            key={topic.id}
                                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50/60 px-2.5 py-1 text-[11px] font-bold uppercase text-purple-700 opacity-80 cursor-not-allowed dark:border-purple-900/60 dark:bg-purple-950/30 dark:text-purple-300"
                                                                            title="Topic locked. Unlock via Pro curriculum"
                                                                        >
                                                                            <Lock className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                                                                            <span>{topic.name}</span>
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
                                                                    <button
                                                                        key={topic.id}
                                                                        type="button"
                                                                        onClick={() => toggleTopic(topic)}
                                                                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase transition-all ${
                                                                            isSelected
                                                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                                        }`}
                                                                    >
                                                                        {isSelected && (
                                                                            <Check className="h-3 w-3 text-emerald-600 stroke-[3] dark:text-emerald-400" />
                                                                        )}
                                                                        <span>{topic.name}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Sticky Bottom Actions matching Image 3: Large blue "NEXT" button */}
                <div className="border-t border-slate-100 bg-white p-4 sm:px-6 dark:border-slate-800 dark:bg-card">
                    <Button
                        type="button"
                        onClick={handleNext}
                        className="h-12 w-full rounded-xl bg-[#0066FF] text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 hover:bg-blue-600 active:scale-[0.99] transition-all"
                    >
                        Next {selectedTopicIds.size > 0 ? `(${selectedTopicIds.size} Topics)` : ''}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Helpers
function categorizeSubject(name: string): string {
    const foundational = ['anatomy', 'physiology', 'biochemistry', 'immunology', 'genetics'];
    const disease = ['pathology', 'microbiology', 'pharmacology', 'forensic medicine'];

    const lower = name.toLowerCase();
    if (foundational.some((f) => lower.includes(f))) return 'FOUNDATIONAL SCIENCES';
    if (disease.some((d) => lower.includes(d))) return 'DISEASE MECHANISMS';
    return 'CLINICAL SCIENCES';
}

function getSubjectEmoji(name: string): string {
    const map: Record<string, string> = {
        anatomy: '🧠',
        physiology: '👤',
        biochemistry: '🧬',
        immunology: '🔬',
        pathology: '🫀',
        microbiology: '🦠',
        pharmacology: '💊',
        medicine: '🩺',
        surgery: '✂️',
        pediatrics: '👶',
        psychiatry: '🧘',
        radiology: '🩻',
    };
    const key = Object.keys(map).find((k) => name.toLowerCase().includes(k));
    return key ? map[key] : '📚';
}

function getFallbackTopics(subjectName: string, subjectId: number): TopicItem[] {
    const lower = subjectName.toLowerCase();
    if (lower.includes('anatomy')) {
        return [
            { id: 101, name: 'Upper/Lower Limb', questions_count: 108, priority: 3, is_high_yield: true },
            { id: 102, name: 'Thorax/Abdomen', questions_count: 48, priority: 3, is_high_yield: true },
            { id: 103, name: 'Head & Neck', questions_count: 36, priority: 2, is_high_yield: true },
            { id: 104, name: 'Pelvis/Perineum', questions_count: 24, priority: 1, is_locked: true },
            { id: 105, name: 'Gross Anatomy', questions_count: 50, priority: 1, is_locked: true },
            { id: 106, name: 'Brainstem Nuclei', questions_count: 30, priority: 1, is_locked: true },
            { id: 107, name: 'Corticospinal Tracts', questions_count: 22, priority: 1, is_locked: true },
            { id: 108, name: 'Vascular Supply (Circle of Willis)', questions_count: 45, priority: 1, is_locked: true },
            { id: 109, name: 'Neuroanatomy', questions_count: 60, priority: 1, is_locked: true },
        ];
    }
    return [
        { id: subjectId * 100 + 1, name: 'Core Foundations', questions_count: 40, priority: 3, is_high_yield: true },
        { id: subjectId * 100 + 2, name: 'Clinical Integration', questions_count: 35, priority: 3, is_high_yield: true },
        { id: subjectId * 100 + 3, name: 'Advanced Diagnostics', questions_count: 25, priority: 2, is_locked: true },
    ];
}

function getStaticCurriculum(): SubjectGroup[] {
    return [
        {
            id: 7,
            name: 'Anatomy',
            category: 'FOUNDATIONAL SCIENCES',
            emoji: '🧠',
            topics: getFallbackTopics('Anatomy', 7),
        },
        {
            id: 8,
            name: 'Physiology',
            category: 'FOUNDATIONAL SCIENCES',
            emoji: '👤',
            topics: getFallbackTopics('Physiology', 8),
        },
        {
            id: 9,
            name: 'Biochemistry',
            category: 'FOUNDATIONAL SCIENCES',
            emoji: '🧬',
            topics: getFallbackTopics('Biochemistry', 9),
        },
        {
            id: 10,
            name: 'Immunology',
            category: 'FOUNDATIONAL SCIENCES',
            emoji: '🔬',
            topics: getFallbackTopics('Immunology', 10),
        },
        {
            id: 11,
            name: 'Pathology',
            category: 'DISEASE MECHANISMS',
            emoji: '🫀',
            topics: getFallbackTopics('Pathology', 11),
        },
        {
            id: 12,
            name: 'Microbiology',
            category: 'DISEASE MECHANISMS',
            emoji: '🦠',
            topics: getFallbackTopics('Microbiology', 12),
        },
        {
            id: 13,
            name: 'Pharmacology',
            category: 'DISEASE MECHANISMS',
            emoji: '💊',
            topics: getFallbackTopics('Pharmacology', 13),
        },
    ];
}
