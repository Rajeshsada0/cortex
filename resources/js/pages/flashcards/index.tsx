import React, { useState, useMemo, useEffect } from 'react';
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
    SlidersHorizontal,
    FileSpreadsheet,
    Eye,
    Loader2,
    Trash2,
    Layers,
    Flame,
    GraduationCap,
    Filter,
    ExternalLink,
    Brain,
    Stethoscope,
    Tag,
    Clock,
    ArrowRight,
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
    difficulty?: string;
    is_high_yield?: boolean;
    is_past_year?: boolean;
    past_year?: string;
    deck_id?: string;
    deck_title?: string;
    created_at?: string;
}

interface DeckItem {
    id: string;
    title: string;
    cardsCount: number;
    type: 'anki' | 'custom';
    lastReviewed?: string;
    subject?: string;
}

interface FlashcardsPageProps {
    user: any;
    dueCount: number;
    sections: SectionGroup[];
    themes: ThemeItem[];
    sampleCards: FlashcardItem[];
    initialDecks?: DeckItem[];
    subjects?: Array<{ id: number; name: string; slug: string }>;
    customCards?: FlashcardItem[];
    totalCustomCardsCount?: number;
    totalQBankCount?: number;
}

export function cleanFlashcardAnswerText(raw?: string): string {
    if (!raw) return '';
    const lines = raw.split('\n');
    const cleanedParts: string[] = [];
    let firstLineAnswer: string | null = null;

    for (const line of lines) {
        let trimmed = line.trim();
        if (!trimmed) continue;

        // Remove "Key: D" or "Key: A"
        trimmed = trimmed.replace(/^Key:\s*[A-Ea-e][\.\:\-]?\s*/i, '');
        // Remove leading option letter e.g. "D. ", "A) ", "(B) ", "C - "
        trimmed = trimmed.replace(/^(\([A-Ea-e]\)|[A-Ea-e][\.\)\:\-]\s*)/i, '');
        // Remove "Ans. is 'd' i.e., " or "Ans is `d` i.e.," or "Ans: D" or "B i.e. "
        trimmed = trimmed.replace(/^Ans(\.|wer)?\s*(is|:)?\s*['"`\(\[]?[a-eA-E]['"`\)\]]?\s*(i\.e\.?,?|:|\-)?\s*/iu, '');
        trimmed = trimmed.replace(/^[a-eA-E]\s+i\.e\.?,?\s*/iu, '');
        trimmed = trimmed.replace(/^Option\s+['"`\(\[]?[a-eA-E]['"`\)\]]?\s*(is\s+(the\s+)?correct(\s+answer)?)?[\.\:\-]?\s*/iu, '');
        trimmed = trimmed.replace(/^Correct\s+answer\s+(is|:)\s*['"`\(\[]?[a-eA-E]['"`\)\]]?[\.\:\-]?\s*/iu, '');
        trimmed = trimmed.trim();

        if (!trimmed) continue;

        if (firstLineAnswer === null) {
            firstLineAnswer = trimmed;
            cleanedParts.push(trimmed);
        } else {
            // Deduplicate if identical to first line answer
            if (trimmed.toLowerCase() === firstLineAnswer.toLowerCase()) {
                continue;
            }
            if (trimmed.toLowerCase().startsWith(firstLineAnswer.toLowerCase())) {
                const rest = trimmed.slice(firstLineAnswer.length).replace(/^[\s\.\,\:\;\-]+/, '').trim();
                if (rest) {
                    cleanedParts.push(rest);
                }
                continue;
            }
            cleanedParts.push(trimmed);
        }
    }

    return cleanedParts.length > 0 ? cleanedParts.join('\n\n') : raw.trim();
}

export default function FlashcardsIndex({
    user,
    dueCount: initialDueCount = 14,
    sections: initialSections = [],
    themes: initialThemes = [],
    sampleCards = [],
    initialDecks = [],
    subjects = [],
    customCards = [],
    totalCustomCardsCount = 0,
    totalQBankCount = 0,
}: FlashcardsPageProps) {
    const [dueCount, setDueCount] = useState<number>(initialDueCount);

    // Tab state: 'subject' | 'themes' | 'decks' | 'cards'
    const [activeTab, setActiveTab] = useState<'subject' | 'themes' | 'decks' | 'cards'>('subject');

    // Search query
    const [searchQuery, setSearchQuery] = useState('');

    // Subject filters & sort
    const [subjectFilter, setSubjectFilter] = useState<'all' | 'saved' | 'high_yield'>('all');
    const [sortBy, setSortBy] = useState<'foundations' | 'count_desc' | 'alphabetical'>('foundations');

    // Themes filter
    const [themeFilter, setThemeFilter] = useState<'all' | 'high_yield' | 'image' | 'past_year'>('all');

    // Decks filter & custom user decks state
    const [deckFilter, setDeckFilter] = useState<'all' | 'custom' | 'anki' | 'my_cards'>('all');
    const [customDecks, setCustomDecks] = useState<DeckItem[]>(initialDecks);

    // Custom Cards State (all cards created by user)
    const [customCardsList, setCustomCardsList] = useState<FlashcardItem[]>(customCards);
    const [cardSearchQuery, setCardSearchQuery] = useState('');
    const [cardSubjectFilter, setCardSubjectFilter] = useState<string>('all');
    const [cardTagFilter, setCardTagFilter] = useState<'all' | 'hyq' | 'pyq'>('all');

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
    const [addCardModalOpen, setAddCardModalOpen] = useState(false);
    const [ankiModalOpen, setAnkiModalOpen] = useState(false);
    const [cortexModalOpen, setCortexModalOpen] = useState(false);

    // Form state for creating custom deck
    const [newDeckTitle, setNewDeckTitle] = useState('');
    const [newDeckCategory, setNewDeckCategory] = useState('Anatomy');
    const [isSavingDeck, setIsSavingDeck] = useState(false);

    // Form state for adding custom flashcard
    const [newCardFront, setNewCardFront] = useState('');
    const [newCardBack, setNewCardBack] = useState('');
    const [newCardPearl, setNewCardPearl] = useState('');
    const [newCardDeckId, setNewCardDeckId] = useState('');
    const [newCardSubjectId, setNewCardSubjectId] = useState('');
    const [newCardIsHighYield, setNewCardIsHighYield] = useState(false);
    const [newCardIsPastYear, setNewCardIsPastYear] = useState(false);
    const [newCardPastYear, setNewCardPastYear] = useState('');
    const [isSavingCard, setIsSavingCard] = useState(false);

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
            text: 'Hello Doctor! I am Dr. Cortex AI, your clinical spaced repetition tutor. Ask me to break down any flashcard, mnemonic, differential diagnosis, or landmark board question.',
            clinicalPearl: 'Active recall spaced at 1d, 3d, 7d, 21d increases board exam retention by 320% compared to passive reading.',
            emergencyStep: 'In acute clinical emergencies, always confirm Airway, Breathing, and Circulation (ABC) before secondary workups.',
            relatedTopics: ['Beck Triad', 'Cranial Nerves', 'Acid-Base Disorders', 'Loop Diuretics'],
        },
    ]);

    // Keyboard navigation for Study Session
    useEffect(() => {
        if (!studySessionActive || sessionCompleted || isLoadingCards) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.code === 'Space') {
                e.preventDefault();
                setIsFlipped((prev) => !prev);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setStudySessionActive(false);
            } else if (isFlipped) {
                if (e.key === '1') handleCardRating('again');
                else if (e.key === '2') handleCardRating('hard');
                else if (e.key === '3') handleCardRating('good');
                else if (e.key === '4') handleCardRating('easy');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [studySessionActive, isFlipped, sessionCompleted, isLoadingCards, currentCardIndex, studyCards]);

    // Filtered sections and items for Tab 1
    const filteredSections = useMemo(() => {
        return initialSections.map((sec) => {
            let items = [...sec.items];

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                items = items.filter((it) => it.title.toLowerCase().includes(q));
            }

            if (subjectFilter === 'saved') {
                items = items.filter((it) => it.isSaved);
            } else if (subjectFilter === 'high_yield') {
                items = items.filter((it) => it.isHighYield);
            }

            if (sortBy === 'count_desc') {
                items.sort((a, b) => b.cardsCount - a.cardsCount);
            } else if (sortBy === 'alphabetical') {
                items.sort((a, b) => a.title.localeCompare(b.title));
            }

            return {
                ...sec,
                items,
            };
        });
    }, [initialSections, searchQuery, subjectFilter, sortBy]);

    // Filtered themes for Tab 2
    const filteredThemes = useMemo(() => {
        let list = [...initialThemes];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter((th) => th.title.toLowerCase().includes(q));
        }

        if (themeFilter === 'high_yield') {
            list = list.filter((th) => th.isHighYield);
        } else if (themeFilter === 'image') {
            list = list.filter((th) => th.hasImage);
        }

        return list;
    }, [initialThemes, searchQuery, themeFilter]);

    // Filtered decks for Tab 3
    const filteredDecks = useMemo(() => {
        let list = [...customDecks];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter((d) => d.title.toLowerCase().includes(q));
        }

        if (deckFilter === 'custom') {
            list = list.filter((d) => d.type === 'custom');
        } else if (deckFilter === 'anki') {
            list = list.filter((d) => d.type === 'anki');
        }

        return list;
    }, [customDecks, searchQuery, deckFilter]);

    // Filtered custom cards list for Tab 4 (All Flashcards manager)
    const filteredCustomCards = useMemo(() => {
        let list = [...customCardsList];

        if (cardSearchQuery.trim()) {
            const q = cardSearchQuery.toLowerCase().trim();
            list = list.filter(
                (c) =>
                    c.front.toLowerCase().includes(q) ||
                    c.back.toLowerCase().includes(q) ||
                    (c.pearl && c.pearl.toLowerCase().includes(q)) ||
                    (c.subject && c.subject.toLowerCase().includes(q))
            );
        }

        if (cardSubjectFilter !== 'all') {
            list = list.filter((c) => c.subject === cardSubjectFilter);
        }

        if (cardTagFilter === 'hyq') {
            list = list.filter((c) => c.is_high_yield);
        } else if (cardTagFilter === 'pyq') {
            list = list.filter((c) => c.is_past_year);
        }

        return list;
    }, [customCardsList, cardSearchQuery, cardSubjectFilter, cardTagFilter]);

    // Launch Study Session
    const startStudySession = async (
        title: string,
        filterParams: { subject?: string; theme?: string; deckId?: string; isHighYield?: boolean; isPastYear?: boolean; source?: string } = {}
    ) => {
        setSessionTitle(title);
        setIsLoadingCards(true);
        setStudySessionActive(true);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setSessionCompleted(false);
        setReviewedCount(0);

        try {
            const params = new URLSearchParams();
            if (filterParams.subject) params.append('subject', filterParams.subject);
            if (filterParams.theme) params.append('theme', filterParams.theme);
            if (filterParams.deckId) params.append('deck_id', filterParams.deckId);
            if (filterParams.isHighYield) params.append('is_high_yield', '1');
            if (filterParams.isPastYear) params.append('is_past_year', '1');
            if (filterParams.source) params.append('source', filterParams.source);
            params.append('limit', '20');

            const res = await fetch(`/flashcards/cards?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                if (data.cards && data.cards.length > 0) {
                    setStudyCards(data.cards);
                } else if (sampleCards.length > 0) {
                    setStudyCards(sampleCards);
                } else {
                    setStudyCards([
                        {
                            id: 'fallback-1',
                            subject: 'General Medicine',
                            topic: 'Clinical Diagnostic Criteria',
                            front: 'What are the classic diagnostic signs of Cardiac Tamponade (Beck\'s Triad)?',
                            back: '1. Hypotension with narrowed pulse pressure\n2. Elevated jugular venous pressure (distended neck veins)\n3. Muffled heart sounds on auscultation.',
                            pearl: 'Pulsus paradoxus (>10 mmHg inspiratory drop in systolic blood pressure) and electrical alternans on ECG.',
                        },
                    ]);
                }
            } else {
                setStudyCards(sampleCards.length > 0 ? sampleCards : []);
            }
        } catch (err) {
            console.error('Error fetching study cards:', err);
            setStudyCards(sampleCards);
        } finally {
            setIsLoadingCards(false);
        }
    };

    // Open Add Card modal pre-configured for a subject or deck
    const openAddCardForSubject = (subjectTitle: string) => {
        const found = subjects.find((s) => s.name.toLowerCase() === subjectTitle.toLowerCase());
        if (found) {
            setNewCardSubjectId(String(found.id));
        }
        setAddCardModalOpen(true);
    };

    const openAddCardForDeck = (deckId: string) => {
        setNewCardDeckId(deckId);
        setAddCardModalOpen(true);
    };

    // Handle Card Rating in Study Session (FSRS / SM-2 spaced repetition engine)
    const handleCardRating = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
        const activeCard = studyCards[currentCardIndex];
        const newCount = reviewedCount + 1;
        setReviewedCount(newCount);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            await fetch('/flashcards/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({
                    question_id: activeCard?.id,
                    rating,
                }),
            });
        } catch (e) {
            console.warn('Silent review sync error:', e);
        }

        if (currentCardIndex + 1 < studyCards.length) {
            setCurrentCardIndex((prev) => prev + 1);
            setIsFlipped(false);
        } else {
            setSessionCompleted(true);
            setDueCount((prev) => Math.max(0, prev - newCount));
            toast.success(`Session Complete! ${newCount} cards reviewed.`);
        }
    };

    // Create custom deck with backend persistence
    const handleCreateDeck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDeckTitle.trim() || isSavingDeck) return;
        setIsSavingDeck(true);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch('/flashcards/decks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({
                    title: newDeckTitle.trim(),
                    category: newDeckCategory,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const createdDeck: DeckItem = data.deck || {
                    id: 'deck-' + Date.now(),
                    title: newDeckTitle.trim(),
                    cardsCount: 0,
                    type: 'custom',
                    lastReviewed: 'Just now',
                };
                setCustomDecks((prev) => [createdDeck, ...prev]);
                setNewDeckTitle('');
                setCreateModalOpen(false);
                setActiveTab('decks');
                toast.success(`Deck "${createdDeck.title}" created!`);
            } else {
                toast.error('Failed to create deck.');
            }
        } catch (err) {
            toast.error('Network error creating deck.');
        } finally {
            setIsSavingDeck(false);
        }
    };

    // Delete custom deck with backend persistence
    const handleDeleteDeck = async (deckId: string, deckTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete deck "${deckTitle}"? All associated cards in this deck will be deleted.`)) return;

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch(`/flashcards/decks/${deckId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
            });

            if (res.ok) {
                setCustomDecks((prev) => prev.filter((d) => d.id !== deckId));
                setCustomCardsList((prev) => prev.filter((c) => c.deck_id !== deckId));
                toast.success(`Deck "${deckTitle}" deleted.`);
            } else {
                toast.error('Failed to delete deck.');
            }
        } catch (err) {
            toast.error('Network error deleting deck.');
        }
    };

    // Delete custom card with backend persistence
    const handleDeleteCard = async (cardId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm('Are you sure you want to delete this flashcard?')) return;

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch(`/flashcards/cards/${cardId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
            });

            if (res.ok) {
                setCustomCardsList((prev) => prev.filter((c) => c.id !== cardId));
                setStudyCards((prev) => prev.filter((c) => c.id !== cardId));
                toast.success('Flashcard deleted successfully.');
            } else {
                toast.error('Failed to delete flashcard.');
            }
        } catch (err) {
            toast.error('Network error deleting card.');
        }
    };

    // Create custom flashcard with backend persistence
    const handleCreateCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCardFront.trim() || !newCardBack.trim() || isSavingCard) return;
        setIsSavingCard(true);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch('/flashcards/cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({
                    front: newCardFront.trim(),
                    back: newCardBack.trim(),
                    pearl: newCardPearl.trim() || null,
                    deck_id: newCardDeckId || null,
                    subject_id: newCardSubjectId ? Number(newCardSubjectId) : null,
                    is_high_yield: newCardIsHighYield,
                    is_past_year: newCardIsPastYear,
                    past_year: newCardPastYear.trim() || null,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const targetSubject = subjects.find((s) => s.id === Number(newCardSubjectId));
                const targetDeck = customDecks.find((d) => d.id === newCardDeckId);

                const createdCard: FlashcardItem = data.card || {
                    id: 'fc-' + Date.now(),
                    front: newCardFront.trim(),
                    back: newCardBack.trim(),
                    pearl: newCardPearl.trim() || '',
                    subject: targetSubject?.name || 'General Medicine',
                    topic: targetDeck?.title || 'Clinical Pearl',
                    deck_id: newCardDeckId || undefined,
                    deck_title: targetDeck?.title || undefined,
                    is_high_yield: newCardIsHighYield,
                    is_past_year: newCardIsPastYear,
                    past_year: newCardPastYear.trim() || undefined,
                    created_at: 'Just now',
                };

                setCustomCardsList((prev) => [createdCard, ...prev]);
                toast.success('Flashcard saved successfully!');
                setAddCardModalOpen(false);
                setNewCardFront('');
                setNewCardBack('');
                setNewCardPearl('');
                setNewCardIsHighYield(false);
                setNewCardIsPastYear(false);
                setNewCardPastYear('');

                if (newCardDeckId) {
                    setCustomDecks((prev) =>
                        prev.map((d) => (d.id === newCardDeckId ? { ...d, cardsCount: (d.cardsCount || 0) + 1 } : d))
                    );
                }
            } else {
                toast.error('Failed to save flashcard.');
            }
        } catch (err) {
            toast.error('Network error saving card.');
        } finally {
            setIsSavingCard(false);
        }
    };

    // Simulate Anki Import
    const handleImportAnki = () => {
        const ankiDeck: DeckItem = {
            id: 'anki-' + Date.now(),
            title: 'Anki AnKing Step 1 Comprehensive',
            cardsCount: 14200,
            type: 'anki' as const,
            lastReviewed: 'Imported today',
            subject: 'USMLE Integrated',
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
                // Fallback simulation
                setTimeout(() => {
                    setCortexMessages((prev) => [
                        ...prev,
                        {
                            id: `ai-${Date.now()}`,
                            sender: 'ai',
                            text: `Regarding "${text}": In board exams, focus on the hallmark clinical differentiator, immediate diagnostic investigation of choice, and first-line intervention.`,
                            clinicalPearl: 'High-yield landmark: Pair clinical presentation with pathophysiological hallmarks for rapid 30-second recall.',
                            relatedTopics: ['Pathophysiology', 'First-Line Pharmacotherapy', 'Board Landmarks'],
                        },
                    ]);
                }, 400);
            }
        } catch (err) {
            console.error('Cortex AI chat error:', err);
        } finally {
            setCortexIsTyping(false);
        }
    };

    const totalCalculatedCards = totalCustomCardsCount + (totalQBankCount > 0 ? totalQBankCount : 25684);

    return (
        <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto selection:bg-rose-100 selection:text-rose-600 font-sans">
            <Head title="Flashcards Hub - Medical Learning & Spaced Repetition" />

            {/* ========================================================= */}
            {/* 1. TOP HEADER & PRIMARY DESKTOP CONTROLS                 */}
            {/* ========================================================= */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-neutral-200/80">
                <div>
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                                    Interactive Flashcards Hub
                                </h1>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                                    FSRS 5-Stage SRS
                                </span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                Cognitive spaced repetition • Board exam landmarks, high-yield pearls & custom candidate decks
                            </p>
                        </div>
                    </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Primary Button: + Create Flashcard */}
                    <button
                        type="button"
                        onClick={() => setAddCardModalOpen(true)}
                        className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-semibold text-xs shadow-sm shadow-rose-200 active:scale-98 transition cursor-pointer"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Create Flashcard</span>
                    </button>

                    {/* Button: + New Deck */}
                    <button
                        type="button"
                        onClick={() => setCreateModalOpen(true)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs border border-neutral-300 shadow-2xs active:scale-98 transition cursor-pointer"
                    >
                        <Plus className="w-4 h-4 text-rose-500" />
                        <span>New Deck</span>
                    </button>

                    {/* Daily Review Button */}
                    <button
                        type="button"
                        onClick={() => startStudySession('Daily Recall Review', { source: 'due' })}
                        className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 font-semibold text-xs border border-neutral-300 shadow-2xs active:scale-98 transition cursor-pointer"
                    >
                        <Calendar className="w-4 h-4 text-rose-500" />
                        <span>Daily Review</span>
                        {dueCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                                {dueCount}
                            </span>
                        )}
                    </button>

                    {/* Anki Import */}
                    <button
                        type="button"
                        onClick={() => setAnkiModalOpen(true)}
                        className="inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs border border-neutral-300 shadow-2xs active:scale-98 transition cursor-pointer"
                        title="Import Anki .apkg"
                    >
                        <UploadCloud className="w-4 h-4 text-blue-500" />
                        <span>Import Anki</span>
                    </button>

                    {/* Dr. Cortex AI Tutor */}
                    <button
                        type="button"
                        onClick={() => setCortexModalOpen(true)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1872F4] font-semibold text-xs border border-blue-200 shadow-2xs active:scale-98 transition cursor-pointer"
                    >
                        <Bot className="w-4 h-4 text-[#1872F4]" />
                        <span>Dr. Cortex AI</span>
                    </button>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 2. STATS OVERVIEW ROW (4 METRIC TILES)                    */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Cards */}
                <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Flashcards</p>
                        <h3 className="text-2xl font-black text-neutral-900 mt-1">
                            {totalCalculatedCards.toLocaleString()}
                        </h3>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                            {customCardsList.length} custom • {totalQBankCount > 0 ? totalQBankCount.toLocaleString() : '25k+'} Q-Bank
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1872F4] flex items-center justify-center text-xl font-bold">
                        <BookOpen className="w-6 h-6" />
                    </div>
                </div>

                {/* Due for Review */}
                <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Due For Review</p>
                        <h3 className="text-2xl font-black text-rose-600 mt-1">
                            {dueCount} <span className="text-sm font-normal text-neutral-500">cards</span>
                        </h3>
                        <button
                            onClick={() => startStudySession('Daily Recall Review', { source: 'due' })}
                            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 mt-0.5 cursor-pointer"
                        >
                            <span>Review queue</span>
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                        <Repeat className="w-6 h-6" />
                    </div>
                </div>

                {/* High-Yield Board Landmarks */}
                <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">High-Yield Pearls</p>
                        <h3 className="text-2xl font-black text-amber-500 mt-1">13,180+</h3>
                        <p className="text-[11px] text-neutral-500 mt-0.5">USMLE & MECEE-PG focus</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                        <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
                    </div>
                </div>

                {/* Custom Decks */}
                <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">My Custom Decks</p>
                        <h3 className="text-2xl font-black text-emerald-600 mt-1">{customDecks.length}</h3>
                        <button
                            onClick={() => {
                                setActiveTab('decks');
                                setCreateModalOpen(true);
                            }}
                            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-0.5 cursor-pointer"
                        >
                            <span>+ Create new deck</span>
                        </button>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 3. DESKTOP TAB BAR & GLOBAL SEARCH                        */}
            {/* ========================================================= */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-2 rounded-2xl border border-neutral-200/90 shadow-2xs">
                {/* 4 Segmented Tabs */}
                <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setActiveTab('subject')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                            activeTab === 'subject'
                                ? 'bg-white text-neutral-900 shadow-xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        By Subject
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('themes')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                            activeTab === 'themes'
                                ? 'bg-white text-neutral-900 shadow-xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        Themes & Curated
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('decks')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                            activeTab === 'decks'
                                ? 'bg-white text-neutral-900 shadow-xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        My Decks ({customDecks.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('cards')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'cards'
                                ? 'bg-rose-500 text-white shadow-xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        <span>All Flashcards</span>
                        <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                activeTab === 'cards' ? 'bg-rose-700 text-white' : 'bg-neutral-200 text-neutral-700'
                            }`}
                        >
                            {customCardsList.length}
                        </span>
                    </button>
                </div>

                {/* Search Bar */}
                {activeTab !== 'cards' && (
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter flashcard collections..."
                            className="w-full pl-9 pr-8 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ========================================================= */}
            {/* 4. TAB CONTENT 1: BY SUBJECT                              */}
            {/* ========================================================= */}
            {activeTab === 'subject' && (
                <div className="space-y-6">
                    {/* Filter and sorting pills */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Filter:</span>
                            <button
                                type="button"
                                onClick={() => setSubjectFilter('all')}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                                    subjectFilter === 'all'
                                        ? 'bg-neutral-900 text-white'
                                        : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
                                }`}
                            >
                                All Subjects
                            </button>
                            <button
                                type="button"
                                onClick={() => setSubjectFilter('high_yield')}
                                className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                                    subjectFilter === 'high_yield'
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
                                }`}
                            >
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span>High-Yield Only</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSubjectFilter('saved')}
                                className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                                    subjectFilter === 'saved'
                                        ? 'bg-rose-500 text-white'
                                        : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
                                }`}
                            >
                                <Bookmark className="w-3.5 h-3.5 fill-current" />
                                <span>Saved Bookmarks</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => startStudySession('Past Year Questions (PYQs)', { isPastYear: true })}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                            >
                                <span>🏛️ Study Past Year Questions (PYQs)</span>
                            </button>
                        </div>

                        {/* Sort selector */}
                        <div className="flex items-center space-x-2">
                            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-700 font-semibold focus:outline-none focus:border-rose-500"
                            >
                                <option value="foundations">Foundations First</option>
                                <option value="count_desc">Highest Card Count</option>
                                <option value="alphabetical">Alphabetical (A - Z)</option>
                            </select>
                        </div>
                    </div>

                    {/* Subject Grid Sections */}
                    {filteredSections.map((sec, secIdx) => {
                        if (sec.items.length === 0) return null;
                        return (
                            <div key={sec.title || secIdx} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
                                        {sec.title}
                                    </h2>
                                    <span className="text-xs text-neutral-400">{sec.items.length} Specialties</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {sec.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-neutral-300 transition flex flex-col justify-between group"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between">
                                                    <div
                                                        className={`w-12 h-12 rounded-xl ${
                                                            item.bgClass || 'bg-rose-50'
                                                        } flex items-center justify-center text-2xl group-hover:scale-105 transition`}
                                                    >
                                                        {item.emoji}
                                                    </div>
                                                    <div className="flex items-center space-x-1.5">
                                                        {item.isHighYield && (
                                                            <span
                                                                className="text-amber-500 text-xs"
                                                                title="High Yield Board Focus"
                                                            >
                                                                ★
                                                            </span>
                                                        )}
                                                        {item.isNew && (
                                                            <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                                Updated
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <h3 className="text-sm font-bold text-neutral-800 group-hover:text-neutral-900 mt-3">
                                                    {item.title}
                                                </h3>
                                                <p className="text-xs text-neutral-400 font-medium mt-0.5">
                                                    {item.cardsCount.toLocaleString()} Flashcards
                                                </p>
                                            </div>

                                            <div className="pt-4 mt-3 border-t border-neutral-100 flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        startStudySession(`${item.title} Review`, {
                                                            subject: item.title,
                                                        })
                                                    }
                                                    className="flex-1 py-1.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold text-center transition cursor-pointer"
                                                >
                                                    Study Now
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openAddCardForSubject(item.title)}
                                                    className="p-1.5 rounded-xl border border-neutral-200 text-neutral-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition cursor-pointer"
                                                    title={`Add Flashcard to ${item.title}`}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ========================================================= */}
            {/* 5. TAB CONTENT 2: THEMES & HIGH-YIELD CURATED             */}
            {/* ========================================================= */}
            {activeTab === 'themes' && (
                <div className="space-y-6">
                    {/* Theme Filter Bar */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Category:</span>
                        <button
                            type="button"
                            onClick={() => setThemeFilter('all')}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                                themeFilter === 'all'
                                    ? 'bg-neutral-900 text-white'
                                    : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
                            }`}
                        >
                            All Themes
                        </button>
                        <button
                            type="button"
                            onClick={() => setThemeFilter('high_yield')}
                            className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                                themeFilter === 'high_yield'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
                            }`}
                        >
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>High-Yield Core</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setThemeFilter('image')}
                            className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                                themeFilter === 'image'
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
                            }`}
                        >
                            <span>Radiology & Histology (Images)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setThemeFilter('past_year');
                                startStudySession('Past Year Board Flashcards', { isPastYear: true });
                            }}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                        >
                            <span>🏛️ Past Year Exam Decks (PYQ)</span>
                        </button>
                    </div>

                    {/* Themes Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredThemes.map((theme) => (
                            <div
                                key={theme.id}
                                className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-neutral-300 transition flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div
                                            className={`w-12 h-12 rounded-xl ${
                                                theme.bgClass || 'bg-neutral-100'
                                            } flex items-center justify-center text-2xl group-hover:scale-105 transition`}
                                        >
                                            {theme.emoji}
                                        </div>
                                        {theme.isHighYield && (
                                            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                                <span>HY</span>
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-sm font-bold text-neutral-800 group-hover:text-neutral-900 mt-3 line-clamp-1">
                                        {theme.title}
                                    </h3>
                                    <p className="text-xs text-neutral-400 font-medium mt-0.5">
                                        {theme.cardsCount.toLocaleString()} Flashcards
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                                            <span>Mastery</span>
                                            <span className="font-semibold text-neutral-700">{theme.progress}%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-rose-500 h-full rounded-full transition-all duration-300"
                                                style={{ width: `${theme.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 mt-3 border-t border-neutral-100">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            startStudySession(`${theme.title} Theme`, { theme: theme.id })
                                        }
                                        className="w-full py-1.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold text-center transition cursor-pointer"
                                    >
                                        Study Theme
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 6. TAB CONTENT 3: MY DECKS (CUSTOM & ANKI)                */}
            {/* ========================================================= */}
            {activeTab === 'decks' && (
                <div className="space-y-6">
                    {/* Anki Integration Banner Card (Full Width Desktop Banner) */}
                    <div className="bg-gradient-to-r from-slate-900 via-neutral-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="max-w-2xl space-y-2">
                            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-500/30">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Seamless Anki Ecosystem</span>
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">
                                Import Your Anki Decks (.apkg) with AI Reasoning
                            </h2>
                            <p className="text-xs text-neutral-300 leading-relaxed">
                                Seamlessly synchronize your custom Anki decks. Cortex automatically detects medical specialties,
                                tags high-yield landmarks, and integrates with the FSRS 5-stage algorithm across Web, Mobile, and Tablet.
                            </p>
                        </div>
                        <div className="flex items-center space-x-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setAnkiModalOpen(true)}
                                className="px-5 py-2.5 rounded-xl bg-white text-neutral-900 hover:bg-neutral-100 font-bold text-xs shadow-md active:scale-98 transition cursor-pointer"
                            >
                                Import Anki Deck (.apkg)
                            </button>
                        </div>
                    </div>

                    {/* Filter row for decks */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Type:</span>
                            <button
                                type="button"
                                onClick={() => setDeckFilter('all')}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                                    deckFilter === 'all'
                                        ? 'bg-neutral-900 text-white'
                                        : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
                                }`}
                            >
                                All ({customDecks.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeckFilter('custom')}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                                    deckFilter === 'custom'
                                        ? 'bg-neutral-900 text-white'
                                        : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
                                }`}
                            >
                                Custom Decks
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeckFilter('anki')}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                                    deckFilter === 'anki'
                                        ? 'bg-neutral-900 text-white'
                                        : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
                                }`}
                            >
                                Anki Imports
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(true)}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold text-xs border border-rose-200 transition cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create Custom Deck</span>
                        </button>
                    </div>

                    {/* Decks Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Quick create tile */}
                        <div
                            onClick={() => setCreateModalOpen(true)}
                            className="border-2 border-dashed border-neutral-200 hover:border-rose-400 bg-white hover:bg-rose-50/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition group min-h-[160px]"
                        >
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 group-hover:scale-110 flex items-center justify-center transition mb-2">
                                <Plus className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <h3 className="text-xs font-bold text-neutral-800">Add New Deck</h3>
                            <p className="text-[11px] text-neutral-400 mt-0.5">Organize cards by topic</p>
                        </div>

                        {filteredDecks.map((deck) => (
                            <div
                                key={deck.id}
                                className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-neutral-300 transition flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-lg">
                                            {deck.type === 'anki' ? '⭐' : '📝'}
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {deck.type === 'custom' && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeleteDeck(deck.id, deck.title, e)}
                                                    className="p-1 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                                                    title="Delete Deck"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-sm font-bold text-neutral-800 group-hover:text-neutral-900 mt-3 line-clamp-1">
                                        {deck.title}
                                    </h3>
                                    <p className="text-xs text-neutral-400 font-medium mt-0.5">
                                        {deck.cardsCount} Cards • {deck.subject || 'General'}
                                    </p>
                                    <p className="text-[11px] text-neutral-400 mt-1">
                                        Last review: {deck.lastReviewed || 'Recently'}
                                    </p>
                                </div>

                                <div className="pt-4 mt-3 border-t border-neutral-100 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            startStudySession(deck.title, { deckId: deck.id })
                                        }
                                        className="flex-1 py-1.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold text-center transition cursor-pointer"
                                    >
                                        Study Deck
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openAddCardForDeck(deck.id)}
                                        className="p-1.5 rounded-xl border border-neutral-200 text-neutral-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition cursor-pointer"
                                        title="Add card to this deck"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 7. TAB CONTENT 4: ALL FLASHCARDS (MANAGER & EXPLORER)     */}
            {/* ========================================================= */}
            {activeTab === 'cards' && (
                <div className="space-y-4">
                    {/* Management and Filter Bar */}
                    <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex flex-1 flex-wrap items-center gap-2">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[220px]">
                                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={cardSearchQuery}
                                    onChange={(e) => setCardSearchQuery(e.target.value)}
                                    placeholder="Search card prompt, answer, or memory peg..."
                                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-rose-500"
                                />
                                {cardSearchQuery && (
                                    <button
                                        onClick={() => setCardSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Subject Filter */}
                            <select
                                value={cardSubjectFilter}
                                onChange={(e) => setCardSubjectFilter(e.target.value)}
                                className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-700 font-medium focus:outline-none focus:border-rose-500"
                            >
                                <option value="all">All Subjects</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.name}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>

                            {/* Tag Filter */}
                            <div className="flex items-center space-x-1">
                                <button
                                    type="button"
                                    onClick={() => setCardTagFilter('all')}
                                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                                        cardTagFilter === 'all'
                                            ? 'bg-neutral-900 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCardTagFilter('hyq')}
                                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                                        cardTagFilter === 'hyq'
                                            ? 'bg-amber-500 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                                    }`}
                                >
                                    ⭐ High-Yield
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCardTagFilter('pyq')}
                                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                                        cardTagFilter === 'pyq'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                                    }`}
                                >
                                    🏛️ Past Year (PYQ)
                                </button>
                            </div>
                        </div>

                        {/* Top Add Flashcard Button */}
                        <button
                            type="button"
                            onClick={() => setAddCardModalOpen(true)}
                            className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-2xs active:scale-98 transition cursor-pointer"
                        >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            <span>Add New Flashcard</span>
                        </button>
                    </div>

                    {/* Cards Explorer List / Grid */}
                    {filteredCustomCards.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCustomCards.map((card) => (
                                <div
                                    key={card.id}
                                    className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-neutral-300 transition flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Card Header badges */}
                                        <div className="flex items-center justify-between gap-2 mb-2.5">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="bg-neutral-100 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    {card.subject || 'General'}
                                                </span>
                                                {card.deck_title && (
                                                    <span className="bg-rose-50 text-rose-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                                        📁 {card.deck_title}
                                                    </span>
                                                )}
                                                {card.is_high_yield && (
                                                    <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                                        ⭐ HYQ
                                                    </span>
                                                )}
                                                {card.is_past_year && (
                                                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                                                        🏛️ {card.past_year || 'PYQ'}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteCard(card.id, e)}
                                                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                                title="Delete Flashcard"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {/* Question / Front */}
                                        <div className="mb-3">
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                                                Question / Prompt:
                                            </span>
                                            <p className="text-xs font-bold text-neutral-900 leading-snug line-clamp-3">
                                                {card.front}
                                            </p>
                                        </div>

                                        {/* Answer / Back */}
                                        <div className="mb-3">
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                                                Answer & Explanation:
                                            </span>
                                            <p className="text-xs text-neutral-700 leading-relaxed line-clamp-3 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 whitespace-pre-line">
                                                {cleanFlashcardAnswerText(card.back)}
                                            </p>
                                        </div>

                                        {/* Memory Peg / Pearl */}
                                        {card.pearl && (
                                            <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-2.5 text-[11px] text-amber-900 leading-snug mb-2">
                                                <strong className="block font-bold mb-0.5">🧠 Memory Peg:</strong>
                                                <span className="line-clamp-2">{card.pearl}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action footer */}
                                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                                        <span className="text-[11px] text-neutral-400">
                                            {card.created_at || 'Saved'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStudyCards([card]);
                                                setSessionTitle('Flashcard Practice');
                                                setCurrentCardIndex(0);
                                                setIsFlipped(false);
                                                setSessionCompleted(false);
                                                setStudySessionActive(true);
                                            }}
                                            className="px-3 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 font-semibold text-neutral-800 transition cursor-pointer flex items-center gap-1"
                                        >
                                            <Eye className="w-3 h-3" />
                                            <span>Practice</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/80 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl mb-3">
                                🗂️
                            </div>
                            <h3 className="text-base font-bold text-neutral-800">No Custom Flashcards Yet</h3>
                            <p className="text-xs text-neutral-400 max-w-sm mt-1 leading-relaxed">
                                Create your first medical flashcard to begin spaced repetition recall with high-yield clinical tags.
                            </p>
                            <button
                                type="button"
                                onClick={() => setAddCardModalOpen(true)}
                                className="mt-4 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" />
                                <span>+ Create First Flashcard</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================= */}
            {/* 8. INTERACTIVE STUDY PLAYER MODAL (DESKTOP OPTIMIZED)      */}
            {/* ========================================================= */}
            {studySessionActive && (
                <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
                        {/* Session Top Bar */}
                        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
                            <div className="flex items-center space-x-2.5">
                                <span className="bg-rose-50 text-rose-600 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">
                                    {sessionTitle}
                                </span>
                                <span className="text-xs font-mono text-neutral-500">
                                    Card {currentCardIndex + 1} of {studyCards.length}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="hidden sm:inline text-[11px] text-neutral-400">
                                    Press <kbd className="px-1.5 py-0.5 bg-neutral-200 rounded text-[10px]">Space</kbd> to flip
                                </span>
                                <button
                                    onClick={() => setStudySessionActive(false)}
                                    className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-neutral-100 h-1.5">
                            <div
                                className="bg-rose-500 h-full transition-all duration-300"
                                style={{
                                    width: `${((currentCardIndex + 1) / studyCards.length) * 100}%`,
                                }}
                            />
                        </div>

                        {/* Card Content or Loading State */}
                        {isLoadingCards ? (
                            <div className="p-16 flex flex-col items-center justify-center text-center">
                                <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-3" />
                                <p className="text-sm font-semibold text-neutral-800">Loading High-Yield Flashcards...</p>
                                <p className="text-xs text-neutral-400 mt-1">Retrieving dynamic clinical concepts from database</p>
                            </div>
                        ) : !sessionCompleted ? (
                            <div className="p-6 flex-1 flex flex-col justify-between overflow-y-auto">
                                <div>
                                    {/* Subject and tags */}
                                    <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-bold text-neutral-700">
                                                {studyCards[currentCardIndex]?.subject}
                                            </span>
                                            <span>•</span>
                                            <span>{studyCards[currentCardIndex]?.topic}</span>
                                        </div>
                                        <span className="text-[11px] text-rose-600 font-semibold flex items-center space-x-1">
                                            <Zap className="w-3.5 h-3.5" />
                                            <span>FSRS Active</span>
                                        </span>
                                    </div>

                                    {/* 3D Flip Card Container */}
                                    <div
                                        onClick={() => setIsFlipped(!isFlipped)}
                                        className="min-h-[260px] rounded-2xl border-2 border-neutral-200/80 p-6 bg-gradient-to-b from-white to-neutral-50/50 shadow-xs flex flex-col justify-between cursor-pointer hover:border-rose-400 transition group select-none"
                                    >
                                        {!isFlipped ? (
                                            <div>
                                                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                                    Prompt / Clinical Scenario
                                                </div>
                                                <p className="text-base font-medium leading-relaxed text-neutral-900 whitespace-pre-line">
                                                    {studyCards[currentCardIndex]?.front}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
                                                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center space-x-1">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span>Clinical Answer & Explanation</span>
                                                </div>
                                                <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-line">
                                                    {cleanFlashcardAnswerText(studyCards[currentCardIndex]?.back)}
                                                </p>
                                                {studyCards[currentCardIndex]?.pearl && (
                                                    <div className="mt-3 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 leading-relaxed">
                                                        <strong className="font-bold block mb-0.5">🧠 High-Yield Memory Peg:</strong>
                                                        {studyCards[currentCardIndex]?.pearl}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-6 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                                            <span>{isFlipped ? 'Answer Revealed' : 'Click anywhere or press Space to reveal answer'}</span>
                                            <RotateCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </div>

                                {/* Rating Buttons (shown when flipped) */}
                                {isFlipped ? (
                                    <div className="mt-5 space-y-2 animate-in fade-in duration-150">
                                        <div className="text-xs font-semibold text-neutral-500 text-center">
                                            How well did you recall this concept? (Keys 1 - 4)
                                        </div>
                                        <div className="grid grid-cols-4 gap-2.5">
                                            <button
                                                type="button"
                                                onClick={() => handleCardRating('again')}
                                                className="py-3 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 flex flex-col items-center justify-center text-xs font-bold border border-rose-200 transition cursor-pointer"
                                            >
                                                <span>Again [1]</span>
                                                <span className="text-[10px] opacity-75 font-normal">&lt;10 mins</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleCardRating('hard')}
                                                className="py-3 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 flex flex-col items-center justify-center text-xs font-bold border border-amber-200 transition cursor-pointer"
                                            >
                                                <span>Hard [2]</span>
                                                <span className="text-[10px] opacity-75 font-normal">2 days</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleCardRating('good')}
                                                className="py-3 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 flex flex-col items-center justify-center text-xs font-bold border border-blue-200 transition cursor-pointer"
                                            >
                                                <span>Good [3]</span>
                                                <span className="text-[10px] opacity-75 font-normal">7 days</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleCardRating('easy')}
                                                className="py-3 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex flex-col items-center justify-center text-xs font-bold border border-emerald-200 transition cursor-pointer"
                                            >
                                                <span>Easy [4]</span>
                                                <span className="text-[10px] opacity-75 font-normal">21 days</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsFlipped(true)}
                                        className="mt-5 w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold active:scale-98 transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>Show Answer & Explanation (Space)</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="p-12 text-center flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mb-4">
                                    🎉
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900">Session Complete!</h3>
                                <p className="text-xs text-neutral-500 mt-2 max-w-sm leading-relaxed">
                                    You reviewed {reviewedCount} flashcards. Memory intervals have been recalculated and saved to your personal FSRS schedule.
                                </p>
                                <div className="mt-6 flex items-center space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCurrentCardIndex(0);
                                            setIsFlipped(false);
                                            setSessionCompleted(false);
                                            setReviewedCount(0);
                                        }}
                                        className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-xs hover:bg-neutral-50 transition cursor-pointer"
                                    >
                                        Review Again
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStudySessionActive(false)}
                                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
                                    >
                                        Back to Flashcards Hub
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 9. MODAL: ADD FLASHCARD (PROMINENT & INTUITIVE)           */}
            {/* ========================================================= */}
            {addCardModalOpen && (
                <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                                    <Plus className="w-5 h-5 stroke-[2.5]" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-neutral-900">Add New Flashcard</h3>
                                    <p className="text-xs text-neutral-400">Save clinical cards into decks or medical specialties</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAddCardModalOpen(false)}
                                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCard} className="mt-5 space-y-4">
                            {/* Specialty and Deck selectors */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                        Medical Subject <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={newCardSubjectId}
                                        onChange={(e) => setNewCardSubjectId(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 focus:outline-none focus:border-rose-500"
                                        required
                                    >
                                        <option value="">Select Subject...</option>
                                        {subjects.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                        Target Custom Deck
                                    </label>
                                    <select
                                        value={newCardDeckId}
                                        onChange={(e) => setNewCardDeckId(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 focus:outline-none focus:border-rose-500"
                                    >
                                        <option value="">General (No Deck)</option>
                                        {customDecks.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Prompt / Front */}
                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                    Card Front (Question / Clinical Scenario) <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={newCardFront}
                                    onChange={(e) => setNewCardFront(e.target.value)}
                                    placeholder="e.g. What is Beck's Triad in acute cardiac tamponade?"
                                    rows={3}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                />
                            </div>

                            {/* Answer / Back */}
                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                    Card Back (Answer & Clinical Explanation) <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={newCardBack}
                                    onChange={(e) => setNewCardBack(e.target.value)}
                                    placeholder="e.g. 1. Hypotension with narrowed pulse pressure, 2. Jugular venous distension (JVD), 3. Muffled heart sounds."
                                    rows={3}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                />
                            </div>

                            {/* Clinical Pearl */}
                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                    High-Yield Clinical Pearl / Memory Peg (Optional)
                                </label>
                                <textarea
                                    value={newCardPearl}
                                    onChange={(e) => setNewCardPearl(e.target.value)}
                                    placeholder="e.g. Pulsus paradoxus (>10 mmHg drop in SBP on inspiration). Do not confuse with tension pneumothorax!"
                                    rows={2}
                                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-rose-500"
                                />
                            </div>

                            {/* Board Tags */}
                            <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/80 space-y-2.5">
                                <label className="flex items-center space-x-2 text-xs font-semibold text-neutral-800 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newCardIsHighYield}
                                        onChange={(e) => setNewCardIsHighYield(e.target.checked)}
                                        className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                                    />
                                    <span>⭐ Mark as High-Yield Question (HYQ)</span>
                                </label>

                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2 text-xs font-semibold text-neutral-800 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newCardIsPastYear}
                                            onChange={(e) => setNewCardIsPastYear(e.target.checked)}
                                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                        />
                                        <span>🏛️ Mark as Past Year Question (PYQ)</span>
                                    </label>
                                    {newCardIsPastYear && (
                                        <input
                                            type="text"
                                            value={newCardPastYear}
                                            onChange={(e) => setNewCardPastYear(e.target.value)}
                                            placeholder="Exam & Year (e.g. MECEE 2024, USMLE Step 1 2023)"
                                            className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-blue-500 bg-white"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Submit & Cancel */}
                            <div className="pt-3 flex items-center justify-end space-x-2 border-t border-neutral-100">
                                <button
                                    type="button"
                                    onClick={() => setAddCardModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newCardFront.trim() || !newCardBack.trim() || isSavingCard}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 transition cursor-pointer flex items-center space-x-1.5 shadow-xs"
                                >
                                    {isSavingCard && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{isSavingCard ? 'Saving...' : 'Save Flashcard'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 10. MODAL: CREATE CUSTOM DECK                            */}
            {/* ========================================================= */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                            <h3 className="text-base font-bold text-neutral-900">Create Custom Deck</h3>
                            <button
                                type="button"
                                onClick={() => setCreateModalOpen(false)}
                                className="text-neutral-400 hover:text-neutral-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateDeck} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                    Deck Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newDeckTitle}
                                    onChange={(e) => setNewDeckTitle(e.target.value)}
                                    placeholder="e.g. Cardiology Heart Murmurs & ECGs"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                    Medical Specialty
                                </label>
                                <select
                                    value={newDeckCategory}
                                    onChange={(e) => setNewDeckCategory(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 focus:outline-none focus:border-rose-500"
                                >
                                    {subjects.length > 0 ? (
                                        subjects.map((s) => (
                                            <option key={s.id} value={s.name}>
                                                {s.name}
                                            </option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="Anatomy">Anatomy</option>
                                            <option value="Physiology">Physiology</option>
                                            <option value="Biochemistry">Biochemistry</option>
                                            <option value="Pathology">Pathology</option>
                                            <option value="Pharmacology">Pharmacology</option>
                                            <option value="Internal Medicine">Internal Medicine</option>
                                            <option value="Surgery">Surgery</option>
                                            <option value="Pediatrics">Pediatrics</option>
                                        </>
                                    )}
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
                                    disabled={!newDeckTitle.trim() || isSavingDeck}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 transition cursor-pointer flex items-center space-x-1.5"
                                >
                                    {isSavingDeck && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{isSavingDeck ? 'Saving...' : 'Save Deck'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 11. MODAL: ANKI IMPORT                                    */}
            {/* ========================================================= */}
            {ankiModalOpen && (
                <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                            <div className="flex items-center space-x-2">
                                <span className="text-xl">⭐</span>
                                <h3 className="text-base font-bold text-neutral-900">Import Anki Package (.apkg)</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAnkiModalOpen(false)}
                                className="text-neutral-400 hover:text-neutral-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mt-4 space-y-4">
                            <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 text-center hover:border-rose-400 transition cursor-pointer">
                                <UploadCloud className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
                                <p className="text-xs font-bold text-neutral-700">Drag & drop your Anki deck file here</p>
                                <p className="text-[11px] text-neutral-400 mt-1">Supports .apkg and .colpkg archives</p>
                            </div>
                            <div className="rounded-xl bg-blue-50/70 p-3 text-xs text-blue-900 border border-blue-200/50 leading-relaxed">
                                <strong>AI Enhancement:</strong> Cortex will automatically cross-reference imported cards with our 19 medical subjects and generate mnemonic rationales.
                            </div>
                            <button
                                type="button"
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
            {/* 12. MODAL: DR. CORTEX AI TUTOR                            */}
            {/* ========================================================= */}
            {cortexModalOpen && (
                <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[640px] max-h-[92vh]">
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
                                    <p className="text-[11px] text-neutral-500">Board Landmarks • Spaced Repetition Pearls • Differentials</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-[11px] font-semibold text-neutral-500 bg-white/80 border border-neutral-200 px-2 py-0.5 rounded-full">
                                    ⚡ {cortexCredits} credits
                                </span>
                                <button
                                    type="button"
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
                                    type="button"
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

                                        {msg.clinicalPearl && (
                                            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-2.5 text-amber-950">
                                                <div className="flex items-center gap-1.5 font-bold text-[10px] text-amber-800 uppercase tracking-wider mb-0.5">
                                                    <span>💡</span>
                                                    <span>High-Yield Clinical Pearl</span>
                                                </div>
                                                <p className="text-[11px] leading-relaxed font-medium">{msg.clinicalPearl}</p>
                                            </div>
                                        )}

                                        {msg.emergencyStep && (
                                            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-2.5 text-rose-950">
                                                <div className="flex items-center gap-1.5 font-bold text-[10px] text-rose-800 uppercase tracking-wider mb-0.5">
                                                    <span>🚨</span>
                                                    <span>Next Critical Emergency Step</span>
                                                </div>
                                                <p className="text-[11px] leading-relaxed font-medium">{msg.emergencyStep}</p>
                                            </div>
                                        )}

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
                                type="button"
                                onClick={() => handleSendCortexAi(undefined, 'Explain Beck Triad for cardiac tamponade')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                🫀 Beck’s Triad
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSendCortexAi(undefined, 'Cranial nerve exit foramina and clinical lesions')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                🧠 Cranial Nerves
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSendCortexAi(undefined, 'Loop vs Thiazide diuretics electrolyte differences')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                💊 Diuretics
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSendCortexAi(undefined, 'Tension pneumothorax signs and needle decompression')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                ⚡ Tension Pneumothorax
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
