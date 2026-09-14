import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    HelpCircle,
    Save,
    ArrowLeft,
    CheckCircle2,
    Eye,
    Image,
    Sparkles,
    AlertCircle,
    Stethoscope,
    Layers,
    BookOpen,
    Check,
    Upload,
    X,
    Loader2,
    FileImage,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ClinicalImageViewer } from '@/components/cortex/clinical-image-viewer';
import { toast } from 'sonner';

interface Subtopic {
    id: number;
    topic_id: number;
    name: string;
}

interface Topic {
    id: number;
    subject_id: number;
    name: string;
    subtopics: Subtopic[];
}

interface Subject {
    id: number;
    name: string;
    slug: string;
    topics: Topic[];
}

interface QuestionData {
    id?: string;
    code?: string;
    subject_id?: number;
    topic_id?: number;
    subtopic_id?: number | null;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    question_type?: string;
    stem?: string;
    image_url?: string | null;
    image_caption?: string | null;
    correct_option?: 'A' | 'B' | 'C' | 'D';
    learning_objective?: string;
    foundation_explanation?: string;
    integration_explanation?: string;
    application_explanation?: string;
    memory_peg?: string | null;
    is_active?: boolean;
    options?: Array<{
        option_key: 'A' | 'B' | 'C' | 'D';
        option_text: string;
        rationale?: string;
    }>;
    relevant_exams?: Array<{ exam: string }>;
}

export interface ExamPathwayOption {
    code: string;
    name: string;
    region?: string;
    badge_color?: string;
}

interface QuestionFormProps {
    question: QuestionData | null;
    subjects: Subject[];
    available_exams?: Array<string | ExamPathwayOption>;
}

