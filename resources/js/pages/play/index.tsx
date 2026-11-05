import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Sparkles,
    Play,
    Search,
    HelpCircle,
    X,
    Check,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Zap,
    Trophy,
    Timer,
    Flame,
    Maximize2,
    Minimize2,
    Send,
    ArrowRight,
    ChevronRight,
    Award,
    Activity,
    BookOpen,
    Layers,
    Puzzle,
} from 'lucide-react';
import { toast } from 'sonner';

interface DailyMedle {
    id: string;
    caseNumber?: number;
    disease: string;
    specialty?: string;
    organEmoji?: string;
    clues: Array<{
        type: string;
        icon: string;
        title: string;
        text: string;
        danger: string;
    }>;
    options: string[];
    differentialReasons?: Record<string, string>;
    pearl: string;
    immediateManagement?: string;
}

interface SynapsesData {
    groups: Array<{
        category: string;
        color: string;
        items: string[];
    }>;
}

interface HereAndThereData {
    leftCategory: string;
    rightCategory: string;
    cards: Array<{
        text: string;
        correct: 'left' | 'right';
    }>;
}

interface ImageRushCard {
    id: string;
    question: string;
    emoji: string;
    options: string[];
    correct: number;
    explanation: string;
}

interface PlayPageProps {
    user: any;
    dailyMedle: DailyMedle;
    medleCases?: DailyMedle[];
    medicalDictionary?: string[];
    synapsesData: SynapsesData;
    hereAndThereData: HereAndThereData;
    imageRushCards: ImageRushCard[];
    playerStats?: {
        level: number;
        title: string;
        xp: number;
        streakDays: number;
        completedToday: number;
    };
}

