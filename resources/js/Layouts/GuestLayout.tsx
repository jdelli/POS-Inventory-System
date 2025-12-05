import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                * {
                    box-sizing: border-box;
                }

                .auth-layout {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 1rem;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    position: relative;
                    background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #F0FDFA 100%);
                }

                .auth-bg {
                    position: fixed;
                    inset: 0;
                    overflow: hidden;
                    z-index: 0;
                    pointer-events: none;
                }

                .auth-pattern {
                    position: absolute;
                    inset: 0;
                    background: 
                        radial-gradient(ellipse at 20% 20%, rgba(15, 118, 110, 0.1) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 80%, rgba(13, 148, 136, 0.08) 0%, transparent 50%),
                        radial-gradient(ellipse at 50% 50%, rgba(20, 184, 166, 0.05) 0%, transparent 70%);
                }

                .back-link {
                    position: fixed;
                    top: 1.5rem;
                    left: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #64748B;
                    font-size: 0.875rem;
                    font-weight: 500;
                    text-decoration: none;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    transition: all 0.2s;
                    z-index: 10;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(226, 232, 240, 0.8);
                }

                .back-link:hover {
                    color: #0F766E;
                    background: rgba(240, 253, 250, 0.9);
                    border-color: #99F6E4;
                }

                .auth-container {
                    width: 100%;
                    max-width: 440px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    z-index: 1;
                }

                .auth-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: #0F172A;
                    text-decoration: none;
                    margin-bottom: 1.5rem;
                    transition: transform 0.2s;
                }

                .auth-logo:hover {
                    transform: scale(1.03);
                }

                .auth-logo svg {
                    color: #0F766E;
                    width: 36px;
                    height: 36px;
                }

                .auth-logo span {
                    font-size: 1.625rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                }

                .auth-card {
                    width: 100%;
                    background: white;
                    border-radius: 20px;
                    padding: 2.5rem;
                    box-shadow: 
                        0 1px 3px rgba(0, 0, 0, 0.02),
                        0 8px 24px rgba(0, 0, 0, 0.08),
                        0 0 0 1px rgba(0, 0, 0, 0.03);
                }

                .auth-footer {
                    margin-top: 1.5rem;
                    font-size: 0.75rem;
                    color: #94A3B8;
                }

                /* ===== Form Styles ===== */
                .auth-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #0F172A;
                    margin: 0 0 0.5rem;
                    text-align: center;
                    letter-spacing: -0.02em;
                }

                .auth-subtitle {
                    font-size: 0.9375rem;
                    color: #64748B;
                    margin: 0 0 2rem;
                    text-align: center;
                    line-height: 1.5;
                }

                .form-group {
                    margin-bottom: 1.25rem;
                }

                .form-label {
                    display: block;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }

                .form-input {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    font-size: 0.9375rem;
                    border: 1.5px solid #E2E8F0;
                    border-radius: 12px;
                    background: #FAFBFC;
                    color: #1E293B;
                    transition: all 0.2s ease;
                    font-family: inherit;
                    outline: none;
                }

                .form-input:hover {
                    border-color: #CBD5E1;
                }

                .form-input:focus {
                    border-color: #0F766E;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.1);
                }

                .form-input::placeholder {
                    color: #94A3B8;
                }

                .form-error {
                    font-size: 0.8125rem;
                    color: #DC2626;
                    margin-top: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .form-checkbox-group {
                    display: flex;
                    align-items: center;
                    gap: 0.625rem;
                }

                .form-checkbox {
                    width: 18px;
                    height: 18px;
                    accent-color: #0F766E;
                    cursor: pointer;
                    border-radius: 4px;
                }

                .form-checkbox-label {
                    font-size: 0.875rem;
                    color: #475569;
                    cursor: pointer;
                    user-select: none;
                }

                .btn-primary {
                    width: 100%;
                    padding: 1rem 1.5rem;
                    background: linear-gradient(135deg, #0F766E 0%, #0D9488 100%);
                    color: white;
                    font-size: 0.9375rem;
                    font-weight: 600;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-family: inherit;
                    box-shadow: 0 2px 8px rgba(15, 118, 110, 0.25);
                }

                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(15, 118, 110, 0.35);
                }

                .btn-primary:active:not(:disabled) {
                    transform: translateY(0);
                }

                .btn-primary:disabled {
                    background: #94A3B8;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .form-link {
                    font-size: 0.875rem;
                    color: #0F766E;
                    text-decoration: none;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .form-link:hover {
                    color: #0D9488;
                    text-decoration: underline;
                }

                .status-success {
                    background: #F0FDF4;
                    border: 1px solid #BBF7D0;
                    color: #166534;
                    padding: 0.875rem 1rem;
                    border-radius: 10px;
                    font-size: 0.875rem;
                    margin-bottom: 1.25rem;
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                }

                .status-info {
                    background: #F0FDFA;
                    border: 1px solid #99F6E4;
                    color: #0F766E;
                    padding: 0.875rem 1rem;
                    border-radius: 10px;
                    font-size: 0.875rem;
                    margin-bottom: 1.25rem;
                    line-height: 1.6;
                }

                .credentials-box {
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #E2E8F0;
                }

                .credentials-title {
                    font-size: 0.6875rem;
                    font-weight: 700;
                    color: #64748B;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 0 0 1rem;
                }

                .credential-item {
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 10px;
                    padding: 1rem;
                    margin-bottom: 0.625rem;
                }

                .credential-item.admin {
                    background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
                    border-color: #FDE68A;
                }

                .credential-label {
                    font-size: 0.6875rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #64748B;
                    margin-bottom: 0.5rem;
                }

                .credential-item.admin .credential-label {
                    color: #92400E;
                }

                .credential-value {
                    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
                    font-size: 0.8125rem;
                    color: #1E293B;
                    word-break: break-all;
                }

                .credential-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                }

                .credential-grid > div {
                    min-width: 0;
                }

                details {
                    margin-top: 0.75rem;
                }

                details summary {
                    font-size: 0.8125rem;
                    color: #64748B;
                    cursor: pointer;
                    font-weight: 500;
                    padding: 0.5rem 0;
                    user-select: none;
                    list-style: none;
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                }

                details summary::-webkit-details-marker {
                    display: none;
                }

                details summary::before {
                    content: '▸';
                    display: inline-block;
                    transition: transform 0.2s;
                }

                details[open] summary::before {
                    transform: rotate(90deg);
                }

                details summary:hover {
                    color: #0F766E;
                }

                details > div {
                    margin-top: 0.625rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.375rem;
                }

                @media (max-width: 480px) {
                    .auth-layout {
                        padding: 1rem;
                        justify-content: flex-start;
                        padding-top: 5rem;
                    }

                    .auth-card {
                        padding: 1.75rem;
                        border-radius: 16px;
                    }

                    .back-link {
                        top: 1rem;
                        left: 1rem;
                        padding: 0.375rem 0.75rem;
                        font-size: 0.8125rem;
                    }

                    .auth-title {
                        font-size: 1.5rem;
                    }

                    .credential-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="auth-layout">
                {/* Background Pattern */}
                <div className="auth-bg">
                    <div className="auth-pattern"></div>
                </div>

                {/* Back to Home Link */}
                <Link href="/" className="back-link">
                    <ArrowLeft size={16} />
                    <span>Back to Home</span>
                </Link>

                {/* Auth Container */}
                <div className="auth-container">
                    {/* Logo */}
                    <Link href="/" className="auth-logo">
                        <Shield />
                        <span>SecureTech</span>
                    </Link>

                    {/* Card */}
                    <div className="auth-card">
                        {children}
                    </div>

                    {/* Footer */}
                    <p className="auth-footer">
                        © {new Date().getFullYear()} SecureTech. All rights reserved.
                    </p>
                </div>
            </div>
        </>
    );
}
