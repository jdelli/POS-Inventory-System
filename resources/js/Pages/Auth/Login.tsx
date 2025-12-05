import { FormEventHandler, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react';

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to access your dashboard</p>

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
                            autoComplete="username"
                            autoFocus
                            placeholder="you@example.com"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                    {errors.email && <p className="form-error">{errors.email}</p>}
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="password">Password</label>
                    <div style={{ position: 'relative' }}>
                        <Lock 
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
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="form-input"
                            style={{ paddingLeft: '44px', paddingRight: '48px' }}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#94A3B8',
                                display: 'flex',
                                padding: '4px',
                                borderRadius: '4px',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#64748B'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && <p className="form-error">{errors.password}</p>}
                </div>

                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                }}>
                    <label className="form-checkbox-group">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="form-checkbox"
                        />
                        <span className="form-checkbox-label">Remember me</span>
                    </label>

                    {canResetPassword && (
                        <Link href={route('password.request')} className="form-link">
                            Forgot password?
                        </Link>
                    )}
                </div>

                <button type="submit" className="btn-primary" disabled={processing}>
                    {processing ? 'Signing in...' : 'Sign In'}
                    {!processing && <ChevronRight size={18} />}
                </button>

                <p style={{ 
                    textAlign: 'center', 
                    marginTop: '1.5rem', 
                    fontSize: '0.875rem', 
                    color: '#64748B',
                    margin: '1.5rem 0 0'
                }}>
                    Don't have an account?{' '}
                    <Link href={route('register')} className="form-link">Create one</Link>
                </p>
            </form>

            {/* Demo Credentials */}
            <div className="credentials-box">
                <p className="credentials-title">Demo Credentials</p>
                
                <div className="credential-item admin">
                    <div className="credential-label">Admin Account</div>
                    <div className="credential-grid">
                        <div>
                            <span style={{ fontSize: '0.6875rem', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>Email</span>
                            <div className="credential-value">admin@gmail.com</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.6875rem', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>Password</span>
                            <div className="credential-value">admin12345</div>
                        </div>
                    </div>
                </div>

                <details>
                    <summary>View Branch Accounts</summary>
                    <div>
                        {[
                            { email: 'sanmateo@gmail.com', pass: 'sanmateo12345' },
                            { email: 'cainta@gmail.com', pass: 'cainta12345' },
                            { email: 'pasig@gmail.com', pass: 'pasig12345' },
                            { email: 'makati@gmail.com', pass: 'makati12345' },
                            { email: 'quezoncity@gmail.com', pass: 'quezoncity12345' },
                            { email: 'sjdm@gmail.com', pass: 'sjdm12345' },
                        ].map((cred, idx) => (
                            <div key={idx} className="credential-item" style={{ padding: '0.625rem 0.875rem', marginBottom: '0.375rem' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    flexWrap: 'wrap', 
                                    gap: '0.25rem' 
                                }}>
                                    <span className="credential-value" style={{ fontSize: '0.75rem' }}>{cred.email}</span>
                                    <span style={{ fontSize: '0.6875rem', color: '#64748B', fontFamily: 'inherit' }}>{cred.pass}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </details>
            </div>
        </GuestLayout>
    );
}
