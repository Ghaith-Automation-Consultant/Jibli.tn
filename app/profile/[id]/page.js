import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '../../../backend/config/db';
import User from '../../../backend/models/User';
import Trip from '../../../backend/models/Trip';
import { User as UserIcon, Calendar, ShieldCheck, MapPin, Globe, Star, MessageSquare, ArrowRight, Check } from 'lucide-react';
import { averageRating } from '../../../lib/reviews';

async function getPublicProfileData(id) {
    try {
        await connectDB();
        const targetUser = await User.findById(id)
            .select('name location avatar bio languages reviews isEmailVerified isPhoneVerified isIdentityVerified createdAt')
            .lean();
        
        if (!targetUser) return null;

        // Fetch user's active trips
        const trips = await Trip.find({ user: id, status: 'active' })
            .sort({ departureDate: 1 })
            .limit(10)
            .lean();

        return {
            user: JSON.parse(JSON.stringify(targetUser)),
            trips: JSON.parse(JSON.stringify(trips))
        };
    } catch (e) {
        console.error('Error fetching public profile:', e);
        return null;
    }
}

export default async function PublicProfilePage({ params }) {
    const { id } = await params;
    const data = await getPublicProfileData(id);

    if (!data) {
        notFound();
    }

    const { user, trips } = data;
    
    const avgRating = averageRating(user.reviews) ?? '—';

    const joinYear = user.createdAt ? new Date(user.createdAt).getFullYear() : '2026';

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            {/* Header Profil Public */}
            <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 md:p-8 mb-8 shadow-md">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                    {/* Avatar */}
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-neutral-50 shadow-md shrink-0 flex items-center justify-center bg-neutral-100 relative">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-12 h-12 text-neutral-400" />
                        )}
                        <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-state-success border-2 border-white rounded-full" />
                    </div>

                    {/* Basic Infos */}
                    <div className="flex-grow text-center md:text-left min-w-0">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">{user.name}</h1>
                        <p className="text-xs text-neutral-400 font-semibold mb-4 flex items-center justify-center md:justify-start">
                            <Calendar className="w-4 h-4 mr-1.5 text-neutral-400" />
                            Membre depuis {joinYear}
                        </p>

                        {/* Verified Badges */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                            {user.isEmailVerified && (
                                <span className="px-3 py-1 bg-state-success/10 text-state-success rounded-full text-xs font-bold flex items-center border border-state-success/20">
                                    <Check className="w-3.5 h-3.5 mr-1" /> Email Vérifié
                                </span>
                            )}
                            {user.isPhoneVerified && (
                                <span className="px-3 py-1 bg-state-success/10 text-state-success rounded-full text-xs font-bold flex items-center border border-state-success/20">
                                    <Check className="w-3.5 h-3.5 mr-1" /> Tél Vérifié
                                </span>
                            )}
                            {user.isIdentityVerified && (
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center border border-primary/20">
                                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Identité Vérifiée
                                </span>
                            )}
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="flex justify-center md:justify-start gap-8 border-t border-neutral-100 pt-5 mt-5">
                            <div className="text-center">
                                <span className="block text-xl md:text-2xl font-extrabold text-neutral-800">{trips.length}</span>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5 block">Voyages</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xl md:text-2xl font-extrabold text-neutral-800">{user.reviews?.length || 0}</span>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5 block">Avis</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xl md:text-2xl font-extrabold text-yellow-500 flex items-center justify-center">
                                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 mr-1" />
                                    {avgRating}
                                </span>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5 block">Note</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Side: About & Meta */}
                <div className="space-y-6 md:col-span-1">
                    <div className="bg-white rounded-xl border border-neutral-200/60 p-6 shadow-sm space-y-6">
                        <div>
                            <h3 className="font-extrabold text-neutral-800 text-sm mb-3 uppercase tracking-wider">À propos</h3>
                            <p className="text-xs text-neutral-500 leading-relaxed italic bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                "{user.bio || 'Cet utilisateur n\'a pas encore rédigé de biographie.'}"
                            </p>
                        </div>

                        <div className="border-t border-neutral-100 pt-4">
                            <h3 className="font-extrabold text-neutral-800 text-sm mb-3 uppercase tracking-wider">Langues parlées</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {user.languages && user.languages.length > 0 ? (
                                    user.languages.map((l, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-neutral-100 rounded text-xs font-semibold text-neutral-600 border border-neutral-200/40 flex items-center">
                                            <Globe className="w-3 h-3 mr-1 text-neutral-500" />
                                            {l}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-neutral-400">Non spécifié</span>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-neutral-100 pt-4">
                            <h3 className="font-extrabold text-neutral-800 text-sm mb-1 uppercase tracking-wider">Localisation</h3>
                            <p className="text-xs text-neutral-600 font-semibold flex items-center mt-1">
                                <MapPin className="w-4 h-4 mr-1 text-primary" />
                                {user.location || 'Tunisie / Étranger'}
                            </p>
                        </div>

                        <div className="pt-2">
                            <Link
                                href={`/messages?userId=${user._id || user.id}`}
                                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-hover font-bold transition-all shadow-md flex items-center justify-center text-sm transform hover:-translate-y-0.5"
                            >
                                <MessageSquare className="w-4.5 h-4.5 mr-2" />
                                Envoyer un message
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Side: Avis & Dynamic Trips Lists */}
                <div className="md:col-span-2 space-y-8">
                    {/* Active Trips Listings */}
                    <div className="bg-white rounded-xl border border-neutral-200/60 p-6 shadow-sm">
                        <h3 className="font-extrabold text-neutral-800 text-sm mb-6 uppercase tracking-wider">Voyages planifiés</h3>
                        {trips.length === 0 ? (
                            <p className="text-center text-neutral-400 text-xs py-8">Aucun voyage planifié actif pour le moment.</p>
                        ) : (
                            <div className="space-y-4">
                                {trips.map((trip) => (
                                    <div
                                        key={trip._id}
                                        className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/50 hover:border-primary/30 transition-colors flex justify-between items-center gap-4"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${trip.priceType === 'free' ? 'bg-state-success/15 text-state-success' : 'bg-accent/15 text-accent-hover'}`}>
                                                    {trip.priceType === 'free' ? 'Gratuit' : 'Payant'}
                                                </span>
                                                <span className="text-[10px] text-neutral-400 font-semibold">
                                                    Départ: {new Date(trip.departureDate).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2.5">
                                                <span className="text-sm font-bold text-neutral-800">{trip.from}</span>
                                                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                                                <span className="text-sm font-bold text-neutral-800">{trip.to}</span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/voyage/${trip._id}`}
                                            className="px-3 py-1.5 bg-white border border-neutral-200 hover:border-primary hover:text-primary rounded-lg text-xs font-bold transition-all shrink-0 shadow-sm"
                                        >
                                            Voir Détails
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reviews list */}
                    <div className="bg-white rounded-xl border border-neutral-200/60 p-6 shadow-sm">
                        <h3 className="font-extrabold text-neutral-800 text-sm mb-6 uppercase tracking-wider">Commentaires récents</h3>
                        {!user.reviews || user.reviews.length === 0 ? (
                            <p className="text-center text-neutral-400 text-xs py-8">Cet utilisateur n'a pas encore reçu de commentaires.</p>
                        ) : (
                            <div className="space-y-4 divide-y divide-neutral-100">
                                {user.reviews.map((rev, index) => (
                                    <div key={index} className={`pt-4 ${index === 0 ? 'pt-0' : ''}`}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-neutral-800 text-xs">{rev.authorName || 'Utilisateur anonyme'}</h4>
                                            <span className="text-[10px] text-neutral-400 font-semibold">{new Date(rev.createdAt).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                        <div className="flex text-yellow-500 text-[10px] mb-2">
                                            {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                                        </div>
                                        <p className="text-xs text-neutral-500 leading-relaxed italic">"{rev.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
