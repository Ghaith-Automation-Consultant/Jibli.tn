'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { clearLocalSession, refreshSession, safeRedirectPath } from '../../lib/clientApi';

function LoginContent() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const redirectPath = safeRedirectPath(searchParams.get('redirect'));

    useEffect(() => {
        if (localStorage.getItem('jibli_logged_in') !== 'true') return;

        // The local flag alone can't prove a session: protected pages send expired sessions
        // here, and redirecting straight back would loop forever. Check with the server first.
        const resumeSession = async () => {
            const me = await fetch('/api/auth/me').catch(() => null);
            if (me?.ok || await refreshSession()) {
                window.location.replace(redirectPath);
            } else {
                clearLocalSession();
            }
        };
        resumeSession();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Erreur lors de la connexion');
                setLoading(false);
                return;
            }

            // Save login flags
            localStorage.setItem('jibli_logged_in', 'true');
            localStorage.setItem('jibli_user_name', data.user.name);
            
            // Notify layout / navbar listeners
            window.dispatchEvent(new Event('jibli-auth-change'));

            // Full navigation, not router.push: the client router may hold a prefetch of the
            // target made while logged out (a cached redirect back to /login).
            window.location.assign(redirectPath);

        } catch (err) {
            console.error('Login error:', err);
            setError('Une erreur réseau s\'est produite. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white border border-neutral-200/60 rounded-xl p-8 shadow-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
                        Connexion
                    </h2>
                    <p className="text-sm text-neutral-400 mt-2">
                        Accédez à votre espace communautaire Jibli.tn
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-state-error/10 border-l-4 border-state-error text-state-error rounded-r-lg flex items-center space-x-2 text-sm animate-fadeIn">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
                            <input id="email-field"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemple@jibli.tn"
                                className="w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
                            <input id="password-field"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                             type="submit"
                             disabled={loading}
                             className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-md flex items-center justify-center disabled:opacity-50 text-sm"
                        >
                            {loading ? (
                                'Connexion en cours...'
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Se Connecter
                                </>
                            )}
                        </button>
                    </div>

                    <div className="text-center text-sm text-neutral-500 pt-4 border-t border-neutral-100">
                        Pas encore inscrit ?{' '}
                        <Link href="/register" className="text-primary hover:text-primary-hover font-semibold transition-colors">
                            Créer un compte
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
                <div className="text-center text-neutral-400 text-sm">Chargement...</div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}

