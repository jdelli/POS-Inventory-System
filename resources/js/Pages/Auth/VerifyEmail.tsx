import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Mail, Send, LogOut, CheckCircle } from 'lucide-react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '72px',
                    height: '72px',
                    background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    boxShadow: '0 4px 14px rgba(15, 118, 110, 0.3)'
                }}>
                    <Mail size={32} color="white" />
                </div>
                <h1 className="auth-title">Verify Your Email</h1>
            </div>

            <div className="status-info">
                Thanks for signing up! Before getting started, please verify your email address by clicking on the link we just sent to you. If you didn't receive the email, we'll gladly send you another.
            </div>

            {status === 'verification-link-sent' && (
                <div className="status-success">
                    <CheckCircle size={18} style={{ flexShrink: 0 }} />
                    <span>A new verification link has been sent to your email address.</span>
                </div>
            )}

            <form onSubmit={submit}>
                <button type="submit" className="btn-primary" disabled={processing}>
                    {processing ? 'Sending...' : 'Resend Verification Email'}
                    {!processing && <Send size={18} />}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="form-link"
                        style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.375rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontSize: '0.875rem'
                        }}
                    >
                        <LogOut size={16} />
                        Log Out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
