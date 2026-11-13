import React, { useState, useRef } from 'react';
import { Form, Head, usePage, Link, router } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';
import { send } from '@/routes/verification';
import { useInitials } from '@/hooks/use-initials';
import {
    GraduationCap,
    Calendar,
    Clock,
    Target,
    User as UserIcon,
    CheckCircle2,
    Building2,
    FileBadge2,
    Phone,
    Shield,
    Sparkles,
    Flame,
    Zap,
    ExternalLink,
    Gift,
    Save,
    Check,
    AlertCircle,
    ChevronRight,
    Camera,
    Trash2,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

type ExamPathwayItem = {
    id?: string | number;
    code: string;
    name: string;
    fullName?: string;
    region?: string;
    marking?: string;
};

type PageProps = {
    auth: Auth;
    exam_pathways?: ExamPathwayItem[];
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth, exam_pathways = [] } = usePage<PageProps>().props;
    const user = auth.user as any;
    const isAdmin = Boolean(user.is_admin);
    const getInitials = useInitials();
    const initials = user.name ? getInitials(user.name) : 'DR';

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file (JPG, PNG, WEBP, GIF).');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB.');
            return;
        }

        const preview = URL.createObjectURL(file);
        setAvatarPreview(preview);

        const formData = new FormData();
        formData.append('avatar', file);

        setIsUploadingPhoto(true);
        router.post('/settings/profile/avatar', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profile picture updated successfully!');
                setIsUploadingPhoto(false);
            },
            onError: (errs) => {
                const msg = (errs as any)?.avatar || 'Failed to upload image. Please try again.';
                toast.error(msg);
                setIsUploadingPhoto(false);
                setAvatarPreview(null);
            },
        });
    };

    const handleRemovePhoto = () => {
        if (!confirm('Are you sure you want to remove your profile photo?')) return;
        setIsUploadingPhoto(true);
        router.delete('/settings/profile/avatar', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profile photo removed.');
                setAvatarPreview(null);
                setIsUploadingPhoto(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
            onError: () => {
                toast.error('Failed to remove photo.');
                setIsUploadingPhoto(false);
            },
        });
    };

    const [selectedPathway, setSelectedPathway] = useState<string>(
        user.active_pathway || 'MECEE_PG'
    );
    const [examDate, setExamDate] = useState<string>(
        user.target_exam_date || ''
    );
    const [promoInput, setPromoInput] = useState('');

    const joinedFormatted = user.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
          })
        : 'October 2026';

    const defaultPathways: ExamPathwayItem[] = [
        {
            code: 'MECEE_PG',
            name: 'Nepal MECEE-PG',
            fullName: 'Medical Education Commission Entrance Exam - Post Graduate',
            region: 'Nepal',
            marking: '+1.0 / -0.25 Scheme • 200 Questions',
        },
        {
            code: 'INI_CET',
            name: 'India INI-CET',
            fullName: 'Institute of National Importance Combined Entrance Test (AIIMS)',
            region: 'India',
            marking: '+1.0 / -0.33 Negative Marking',
        },
        {
            code: 'USMLE_STEP1',
            name: 'USMLE Step 1',
            fullName: 'United States Medical Licensing Examination Step 1',
            region: 'USA',
            marking: 'Pass / Fail Licensure Standard',
        },
        {
            code: 'USMLE_STEP2CK',
            name: 'USMLE Step 2 CK',
            fullName: 'USMLE Step 2 Clinical Knowledge',
            region: 'USA',
            marking: '3-Digit Scaled Clinical Reasoning',
        },
        {
            code: 'COMBINED',
            name: 'Combined Global Track',
            fullName: '19-Subject Integrated Global Licensing Pool',
            region: 'Global',
            marking: '+1.0 / -0.25 • All 19 Subjects',
        },
    ];

    const pathwayList = exam_pathways.length > 0 ? exam_pathways : defaultPathways;

    // Calculate days remaining to exam date
    const calculateDaysRemaining = () => {
        if (!examDate) return null;
        const target = new Date(examDate).getTime();
        const now = new Date().getTime();
        const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const daysRemaining = calculateDaysRemaining();

    const handleApplyPromo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!promoInput.trim()) return;
        if (promoInput.toUpperCase() === 'DR_CORTEX') {
            toast.success('Promo Code DR_CORTEX Applied! +30 Free AI diagnostic calibration credits activated.');
            setPromoInput('');
        } else {
            toast.error('Invalid or expired offer code. Please check your sponsor referral.');
        }
    };

    return (
        <>
            <Head title="Candidate & Faculty Profile — Cortex Medical" />

            <div className="space-y-6 w-full max-w-4xl mx-auto">
                {/* 1. EXECUTIVE DOCTOR / CANDIDATE BANNER */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0369A1] p-4 sm:p-5 text-white shadow-xs">
                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {/* Avatar with Online Glow & Instant Upload Trigger */}
                            <div className="relative shrink-0 group">
                                <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/90 bg-gradient-to-tr from-sky-600 to-cyan-400 font-extrabold text-white text-xl shadow-md">
                                    {avatarPreview || user.avatar ? (
                                        <img
                                            src={avatarPreview || user.avatar}
                                            alt={user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span>{initials}</span>
                                    )}
                                    {isUploadingPhoto && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white backdrop-blur-xs">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingPhoto}
                                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0F172A] bg-sky-500 text-white shadow-xs hover:bg-sky-400 active:scale-95 transition-all cursor-pointer"
                                    title="Upload new photo"
                                >
                                    <Camera className="h-3 w-3" />
                                </button>
                            </div>

                            {/* Details */}
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                                        {user.name || 'Candidate Doctor'}
                                    </h1>
                                    <Badge
                                        className={
                                            isAdmin
                                                ? 'border-purple-400/50 bg-purple-500/20 text-purple-200 text-[10px] font-semibold'
                                                : 'border-sky-400/50 bg-sky-500/20 text-sky-200 text-[10px] font-semibold'
                                        }
                                    >
                                        {isAdmin ? 'Faculty Administrator' : 'Candidate Doctor'}
                                    </Badge>
                                </div>

                                <p className="text-xs text-white/70 flex items-center gap-2">
                                    <span>{user.email}</span>
                                    <span>•</span>
                                    <span>ID #{user.id}</span>
                                </p>

                                <div className="pt-0.5 flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/90 border border-white/15">
                                        <GraduationCap className="h-3 w-3 text-cyan-300" />
                                        <span>{user.pathway_label || user.active_pathway || 'Nepal MECEE-PG'}</span>
                                    </span>

                                    {user.institution && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/90 border border-white/15">
                                            <Building2 className="h-3 w-3 text-emerald-300" />
                                            <span className="max-w-[180px] truncate">{user.institution}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Exam Countdown Badge */}
                        {daysRemaining !== null && daysRemaining > 0 && (
                            <div className="shrink-0 rounded-xl border border-white/20 bg-white/10 p-3 text-center sm:w-36">
                                <span className="text-[10px] font-medium uppercase tracking-wider text-cyan-200 block">
                                    Exam Countdown
                                </span>
                                <div className="text-xl font-bold text-white">
                                    {daysRemaining}
                                </div>
                                <span className="text-[10px] text-white/80">
                                    Days Remaining
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. PRIMARY PROFILE FORM */}
                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Card 0: Profile Photo & Visual Identity (Web & Flutter Sync) */}
                            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                                <div className="flex items-center justify-between border-b border-border pb-3">
                                    <div>
                                        <h2 className="text-sm font-bold text-foreground">
                                            Profile Photo &amp; Avatar
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Upload your portrait for verified candidate records and mobile app sync
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-semibold text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-950/40 border-sky-300/40">
                                        Web &amp; Flutter Sync
                                    </Badge>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                                    <div className="relative shrink-0">
                                        <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-border bg-muted font-extrabold text-2xl shadow-sm text-foreground">
                                            {avatarPreview || user.avatar ? (
                                                <img
                                                    src={avatarPreview || user.avatar}
                                                    alt={user.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sky-600 dark:text-cyan-400">{initials}</span>
                                            )}
                                            {isUploadingPhoto && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white backdrop-blur-xs">
                                                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-2.5 text-center sm:text-left">
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/jpg,image/gif"
                                                className="hidden"
                                                onChange={handlePhotoSelect}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploadingPhoto}
                                                className="h-9 rounded-xl border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
                                            >
                                                {isUploadingPhoto ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Camera className="h-4 w-4" />
                                                )}
                                                <span>{user.avatar ? 'Change Photo' : 'Upload Photo'}</span>
                                            </Button>

                                            {(user.avatar || avatarPreview) && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleRemovePhoto}
                                                    disabled={isUploadingPhoto}
                                                    className="h-9 rounded-xl text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 text-xs font-medium gap-1.5 cursor-pointer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span>Remove Photo</span>
                                                </Button>
                                            )}
                                        </div>

                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            Supports JPG, PNG, WEBP, or GIF up to 5MB. Once uploaded, your photo is automatically synchronized across the web portal and the Cortex Med Flutter mobile app.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 1: Professional & Institutional Credentials */}
                            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                                <div className="flex items-center justify-between border-b border-border pb-3">
                                    <div>
                                        <h2 className="text-sm font-bold text-foreground">
                                            Personal &amp; Institutional Credentials
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Contact information and medical registration details
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-medium">
                                        Record
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="name" className="text-xs font-bold text-foreground">
                                            Candidate Full Name <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={user.name}
                                            required
                                            placeholder="e.g. Dr. Rajesh Sada, MBBS"
                                            className="h-10 rounded-xl text-xs"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="text-xs font-bold text-foreground">
                                            Institutional / Login Email <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            defaultValue={user.email}
                                            required
                                            placeholder="e.g. rsada.54@gmail.com"
                                            className="h-10 rounded-xl text-xs"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="institution" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                            Medical College / Hospital Affiliation
                                        </Label>
                                        <Input
                                            id="institution"
                                            name="institution"
                                            defaultValue={user.institution || ''}
                                            placeholder="e.g. Kathmandu University / AIIMS / Johns Hopkins"
                                            className="h-10 rounded-xl text-xs"
                                        />
                                        <InputError message={errors.institution} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="medical_council_no" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <FileBadge2 className="h-3.5 w-3.5 text-muted-foreground" />
                                            Medical Council / Licensure Reg. No.
                                        </Label>
                                        <Input
                                            id="medical_council_no"
                                            name="medical_council_no"
                                            defaultValue={user.medical_council_no || ''}
                                            placeholder="e.g. NMC-29401 / USMLE ID 09841244"
                                            className="h-10 rounded-xl text-xs"
                                        />
                                        <InputError message={errors.medical_council_no} />
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="phone" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                            Direct Contact Phone / WhatsApp (For Urgent Score Alerts)
                                        </Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            defaultValue={user.phone || ''}
                                            placeholder="e.g. +977 9800000000 / +1 (555) 019-2831"
                                            className="h-10 rounded-xl text-xs"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                </div>

                                {mustVerifyEmail && user.email_verified_at === null && (
                                    <div className="rounded-2xl border border-amber-300/80 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-amber-700 dark:text-amber-400 mt-0.5" />
                                            <div className="text-xs space-y-1">
                                                <p className="font-bold text-amber-900 dark:text-amber-200">
                                                    Email Address Unverified
                                                </p>
                                                <p className="text-amber-800/90 dark:text-amber-300">
                                                    Verify your email to guarantee score retention and test export delivery.{' '}
                                                    <Link
                                                        href={send()}
                                                        as="button"
                                                        className="font-bold underline hover:text-amber-950"
                                                    >
                                                        Re-send Verification Link
                                                    </Link>
                                                </p>
                                                {status === 'verification-link-sent' && (
                                                    <p className="text-emerald-700 font-bold pt-1">
                                                        A fresh verification link has been sent to your email.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Card 2: Target Medical Licensure Track & Scheme */}
                            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                                <div className="flex items-center justify-between border-b border-border pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400">
                                            <GraduationCap className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold text-foreground">
                                                Examination Pathway &amp; Blueprint Calibration
                                            </h2>
                                            <p className="text-xs text-muted-foreground">
                                                Blueprint weighting and negative marking scheme
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-medium text-sky-600">
                                        Active Scheme
                                    </Badge>
                                </div>

                                {/* Pathway Selection Radio Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {pathwayList.map((p) => {
                                        const isSelected = selectedPathway === p.code || selectedPathway === p.id;
                                        return (
                                            <label
                                                key={p.code || p.id}
                                                onClick={() => setSelectedPathway(String(p.code || p.id || ''))}
                                                className={`flex cursor-pointer items-start justify-between rounded-xl border p-3.5 transition-all ${
                                                    isSelected
                                                        ? 'border-sky-500 bg-sky-50/70 shadow-xs dark:border-sky-500 dark:bg-sky-950/40'
                                                        : 'border-border/80 bg-card hover:border-border hover:bg-muted/40'
                                                }`}
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`text-xs font-bold ${
                                                                isSelected
                                                                    ? 'text-sky-900 dark:text-sky-200'
                                                                    : 'text-foreground'
                                                            }`}
                                                        >
                                                            {p.name}
                                                        </span>
                                                        <span className="rounded-md bg-muted px-1.5 py-0.2 text-[10px] font-semibold text-muted-foreground">
                                                            {p.region || 'Licensure'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground leading-snug">
                                                        {p.marking || 'Standard MCQ Blueprint'}
                                                    </p>
                                                </div>

                                                <input
                                                    type="radio"
                                                    name="active_pathway"
                                                    value={p.code || p.id}
                                                    checked={isSelected}
                                                    onChange={() => setSelectedPathway(String(p.code || p.id || ''))}
                                                    className="mt-1 h-4 w-4 text-sky-600 focus:ring-sky-500"
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.active_pathway} />

                                {/* Target Exam Date Picker */}
                                <div className="border-t border-border pt-3">
                                    <div className="space-y-1.5 max-w-sm">
                                        <Label htmlFor="target_exam_date" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                            Target Exam Date
                                        </Label>
                                        <Input
                                            id="target_exam_date"
                                            name="target_exam_date"
                                            type="date"
                                            value={examDate}
                                            onChange={(e) => setExamDate(e.target.value)}
                                            className="h-10 rounded-xl text-xs"
                                        />
                                        <p className="text-[11px] text-muted-foreground">
                                            Powers your daily readiness countdown timer and study schedule.
                                        </p>
                                        <InputError message={errors.target_exam_date} />
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Daily Clinical Targets & Study Goals */}
                            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                                <div className="flex items-center justify-between border-b border-border pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                                            <Target className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold text-foreground">
                                                Daily Clinical Study Targets
                                            </h2>
                                            <p className="text-xs text-muted-foreground">
                                                Daily streak and question bank pace calibration
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-medium text-amber-600">
                                        Pace
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="daily_study_hours" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5 text-sky-600" />
                                                Daily Study Target (Hours)
                                            </Label>
                                            <span className="text-xs font-bold text-sky-700 dark:text-sky-400">
                                                1 – 18 Hrs
                                            </span>
                                        </div>
                                        <Input
                                            id="daily_study_hours"
                                            name="daily_study_hours"
                                            type="number"
                                            min={1}
                                            max={18}
                                            defaultValue={user.daily_study_hours || 6}
                                            placeholder="6"
                                            className="h-9 rounded-xl text-xs font-bold"
                                        />
                                        <p className="text-[11px] text-muted-foreground">
                                            Recommended for residency candidates: 6 to 8 hours/day.
                                        </p>
                                        <InputError message={errors.daily_study_hours} />
                                    </div>

                                    <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="daily_mcq_target" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                <Flame className="h-3.5 w-3.5 text-amber-600" />
                                                Daily MCQ Practice Target
                                            </Label>
                                            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                                10 – 500 MCQs
                                            </span>
                                        </div>
                                        <Input
                                            id="daily_mcq_target"
                                            name="daily_mcq_target"
                                            type="number"
                                            min={10}
                                            max={500}
                                            defaultValue={user.daily_mcq_target || 100}
                                            placeholder="100"
                                            className="h-9 rounded-xl text-xs font-bold"
                                        />
                                        <p className="text-[11px] text-muted-foreground">
                                            Recommended pace: 75 to 120 questions daily.
                                        </p>
                                        <InputError message={errors.daily_mcq_target} />
                                    </div>
                                </div>
                            </div>

                            {/* Save Button Bar */}
                            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 shadow-xs">
                                <div className="text-xs text-muted-foreground">
                                    Changes take effect immediately across all candidate sessions.
                                </div>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 h-9 rounded-xl shadow-xs text-xs"
                                >
                                    <Save className="h-3.5 w-3.5 mr-1.5" />
                                    {processing ? 'Saving...' : 'Save Profile Changes'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                {/* 3. CORTEX AI & REFERRAL OFFER CODES */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-foreground">
                                    Cortex AI &amp; Sponsorship Offer Codes
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Institutional scholarships, promo codes, or sponsor credits
                                </p>
                            </div>
                        </div>
                        <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-300 text-[10px]">
                            AI Engine
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Credits Balance Card */}
                        <div className="rounded-2xl border border-purple-200/80 bg-purple-50/40 p-4 dark:border-purple-900/40 dark:bg-purple-950/20 space-y-2">
                            <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider block">
                                Clinical AI Calibration Credits
                            </span>
                            <div className="text-xl font-bold text-purple-900 dark:text-purple-200">
                                {user.ai_credits ?? 50} / 50 Credits
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Replenishes automatically every 24 hours for differential diagnosis tutoring.
                            </p>
                        </div>

                        {/* Redeem Offer Code Bar */}
                        <form onSubmit={handleApplyPromo} className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2">
                            <Label className="text-xs font-bold text-foreground">
                                Have an institutional offer code?
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    value={promoInput}
                                    onChange={(e) => setPromoInput(e.target.value)}
                                    placeholder="Enter code (e.g. DR_CORTEX)"
                                    className="h-9 rounded-xl text-xs font-mono"
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="h-9 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                                >
                                    Apply
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Use sponsor code <strong className="text-foreground">DR_CORTEX</strong> for bonus trial months.
                            </p>
                        </form>
                    </div>
                </div>

                {/* 4. DANGER ZONE: ACCOUNT DELETION */}
                <div className="rounded-2xl border border-rose-200/80 bg-card p-5 shadow-xs">
                    <DeleteUser />
                </div>
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
