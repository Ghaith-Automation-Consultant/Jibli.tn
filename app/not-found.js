import Link from 'next/link';

export const metadata = { title: 'Page introuvable - Jibli.tn' };

export default function NotFound() {
    return (
        <div className="container mx-auto px-4 max-w-xl py-24 text-center">
            <p className="text-6xl font-extrabold text-primary mb-4">404</p>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Page introuvable</h1>
            <p className="text-neutral-500 text-sm mb-8">
                Cette annonce ou cette page n'existe pas, ou elle a été supprimée.
            </p>
            <div className="flex justify-center gap-3">
                <Link href="/" className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-hover">
                    Retour à l'accueil
                </Link>
                <Link href="/recherche?type=trips" className="px-5 py-2.5 border border-neutral-200 rounded-lg font-bold text-sm text-neutral-700 hover:bg-neutral-100">
                    Voir les voyages
                </Link>
            </div>
        </div>
    );
}
