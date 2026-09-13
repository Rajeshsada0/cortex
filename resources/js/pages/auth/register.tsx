import React from 'react';
import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Target, User, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Candidate Registration — Cortex Medical" />

            {/* Target Postgraduate Curriculum Banner */}
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-sky-200/80 bg-gradient-to-r from-cyan-50/90 to-sky-50/80 p-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
                    <Target className="size-5" />
                </div>
                <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900">
                        Target Postgraduate Curriculum
                    </h4>
                    <p className="text-[11px] leading-relaxed text-slate-600">
                        Supports Nepal MECEE-PG, India INI-CET, and USA USMLE Step 1
                        &amp; 2 CK with instant single-click pathway switching.
                    </p>
                </div>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            {/* Full Name */}
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="name"
                                    className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-900"
                                >
                                    <User className="size-3.5 text-sky-600" />
                                    <span>Candidate Full Name</span>
                                    <span className="text-rose-500 font-bold">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="e.g. Dr. Saurav Adhikari, MBBS"
                                    className="h-11 rounded-xl border border-sky-200/90 bg-slate-50/80 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all dark:bg-slate-50/80 dark:text-slate-900 dark:border-sky-200/90 dark:placeholder:text-slate-400"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Email */}
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="email"
                                    className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-900"
                                >
                                    <Mail className="size-3.5 text-sky-600" />
                                    <span>Medical Email Address</span>
                                    <span className="text-rose-500 font-bold">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="doctor@institution.org"
                                    className="h-11 rounded-xl border border-sky-200/90 bg-slate-50/80 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all dark:bg-slate-50/80 dark:text-slate-900 dark:border-sky-200/90 dark:placeholder:text-slate-400"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="password"
                                    className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-900"
                                >
                                    <Lock className="size-3.5 text-sky-600" />
                                    <span>Create Password</span>
                                    <span className="text-rose-500 font-bold">*</span>
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Minimum 8 characters"
                                    passwordrules={passwordRules}
                                    className="h-11 rounded-xl border border-sky-200/90 bg-slate-50/80 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all dark:bg-slate-50/80 dark:text-slate-900 dark:border-sky-200/90 dark:placeholder:text-slate-400"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Confirm Password */}
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-900"
                                >
                                    <Lock className="size-3.5 text-sky-600" />
                                    <span>Confirm Password</span>
                                    <span className="text-rose-500 font-bold">*</span>
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Re-enter password"
                                    passwordrules={passwordRules}
                                    className="h-11 rounded-xl border border-sky-200/90 bg-slate-50/80 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all dark:bg-slate-50/80 dark:text-slate-900 dark:border-sky-200/90 dark:placeholder:text-slate-400"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-[#0284c7] via-[#0284c7] to-[#0ea5e9] text-xs font-bold text-white shadow-lg shadow-sky-500/25 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                                tabIndex={5}
                                data-test="register-user-button"
                                disabled={processing}
                            >
                                {processing ? (
                                    <Spinner className="mr-2" />
                                ) : (
                                    <UserPlus className="size-4" />
                                )}
                                <span>Create Candidate Profile</span>
                                <ArrowRight className="size-4 ml-1" />
                            </Button>
                        </div>

                        {/* Sign in prompt */}
                        <div className="pt-3 text-center text-xs font-medium text-slate-600">
                            Already registered as a candidate?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className="font-bold text-sky-600 hover:text-sky-700 hover:underline"
                            >
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Candidate Registration',
    description:
        'Create your postgraduate medical entrance examination account',
};
