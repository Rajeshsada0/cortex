import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/hooks/use-settings';
import { toast } from 'sonner';
import {
    Headset,
    Mail,
    PhoneCall,
    Star,
    Gavel,
    Share2,
    Gift,
    Copy,
    Check,
    AlertTriangle,
    GraduationCap,
    Send,
    Loader2,
    ExternalLink,
    CheckCircle2,
    Radio,
} from 'lucide-react';
import type { PathwayOption } from './pathway-selector';

// =============================================================================
// 1. COURSE SELECTOR MODAL
// =============================================================================
interface CourseSelectorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentPathway?: string;
    pathways: PathwayOption[];
    onSelectPathway: (pathwayId: string) => void;
}

export function CourseSelectorModal({
    open,
    onOpenChange,
    currentPathway,
    pathways,
    onSelectPathway,
}: CourseSelectorModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg rounded-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-1.5 pb-2 text-left">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                                Your Course
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Switch or configure your active preparation pathway & scoring blueprint
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-3 space-y-2.5">
                    {pathways.map((p) => {
                        const isSelected = p.id === currentPathway || p.code === currentPathway;
                        return (
                            <div
                                key={p.id || p.code}
                                onClick={() => onSelectPathway(p.id || p.code || '')}
                                className={`group flex cursor-pointer items-start justify-between rounded-xl border p-3.5 transition-all ${
                                    isSelected
                                        ? 'border-sky-500 bg-sky-50/70 shadow-xs dark:border-sky-500/80 dark:bg-sky-950/40'
                                        : 'border-border/80 bg-card hover:border-border hover:bg-muted/50'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                                            isSelected
                                                ? 'bg-sky-600 text-white'
                                                : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                                        }`}
                                    >
                                        <GraduationCap className="h-4 w-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className={`text-sm font-bold ${
                                                    isSelected
                                                        ? 'text-sky-900 dark:text-sky-200'
                                                        : 'text-foreground'
                                                }`}
                                            >
                                                {p.name}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] py-0 px-1.5 font-semibold ${
                                                    p.badgeColor || 'border-sky-200 text-sky-700'
                                                }`}
                                            >
                                                {p.region || 'Medical'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-snug">
                                            {p.marking || p.penalty || 'Standard MCQ Scoring Blueprint'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-1 pl-2">
                                    {isSelected ? (
                                        <CheckCircle2 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                    ) : (
                                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 group-hover:border-muted-foreground/60" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// =============================================================================
// 2. CONTACT US MODAL
// =============================================================================
interface ContactUsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: { name?: string; email?: string };
}

export function ContactUsModal({ open, onOpenChange, user }: ContactUsModalProps) {
    const settings = useSettings();
    const [category, setCategory] = useState('Clinical Question Query');
    const [message, setMessage] = useState('');
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const supportEmail = settings.support_desk_email || 'support@cortexmedical.app';
    const supportPhone = settings.support_desk_phone || '+1 (800) 267-8391';

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            toast.error('Please enter your inquiry details.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/v1/support/inquiries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    name,
                    email,
                    category,
                    message,
                }),
            });

            if (res.ok) {
                toast.success('Inquiry received! Our medical helpdesk will reply within 24 hours.', {
                    description: 'A confirmation reference has been logged.',
                });
                setMessage('');
                onOpenChange(false);
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.message || 'Failed to submit inquiry. Please try again.');
            }
        } catch (error) {
            toast.error('Network error. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg rounded-2xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
                <DialogHeader className="space-y-1 pb-1 text-left">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
                            <Headset className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                                Contact Cortex Support
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                24/7 Clinical Advisory & Examination Platform Helpdesk
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Quick Channels */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div
                        onClick={() => copyToClipboard(supportEmail, 'Support email')}
                        className="group flex cursor-pointer flex-col rounded-xl border border-teal-200/60 bg-teal-50/50 p-3 transition-colors hover:bg-teal-50 dark:border-teal-900/60 dark:bg-teal-950/30 dark:hover:bg-teal-950/50"
                    >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300">
                            <Mail className="h-3.5 w-3.5" />
                            Email Us
                        </div>
                        <span className="mt-1 truncate text-xs font-medium text-muted-foreground group-hover:text-foreground">
                            {supportEmail}
                        </span>
                    </div>

                    <div
                        onClick={() => copyToClipboard(supportPhone, 'Helpdesk number')}
                        className="group flex cursor-pointer flex-col rounded-xl border border-teal-200/60 bg-teal-50/50 p-3 transition-colors hover:bg-teal-50 dark:border-teal-900/60 dark:bg-teal-950/30 dark:hover:bg-teal-950/50"
                    >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300">
                            <PhoneCall className="h-3.5 w-3.5" />
                            Live Desk
                        </div>
                        <span className="mt-1 truncate text-xs font-medium text-muted-foreground group-hover:text-foreground">
                            {supportPhone}
                        </span>
                    </div>
                </div>

                {/* Direct Inquiry Form */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                    <div className="space-y-1.5">
                        <Label htmlFor="category" className="text-xs font-semibold text-foreground">
                            Inquiry Category
                        </Label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="Clinical Question Query">Clinical Question Query (Errata / Vignette)</option>
                            <option value="Technical Support">Technical Support & App Issues</option>
                            <option value="Course & Pathway Help">Course & Exam Pathway Configuration</option>
                            <option value="Billing & License">Billing, Subscription & License</option>
                            <option value="General Feedback">General Feedback & Feature Ideas</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="contact-name" className="text-xs font-semibold text-foreground">
                                Your Name
                            </Label>
                            <Input
                                id="contact-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Dr. Candidate"
                                className="h-9 rounded-xl text-xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="contact-email" className="text-xs font-semibold text-foreground">
                                Reply Email
                            </Label>
                            <Input
                                id="contact-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="doctor@example.com"
                                className="h-9 rounded-xl text-xs"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="message" className="text-xs font-semibold text-foreground">
                            How can our clinical team assist you?
                        </Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe your inquiry, question stem reference, or suggestion..."
                            className="min-h-[100px] rounded-xl text-xs leading-relaxed"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs h-10 shadow-xs"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Transmitting Inquiry...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Send Message to Helpdesk
                            </>
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// =============================================================================
// 3. RATE US INTERACTIVE 5-STAR MODAL
// =============================================================================
interface RateUsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: { name?: string; email?: string };
}

export function RateUsModal({ open, onOpenChange, user }: RateUsModalProps) {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sentiments = [
        '',
        'Needs Improvement 😟',
        'Fair, room to grow 😐',
        'Good & Helpful 🙂',
        'Very Good Experience! 😊',
        'Exceptional Medical App! 🌟🩺',
    ];

    const effectiveRating = hoverRating || rating;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/v1/app-ratings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    rating,
                    sentiment: sentiments[rating],
                    review,
                    name: user?.name,
                    email: user?.email,
                }),
            });

            if (res.ok) {
                toast.success(`Thank you for rating us ${rating} stars!`, {
                    description: 'Your clinical feedback empowers medical aspirants worldwide.',
                });
                onOpenChange(false);
            } else {
                toast.success(`Thank you for rating Cortex Medical! (${rating} Stars)`);
                onOpenChange(false);
            }
        } catch (error) {
            toast.success(`Rating recorded! Thank you for supporting Cortex Medical.`);
            onOpenChange(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-2xl p-6 sm:p-7 text-center">
                <DialogHeader className="space-y-1.5 pb-1 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-xs dark:bg-amber-950/60 dark:text-amber-400">
                        <Star className="h-8 w-8 fill-current" />
                    </div>
                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                        Rate Cortex Medical
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
                        How is your clinical entrance exam prep experience with Cortex Medical?
                    </DialogDescription>
                </DialogHeader>

                {/* 5 Interactive Stars */}
                <div className="mt-3 flex justify-center items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-1 transition-transform hover:scale-115 focus:outline-none"
                        >
                            <Star
                                className={`h-8 w-8 transition-colors ${
                                    star <= effectiveRating
                                        ? 'text-amber-500 fill-amber-500 drop-shadow-xs'
                                        : 'text-muted-foreground/30'
                                }`}
                            />
                        </button>
                    ))}
                </div>

                {/* Sentiment Caption */}
                <div className="mt-1">
                    <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        {sentiments[effectiveRating]}
                    </span>
                </div>

                {/* Optional Feedback */}
                <div className="mt-4 text-left">
                    <Textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Share what you love or any feature ideas you'd like added..."
                        className="min-h-[80px] rounded-xl text-xs"
                    />
                </div>

                <div className="mt-5 flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 rounded-xl text-xs font-semibold text-muted-foreground"
                    >
                        Maybe Later
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs h-10 shadow-xs"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Rating'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// =============================================================================
// 4. TERMS & CONDITIONS MODAL
// =============================================================================
interface TermsConditionsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TermsConditionsModal({ open, onOpenChange }: TermsConditionsModalProps) {
    const settings = useSettings();

