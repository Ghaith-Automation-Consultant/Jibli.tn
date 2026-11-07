import React from 'react';
import Link from 'next/link';
import connectDB from '../backend/config/db';
import Trip from '../backend/models/Trip';
import '../backend/models/User'; // registers the model for populate()
import Request from '../backend/models/Request';
import { Plane, Box, User, ArrowRight, UserPlus, MessageSquare, Compass, ShieldCheck } from 'lucide-react';
import { startOfToday } from '../lib/validation';

// Listings change constantly: render per request rather than freezing them at build time.
export const dynamic = 'force-dynamic';

// Fetch upcoming trips and open requests server-side for performance and SEO
async function getRecentData() {
    try {
        await connectDB();

        const trips = await Trip.find({ status: 'active', departureDate: { $gte: startOfToday() } })
            .sort({ departureDate: 1 })
            .limit(3)
            .populate('user', 'name location avatar')
            .lean();

        const requests = await Request.find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .limit(4)
            .populate('user', 'name location avatar')
            .lean();

        return {
            trips: JSON.parse(JSON.stringify(trips)),
            requests: JSON.parse(JSON.stringify(requests))
        };
    } catch (e) {
        console.error('Error in getRecentData:', e);
        return { trips: [], requests: [] };
    }
}

export default async function HomePage() {
    const { trips, requests } = await getRecentData();

    return (
        <div className="bg-neutral-50 min-h-screen">
            {/* Hero Section */}
            <section className="py-20 md:py-28 bg-gradient-to-r from-primary to-primary-hover text-white shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white bg-[size:20px_20px]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <span className="px-4 py-1.5 rounded-full bg-white/10 text-xs font-bold tracking-wider uppercase inline-block mb-6 border border-white/20">
                            🌍 Plateforme Communautaire de Crowd-shipping
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
                            Transportez ce qui compte <br />
                            <span className="text-accent">entre Tunisiens</span>
                        </h1>
                        <p className="text-lg md:text-xl mb-10 opacity-90 font-medium max-w-2xl mx-auto">
                            La plateforme peer-to-peer qui connecte la diaspora tunisienne avec la Tunisie pour le transport d'objets en toute confiance.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/poster-annonce?type=trip"
                                className="px-8 py-4 bg-white text-primary font-bold rounded-lg shadow-lg hover:bg-neutral-50 hover:shadow-xl transition-all duration-200 flex items-center justify-center transform hover:-translate-y-0.5"
                            >
                                <Plane className="w-5 h-5 mr-2 text-primary" />
                                Publier un voyage
                            </Link>
                            <Link
                                href="/poster-annonce?type=request"
                                className="px-8 py-4 bg-accent text-neutral-900 font-bold rounded-lg shadow-lg hover:bg-accent-hover hover:shadow-xl transition-all duration-200 flex items-center justify-center transform hover:-translate-y-0.5"
                            >
                                <Box className="w-5 h-5 mr-2 text-neutral-900" />
                                Faire une demande
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comment ça marche */}
            <section id="comment-ca-marche" className="py-20 bg-white border-y border-neutral-100">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Comment ça marche ?</h2>
                        <p className="text-neutral-500">Expédiez ou transportez des colis en 3 étapes simples et sécurisées.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                                <UserPlus className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-neutral-800">1. Créez votre compte</h3>
                            <p className="text-neutral-500 leading-relaxed text-sm">
                                Inscrivez-vous gratuitement en quelques clics. Indiquez votre localisation et complétez votre profil.
                            </p>
                        </div>

                        <div className="text-center group">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                                <Compass className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-neutral-800">2. Publiez ou recherchez</h3>
                            <p className="text-neutral-500 leading-relaxed text-sm">
                                Publiez un trajet à venir avec votre espace disponible ou recherchez des objets à faire livrer dans notre annuaire.
                            </p>
                        </div>

                        <div className="text-center group">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                                <MessageSquare className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-neutral-800">3. Échangez en sécurité</h3>
                            <p className="text-neutral-500 leading-relaxed text-sm">
                                Discutez des modalités de remise et du coût du transport via notre messagerie interne cryptée et sécurisée.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Voyages récents */}
            <section className="py-20 bg-neutral-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-neutral-900">Voyages récents</h2>
                            <p className="text-neutral-500 text-sm mt-1">Les derniers trajets enregistrés par nos voyageurs.</p>
                        </div>
                        <Link
                            href="/recherche?type=trips"
                            className="text-primary font-bold hover:text-primary-hover flex items-center transition-colors text-sm"
                        >
                            Voir tous les voyages
                            <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {trips.length === 0 ? (
                            <div className="col-span-full bg-white rounded-xl border border-neutral-200/60 p-12 text-center text-neutral-400 text-sm">
                                Aucun voyage récent disponible pour le moment.
                            </div>
                        ) : (
                            trips.map((trip) => (
                                <div key={trip._id} className="bg-white rounded-xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col justify-between p-6 search-result-card relative">
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${trip.priceType === 'free' ? 'bg-state-success/15 text-state-success' : 'bg-accent/15 text-accent-hover'}`}>
                                                {trip.priceType === 'free' ? 'Gratuit' : 'Payant'}
                                            </span>
                                            <span className="text-xs text-neutral-400 font-medium">
                                                Départ: {new Date(trip.departureDate).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold text-neutral-800">{trip.from}</span>
                                                <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Départ</span>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-neutral-300" />
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold text-neutral-800">{trip.to}</span>
                                                <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Arrivée</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-neutral-100 pt-4 mb-4 flex justify-between text-sm text-neutral-600">
                                            <span>Poids max: <strong className="text-neutral-800">{trip.maxWeight} kg</strong></span>
                                            <span>Taille: <strong className="text-neutral-800">{trip.size || 'M'}</strong></span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-100">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden border border-neutral-200">
                                                <User className="w-4 h-4 text-neutral-500" />
                                            </div>
                                            <span className="text-xs font-semibold text-neutral-700">{trip.user?.name || 'Voyageur'}</span>
                                        </div>
                                        <Link
                                            href={`/voyage/${trip._id}`}
                                            className="px-3.5 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-md text-xs font-bold transition-all duration-200"
                                        >
                                            Contacter
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Demandes récentes */}
            <section className="py-20 bg-white border-t border-neutral-100">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-neutral-900">Demandes récentes</h2>
                            <p className="text-neutral-500 text-sm mt-1">Colis en attente d'expédition vers la Tunisie ou l'étranger.</p>
                        </div>
                        <Link
                            href="/recherche?type=requests"
                            className="text-primary font-bold hover:text-primary-hover flex items-center transition-colors text-sm"
                        >
                            Voir toutes les demandes
                            <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {requests.length === 0 ? (
                            <div className="col-span-full bg-neutral-50 rounded-xl border border-neutral-200/60 p-12 text-center text-neutral-400 text-sm">
                                Aucune demande récente disponible pour le moment.
                            </div>
                        ) : (
                            requests.map((req) => (
                                <div key={req._id} className="bg-white rounded-xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between search-result-card relative">
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold">
                                                {req.item}
                                            </span>
                                            <span className="text-sm font-bold text-state-success">
                                                {req.budget ? `${req.budget} €` : 'À négocier'}
                                            </span>
                                        </div>

                                        <p className="text-sm text-neutral-600 mb-6 leading-relaxed line-clamp-2">
                                            {req.description}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
                                        <div className="flex items-center space-x-4 text-xs text-neutral-500">
                                            <span>Destination: <strong className="text-neutral-800">{req.location}</strong></span>
                                            <span>Poids: <strong className="text-neutral-800">{req.weight || 'N/A'} kg</strong></span>
                                        </div>

                                        <Link
                                            href={`/demande/${req._id}`}
                                            className="px-3.5 py-1.5 bg-primary text-white hover:bg-primary-hover rounded-md text-xs font-bold transition-all duration-200"
                                        >
                                            Proposer un transport
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-neutral-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white opacity-60 bg-[size:30px_30px]" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight">Rejoignez la communauté Jibli.tn</h2>
                    <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
                        Des milliers de Tunisiens font déjà confiance à notre plateforme pour transporter ce qui compte en toute sécurité.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register"
                            className="px-8 py-3.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-lg hover:shadow-xl duration-200"
                        >
                            Créer un compte gratuit
                        </Link>
                        <Link
                            href="/#comment-ca-marche"
                            className="px-8 py-3.5 bg-white text-neutral-900 font-bold rounded-lg hover:bg-neutral-100 transition-colors shadow-lg hover:shadow-xl duration-200"
                        >
                            En savoir plus
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
