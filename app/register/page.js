'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, UserPlus, AlertCircle, Info } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('jibli_logged_in') === 'true') {
            router.push('/dashboard');
        }
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.details?.join(' ') || data.error || 'Erreur lors de la création de votre compte');
                setLoading(false);
                return;
            }

            setSuccess('Compte créé avec succès ! Redirection vers la page de connexion...');
            setTimeout(() => {
                router.push('/login');
            }, 2500);

        } catch (err) {
            console.error('Registration error:', err);
            setError('Une erreur réseau s\'est produite. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white border border-neutral-200/60 rounded-xl p-8 shadow-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
                        Inscription
                    </h2>
                    <p className="text-sm text-neutral-400 mt-2">
                        Rejoignez la communauté Jibli.tn
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-state-error/10 border-l-4 border-state-error text-state-error rounded-r-lg flex items-center space-x-2 text-sm animate-fadeIn">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-state-success/10 border-l-4 border-state-success text-state-success rounded-r-lg flex items-center space-x-2 text-sm animate-fadeIn">
                        <Info className="w-5 h-5 flex-shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label htmlFor="name-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Nom complet / Pseudo</label>
                        <input id="name-field"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Mohamed Ben Ali"
                            className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                        />
                    </div>

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
                        <span className="text-[10px] text-neutral-400 mt-1 block">
                            Min. 12 car., 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial.
                        </span>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Confirmer le mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
                            <input id="confirmPassword-field"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                'Inscription en cours...'
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Créer mon compte
                                </>
                            )}
                        </button>
                    </div>

                    <div className="text-center text-sm text-neutral-500 pt-4 border-t border-neutral-100">
                        Déjà inscrit ?{' '}
                        <Link href="/login" className="text-primary hover:text-primary-hover font-semibold transition-colors">
                            Se connecter
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
