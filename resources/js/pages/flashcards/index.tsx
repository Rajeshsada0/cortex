import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Sparkles,
    Search,
    BookOpen,
    Repeat,
    Calendar,
    Bookmark,
    Check,
    Star,
    ArrowUpDown,
    ChevronRight,
    ChevronDown,
    X,
    RotateCw,
    Plus,
    UploadCloud,
    Bot,
    Send,
    HelpCircle,
    CheckCircle2,
    RotateCcw,
    ThumbsUp,
    Zap,
    Maximize2,
    Minimize2,
    SlidersHorizontal,
    FileSpreadsheet,
    Eye,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface SubjectItem {
    id: string;
    title: string;
    cardsCount: number;
    emoji: string;
    bgClass: string;
    isNew: boolean;
    isSaved: boolean;
    isHighYield: boolean;
    category: 'foundational' | 'disease' | 'behavioral' | 'clinical';
}

interface SectionGroup {
    title: string;
    items: SubjectItem[];
}

interface ThemeItem {
    id: string;
    title: string;
    cardsCount: number;
    progress: number;
    emoji: string;
    bgClass: string;
    isHighYield: boolean;
    hasImage: boolean;
}

interface FlashcardItem {
    id: string;
    subject: string;
    topic: string;
    front: string;
    back: string;
    pearl?: string;
}

interface FlashcardsPageProps {
    user: any;
    dueCount: number;
    sections: SectionGroup[];
    themes: ThemeItem[];
    sampleCards: FlashcardItem[];
}