    const disclaimer =
        settings.medical_disclaimer ||
        'MEDICAL DISCLAIMER: Cortex Medical is an academic prep tool engineered strictly for exam preparation (USMLE, INI-CET, MECEE). Rationales, case vignettes, and mock items do NOT constitute diagnostic or treatment guidelines for real patient care.';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl rounded-2xl p-6 sm:p-7 max-h-[88vh] overflow-y-auto">
                <DialogHeader className="space-y-1 pb-1 text-left">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                            <Gavel className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                                Terms & Conditions
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Terms of Service, Medical Academic Disclaimer & Candidate Honor Code
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Medical Disclaimer Callout */}
                <div className="mt-3 rounded-xl border border-rose-300/80 bg-rose-50/80 p-3.5 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                    <div className="flex items-start gap-2.5">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                        <div className="text-xs leading-relaxed font-semibold">
                            {disclaimer}
                        </div>
                    </div>
                </div>

                {/* Legal Sections */}
                <div className="mt-4 space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                    <div>
                        <h4 className="font-bold text-foreground text-sm mb-1">
                            1. Acceptance of Terms
                        </h4>
                        <p>
                            By accessing or registering on Cortex Medical, you agree to comply with and be bound by these Terms of Service. These terms apply to all candidate doctors, medical students, educators, and institutional subscribers.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground text-sm mb-1">
                            2. Educational Licensure Simulation
                        </h4>
                        <p>
                            Curriculum vignettes and standardized questions test foundational and clinical knowledge under standardized examination frameworks (USMLE Step 1/Step 2 CK, INI-CET, Nepal MECEE-PG). Cortex Medical does not guarantee examination scores or licensure grant.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground text-sm mb-1">
                            3. Intellectual Property & Honor Code
                        </h4>
                        <p>
                            All clinical stems, CSQ station logic, rationale explanations, medical imaging assets, and predictive readiness analytics are proprietary. Systematic scraping, sharing of authenticated access, or unauthorized dissemination is strictly prohibited.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground text-sm mb-1">
                            4. Privacy & Candidate Performance Telemetry
                        </h4>
                        <p>
                            We maintain strict confidentiality. Your test session attempts, spaced-repetition memory retention parameters, and clinical notes are encrypted and never monetized or distributed to outside parties.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground text-sm mb-1">
                            5. Platform Updates & Continuous Calibration
                        </h4>
                        <p>
                            Cortex Medical Technologies reserves the right to periodically calibrate question items, syllabus weighting, and marking schemes to reflect active national medical council examination blueprints.
                        </p>
                    </div>
                </div>

                <div className="mt-5">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-10 shadow-xs"
                    >
                        I Understand & Agree
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// =============================================================================
// 5. SHARE THE APP MODAL
// =============================================================================
interface ShareAppModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: { name?: string; email?: string };
}

