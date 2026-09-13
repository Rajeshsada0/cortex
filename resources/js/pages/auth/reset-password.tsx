import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    return (
        <>
            <Head title="Reset password" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="grid gap-4">
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="email"
                                className="text-xs font-bold text-slate-900 dark:text-slate-900"
                            >
                                Medical Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                className="h-11 rounded-xl border border-sky-200/90 bg-slate-100/80 px-3.5 text-xs text-slate-900 transition-all dark:bg-slate-100/80 dark:text-slate-900 dark:border-sky-200/90"
                                readOnly
                            />
                            <InputError
                                message={errors.email}
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="password"
                                className="text-xs font-bold text-slate-900 dark:text-slate-900"
                            >
                                New Password
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                className="h-11 rounded-xl border border-sky-200/90 bg-slate-50/80 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all dark:bg-slate-50/80 dark:text-slate-900 dark:border-sky-200/90 dark:placeholder:text-slate-400"
                                autoFocus
                                placeholder="Minimum 8 characters"
                                passwordrules={passwordRules}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="password_confirmation"
                                className="text-xs font-bold text-slate-900 dark:text-slate-900"
                            >
                                Confirm New Password
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                className="h-11 rounded-xl border border-sky-200/90 bg-slate-50/80 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all dark:bg-slate-50/80 dark:text-slate-900 dark:border-sky-200/90 dark:placeholder:text-slate-400"
                                placeholder="Re-enter new password"
                                passwordrules={passwordRules}
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-[#0284c7] via-[#0284c7] to-[#0ea5e9] text-xs font-bold text-white shadow-lg shadow-sky-500/25 hover:brightness-105 active:scale-[0.99] transition-all"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner className="mr-2" />}
                            Reset Candidate Password
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = {
    title: 'Reset password',
    description: 'Please enter your new password below',
};