export default function FlashcardsIndex({
    user,
    dueCount: initialDueCount = 14,
    sections: initialSections = [],
    themes: initialThemes = [],
    sampleCards = [],
}: FlashcardsPageProps) {
    const [dueCount, setDueCount] = useState<number>(initialDueCount);

    // Tab state: 'subject' | 'themes' | 'decks'
    const [activeTab, setActiveTab] = useState<'subject' | 'themes' | 'decks'>('subject');

    // Search query
    const [searchQuery, setSearchQuery] = useState('');

    // Subject filters & sort
    const [subjectFilter, setSubjectFilter] = useState<'all' | 'saved' | 'high_yield'>('all');
    const [sortBy, setSortBy] = useState<'foundations' | 'count_desc' | 'alphabetical'>('foundations');

    // Themes filter
    const [themeFilter, setThemeFilter] = useState<'all' | 'high_yield' | 'image'>('all');

    // Decks filter & custom user decks state
    const [deckFilter, setDeckFilter] = useState<'all' | 'custom' | 'anki' | 'my_cards'>('all');
    const [customDecks, setCustomDecks] = useState<
        Array<{ id: string; title: string; cardsCount: number; type: 'anki' | 'custom'; lastReviewed?: string }>
    >([]);

    // Interactive Study Player state
    const [studySessionActive, setStudySessionActive] = useState(false);
    const [isLoadingCards, setIsLoadingCards] = useState(false);
    const [sessionTitle, setSessionTitle] = useState('Daily Review');
    const [studyCards, setStudyCards] = useState<FlashcardItem[]>(sampleCards);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionCompleted, setSessionCompleted] = useState(false);
    const [reviewedCount, setReviewedCount] = useState(0);

    // Modals state
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [ankiModalOpen, setAnkiModalOpen] = useState(false);
    const [cortexModalOpen, setCortexModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'mobile' | 'expanded'>('mobile');

    // Cortex AI chat state
    const [cortexQuery, setCortexQuery] = useState('');
    const [cortexMode, setCortexMode] = useState<'Board Tutor' | 'Mnemonics' | 'Differentials' | 'Next Step'>('Board Tutor');
    const [cortexIsTyping, setCortexIsTyping] = useState(false);
    const [cortexCredits, setCortexCredits] = useState(50);
    const [cortexMessages, setCortexMessages] = useState<Array<{
        id: string;
        sender: 'ai' | 'user';
        text: string;
        clinicalPearl?: string;
        emergencyStep?: string;
        relatedTopics?: string[];
    }>>([
        {
            id: 'init-1',
            sender: 'ai',
            text: 'Hello Dr. Cortex! I am Dr. Cortex AI, your clinical board exam and spaced-repetition flashcard tutor. Need a mnemonic, high-yield pearl, or differential breakdown for any flashcard topic?',
            clinicalPearl: 'Beck Triad (Hypotension, JVD, Muffled Heart Sounds) indicates Cardiac Tamponade. Immediate pericardiocentesis is diagnostic and life-saving.',
            relatedTopics: ['Beck Triad', 'Cranial Nerve Lesions', 'Loop vs Thiazide Diuretics', 'SAD PUCKER Mnemonic'],
        },
    ]);

    // New Deck Form state
    const [newDeckTitle, setNewDeckTitle] = useState('');
    const [newDeckCategory, setNewDeckCategory] = useState('Anatomy');

    // Filtered Subjects
    const filteredSections = useMemo(() => {
        let sections = initialSections.map((sec) => {
            let items = sec.items.filter((item) => {
                const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
                if (!matchesSearch) return false;

                if (subjectFilter === 'saved') return item.isSaved;
                if (subjectFilter === 'high_yield') return item.isHighYield;
                return true;
            });

            if (sortBy === 'count_desc') {
                items = [...items].sort((a, b) => b.cardsCount - a.cardsCount);
            } else if (sortBy === 'alphabetical') {
                items = [...items].sort((a, b) => a.title.localeCompare(b.title));
            }

            return {
                ...sec,
                items,
            };
        });

        // If Foundations First, foundational is top
        if (sortBy === 'foundations') {
            return sections;
        }

        return sections;
    }, [initialSections, searchQuery, subjectFilter, sortBy]);

    // Filtered Themes
    const filteredThemes = useMemo(() => {
        return initialThemes.filter((theme) => {
            const matchesSearch = theme.title.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;

            if (themeFilter === 'high_yield') return theme.isHighYield;
            if (themeFilter === 'image') return theme.hasImage;
            return true;
        });
    }, [initialThemes, searchQuery, themeFilter]);

    // Filtered Decks
    const filteredDecks = useMemo(() => {
        return customDecks.filter((deck) => {
            const matchesSearch = deck.title.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;

            if (deckFilter === 'custom') return deck.type === 'custom';
            if (deckFilter === 'anki') return deck.type === 'anki';
            return true;
        });
    }, [customDecks, searchQuery, deckFilter]);

    // Launch Study Session dynamically from database
    const startStudySession = async (
        title: string,
        filterParams?: { subject?: string; theme?: string; source?: string; cards?: FlashcardItem[] }
    ) => {
        setSessionTitle(title);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setSessionCompleted(false);
        setReviewedCount(0);
        setStudySessionActive(true);

        if (filterParams?.cards && filterParams.cards.length > 0) {
            setStudyCards(filterParams.cards);
            return;
        }

        setIsLoadingCards(true);
        try {
            const query = new URLSearchParams();
            if (filterParams?.subject) query.append('subject', filterParams.subject);
            if (filterParams?.theme) query.append('theme', filterParams.theme);
            if (filterParams?.source) query.append('source', filterParams.source);
            query.append('limit', '15');

            const res = await fetch(`/flashcards/cards?${query.toString()}`);
            if (res.ok) {
                const data = await res.json();
                if (data.cards && data.cards.length > 0) {
                    setStudyCards(data.cards);
                    setIsLoadingCards(false);
                    return;
                }
            }
        } catch (e) {
            console.error('Failed to load dynamic flashcards', e);
        }

        // Fallback to initial dynamic sampleCards if available
        if (sampleCards.length > 0) {
            setStudyCards(sampleCards);
        }
        setIsLoadingCards(false);
    };

    // Review Card & persist to Spaced Repetition queue
    const handleCardRating = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
        const currentCard = studyCards[currentCardIndex];
        setIsFlipped(false);
        setReviewedCount((prev) => prev + 1);

        if (currentCard && currentCard.id) {
            try {
                const isCorrect = rating !== 'again';
                const confidence = rating === 'hard' ? 'LOW' : (rating === 'good' ? 'MEDIUM' : 'HIGH');
                const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

                const res = await fetch('/flashcards/review', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                    },
                    body: JSON.stringify({
                        question_id: currentCard.id,
                        is_correct: isCorrect,
                        confidence: confidence,
                    }),
                });

                if (res.ok) {
                    const result = await res.json();
                    if (typeof result.due_count === 'number') {
                        setDueCount(result.due_count);
                    }
                }
            } catch (err) {
                console.error('Error submitting spaced repetition review:', err);
            }
        }

        const nextIndex = currentCardIndex + 1;
        if (nextIndex < studyCards.length) {
            setCurrentCardIndex(nextIndex);
        } else {
            setSessionCompleted(true);
            toast.success('Deck Completed!', {
                description: `Successfully reviewed ${studyCards.length} flashcards in ${sessionTitle}.`,
            });
        }
    };

    // Create custom deck
    const handleCreateDeck = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDeckTitle.trim()) return;

        const newDeck = {
            id: 'deck-' + Date.now(),
            title: newDeckTitle.trim(),
            cardsCount: 15,
            type: 'custom' as const,
            lastReviewed: 'Just now',
        };

        setCustomDecks((prev) => [newDeck, ...prev]);
        setNewDeckTitle('');
        setCreateModalOpen(false);
        setActiveTab('decks');
        toast.success(`Deck "${newDeck.title}" created!`);
    };

    // Simulate Anki Import
    const handleImportAnki = () => {
        const ankiDeck = {
            id: 'anki-' + Date.now(),
            title: 'Anki AnKing Step 1 Comprehensive',
            cardsCount: 14200,
            type: 'anki' as const,
            lastReviewed: 'Imported today',
        };

        setCustomDecks((prev) => [ankiDeck, ...prev]);
        setAnkiModalOpen(false);
        setActiveTab('decks');
        toast.success('Anki deck imported successfully!', {
            description: '14,200 cards synced with AI spaced repetition tags.',
        });
    };

    // Cortex AI Clinical Chat
    const handleSendCortexAi = async (e?: React.FormEvent, presetQuery?: string) => {
        if (e) e.preventDefault();
        const text = presetQuery ?? cortexQuery.trim();
        if (!text || cortexIsTyping) return;

        const userMsg = {
            id: `usr-${Date.now()}`,
            sender: 'user' as const,
            text,
        };

        setCortexMessages((prev) => [...prev, userMsg]);
        if (!presetQuery) setCortexQuery('');
        setCortexIsTyping(true);

        try {
            const res = await fetch('/api/v1/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    prompt: text,
                    mode: cortexMode,
                    subject: 'Flashcards & Spaced Repetition',
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const aiData = data.data || data;
                setCortexMessages((prev) => [
                    ...prev,
                    {
                        id: `ai-${Date.now()}`,
                        sender: 'ai',
                        text: aiData.reply || 'Here is the clinical pearl for this card.',
                        clinicalPearl: aiData.clinical_pearl,
                        emergencyStep: aiData.emergency_step,
                        relatedTopics: aiData.related_topics,
                    },
                ]);
                if (aiData.credits_remaining !== undefined) {
                    setCortexCredits(aiData.credits_remaining);
                }
            } else {
                throw new Error('API request failed');
            }
        } catch {
            // High-yield offline medical fallback
            let fallbackReply = `Here is a high-yield pearl for "${text}": Always link the pathophysiologic mechanism to pathognomonic physical signs.`;
            let pearl: string | undefined;
            let emergency: string | undefined;
            const topics = ['Beck Triad', 'Cranial Nerves', 'SAD PUCKER'];

            const lower = text.toLowerCase();
            if (lower.includes('beck') || lower.includes('tamponade')) {
                fallbackReply = 'Cardiac Tamponade: Characterized by pulsus paradoxus (> 10 mmHg drop in SBP on inspiration) and electrical alternans on ECG.';
                pearl = 'Beck Triad: Hypotension, Distended Neck Veins (JVD), Muffled Heart Sounds. Contrast with tension pneumothorax (which has absent unilateral breath sounds and hyperresonance).';
                emergency = 'Perform emergent ultrasound-guided pericardiocentesis or surgical subxiphoid pericardial window. Avoid positive pressure ventilation as it worsens venous return!';
            } else if (lower.includes('diuretic') || lower.includes('loop')) {
                fallbackReply = 'Loop vs Thiazide Diuretics:';
                pearl = 'Loops inhibit Na+/K+/2Cl- cotransporter in the thick ascending limb of Henle (causes hypocalcemia). Thiazides inhibit Na+/Cl- in the DCT (causes hypercalcemia). Loops Lose calcium, Thiazides Take calcium in.';
            }

            setCortexMessages((prev) => [
                ...prev,
                {
                    id: `ai-${Date.now()}`,
                    sender: 'ai',
                    text: fallbackReply,
                    clinicalPearl: pearl,
                    emergencyStep: emergency,
                    relatedTopics: topics,
                },
            ]);
        } finally {
            setCortexIsTyping(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] text-[#1E293B] antialiased flex flex-col items-center justify-start selection:bg-rose-100 selection:text-rose-600 font-sans">
            <Head title="Flashcards - Medical Learning App" />

            {/* Desktop Top Bar (Quick Controls for pairs & dev) */}
            <div className="w-full max-w-4xl px-4 py-2 hidden md:flex items-center justify-between text-xs text-neutral-500 border-b border-neutral-200/60 bg-white/60 backdrop-blur-sm sticky top-0 z-40">
                <div className="flex items-center space-x-2">
                    <span className="font-semibold text-neutral-700">Cortex Medical Flashcards</span>
                    <span className="text-neutral-300">•</span>
                    <span className="bg-red-50 text-[#EB5757] px-2 py-0.5 rounded-full font-medium text-[11px]">
                        FSRS 5-Stage SRS
                    </span>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setViewMode(viewMode === 'mobile' ? 'expanded' : 'mobile')}
                        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
                    >
                        {viewMode === 'mobile' ? (
                            <>
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Expanded View</span>
                            </>
                        ) : (
                            <>
                                <Minimize2 className="w-3.5 h-3.5" />
                                <span>Mobile Frame</span>
                            </>
                        )}
                    </button>
                    <Link
                        href="/dashboard"
                        className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 transition font-medium"
                    >
                        Exit to Dashboard
                    </Link>
                </div>
            </div>

            {/* Main Application Container */}
            <div
                className={`w-full ${
                    viewMode === 'mobile' ? 'max-w-md shadow-2xl' : 'max-w-2xl shadow-xl'
                } min-h-screen bg-[#F7F8FA] relative flex flex-col pb-36 select-none transition-all duration-300`}
            >
                {/* BEGIN: TopHeaderAndStatusBar */}
                <header
                    style={{
                        background: 'linear-gradient(180deg, #FEECEC 0%, #FFF8F8 55%, #F7F8FA 100%)',
                    }}
                    className="pt-3 pb-3 px-4 sticky top-0 z-30 transition-all border-b border-rose-100/40"
                >
                    {/* App Title */}
                    <div className="flex items-center space-x-2.5 mt-2 mb-3">
                        {/* Logo Icon */}
                        <div className="w-7 h-7 flex items-center justify-center">
                            <svg className="w-6 h-6 text-[#F06560] transform -rotate-12" fill="currentColor" viewBox="0 0 24 24">
                                <rect fill="#F87171" height="15" opacity="0.6" rx="3" width="13" x="3" y="5" />
                                <rect fill="#EF4444" height="16" rx="3" width="14" x="7" y="3" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Flashcards</h1>
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full mb-3" data-purpose="search-box">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="7" />
                                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                            </svg>
                        </div>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-8 py-2.5 rounded-full border border-neutral-200/80 bg-white/95 text-xs text-neutral-800 placeholder-neutral-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#F06560]/30 focus:border-[#F06560] transition-all"
                            placeholder="Search across your Flashcards"
                            type="text"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Top Action Buttons: Daily Review & Create */}
                    <div className="grid grid-cols-2 gap-3 mb-3" data-purpose="quick-actions">
                        {/* Daily Review Button */}
                        <button
                            onClick={() => {
                                startStudySession('Daily Recall Review', { source: 'due' });
                            }}
                            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl font-medium text-xs border transition-all bg-white text-neutral-800 border-neutral-200/90 shadow-xs hover:border-[#F06560] active:scale-95 cursor-pointer"
                        >
                            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <rect height="16" rx="3" width="18" x="3" y="4" />
                                <path d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                            <span className="tracking-tight">Daily Review</span>
                            {dueCount > 0 && (
                                <span className="bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                                    {dueCount}
                                </span>
                            )}
                        </button>

                        {/* Create Button */}
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-white text-neutral-800 font-medium text-xs border border-dashed border-neutral-300 shadow-xs hover:border-[#F06560] hover:text-[#F06560] active:scale-95 transition-all cursor-pointer"
                        >
                            <svg className="w-4 h-4 text-[#F06560]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <rect height="18" rx="3" strokeDasharray="3 3" width="18" x="3" y="3" />
                                <path d="M12 8v8M8 12h8" strokeLinecap="round" />
                            </svg>
                            <span className="tracking-tight font-semibold">Create</span>
                        </button>
                    </div>

                    {/* Segmented Main Tabs Navigation */}
                    <div className="bg-[#ECEEF2] p-1 rounded-full flex items-center justify-between text-xs font-semibold text-neutral-600 shadow-inner" data-purpose="segment-tabs">
                        <button
                            onClick={() => setActiveTab('subject')}
                            className={`flex-1 py-1.5 rounded-full text-center transition-all ${
                                activeTab === 'subject'
                                    ? 'bg-white text-neutral-900 shadow-xs'
                                    : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                        >
                            By Subject
                        </button>
                        <button
                            onClick={() => setActiveTab('themes')}
                            className={`flex-1 py-1.5 rounded-full text-center transition-all ${
                                activeTab === 'themes'
                                    ? 'bg-white text-neutral-900 shadow-xs'
                                    : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                        >
                            Themes
                        </button>
                        <button
                            onClick={() => setActiveTab('decks')}
                            className={`flex-1 py-1.5 rounded-full text-center transition-all ${
                                activeTab === 'decks'
                                    ? 'bg-white text-neutral-900 shadow-xs'
                                    : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                        >
                            My Decks
                        </button>
                    </div>
                </header>
                {/* END: TopHeaderAndStatusBar */}

                {/* BEGIN: MainContentArea */}
                <main className="px-4 pt-1 flex-1">
                    {/* ============================================== */}
                    {/* TAB 1: BY SUBJECT VIEW                         */}
                    {/* ============================================== */}
                    {activeTab === 'subject' && (
                        <section className="block animate-in fade-in duration-200" id="view-subject">
                            {/* Sub Filter Bar */}
                            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-2 mb-2" data-purpose="subject-filter-chips">
                                {/* Sort Dropdown Pill */}
                                <button
                                    onClick={() => {
                                        if (sortBy === 'foundations') setSortBy('count_desc');
                                        else if (sortBy === 'count_desc') setSortBy('alphabetical');
                                        else setSortBy('foundations');
                                    }}
                                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FFF0F0] border border-[#FCD8D6] rounded-full text-xs font-semibold text-[#E55353] whitespace-nowrap active:scale-95 transition-all cursor-pointer"
                                >
                                    <svg className="w-3.5 h-3.5 rotate-90" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                        <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>
                                        {sortBy === 'foundations'
                                            ? 'Foundations first'
                                            : sortBy === 'count_desc'
                                            ? 'Highest cards'
                                            : 'A to Z'}
                                    </span>
                                    <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>

                                {/* All Chip */}
                                <button
                                    onClick={() => setSubjectFilter('all')}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-xs transition cursor-pointer ${
                                        subjectFilter === 'all'
                                            ? 'bg-[#EF4444] text-white'
                                            : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
                                    }`}
                                >
                                    All
                                </button>

                                {/* Saved Chip */}
                                <button
                                    onClick={() => setSubjectFilter('saved')}
                                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap active:scale-95 transition cursor-pointer ${
                                        subjectFilter === 'saved'
                                            ? 'bg-[#EF4444] text-white border-transparent'
                                            : 'bg-white border border-neutral-200 text-neutral-600'
                                    }`}
                                >
                                    <svg className="w-3 h-3 currentColor" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                                    </svg>
                                    <span>Saved</span>
                                </button>

                                {/* High Yield Chip */}
                                <button
                                    onClick={() => setSubjectFilter('high_yield')}
                                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap active:scale-95 transition cursor-pointer ${
                                        subjectFilter === 'high_yield'
                                            ? 'bg-[#EF4444] text-white border-transparent'
                                            : 'bg-white border border-neutral-200 text-neutral-600'
                                    }`}
                                >
                                    <svg className="w-3 h-3 currentColor" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                    <span>High Yield</span>
                                </button>
                            </div>

                            {/* Section list */}
                            {filteredSections.map((sec, secIdx) => {
                                if (sec.items.length === 0) return null;
                                return (
                                    <div key={sec.title || secIdx} className="mb-4">
                                        <h2 className="text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase px-1 mb-2">
                                            {sec.title}
                                        </h2>
                                        <div className="space-y-2.5">
                                            {sec.items.map((item) => (
                                                <article
                                                    key={item.id}
                                                    onClick={() => startStudySession(`${item.title} Review`, { subject: item.title })}
                                                    className="bg-white rounded-2xl p-3.5 flex items-center justify-between border border-[#EEF2F6] shadow-xs hover:border-neutral-300 hover:shadow-md transition-all cursor-pointer group"
                                                >
                                                    <div className="flex items-center space-x-3.5">
                                                        <div className={`w-10 h-10 rounded-xl ${item.bgClass || 'bg-red-50'} flex items-center justify-center text-xl transition-transform group-hover:scale-105`}>
                                                            {item.emoji}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-bold text-neutral-800 group-hover:text-neutral-900">
                                                                {item.title}
                                                            </h3>
                                                            <p className="text-xs text-neutral-400 font-normal mt-0.5">
                                                                {item.cardsCount.toLocaleString()} Cards
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {item.isSaved && (
                                                            <span className="text-amber-500 text-xs" title="Saved">
                                                                ★
                                                            </span>
                                                        )}
                                                        {item.isNew && (
                                                            <span className="bg-[#FFF0F0] text-[#EB5757] text-[0.72rem] font-medium px-2.5 py-0.5 rounded-full">
                                                                New
                                                            </span>
                                                        )}
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </section>
                    )}

                    {/* ============================================== */}
                    {/* TAB 2: THEMES VIEW                             */}
                    {/* ============================================== */}
                    {activeTab === 'themes' && (
                        <section className="block animate-in fade-in duration-200" id="view-themes">
                            {/* Filter chips for Themes */}
                            <div className="flex items-center space-x-2 py-2 mb-3" data-purpose="themes-filters">
                                {/* All (active) */}
                                <button
                                    onClick={() => setThemeFilter('all')}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-xs transition cursor-pointer ${
                                        themeFilter === 'all'
                                            ? 'bg-[#EF4444] text-white'
                                            : 'bg-white border border-neutral-200 text-neutral-700'
                                    }`}
                                >
                                    All
                                </button>
                                {/* High Yield */}
                                <button
                                    onClick={() => setThemeFilter('high_yield')}
                                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                                        themeFilter === 'high_yield'
                                            ? 'bg-[#EF4444] text-white border-transparent'
                                            : 'bg-white border border-neutral-200 text-neutral-700'
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                    <span>High Yield</span>
                                </button>
                                {/* Image */}
                                <button
                                    onClick={() => setThemeFilter('image')}
                                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                                        themeFilter === 'image'
                                            ? 'bg-[#EF4444] text-white border-transparent'
                                            : 'bg-white border border-neutral-200 text-neutral-700'
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <rect height="18" rx="2" width="18" x="3" y="3" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <path d="m21 15-5-5L5 21" />
                                    </svg>
                                    <span>Image</span>
                                </button>
                            </div>

                            {/* Themes List */}
                            <div className="space-y-2.5" data-purpose="themes-list">
                                {filteredThemes.map((theme) => (
                                    <article
                                        key={theme.id}
                                        onClick={() => startStudySession(`${theme.title} Theme`, { theme: theme.id })}
                                        className="bg-white rounded-2xl p-3.5 flex items-center justify-between border border-[#EEF2F6] shadow-xs hover:border-neutral-300 hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center space-x-3.5">
                                            <div className={`w-11 h-11 rounded-xl ${theme.bgClass || 'bg-neutral-100'} flex items-center justify-center text-xl transition-transform group-hover:scale-105`}>
                                                {theme.emoji}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-neutral-800">
                                                    {theme.title}
                                                </h3>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className="text-xs text-neutral-400">
                                                        {theme.cardsCount.toLocaleString()} Cards
                                                    </span>
                                                    <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-neutral-400 h-full rounded-full transition-all"
                                                            style={{ width: `${theme.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ============================================== */}
                    {/* TAB 3: MY DECKS VIEW                           */}
                    {/* ============================================== */}
                    {activeTab === 'decks' && (
                        <section className="block animate-in fade-in duration-200" id="view-decks">
                            {/* Anki Promotion Banner Card */}
                            <article className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-xs relative overflow-hidden mb-4" data-purpose="anki-banner">
                                <div className="flex justify-between items-start">
                                    <div className="max-w-[70%]">
                                        <h2 className="text-base font-bold text-neutral-800">Import Your Cards from Anki</h2>
                                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                            Enhance your flashcards with our AI, and access them on your Tablet, Mobile and Web!
                                        </p>
                                    </div>
                                    {/* Decorative Anki Graphic */}
                                    <div className="relative w-16 h-16 flex flex-col items-center justify-between">
                                        <div className="w-7 h-7 bg-slate-800 rounded-md border-2 border-white shadow-md flex items-center justify-center text-[10px] text-amber-300">
                                            ⭐
                                        </div>
                                        {/* Curved Arrow Graphic */}
                                        <svg className="w-8 h-8 text-neutral-300 -my-1 transform rotate-12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center text-white text-[10px] shadow-xs font-bold">
                                            ★
                                        </div>
                                    </div>
                                </div>
                                {/* Banner Action Button */}
                                <button
                                    onClick={() => setAnkiModalOpen(true)}
                                    className="w-full mt-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 tracking-wider hover:bg-neutral-50 active:scale-[0.99] transition-all uppercase cursor-pointer"
                                >
                                    Import My Deck
                                </button>
                            </article>

                            {/* Sub Filter Chips for My Decks */}
                            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-2 mb-6" data-purpose="deck-filters">
                                <button
                                    onClick={() => setDeckFilter('all')}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-xs transition cursor-pointer ${
                                        deckFilter === 'all'
                                            ? 'bg-[#EF4444] text-white'
                                            : 'bg-white border border-neutral-200 text-neutral-700'
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setDeckFilter('custom')}
                                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                                        deckFilter === 'custom'
                                            ? 'bg-[#EF4444] text-white'
                                            : 'bg-white border border-neutral-200 text-neutral-700'
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>Custom Decks</span>
                                </button>
                                <button
                                    onClick={() => setDeckFilter('anki')}
                                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                                        deckFilter === 'anki'
                                            ? 'bg-[#EF4444] text-white'
                                            : 'bg-white border border-neutral-200 text-neutral-700'
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>Anki</span>
                                </button>
                                <button
                                    onClick={() => setDeckFilter('my_cards')}
                                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                                        deckFilter === 'my_cards'
                                            ? 'bg-[#EF4444] text-white'
                                            : 'bg-white border border-neutral-200 text-neutral-700'
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>My Cards</span>
                                </button>
                            </div>

                            {/* Decks Listing or Empty State */}
                            {filteredDecks.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredDecks.map((deck) => (
                                        <article
                                            key={deck.id}
                                            onClick={() => startStudySession(deck.title)}
                                            className="bg-white rounded-2xl p-4 flex items-center justify-between border border-[#EEF2F6] shadow-xs hover:border-neutral-300 hover:shadow-md transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center space-x-3.5">
                                                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-xl">
                                                    {deck.type === 'anki' ? '⭐' : '📝'}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-neutral-800">
                                                        {deck.title}
                                                    </h3>
                                                    <p className="text-xs text-neutral-400 mt-0.5">
                                                        {deck.cardsCount.toLocaleString()} Cards • {deck.lastReviewed}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600" />
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-10 pb-16 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3 text-xl">
                                        🗂️
                                    </div>
                                    <p className="text-xs font-medium text-[#94A3B8]">No decks found</p>
                                    <button
                                        onClick={() => setCreateModalOpen(true)}
                                        className="mt-3 text-xs font-semibold text-[#F06560] hover:underline"
                                    >
                                        + Create your first custom deck
                                    </button>
                                </div>
                            )}
                        </section>
                    )}
                </main>
                {/* END: MainContentArea */}

                {/* BEGIN: FloatingCortexAiPill */}
                <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-sm px-4 z-40" data-purpose="floating-ai-assistant">
                    <button
                        onClick={() => setCortexModalOpen(true)}
                        className="w-full bg-white rounded-full py-2 px-3 flex items-center shadow-lg border border-neutral-200/80 hover:bg-neutral-50 active:scale-98 transition-all cursor-pointer"
                    >
                        {/* Cute blue robot avatar icon with live status */}
                        <div className="w-7 h-7 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center text-sm shadow-2xs shrink-0 mr-3 relative">
                            <span>🤖</span>
                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 flex-1 text-left">Ask Cortex AI anything</span>
                        <span className="text-[10px] bg-blue-50 text-[#1872F4] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-100">
                            <Sparkles className="w-3 h-3 text-[#1872F4]" />
                            <span>AI Tutor</span>
                        </span>
                    </button>
                </div>
                {/* END: FloatingCortexAiPill */}

                {/* BEGIN: BottomNavigationBar */}
                <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-neutral-200 px-3 pt-1.5 pb-5 z-50 flex justify-around items-center" data-purpose="bottom-nav">
                    {/* Nav Item 1: Quiz */}
                    <Link
                        className="flex flex-col items-center justify-center flex-1 py-1 text-neutral-500 hover:text-neutral-800 transition-colors"
                        href="/qbank/runner"
                    >
                        <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" strokeLinecap="round" />
                        </svg>
                        <span className="text-[10px] font-semibold">Quiz</span>
                    </Link>

                    {/* Nav Item 2: Lessons */}
                    <Link
                        className="flex flex-col items-center justify-center flex-1 py-1 text-neutral-500 hover:text-neutral-800 transition-colors"
                        href="/directory"
                    >
                        <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                            <polygon fill="currentColor" points="10 8 14 10.5 10 13 10 8" />
                        </svg>
                        <span className="text-[10px] font-semibold">Lessons</span>
                    </Link>

                    {/* Nav Item 3: Home */}
                    <Link
                        className="flex flex-col items-center justify-center flex-1 py-1 text-neutral-500 hover:text-neutral-800 transition-colors"
                        href="/dashboard"
                    >
                        <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[10px] font-semibold">Home</span>
                    </Link>

                    {/* Nav Item 4: Flashcards (ACTIVE TAB) */}
                    <div className="flex flex-col items-center justify-center flex-1 py-0.5 text-[#2563EB] cursor-pointer">
                        <div className="bg-[#DCEBFD] px-4 py-1 rounded-full mb-0.5 transition-all">
                            <svg className="w-5 h-5 text-[#2563EB]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-bold text-[#2563EB]">Flashcards</span>
                    </div>

                    {/* Nav Item 5: Play */}
                    <Link
                        className="flex flex-col items-center justify-center flex-1 py-1 text-neutral-500 hover:text-neutral-800 transition-colors"
                        href="/play"
                    >
                        <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a2 2 0 012 2v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a2 2 0 01-2 2h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a2 2 0 01-2-2v-3a1 1 0 00-1-1H3a2 2 0 01-2-2v-3a2 2 0 012-2h1a1 1 0 001-1V7a2 2 0 012-2h3a1 1 0 001-1V4z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[10px] font-semibold">Play</span>
                    </Link>
                </nav>
                {/* END: BottomNavigationBar */}

                {/* BEGIN: iOSHomeIndicator */}
                <div className="fixed bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-neutral-900/40 rounded-full z-50 pointer-events-none" />
                {/* END: iOSHomeIndicator */}
            </div>

            {/* ========================================================= */}
            {/* INTERACTIVE FLASHCARD STUDY RUNNER OVERLAY               */}
            {/* ========================================================= */}
            {studySessionActive && (
                <div className="fixed inset-0 z-60 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
                        {/* Session Top Bar */}
                        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
                            <div className="flex items-center space-x-2">
                                <span className="bg-[#FFF0F0] text-[#EB5757] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                    {sessionTitle}
                                </span>
                                <span className="text-xs text-neutral-400 font-mono">
                                    {currentCardIndex + 1} / {studyCards.length}
                                </span>
                            </div>
                            <button
                                onClick={() => setStudySessionActive(false)}
                                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-neutral-100 h-1">
                            <div
                                className="bg-[#F06560] h-full transition-all duration-300"
                                style={{
                                    width: `${((currentCardIndex + 1) / studyCards.length) * 100}%`,
                                }}
                            />
                        </div>

                        {/* Card Content, Loading State, or Completion Screen */}
                        {isLoadingCards ? (
                            <div className="p-12 flex-1 flex flex-col items-center justify-center text-center min-h-[300px]">
                                <Loader2 className="w-8 h-8 text-[#F06560] animate-spin mb-3" />
                                <p className="text-sm font-semibold text-neutral-700">Loading High-Yield Flashcards...</p>
                                <p className="text-xs text-neutral-400 mt-1">Retrieving dynamic clinical concepts from database</p>
                            </div>
                        ) : !sessionCompleted ? (
                            <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto">
                                <div>
                                    <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
                                        <span className="font-semibold text-neutral-600">
                                            {studyCards[currentCardIndex]?.subject} • {studyCards[currentCardIndex]?.topic}
                                        </span>
                                        <span className="text-[11px] text-[#F06560] font-medium flex items-center space-x-1">
                                            <Zap className="w-3 h-3" />
                                            <span>FSRS Active</span>
                                        </span>
                                    </div>

                                    {/* 3D Flip Card Container */}
                                    <div
                                        onClick={() => setIsFlipped(!isFlipped)}
                                        className="min-h-[220px] rounded-2xl border border-neutral-200/90 p-5 bg-[#FCFDFF] shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#F06560]/40 transition group"
                                    >
                                        {!isFlipped ? (
                                            <div>
                                                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                                    Prompt / Question
                                                </div>
                                                <p className="text-sm font-medium leading-relaxed text-neutral-900 whitespace-pre-line">
                                                    {studyCards[currentCardIndex]?.front}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-150">
                                                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center space-x-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Clinical Key & Explanation</span>
                                                </div>
                                                <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-line font-normal">
                                                    {studyCards[currentCardIndex]?.back}
                                                </p>
                                                {studyCards[currentCardIndex]?.pearl && (
                                                    <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                                                        <strong className="font-bold block mb-0.5">🧠 High-Yield Memory Peg:</strong>
                                                        {studyCards[currentCardIndex]?.pearl}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                                            <span>{isFlipped ? 'Answer Revealed' : 'Tap anywhere to flip card'}</span>
                                            <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </div>

                                {/* Rating Buttons (shown when flipped or ready) */}
                                {isFlipped ? (
                                    <div className="mt-4 space-y-2 animate-in fade-in duration-150">
                                        <div className="text-[11px] font-medium text-neutral-500 text-center">
                                            How well did you recall this clinical concept?
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            <button
                                                onClick={() => handleCardRating('again')}
                                                className="py-2.5 px-1 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex flex-col items-center justify-center text-xs font-semibold border border-rose-200 transition cursor-pointer"
                                            >
                                                <span>Again</span>
                                                <span className="text-[10px] opacity-75 font-normal">&lt;10m</span>
                                            </button>
                                            <button
                                                onClick={() => handleCardRating('hard')}
                                                className="py-2.5 px-1 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 flex flex-col items-center justify-center text-xs font-semibold border border-amber-200 transition cursor-pointer"
                                            >
                                                <span>Hard</span>
                                                <span className="text-[10px] opacity-75 font-normal">2d</span>
                                            </button>
                                            <button
                                                onClick={() => handleCardRating('good')}
                                                className="py-2.5 px-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 flex flex-col items-center justify-center text-xs font-semibold border border-blue-200 transition cursor-pointer"
                                            >
                                                <span>Good</span>
                                                <span className="text-[10px] opacity-75 font-normal">7d</span>
                                            </button>
                                            <button
                                                onClick={() => handleCardRating('easy')}
                                                className="py-2.5 px-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex flex-col items-center justify-center text-xs font-semibold border border-emerald-200 transition cursor-pointer"
                                            >
                                                <span>Easy</span>
                                                <span className="text-[10px] opacity-75 font-normal">21d</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsFlipped(true)}
                                        className="mt-4 w-full py-3 rounded-xl bg-[#F06560] text-white text-xs font-bold hover:bg-[#D94843] active:scale-98 transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>Show Answer & Explanation</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="p-8 text-center flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mb-4 shadow-xs">
                                    🎉
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900">Session Complete!</h3>
                                <p className="text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed">
                                    You reviewed {reviewedCount} flashcards. Your long-term memory stability has been updated in the FSRS spaced repetition engine.
                                </p>
                                <button
                                    onClick={() => setStudySessionActive(false)}
                                    className="mt-6 w-full py-2.5 rounded-xl bg-[#F06560] text-white font-bold text-xs hover:bg-[#D94843] transition cursor-pointer"
                                >
                                    Return to Flashcards Hub
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* CREATE FLASHCARD DECK MODAL                               */}
            {/* ========================================================= */}
            {createModalOpen && (
                <div className="fixed inset-0 z-60 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                            <h3 className="text-base font-bold text-neutral-900">Create Custom Deck</h3>
                            <button
                                onClick={() => setCreateModalOpen(false)}
                                className="text-neutral-400 hover:text-neutral-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateDeck} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                    Deck Name
                                </label>
                                <input
                                    type="text"
                                    value={newDeckTitle}
                                    onChange={(e) => setNewDeckTitle(e.target.value)}
                                    placeholder="e.g. Cardiology Heart Murmurs & ECGs"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#F06560] focus:ring-1 focus:ring-[#F06560]"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                    Target Medical Specialty
                                </label>
                                <select
                                    value={newDeckCategory}
                                    onChange={(e) => setNewDeckCategory(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 focus:outline-none focus:border-[#F06560]"
                                >
                                    <option value="Anatomy">Anatomy</option>
                                    <option value="Physiology">Physiology</option>
                                    <option value="Biochemistry">Biochemistry</option>
                                    <option value="Pathology">Pathology</option>
                                    <option value="Pharmacology">Pharmacology</option>
                                    <option value="Internal Medicine">Internal Medicine</option>
                                    <option value="Surgery">Surgery</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                </select>
                            </div>
                            <div className="pt-2 flex items-center justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newDeckTitle.trim()}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#F06560] text-white hover:bg-[#D94843] disabled:opacity-50 transition cursor-pointer"
                                >
                                    Save Deck
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* ANKI IMPORT MODAL                                         */}
            {/* ========================================================= */}
            {ankiModalOpen && (
                <div className="fixed inset-0 z-60 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                            <div className="flex items-center space-x-2">
                                <span className="text-xl">⭐</span>
                                <h3 className="text-base font-bold text-neutral-900">Import Anki Package (.apkg)</h3>
                            </div>
                            <button
                                onClick={() => setAnkiModalOpen(false)}
                                className="text-neutral-400 hover:text-neutral-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mt-4 space-y-4">
                            <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 text-center hover:border-[#F06560] transition cursor-pointer">
                                <UploadCloud className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
                                <p className="text-xs font-bold text-neutral-700">Drag & drop your Anki deck file here</p>
                                <p className="text-[11px] text-neutral-400 mt-1">Supports .apkg and .colpkg archives</p>
                            </div>
                            <div className="rounded-xl bg-blue-50/70 p-3 text-xs text-blue-900 border border-blue-200/50 leading-relaxed">
                                <strong>AI Enhancement:</strong> Cortex will automatically cross-reference imported cards with our 19 medical subjects and generate mnemonic rationales.
                            </div>
                            <button
                                onClick={handleImportAnki}
                                className="w-full py-2.5 rounded-xl bg-[#2563EB] text-white font-bold text-xs hover:bg-blue-700 transition cursor-pointer"
                            >
                                Import Preloaded USMLE Step 1 Deck (14.2k Cards)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* CORTEX AI CLINICAL TUTOR DRAWER / MODAL                   */}
            {/* ========================================================= */}
            {cortexModalOpen && (
                <div className="fixed inset-0 z-60 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[640px] max-h-[92vh]">
                        {/* Header */}
                        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-blue-50/90 to-sky-50/70">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center text-lg shadow-xs relative">
                                    <span>🤖</span>
                                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-xs" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Dr. Cortex AI</h3>
                                        <span className="bg-blue-100 text-[#1872F4] text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-200">
                                            Clinical AI Tutor
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-neutral-500">Board Landmarks • Spaced Repetition Pearls • Differential Reasoning</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-[11px] font-semibold text-neutral-500 bg-white/80 border border-neutral-200 px-2 py-0.5 rounded-full">
                                    ⚡ {cortexCredits} credits
                                </span>
                                <button
                                    onClick={() => setCortexModalOpen(false)}
                                    className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Mode Switcher */}
                        <div className="px-4 py-2 border-b border-neutral-100 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                            {(['Board Tutor', 'Mnemonics', 'Differentials', 'Next Step'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setCortexMode(mode)}
                                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
                                        cortexMode === mode
                                            ? 'bg-[#1872F4] text-white shadow-xs'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        {/* Chat Messages Body */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#F8FAFC]">
                            {cortexMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                                            msg.sender === 'user'
                                                ? 'bg-[#1872F4] text-white rounded-br-xs'
                                                : 'bg-white text-neutral-800 border border-neutral-200/80 rounded-bl-xs space-y-2.5'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{msg.text}</p>

                                        {/* Clinical Pearl Box */}
                                        {msg.clinicalPearl && (
                                            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-2.5 text-amber-950">
                                                <div className="flex items-center gap-1.5 font-bold text-[10px] text-amber-800 uppercase tracking-wider mb-0.5">
                                                    <span>💡</span>
                                                    <span>High-Yield Clinical Pearl</span>
                                                </div>
                                                <p className="text-[11px] leading-relaxed font-medium">{msg.clinicalPearl}</p>
                                            </div>
                                        )}

                                        {/* Emergency Step Box */}
                                        {msg.emergencyStep && (
                                            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-2.5 text-rose-950">
                                                <div className="flex items-center gap-1.5 font-bold text-[10px] text-rose-800 uppercase tracking-wider mb-0.5">
                                                    <span>🚨</span>
                                                    <span>Next Critical Emergency Step</span>
                                                </div>
                                                <p className="text-[11px] leading-relaxed font-medium">{msg.emergencyStep}</p>
                                            </div>
                                        )}

                                        {/* Related Topics Chips */}
                                        {msg.relatedTopics && msg.relatedTopics.length > 0 && (
                                            <div className="pt-1">
                                                <span className="text-[10px] font-bold text-neutral-400 block mb-1">
                                                    EXPLORE RELATED LANDMARKS:
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {msg.relatedTopics.map((topic, i) => (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            onClick={() => handleSendCortexAi(undefined, topic)}
                                                            className="text-[10.5px] font-medium bg-blue-50 text-[#1872F4] hover:bg-blue-100 border border-blue-200/80 px-2 py-0.5 rounded-full transition cursor-pointer"
                                                        >
                                                            {topic} →
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {cortexIsTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-neutral-200/80 rounded-2xl rounded-bl-xs px-3.5 py-2.5 shadow-xs flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                        <span className="text-[11px] text-neutral-500 font-medium ml-1">
                                            Dr. Cortex AI is reasoning...
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Prompts */}
                        <div className="px-3 py-2 bg-white border-t border-neutral-100 flex items-center space-x-2 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => handleSendCortexAi(undefined, 'Explain Beck Triad for cardiac tamponade')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                🫀 Beck’s Triad
                            </button>
                            <button
                                onClick={() => handleSendCortexAi(undefined, 'Cranial nerve exit foramina and clinical lesions')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                🧠 Cranial Nerves
                            </button>
                            <button
                                onClick={() => handleSendCortexAi(undefined, 'Loop vs Thiazide diuretics electrolyte differences')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                💊 Diuretics
                            </button>
                            <button
                                onClick={() => handleSendCortexAi(undefined, 'Tension pneumothorax signs and needle decompression')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                ⚡ Tension Pneumothorax
                            </button>
                            <button
                                onClick={() => handleSendCortexAi(undefined, 'SAD PUCKER retroperitoneal organs mnemonic')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                🧬 SAD PUCKER
                            </button>
                        </div>

                        {/* Input Bar */}
                        <form onSubmit={(e) => handleSendCortexAi(e)} className="p-3 bg-white border-t border-neutral-200 flex items-center space-x-2">
                            <input
                                type="text"
                                value={cortexQuery}
                                onChange={(e) => setCortexQuery(e.target.value)}
                                placeholder="Ask Cortex AI anything (e.g. Beck triad, loops vs thiazides)..."
                                disabled={cortexIsTyping}
                                className="flex-1 px-3.5 py-2.5 rounded-full border border-neutral-200 text-xs text-neutral-800 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!cortexQuery.trim() || cortexIsTyping}
                                className="w-9 h-9 rounded-full bg-[#1872F4] text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 transition cursor-pointer shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
