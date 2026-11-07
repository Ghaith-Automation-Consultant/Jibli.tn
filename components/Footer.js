'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-neutral-900 text-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <span className="text-2xl font-bold flex items-center bg-white rounded px-2 py-1">
                                <span className="text-identity-tunisian-red">Jibli</span>
                                <span className="text-primary font-bold">.tn</span>
                            </span>
                        </div>
                        <p className="text-neutral-400 text-sm leading-relaxed">
                            La plateforme communautaire de crowd-shipping qui connecte la diaspora tunisienne avec la Tunisie pour le transport d'objets en toute sécurité.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4">Navigation</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
                                    Accueil
                                </Link>
                            </li>
                            <li>
                                <Link href="/recherche?type=trips" className="text-neutral-400 hover:text-white transition-colors">
                                    Voyages
                                </Link>
                            </li>
                            <li>
                                <Link href="/recherche?type=requests" className="text-neutral-400 hover:text-white transition-colors">
                                    Demandes
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-neutral-400 hover:text-white transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4">Légal</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/conditions" className="text-neutral-400 hover:text-white transition-colors">
                                    Conditions d'utilisation
                                </Link>
                            </li>
                            <li>
                                <Link href="/confidentialite" className="text-neutral-400 hover:text-white transition-colors">
                                    Politique de confidentialité
                                </Link>
                            </li>
                            <li>
                                <Link href="/securite" className="text-neutral-400 hover:text-white transition-colors">
                                    Sécurité
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4">Contact</h3>
                        <ul className="space-y-2 text-sm text-neutral-400">
                            <li>contact@jibli.tn</li>
                            <li>Support technique</li>
                            <li>Signalement</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400 text-xs">
                    <p>&copy; {new Date().getFullYear()} Jibli.tn - Tous droits réservés. Créé avec ❤️ pour la communauté tunisienne.</p>
                </div>
            </div>
        </footer>
    );
}
