import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Upload,
    FileSpreadsheet,
    FileCode,
    CheckCircle2,
    AlertCircle,
    Download,
    HelpCircle,
    Info,
    Layers,
    FileCheck,
    AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SubjectItem {
    id: number;
    name: string;
    topics: Array<{ id: number; subject_id: number; name: string }>;
}

interface ImportError {
    row: number | string;
    identifier: string;
    messages: string[];
}

interface ImportResults {
    total: number;
    imported: number;
    failed: number;
    errors: ImportError[];
    created_codes: string[];
}

interface ImportProps {
    subjects: SubjectItem[];
    importResults?: ImportResults | null;
}

export default function QuestionsImport({
    subjects,
    importResults,
}: ImportProps) {
    const [dragOver, setDragOver] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(
        null,
    );

    const { data, setData, post, processing, errors, reset } = useForm<{
        file: File | null;
        status: 'active' | 'draft';
        subject_id: string;
    }>({
        file: null,
        status: 'active',
        subject_id: '',
    });

    const handleFileChange = (file: File | null) => {
        if (!file) return;

        // Check if file size exceeds 150MB (150 * 1024 * 1024 bytes)
        const maxSizeBytes = 150 * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            toast.error('File exceeds 150MB limit', {
                description: `Selected file is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Maximum allowed upload size is 150MB.`,
            });
            return;
        }

        setData('file', file);
        const formattedSize =
            file.size >= 1024 * 1024
                ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                : `${(file.size / 1024).toFixed(1)} KB`;
        setSelectedFileName(`${file.name} (${formattedSize})`);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file) return;

        post('/admin/questions/import', {
            preserveScroll: true,
            onSuccess: () => {
                reset('file');
                setSelectedFileName(null);
            },
        });
    };

    return (
        <>
            <Head title="Bulk Question Importer — Cortex Admin" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header with back button */}
                <div className="border-border flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
                    <div>
                        <Link
                            href="/admin/questions"
                            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
                        >
                            <ArrowLeft className="size-3.5" />
                            <span>Back to MCQ Question Bank</span>
                        </Link>
                        <h1 className="text-foreground flex items-center gap-2.5 text-2xl font-black tracking-tight sm:text-3xl">
                            <Upload className="size-7 text-[#0066FF]" />
                            <span>Bulk MCQ Question Importer</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                            Import dozens or hundreds of clinical vignettes with
                            4 options and 3-tier clinical explanations via CSV
                            or JSON.
                        </p>
                    </div>

                    {/* Quick Download Sample Templates */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                        <a href="/admin/questions/import/template/csv" download>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-border gap-1.5 text-xs font-bold hover:border-emerald-500 hover:text-emerald-600"
                            >
                                <FileSpreadsheet className="size-3.5 text-emerald-600" />
                                <span>Sample CSV</span>
                                <Download className="text-muted-foreground size-3" />
                            </Button>
                        </a>
                        <a
                            href="/admin/questions/import/template/json"
                            download
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-border gap-1.5 text-xs font-bold hover:border-sky-500 hover:text-sky-600"
                            >
                                <FileCode className="size-3.5 text-sky-600" />
                                <span>Sample JSON</span>
                                <Download className="text-muted-foreground size-3" />
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Live Feedback Alert after Import */}
                {importResults && (
                    <div className="space-y-4">
                        <div
                            className={`rounded-2xl border p-5 shadow-xs ${
                                importResults.failed === 0
                                    ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                                    : 'border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    {importResults.failed === 0 ? (
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                                            <CheckCircle2 className="size-5" />
                                        </div>
                                    ) : (
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                                            <AlertTriangle className="size-5" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-foreground text-sm font-black">
                                            Import Completed:{' '}
                                            {importResults.imported} /{' '}
                                            {importResults.total} Questions
                                            Successfully Added
                                        </h3>
                                        <p className="text-muted-foreground mt-0.5 text-xs">
                                            {importResults.failed === 0
                                                ? 'All questions passed medical curriculum and format validation.'
                                                : `${importResults.failed} rows could not be imported due to formatting or validation issues.`}
                                        </p>

                                        {importResults.created_codes &&
                                            importResults.created_codes.length >
                                                0 && (
                                                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                                    <span className="text-muted-foreground mr-1 text-[11px] font-bold">
                                                        Generated:
                                                    </span>
                                                    {importResults.created_codes
                                                        .slice(0, 10)
                                                        .map((code) => (
                                                            <Badge
                                                                key={code}
                                                                variant="secondary"
                                                                className="font-mono text-[10px]"
                                                            >
                                                                {code}
                                                            </Badge>
                                                        ))}
                                                    {importResults.created_codes
                                                        .length > 10 && (
                                                        <span className="text-muted-foreground text-[11px] font-semibold">
                                                            +
                                                            {importResults
                                                                .created_codes
                                                                .length -
                                                                10}{' '}
                                                            more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </div>

                                <Link href="/admin/questions">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="shrink-0 text-xs font-bold"
                                    >
                                        View in Q-Bank
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Error Breakdown Table */}
                        {importResults.errors &&
                            importResults.errors.length > 0 && (
                                <div className="border-destructive/30 bg-destructive/5 space-y-3 rounded-2xl border p-4 sm:p-5">
                                    <div className="text-destructive flex items-center gap-2 text-xs font-bold">
                                        <AlertCircle className="size-4" />
                                        <span>
                                            Failed Rows Breakdown (
                                            {importResults.errors.length})
                                        </span>
                                    </div>
                                    <div className="divide-border/60 border-border/60 bg-card divide-y overflow-hidden rounded-xl border text-xs">
                                        {importResults.errors.map(
                                            (err, idx) => (
                                                <div
                                                    key={idx}
                                                    className="gap-4 p-3 sm:flex sm:items-start sm:justify-between"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="shrink-0 font-mono text-[10px]"
                                                        >
                                                            Row {err.row}
                                                        </Badge>
                                                        <span className="text-foreground max-w-xs truncate font-semibold">
                                                            {err.identifier}
                                                        </span>
                                                    </div>
                                                    <ul className="text-destructive mt-1.5 list-inside list-disc space-y-0.5 text-[11px] sm:mt-0">
                                                        {err.messages.map(
                                                            (m, mIdx) => (
                                                                <li key={mIdx}>
                                                                    {m}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left 2 Cols: Upload Form */}
                    <div className="space-y-6 lg:col-span-2">
                        <form
                            onSubmit={handleSubmit}
                            className="border-border bg-card space-y-6 rounded-2xl border p-5 shadow-xs sm:p-6"
                        >
                            {/* Drag and Drop Zone */}
                            <div>
                                <Label className="text-foreground mb-2 block text-xs font-bold">
                                    Upload Question File (.csv or .json)
                                </Label>

                                <div
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setDragOver(true);
                                    }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                                        dragOver
                                            ? 'scale-[0.99] border-[#0066FF] bg-blue-50/50 dark:bg-blue-950/20'
                                            : selectedFileName
                                              ? 'border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/10'
                                              : 'border-border/80 bg-muted/20 hover:bg-muted/40 hover:border-[#0066FF]/50'
                                    }`}
                                    onClick={() =>
                                        document
                                            .getElementById('file-upload-input')
                                            ?.click()
                                    }
                                >
                                    <input
                                        id="file-upload-input"
                                        type="file"
                                        accept=".csv,.json,.txt"
                                        className="hidden"
                                        onChange={(e) =>
                                            handleFileChange(
                                                e.target.files
                                                    ? e.target.files[0]
                                                    : null,
                                            )
                                        }
                                    />

                                    {selectedFileName ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                                                <FileCheck className="size-6" />
                                            </div>
                                            <div className="text-foreground text-xs font-bold">
                                                {selectedFileName}
                                            </div>
                                            <p className="text-muted-foreground text-[11px]">
                                                Click or drag another file to
                                                replace
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0066FF]/10 text-[#0066FF]">
                                                <Upload className="size-6" />
                                            </div>
                                            <div className="text-foreground text-xs font-bold">
                                                Drag &amp; drop your CSV or JSON
                                                file here
                                            </div>
                                            <p className="text-muted-foreground text-[11px]">
                                                or{' '}
                                                <span className="font-semibold text-[#0066FF] underline">
                                                    browse local files
                                                </span>{' '}
                                                (max 150MB)
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {errors.file && (
                                    <p className="text-destructive mt-2 text-xs font-semibold">
                                        {errors.file}
                                    </p>
                                )}
                            </div>

                            {/* Import Settings */}
                            <div className="border-border/70 grid grid-cols-1 gap-4 border-t pt-2 sm:grid-cols-2">
                                {/* Initial Status */}
                                <div>
                                    <Label className="text-foreground mb-1.5 block text-xs font-bold">
                                        Initial Publication Status
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setData('status', 'active')
                                            }
                                            className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-bold transition-all ${
                                                data.status === 'active'
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                    : 'border-border bg-card text-muted-foreground hover:bg-muted/30'
                                            }`}
                                        >
                                            <span>Active (Live)</span>
                                            {data.status === 'active' && (
                                                <CheckCircle2 className="size-3.5" />
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setData('status', 'draft')
                                            }
                                            className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-bold transition-all ${
                                                data.status === 'draft'
                                                    ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                                    : 'border-border bg-card text-muted-foreground hover:bg-muted/30'
                                            }`}
                                        >
                                            <span>Draft (Review)</span>
                                            {data.status === 'draft' && (
                                                <CheckCircle2 className="size-3.5" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-muted-foreground mt-1 text-[10px]">
                                        Draft questions can be reviewed before
                                        students can see them in Q-Bank.
                                    </p>
                                </div>

                                {/* Default Subject Fallback */}
                                <div>
                                    <Label className="text-foreground mb-1.5 block text-xs font-bold">
                                        Default Subject (Optional Fallback)
                                    </Label>
                                    <select
                                        value={data.subject_id}
                                        onChange={(e) =>
                                            setData(
                                                'subject_id',
                                                e.target.value,
                                            )
                                        }
                                        className="border-input bg-card text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#0066FF] focus:outline-hidden"
                                    >
                                        <option value="">
                                            Auto-detect from file rows
                                        </option>
                                        {subjects.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                {sub.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-muted-foreground mt-1 text-[10px]">
                                        Used if a row does not specify an
                                        explicit subject name or ID.
                                    </p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Link href="/admin/questions">
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        size="sm"
                                        className="text-xs font-semibold"
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={!data.file || processing}
                                    className="gap-1.5 bg-[#0066FF] px-5 text-xs font-bold text-white shadow-md hover:bg-[#0052cc] disabled:opacity-50"
                                >
                                    <Upload className="size-4" />
                                    {processing
                                        ? 'Validating & Importing...'
                                        : 'Import Questions Now'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Right Col: Format Guide & Column Reference */}
                    <div className="space-y-4">
                        <div className="border-border bg-card space-y-4 rounded-2xl border p-5 shadow-xs">
                            <div className="text-foreground flex items-center gap-2 text-xs font-bold">
                                <Info className="size-4 text-[#0066FF]" />
                                <span>CSV / JSON Format Requirements</span>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <span className="text-foreground text-muted-foreground mb-1 block text-[11px] font-bold tracking-wider uppercase">
                                        Mandatory Fields
                                    </span>
                                    <ul className="text-muted-foreground space-y-1 text-[11px]">
                                        <li className="flex items-center gap-1.5">
                                            <span className="size-1.5 rounded-full bg-[#0066FF]" />
                                            <code className="text-foreground font-mono">
                                                stem
                                            </code>
                                            : Question vignette text
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <span className="size-1.5 rounded-full bg-[#0066FF]" />
                                            <code className="text-foreground font-mono">
                                                option_a ... option_d
                                            </code>
                                            : 4 options
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <span className="size-1.5 rounded-full bg-[#0066FF]" />
                                            <code className="text-foreground font-mono">
                                                correct_option
                                            </code>
                                            : 'A', 'B', 'C', or 'D'
                                        </li>
                                    </ul>
                                </div>

                                <div className="border-border/70 border-t pt-3">
                                    <span className="text-foreground text-muted-foreground mb-1 block text-[11px] font-bold tracking-wider uppercase">
                                        3-Tier Explanations
                                    </span>
                                    <ul className="text-muted-foreground space-y-1 text-[11px]">
                                        <li>
                                            <code className="text-foreground font-mono">
                                                foundation_explanation
                                            </code>
                                            : Biological mechanism
                                        </li>
                                        <li>
                                            <code className="text-foreground font-mono">
                                                integration_explanation
                                            </code>
                                            : Differential diagnosis
                                        </li>
                                        <li>
                                            <code className="text-foreground font-mono">
                                                application_explanation
                                            </code>
                                            : Guideline / therapy
                                        </li>
                                    </ul>
                                </div>

                                <div className="border-border/70 border-t pt-3">
                                    <span className="text-foreground text-muted-foreground mb-1 block text-[11px] font-bold tracking-wider uppercase">
                                        Optional Metadata
                                    </span>
                                    <ul className="text-muted-foreground space-y-1 text-[11px]">
                                        <li>
                                            <code className="text-foreground font-mono">
                                                subject
                                            </code>
                                            : e.g. "Anatomy", "Pharmacology"
                                        </li>
                                        <li>
                                            <code className="text-foreground font-mono">
                                                difficulty
                                            </code>
                                            : EASY, MEDIUM, HARD
                                        </li>
                                        <li>
                                            <code className="text-foreground font-mono">
                                                memory_peg
                                            </code>
                                            : High-yield mnemonic pearl
                                        </li>
                                        <li>
                                            <code className="text-foreground font-mono">
                                                relevant_exams
                                            </code>
                                            : MECEE_PG, INI_CET, USMLE_STEP1
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Fast starter banner */}
                        <div className="rounded-2xl border border-sky-300 bg-sky-50 p-4 text-xs dark:border-sky-800 dark:bg-sky-950/40">
                            <div className="mb-1 flex items-center gap-1.5 font-bold text-sky-900 dark:text-sky-200">
                                <HelpCircle className="size-3.5 text-sky-600 dark:text-sky-400" />
                                <span>Tip for Quick Testing</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-sky-800 dark:text-sky-300">
                                Download the <strong>Sample CSV</strong> or{' '}
                                <strong>Sample JSON</strong> from the top right
                                to get pre-formatted clinical vignettes ready to
                                upload immediately.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
