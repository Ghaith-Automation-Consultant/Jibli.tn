import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LegalPage({ title, children }) {
    return (
        <div className="max-w-4xl mx-auto p-6 md:p-12 bg-white my-8 md:my-12 shadow-sm rounded-xl">
            <Link href="/" className="inline-flex items-center text-primary mb-8 hover:underline text-sm font-semibold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'accueil
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-8">{title}</h1>
            <div className="text-neutral-600 space-y-4 leading-relaxed">{children}</div>
        </div>
    );
}

export function LegalHeading({ children }) {
    return <h2 className="text-lg font-bold text-neutral-800 pt-4">{children}</h2>;
}

export function LegalList({ children }) {
    return <ul className="list-disc pl-5 space-y-2">{children}</ul>;
}
