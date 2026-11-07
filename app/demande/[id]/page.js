import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '../../../backend/config/db';
import Request from '../../../backend/models/Request';
import '../../../backend/models/User'; // registers the model for populate()
import { Box, MapPin, Calendar, Scale, Tag, ShieldCheck, User, MessageSquare, Info } from 'lucide-react';
import { averageRating } from '../../../lib/reviews';
import ShareButton from '../../../components/ShareButton';

async function getRequestDetails(id) {
    try {
        await connectDB();
        const reqObj = await Request.findById(id)
            .populate('user', 'name location avatar bio reviews isIdentityVerified')
            .lean();
        
        if (!reqObj) return null;
        return JSON.parse(JSON.stringify(reqObj));
    } catch (e) {
        console.error('Error fetching request details:', e);
        return null;
    }
}

export default async function RequestDetailPage({ params }) {
    const { id } = await params;
    const reqObj = await getRequestDetails(id);

    if (!reqObj) {
        notFound();
    }

    const rating = averageRating(reqObj.user?.reviews);

    return (
        <div className="container mx-auto px-4 max-w-5xl py-12">
            {/* Breadcrumb */}
            <div className="mb-8 flex items-center space-x-2 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                <span>/</span>
                <Link href="/recherche?type=requests" className="hover:text-primary transition-colors">Demandes</Link>
                <span>/</span>
                <span className="text-neutral-700 font-bold">{reqObj.item}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Request details (Left) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-neutral-200/60 overflow-hidden shadow-md">
                        {/* Request header banner */}
                        <div className="p-6 md:p-8 bg-gradient-to-r from-primary/5 via-neutral-50/50 to-white border-b border-neutral-100">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">{reqObj.item}</h1>
                                    <div className="flex items-center space-x-2 text-neutral-700 text-sm font-semibold mt-1">
                                        <MapPin className="w-4 h-4 text-primary mr-1" />
                                        <span>Livraison finale : <strong>{reqObj.location}</strong></span>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-accent/20 text-accent-hover rounded-full text-xs font-extrabold flex items-center border border-accent/30">
                                    <Info className="w-3.5 h-3.5 mr-1" />
                                    Expédition Active
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-6 text-neutral-500 text-sm font-semibold">
                                <div className="flex items-center text-red-500">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>Date souhaitée : {reqObj.createdAt ? new Date(reqObj.createdAt).toLocaleDateString('fr-FR') : 'Non spécifiée'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Logistical details */}
                        <div className="p-6 md:p-8">
                            <h2 className="text-lg font-bold text-neutral-800 mb-6">Détails de l'expédition</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200/40">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Scale className="w-4.5 h-4.5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Poids estimé</p>
                                            <p className="font-extrabold text-neutral-800 text-base mt-0.5">{reqObj.weight || 'Non spécifié'} kg</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-neutral-400 pl-12 font-medium">Précisez vos bagages pour le poids</p>
                                </div>

                                <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200/40">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-9 h-9 rounded-full bg-state-success/15 flex items-center justify-center text-state-success">
                                            <Tag className="w-4.5 h-4.5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Budget / Récompense</p>
                                            <p className="font-extrabold text-neutral-800 text-base mt-0.5">
                                                {reqObj.budget ? `${reqObj.budget} €` : 'À négocier'}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-neutral-400 pl-12 font-medium">
                                        {reqObj.budget ? 'Indemnité forfaitaire proposée' : 'Discussion ouverte avec le transporteur'}
                                    </p>
                                </div>
                            </div>

                            {/* Additional info */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-neutral-800 text-sm mb-3">Description de l'objet et dimensions</h3>
                                    <div className="bg-neutral-50 p-5 rounded-xl text-neutral-600 text-sm leading-relaxed border-l-4 border-primary italic">
                                        "{reqObj.description || 'Pas de description détaillée disponible. Veuillez contacter l\'auteur pour plus de précautions sur la nature de cet objet.'}"
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
                            <h2 className="font-extrabold text-neutral-800 text-base mb-1">Auteur de la Demande</h2>
                            <p className="text-xs text-neutral-400">
                                {reqObj.user?.isIdentityVerified ? 'Identité vérifiée' : 'Identité non vérifiée'}
                            </p>
                        </div>

                        {/* User Profile Mini */}
                        <div className="flex gap-4 items-center">
                            <div className="w-14 h-14 rounded-full bg-neutral-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-neutral-200 relative shadow-inner">
                                {reqObj.user?.avatar ? (
                                    <img src={reqObj.user.avatar} alt={reqObj.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 text-neutral-500" />
                                )}
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-state-success border-2 border-white rounded-full" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-neutral-800 text-sm truncate">{reqObj.user?.name || 'Utilisateur'}</h3>
                                <p className="text-xs text-neutral-400 truncate">{reqObj.user?.location || 'Tunisie / Étranger'}</p>
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

                        {reqObj.user?.bio && (
                            <p className="text-xs text-neutral-500 leading-relaxed italic bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                                "{reqObj.user.bio}"
                            </p>
                        )}

                        <div className="space-y-3 pt-2">
                            <Link
                                href={`/messages?userId=${reqObj.user?._id || reqObj.user}`}
                                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-hover font-bold transition-all shadow-md flex items-center justify-center text-sm transform hover:-translate-y-0.5"
                            >
                                <MessageSquare className="w-4.5 h-4.5 mr-2" />
                                Contacter l'Expéditeur
                            </Link>
                            <ShareButton title={`Demande « ${reqObj.item} » sur Jibli.tn`} />
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
