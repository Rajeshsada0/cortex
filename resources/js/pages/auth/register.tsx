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
import { GraduationCap, ShieldCheck } from 'lucide-react';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Create Candidate Account — Cortex Medical" />

            <div className="mb-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-muted-foreground">
                <span className="font-bold text-foreground block mb-0.5">
                    Target Postgraduate Curriculum
                </span>
                <span>
                    Supports Nepal MECEE-PG, India INI-CET, and USA USMLE Step 1 &amp; 2 CK with instant single-click pathway switching.
                </span>
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
                                <Label htmlFor="name" className="text-xs font-semibold">
                                    Candidate Full Name
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
                                    className="h-10 text-xs"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Email */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold">
                                    Medical Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="doctor@institution.org"
                                    className="h-10 text-xs"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="password" className="text-xs font-semibold">
                                    Create Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Minimum 8 characters"
                                    passwordrules={passwordRules}
                                    className="h-10 text-xs"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Confirm Password */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="password_confirmation" className="text-xs font-semibold">
                                    Confirm Password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Re-enter password"
                                    passwordrules={passwordRules}
                                    className="h-10 text-xs"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full bg-[#102A43] dark:bg-[#55BDEB] text-white dark:text-neutral-950 font-bold hover:opacity-90 shadow-md text-xs"
                                tabIndex={5}
                                data-test="register-user-button"
                                disabled={processing}
                            >
                                {processing && <Spinner className="mr-2" />}
                                Create Candidate Profile
                            </Button>
                        </div>

                        {/* Sign in prompt */}
                        <div className="text-center text-xs text-muted-foreground border-t border-border pt-4">
                            Already registered as a candidate?{' '}
                            <TextLink href={login()} tabIndex={6} className="font-bold text-[#55BDEB] hover:underline">
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
    description: 'Create your postgraduate medical entrance examination account',
};
