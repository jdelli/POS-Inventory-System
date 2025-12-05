import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Mail, Send, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <h1 className="auth-title">Forgot Password?</h1>
            <p className="auth-subtitle">
                No worries! Enter your email address and we'll send you a link to reset your password.
            </p>

            {status && <div className="status-success">{status}</div>}

            <form onSubmit={submit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="email">Email Address</label>
                    <div style={{ position: 'relative' }}>
                        <Mail 
                            size={18} 
                            style={{ 
                                position: 'absolute', 
                                left: '14px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: '#94A3B8',
                                pointerEvents: 'none'
                            }} 
                        />
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="form-input"
                            style={{ paddingLeft: '44px' }}
                            autoFocus
                            placeholder="you@example.com"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                    {errors.email && <p className="form-error">{errors.email}</p>}
                </div>

                <button type="submit" className="btn-primary" disabled={processing}>
                    {processing ? 'Sending...' : 'Send Reset Link'}
                    {!processing && <Send size={18} />}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <Link 
                        href={route('login')} 
                        className="form-link"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                    >
                        <ArrowLeft size={16} />
                        Back to Sign In
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