export default function QuestionForm({
    question,
    subjects,
    available_exams,
}: QuestionFormProps) {
    const isEdit = Boolean(question?.id);

    const examOptions = React.useMemo(() => {
        if (available_exams && available_exams.length > 0) {
            return available_exams.map((item) => {
                if (typeof item === 'string') {
                    return { key: item, label: item };
                }
                return { key: item.code, label: item.name || item.code };
            });
        }
        return [
            { key: 'MECEE_PG', label: 'Nepal MECEE-PG' },
            { key: 'INI_CET', label: 'India INI-CET' },
            { key: 'NEET_PG', label: 'India NEET-PG (2026)' },
            { key: 'USMLE_STEP1', label: 'USMLE Step 1' },
            { key: 'USMLE_STEP2CK', label: 'USMLE Step 2 CK' },
            { key: 'COMBINED', label: 'Combined Track' },
        ];
    }, [available_exams]);

    // Form state
    const [code, setCode] = useState(
        question?.code ||
            `Q-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    );
    const [subjectId, setSubjectId] = useState<number>(
        question?.subject_id || (subjects[0]?.id ?? 1),
    );

    const selectedSubject =
        subjects.find((s) => s.id === subjectId) || subjects[0];
    const availableTopics = selectedSubject?.topics || [];

    const [topicId, setTopicId] = useState<number>(
        question?.topic_id || (availableTopics[0]?.id ?? 1),
    );

    const selectedTopic =
        availableTopics.find((t) => t.id === topicId) || availableTopics[0];
    const availableSubtopics = selectedTopic?.subtopics || [];

    const [subtopicId, setSubtopicId] = useState<number | ''>(
        question?.subtopic_id || '',
    );
    const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>(
        question?.difficulty || 'MEDIUM',
    );
    const [stem, setStem] = useState(question?.stem || '');
    const [imageUrl, setImageUrl] = useState(question?.image_url || '');
    const [imageCaption, setImageCaption] = useState(
        question?.image_caption || '',
    );

    // 4 Options A, B, C, D
    const defaultOptions = [
        { option_key: 'A' as const, option_text: '', rationale: '' },
        { option_key: 'B' as const, option_text: '', rationale: '' },
        { option_key: 'C' as const, option_text: '', rationale: '' },
        { option_key: 'D' as const, option_text: '', rationale: '' },
    ];

    const initialOptions =
        question?.options?.length === 4
            ? [...question.options].sort((a, b) =>
                  (a.option_key || '').localeCompare(b.option_key || ''),
              )
            : defaultOptions;

    const [options, setOptions] = useState(initialOptions);
    const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>(
        question?.correct_option || 'A',
    );

    // 3-Tier Clinical Breakdown
    const [foundationExplanation, setFoundationExplanation] = useState(
        question?.foundation_explanation || '',
    );
    const [integrationExplanation, setIntegrationExplanation] = useState(
        question?.integration_explanation || '',
    );
    const [applicationExplanation, setApplicationExplanation] = useState(
        question?.application_explanation || '',
    );

    // Recall Anchors
    const [learningObjective, setLearningObjective] = useState(
        question?.learning_objective || '',
    );
    const [memoryPeg, setMemoryPeg] = useState(question?.memory_peg || '');

    // Pathways
    const initialExams = question?.relevant_exams
        ? question.relevant_exams.map((re) => re.exam)
        : ['MECEE_PG', 'INI_CET', 'COMBINED'];
    const [relevantExams, setRelevantExams] = useState<string[]>(initialExams);

    // Status
    const [isActive, setIsActive] = useState<boolean>(
        question?.is_active ?? true,
    );

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleSubjectChange = (newSubjId: number) => {
        setSubjectId(newSubjId);
        const subj = subjects.find((s) => s.id === newSubjId);
        if (subj && subj.topics.length > 0) {
            setTopicId(subj.topics[0].id);
            setSubtopicId('');
        }
    };

    const handleTopicChange = (newTopId: number) => {
        setTopicId(newTopId);
        setSubtopicId('');
    };

    const handleOptionTextChange = (
        key: 'A' | 'B' | 'C' | 'D',
        text: string,
    ) => {
        setOptions((prev) =>
            prev.map((opt) =>
                opt.option_key === key ? { ...opt, option_text: text } : opt,
            ),
        );
    };

    const handleOptionRationaleChange = (
        key: 'A' | 'B' | 'C' | 'D',
        rationale: string,
    ) => {
        setOptions((prev) =>
            prev.map((opt) =>
                opt.option_key === key ? { ...opt, rationale } : opt,
            ),
        );
    };

    const toggleExam = (exam: string) => {
        setRelevantExams((prev) =>
            prev.includes(exam)
                ? prev.filter((e) => e !== exam)
                : [...prev, exam],
        );
    };

    const [uploadingImage, setUploadingImage] = useState(false);

    const getCsrfToken = () => {
        if (typeof document === 'undefined') return '';
        const match = document.cookie.match(
            new RegExp('(^|;\\s*)XSRF-TOKEN=([^;]*)'),
        );
        return match ? decodeURIComponent(match[2]) : '';
    };

    const compressImageIfNeeded = async (file: File): Promise<File | Blob> => {
        // If file is under 1.8MB or is SVG, pass directly
        if (file.size <= 1.8 * 1024 * 1024 || file.type === 'image/svg+xml') {
            return file;
        }

        return new Promise((resolve) => {
            const img = new window.Image();
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target?.result as string;
            };
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxDim = 1920;
                let { width, height } = img;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve(file);
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(
                    (blob) => {
                        if (blob && blob.size < file.size) {
                            resolve(
                                new File(
                                    [blob],
                                    file.name.replace(/\.[^.]+$/, '.jpg'),
                                    { type: 'image/jpeg' },
                                ),
                            );
                        } else {
                            resolve(file);
                        }
                    },
                    'image/jpeg',
                    0.85,
                );
            };
            img.onerror = () => resolve(file);
            reader.readAsDataURL(file);
        });
    };

    const handleImageFileUpload = async (file: File) => {
        if (!file) return;
        setUploadingImage(true);

        try {
            const processedFile = await compressImageIfNeeded(file);
            const formData = new FormData();
            formData.append('image', processedFile);

            const headers: Record<string, string> = {
                Accept: 'application/json',
            };
            const xsrf = getCsrfToken();
            if (xsrf) {
                headers['X-XSRF-TOKEN'] = xsrf;
            }

            const res = await fetch('/admin/questions/upload-image', {
                method: 'POST',
                headers,
                body: formData,
            });

            const data = await res.json();
            if (res.ok && data.url) {
                setImageUrl(data.url);
                toast.success(
                    'Clinical diagnostic image uploaded successfully',
                );
            } else {
                const errorMsg =
                    data.errors?.image?.[0] ||
                    data.message ||
                    'Image upload failed. Please ensure file is valid and under 2MB.';
                toast.error(errorMsg);
            }
        } catch (err: any) {
            toast.error(err?.message || 'Could not upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const payload = {
            code,
            subject_id: subjectId,
            topic_id: topicId,
            subtopic_id: subtopicId || null,
            difficulty,
            question_type: 'SINGLE_BEST_ANSWER',
            stem,
            image_url: imageUrl || null,
            image_caption: imageCaption || null,
            correct_option: correctOption,
            learning_objective: learningObjective,
            foundation_explanation: foundationExplanation,
            integration_explanation: integrationExplanation,
            application_explanation: applicationExplanation,
            memory_peg: memoryPeg || null,
            is_active: isActive,
            options,
            relevant_exams: relevantExams,
        };

        if (isEdit && question?.id) {
            router.put(`/admin/questions/${question.id}`, payload, {
                onSuccess: () => setProcessing(false),
                onError: (errs) => {
                    setProcessing(false);
                    setErrors(errs as Record<string, string>);
                },
            });
        } else {
            router.post('/admin/questions', payload, {
                onSuccess: () => setProcessing(false),
                onError: (errs) => {
                    setProcessing(false);
                    setErrors(errs as Record<string, string>);
                },
            });
        }
    };

    return (
        <>
            <Head
                title={`${isEdit ? 'Edit' : 'Author'} Clinical Vignette MCQ — Cortex Admin`}
            />

            <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8"
            >
                {/* Header with Save & Preview Actions */}
                <div className="border-border flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/questions">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0"
                            >
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-foreground text-xl font-black sm:text-2xl">
                                    {isEdit
                                        ? `Edit Clinical Vignette: ${question?.code}`
                                        : 'Author New Clinical Vignette MCQ'}
                                </h1>
                                <Badge
                                    variant={isActive ? 'default' : 'secondary'}
                                    className="text-[10px] font-bold"
                                >
                                    {isActive ? 'Published Active' : 'Draft'}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                                High-Yield Postgraduate Medical Vignette
                                Authoring Suite
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsPreviewOpen(true)}
                            className="border-border gap-1.5 text-xs font-bold"
                        >
                            <Eye className="size-3.5" />
                            Live Candidate Preview
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-1.5 bg-[#0066FF] px-5 text-xs font-bold text-white shadow-md hover:bg-[#0052cc]"
                        >
                            <Save className="size-3.5" />
                            {isEdit ? 'Save Changes' : 'Publish Question'}
                        </Button>
                    </div>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="border-destructive/30 bg-destructive/10 text-destructive space-y-1 rounded-2xl border p-4 text-xs">
                        <div className="flex items-center gap-1.5 font-bold">
                            <AlertCircle className="size-4" />
                            <span>
                                Please resolve the following validation errors:
                            </span>
                        </div>
                        <ul className="list-disc space-y-0.5 pl-5">
                            {Object.entries(errors).map(([key, msg]) => (
                                <li key={key}>{msg}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Section 1: Curriculum Hierarchy & Metadata */}
                <div className="border-border bg-card space-y-4 rounded-2xl border p-5 shadow-xs sm:p-6">
                    <div className="border-border/60 flex items-center gap-2 border-b pb-3">
                        <BookOpen className="size-4 text-sky-500" />
                        <h2 className="text-foreground text-sm font-bold">
                            1. Curriculum Taxonomy &amp; Exam Relevance
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="q-code"
                                className="text-xs font-bold"
                            >
                                Question Code
                            </Label>
                            <Input
                                id="q-code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Q-MED-0192"
                                required
                                className="font-mono text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="q-subject"
                                className="text-xs font-bold"
                            >
                                Subject
                            </Label>
                            <select
                                id="q-subject"
                                value={subjectId}
                                onChange={(e) =>
                                    handleSubjectChange(
                                        parseInt(e.target.value),
                                    )
                                }
                                className="border-border bg-background text-foreground w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:border-[#0066FF] focus:outline-none"
                            >
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="q-topic"
                                className="text-xs font-bold"
                            >
                                Topic
                            </Label>
                            <select
                                id="q-topic"
                                value={topicId}
                                onChange={(e) =>
                                    handleTopicChange(parseInt(e.target.value))
                                }
                                className="border-border bg-background text-foreground w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:border-[#0066FF] focus:outline-none"
                            >
                                {availableTopics.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="q-subtopic"
                                className="text-xs font-bold"
                            >
                                Subtopic (Optional)
                            </Label>
                            <select
                                id="q-subtopic"
                                value={subtopicId}
                                onChange={(e) =>
                                    setSubtopicId(
                                        e.target.value
                                            ? parseInt(e.target.value)
                                            : '',
                                    )
                                }
                                className="border-border bg-background text-foreground w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:border-[#0066FF] focus:outline-none"
                            >
                                <option value="">-- None Selected --</option>
                                {availableSubtopics.map((st) => (
                                    <option key={st.id} value={st.id}>
                                        {st.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">
                                Difficulty Level
                            </Label>
                            <div className="flex items-center gap-2">
                                {(['EASY', 'MEDIUM', 'HARD'] as const).map(
                                    (lvl) => (
                                        <button
                                            type="button"
                                            key={lvl}
                                            onClick={() => setDifficulty(lvl)}
                                            className={`flex-1 rounded-xl border py-2 text-xs font-extrabold transition-all ${
                                                difficulty === lvl
                                                    ? lvl === 'EASY'
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                        : lvl === 'MEDIUM'
                                                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                                          : 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                                    : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                                            }`}
                                        >
                                            {lvl}
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">
                                Publishing Status
                            </Label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsActive(true)}
                                    className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-all ${
                                        isActive
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                            : 'border-border bg-card text-muted-foreground'
                                    }`}
                                >
                                    ● Active (In Exam Pools)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsActive(false)}
                                    className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-all ${
                                        !isActive
                                            ? 'border-neutral-500 bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                                            : 'border-border bg-card text-muted-foreground'
                                    }`}
                                >
                                    ○ Draft (Hidden)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Relevant Exams */}
                    <div className="border-border/60 space-y-1.5 border-t pt-2">
                        <Label className="text-xs font-bold">
                            Relevant Exam Pathways
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {examOptions.map((ep) => {
                                const selected = relevantExams.includes(ep.key);
                                return (
                                    <button
                                        type="button"
                                        key={ep.key}
                                        onClick={() => toggleExam(ep.key)}
                                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                                            selected
                                                ? 'border-[#0066FF] bg-blue-50 text-[#0066FF] dark:bg-blue-950/60'
                                                : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                                        }`}
                                    >
                                        <span
                                            className={`flex size-3 items-center justify-center rounded-full ${selected ? 'bg-[#0066FF] text-white' : 'border border-neutral-400'}`}
                                        >
                                            {selected && (
                                                <Check className="size-2" />
                                            )}
                                        </span>
                                        <span>{ep.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Section 2: Clinical Vignette Stem & Imaging */}
                <div className="border-border bg-card space-y-4 rounded-2xl border p-5 shadow-xs sm:p-6">
                    <div className="border-border/60 flex items-center gap-2 border-b pb-3">
                        <Stethoscope className="size-4 text-emerald-500" />
                        <h2 className="text-foreground text-sm font-bold">
                            2. Clinical Vignette Stem &amp; Diagnostic Imaging
                        </h2>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="q-stem" className="text-xs font-bold">
                            Patient Presentation &amp; Clinical Vignette Stem
                        </Label>
                        <textarea
                            id="q-stem"
                            value={stem}
                            onChange={(e) => setStem(e.target.value)}
                            rows={5}
                            required
                            placeholder="A 54-year-old female presents to the emergency department with 3 days of progressive dyspnea, fever, and productive cough. Vitals reveal BP 118/76, HR 102, RR 24, T 38.6°C. Auscultation reveals bronchial breath sounds..."
                            className="border-border bg-background text-foreground w-full rounded-xl border p-3 text-xs leading-relaxed font-normal focus:border-[#0066FF] focus:outline-none sm:text-sm"
                        />
                    </div>

                    <div className="border-border/80 bg-muted/10 space-y-4 rounded-xl border p-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                                <FileImage className="size-4 text-[#0066FF]" />
                                <span>
                                    Diagnostic Clinical Imaging (ECG, X-Ray,
                                    Histology, CT/MRI)
                                </span>
                            </Label>
                            {imageUrl && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageUrl('');
                                        setImageCaption('');
                                    }}
                                    className="text-destructive flex items-center gap-1 text-xs hover:underline"
                                >
                                    <X className="size-3" />
                                    Remove Image
                                </button>
                            )}
                        </div>

                        {!imageUrl ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Option A: File Upload */}
                                <div
                                    className="border-border/80 bg-card flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-all hover:border-[#0066FF]/60 hover:bg-blue-50/20"
                                    onClick={() =>
                                        document
                                            .getElementById('image-file-input')
                                            ?.click()
                                    }
                                >
                                    <input
                                        id="image-file-input"
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/webp,image/svg+xml"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (
                                                e.target.files &&
                                                e.target.files[0]
                                            ) {
                                                handleImageFileUpload(
                                                    e.target.files[0],
                                                );
                                            }
                                        }}
                                    />
                                    {uploadingImage ? (
                                        <div className="flex flex-col items-center gap-2 py-2">
                                            <Loader2 className="size-6 animate-spin text-[#0066FF]" />
                                            <span className="text-foreground text-xs font-semibold">
                                                Uploading image...
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1.5 py-1">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-[#0066FF]/10 text-[#0066FF]">
                                                <Upload className="size-4" />
                                            </div>
                                            <span className="text-foreground text-xs font-bold">
                                                Upload Image File
                                            </span>
                                            <span className="text-muted-foreground text-[10px]">
                                                PNG, JPG, WebP, SVG up to 10MB
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Option B: Image URL */}
                                <div className="border-border bg-card flex flex-col justify-between space-y-2 rounded-xl border p-4">
                                    <div>
                                        <Label
                                            htmlFor="q-image-url"
                                            className="text-muted-foreground text-[11px] font-bold"
                                        >
                                            Or Paste Image URL / Data URI
                                        </Label>
                                        <Input
                                            id="q-image-url"
                                            value={imageUrl}
                                            onChange={(e) =>
                                                setImageUrl(e.target.value)
                                            }
                                            placeholder="https://... or /storage/questions/..."
                                            className="mt-1 font-mono text-xs"
                                        />
                                    </div>
                                    <p className="text-muted-foreground text-[10px]">
                                        Useful for external medical image
                                        repositories or DICOM web exports.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Interactive DICOM / High-Res Clinical Image Viewer */}
                                <ClinicalImageViewer
                                    imageUrl={imageUrl}
                                    caption={imageCaption}
                                />

                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="q-image-caption"
                                        className="text-xs font-bold"
                                    >
                                        Diagnostic Image Caption &amp; Clinical
                                        Lead / View Notes
                                    </Label>
                                    <Input
                                        id="q-image-caption"
                                        value={imageCaption}
                                        onChange={(e) =>
                                            setImageCaption(e.target.value)
                                        }
                                        placeholder="e.g., 12-lead ECG demonstrating ST elevations in V1-V4 with reciprocal depressions..."
                                        className="text-xs"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 3: 4 Multiple Choice Options & Option-by-Option Rationale */}
                <div className="border-border bg-card space-y-4 rounded-2xl border p-5 shadow-xs sm:p-6">
                    <div className="border-border/60 flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                            <Layers className="size-4 text-indigo-500" />
                            <h2 className="text-foreground text-sm font-bold">
                                3. Multiple Choice Options &amp; Differential
                                Rationales
                            </h2>
                        </div>
                        <div className="text-muted-foreground text-xs font-medium">
                            Select the radio button for the{' '}
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                Correct Option
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {options.map((opt) => {
                            const isCorrect = correctOption === opt.option_key;
                            return (
                                <div
                                    key={opt.option_key}
                                    className={`rounded-xl border p-4 transition-all ${
                                        isCorrect
                                            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                                            : 'border-border bg-muted/10'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCorrectOption(opt.option_key)
                                            }
                                            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-black transition-all ${
                                                isCorrect
                                                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/50'
                                                    : 'border-border bg-card text-muted-foreground hover:bg-muted border'
                                            }`}
                                            title="Set as correct answer"
                                        >
                                            {opt.option_key}
                                        </button>

                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-bold">
                                                    Option {opt.option_key} Text
                                                    {isCorrect && (
                                                        <span className="ml-2 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                                                            ✓ CORRECT ANSWER
                                                        </span>
                                                    )}
                                                </Label>
                                            </div>
                                            <Input
                                                value={opt.option_text}
                                                onChange={(e) =>
                                                    handleOptionTextChange(
                                                        opt.option_key,
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={`Option ${opt.option_key} text...`}
                                                required
                                                className="text-xs font-medium"
                                            />

                                            <div className="space-y-1 pt-1">
                                                <Label className="text-muted-foreground text-[11px] font-semibold">
                                                    Rationale for Option{' '}
                                                    {opt.option_key} (Why right
                                                    / Why wrong)
                                                </Label>
                                                <textarea
                                                    value={opt.rationale || ''}
                                                    onChange={(e) =>
                                                        handleOptionRationaleChange(
                                                            opt.option_key,
                                                            e.target.value,
                                                        )
                                                    }
                                                    rows={2}
                                                    placeholder={`Explain why Choice ${opt.option_key} is ${isCorrect ? 'the accurate diagnostic/therapeutic choice' : 'incorrect'}...`}
                                                    className="border-border bg-background text-foreground w-full rounded-xl border p-2.5 text-xs focus:border-[#0066FF] focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Section 4: 3-Tier Clinical Breakdown & Explanations */}
                <div className="border-border bg-card space-y-4 rounded-2xl border p-5 shadow-xs sm:p-6">
                    <div className="border-border/60 flex items-center gap-2 border-b pb-3">
                        <Sparkles className="size-4 text-purple-500" />
                        <h2 className="text-foreground text-sm font-bold">
                            4. 3-Tier Postgraduate Clinical Explanation
                        </h2>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="q-foundation"
                                    className="text-foreground flex items-center gap-1.5 text-xs font-bold"
                                >
                                    <span className="flex size-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-black text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                        1
                                    </span>
                                    <span>
                                        Layer 1: Foundation (Core Basic Science
                                        / Pathophysiology)
                                    </span>
                                </Label>
                            </div>
                            <textarea
                                id="q-foundation"
                                value={foundationExplanation}
                                onChange={(e) =>
                                    setFoundationExplanation(e.target.value)
                                }
                                rows={3}
                                required
                                placeholder="Explain the underlying anatomical, biochemical, pharmacological, or physiological mechanisms..."
                                className="border-border bg-background text-foreground w-full rounded-xl border p-3 text-xs leading-relaxed focus:border-[#0066FF] focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="q-integration"
                                    className="text-foreground flex items-center gap-1.5 text-xs font-bold"
                                >
                                    <span className="flex size-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-black text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                        2
                                    </span>
                                    <span>
                                        Layer 2: Integration (Clinical Reasoning
                                        &amp; Differential Diagnosis)
                                    </span>
                                </Label>
                            </div>
                            <textarea
                                id="q-integration"
                                value={integrationExplanation}
                                onChange={(e) =>
                                    setIntegrationExplanation(e.target.value)
                                }
                                rows={3}
                                required
                                placeholder="Detail how the clinical presentation, physical exam, and laboratory markers correlate to narrow the differential..."
                                className="border-border bg-background text-foreground w-full rounded-xl border p-3 text-xs leading-relaxed focus:border-[#0066FF] focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="q-application"
                                    className="text-foreground flex items-center gap-1.5 text-xs font-bold"
                                >
                                    <span className="flex size-5 items-center justify-center rounded-full bg-purple-100 text-[10px] font-black text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                        3
                                    </span>
                                    <span>
                                        Layer 3: Application (Therapeutic
                                        Guidelines &amp; Clinical Next Steps)
                                    </span>
                                </Label>
                            </div>
                            <textarea
                                id="q-application"
                                value={applicationExplanation}
                                onChange={(e) =>
                                    setApplicationExplanation(e.target.value)
                                }
                                rows={3}
                                required
                                placeholder="Provide the gold-standard therapeutic algorithm, acute management steps, or contraindications..."
                                className="border-border bg-background text-foreground w-full rounded-xl border p-3 text-xs leading-relaxed focus:border-[#0066FF] focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 5: High-Yield Recall Anchors */}
                <div className="border-border bg-card space-y-4 rounded-2xl border p-5 shadow-xs sm:p-6">
                    <div className="border-border/60 flex items-center gap-2 border-b pb-3">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        <h2 className="text-foreground text-sm font-bold">
                            5. High-Yield Learning Objectives &amp; Memory Pegs
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="q-lo" className="text-xs font-bold">
                                Key Learning Objective
                            </Label>
                            <textarea
                                id="q-lo"
                                value={learningObjective}
                                onChange={(e) =>
                                    setLearningObjective(e.target.value)
                                }
                                rows={3}
                                required
                                placeholder="One-sentence high-yield clinical concept candidates must memorize..."
                                className="border-border bg-background text-foreground w-full rounded-xl border p-3 text-xs focus:border-[#0066FF] focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="q-peg"
                                className="text-xs font-bold"
                            >
                                High-Yield Memory Peg / Mnemonic (Optional)
                            </Label>
                            <textarea
                                id="q-peg"
                                value={memoryPeg}
                                onChange={(e) => setMemoryPeg(e.target.value)}
                                rows={3}
                                placeholder="e.g., 'DON'T give Nitrates in Right Ventricular Infarction' (Preload dependency)"
                                className="border-border bg-background text-foreground w-full rounded-xl border p-3 text-xs focus:border-[#0066FF] focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Action Toolbar */}
                <div className="border-border flex items-center justify-between border-t pt-4">
                    <Link href="/admin/questions">
                        <Button
                            type="button"
                            variant="outline"
                            className="text-xs font-bold"
                        >
                            Cancel &amp; Return
                        </Button>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsPreviewOpen(true)}
                            className="text-xs font-bold"
                        >
                            Preview Question
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-1.5 bg-[#0066FF] px-6 text-xs font-bold text-white shadow-md hover:bg-[#0052cc]"
                        >
                            <Save className="size-3.5" />
                            {isEdit ? 'Save Changes' : 'Publish Question'}
                        </Button>
                    </div>
                </div>
            </form>

            {/* Live Candidate Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
                    <DialogHeader>
                        <div className="border-border flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="font-mono text-xs text-sky-600"
                                >
                                    {code || 'Q-SAMPLE'}
                                </Badge>
                                <DialogTitle className="text-sm font-bold">
                                    {selectedSubject?.name} ·{' '}
                                    {selectedTopic?.name}
                                </DialogTitle>
                            </div>
                            <Badge className="bg-blue-600 text-[10px] font-bold text-white">
                                {difficulty}
                            </Badge>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="border-border bg-muted/20 text-foreground rounded-xl border p-4 text-xs leading-relaxed sm:text-sm">
                            {stem || 'Clinical vignette stem will appear here.'}
                        </div>

                        {imageUrl && (
                            <div className="py-1">
                                <ClinicalImageViewer
                                    imageUrl={imageUrl}
                                    caption={imageCaption}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                                Options
                            </div>
                            {options.map((opt) => (
                                <div
                                    key={opt.option_key}
                                    className={`flex items-start gap-3 rounded-xl border p-3 text-xs ${
                                        opt.option_key === correctOption
                                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                                            : 'border-border bg-card text-foreground'
                                    }`}
                                >
                                    <span
                                        className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                                            opt.option_key === correctOption
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {opt.option_key}
                                    </span>
                                    <span className="pt-0.5">
                                        {opt.option_text ||
                                            `Option ${opt.option_key} content...`}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Learning Objective Preview */}
                        {learningObjective && (
                            <div className="rounded-xl border border-sky-300 bg-sky-50 p-3 text-xs text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
                                <span className="font-bold">
                                    Learning Objective:{' '}
                                </span>
                                <span>{learningObjective}</span>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
