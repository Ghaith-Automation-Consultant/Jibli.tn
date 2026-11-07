'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, User, MessageSquare, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Safe access to localStorage on client side
        const loggedIn = localStorage.getItem('jibli_logged_in') === 'true';
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
            setUserName(localStorage.getItem('jibli_user_name') || 'Utilisateur');
        }

        // Event listener to react to login/logout changes dynamically
        const handleAuthChange = () => {
            const status = localStorage.getItem('jibli_logged_in') === 'true';
            setIsLoggedIn(status);
            if (status) {
                setUserName(localStorage.getItem('jibli_user_name') || 'Utilisateur');
            }
        };

        window.addEventListener('storage', handleAuthChange);
        window.addEventListener('jibli-auth-change', handleAuthChange);
        return () => {
            window.removeEventListener('storage', handleAuthChange);
            window.removeEventListener('jibli-auth-change', handleAuthChange);
        };
    }, []);

    const handleLogout = async () => {
        localStorage.removeItem('jibli_logged_in');
        localStorage.removeItem('jibli_user_name');
        setIsLoggedIn(false);
        setUserDropdownOpen(false);

        // Notify storage listeners
        window.dispatchEvent(new Event('jibli-auth-change'));

        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error('Logout error:', e);
        }
        router.push('/');
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <nav className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <Link href="/" className="flex items-center">
                            <span className="text-2xl font-bold text-primary flex items-center">
                                <span className="text-identity-tunisian-red">Jibli</span>.tn
                            </span>
                        </Link>
                    </div>

                    {/* Navigation principale */}
                    <div className="hidden md:flex space-x-8">
                        <Link href="/" className="text-neutral-500 hover:text-primary font-medium transition-colors">
                            Accueil
                        </Link>
                        <Link href="/recherche?type=trips" className="text-neutral-500 hover:text-primary font-medium transition-colors">
                            Voyages
                        </Link>
                        <Link href="/recherche?type=requests" className="text-neutral-500 hover:text-primary font-medium transition-colors">
                            Demandes
                        </Link>
                        {isLoggedIn && (
                            <Link href="/dashboard" className="text-neutral-500 hover:text-primary font-medium transition-colors">
                                Dashboard
                            </Link>
                        )}
                        <Link href="/#comment-ca-marche" className="text-neutral-500 hover:text-primary font-medium transition-colors">
                            Comment ça marche
                        </Link>
                    </div>

                    {/* Actions utilisateur */}
                    <div className="flex items-center space-x-4">
                        {/* Boutons auth ou Menu utilisateur */}
                        {!isLoggedIn ? (
                            <div className="flex space-x-3">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors text-sm font-semibold"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors text-sm font-semibold"
                                >
                                    Inscription
                                </Link>
                            </div>
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    aria-expanded={userDropdownOpen}
                                    className="flex items-center space-x-2 focus:outline-none"
                                >
                                    <div className="w-9 h-9 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden border border-neutral-200 shadow-sm">
                                        <User className="w-5 h-5 text-neutral-500" />
                                    </div>
                                    <span className="hidden sm:inline text-neutral-700 font-semibold text-sm">{userName}</span>
                                </button>

                                {userDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-neutral-200 py-1 z-50">
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center px-4 py-2.5 hover:bg-neutral-100 transition-colors text-neutral-700 text-sm"
                                        >
                                            <LayoutDashboard className="w-4 h-4 mr-2 text-neutral-400" />
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/profile"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center px-4 py-2.5 hover:bg-neutral-100 transition-colors text-neutral-700 text-sm"
                                        >
                                            <User className="w-4 h-4 mr-2 text-neutral-400" />
                                            Mon profil
                                        </Link>
                                        <Link
                                            href="/messages"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center px-4 py-2.5 hover:bg-neutral-100 transition-colors text-neutral-700 text-sm"
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2 text-neutral-400" />
                                            Messages
                                        </Link>
                                        <hr className="border-neutral-100 my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2.5 text-error hover:bg-neutral-100 transition-colors text-left text-sm"
                                        >
                                            <LogOut className="w-4 h-4 mr-2 text-error" />
                                            Déconnexion
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bouton menu mobile */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Menu"
                            aria-expanded={mobileMenuOpen}
                            className="md:hidden text-neutral-500 p-1 hover:text-primary transition-colors focus:outline-none"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Dropdown menu mobile */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pt-4 border-t border-neutral-200 space-y-2">
                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-neutral-600 hover:text-primary py-2 font-medium"
                        >
                            Accueil
                        </Link>
                        <Link
                            href="/recherche?type=trips"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-neutral-600 hover:text-primary py-2 font-medium"
                        >
                            Voyages
                        </Link>
                        <Link
                            href="/recherche?type=requests"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-neutral-600 hover:text-primary py-2 font-medium"
                        >
                            Demandes
                        </Link>
                        {isLoggedIn && (
                            <Link
                                href="/dashboard"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-neutral-600 hover:text-primary py-2 font-medium"
                            >
                                Dashboard
                            </Link>
                        )}
                        <Link
                            href="/#comment-ca-marche"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-neutral-600 hover:text-primary py-2 font-medium"
                        >
                            Comment ça marche
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    );
}
