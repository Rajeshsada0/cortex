import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    CheckCircle2,
    FileText,
    HelpCircle,
    Plus,
    Save,
    ShieldCheck,
    Stethoscope,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface QuestionForm {
    id?: number;
    question_number: number;
    stem: string;
    options: string[];
    correct_option: number;
    explanation: string;
}

interface ScenarioFormProps {
    scenario: {
        id: number;
        title: string;
        discipline: string;
        pathway_code: string;
        stem: string;
        vitals: string | null;
        order_index: number;
        is_active: boolean;
        questions: QuestionForm[];
    } | null;
    pathways: Array<{ code: string; name: string }>;
}

const DEFAULT_QUESTIONS: QuestionForm[] = Array.from({ length: 5 }, (_, i) => ({
    question_number: i + 1,
    stem: '',
    options: ['', '', '', ''],
    correct_option: 0,
    explanation: '',
}));

export default function AdminCsqForm({ scenario, pathways }: ScenarioFormProps) {
    const isEditing = Boolean(scenario?.id);

    const { data, setData, post, put, processing, errors } = useForm({
        title: scenario?.title || '',
        discipline: scenario?.discipline || '',
        pathway_code: scenario?.pathway_code || 'NMC',
        stem: scenario?.stem || '',
        vitals: scenario?.vitals || '',
        order_index: scenario?.order_index || 0,
        is_active: scenario?.is_active ?? true,
        questions: scenario?.questions?.length ? scenario.questions : DEFAULT_QUESTIONS,
    });

    const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
        const newQuestions = [...data.questions];
        const newOptions = [...newQuestions[qIndex].options];
        newOptions[optIndex] = value;
        newQuestions[qIndex].options = newOptions;
        setData('questions', newQuestions);
    };

    const handleQuestionStemChange = (qIndex: number, value: string) => {
        const newQuestions = [...data.questions];
        newQuestions[qIndex].stem = value;
        setData('questions', newQuestions);
    };

    const handleCorrectOptionChange = (qIndex: number, correctIdx: number) => {
        const newQuestions = [...data.questions];
        newQuestions[qIndex].correct_option = correctIdx;
        setData('questions', newQuestions);
    };

    const handleExplanationChange = (qIndex: number, value: string) => {
        const newQuestions = [...data.questions];
        newQuestions[qIndex].explanation = value;
        setData('questions', newQuestions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!data.title.trim() || !data.discipline.trim() || !data.stem.trim()) {
            toast.error('Please complete the scenario title, discipline, and clinical vignette stem.');
            return;
        }

        for (let i = 0; i < data.questions.length; i++) {
            const q = data.questions[i];
            if (!q.stem.trim()) {
                toast.error(`Question ${i + 1} stem cannot be empty.`);
                return;
            }
            if (q.options.some((opt) => !opt.trim())) {
                toast.error(`All 4 options for Question ${i + 1} must be filled out.`);
                return;
            }
        }

        if (isEditing) {
            put(`/admin/csq/${scenario!.id}`, {
                onSuccess: () => toast.success('Clinical Scenario Station updated successfully!'),
                onError: () => toast.error('Failed to update scenario station. Check errors below.'),
            });
        } else {
            post('/admin/csq', {
                onSuccess: () => toast.success('Clinical Scenario Station created successfully!'),
                onError: () => toast.error('Failed to create scenario station. Check errors below.'),
            });
        }
    };

    return (
        <div className="w-full space-y-8 p-4 sm:p-6 lg:p-8">
            <Head title={isEditing ? `Edit ${scenario?.title}` : 'New CSQ Station - Admin Portal'} />

            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin/csq">
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                            Clinical Scenario Authoring
                        </span>
                        <h1 className="text-2xl font-black tracking-tight text-foreground">
                            {isEditing ? 'Edit Clinical Scenario Station' : 'Create New CSQ Station'}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/admin/csq">
                        <Button variant="outline" size="sm" className="rounded-xl text-xs">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        onClick={handleSubmit}
                        disabled={processing}
                        size="sm"
                        className="gap-1.5 rounded-xl bg-cyan-600 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
                    >
                        <Save className="h-3.5 w-3.5" />
                        <span>{processing ? 'Saving...' : 'Save Station'}</span>
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Station Metadata & Clinical Narrative */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
                    <div className="flex items-center gap-2 border-b border-border pb-3">
                        <FileText className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                        <h2 className="text-sm font-bold tracking-tight text-foreground uppercase">
                            Station Overview &amp; Clinical Vignette
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        {/* Title */}
                        <div className="sm:col-span-2 space-y-1.5">
                            <Label htmlFor="title" className="text-xs font-bold">
                                Station Title *
                            </Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="e.g., Station 1: A 26-year-old male with acute febrile illness from Chitwan"
                                className="text-xs rounded-xl"
                            />
                            {errors.title && <p className="text-xs text-rose-500">{errors.title}</p>}
                        </div>

                        {/* Discipline */}
                        <div className="space-y-1.5">
                            <Label htmlFor="discipline" className="text-xs font-bold">
                                Medical Discipline *
                            </Label>
                            <Input
                                id="discipline"
                                value={data.discipline}
                                onChange={(e) => setData('discipline', e.target.value)}
                                placeholder="e.g., Internal Medicine / Tropical Diseases"
                                className="text-xs rounded-xl"
                            />
                            {errors.discipline && <p className="text-xs text-rose-500">{errors.discipline}</p>}
                        </div>

                        {/* Pathway */}
                        <div className="space-y-1.5">
                            <Label htmlFor="pathway_code" className="text-xs font-bold">
                                Target Pathway
                            </Label>
                            <select
                                id="pathway_code"
                                value={data.pathway_code}
                                onChange={(e) => setData('pathway_code', e.target.value)}
                                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                <option value="NMC">Nepal Medical Council (NMC)</option>
                                {pathways
                                    .filter((p) => p.code !== 'NMC')
                                    .map((p) => (
                                        <option key={p.code} value={p.code}>
                                            {p.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Order Index */}
                        <div className="space-y-1.5">
                            <Label htmlFor="order_index" className="text-xs font-bold">
                                Station Sequence (1..N)
                            </Label>
                            <Input
                                id="order_index"
                                type="number"
                                min={0}
                                value={data.order_index}
                                onChange={(e) => setData('order_index', parseInt(e.target.value) || 0)}
                                className="text-xs rounded-xl"
                            />
                        </div>

                        {/* Active status */}
                        <div className="flex items-center gap-2 pt-6">
                            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-foreground">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                />
                                <span>Published &amp; Available in Exam Hall</span>
                            </label>
                        </div>
                    </div>

                    {/* Case Vignette Stem */}
                    <div className="space-y-1.5">
                        <Label htmlFor="stem" className="text-xs font-bold">
                            Comprehensive Patient Case Vignette Stem *
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                            Detail the presenting complaint, clinical history, timeline of disease progression, and physical exam findings.
                        </p>
                        <textarea
                            id="stem"
                            rows={6}
                            value={data.stem}
                            onChange={(e) => setData('stem', e.target.value)}
                            placeholder="A 26-year-old male residing in Chitwan presents to the Emergency Department..."
                            className="w-full rounded-xl border border-border bg-background p-3 text-xs leading-relaxed text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                        {errors.stem && <p className="text-xs text-rose-500">{errors.stem}</p>}
                    </div>

                    {/* Key Diagnostic Markers / Vitals */}
                    <div className="space-y-1.5">
                        <Label htmlFor="vitals" className="text-xs font-bold">
                            Key Diagnostic Markers, Laboratory Panels &amp; Vitals
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                            Enter bulleted vitals (BP, Pulse, SpO2, Temperature) and diagnostic markers (Hematocrit, Platelets, TLC, etc.).
                        </p>
                        <textarea
                            id="vitals"
                            rows={3}
                            value={data.vitals}
                            onChange={(e) => setData('vitals', e.target.value)}
                            placeholder="• BP: 85/65 mmHg | Pulse: 118 bpm&#10;• Hematocrit: 54%&#10;• Platelet count: 21,000 /cu mm"
                            className="w-full font-mono rounded-xl border border-border bg-background p-3 text-xs leading-relaxed text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                    </div>
                </div>

                {/* 5 Linked Multiple-Choice Questions */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <h2 className="text-base font-bold text-foreground">
                                Linked Sequential MCQs (5 Questions per Station)
                            </h2>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                            5 questions required
                        </span>
                    </div>

                    {data.questions.map((q, qIdx) => (
                        <div
                            key={qIdx}
                            className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-border pb-2.5">
                                <span className="flex items-center gap-2 font-bold text-foreground text-sm">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300">
                                        {qIdx + 1}
                                    </span>
                                    Question {qIdx + 1}
                                </span>
                                <span className="text-xs font-mono text-muted-foreground">
                                    Correct Option: {String.fromCharCode(65 + q.correct_option)}
                                </span>
                            </div>

                            {/* Question Stem */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold">
                                    Question Stem *
                                </Label>
                                <textarea
                                    rows={2}
                                    value={q.stem}
                                    onChange={(e) => handleQuestionStemChange(qIdx, e.target.value)}
                                    placeholder="According to WHO/NMC clinical guidelines, what is..."
                                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                />
                            </div>

                            {/* Options A to D */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold">
                                    Answer Choices &amp; Correct Answer Selection *
                                </Label>
                                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                    {q.options.map((optText, optIdx) => {
                                        const isCorrect = q.correct_option === optIdx;
                                        return (
                                            <div
                                                key={optIdx}
                                                className={`flex items-center gap-2 rounded-xl border p-2 transition ${
                                                    isCorrect
                                                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                                                        : 'border-border bg-background'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`correct-option-${qIdx}`}
                                                    checked={isCorrect}
                                                    onChange={() => handleCorrectOptionChange(qIdx, optIdx)}
                                                    className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                    title={`Mark Option ${String.fromCharCode(65 + optIdx)} as correct`}
                                                />
                                                <span className="font-bold text-xs">
                                                    {String.fromCharCode(65 + optIdx)}.
                                                </span>
                                                <Input
                                                    value={optText}
                                                    onChange={(e) =>
                                                        handleOptionChange(qIdx, optIdx, e.target.value)
                                                    }
                                                    placeholder={`Option ${String.fromCharCode(65 + optIdx)} text`}
                                                    className="h-8 text-xs border-0 bg-transparent shadow-none focus-visible:ring-0 p-0"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Explanation / Rationale */}
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                                    <ShieldCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                    Clinical Rationale &amp; Evidence-Based Explanation
                                </Label>
                                <textarea
                                    rows={2}
                                    value={q.explanation}
                                    onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                                    placeholder="Explain why the correct answer is indicated based on physiological mechanisms, clinical guidelines, or pharmacology..."
                                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-3 pt-4">
                    <Link href="/admin/csq">
                        <Button variant="outline" type="button" className="rounded-xl text-xs">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="gap-2 rounded-xl bg-cyan-600 text-xs font-semibold text-white shadow-xs hover:bg-cyan-700 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
                    >
                        <Save className="h-4 w-4" />
                        <span>{processing ? 'Saving...' : 'Save Clinical Scenario Station'}</span>
                    </Button>
                </div>
            </form>
        </div>
    );
}
