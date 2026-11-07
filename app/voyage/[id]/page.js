import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '../../../backend/config/db';
import Trip from '../../../backend/models/Trip';
import '../../../backend/models/User'; // registers the model for populate()
import { Plane, MapPin, Calendar, Scale, Ruler, Tag, ShieldCheck, User, MessageSquare, ChevronLeft } from 'lucide-react';
import { averageRating } from '../../../lib/reviews';
import ShareButton from '../../../components/ShareButton';

async function getTripDetails(id) {
    try {
        await connectDB();
        const trip = await Trip.findById(id)
            .populate('user', 'name location avatar bio reviews isIdentityVerified')
            .lean();
        
        if (!trip) return null;
        return JSON.parse(JSON.stringify(trip));
    } catch (e) {
        console.error('Error fetching trip details:', e);
        return null;
    }
}

export default async function TripDetailPage({ params }) {
    const { id } = await params;
    const trip = await getTripDetails(id);

    if (!trip) {
        notFound();
    }

    const travelerName = trip.user?.name || 'Voyageur';
    const rating = averageRating(trip.user?.reviews);

    return (
        <div className="container mx-auto px-4 max-w-5xl py-12">
            {/* Breadcrumb */}
            <div className="mb-8 flex items-center space-x-2 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                <span>/</span>
                <Link href="/recherche?type=trips" className="hover:text-primary transition-colors">Voyages</Link>
                <span>/</span>
                <span className="text-neutral-700 font-bold">{trip.from} → {trip.to}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trip details (Left) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-neutral-200/60 overflow-hidden shadow-md">
                        {/* Trip header banner */}
                        <div className="p-6 md:p-8 bg-gradient-to-r from-primary/5 via-neutral-50/50 to-white border-b border-neutral-100">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div className="flex items-center space-x-3">
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">{trip.from}</h1>
                                    <ArrowIcon />
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">{trip.to}</h1>
                                </div>
                                {trip.user?.isIdentityVerified && (
                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center border border-primary/20">
                                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                        Voyageur Vérifié
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-6 text-neutral-500 text-sm font-semibold">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                                    <span>Départ : {new Date(trip.departureDate).toLocaleDateString('fr-FR')}</span>
                                </div>
                                {trip.arrivalDate && (
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                                        <span>Arrivée estimée : {new Date(trip.arrivalDate).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Logistical details */}
                        <div className="p-6 md:p-8">
                            <h2 className="text-lg font-bold text-neutral-800 mb-6">Détails logistiques</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200/40">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Scale className="w-4.5 h-4.5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Capacité bagages</p>
                                            <p className="font-extrabold text-neutral-800 text-base mt-0.5">{trip.maxWeight} kg max</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-neutral-400 pl-12 font-medium">Pour enveloppes, clés, vêtements, colis</p>
                                </div>

                                <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200/40">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-9 h-9 rounded-full bg-state-success/15 flex items-center justify-center text-state-success">
                                            <Tag className="w-4.5 h-4.5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Tarif proposé</p>
                                            <p className="font-extrabold text-neutral-800 text-base mt-0.5">
                                                {trip.priceType === 'free' ? 'Service Gratuit' : `${trip.price} € / kg`}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-neutral-400 pl-12 font-medium">
                                        {trip.priceType === 'free' ? 'Solidarité ou service symbolique' : 'Commission à négocier'}
                                    </p>
                                </div>
                            </div>

                            {/* Additional info */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-neutral-800 text-sm mb-3">Taille maximale autorisée</h3>
                                    <span className="inline-flex items-center px-3.5 py-1.5 bg-neutral-100 rounded-lg text-neutral-700 text-xs font-bold border border-neutral-200/40">
                                        <Ruler className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                                        Colis de taille {trip.size || 'M'} ({trip.size === 'S' ? 'Petit - ex: Documents' : trip.size === 'M' ? 'Moyen - ex: Vêtements, boîte de chaussures' : 'Grand - ex: Ordinateur'})
                                    </span>
                                </div>

                                <div>
                                    <h3 className="font-bold text-neutral-800 text-sm mb-3">Note du voyageur</h3>
                                    <div className="bg-neutral-50 p-5 rounded-xl text-neutral-600 text-sm leading-relaxed border-l-4 border-primary italic">
                                        "{trip.description || `Je propose de transporter vos objets ou colis lors de mon voyage entre ${trip.from} et ${trip.to} dans la limite de l'espace disponible. N'hésitez pas à me contacter pour échanger sur les détails.`}"
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side action pane (Right) */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-neutral-200/60 p-6 shadow-md space-y-6 sticky top-24">
                        <div className="border-b border-neutral-100 pb-4">
                            <h2 className="font-extrabold text-neutral-800 text-base mb-1">Le voyageur</h2>
                            <p className="text-xs text-neutral-400">
                                {trip.user?.isIdentityVerified ? 'Identité vérifiée' : 'Identité non vérifiée'}
                            </p>
                        </div>

                        {/* User Profile Mini */}
                        <div className="flex gap-4 items-center">
                            <div className="w-14 h-14 rounded-full bg-neutral-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-neutral-200 relative shadow-inner">
                                {trip.user?.avatar ? (
                                    <img src={trip.user.avatar} alt={trip.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 text-neutral-500" />
                                )}
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-state-success border-2 border-white rounded-full" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-neutral-800 text-sm truncate">{travelerName}</h3>
                                <p className="text-xs text-neutral-400 truncate">{trip.user?.location || 'Tunisie / Étranger'}</p>
                                <div className="flex items-center text-xs text-yellow-500 mt-1">
                                    {rating ? (
                                        <>
                                            <span className="font-bold text-neutral-700 mr-1.5">{rating}</span>
                                            {'★'.repeat(Math.round(rating))}
                                        </>
                                    ) : (
                                        <span className="text-neutral-400 font-medium">Pas encore d'avis</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {trip.user?.bio && (
                            <p className="text-xs text-neutral-500 leading-relaxed italic bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                                "{trip.user.bio}"
                            </p>
                        )}

                        <div className="space-y-3 pt-2">
                            <Link
                                href={`/messages?userId=${trip.user?._id || trip.user}`}
                                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-hover font-bold transition-all shadow-md flex items-center justify-center text-sm transform hover:-translate-y-0.5"
                            >
                                <MessageSquare className="w-4.5 h-4.5 mr-2" />
                                Contacter {travelerName}
                            </Link>
                            <ShareButton title={`Voyage ${trip.from} → ${trip.to} sur Jibli.tn`} />
                        </div>

                        <div className="border-t border-neutral-100 pt-4">
                            <div className="flex items-start">
                                <ShieldCheck className="w-5 h-5 text-state-success flex-shrink-0 mr-3 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-xs text-neutral-800">Confiance & Sécurité</h4>
                                    <p className="text-[10px] text-neutral-400 leading-relaxed mt-0.5">
                                        Vérifiez l'identité de votre interlocuteur et le contenu du colis à la remise. Ne réglez aucune commission en ligne à l'avance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArrowIcon() {
    return (
        <svg className="w-5 h-5 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
    );
}