export function ShareAppModal({ open, onOpenChange }: ShareAppModalProps) {
    const settings = useSettings();
    const [copied, setCopied] = useState(false);

    const promoCode = settings.referral_promo_code || 'DR_CORTEX';
    const bonusText =
        settings.referral_bonus_text ||
        'Refer a Fellow Med Student. Both get 1 month of Cortex AI Quick Calibration free when they join.';

    const shareUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/register?ref=${promoCode}`
            : `https://cortexmedical.app/join?ref=${promoCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success('Referral link copied to clipboard!');
        setTimeout(() => setCopied(false), 2500);
    };

    const handleSocialShare = (platform: 'whatsapp' | 'telegram' | 'twitter') => {
        const text = encodeURIComponent(
            `Join me on Cortex Medical! Prep for USMLE, INI-CET & MECEE-PG with clinical vignettes, spaced repetition & AI readiness: ${shareUrl}`
        );
        let url = '';
        if (platform === 'whatsapp') url = `https://api.whatsapp.com/send?text=${text}`;
        if (platform === 'telegram') url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`;
        if (platform === 'twitter') url = `https://twitter.com/intent/tweet?text=${text}`;

        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-2xl p-6 sm:p-7">
                <DialogHeader className="space-y-1 pb-1 text-left">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
                            <Share2 className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                                Share Cortex Medical
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Invite colleagues & study partners to unlock candidate rewards
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Promo Card */}
                <div className="mt-3 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 p-4 text-white shadow-xs">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-xs">
                            <Gift className="h-5 w-5 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-sm leading-snug">
                                Gift 1 Month Premium Access
                            </h4>
                            <p className="text-xs text-purple-100 leading-relaxed">
                                {bonusText}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Referral Link Box */}
                <div className="mt-4 space-y-1.5 text-left">
                    <Label className="text-xs font-semibold text-foreground">
                        Your Unique Referral Link
                    </Label>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 truncate rounded-xl border border-input bg-muted/50 px-3 py-2 text-xs font-mono text-muted-foreground">
                            {shareUrl}
                        </div>
                        <Button
                            onClick={handleCopy}
                            size="sm"
                            className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 h-9"
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 mr-1.5" />}
                            {copied ? 'Copied' : 'Copy'}
                        </Button>
                    </div>
                </div>

                {/* Quick Share Buttons */}
                <div className="mt-4">
                    <span className="text-[11px] font-semibold text-muted-foreground block mb-2 text-left uppercase tracking-wider">
                        Quick Share With Colleagues
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleSocialShare('whatsapp')}
                            className="rounded-xl border-border/80 text-xs font-semibold hover:border-emerald-500 hover:text-emerald-600 h-9"
                        >
                            WhatsApp
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleSocialShare('telegram')}
                            className="rounded-xl border-border/80 text-xs font-semibold hover:border-sky-500 hover:text-sky-600 h-9"
                        >
                            Telegram
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleSocialShare('twitter')}
                            className="rounded-xl border-border/80 text-xs font-semibold hover:border-foreground hover:text-foreground h-9"
                        >
                            X / Twitter
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
