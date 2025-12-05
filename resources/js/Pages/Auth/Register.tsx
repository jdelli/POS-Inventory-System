import { FormEventHandler, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock, User, Eye, EyeOff, ChevronRight } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const inputIconStyle = {
        position: 'absolute' as const,
        left: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#94A3B8',
        pointerEvents: 'none' as const
    };

    const eyeButtonStyle = {
        position: 'absolute' as const,
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
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join SecureTech and get started today</p>

            <form onSubmit={submit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="name">Full Name</label>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={inputIconStyle} />
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            className="form-input"
                            style={{ paddingLeft: '44px' }}
                            autoComplete="name"
                            autoFocus
                            placeholder="John Doe"
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                    </div>
                    {errors.name && <p className="form-error">{errors.name}</p>}
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="email">Email Address</label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={inputIconStyle} />
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="form-input"
                            style={{ paddingLeft: '44px' }}
                            autoComplete="username"
                            placeholder="you@example.com"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                    </div>
                    {errors.email && <p className="form-error">{errors.email}</p>}
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="password">Password</label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={inputIconStyle} />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="form-input"
                            style={{ paddingLeft: '44px', paddingRight: '48px' }}
                            autoComplete="new-password"
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={eyeButtonStyle}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && <p className="form-error">{errors.password}</p>}
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="password_confirmation">Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={inputIconStyle} />
                        <input
                            id="password_confirmation"
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="form-input"
                            style={{ paddingLeft: '44px', paddingRight: '48px' }}
                            autoComplete="new-password"
                            placeholder="••••••••"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={eyeButtonStyle}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password_confirmation && <p className="form-error">{errors.password_confirmation}</p>}
                </div>

                <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={processing} 
                    style={{ marginTop: '0.5rem' }}
                >
                    {processing ? 'Creating account...' : 'Create Account'}
                    {!processing && <ChevronRight size={18} />}
                </button>

                <p style={{ 
                    textAlign: 'center', 
                    marginTop: '1.5rem', 
                    fontSize: '0.875rem', 
                    color: '#64748B' 
                }}>
                    Already have an account?{' '}
                    <Link href={route('login')} className="form-link">Sign in</Link>
                </p>
            </form>
        </GuestLayout>
    );
}
