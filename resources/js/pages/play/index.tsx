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
    Send,
    ArrowRight,
    ChevronRight,
    Award,
    Activity,
    BookOpen,
    Layers,
    Puzzle,
    Gamepad2,
    Stethoscope,
    Brain,
    Eye,
    Target,
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

    // Reset game when switching cases
    const switchMedleCase = (index: number) => {
        setMedleCaseIndex(index);
        setRevealedClues(1);
        setMedleSelectedOption(null);
        setMedleSolved(false);
        setMedleFailed(false);
        setMedleSearchQuery('');
        setMedleSuggestions([]);
        setMedleRuledOut([]);
    };

    // Autocomplete dictionary lookup
    const handleMedleSearch = (query: string) => {
        setMedleSearchQuery(query);
        if (query.trim().length >= 2) {
            const lower = query.toLowerCase();
            const matches = medicalDictionary
                .filter((d) => d.toLowerCase().includes(lower))
                .slice(0, 5);
            setMedleSuggestions(matches);
        } else {
            setMedleSuggestions([]);
        }
    };

    // Reveal next clue
    const handleRevealNextClue = () => {
        if (revealedClues < 4) {
            setRevealedClues((prev) => prev + 1);
            toast.info(`Hint ${revealedClues + 1} revealed!`, {
                description: activeMedle.clues[revealedClues]?.title,
            });
        }
    };

    // Make diagnosis guess
    const handleMedleGuess = (guessText: string) => {
        const cleanGuess = guessText.trim();
        if (!cleanGuess) return;

        setMedleSelectedOption(cleanGuess);
        setMedleSearchQuery('');
        setMedleSuggestions([]);

        if (cleanGuess.toLowerCase() === activeMedle.disease.toLowerCase()) {
            setMedleSolved(true);
            setRevealedClues(4);
            toast.success('Diagnosis Confirmed! Excellent clinical deduction!', {
                description: `Correctly diagnosed: ${activeMedle.disease}`,
            });
        } else {
            // Rule out with educational explanation
            const ruleOutReason =
                activeMedle.differentialReasons?.[cleanGuess] ||
                `${cleanGuess} does not fit the cardinal diagnostic signs and vitals in this presentation.`;
            setMedleRuledOut((prev) => [...prev, { name: cleanGuess, reason: ruleOutReason }]);

            if (revealedClues < 4) {
                setRevealedClues((prev) => prev + 1);
                toast.error(`"${cleanGuess}" is ruled out! Hint ${revealedClues + 1} unlocked.`, {
                    description: ruleOutReason,
                });
            } else {
                setMedleFailed(true);
                toast.error('All 4 clues exhausted! Review the clinical breakdown.', {
                    description: `The correct diagnosis was: ${activeMedle.disease}`,
                });
            }
        }
    };

    // ==========================================
    // 2. SYNAPSES GAME STATE (4 CONNECTED GROUPS)
    // ==========================================
    const allSynapseItems = synapsesData.groups.flatMap((g) =>
        g.items.map((it) => ({ text: it, category: g.category }))
    );
    const [synapseItems, setSynapseItems] = useState(allSynapseItems);
    const [synapseSelected, setSynapseSelected] = useState<string[]>([]);
    const [synapseSolvedGroups, setSynapseSolvedGroups] = useState<string[]>([]);

    const toggleSynapseSelect = (itemText: string) => {
        if (synapseSelected.includes(itemText)) {
            setSynapseSelected((prev) => prev.filter((i) => i !== itemText));
        } else {
            if (synapseSelected.length < 4) {
                setSynapseSelected((prev) => [...prev, itemText]);
            }
        }
    };

    const handleSynapsesSubmit = () => {
        if (synapseSelected.length !== 4) return;

        // Check if all 4 belong to same category
        const firstCategory = synapseItems.find((i) => i.text === synapseSelected[0])?.category;
        const allMatch = synapseSelected.every(
            (txt) => synapseItems.find((i) => i.text === txt)?.category === firstCategory
        );

        if (allMatch && firstCategory) {
            setSynapseSolvedGroups((prev) => [...prev, firstCategory]);
            setSynapseItems((prev) => prev.filter((i) => i.category !== firstCategory));
            setSynapseSelected([]);
            toast.success(`Group Connected: "${firstCategory}"!`, {
                description: 'You uncovered one of the 4 clinical connections.',
            });
        } else {
            toast.error('No connection found between these 4 concepts. Keep looking!');
        }
    };

    // ==========================================
    // 3. HERE AND THERE (BINARY CLASSIFICATION)
    // ==========================================
    const [hatCardIndex, setHatCardIndex] = useState(0);
    const [hatScore, setHatScore] = useState(0);
    const [hatCompleted, setHatCompleted] = useState(false);

    const handleHatChoice = (choice: 'left' | 'right') => {
        const current = hereAndThereData.cards[hatCardIndex];
        const isCorrect = choice === current.correct;

        if (isCorrect) {
            setHatScore((prev) => prev + 1);
            toast.success('Correct Match! +10 XP');
        } else {
            toast.error(`Incorrect. That feature belongs to ${current.correct === 'left' ? hereAndThereData.leftCategory : hereAndThereData.rightCategory}.`);
        }

        if (hatCardIndex + 1 < hereAndThereData.cards.length) {
            setHatCardIndex((prev) => prev + 1);
        } else {
            setHatCompleted(true);
            toast.success('Round complete!', {
                description: `Final score: ${hatScore + (isCorrect ? 1 : 0)} / ${hereAndThereData.cards.length}`,
            });
        }
    };

    // ==========================================
    // 4. IMAGE RUSH (VISUAL SPOTTER)
    // ==========================================
    const [irIndex, setIrIndex] = useState(0);
    const [irScore, setIrScore] = useState(0);
    const [irSelectedOption, setIrSelectedOption] = useState<number | null>(null);
    const [irCompleted, setIrCompleted] = useState(false);

    const handleIrSelect = (optionIdx: number) => {
        if (irSelectedOption !== null) return;
        setIrSelectedOption(optionIdx);

        const current = imageRushCards[irIndex];
        const isCorrect = optionIdx === current.correct;

        if (isCorrect) {
            setIrScore((prev) => prev + 1);
            toast.success('Spot-on diagnosis!', {
                description: current.explanation,
            });
        } else {
            toast.error('Incorrect visual diagnosis.', {
                description: current.explanation,
            });
        }

        setTimeout(() => {
            if (irIndex + 1 < imageRushCards.length) {
                setIrIndex((prev) => prev + 1);
                setIrSelectedOption(null);
            } else {
                setIrCompleted(true);
            }
        }, 1500);
    };

    // ==========================================
    // 5. CORTEX AI CLINICAL CHAT HANDLER
    // ==========================================
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
                    subject: 'Clinical Medical Play & Gamified Recall',
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
                        text: aiData.reply || 'Here is the clinical breakdown for this case.',
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
                            text: `Regarding "${text}": In medical board scenarios, prioritize establishing hemodynamic stability (airway, breathing, circulation) before pursuing secondary diagnostic steps.`,
                            clinicalPearl: 'Key high-yield association: Pair acute presentation with pathognomonic physical signs for rapid 30-second recall.',
                            relatedTopics: ['Hemodynamic Stability', 'Diagnostic Triads', 'Board Pearls'],
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

    return (
        <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto selection:bg-orange-100 selection:text-orange-600 font-sans">
            <Head title="Play & Medical Games - Clinical Reasoning & Active Recall" />

            {/* ========================================================= */}
            {/* 1. TOP HEADER & GAMING PROGRESS METRICS                   */}
            {/* ========================================================= */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-neutral-200/80">
                <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF8C6B] flex items-center justify-center text-white shadow-md shadow-orange-200">
                        <Gamepad2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                                Medical Gaming Hub & Play
                            </h1>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200">
                                Level {playerStats.level} • {playerStats.title}
                            </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            Gamified active recall • Pattern matching, diagnostic puzzles & rapid visual spotters
                        </p>
                    </div>
                </div>

                {/* Player Stats Badges & Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Streak Badge */}
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold shadow-2xs">
                        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <span>{playerStats.streakDays}-Day Streak</span>
                    </div>

                    {/* XP Badge */}
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[#1872F4] text-xs font-bold shadow-2xs">
                        <Zap className="w-4 h-4 text-[#1872F4] fill-[#1872F4]" />
                        <span>{playerStats.xp} XP</span>
                    </div>

                    {/* Today completed */}
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{playerStats.completedToday} Solved Today</span>
                    </div>

                    {/* Dr. Cortex AI trigger */}
                    <button
                        type="button"
                        onClick={() => setCortexModalOpen(true)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs active:scale-98 transition cursor-pointer"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Dr. Cortex AI Tutor</span>
                    </button>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 2. FEATURED HERO: DAILY MEDLE DIAGNOSTIC SHOWCASE         */}
            {/* ========================================================= */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-orange-50 via-rose-50/40 to-indigo-50 border border-orange-200/60 shadow-sm relative overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-orange-200/30 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-purple-200/30 blur-3xl pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Left 7 Columns: Case Overview & Primary Action */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-rose-100 text-rose-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                Featured Daily Case #{activeMedle.caseNumber || 142}
                            </span>
                            <span className="bg-white/80 text-neutral-700 text-xs font-semibold px-3 py-1 rounded-full border border-neutral-200">
                                {activeMedle.specialty || 'Internal Medicine / Cardiology'}
                            </span>
                            <span className="text-xs text-neutral-500 font-mono">
                                Case {medleCaseIndex + 1} of {casesBank.length}
                            </span>
                        </div>

                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                                Medle: Clinical Mystery Challenge
                            </h2>
                            <p className="text-sm text-neutral-600 mt-1.5 max-w-xl leading-relaxed">
                                Uncover 4 progressive clinical clues (ECG & telemetry, vital signs, laboratory biomarkers, and physical examination findings). Deduce the correct diagnosis before hints run out!
                            </p>
                        </div>

                        {/* Clue Progress Badges Preview */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                            <div className="bg-white/90 rounded-xl p-2.5 border border-orange-200/80 flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs">
                                    📈
                                </div>
                                <div className="text-[11px] font-bold text-neutral-800">1. ECG Strip</div>
                            </div>
                            <div className="bg-white/90 rounded-xl p-2.5 border border-blue-200/80 flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                                    🌡️
                                </div>
                                <div className="text-[11px] font-bold text-neutral-800">2. Vitals</div>
                            </div>
                            <div className="bg-white/90 rounded-xl p-2.5 border border-emerald-200/80 flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">
                                    🩸
                                </div>
                                <div className="text-[11px] font-bold text-neutral-800">3. Labs</div>
                            </div>
                            <div className="bg-white/90 rounded-xl p-2.5 border border-purple-200/80 flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs">
                                    🫀
                                </div>
                                <div className="text-[11px] font-bold text-neutral-800">4. Physical</div>
                            </div>
                        </div>

                        {/* Actions: Launch Game & Switch Cases */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setActiveGameModal('medle')}
                                className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-300 active:scale-98 transition cursor-pointer"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                <span>Play Medle Case #{activeMedle.caseNumber || 142}</span>
                            </button>

                            {/* Case Switcher Pill */}
                            <select
                                value={medleCaseIndex}
                                onChange={(e) => switchMedleCase(Number(e.target.value))}
                                className="px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                            >
                                {casesBank.map((c, idx) => (
                                    <option key={c.id || idx} value={idx}>
                                        Case #{c.caseNumber || 142 + idx}: {c.specialty || 'General'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Right 5 Columns: Visual Clue Preview Box */}
                    <div
                        onClick={() => setActiveGameModal('medle')}
                        className="lg:col-span-5 bg-white/95 backdrop-blur-xs rounded-2xl p-5 border border-neutral-200/80 shadow-md space-y-2.5 cursor-pointer hover:border-blue-400 transition group"
                    >
                        <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                Case Clue Stack Preview
                            </span>
                            <span className="text-xs font-semibold text-blue-600 group-hover:underline flex items-center gap-1">
                                <span>Interactive Diagnostic Board</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                        </div>

                        {/* Clue 1: ECG */}
                        <div className="bg-[#FFEFE7] border border-[#FFDEC9] rounded-xl p-2.5 px-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center text-red-500 font-bold text-xs">
                                    📈
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-neutral-900">{activeMedle.clues[0]?.title}</p>
                                    <p className="text-[11px] text-neutral-600 line-clamp-1">{activeMedle.clues[0]?.text}</p>
                                </div>
                            </div>
                            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                                Clue 1
                            </span>
                        </div>

                        {/* Clue 2: Vitals */}
                        <div className="bg-[#EAF3FF] border border-[#D5E6FE] rounded-xl p-2.5 px-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center text-blue-500 font-bold text-xs">
                                    🌡️
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-neutral-900">{activeMedle.clues[1]?.title}</p>
                                    <p className="text-[11px] text-neutral-600 line-clamp-1">{activeMedle.clues[1]?.text}</p>
                                </div>
                            </div>
                            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                                Clue 2
                            </span>
                        </div>

                        {/* Clue 3: Labs */}
                        <div className="bg-[#EBF7F2] border border-[#D1EFE2] rounded-xl p-2.5 px-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center text-emerald-500 font-bold text-xs">
                                    🧪
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-neutral-900">{activeMedle.clues[2]?.title}</p>
                                    <p className="text-[11px] text-neutral-600 line-clamp-1">{activeMedle.clues[2]?.text}</p>
                                </div>
                            </div>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                                Clue 3
                            </span>
                        </div>

                        {/* Clue 4: Exam */}
                        <div className="bg-[#FFF4E4] border border-[#FFE7C4] rounded-xl p-2.5 px-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center text-amber-500 font-bold text-xs">
                                    {activeMedle.organEmoji || '🫀'}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-neutral-900">{activeMedle.clues[3]?.title}</p>
                                    <p className="text-[11px] text-neutral-600 line-clamp-1">{activeMedle.clues[3]?.text}</p>
                                </div>
                            </div>
                            <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                                Clue 4
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 3. SECTION 1: DIAGNOSTIC & CLINICAL PUZZLES               */}
            {/* ========================================================= */}
            <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-neutral-900">Diagnostic & Clinical Puzzles</h2>
                        <p className="text-xs text-neutral-500">Solve patient scenarios, analyze test results, and deduce underlying pathology</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Game 1: Medle */}
                    <div
                        onClick={() => setActiveGameModal('medle')}
                        className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-neutral-300 transition flex flex-col justify-between group cursor-pointer"
                    >
                        <div>
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1872F4] flex items-center justify-center text-2xl group-hover:scale-105 transition">
                                    🩺
                                </div>
                                <span className="bg-blue-50 text-[#1872F4] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                                    Case Mystery
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-neutral-900 mt-3.5 group-hover:text-blue-600 transition">
                                Medle: Mystery Diagnosis
                            </h3>
                            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                Progressive clinical clue deduction. Review ECG, temperature, lab cultures, and physical exam findings before hints run out.
                            </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-400">4 Clues • 6 Cases</span>
                            <span className="inline-flex items-center text-xs font-bold text-[#1872F4] group-hover:translate-x-0.5 transition">
                                <span>Play Medle</span>
                                <ChevronRight className="w-4 h-4 ml-0.5" />
                            </span>
                        </div>
                    </div>

                    {/* Game 2: Probe */}
                    <div
                        onClick={() => setActiveGameModal('probe')}
                        className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-neutral-300 transition flex flex-col justify-between group cursor-pointer"
                    >
                        <div>
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                                    🔍
                                </div>
                                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                                    Pathology Clues
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-neutral-900 mt-3.5 group-hover:text-indigo-600 transition">
                                Probe: Concept Discovery
                            </h3>
                            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                Uncover hidden medical concepts by solving diagnostic keywords, syndrome triads, and landmark examination signs.
                            </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-400">Word Clues • Syndromes</span>
                            <span className="inline-flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition">
                                <span>Play Probe</span>
                                <ChevronRight className="w-4 h-4 ml-0.5" />
                            </span>
                        </div>
                    </div>

                    {/* Game 3: Clinical Rounds */}
                    <div
                        onClick={() => setActiveGameModal('clinicalRounds')}
                        className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-neutral-300 transition flex flex-col justify-between group cursor-pointer"
                    >
                        <div>
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                                    🏥
                                </div>
                                <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
                                    Ward Rounds
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-neutral-900 mt-3.5 group-hover:text-teal-600 transition">
                                Clinical Rounds: Bedside Simulator
                            </h3>
                            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                High-acuity bedside decision making. Prioritize telemetry, emergency stabilization, and first-line medical orders.
                            </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-400">Emergency & Triage</span>
                            <span className="inline-flex items-center text-xs font-bold text-teal-600 group-hover:translate-x-0.5 transition">
                                <span>Start Rounds</span>
                                <ChevronRight className="w-4 h-4 ml-0.5" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 4. SECTION 2: PATTERN MATCHING & RAPID RECALL GAMES       */}
            {/* ========================================================= */}
            <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-neutral-900">Pattern Matching & Rapid Recall Games</h2>
                        <p className="text-xs text-neutral-500">Group related pathologies, execute binary classifications, and spot radiographic findings</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Game 4: Synapses */}
                    <div
                        onClick={() => setActiveGameModal('synapses')}
                        className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-neutral-300 transition flex flex-col justify-between group cursor-pointer"
                    >
                        <div>
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                                    🧩
                                </div>
                                <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                                    Connections
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-neutral-900 mt-3.5 group-hover:text-purple-600 transition">
                                Synapses: 4 Connected Groups
                            </h3>
                            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                Connect 16 medical terms into 4 groups of 4 with a common clinical link (e.g. causes of digital clubbing, RIPE regimen, retroperitoneal organs).
                            </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-400">16 Concepts • 4 Groups</span>
                            <span className="inline-flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-0.5 transition">
                                <span>Play Synapses</span>
                                <ChevronRight className="w-4 h-4 ml-0.5" />
                            </span>
                        </div>
                    </div>

                    {/* Game 5: Here and There */}
                    <div
                        onClick={() => setActiveGameModal('hereAndThere')}
                        className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-neutral-300 transition flex flex-col justify-between group cursor-pointer"
                    >
                        <div>
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                                    ↔️
                                </div>
                                <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                                    Binary Choice
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-neutral-900 mt-3.5 group-hover:text-amber-600 transition">
                                Here & There: Rapid Classification
                            </h3>
                            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                Rapid-fire binary decision making. Match pathophysiological features between paired conditions (Crohn's Disease vs Ulcerative Colitis).
                            </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-400">Crohn's vs Colitis</span>
                            <span className="inline-flex items-center text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition">
                                <span>Play Here & There</span>
                                <ChevronRight className="w-4 h-4 ml-0.5" />
                            </span>
                        </div>
                    </div>

                    {/* Game 6: Image Rush */}
                    <div
                        onClick={() => setActiveGameModal('imageRush')}
                        className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-neutral-300 transition flex flex-col justify-between group cursor-pointer"
                    >
                        <div>
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                                    ⏱️
                                </div>
                                <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
                                    Speed Spotter
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-neutral-900 mt-3.5 group-hover:text-rose-600 transition">
                                Image Rush: 30s Visual Spotter
                            </h3>
                            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                Rapid visual pattern recognition. Identify hallmark radiographic signs, ECG waveforms, and histology slides against the clock.
                            </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-400">Timed Spotter • Visual</span>
                            <span className="inline-flex items-center text-xs font-bold text-rose-600 group-hover:translate-x-0.5 transition">
                                <span>Launch Image Rush</span>
                                <ChevronRight className="w-4 h-4 ml-0.5" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 5. SECTION 3: ANATOMY EXPLORER & AI GAME MASTER           */}
            {/* ========================================================= */}
            <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-neutral-900">Anatomical Models & AI Clinical Master</h2>
                        <p className="text-xs text-neutral-500">Structural landmarks and conversational case reasoning</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Game 7: Anatomy Explorer */}
                    <div
                        onClick={() => setActiveGameModal('anatomy')}
                        className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-neutral-300 transition flex flex-col justify-between group cursor-pointer"
                    >
                        <div>
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                                    💀
                                </div>
                                <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-orange-200">
                                    3D Anatomy
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-neutral-900 mt-3.5 group-hover:text-orange-600 transition">
                                Anatomy Explorer: Structural Landmark Spotter
                            </h3>
                            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                Master high-yield board anatomy. Identify cranial nerve exit foramina, vascular supply territories, and fascial compartments.
                            </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-400">Cranial Nerves & Foramina</span>
                            <span className="inline-flex items-center text-xs font-bold text-orange-600 group-hover:translate-x-0.5 transition">
                                <span>Explore Anatomy</span>
                                <ChevronRight className="w-4 h-4 ml-0.5" />
                            </span>
                        </div>
                    </div>

                    {/* Game 8: Dr. Cortex AI Clinical Game Master */}
                    <div
                        onClick={() => setCortexModalOpen(true)}
                        className="bg-gradient-to-tr from-slate-900 via-neutral-900 to-indigo-950 text-white rounded-3xl p-5 shadow-sm border border-neutral-800 flex flex-col justify-between group cursor-pointer"
                    >
                        <div>
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-2xl border border-indigo-400/30 group-hover:scale-105 transition">
                                    🤖
                                </div>
                                <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-400/40">
                                    Interactive AI
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-white mt-3.5 group-hover:text-indigo-300 transition">
                                Dr. Cortex AI: Clinical Game Master
                            </h3>
                            <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                                Stuck on a case clue? Ask Dr. Cortex AI for differential rule-outs, diagnostic mnemonics, or emergency stabilization steps in real time.
                            </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-neutral-800 flex items-center justify-between">
                            <span className="text-xs font-semibold text-neutral-400">Available 24/7 • Board Tutor</span>
                            <span className="inline-flex items-center text-xs font-bold text-indigo-300 group-hover:translate-x-0.5 transition">
                                <span>Launch Dr. Cortex AI</span>
                                <ChevronRight className="w-4 h-4 ml-0.5" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 6. MODAL: MEDLE GAME (DESKTOP OPTIMIZED MAX-W-2XL)        */}
            {/* ========================================================= */}
            {activeGameModal === 'medle' && (
                <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
                        {/* Modal Header */}
                        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-2xl bg-white shadow-xs flex items-center justify-center text-xl shrink-0">
                                    {activeMedle.organEmoji || '🫀'}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h3 className="font-bold text-base text-neutral-900">
                                            Medle Case #{activeMedle.caseNumber || 142}
                                        </h3>
                                        <span className="text-[10px] bg-blue-100 text-[#1872F4] font-bold px-2 py-0.5 rounded-full">
                                            Case {medleCaseIndex + 1} of {casesBank.length}
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-500 font-medium">
                                        {activeMedle.specialty || 'Internal Medicine / Cardiology'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2.5">
                                <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
                                    <span>{playerStats.streakDays} Days</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setActiveGameModal(null)}
                                    className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Clues List */}
                        <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-[#F9FAFC]">
                            <div className="flex items-center justify-between text-xs text-neutral-600 bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs">
                                <span className="font-bold flex items-center gap-1.5">
                                    <Activity className="w-4 h-4 text-[#1872F4]" />
                                    <span>Hints Revealed: {revealedClues} / 4</span>
                                </span>
                                {!medleSolved && (
                                    <span className="font-extrabold text-[#1872F4] bg-blue-50 px-2.5 py-1 rounded-lg text-xs">
                                        +{revealedClues === 1 ? 150 : revealedClues === 2 ? 100 : revealedClues === 3 ? 75 : 50} XP Available
                                    </span>
                                )}
                            </div>

                            {activeMedle.clues.map((clue, idx) => {
                                const isUnlocked = idx < revealedClues;
                                return (
                                    <div
                                        key={idx}
                                        className={`rounded-2xl p-4 border transition-all ${
                                            isUnlocked
                                                ? idx === 0
                                                    ? 'bg-[#FFEFE7] border-[#FFDEC9]'
                                                    : idx === 1
                                                    ? 'bg-[#EAF3FF] border-[#D5E6FE]'
                                                    : idx === 2
                                                    ? 'bg-[#EBF7F2] border-[#D1EFE2]'
                                                    : 'bg-[#FFF4E4] border-[#FFE7C4]'
                                                : 'bg-neutral-100/80 border-neutral-200/70 opacity-60'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-neutral-800 flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-md bg-white/80 shadow-2xs flex items-center justify-center text-[10px] font-bold">
                                                    {idx + 1}
                                                </span>
                                                <span>Hint {idx + 1}: {clue.title}</span>
                                            </span>
                                            {isUnlocked ? (
                                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Check className="w-3 h-3 stroke-[2.5]" /> Revealed
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-neutral-500 bg-neutral-200/80 px-2 py-0.5 rounded-full font-mono">
                                                    Locked
                                                </span>
                                            )}
                                        </div>
                                        {isUnlocked ? (
                                            <div className="mt-2.5 text-xs text-neutral-800 leading-relaxed">
                                                <p className="font-semibold text-neutral-900">{clue.text}</p>
                                                {clue.danger && (
                                                    <div className="mt-2 text-[11px] text-neutral-700 bg-white/80 p-2 rounded-xl border border-neutral-200/60">
                                                        <strong className="text-neutral-900">Clinical Takeaway:</strong> {clue.danger}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-neutral-400 mt-1 italic">
                                                Make a guess or request hint to unlock this clue...
                                            </p>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Differential Rule-Out Alert Card */}
                            {medleRuledOut.length > 0 && !medleSolved && (
                                <div className="space-y-2 mt-3">
                                    {medleRuledOut.slice(-2).map((item, rIdx) => (
                                        <div key={rIdx} className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                                            <div className="flex items-center gap-1.5 font-bold text-rose-700 mb-0.5">
                                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                                <span>Differential Ruled Out: {item.name}</span>
                                            </div>
                                            <p className="text-[11px] leading-relaxed text-rose-800">{item.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Solved Card with Clinical Pearl & Management */}
                            {medleSolved && (
                                <div className="space-y-3.5 animate-in zoom-in-95 duration-200 mt-3">
                                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950">
                                        <div className="flex items-center gap-2 font-black text-sm text-emerald-800 mb-1">
                                            <Trophy className="w-5 h-5 text-emerald-600" />
                                            <span>Case Solved: {activeMedle.disease}</span>
                                        </div>
                                        <p className="text-xs font-medium text-emerald-900 mt-1 leading-relaxed">
                                            {activeMedle.pearl}
                                        </p>
                                    </div>

                                    {activeMedle.immediateManagement && (
                                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950">
                                            <div className="font-bold text-xs text-blue-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                <Zap className="w-4 h-4 text-blue-600" />
                                                <span>Immediate First-Line Management</span>
                                            </div>
                                            <p className="text-xs leading-relaxed text-blue-800">
                                                {activeMedle.immediateManagement}
                                            </p>
                                        </div>
                                    )}

                                    {/* Next Case Button */}
                                    <button
                                        type="button"
                                        onClick={() => switchMedleCase((medleCaseIndex + 1) % casesBank.length)}
                                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs hover:from-blue-700 hover:to-indigo-700 transition shadow-sm cursor-pointer"
                                    >
                                        Next Mystery Case (Case {((medleCaseIndex + 1) % casesBank.length) + 1} of {casesBank.length}) →
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Diagnostic Guess Bar */}
                        {!medleSolved && (
                            <div className="p-4 border-t border-neutral-100 bg-white space-y-3">
                                {/* Autocomplete input */}
                                <div className="relative">
                                    <div className="flex items-center space-x-2">
                                        <div className="relative flex-1">
                                            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={medleSearchQuery}
                                                onChange={(e) => handleMedleSearch(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleMedleGuess(medleSearchQuery);
                                                    }
                                                }}
                                                placeholder="Type your differential diagnosis (e.g. Endocarditis, Tension Pneumothorax)..."
                                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleMedleGuess(medleSearchQuery)}
                                            disabled={!medleSearchQuery.trim()}
                                            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40 transition cursor-pointer shadow-2xs"
                                        >
                                            Guess
                                        </button>

                                        {revealedClues < 4 && (
                                            <button
                                                type="button"
                                                onClick={handleRevealNextClue}
                                                className="px-3.5 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold whitespace-nowrap transition cursor-pointer shadow-2xs"
                                            >
                                                Hint {revealedClues + 1}
                                            </button>
                                        )}
                                    </div>

                                    {/* Dropdown Suggestions */}
                                    {medleSuggestions.length > 0 && (
                                        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden z-20">
                                            {medleSuggestions.map((sug) => (
                                                <button
                                                    key={sug}
                                                    type="button"
                                                    onClick={() => handleMedleGuess(sug)}
                                                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-neutral-800 hover:bg-blue-50 hover:text-blue-700 transition border-b border-neutral-50 last:border-b-0 cursor-pointer"
                                                >
                                                    {sug}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Multiple choice quick options */}
                                {activeMedle.options && activeMedle.options.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mr-1 self-center">
                                            Quick Options:
                                        </span>
                                        {activeMedle.options.map((opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => handleMedleGuess(opt)}
                                                className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition cursor-pointer"
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 7. MODAL: SYNAPSES (CONNECTIONS GAME)                     */}
            {/* ========================================================= */}
            {activeGameModal === 'synapses' && (
                <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
                        {/* Modal Header */}
                        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-purple-50">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center text-base">
                                    🧩
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-neutral-900">Synapses: 4 Connected Groups</h3>
                                    <p className="text-xs text-neutral-500">Group 16 medical terms into 4 categories of 4</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveGameModal(null)}
                                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Synapses Game Board */}
                        <div className="p-5 overflow-y-auto space-y-3.5 flex-1 bg-[#F9FAFC]">
                            <p className="text-xs text-neutral-600 leading-relaxed bg-white p-3 rounded-2xl border border-neutral-200/70 shadow-2xs">
                                💡 <strong>Rules:</strong> Select exactly 4 items with a common diagnostic or pharmacological connection, then tap <strong>Submit Match</strong>!
                            </p>

                            {/* Solved Groups List */}
                            {synapseSolvedGroups.map((cat) => {
                                const group = synapsesData.groups.find((g) => g.category === cat);
                                return (
                                    <div
                                        key={cat}
                                        className={`rounded-2xl p-4 border text-center shadow-2xs animate-in zoom-in-95 duration-200 ${group?.color || 'bg-neutral-100 text-neutral-800'}`}
                                    >
                                        <div className="font-black text-xs uppercase tracking-wider">{cat}</div>
                                        <div className="text-xs font-semibold mt-1 opacity-90">
                                            {group?.items.join(' • ')}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Active 4x4 Grid on Desktop */}
                            {synapseItems.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
                                    {synapseItems.map((item) => {
                                        const isSelected = synapseSelected.includes(item.text);
                                        return (
                                            <button
                                                key={item.text}
                                                type="button"
                                                onClick={() => toggleSynapseSelect(item.text)}
                                                className={`min-h-[64px] p-3 rounded-2xl border text-xs font-bold text-center flex items-center justify-center transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm scale-98'
                                                        : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 shadow-2xs'
                                                }`}
                                            >
                                                {item.text}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-white rounded-3xl border border-emerald-200">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                                        🏆
                                    </div>
                                    <h4 className="font-bold text-base text-neutral-900">All Synapses Connected!</h4>
                                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                                        Brilliant clinical deduction! You successfully solved all 4 medical categories. +400 XP awarded to your streak.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Synapses Footer */}
                        <div className="p-4 border-t border-neutral-100 bg-white flex items-center justify-between">
                            <span className="text-xs text-neutral-500 font-mono font-medium">
                                {synapseSelected.length} / 4 Selected
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setSynapseSelected([])}
                                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                                >
                                    Deselect All
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSynapsesSubmit}
                                    disabled={synapseSelected.length !== 4}
                                    className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-40 transition cursor-pointer shadow-2xs"
                                >
                                    Submit Match
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 8. MODAL: HERE AND THERE (BINARY CLASSIFICATION)          */}
            {/* ========================================================= */}
            {activeGameModal === 'hereAndThere' && (
                <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
                        {/* Header */}
                        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-amber-50">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center text-base">
                                    ↔️
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-neutral-900">
                                        Here & There: {hereAndThereData.leftCategory} vs {hereAndThereData.rightCategory}
                                    </h3>
                                    <p className="text-xs text-neutral-500">Rapidly decide which disease exhibits this clinical hallmark</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveGameModal(null)}
                                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Game Body */}
                        <div className="p-6 flex-1 flex flex-col justify-between bg-[#FDFBF7]">
                            {!hatCompleted ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs text-neutral-500 font-mono">
                                        <span>Round {hatCardIndex + 1} of {hereAndThereData.cards.length}</span>
                                        <span className="font-bold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                                            Score: {hatScore}
                                        </span>
                                    </div>

                                    {/* Clinical Vignette Card */}
                                    <div className="min-h-[180px] rounded-2xl bg-white border-2 border-amber-200/80 p-6 shadow-xs flex flex-col justify-center text-center">
                                        <span className="text-4xl mb-3">🧠</span>
                                        <p className="text-base font-bold text-neutral-900 leading-relaxed max-w-lg mx-auto">
                                            "{hereAndThereData.cards[hatCardIndex]?.text}"
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center flex flex-col items-center bg-white rounded-3xl border border-amber-200">
                                    <div className="text-5xl mb-3">🎯</div>
                                    <h4 className="font-black text-lg text-neutral-900">Round Completed!</h4>
                                    <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                                        You scored {hatScore} out of {hereAndThereData.cards.length} correct in differentiating {hereAndThereData.leftCategory} and {hereAndThereData.rightCategory}.
                                    </p>
                                </div>
                            )}

                            {/* Binary Choice Buttons */}
                            {!hatCompleted ? (
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => handleHatChoice('left')}
                                        className="py-4 px-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 font-bold text-xs hover:bg-rose-100 active:scale-98 transition cursor-pointer flex flex-col items-center justify-center gap-1 shadow-2xs"
                                    >
                                        <span className="text-sm font-black">← Left</span>
                                        <span className="text-sm">{hereAndThereData.leftCategory}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleHatChoice('right')}
                                        className="py-4 px-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800 font-bold text-xs hover:bg-emerald-100 active:scale-98 transition cursor-pointer flex flex-col items-center justify-center gap-1 shadow-2xs"
                                    >
                                        <span className="text-sm font-black">Right →</span>
                                        <span className="text-sm">{hereAndThereData.rightCategory}</span>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setActiveGameModal(null)}
                                    className="w-full mt-4 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
                                >
                                    Return to Gaming Hub
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 9. MODAL: IMAGE RUSH (VISUAL SPEED SPOTTER)               */}
            {/* ========================================================= */}
            {activeGameModal === 'imageRush' && (
                <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
                        {/* Header */}
                        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-rose-50">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center text-base">
                                    ⏱️
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-neutral-900">Image Rush: Speed Diagnosis</h3>
                                    <p className="text-xs text-neutral-500">Timed radiographic and pathology spotter</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveGameModal(null)}
                                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 flex-1 flex flex-col justify-between bg-[#F9FBFE]">
                            {!irCompleted ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs font-mono text-neutral-500">
                                        <span>Card {irIndex + 1} of {imageRushCards.length}</span>
                                        <span className="font-bold text-rose-600 bg-rose-100 px-2.5 py-0.5 rounded-full">
                                            Score: {irScore}
                                        </span>
                                    </div>

                                    {/* Question Graphic Stage */}
                                    <div className="rounded-2xl bg-white border border-rose-100 p-6 shadow-xs flex flex-col items-center justify-center text-center">
                                        <div className="text-7xl mb-3 animate-bounce select-none">
                                            {imageRushCards[irIndex]?.emoji}
                                        </div>
                                        <p className="text-sm font-bold text-neutral-900 leading-relaxed max-w-md">
                                            {imageRushCards[irIndex]?.question}
                                        </p>
                                    </div>

                                    {/* 4 Multiple-Choice Options */}
                                    <div className="grid grid-cols-1 gap-2 pt-1">
                                        {imageRushCards[irIndex]?.options.map((opt, optIdx) => {
                                            const isSelected = irSelectedOption === optIdx;
                                            const isCorrect = optIdx === imageRushCards[irIndex]?.correct;
                                            return (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    disabled={irSelectedOption !== null}
                                                    onClick={() => handleIrSelect(optIdx)}
                                                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                                                        isSelected
                                                            ? isCorrect
                                                                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                                                                : 'bg-rose-50 border-rose-400 text-rose-900 font-bold'
                                                            : 'bg-white border-neutral-200 text-neutral-800 hover:border-blue-400 shadow-2xs'
                                                    }`}
                                                >
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center flex flex-col items-center bg-white rounded-3xl border border-rose-200">
                                    <div className="text-5xl mb-3">⚡</div>
                                    <h4 className="font-black text-lg text-neutral-900">Image Rush Completed!</h4>
                                    <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                                        You correctly recognized {irScore} / {imageRushCards.length} clinical signs at lightning speed!
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setActiveGameModal(null)}
                                        className="mt-6 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
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
            {/* 10. MODAL: PROBE & ANATOMY PLACEHOLDER MODALS             */}
            {/* ========================================================= */}
            {(activeGameModal === 'probe' || activeGameModal === 'clinicalRounds' || activeGameModal === 'anatomy') && (
                <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl text-center">
                        <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-3xl mx-auto mb-3">
                            {activeGameModal === 'probe' ? '🔍' : activeGameModal === 'clinicalRounds' ? '🏥' : '💀'}
                        </div>
                        <h3 className="text-base font-bold text-neutral-900 capitalize">
                            {activeGameModal === 'probe' ? 'Probe: Concept Discovery' : activeGameModal === 'clinicalRounds' ? 'Clinical Rounds Simulator' : 'Anatomy Explorer 3D'}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-2 leading-relaxed max-w-sm mx-auto">
                            {activeGameModal === 'probe'
                                ? 'Uncover diagnostic keywords, syndrome triads, and clinical criteria through progressive word and clue solving.'
                                : activeGameModal === 'clinicalRounds'
                                ? 'Simulate acute ward rounds, evaluate continuous patient vitals, and issue emergency first-line management orders.'
                                : 'Master 3D anatomical structures, cranial nerve exit foramina, and vascular distributions for board exams.'}
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setActiveGameModal(null)}
                                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition cursor-pointer"
                            >
                                Close & Back to Games
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 11. MODAL: DR. CORTEX AI CLINICAL TUTOR & GAME MASTER     */}
            {/* ========================================================= */}
            {cortexModalOpen && (
                <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[640px] max-h-[92vh]">
                        {/* Header */}
                        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-2xl bg-sky-100 border border-sky-300 flex items-center justify-center text-lg shadow-xs relative">
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

                        {/* Quick Prompts Carousel */}
                        <div className="px-3 py-2 bg-white border-t border-neutral-100 flex items-center space-x-2 overflow-x-auto no-scrollbar">
                            <button
                                type="button"
                                onClick={() => handleSendCortexAi(undefined, 'Diagnostic hint for today Medle case')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                🫀 Medle Case Hint
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSendCortexAi(undefined, 'Explain SAD PUCKER retroperitoneal mnemonic')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                🧠 SAD PUCKER
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSendCortexAi(undefined, 'What is the immediate management for tension pneumothorax?')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                ⚡ Tension Pneumothorax
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSendCortexAi(undefined, 'Duke criteria and gallolyticus association in endocarditis')}
                                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-700 whitespace-nowrap hover:bg-neutral-200 transition cursor-pointer"
                            >
                                🩺 Duke Criteria
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
