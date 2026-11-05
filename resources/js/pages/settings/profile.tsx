import { Form, Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
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
import { GraduationCap, Calendar, Clock, Target, User as UserIcon, CheckCircle2 } from 'lucide-react';

type ExamPathwayItem = {
    id: string;
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
    const user = auth.user;

    const joinedFormatted = user.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
          })
        : 'October 2026';

    const defaultPathways: ExamPathwayItem[] = [
        { code: 'USMLE_STEP1', name: 'USMLE Step 1', fullName: 'United States Medical Licensing Examination Step 1', region: 'USA', marking: 'Pass / Fail' },
        { code: 'USMLE_STEP2CK', name: 'USMLE Step 2 CK', fullName: 'USMLE Step 2 Clinical Knowledge', region: 'USA', marking: '3-Digit Scaled' },
        { code: 'INI_CET', name: 'India INI-CET', fullName: 'Institute of National Importance Combined Entrance Test (AIIMS)', region: 'India', marking: '+1.0 / -0.33' },
        { code: 'MECEE_PG', name: 'Nepal MECEE-PG', fullName: 'Medical Education Commission Entrance Exam - Post Graduate', region: 'Nepal', marking: '+1.0 / -0.25' },
        { code: 'COMBINED', name: 'Combined Global Track', fullName: '19-Subject Integrated Global Licensing Pool', region: 'Global', marking: 'Integrated' },
    ];

    const pathwayList = exam_pathways.length > 0 ? exam_pathways : defaultPathways;

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-8">
                {/* Profile Header Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card/60 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-xl shadow-inner">
                            {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-6 w-6" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-foreground">{user.name || 'Candidate Doctor'}</h2>
                                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                                    ID #{user.id}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Candidate Member • Joined {joinedFormatted}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs px-3 py-1 bg-background">
                            Track: {user.pathway_label || user.active_pathway || 'India INI-CET'}
                        </Badge>
                    </div>
                </div>

                <Heading
                    variant="small"
                    title="Profile & Exam Settings"
                    description="Update your credentials, target medical exam pathway, and daily clinical study goals."
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Candidate Personal Information */}
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-sm font-semibold">Candidate Full Name</Label>
                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="e.g. Dr. Rajesh Sada, MBBS"
                                    />
                                    <InputError className="mt-1" message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-sm font-semibold">Institutional / Contact Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="e.g. candidate@hospital.edu"
                                    />
                                    <InputError className="mt-1" message={errors.email} />
                                </div>

                                {mustVerifyEmail && user.email_verified_at === null && (
                                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                                        <p className="text-amber-800 dark:text-amber-200 text-xs">
                                            Your medical email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="underline font-semibold hover:text-amber-900 dark:hover:text-amber-100"
                                            >
                                                Click here to re-send the verification link.
                                            </Link>
                                        </p>
                                        {status === 'verification-link-sent' && (
                                            <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                A fresh verification link has been dispatched to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Medical Licensing Examination Track */}
                            <div className="pt-4 border-t border-border space-y-4">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-primary" />
                                    <h3 className="text-sm font-bold text-foreground">Target Medical Licensure Track</h3>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="active_pathway" className="text-xs text-muted-foreground">Select your primary licensing examination:</Label>
                                    <select
                                        id="active_pathway"
                                        name="active_pathway"
                                        defaultValue={(user.active_pathway as string) || 'INI_CET'}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {pathwayList.map((p) => (
                                            <option key={p.code} value={p.code}>
                                                {p.name} ({p.marking || p.region || 'Standard'})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError className="mt-1" message={errors.active_pathway} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="target_exam_date" className="text-sm font-semibold flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                        Target Exam Date
                                    </Label>
                                    <Input
                                        id="target_exam_date"
                                        type="date"
                                        className="mt-1 block w-full"
                                        defaultValue={(user.target_exam_date as string) || ''}
                                        name="target_exam_date"
                                    />
                                    <p className="text-xs text-muted-foreground">Used to calibrate your countdown timer and adaptive spaced repetition schedules.</p>
                                    <InputError className="mt-1" message={errors.target_exam_date} />
                                </div>
                            </div>

                            {/* Daily Clinical Study Targets */}
                            <div className="pt-4 border-t border-border space-y-4">
                                <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-primary" />
                                    <h3 className="text-sm font-bold text-foreground">Daily Preparation Targets</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="daily_study_hours" className="text-sm font-semibold flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                            Daily Study Target (Hours)
                                        </Label>
                                        <Input
                                            id="daily_study_hours"
                                            type="number"
                                            min={1}
                                            max={18}
                                            className="mt-1 block w-full"
                                            defaultValue={(user.daily_study_hours as number) || 6}
                                            name="daily_study_hours"
                                            placeholder="6"
                                        />
                                        <InputError className="mt-1" message={errors.daily_study_hours} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="daily_mcq_target" className="text-sm font-semibold flex items-center gap-1.5">
                                            <Target className="h-3.5 w-3.5 text-muted-foreground" />
                                            Daily MCQ Target (Questions)
                                        </Label>
                                        <Input
                                            id="daily_mcq_target"
                                            type="number"
                                            min={10}
                                            max={500}
                                            className="mt-1 block w-full"
                                            defaultValue={(user.daily_mcq_target as number) || 100}
                                            name="daily_mcq_target"
                                            placeholder="100"
                                        />
                                        <InputError className="mt-1" message={errors.daily_mcq_target} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
                                >
                                    {processing ? 'Saving Changes...' : 'Save Profile Changes'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
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
