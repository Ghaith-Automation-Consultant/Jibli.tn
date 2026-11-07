'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Shown instead of Next's default English "This page couldn't load" when a page crashes.
export default function Error({ error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="container mx-auto px-4 max-w-xl py-24 text-center">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Une erreur s'est produite</h1>
            <p className="text-neutral-500 text-sm mb-8">
                Cette page n'a pas pu s'afficher. Réessayez dans un instant.
            </p>
            <div className="flex justify-center gap-3">
                <button
                    type="button"
                    onClick={reset}
                    className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-hover"
                >
                    Réessayer
                </button>
                <Link href="/" className="px-5 py-2.5 border border-neutral-200 rounded-lg font-bold text-sm text-neutral-700 hover:bg-neutral-100">
                    Retour à l'accueil
                </Link>
            </div>
        </div>
    );
}
