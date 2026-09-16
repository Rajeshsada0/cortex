import React, { useState, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Globe,
    Sparkles,
    Upload,
    RotateCcw,
    Save,
    CheckCircle2,
    Share2,
    Search,
    ExternalLink,
    Shield,
    Image as ImageIcon,
    FileText,
    Layers,
    Info,
    Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SystemSettingsData {
    app_name: string;
    app_version: string;
    app_tagline: string;
    site_logo: string;
    site_favicon: string;
    footer_text: string;
    contact_email: string;
    seo_meta_title: string;
    seo_meta_description: string;
    seo_meta_keywords: string;
    seo_og_image: string;
    social_facebook: string;
    social_twitter: string;
    social_instagram: string;
    social_youtube: string;
    social_linkedin: string;
    social_telegram: string;
}

interface SettingsIndexProps {
    settings: SystemSettingsData;
}

export default function SettingsIndex({ settings }: SettingsIndexProps) {
    const [activeTab, setActiveTab] = useState<'branding' | 'seo' | 'social'>('branding');

    // Local previews for uploaded files before saving
    const [logoPreview, setLogoPreview] = useState<string>(settings.site_logo);
    const [faviconPreview, setFaviconPreview] = useState<string>(settings.site_favicon);
    const [ogImagePreview, setOgImagePreview] = useState<string>(settings.seo_og_image);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);
    const ogImageInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        app_name: settings.app_name || 'CORTEX MED',
        app_version: settings.app_version || 'v4.2',
        app_tagline: settings.app_tagline || 'Candidate Readiness Portal',
        site_logo: settings.site_logo || '/images/cortex-logo.png',
        site_favicon: settings.site_favicon || '/favicon.ico',
        footer_text: settings.footer_text || '© 2026 Cortex Med. High-Stakes Doctor Entrance Simulation Engine.',
        contact_email: settings.contact_email || 'support@cortexmed.com',
        seo_meta_title: settings.seo_meta_title || '',
        seo_meta_description: settings.seo_meta_description || '',
        seo_meta_keywords: settings.seo_meta_keywords || '',
        seo_og_image: settings.seo_og_image || '/images/cortex-logo.png',
        social_facebook: settings.social_facebook || '',
        social_twitter: settings.social_twitter || '',
        social_instagram: settings.social_instagram || '',
        social_youtube: settings.social_youtube || '',
        social_linkedin: settings.social_linkedin || '',
        social_telegram: settings.social_telegram || '',
        site_logo_file: null as File | null,
        site_favicon_file: null as File | null,
        seo_og_image_file: null as File | null,
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('site_logo_file', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('site_favicon_file', file);
            setFaviconPreview(URL.createObjectURL(file));
        }
    };

    const handleOgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('seo_og_image_file', file);
            setOgImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/settings', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Global platform settings updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update settings. Please review form errors.');
            },
        });
    };

    const handleResetLogo = () => {
        if (confirm('Reset site logo to the official Cortex brain logo?')) {
            router.post('/admin/settings/reset-logo', {}, {
                preserveScroll: true,
                onSuccess: () => {
                    setLogoPreview('/images/cortex-logo.png');
                    setData('site_logo', '/images/cortex-logo.png');
                    setData('site_logo_file', null);
                    toast.success('Site logo restored to official default.');
                },
            });
        }
    };

    const handleResetFavicon = () => {
        if (confirm('Reset browser favicon to default?')) {
            router.post('/admin/settings/reset-favicon', {}, {
                preserveScroll: true,
                onSuccess: () => {
                    setFaviconPreview('/favicon.ico');
                    setData('site_favicon', '/favicon.ico');
                    setData('site_favicon_file', null);
                    toast.success('Favicon restored to default.');
                },
            });
        }
    };

    return (
        <>
            <Head title="Global Settings & Platform Branding — Cortex Super Admin" />

            <div className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="border-border flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-1 inline-flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400">
                            <Globe className="size-4" />
                            <span>Super Admin System Administration Suite</span>
                        </div>
                        <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                            Global Platform Settings &amp; Branding
                        </h1>
                        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                            Control app name, release version, site logo, browser favicon, SEO meta tags, and official social media links.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="gap-2 bg-[#0066FF] px-6 text-xs font-bold text-white shadow-md hover:bg-[#0052cc]"
                        >
                            <Save className="size-4" />
                            {processing ? 'Saving Changes...' : 'Save All Settings'}
                        </Button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="border-border flex border-b">
                    <button
                        type="button"
                        onClick={() => setActiveTab('branding')}
                        className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition-colors ${
                            activeTab === 'branding'
                                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Sparkles className="size-4" />
                        <span>Branding &amp; Core Identity</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('seo')}
                        className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition-colors ${
                            activeTab === 'seo'
                                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Search className="size-4" />
                        <span>SEO &amp; Search Engine Metadata</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('social')}
                        className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-extrabold transition-colors ${
                            activeTab === 'social'
                                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Share2 className="size-4" />
                        <span>Official Social Media Links</span>
                    </button>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* TAB 1: BRANDING & IDENTITY */}
                    {activeTab === 'branding' && (
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            {/* Left Column: Form Fields */}
                            <div className="space-y-6 lg:col-span-2">
                                <div className="border-border bg-card rounded-2xl border p-6 shadow-xs">
                                    <h2 className="text-foreground text-base font-black">
                                        Platform Identity
                                    </h2>
                                    <p className="text-muted-foreground mt-0.5 text-xs">
                                        These values define your platform branding across sidebars, login screens, headers, and footer.
                                    </p>

                                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="app_name" className="text-xs font-bold">
                                                Application Name <span className="text-rose-500">*</span>
                                            </Label>
                                            <Input
                                                id="app_name"
                                                value={data.app_name}
                                                onChange={(e) => setData('app_name', e.target.value)}
                                                placeholder="e.g. CORTEX MED"
                                                className="font-medium"
                                                required
                                            />
                                            {errors.app_name && (
                                                <p className="text-[11px] text-rose-500">{errors.app_name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="app_version" className="text-xs font-bold">
                                                Release Version <span className="text-rose-500">*</span>
                                            </Label>
                                            <Input
                                                id="app_version"
                                                value={data.app_version}
                                                onChange={(e) => setData('app_version', e.target.value)}
                                                placeholder="e.g. v4.2"
                                                className="font-mono text-xs font-bold"
                                                required
                                            />
                                            {errors.app_version && (
                                                <p className="text-[11px] text-rose-500">{errors.app_version}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 sm:col-span-2">
                                            <Label htmlFor="app_tagline" className="text-xs font-bold">
                                                Tagline / Portal Subtitle
                                            </Label>
                                            <Input
                                                id="app_tagline"
                                                value={data.app_tagline}
                                                onChange={(e) => setData('app_tagline', e.target.value)}
                                                placeholder="e.g. Candidate Readiness Portal"
                                                className="font-medium"
                                            />
                                            {errors.app_tagline && (
                                                <p className="text-[11px] text-rose-500">{errors.app_tagline}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 sm:col-span-2">
                                            <Label htmlFor="contact_email" className="text-xs font-bold">
                                                Administrative Support Email
                                            </Label>
                                            <Input
                                                id="contact_email"
                                                type="email"
                                                value={data.contact_email}
                                                onChange={(e) => setData('contact_email', e.target.value)}
                                                placeholder="support@cortexmed.com"
                                                className="font-medium"
                                            />
                                            {errors.contact_email && (
                                                <p className="text-[11px] text-rose-500">{errors.contact_email}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 sm:col-span-2">
                                            <Label htmlFor="footer_text" className="text-xs font-bold">
                                                Footer Copyright Notice
                                            </Label>
                                            <Input
                                                id="footer_text"
                                                value={data.footer_text}
                                                onChange={(e) => setData('footer_text', e.target.value)}
                                                placeholder="© 2026 Cortex Med. High-Stakes Doctor Entrance Simulation Engine."
                                                className="font-medium"
                                            />
                                            {errors.footer_text && (
                                                <p className="text-[11px] text-rose-500">{errors.footer_text}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Logo & Favicon Upload Card */}
                                <div className="border-border bg-card rounded-2xl border p-6 shadow-xs">
                                    <h2 className="text-foreground text-base font-black">
                                        Site Logo &amp; Favicon Assets
                                    </h2>
                                    <p className="text-muted-foreground mt-0.5 text-xs">
                                        Upload official high-resolution vector or transparent PNG brand marks.
                                    </p>

                                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {/* Logo Upload Box */}
                                        <div className="border-border/80 bg-muted/20 flex flex-col justify-between rounded-xl border p-4">
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-foreground text-xs font-bold">
                                                        Primary Site Logo
                                                    </span>
                                                    <Badge variant="outline" className="text-[10px]">
                                                        PNG, SVG, WEBP
                                                    </Badge>
                                                </div>
                                                <p className="text-muted-foreground mt-1 text-[11px]">
                                                    Displays in sidebars, navigation bars, headers, and exam halls.
                                                </p>

                                                {/* Logo Preview */}
                                                <div className="border-border bg-muted/40 my-4 flex h-28 items-center justify-center rounded-lg border border-dashed p-4">
                                                    <img
                                                        src={logoPreview}
                                                        alt="Site Logo Preview"
                                                        className="max-h-20 max-w-full object-contain drop-shadow-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <input
                                                    type="file"
                                                    ref={logoInputRef}
                                                    onChange={handleLogoChange}
                                                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => logoInputRef.current?.click()}
                                                    className="w-full gap-2 text-xs font-semibold"
                                                >
                                                    <Upload className="size-3.5" />
                                                    Upload New Logo
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={handleResetLogo}
                                                    className="text-muted-foreground hover:text-foreground w-full gap-1.5 text-[11px]"
                                                >
                                                    <RotateCcw className="size-3" />
                                                    Reset to Official Logo
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Favicon Upload Box */}
                                        <div className="border-border/80 bg-muted/20 flex flex-col justify-between rounded-xl border p-4">
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-foreground text-xs font-bold">
                                                        Browser Favicon
                                                    </span>
                                                    <Badge variant="outline" className="text-[10px]">
                                                        ICO, PNG, SVG
                                                    </Badge>
                                                </div>
                                                <p className="text-muted-foreground mt-1 text-[11px]">
                                                    Displays in browser tab title bars, bookmarks, and mobile shortcuts.
                                                </p>

                                                {/* Favicon Preview */}
                                                <div className="border-border bg-muted/40 my-4 flex h-28 items-center justify-center rounded-lg border border-dashed p-4">
                                                    <div className="border-border bg-card flex size-12 items-center justify-center rounded-xl border p-2 shadow-xs">
                                                        <img
                                                            src={faviconPreview}
                                                            alt="Favicon Preview"
                                                            className="size-8 object-contain"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <input
                                                    type="file"
                                                    ref={faviconInputRef}
                                                    onChange={handleFaviconChange}
                                                    accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml"
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => faviconInputRef.current?.click()}
                                                    className="w-full gap-2 text-xs font-semibold"
                                                >
                                                    <Upload className="size-3.5" />
                                                    Upload New Favicon
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={handleResetFavicon}
                                                    className="text-muted-foreground hover:text-foreground w-full gap-1.5 text-[11px]"
                                                >
                                                    <RotateCcw className="size-3" />
                                                    Reset to Default Favicon
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Live Header & Brand Previews */}
                            <div className="space-y-6">
                                <div className="border-border bg-card rounded-2xl border p-5 shadow-xs">
                                    <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400">
                                        <Sparkles className="size-4" />
                                        <span>Live Branding Simulation</span>
                                    </div>
                                    <h3 className="text-foreground mt-1 text-sm font-black">
                                        Sidebar &amp; Navigation Preview
                                    </h3>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        Real-time preview of how your brand appears to enrolled candidates.
                                    </p>

                                    {/* Light Mode Preview */}
                                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                            Light Theme View
                                        </span>
                                        <div className="mt-2 flex items-center">
                                            <div className="flex aspect-square size-9 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-1 shadow-xs">
                                                <img
                                                    src={logoPreview}
                                                    alt="Preview Logo"
                                                    className="size-7 object-contain drop-shadow-xs"
                                                />
                                            </div>
                                            <div className="ml-2.5 grid flex-1 text-left leading-none">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-black tracking-wider text-slate-900">
                                                        {data.app_name}
                                                    </span>
                                                    <span className="rounded border border-cyan-500/30 bg-cyan-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-cyan-700">
                                                        {data.app_version}
                                                    </span>
                                                </div>
                                                <span className="mt-1 truncate text-[11px] font-medium text-slate-500">
                                                    {data.app_tagline}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dark Mode Preview */}
                                    <div className="mt-3 rounded-xl border border-slate-800 bg-[#070b14] p-4 shadow-xs">
                                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                            Dark Theme View
                                        </span>
                                        <div className="mt-2 flex items-center">
                                            <div className="flex aspect-square size-9 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-950/60 p-1 shadow-xs">
                                                <img
                                                    src={logoPreview}
                                                    alt="Preview Logo"
                                                    className="size-7 object-contain drop-shadow-xs"
                                                />
                                            </div>
                                            <div className="ml-2.5 grid flex-1 text-left leading-none">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-black tracking-wider text-white">
                                                        {data.app_name}
                                                    </span>
                                                    <span className="rounded border border-cyan-500/40 bg-cyan-950/80 px-1.5 py-0.5 font-mono text-[9px] font-bold text-cyan-400">
                                                        {data.app_version}
                                                    </span>
                                                </div>
                                                <span className="mt-1 truncate text-[11px] font-medium text-slate-400">
                                                    {data.app_tagline}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Browser Tab Simulation */}
                                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900">
                                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                            Browser Tab Simulation
                                        </span>
                                        <div className="mt-2 flex max-w-xs items-center gap-2 rounded-t-lg border border-b-0 border-slate-300 bg-white px-3 py-1.5 shadow-xs dark:border-slate-700 dark:bg-slate-950">
                                            <img
                                                src={faviconPreview}
                                                alt="Favicon"
                                                className="size-3.5 object-contain"
                                            />
                                            <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                {data.app_name} — Doctor Entrance
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: SEO & SEARCH METADATA */}
                    {activeTab === 'seo' && (
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            {/* Form Fields */}
                            <div className="space-y-6 lg:col-span-2">
                                <div className="border-border bg-card rounded-2xl border p-6 shadow-xs">
                                    <h2 className="text-foreground text-base font-black">
                                        Search Engine Optimization (SEO)
                                    </h2>
                                    <p className="text-muted-foreground mt-0.5 text-xs">
                                        Configure meta tags, OpenGraph attributes, and social previews to maximize organic discovery on Google and social feeds.
                                    </p>

                                    <div className="mt-5 space-y-4">
                                        {/* Meta Title */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="seo_meta_title" className="text-xs font-bold">
                                                    Primary Meta Title <span className="text-rose-500">*</span>
                                                </Label>
                                                <span className={`text-[11px] font-mono ${
                                                    data.seo_meta_title.length > 60 ? 'text-amber-500' : 'text-muted-foreground'
                                                }`}>
                                                    {data.seo_meta_title.length} / 60 chars recommended
                                                </span>
                                            </div>
                                            <Input
                                                id="seo_meta_title"
                                                value={data.seo_meta_title}
                                                onChange={(e) => setData('seo_meta_title', e.target.value)}
                                                placeholder="Cortex Medical — Postgraduate Doctor Entrance Preparation"
                                                className="font-medium"
                                                required
                                            />
                                            {errors.seo_meta_title && (
                                                <p className="text-[11px] text-rose-500">{errors.seo_meta_title}</p>
                                            )}
                                        </div>

                                        {/* Meta Description */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="seo_meta_description" className="text-xs font-bold">
                                                    Meta Description <span className="text-rose-500">*</span>
                                                </Label>
                                                <span className={`text-[11px] font-mono ${
                                                    data.seo_meta_description.length > 160 ? 'text-amber-500' : 'text-muted-foreground'
                                                }`}>
                                                    {data.seo_meta_description.length} / 160 chars recommended
                                                </span>
                                            </div>
                                            <Textarea
                                                id="seo_meta_description"
                                                rows={3}
                                                value={data.seo_meta_description}
                                                onChange={(e) => setData('seo_meta_description', e.target.value)}
                                                placeholder="High-Stakes Postgraduate Doctor Entrance Simulation Engine..."
                                                className="font-medium text-xs leading-relaxed"
                                                required
                                            />
                                            {errors.seo_meta_description && (
                                                <p className="text-[11px] text-rose-500">{errors.seo_meta_description}</p>
                                            )}
                                        </div>

                                        {/* Meta Keywords */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="seo_meta_keywords" className="text-xs font-bold">
                                                Meta Keywords (Comma separated)
                                            </Label>
                                            <Textarea
                                                id="seo_meta_keywords"
                                                rows={2}
                                                value={data.seo_meta_keywords}
                                                onChange={(e) => setData('seo_meta_keywords', e.target.value)}
                                                placeholder="MBBS, NMCLE, MECEE-PG, INI-CET, USMLE, Medical Entrance Exam, CSQ"
                                                className="font-medium text-xs"
                                            />
                                            {errors.seo_meta_keywords && (
                                                <p className="text-[11px] text-rose-500">{errors.seo_meta_keywords}</p>
                                            )}
                                        </div>

                                        {/* OpenGraph Image Upload */}
                                        <div className="border-border/80 bg-muted/20 rounded-xl border p-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-bold">
                                                    Social Share Preview Image (OG:Image)
                                                </Label>
                                                <Badge variant="outline" className="text-[10px]">
                                                    1200 × 630 px
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground mt-0.5 text-[11px]">
                                                Appears when links to your platform are shared on WhatsApp, Facebook, LinkedIn, X, and Telegram.
                                            </p>

                                            <div className="mt-3 flex items-center gap-4">
                                                <div className="border-border bg-card flex h-20 w-36 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                                                    <img
                                                        src={ogImagePreview}
                                                        alt="OG Preview"
                                                        className="h-full w-full object-contain p-2"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <input
                                                        type="file"
                                                        ref={ogImageInputRef}
                                                        onChange={handleOgImageChange}
                                                        accept="image/png,image/jpeg,image/webp"
                                                        className="hidden"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => ogImageInputRef.current?.click()}
                                                        className="gap-1.5 text-xs font-semibold"
                                                    >
                                                        <Upload className="size-3.5" />
                                                        Upload OG Image
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SEO Live Previews */}
                            <div className="space-y-6">
                                {/* Google SERP Preview */}
                                <div className="border-border bg-card rounded-2xl border p-5 shadow-xs">
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        <Search className="size-4" />
                                        <span>Google Search Result Simulation</span>
                                    </div>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        How your platform snippet appears in Google Search results.
                                    </p>

                                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 font-sans shadow-xs dark:border-slate-800 dark:bg-[#1f2023]">
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                                <img
                                                    src={faviconPreview}
                                                    alt="Favicon"
                                                    className="size-3.5 object-contain"
                                                />
                                            </div>
                                            <div className="flex flex-col text-[11px] leading-tight">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {data.app_name}
                                                </span>
                                                <span className="text-[10px] text-slate-500">
                                                    https://cortexmed.com
                                                </span>
                                            </div>
                                        </div>

                                        <h4 className="mt-2 text-sm font-semibold text-[#1a0dab] hover:underline dark:text-[#8ab4f8]">
                                            {data.seo_meta_title || 'Cortex Medical — Doctor Entrance Preparation'}
                                        </h4>
                                        <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-[#4d5156] dark:text-[#bdc1c6]">
                                            {data.seo_meta_description || 'High-Stakes Postgraduate Doctor Entrance Simulation Engine...'}
                                        </p>
                                    </div>
                                </div>

                                {/* Social Share Card Simulation */}
                                <div className="border-border bg-card rounded-2xl border p-5 shadow-xs">
                                    <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400">
                                        <Share2 className="size-4" />
                                        <span>Social Card Preview (X / WhatsApp)</span>
                                    </div>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        How shared links will render across social media networks.
                                    </p>

                                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-[#16181c]">
                                        <div className="flex h-36 w-full items-center justify-center bg-slate-100 p-4 dark:bg-slate-900">
                                            <img
                                                src={ogImagePreview}
                                                alt="Social Preview"
                                                className="max-h-28 max-w-full object-contain"
                                            />
                                        </div>
                                        <div className="p-3">
                                            <span className="text-[10px] font-mono text-slate-400">cortexmed.com</span>
                                            <h5 className="mt-0.5 truncate text-xs font-bold text-slate-900 dark:text-white">
                                                {data.seo_meta_title}
                                            </h5>
                                            <p className="mt-1 line-clamp-2 text-[11px] leading-tight text-slate-500 dark:text-slate-400">
                                                {data.seo_meta_description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: SOCIAL MEDIA LINKS */}
                    {activeTab === 'social' && (
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            {/* Social URLs Form */}
                            <div className="space-y-6 lg:col-span-2">
                                <div className="border-border bg-card rounded-2xl border p-6 shadow-xs">
                                    <h2 className="text-foreground text-base font-black">
                                        Official Social Media Handles &amp; Communities
                                    </h2>
                                    <p className="text-muted-foreground mt-0.5 text-xs">
                                        Link your institutional social networks to connect with candidates and medical graduates.
                                    </p>

                                    <div className="mt-6 space-y-4">
                                        {/* Facebook */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="social_facebook" className="text-xs font-bold flex items-center gap-1.5">
                                                    <span className="flex size-4 items-center justify-center rounded-full bg-[#1877F2] text-[10px] font-black text-white">f</span>
                                                    Facebook Page URL
                                                </Label>
                                                {data.social_facebook && (
                                                    <a
                                                        href={data.social_facebook}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:underline dark:text-sky-400"
                                                    >
                                                        Test Link <ExternalLink className="size-3" />
                                                    </a>
                                                )}
                                            </div>
                                            <Input
                                                id="social_facebook"
                                                value={data.social_facebook}
                                                onChange={(e) => setData('social_facebook', e.target.value)}
                                                placeholder="https://facebook.com/cortexmed"
                                                className="font-medium text-xs"
                                            />
                                        </div>

                                        {/* Twitter / X */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="social_twitter" className="text-xs font-bold flex items-center gap-1.5">
                                                    <span className="flex size-4 items-center justify-center rounded-full bg-black text-[10px] font-black text-white dark:bg-white dark:text-black">𝕏</span>
                                                    Twitter / X Profile URL
                                                </Label>
                                                {data.social_twitter && (
                                                    <a
                                                        href={data.social_twitter}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:underline dark:text-sky-400"
                                                    >
                                                        Test Link <ExternalLink className="size-3" />
                                                    </a>
                                                )}
                                            </div>
                                            <Input
                                                id="social_twitter"
                                                value={data.social_twitter}
                                                onChange={(e) => setData('social_twitter', e.target.value)}
                                                placeholder="https://x.com/cortexmed"
                                                className="font-medium text-xs"
                                            />
                                        </div>

                                        {/* Instagram */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="social_instagram" className="text-xs font-bold flex items-center gap-1.5">
                                                    <span className="flex size-4 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-[10px] font-black text-white">📸</span>
                                                    Instagram Profile URL
                                                </Label>
                                                {data.social_instagram && (
                                                    <a
                                                        href={data.social_instagram}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:underline dark:text-sky-400"
                                                    >
                                                        Test Link <ExternalLink className="size-3" />
                                                    </a>
                                                )}
                                            </div>
                                            <Input
                                                id="social_instagram"
                                                value={data.social_instagram}
                                                onChange={(e) => setData('social_instagram', e.target.value)}
                                                placeholder="https://instagram.com/cortexmed"
                                                className="font-medium text-xs"
                                            />
                                        </div>

                                        {/* YouTube */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="social_youtube" className="text-xs font-bold flex items-center gap-1.5">
                                                    <span className="flex size-4 items-center justify-center rounded-full bg-[#FF0000] text-[10px] font-black text-white">▶</span>
                                                    YouTube Channel URL
                                                </Label>
                                                {data.social_youtube && (
                                                    <a
                                                        href={data.social_youtube}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:underline dark:text-sky-400"
                                                    >
                                                        Test Link <ExternalLink className="size-3" />
                                                    </a>
                                                )}
                                            </div>
                                            <Input
                                                id="social_youtube"
                                                value={data.social_youtube}
                                                onChange={(e) => setData('social_youtube', e.target.value)}
                                                placeholder="https://youtube.com/@cortexmed"
                                                className="font-medium text-xs"
                                            />
                                        </div>

                                        {/* LinkedIn */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="social_linkedin" className="text-xs font-bold flex items-center gap-1.5">
                                                    <span className="flex size-4 items-center justify-center rounded-full bg-[#0A66C2] text-[10px] font-black text-white">in</span>
                                                    LinkedIn Company / Page URL
                                                </Label>
                                                {data.social_linkedin && (
                                                    <a
                                                        href={data.social_linkedin}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:underline dark:text-sky-400"
                                                    >
                                                        Test Link <ExternalLink className="size-3" />
                                                    </a>
                                                )}
                                            </div>
                                            <Input
                                                id="social_linkedin"
                                                value={data.social_linkedin}
                                                onChange={(e) => setData('social_linkedin', e.target.value)}
                                                placeholder="https://linkedin.com/company/cortexmed"
                                                className="font-medium text-xs"
                                            />
                                        </div>

                                        {/* Telegram */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="social_telegram" className="text-xs font-bold flex items-center gap-1.5">
                                                    <span className="flex size-4 items-center justify-center rounded-full bg-[#24A1DE] text-[10px] font-black text-white">✈</span>
                                                    Telegram Channel / Group URL
                                                </Label>
                                                {data.social_telegram && (
                                                    <a
                                                        href={data.social_telegram}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:underline dark:text-sky-400"
                                                    >
                                                        Test Link <ExternalLink className="size-3" />
                                                    </a>
                                                )}
                                            </div>
                                            <Input
                                                id="social_telegram"
                                                value={data.social_telegram}
                                                onChange={(e) => setData('social_telegram', e.target.value)}
                                                placeholder="https://t.me/cortexmed"
                                                className="font-medium text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Live Footer Social Preview */}
                            <div className="space-y-6">
                                <div className="border-border bg-card rounded-2xl border p-5 shadow-xs">
                                    <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400">
                                        <Share2 className="size-4" />
                                        <span>Footer Social Icons Preview</span>
                                    </div>
                                    <h3 className="text-foreground mt-1 text-sm font-black">
                                        Candidate Footer Visibility
                                    </h3>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        These interactive icons will appear on your landing page and dashboard footers.
                                    </p>

                                    <div className="border-border bg-muted/30 mt-4 rounded-xl border p-4 text-center">
                                        <span className="text-muted-foreground text-[11px] font-bold">
                                            Connect With Cortex Med
                                        </span>
                                        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                                            {data.social_facebook && (
                                                <div className="border-border bg-card flex size-8 items-center justify-center rounded-full border shadow-xs">
                                                    <span className="text-xs font-black text-[#1877F2]">f</span>
                                                </div>
                                            )}
                                            {data.social_twitter && (
                                                <div className="border-border bg-card flex size-8 items-center justify-center rounded-full border shadow-xs">
                                                    <span className="text-xs font-black text-foreground">𝕏</span>
                                                </div>
                                            )}
                                            {data.social_instagram && (
                                                <div className="border-border bg-card flex size-8 items-center justify-center rounded-full border shadow-xs">
                                                    <span className="text-xs font-bold text-rose-500">📸</span>
                                                </div>
                                            )}
                                            {data.social_youtube && (
                                                <div className="border-border bg-card flex size-8 items-center justify-center rounded-full border shadow-xs">
                                                    <span className="text-xs font-black text-[#FF0000]">▶</span>
                                                </div>
                                            )}
                                            {data.social_linkedin && (
                                                <div className="border-border bg-card flex size-8 items-center justify-center rounded-full border shadow-xs">
                                                    <span className="text-xs font-black text-[#0A66C2]">in</span>
                                                </div>
                                            )}
                                            {data.social_telegram && (
                                                <div className="border-border bg-card flex size-8 items-center justify-center rounded-full border shadow-xs">
                                                    <span className="text-xs font-black text-[#24A1DE]">✈</span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-muted-foreground mt-3 text-[10px]">
                                            {data.footer_text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </>
    );
}