export default function PlayIndex({
    user,
    dailyMedle,
    medleCases = [],
    medicalDictionary = [],
    synapsesData,
    hereAndThereData,
    imageRushCards = [],
    playerStats = {
        level: 4,
        title: 'Senior Resident',
        xp: 1420,
        streakDays: 5,
        completedToday: 2,
    },
}: PlayPageProps) {
    const [viewMode, setViewMode] = useState<'mobile' | 'expanded'>('mobile');

    // Modals state for playable medical mini-games
    const [activeGameModal, setActiveGameModal] = useState<
        'medle' | 'synapses' | 'hereAndThere' | 'imageRush' | 'probe' | 'clinicalRounds' | 'anatomy' | null
    >(null);

    // Cortex AI Tutor state
    const [cortexModalOpen, setCortexModalOpen] = useState(false);
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
            text: 'Welcome to the Medical Gaming Hub! I am Dr. Cortex AI, your clinical board exam tutor and medical reasoning assistant. Ready to test your diagnostic speed in Medle or match connections in Synapses? Ask me for hints, differential breakdowns, or mnemonics anytime!',
            clinicalPearl: 'Streptococcus gallolyticus bacteremia requires screening colonoscopy (~50% occult colorectal adenocarcinoma association).',
            relatedTopics: ['Duke Criteria for IE', 'Tension Pneumothorax', 'SAD PUCKER Mnemonic', 'Aortic Dissection Types'],
        },
    ]);

    // ==========================================
    // 1. MEDLE GAME STATE (ENHANCED MULTI-CASE)
    // ==========================================
    const [medleCaseIndex, setMedleCaseIndex] = useState(0);
    const casesBank = medleCases.length > 0 ? medleCases : [dailyMedle];
    const activeMedle = casesBank[medleCaseIndex % casesBank.length];

    const [revealedClues, setRevealedClues] = useState<number>(1);
    const [medleSelectedOption, setMedleSelectedOption] = useState<string | null>(null);
    const [medleSolved, setMedleSolved] = useState<boolean>(false);
    const [medleFailed, setMedleFailed] = useState<boolean>(false);
    const [medleSearchQuery, setMedleSearchQuery] = useState('');
    const [medleSuggestions, setMedleSuggestions] = useState<string[]>([]);
    const [medleRuledOut, setMedleRuledOut] = useState<Array<{ name: string; reason: string }>>([]);

    const handleSearchChange = (query: string) => {
        setMedleSearchQuery(query);
        if (!query.trim()) {
            setMedleSuggestions([]);
            return;
        }
        const q = query.toLowerCase().trim();
        const matches = (medicalDictionary.length > 0 ? medicalDictionary : activeMedle.options)
            .filter((cond) => cond.toLowerCase().includes(q))
            .slice(0, 5);
        setMedleSuggestions(matches);
    };

    const handleMedleGuess = (option: string) => {
        const clean = option.trim();
        if (!clean) return;

        setMedleSelectedOption(clean);
        setMedleSearchQuery('');
        setMedleSuggestions([]);

        if (clean.toLowerCase() === activeMedle.disease.toLowerCase()) {
            setMedleSolved(true);
            setRevealedClues(activeMedle.clues.length);
            toast.success('Brilliant Diagnosis! +150 XP', {
                description: `Correctly identified ${activeMedle.disease} in ${revealedClues} hint(s)!`,
            });
        } else {
            const ruleOutReason = (activeMedle.differentialReasons && activeMedle.differentialReasons[clean]) ||
                `Clinical presentation and diagnostic criteria rule out ${clean}. Review the next revealed hint to narrow your differential.`;

            setMedleRuledOut((prev) => [...prev, { name: clean, reason: ruleOutReason }]);

            if (revealedClues < activeMedle.clues.length) {
                setRevealedClues((prev) => prev + 1);
                toast.error('Differential Ruled Out', {
                    description: `Unlocked Hint #${revealedClues + 1} to refine your diagnostic approach.`,
                });
            } else {
                setMedleFailed(true);
                toast.error('All clues exhausted!', {
                    description: `The correct diagnosis was ${activeMedle.disease}.`,
                });
            }
        }
    };

    const handleNextMedleCase = () => {
        const nextIdx = (medleCaseIndex + 1) % casesBank.length;
        setMedleCaseIndex(nextIdx);
        setRevealedClues(1);
        setMedleSelectedOption(null);
        setMedleSolved(false);
        setMedleFailed(false);
        setMedleRuledOut([]);
        setMedleSearchQuery('');
        setMedleSuggestions([]);
    };

    const handleShareMedle = () => {
        let grid = '';
        for (let i = 0; i < 4; i++) {
            if (i < revealedClues) {
                grid += (medleSolved && i === revealedClues - 1) ? '🟩 ' : '🟨 ';
            } else {
                grid += '⬜ ';
            }
        }
        const text = `Cortex Medle #${activeMedle.caseNumber || 142} ${activeMedle.organEmoji || '🫀'}\nHints: ${revealedClues}/4\n${grid}\n🔥 Streak: ${playerStats.streakDays} Days\nSpecialty: ${activeMedle.specialty || 'Internal Medicine'}\nPlay at cortex.med/play`;
        navigator.clipboard.writeText(text);
        toast.success('Diagnostic matrix copied to clipboard!');
    };

    // ==========================================
    // 2. SYNAPSES GAME STATE
    // ==========================================
    // Shuffle all items from the 4 groups
    const initialSynapseItems = React.useMemo(() => {
        const items: Array<{ text: string; category: string; color: string }> = [];
        synapsesData.groups.forEach((g) => {
            g.items.forEach((item) => {
                items.push({ text: item, category: g.category, color: g.color });
            });
        });
        return items.sort(() => Math.random() - 0.5);
    }, [synapsesData]);

    const [synapseItems, setSynapseItems] = useState(initialSynapseItems);
    const [synapseSelected, setSynapseSelected] = useState<string[]>([]);
    const [synapseSolvedGroups, setSynapseSolvedGroups] = useState<string[]>([]);

    const toggleSynapseSelect = (itemText: string) => {
        if (synapseSelected.includes(itemText)) {
            setSynapseSelected((prev) => prev.filter((t) => t !== itemText));
        } else {
            if (synapseSelected.length < 4) {
                setSynapseSelected((prev) => [...prev, itemText]);
            }
        }
    };

    const handleSynapsesSubmit = () => {
        if (synapseSelected.length !== 4) return;

        // Check if all 4 belong to the same category
        const selectedItemsObj = synapseItems.filter((i) => synapseSelected.includes(i.text));
        const category = selectedItemsObj[0].category;
        const allSame = selectedItemsObj.every((i) => i.category === category);

        if (allSame) {
            setSynapseSolvedGroups((prev) => [...prev, category]);
            setSynapseItems((prev) => prev.filter((i) => i.category !== category));
            setSynapseSelected([]);
            toast.success(`Group Solved: ${category}!`, {
                description: '+100 XP gained.',
            });
        } else {
            toast.error('Not a matching connection', {
                description: 'Try finding 4 related concepts.',
            });
            setSynapseSelected([]);
        }
    };

    // ==========================================
    // 3. HERE AND THERE (SWIPE / BINARY CHOICE)
    // ==========================================
    const [hatCardIndex, setHatCardIndex] = useState(0);
    const [hatScore, setHatScore] = useState(0);
    const [hatCompleted, setHatCompleted] = useState(false);

    const handleHatChoice = (choice: 'left' | 'right') => {
        const currentCard = hereAndThereData.cards[hatCardIndex];
        if (choice === currentCard.correct) {
            setHatScore((prev) => prev + 1);
            toast.success('Correct classification!');
        } else {
            toast.error('Incorrect association!');
        }

        const next = hatCardIndex + 1;
        if (next < hereAndThereData.cards.length) {
            setHatCardIndex(next);
        } else {
            setHatCompleted(true);
            toast.success(`Game Completed! Score: ${hatScore + (choice === currentCard.correct ? 1 : 0)} / ${hereAndThereData.cards.length}`);
        }
    };

    // ==========================================
    // 4. IMAGE RUSH STATE
    // ==========================================
    const [irIndex, setIrIndex] = useState(0);
    const [irScore, setIrScore] = useState(0);
    const [irCompleted, setIrCompleted] = useState(false);
    const [irSelectedOption, setIrSelectedOption] = useState<number | null>(null);

    const handleIrSelect = (idx: number) => {
        setIrSelectedOption(idx);
        const current = imageRushCards[irIndex];
        if (idx === current.correct) {
            setIrScore((prev) => prev + 1);
            toast.success('Fast diagnosis! +50 XP');
        } else {
            toast.error('Incorrect sign identified');
        }

        setTimeout(() => {
            setIrSelectedOption(null);
            if (irIndex + 1 < imageRushCards.length) {
                setIrIndex((prev) => prev + 1);
            } else {
                setIrCompleted(true);
            }
        }, 1200);
    };

    // Cortex AI Clinical Chat Submit
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
                    subject: activeMedle?.specialty || 'General Medicine',
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
                        text: aiData.reply || 'Here is the clinical breakdown for this concept.',
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
            // Intelligent high-yield offline fallback
            let fallbackReply = `Here is the clinical breakdown for "${text}": Always link pathophysiology with cardinal physical signs. Look for key discriminators under timed conditions.`;
            let pearl: string | undefined;
            let emergency: string | undefined;
            const topics = ['Duke Criteria for IE', 'SAD PUCKER Mnemonic', 'Tension Pneumothorax'];

            const lower = text.toLowerCase();
            if (lower.includes('medle') || lower.includes('endocarditis') || lower.includes('bovis')) {
                fallbackReply = 'Infective Endocarditis: Persistent bacteremia with Streptococcus gallolyticus (formerly S. bovis) requires colonoscopy to rule out occult colorectal adenocarcinoma (~50% association)!';
                pearl = 'Duke Criteria: 2 Major or 1 Major + 3 Minor. FROM JANE (Fever, Roth spots, Osler nodes, Murmur, Janeway lesions, Anemia, Nail-bed splinter hemorrhage, Emboli).';
                emergency = 'Start empiric IV Vancomycin + Ceftriaxone immediately after blood cultures. Consult CT surgery if acute valvular incompetence or refractory cardiogenic shock.';
            } else if (lower.includes('pneumothorax') || lower.includes('tension')) {
                fallbackReply = 'Tension Pneumothorax: Emergency clinical diagnosis characterized by sudden respiratory distress, unilateral absent breath sounds, tracheal deviation, and hemodynamic collapse.';
                pearl = 'DO NOT delay decompression for a chest X-ray! Immediate clinical recognition saves lives.';
                emergency = 'Perform immediate needle thoracostomy (2nd ICS midclavicular or 5th ICS anterior axillary line), followed promptly by tube thoracostomy.';
            } else if (lower.includes('mnemonic') || lower.includes('sad pucker')) {
                fallbackReply = 'SAD PUCKER Mnemonic for Retroperitoneal Organs:';
                pearl = 'S = Suprarenal glands, A = Aorta/IVC, D = Duodenum (2nd-4th parts), P = Pancreas (except tail), U = Ureters, C = Colon (descending/ascending), K = Kidneys, E = Esophagus, R = Rectum.';
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
        <div className="bg-[#F8F9FC] text-slate-900 font-sans antialiased min-h-screen flex flex-col items-center justify-start selection:bg-blue-100">
            <Head title="Play - Medical Gaming Hub" />

            {/* Desktop Top Bar (Quick Controls & Dev Navigation) */}
            <div className="w-full max-w-4xl px-4 py-2 hidden md:flex items-center justify-between text-xs text-neutral-500 border-b border-neutral-200/60 bg-white/70 backdrop-blur-sm sticky top-0 z-40">
                <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800">Cortex Medical Gaming Hub</span>
                    <span className="text-neutral-300">•</span>
                    <span className="bg-orange-50 text-[#FF6B4A] px-2 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1">
                        <Flame className="w-3 h-3 text-[#FF6B4A]" />
                        <span>{playerStats.streakDays}-Day Streak</span>
                    </span>
                    <span className="bg-blue-50 text-[#1872F4] px-2 py-0.5 rounded-full font-bold text-[11px]">
                        {playerStats.title} ({playerStats.xp} XP)
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
                        Dashboard
                    </Link>
                </div>
            </div>

            {/* Mobile Viewport Container (iOS Form Factor max-w-[430px]) */}
            <div
                className={`w-full ${
                    viewMode === 'mobile' ? 'max-w-[430px] shadow-2xl' : 'max-w-2xl shadow-xl'
                } bg-white min-h-screen pb-36 relative flex flex-col overflow-x-hidden transition-all duration-300`}
            >
                {/* Top Warm Gradient Header Overlay */}
                <div
                    style={{
                        background: 'linear-gradient(180deg, #FFEFEA 0%, #FFF7F4 120px, #FFFFFF 260px)',
                    }}
                    className="absolute top-0 left-0 right-0 h-96 pointer-events-none z-0"
                />

                {/* BEGIN: AppHeader */}
                <section className="relative z-10 px-5 pt-4 pb-3.5 flex items-center gap-2.5">
                    {/* Orange puzzle logo icon */}
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF8C6B] flex items-center justify-center shadow-xs shadow-orange-300">
                        <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                            <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5a2.5 2.5 0 0 1 0 5H2v4c0 1.1.9 2 2 2h3.8v-1.5a2.5 2.5 0 0 1 5 0V21H17c1.1 0 2-.9 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-800">Play</h1>
                </section>
                {/* END: AppHeader */}

                {/* Main Scrollable Content Container */}
                <main className="relative z-10 px-4 space-y-6">
                    {/* BEGIN: FeaturedCarousel */}
                    <section className="pt-1" data-purpose="featured-carousel">
                        {/* Featured Card Container */}
                        <div
                            style={{
                                background: 'linear-gradient(135deg, #F3F0FF 0%, #ECE8FE 60%, #E3DEFE 100%)',
                            }}
                            className="rounded-3xl p-4.5 pt-5 pb-5 relative shadow-xs border border-white/60 overflow-hidden"
                        >
                            {/* Subtle decorative floating ambient blobs */}
                            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-indigo-200/40 blur-2xl pointer-events-none" />
                            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-purple-200/40 blur-2xl pointer-events-none" />
                            {/* Decorative subtle floating starlets */}
                            <div className="absolute top-12 left-10 w-1.5 h-1.5 rounded-full bg-purple-400/50" />
                            <div className="absolute top-28 right-8 w-2 h-2 rounded-full bg-pink-400/40" />
                            <div className="absolute bottom-20 left-12 w-1.5 h-1.5 rounded-full bg-indigo-400/40" />
                            <div className="absolute top-1/2 left-4 w-1 h-1 rounded-full bg-purple-500/30" />

                            {/* Game Preview Stage: Stacked Diagnostic Bars */}
                            <div
                                onClick={() => setActiveGameModal('medle')}
                                className="w-full max-w-[290px] mx-auto space-y-2.5 my-2 cursor-pointer transition hover:scale-[1.02]"
                            >
                                {/* Row 1: ECG Waveform */}
                                <div className="bg-[#FFEFE7] border border-[#FFDEC9] rounded-2xl p-2.5 px-3 flex items-center justify-between shadow-2xs">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 rounded-full bg-white shadow-2xs flex items-center justify-center text-red-500 shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path d="M3 12h3.5l2-6 3.5 12 2-6H21" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        {/* Clue Bars */}
                                        <div className="space-y-1.5">
                                            <div className="w-24 h-2.5 bg-[#FFD3BD] rounded-full" />
                                            <div className="w-16 h-2 bg-[#FFE3D4] rounded-full" />
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-[#FFE3D4] flex items-center justify-center text-[#E65100]">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fillRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Row 2: Thermometer */}
                                <div className="bg-[#EAF3FF] border border-[#D5E6FE] rounded-2xl p-2.5 px-3 flex items-center justify-between shadow-2xs">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 rounded-full bg-white shadow-2xs flex items-center justify-center text-red-400 shrink-0">
                                            {/* Thermometer Icon */}
                                            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M15 13V5a3 3 0 0 0-6 0v8a5 5 0 1 0 6 0zm-3-10a1 1 0 0 1 1 1v5h-2V4a1 1 0 0 1 1-1z" />
                                            </svg>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="w-24 h-2.5 bg-[#BEDCFD] rounded-full" />
                                            <div className="w-16 h-2 bg-[#D5E7FD] rounded-full" />
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-[#D5E7FD] flex items-center justify-center text-[#1E70E8]">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fillRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Row 3: Blood Drop */}
                                <div className="bg-[#EBF7F2] border border-[#D1EFE2] rounded-2xl p-2.5 px-3 flex items-center justify-between shadow-2xs">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 rounded-full bg-white shadow-2xs flex items-center justify-center text-red-500 shrink-0">
                                            <svg className="w-5 h-5 fill-current text-rose-500" viewBox="0 0 24 24">
                                                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                                            </svg>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="w-24 h-2.5 bg-[#BFEBD6] rounded-full" />
                                            <div className="w-16 h-2 bg-[#D7F4E6] rounded-full" />
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-[#D7F4E6] flex items-center justify-center text-[#147953]">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fillRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Row 4: Solved Heart (Success) */}
                                <div className="bg-[#FFF4E4] border border-[#FFE7C4] rounded-2xl p-2.5 px-3 flex items-center justify-between shadow-2xs">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 rounded-full bg-white shadow-2xs flex items-center justify-center text-red-500 shrink-0 text-base">
                                            🫀
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="w-24 h-2.5 bg-[#FFDEAB] rounded-full" />
                                            <div className="w-16 h-2 bg-[#FFEECE] rounded-full" />
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-[#DCFCE7] flex items-center justify-center text-emerald-600">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Card Controls & Title */}
                            <div className="mt-4 flex items-center justify-between pt-2">
                                <div>
                                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Medle</h2>
                                    <p className="text-[13px] text-slate-500 font-medium mt-0.5">Guess it before the hints run out</p>
                                </div>
                                {/* Blue Play Button */}
                                <button
                                    onClick={() => setActiveGameModal('medle')}
                                    aria-label="Play Medle"
                                    className="w-11 h-11 rounded-full bg-[#1872F4] hover:bg-blue-600 active:scale-95 transition-transform flex items-center justify-center shadow-md shadow-blue-400/40 text-white shrink-0 cursor-pointer"
                                >
                                    <svg className="w-4 h-4 translate-x-0.5 fill-current" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Carousel Pagination Dots */}
                        <div className="flex justify-center items-center space-x-1.5 mt-3">
                            <div className="w-5 h-1.5 rounded-full bg-[#1872F4]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        </div>
                    </section>
                    {/* END: FeaturedCarousel */}

                    {/* BEGIN: CrackTheClues */}
                    <section className="space-y-2.5" data-purpose="crack-the-clues">
                        <h2 className="text-[17px] font-extrabold text-slate-900 tracking-tight">Crack the clues</h2>
                        <div className="grid grid-cols-2 gap-3.5">
                            {/* Game Card: Probe */}
                            <div
                                onClick={() => setActiveGameModal('probe')}
                                className="flex flex-col group cursor-pointer"
                            >
                                <div
                                    style={{
                                        background: 'linear-gradient(145deg, #EEF7FE 0%, #D8ECFD 100%)',
                                    }}
                                    className="aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xs border border-blue-100/60 p-4 transition-transform group-hover:scale-[1.02]"
                                >
                                    {/* Magnifying Glass Illustration */}
                                    <div className="relative w-24 h-24 flex items-center justify-center">
                                        {/* 3D Magnifier */}
                                        <div className="w-16 h-16 rounded-full border-4 border-blue-400 bg-white/80 shadow-inner flex items-center justify-center relative">
                                            <span className="text-2xl font-black text-[#FF6433]">?</span>
                                        </div>
                                        {/* Handle */}
                                        <div className="absolute -bottom-1 -right-0 w-3.5 h-9 bg-gradient-to-b from-[#FF5C39] to-[#E03A14] rounded-full rotate-[-45deg] origin-top shadow-md" />
                                        {/* Confetti dots */}
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-2 left-3" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 absolute bottom-3 left-4" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 absolute top-4 right-1" />
                                    </div>
                                </div>
                                {/* Details */}
                                <div className="mt-2 space-y-0.5">
                                    <div className="flex items-center space-x-1.5">
                                        <span className="w-4 h-4 rounded-md bg-[#6C47FF] flex items-center justify-center text-white text-[9px] shadow-2xs">
                                            🔍
                                        </span>
                                        <span className="font-bold text-[14px] text-slate-900">Probe</span>
                                    </div>
                                    <p className="text-[12px] text-slate-500 font-medium leading-tight">Solve clues, reveal the concept</p>
                                </div>
                            </div>

                            {/* Game Card: Clinical Rounds */}
                            <div
                                onClick={() => setActiveGameModal('clinicalRounds')}
                                className="flex flex-col group cursor-pointer"
                            >
                                <div
                                    style={{
                                        background: 'linear-gradient(145deg, #EDF4FE 0%, #DDEBFC 100%)',
                                    }}
                                    className="aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xs border border-blue-100/60 p-2 transition-transform group-hover:scale-[1.02]"
                                >
                                    {/* Hospital Patient Illustration */}
                                    <div className="relative flex flex-col items-center">
                                        {/* Pulse Line Overhead */}
                                        <svg className="w-20 h-5 text-blue-400 mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 100 24">
                                            <path d="M0 12h35l5-8 8 16 5-8h47" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        {/* Patient in Bed */}
                                        <div className="relative w-24 h-24 flex items-center justify-center">
                                            {/* Head */}
                                            <div className="w-11 h-12 bg-[#FFDFCA] rounded-full border border-orange-200 z-10 flex flex-col items-center pt-1.5 shadow-2xs">
                                                {/* Hair */}
                                                <div className="w-10 h-4 bg-[#4A3222] rounded-t-full -mt-2" />
                                                {/* Eyes & Smile */}
                                                <div className="flex space-x-2.5 mt-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-[#4A3222]" />
                                                    <div className="w-1 h-1 rounded-full bg-[#4A3222]" />
                                                </div>
                                                <div className="w-2.5 h-0.5 bg-rose-400 rounded-full mt-1" />
                                            </div>
                                            {/* Pillow & Bed Frame */}
                                            <div className="absolute inset-x-1 bottom-1 h-14 bg-white/90 rounded-t-2xl border-t border-slate-200 z-0 shadow-2xs" />
                                            {/* Cyan Hospital Gown/Sheet */}
                                            <div className="absolute inset-x-2 bottom-0 h-9 bg-blue-300 rounded-t-xl z-20 flex justify-center items-center">
                                                <div className="w-4 h-2 bg-amber-200/80 rounded-t-md" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Details */}
                                <div className="mt-2 space-y-0.5">
                                    <div className="flex items-center space-x-1.5">
                                        <span className="w-4 h-4 rounded-md bg-[#5B4DF5] flex items-center justify-center text-white text-[9px] shadow-2xs">
                                            🩺
                                        </span>
                                        <span className="font-bold text-[14px] text-slate-900">Clinical Rounds</span>
                                    </div>
                                    <p className="text-[12px] text-slate-500 font-medium leading-tight">Diagnose and treat patients</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* END: CrackTheClues */}

                    {/* BEGIN: TestYourRecall */}
                    <section className="space-y-2.5" data-purpose="test-your-recall">
                        <h2 className="text-[17px] font-extrabold text-slate-900 tracking-tight">Test your recall</h2>
                        <div className="grid grid-cols-2 gap-3.5">
                            {/* Game Card: Synapses */}
                            <div
                                onClick={() => setActiveGameModal('synapses')}
                                className="flex flex-col group cursor-pointer"
                            >
                                <div
                                    style={{
                                        background: 'linear-gradient(135deg, #F3F0FF 0%, #ECE8FE 60%, #E3DEFE 100%)',
                                    }}
                                    className="aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xs border border-purple-100/60 p-3 transition-transform group-hover:scale-[1.02]"
                                >
                                    {/* 2x2 Jigsaw Organ Grid */}
                                    <div className="grid grid-cols-2 gap-1.5 bg-white/60 p-2 rounded-2xl shadow-2xs backdrop-blur-xs">
                                        {/* Stomach */}
                                        <div className="w-9 h-9 rounded-xl bg-orange-100/90 flex items-center justify-center text-base">
                                            🫃
                                        </div>
                                        {/* Lungs */}
                                        <div className="w-9 h-9 rounded-xl bg-sky-100/90 flex items-center justify-center text-base">
                                            🫁
                                        </div>
                                        {/* Kidneys */}
                                        <div className="w-9 h-9 rounded-xl bg-emerald-100/90 flex items-center justify-center text-base">
                                            🩺
                                        </div>
                                        {/* Liver */}
                                        <div className="w-9 h-9 rounded-xl bg-amber-100/90 flex items-center justify-center text-base">
                                            🍗
                                        </div>
                                    </div>
                                </div>
                                {/* Details */}
                                <div className="mt-2 space-y-0.5">
                                    <div className="flex items-center space-x-1.5">
                                        <span className="w-4 h-4 rounded-md bg-[#6442ED] flex items-center justify-center text-white text-[10px]">
                                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 16 16">
                                                <rect height="6" rx="1" width="6" x="1" y="1" />
                                                <rect height="6" rx="1" width="6" x="9" y="1" />
                                                <rect height="6" rx="1" width="6" x="1" y="9" />
                                                <rect height="6" rx="1" width="6" x="9" y="9" />
                                            </svg>
                                        </span>
                                        <span className="font-bold text-[14px] text-slate-900">Synapses</span>
                                    </div>
                                    <p className="text-[12px] text-slate-500 font-medium leading-tight">Find the four hidden groups</p>
                                </div>
                            </div>

                            {/* Game Card: Medle (Mini version) */}
                            <div
                                onClick={() => setActiveGameModal('medle')}
                                className="flex flex-col group cursor-pointer"
                            >
                                <div
                                    style={{
                                        background: 'linear-gradient(135deg, #F3F0FF 0%, #ECE8FE 60%, #E3DEFE 100%)',
                                    }}
                                    className="aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xs border border-purple-100/60 p-3 transition-transform group-hover:scale-[1.02]"
                                >
                                    {/* Mini Symptom List */}
                                    <div className="w-full space-y-1.5 px-2">
                                        <div className="h-4 bg-[#FFEFE7] border border-[#FFDEC9] rounded-lg flex items-center px-1.5 justify-between">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                            <div className="w-10 h-1 bg-[#FFD3BD] rounded" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-300" />
                                        </div>
                                        <div className="h-4 bg-[#EAF3FF] border border-[#D5E6FE] rounded-lg flex items-center px-1.5 justify-between">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                            <div className="w-10 h-1 bg-[#BEDCFD] rounded" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                                        </div>
                                        <div className="h-4 bg-[#EBF7F2] border border-[#D1EFE2] rounded-lg flex items-center px-1.5 justify-between">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            <div className="w-10 h-1 bg-[#BFEBD6] rounded" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                                        </div>
                                        <div className="h-4 bg-[#FFF4E4] border border-[#FFE7C4] rounded-lg flex items-center px-1.5 justify-between">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                            <div className="w-10 h-1 bg-[#FFDEAB] rounded" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        </div>
                                    </div>
                                </div>
                                {/* Details */}
                                <div className="mt-2 space-y-0.5">
                                    <div className="flex items-center space-x-1.5">
                                        <span className="w-4 h-4 rounded-md bg-[#248BFA] flex items-center justify-center text-white font-black text-[9px]">
                                            ?
                                        </span>
                                        <span className="font-bold text-[14px] text-slate-900">Medle</span>
                                    </div>
                                    <p className="text-[12px] text-slate-500 font-medium leading-tight">Guess it before the hints run out</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* END: TestYourRecall */}

                    {/* BEGIN: SpotTheSign */}
                    <section className="space-y-2.5 pb-4" data-purpose="spot-the-sign">
                        <h2 className="text-[17px] font-extrabold text-slate-900 tracking-tight">Spot the sign</h2>

                        {/* Full Width Game Card: Image Rush */}
                        <div
                            onClick={() => setActiveGameModal('imageRush')}
                            className="flex flex-col group cursor-pointer"
                        >
                            <div
                                style={{
                                    background: 'linear-gradient(145deg, #FFF6EC 0%, #FBEFDF 100%)',
                                }}
                                className="h-48 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xs border border-orange-100/50 transition-transform group-hover:scale-[1.01]"
                            >
                                {/* Ambient Swoosh */}
                                <div className="absolute -left-6 top-10 w-24 h-24 bg-orange-200/30 rounded-full blur-xl" />
                                {/* 3D Anatomical Heart with motion dashes */}
                                <div className="relative flex items-center justify-center">
                                    {/* Left Speed Swooshes */}
                                    <div className="absolute -left-10 flex flex-col space-y-2">
                                        <div className="w-6 h-1 rounded-full bg-orange-300/60 -rotate-12" />
                                        <div className="w-8 h-1 rounded-full bg-orange-400/60" />
                                        <div className="w-4 h-1 rounded-full bg-orange-300/50 rotate-12" />
                                    </div>
                                    {/* Heart Graphic */}
                                    <div className="text-7xl transform hover:scale-105 transition-transform drop-shadow-md select-none">
                                        🫀
                                    </div>
                                    {/* Right Subtle Stars */}
                                    <div className="absolute -right-8 flex flex-col space-y-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        <div className="w-1 h-1 rounded-full bg-orange-400" />
                                    </div>
                                </div>
                            </div>
                            {/* Details */}
                            <div className="mt-2 space-y-0.5">
                                <div className="flex items-center space-x-1.5">
                                    <span className="w-4 h-4 rounded-md bg-[#3891F8] flex items-center justify-center text-white text-[10px]">
                                        ⏱️
                                    </span>
                                    <span className="font-bold text-[14px] text-slate-900">Image Rush</span>
                                </div>
                                <p className="text-[12px] text-slate-500 font-medium leading-tight">Identify medical images ASAP</p>
                            </div>
                        </div>

                        {/* 2-Column Grid: Anatomy Explorer & Here and There */}
                        <div className="grid grid-cols-2 gap-3.5 pt-1">
                            {/* Game Card: Anatomy Explorer */}
                            <div
                                onClick={() => setActiveGameModal('anatomy')}
                                className="flex flex-col group cursor-pointer"
                            >
                                <div
                                    style={{
                                        background: 'linear-gradient(145deg, #FFF6EC 0%, #FBEFDF 100%)',
                                    }}
                                    className="aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xs border border-orange-100/50 p-2 transition-transform group-hover:scale-[1.02]"
                                >
                                    {/* Human Skeleton Figure */}
                                    <div className="relative flex flex-col items-center">
                                        {/* Glowing halo over skull */}
                                        <div className="w-10 h-10 rounded-full border border-orange-300/80 bg-white/40 flex items-center justify-center shadow-2xs">
                                            <span className="text-lg">💀</span>
                                        </div>
                                        {/* Skeleton Ribcage & Pelvis Representation */}
                                        <div className="w-4 h-6 border-x-2 border-dashed border-amber-800/40 mt-0.5" />
                                        <div className="w-6 h-3 border-2 border-amber-800/40 rounded-b-md" />
                                        <div className="flex space-x-2 mt-0.5">
                                            <div className="w-1 h-8 bg-amber-800/30 rounded-full" />
                                            <div className="w-1 h-8 bg-amber-800/30 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                                {/* Details */}
                                <div className="mt-2 space-y-0.5">
                                    <div className="flex items-center space-x-1.5">
                                        <span className="w-4 h-4 rounded-md bg-[#FF843E] flex items-center justify-center text-white text-[10px]">
                                            💀
                                        </span>
                                        <span className="font-bold text-[14px] text-slate-900">Anatomy Explorer</span>
                                    </div>
                                    <p className="text-[12px] text-slate-500 font-medium leading-tight">Explore models, master structures</p>
                                </div>
                            </div>

                            {/* Game Card: Here and There */}
                            <div
                                onClick={() => setActiveGameModal('hereAndThere')}
                                className="flex flex-col group cursor-pointer"
                            >
                                <div
                                    style={{
                                        background: 'linear-gradient(145deg, #FFF6EC 0%, #FBEFDF 100%)',
                                    }}
                                    className="aspect-square rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-2xs border border-orange-100/50 p-2 transition-transform group-hover:scale-[1.02]"
                                >
                                    {/* 3D Brain Model */}
                                    <div className="text-4xl drop-shadow-xs select-none mb-2">
                                        🧠
                                    </div>
                                    {/* Action Cross / Check Feedback Buttons */}
                                    <div className="flex space-x-3 items-center">
                                        <div className="w-5 h-5 rounded-full border border-rose-500 flex items-center justify-center text-rose-500 text-[10px] font-black bg-white/70">
                                            ✕
                                        </div>
                                        <div className="w-5 h-5 rounded-full border border-emerald-500 flex items-center justify-center text-emerald-500 text-[10px] font-black bg-white/70">
                                            ✓
                                        </div>
                                    </div>
                                </div>
                                {/* Details */}
                                <div className="mt-2 space-y-0.5">
                                    <div className="flex items-center space-x-1.5">
                                        <span className="w-4 h-4 rounded-md bg-[#A5683F] flex items-center justify-center text-white text-[10px]">
                                            ↔️
                                        </span>
                                        <span className="font-bold text-[14px] text-slate-900">Here and There</span>
                                    </div>
                                    <p className="text-[12px] text-slate-500 font-medium leading-tight">Swipe left or right to call it</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* END: SpotTheSign */}
                </main>

                {/* BEGIN: FloatingAssistant */}
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[398px] z-40">
                    <button
                        onClick={() => setCortexModalOpen(true)}
                        className="w-full bg-white/95 backdrop-blur-md rounded-full py-2.5 px-3.5 flex items-center space-x-3 shadow-xl border border-slate-200/80 active:scale-[0.99] transition-transform cursor-pointer"
                    >
                        {/* Friendly Doctor Mascot */}
                        <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center relative shadow-2xs shrink-0">
                            <span className="text-lg">🤖</span>
                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                        </div>
                        {/* Input Placeholder */}
                        <span className="text-[14px] font-semibold text-slate-700 tracking-tight flex-1 text-left">Ask Cortex AI anything</span>
                        <span className="text-[11px] bg-blue-50 text-[#1872F4] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs border border-blue-100">
                            <Sparkles className="w-3 h-3 text-[#1872F4]" />
                            <span>AI Tutor</span>
                        </span>
                    </button>
                </div>
                {/* END: FloatingAssistant */}

                {/* BEGIN: BottomNavigation */}
                <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-md border-t border-slate-100 px-3 py-2 z-30 shadow-md">
                    <div className="flex items-center justify-around">
                        {/* Tab 1: Quiz */}
                        <Link
                            className="flex flex-col items-center justify-center text-slate-500 hover:text-slate-700 py-1 px-2 transition-colors"
                            href="/qbank/runner"
                        >
                            <div className="w-6 h-6 flex items-center justify-center mb-0.5">
                                <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.67z" />
                                </svg>
                            </div>
                            <span className="text-[11px] font-semibold tracking-tight text-slate-500">Quiz</span>
                        </Link>

                        {/* Tab 2: Lessons */}
                        <Link
                            className="flex flex-col items-center justify-center text-slate-500 hover:text-slate-700 py-1 px-2 transition-colors"
                            href="/directory"
                        >
                            <div className="w-6 h-6 flex items-center justify-center mb-0.5">
                                <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
                                </svg>
                            </div>
                            <span className="text-[11px] font-semibold tracking-tight text-slate-500">Lessons</span>
                        </Link>

                        {/* Tab 3: Home */}
                        <Link
                            className="flex flex-col items-center justify-center text-slate-500 hover:text-slate-700 py-1 px-2 transition-colors"
                            href="/dashboard"
                        >
                            <div className="w-6 h-6 flex items-center justify-center mb-0.5">
                                <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                                </svg>
                            </div>
                            <span className="text-[11px] font-semibold tracking-tight text-slate-500">Home</span>
                        </Link>

                        {/* Tab 4: Flashcards */}
                        <Link
                            className="flex flex-col items-center justify-center text-slate-500 hover:text-slate-700 py-1 px-2 transition-colors"
                            href="/flashcards"
                        >
                            <div className="w-6 h-6 flex items-center justify-center mb-0.5">
                                <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4 4h16v12H4z M2 8h2v10h14v2H2z" />
                                </svg>
                            </div>
                            <span className="text-[11px] font-semibold tracking-tight text-slate-500">Flashcards</span>
                        </Link>

                        {/* Tab 5: Play (Active) */}
                        <div className="flex flex-col items-center justify-center py-1 px-3 cursor-pointer">
                            <div className="w-13 h-7 bg-blue-100/80 rounded-full flex items-center justify-center mb-0.5 px-3">
                                <svg className="w-5 h-5 text-[#1872F4] fill-current" viewBox="0 0 24 24">
                                    <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5a2.5 2.5 0 0 1 0 5H2v4c0 1.1.9 2 2 2h3.8v-1.5a2.5 2.5 0 0 1 5 0V21H17c1.1 0 2-.9 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z" />
                                </svg>
                            </div>
                            <span className="text-[11px] font-bold tracking-tight text-[#1872F4]">Play</span>
                        </div>
                    </div>
                </nav>
                {/* END: BottomNavigation */}
            </div>

            {/* ========================================================= */}
            {/* 1. PLAYABLE MEDLE MODAL                                   */}
            {/* ========================================================= */}
            {activeGameModal === 'medle' && (
                <div className="fixed inset-0 z-60 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-purple-50/70">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-xl bg-[#1872F4]/10 text-lg flex items-center justify-center shrink-0">
                                    {activeMedle.organEmoji || '🫀'}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h3 className="font-extrabold text-sm text-slate-900">
                                            Medle #{activeMedle.caseNumber || 142}
                                        </h3>
                                        <span className="text-[10px] bg-blue-100 text-[#1872F4] font-bold px-2 py-0.5 rounded-full">
                                            Case {medleCaseIndex + 1} of {casesBank.length}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium">
                                        {activeMedle.specialty || 'Clinical Mystery'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="bg-orange-100 text-orange-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Flame className="w-3 h-3 text-orange-600" />
                                    <span>{playerStats.streakDays}</span>
                                </span>
                                <button
                                    onClick={() => setActiveGameModal(null)}
                                    className="text-neutral-400 hover:text-neutral-700 p-1"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Clues List */}
                        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 bg-[#F9FAFC]">
                            <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                                <span className="font-bold flex items-center gap-1.5">
                                    <Activity className="w-3.5 h-3.5 text-[#1872F4]" />
                                    Hints Revealed: {revealedClues} / 4
                                </span>
                                {!medleSolved && (
                                    <span className="font-extrabold text-[#1872F4] bg-blue-50 px-2 py-0.5 rounded-md text-[11px]">
                                        +{revealedClues === 1 ? 150 : revealedClues === 2 ? 100 : revealedClues === 3 ? 75 : 50} XP Available
                                    </span>
                                )}
                            </div>

                            {activeMedle.clues.map((clue, idx) => {
                                const isUnlocked = idx < revealedClues;
                                return (
                                    <div
                                        key={idx}
                                        className={`rounded-2xl p-3 border transition-all ${
                                            isUnlocked
                                                ? idx === 0
                                                    ? 'bg-[#FFEFE7] border-[#FFDEC9]'
                                                    : idx === 1
                                                    ? 'bg-[#EAF3FF] border-[#D5E6FE]'
                                                    : idx === 2
                                                    ? 'bg-[#EBF7F2] border-[#D1EFE2]'
                                                    : 'bg-[#FFF4E4] border-[#FFE7C4]'
                                                : 'bg-neutral-100 border-neutral-200 opacity-60'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                <span>Hint {idx + 1}: {clue.title}</span>
                                            </span>
                                            {isUnlocked ? (
                                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Check className="w-3 h-3" /> Revealed
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-500 bg-neutral-200/80 px-2 py-0.5 rounded-full font-mono">
                                                    Locked
                                                </span>
                                            )}
                                        </div>
                                        {isUnlocked ? (
                                            <div className="mt-2 text-xs text-slate-700 leading-relaxed font-normal">
                                                <p className="font-semibold text-slate-900">{clue.text}</p>
                                                {clue.danger && (
                                                    <p className="text-[11px] text-slate-600 mt-1.5 bg-white/70 p-1.5 rounded-lg border border-slate-200/50">
                                                        <strong>Takeaway:</strong> {clue.danger}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-neutral-400 mt-1 italic">
                                                Make a guess or request hint to unlock...
                                            </p>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Differential Rule-Out Alert Card */}
                            {medleRuledOut.length > 0 && !medleSolved && (
                                <div className="space-y-2 mt-2">
                                    {medleRuledOut.slice(-2).map((item, rIdx) => (
                                        <div key={rIdx} className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                                            <div className="flex items-center gap-1.5 font-bold text-rose-700 mb-0.5">
                                                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                                <span>Differential Ruled Out: {item.name}</span>
                                            </div>
                                            <p className="text-[11px] leading-relaxed text-rose-800">{item.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Outcome Debrief Banner */}
                            {medleSolved && (
                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 mt-2 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <Trophy className="w-5 h-5 text-emerald-600 shrink-0" />
                                            <div>
                                                <strong className="block font-black text-sm text-emerald-900">
                                                    Case Solved: {activeMedle.disease}
                                                </strong>
                                                <span className="text-[11px] font-semibold text-emerald-700">
                                                    {revealedClues === 1 ? '⭐⭐⭐ Master Clinician' : revealedClues === 2 ? '⭐⭐ Senior Resident' : '⭐ Attending in Training'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded-xl">
                                            +{revealedClues === 1 ? 150 : revealedClues === 2 ? 100 : 75} XP
                                        </span>
                                    </div>
                                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                                        <span className="font-bold text-[10px] text-emerald-800 uppercase tracking-wider block mb-0.5">
                                            High-Yield Board Pearl
                                        </span>
                                        <p className="text-xs text-emerald-900 leading-relaxed font-medium">{activeMedle.pearl}</p>
                                    </div>
                                    {activeMedle.immediateManagement && (
                                        <div className="bg-blue-50/80 p-2.5 rounded-xl border border-blue-200/60">
                                            <span className="font-bold text-[10px] text-blue-800 uppercase tracking-wider block mb-0.5">
                                                Immediate Management Step
                                            </span>
                                            <p className="text-xs text-blue-900 leading-relaxed font-medium">{activeMedle.immediateManagement}</p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 pt-1">
                                        <button
                                            onClick={handleShareMedle}
                                            className="flex-1 py-2 px-3 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>Share Matrix</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                const q = `Explain why ${activeMedle.disease} was the definitive diagnosis and the differential reasoning in Medle Case #${activeMedle.caseNumber || 142}.`;
                                                handleSendCortexAi(undefined, q);
                                                setCortexModalOpen(true);
                                            }}
                                            className="flex-1 py-2 px-3 rounded-xl bg-[#1872F4] text-white hover:bg-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                        >
                                            <Zap className="w-3.5 h-3.5" />
                                            <span>Ask Cortex AI</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {medleFailed && (
                                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 mt-2">
                                    <strong className="block font-bold mb-1">Definitive Diagnosis: {activeMedle.disease}</strong>
                                    <p className="leading-relaxed">{activeMedle.pearl}</p>
                                </div>
                            )}
                        </div>

                        {/* Diagnostic Input & Action Footer */}
                        <div className="p-4 border-t border-neutral-100 bg-white">
                            {!medleSolved && !medleFailed ? (
                                <div className="space-y-3">
                                    {/* Autocomplete Input */}
                                    <div className="relative">
                                        <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2 bg-[#F8FAFC] focus-within:border-[#1872F4] focus-within:ring-1 focus-within:ring-[#1872F4]">
                                            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                                            <input
                                                type="text"
                                                value={medleSearchQuery}
                                                onChange={(e) => handleSearchChange(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && medleSearchQuery.trim()) {
                                                        handleMedleGuess(medleSearchQuery);
                                                    }
                                                }}
                                                placeholder="Search medical dictionary (e.g. Endocarditis)..."
                                                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
                                            />
                                            {medleSearchQuery && (
                                                <button
                                                    onClick={() => handleMedleGuess(medleSearchQuery)}
                                                    className="bg-[#1872F4] text-white text-[11px] font-bold px-2 py-0.5 rounded-md hover:bg-blue-700 cursor-pointer"
                                                >
                                                    Check
                                                </button>
                                            )}
                                        </div>

                                        {/* Suggestions Overlay */}
                                        {medleSuggestions.length > 0 && (
                                            <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20">
                                                {medleSuggestions.map((item) => (
                                                    <div
                                                        key={item}
                                                        onClick={() => handleMedleGuess(item)}
                                                        className="px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#1872F4] cursor-pointer flex items-center justify-between font-semibold border-b border-slate-100 last:border-none"
                                                    >
                                                        <span>{item}</span>
                                                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Differential Diagnosis Quick Chips */}
                                    <div>
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                            High-Yield Differential Chips:
                                        </span>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {activeMedle.options.map((opt) => {
                                                const isRuledOut = medleRuledOut.some((r) => r.name === opt);
                                                return (
                                                    <button
                                                        key={opt}
                                                        disabled={isRuledOut}
                                                        onClick={() => handleMedleGuess(opt)}
                                                        className={`p-2 rounded-xl border text-[11px] font-semibold text-left transition truncate cursor-pointer ${
                                                            isRuledOut
                                                                ? 'bg-rose-50 border-rose-200 text-rose-400 line-through'
                                                                : 'border-neutral-200 text-slate-800 hover:border-[#1872F4] hover:bg-blue-50/50'
                                                        }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleNextMedleCase}
                                        className="flex-1 py-2.5 rounded-xl bg-[#1872F4] text-white font-bold text-xs hover:bg-blue-700 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
                                    >
                                        <span>Next Mystery Case</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setActiveGameModal(null)}
                                        className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                                    >
                                        Exit
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 2. PLAYABLE SYNAPSES (CONNECTIONS) MODAL                  */}
            {/* ========================================================= */}
            {activeGameModal === 'synapses' && (
                <div className="fixed inset-0 z-60 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-purple-50/70">
                            <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-lg bg-[#6442ED] text-white flex items-center justify-center text-xs">
                                    🧩
                                </div>
                                <h3 className="font-extrabold text-sm text-slate-900">Synapses: 4 Connected Groups</h3>
                            </div>
                            <button
                                onClick={() => setActiveGameModal(null)}
                                className="text-neutral-400 hover:text-neutral-700 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Synapses Game Board */}
                        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-[#F9FAFC]">
                            <p className="text-xs text-slate-500">
                                Find 4 groups of 4 medical concepts with a common clinical thread. Select 4 items and tap Submit!
                            </p>

                            {/* Solved Groups List */}
                            {synapseSolvedGroups.map((cat) => {
                                const group = synapsesData.groups.find((g) => g.category === cat);
                                return (
                                    <div
                                        key={cat}
                                        className={`rounded-2xl p-3 border text-center shadow-2xs animate-in zoom-in-95 duration-200 ${group?.color || 'bg-neutral-100 text-neutral-800'}`}
                                    >
                                        <div className="font-black text-xs uppercase tracking-wider">{cat}</div>
                                        <div className="text-[11px] font-medium mt-0.5 opacity-90">
                                            {group?.items.join(' • ')}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Active Grid */}
                            {synapseItems.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {synapseItems.map((item) => {
                                        const isSelected = synapseSelected.includes(item.text);
                                        return (
                                            <button
                                                key={item.text}
                                                onClick={() => toggleSynapseSelect(item.text)}
                                                className={`min-h-[52px] p-2.5 rounded-xl border text-xs font-bold text-center flex items-center justify-center transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-98'
                                                        : 'bg-white text-slate-800 border-neutral-200 hover:border-slate-400 hover:bg-neutral-50 shadow-2xs'
                                                }`}
                                            >
                                                {item.text}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-6 text-center">
                                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                                        🏆
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-900">All Synapses Connected!</h4>
                                    <p className="text-xs text-slate-500 mt-1">
                                        You solved all 4 medical categories with zero mistakes. +400 XP!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Synapses Footer */}
                        <div className="p-4 border-t border-neutral-100 bg-white flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-mono font-medium">
                                {synapseSelected.length} / 4 Selected
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setSynapseSelected([])}
                                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-neutral-100"
                                >
                                    Deselect All
                                </button>
                                <button
                                    onClick={handleSynapsesSubmit}
                                    disabled={synapseSelected.length !== 4}
                                    className="px-4 py-2 rounded-xl bg-[#6442ED] text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-40 transition cursor-pointer"
                                >
                                    Submit Match
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 3. PLAYABLE HERE AND THERE (BINARY CLASSIFICATION)        */}
            {/* ========================================================= */}
            {activeGameModal === 'hereAndThere' && (
                <div className="fixed inset-0 z-60 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
                        {/* Header */}
                        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-orange-50/70">
                            <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-lg bg-[#A5683F] text-white flex items-center justify-center text-xs">
                                    ↔️
                                </div>
                                <h3 className="font-extrabold text-sm text-slate-900">Here & There: Crohn's vs UC</h3>
                            </div>
                            <button
                                onClick={() => setActiveGameModal(null)}
                                className="text-neutral-400 hover:text-neutral-700 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Game Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between bg-[#FDFBF7]">
                            {!hatCompleted ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                                        <span>Round {hatCardIndex + 1} of {hereAndThereData.cards.length}</span>
                                        <span className="font-bold text-amber-600">Score: {hatScore}</span>
                                    </div>

                                    {/* Vignette Card */}
                                    <div className="min-h-[160px] rounded-2xl bg-white border border-amber-200/80 p-5 shadow-xs flex flex-col justify-center text-center">
                                        <span className="text-3xl mb-2">🧠</span>
                                        <p className="text-sm font-bold text-slate-800 leading-relaxed">
                                            {hereAndThereData.cards[hatCardIndex]?.text}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 text-center flex flex-col items-center">
                                    <div className="text-4xl mb-2">🎯</div>
                                    <h4 className="font-extrabold text-base text-slate-900">Round Completed!</h4>
                                    <p className="text-xs text-slate-500 mt-1">
                                        You scored {hatScore} out of {hereAndThereData.cards.length} correct.
                                    </p>
                                </div>
                            )}

                            {/* Binary Choice Buttons */}
                            {!hatCompleted ? (
                                <div className="grid grid-cols-2 gap-3 mt-6">
                                    <button
                                        onClick={() => handleHatChoice('left')}
                                        className="py-3 px-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs hover:bg-rose-100 active:scale-95 transition cursor-pointer flex flex-col items-center justify-center gap-1"
                                    >
                                        <span className="text-base font-black">✕ Left</span>
                                        <span>{hereAndThereData.leftCategory}</span>
                                    </button>
                                    <button
                                        onClick={() => handleHatChoice('right')}
                                        className="py-3 px-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs hover:bg-emerald-100 active:scale-95 transition cursor-pointer flex flex-col items-center justify-center gap-1"
                                    >
                                        <span className="text-base font-black">✓ Right</span>
                                        <span>{hereAndThereData.rightCategory}</span>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setActiveGameModal(null)}
                                    className="w-full py-2.5 rounded-xl bg-[#A5683F] text-white font-bold text-xs hover:bg-amber-800 transition cursor-pointer"
                                >
                                    Return to Hub
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 4. PLAYABLE IMAGE RUSH MODAL                              */}
            {/* ========================================================= */}
            {activeGameModal === 'imageRush' && (
                <div className="fixed inset-0 z-60 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
                        {/* Header */}
                        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-blue-50/70">
                            <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-lg bg-[#3891F8] text-white flex items-center justify-center text-xs">
                                    ⏱️
                                </div>
                                <h3 className="font-extrabold text-sm text-slate-900">Image Rush: Speed Diagnosis</h3>
                            </div>
                            <button
                                onClick={() => setActiveGameModal(null)}
                                className="text-neutral-400 hover:text-neutral-700 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between bg-[#F9FBFE]">
                            {!irCompleted ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                                        <span>Card {irIndex + 1} / {imageRushCards.length}</span>
                                        <span className="font-bold text-blue-600">Score: {irScore}</span>
                                    </div>

                                    {/* Question Graphic Stage */}
                                    <div className="rounded-2xl bg-white border border-blue-100 p-6 shadow-xs flex flex-col items-center justify-center text-center">
                                        <div className="text-6xl mb-3 animate-bounce select-none">
                                            {imageRushCards[irIndex]?.emoji}
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 leading-relaxed">
                                            {imageRushCards[irIndex]?.question}
                                        </p>
                                    </div>

                                    {/* Options */}
                                    <div className="grid grid-cols-1 gap-2 pt-2">
                                        {imageRushCards[irIndex]?.options.map((opt, optIdx) => {
                                            const isSelected = irSelectedOption === optIdx;
                                            const isCorrect = optIdx === imageRushCards[irIndex]?.correct;
                                            return (
                                                <button
                                                    key={opt}
                                                    disabled={irSelectedOption !== null}
                                                    onClick={() => handleIrSelect(optIdx)}
                                                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                                                        isSelected
                                                            ? isCorrect
                                                                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                                                                : 'bg-rose-50 border-rose-400 text-rose-800'
                                                            : 'bg-white border-neutral-200 text-slate-800 hover:border-blue-400'
                                                    }`}
                                                >
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center flex flex-col items-center">
                                    <div className="text-5xl mb-3">⚡</div>
                                    <h4 className="font-black text-lg text-slate-900">Image Rush Completed!</h4>
                                    <p className="text-xs text-slate-500 mt-1">
                                        You correctly recognized {irScore} / {imageRushCards.length} clinical signs at lightning speed!
                                    </p>
                                    <button
                                        onClick={() => setActiveGameModal(null)}
                                        className="mt-6 w-full py-2.5 rounded-xl bg-[#3891F8] text-white font-bold text-xs hover:bg-blue-600 transition cursor-pointer"
                                    >
                                        Back to Gaming Hub
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 5. CORTEX AI CLINICAL TUTOR & GAME MASTER MODAL           */}
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
                                    <p className="text-[11px] text-neutral-500">Board Landmarks • Differential Reasoning • Quick Mnemonics</p>
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

                        {/* Chat Messages */}
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

                        {/* Quick Prompts Carousel */}
                        <div className="px-3 py-2 bg-white border-t border-neutral-100 flex items-center space-x-2 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => handleSendCortexAi(undefined, 'Diagnostic hint for today Medle case')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                🫀 Medle Case Hint
                            </button>
                            <button
                                onClick={() => handleSendCortexAi(undefined, 'Explain SAD PUCKER retroperitoneal mnemonic')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                🧠 SAD PUCKER
                            </button>
                            <button
                                onClick={() => handleSendCortexAi(undefined, 'What is the immediate management for tension pneumothorax?')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                ⚡ Tension Pneumothorax
                            </button>
                            <button
                                onClick={() => handleSendCortexAi(undefined, 'Duke criteria and gallolyticus association in endocarditis')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                🩺 Duke Criteria
                            </button>
                            <button
                                onClick={() => handleSendCortexAi(undefined, 'Acute pancreatitis diagnosis, lipase vs amylase, and Ranson criteria')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                🧪 Acute Pancreatitis
                            </button>
                        </div>

                        {/* Input */}
                        <form onSubmit={(e) => handleSendCortexAi(e)} className="p-3 bg-white border-t border-neutral-200 flex items-center space-x-2">
                            <input
                                type="text"
                                value={cortexQuery}
                                onChange={(e) => setCortexQuery(e.target.value)}
                                placeholder="Ask Cortex AI anything (e.g. Duke criteria, Charcot triad, RIPE drugs)..."
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
