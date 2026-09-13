// Components
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot password" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
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
                                    autoFocus
                                    placeholder="doctor@institution.org"
                                    className="h-11 rounded-xl border border-sky-200/90 bg-slate-50/80 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all dark:bg-slate-50/80 dark:text-slate-900 dark:border-sky-200/90 dark:placeholder:text-slate-400"
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="my-2 flex items-center justify-start">
                                <Button
                                    className="h-12 w-full rounded-xl bg-gradient-to-r from-[#0284c7] via-[#0284c7] to-[#0ea5e9] text-xs font-bold text-white shadow-lg shadow-sky-500/25 hover:brightness-105 active:scale-[0.99] transition-all"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Email password reset link
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="pt-2 text-center text-xs font-medium text-slate-600">
                    <span>Or, return to </span>
                    <TextLink
                        href={login()}
                        className="font-bold text-sky-600 hover:text-sky-700 hover:underline"
                    >
                        log in
                    </TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Forgot password',
    description: 'Enter your email to receive a password reset link',
};
