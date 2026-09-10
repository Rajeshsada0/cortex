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
import { Zap, Stethoscope, Shield } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Candidate Log In — Cortex Medical" />

            <PasskeyVerify />

            {/* Quick 1-Click Demo Access Banner */}
            <div className="mb-6 rounded-xl border border-[#55BDEB]/30 bg-[#55BDEB]/10 p-3 text-xs">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <Zap className="size-3.5 text-[#55BDEB]" />
                        <span>Try Instant Demo Account</span>
                    </div>
                    <Link
                        href="/demo-login"
                        className="rounded bg-[#55BDEB] px-2.5 py-1 text-[11px] font-extrabold text-neutral-950 hover:bg-[#55BDEB]/90 transition-colors"
                    >
                        1-Click Login →
                    </Link>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                    Preloaded with MECEE/INI-CET diagnostic attempts, readiness scores, and spaced repetition queues.
                </p>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            {/* Email */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold">
                                    Candidate Medical Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="doctor@hospital.edu / dr.cortex@example.com"
                                    className="h-10 text-xs"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="grid gap-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-semibold">
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs text-[#55BDEB] hover:underline"
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
                                    className="h-10 text-xs"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center space-x-2.5 pt-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember" className="text-xs font-normal text-muted-foreground cursor-pointer">
                                    Keep me logged in on this clinical workstation
                                </Label>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full bg-[#102A43] dark:bg-[#55BDEB] text-white dark:text-neutral-950 font-bold hover:opacity-90 shadow-md text-xs"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                Sign In to Candidate Portal
                            </Button>
                        </div>

                        {/* Sign up prompt */}
                        <div className="text-center text-xs text-muted-foreground border-t border-border pt-4">
                            New candidate preparing for PG entrance?{' '}
                            <TextLink href={register()} tabIndex={5} className="font-bold text-[#55BDEB] hover:underline">
                                Register now
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 rounded-lg bg-green-500/10 p-2.5 text-center text-xs font-medium text-green-600 dark:text-green-400">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Candidate Portal Login',
    description: 'Access your clinical vignettes, spaced repetition queue, and mock exam hall',
};
