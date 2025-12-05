import { FormEventHandler, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Lock, Eye, EyeOff, ShieldCheck, ChevronRight } from 'lucide-react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

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
                    <ShieldCheck size={32} color="white" />
                </div>
                <h1 className="auth-title">Secure Area</h1>
            </div>

            <div className="status-info">
                This is a secure area of the application. Please confirm your password before continuing.
            </div>

            <form onSubmit={submit}>
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
                            autoFocus
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
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && <p className="form-error">{errors.password}</p>}
                </div>

                <button type="submit" className="btn-primary" disabled={processing}>
                    {processing ? 'Confirming...' : 'Confirm'}
                    {!processing && <ChevronRight size={18} />}
                </button>
            </form>
        </GuestLayout>
    );
}
