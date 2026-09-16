import React from 'react';
import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Candidate Login — Cortex Medical" />

            <PasskeyVerify />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
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
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="doctor@institution.org"
                                    className="h-11 rounded-xl border border-sky-200/90 bg-slate-50/80 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all dark:bg-slate-50/80 dark:text-slate-900 dark:border-sky-200/90 dark:placeholder:text-slate-400"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="grid gap-1.5">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-900"
                                    >
                                        <Lock className="size-3.5 text-sky-600" />
                                        <span>Password</span>
                                        <span className="text-rose-500 font-bold">*</span>
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Enter your candidate password"
                                    className="h-11 rounded-xl border border-sky-200/90 bg-slate-50/80 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all dark:bg-slate-50/80 dark:text-slate-900 dark:border-sky-200/90 dark:placeholder:text-slate-400"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center space-x-2.5 pt-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-sky-300 data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-600"
                                >
                                    Keep me logged in on this clinical workstation
                                </Label>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-[#0284c7] via-[#0284c7] to-[#0ea5e9] text-xs font-bold text-white shadow-lg shadow-sky-500/25 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <Spinner className="mr-2" />
                                ) : (
                                    <LogIn className="size-4" />
                                )}
                                <span>Sign In to Candidate Portal</span>
                                <ArrowRight className="size-4 ml-1" />
                            </Button>
                        </div>

                        {/* Sign up prompt */}
                        <div className="pt-3 text-center text-xs font-medium text-slate-600">
                            New candidate preparing for PG entrance?{' '}
                            <TextLink
                                href={register()}
                                tabIndex={5}
                                className="font-bold text-sky-600 hover:text-sky-700 hover:underline"
                            >
                                Register now
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-medium text-emerald-800">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Candidate Login',
    description:
        'Access your postgraduate clinical readiness portal & question bank',
};
