'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Plane, Box, Trash2, ArrowRight, PlusCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../lib/clientApi';

export default function DashboardPage() {
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [tab, setTab] = useState('trips'); // 'trips' or 'requests'
    
    const [trips, setTrips] = useState([]);
    const [requests, setRequests] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Enforce login
        if (localStorage.getItem('jibli_logged_in') !== 'true') {
            router.push('/login?redirect=/dashboard');
            return;
        }

        setUserName(localStorage.getItem('jibli_user_name') || 'Utilisateur');
        loadUserData();
    }, []);

    const loadUserData = async () => {
        setLoading(true);
        setError('');
        try {
            const meResponse = await apiFetch('/api/auth/me');
            if (!meResponse.ok) {
                setError('Impossible d\'authentifier votre session. Veuillez vous reconnecter.');
                return;
            }

            const { user } = await meResponse.json();
            const [tripsRes, requestsRes] = await Promise.all([
                apiFetch(`/api/trips?user=${user.id}&limit=100`),
                apiFetch(`/api/requests?user=${user.id}&limit=100`)
            ]);

            const tripsData = await tripsRes.json();
            const requestsData = await requestsRes.json();

            setTrips(tripsData.data || []);
            setRequests(requestsData.data || []);

        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError('Erreur lors du chargement des données. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTrip = async (id) => {
        if (!confirm('Voulez-vous vraiment supprimer ce voyage ?')) return;

        try {
            const res = await apiFetch(`/api/trips/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTrips(trips.filter(t => t._id !== id));
            } else {
                alert('Erreur lors de la suppression du voyage.');
            }
        } catch (e) {
            console.error('Delete trip error:', e);
        }
    };

    const handleDeleteRequest = async (id) => {
        if (!confirm('Voulez-vous vraiment supprimer cette demande ?')) return;

        try {
            const res = await apiFetch(`/api/requests/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setRequests(requests.filter(r => r._id !== id));
            } else {
                alert('Erreur lors de la suppression de la demande.');
            }
        } catch (e) {
            console.error('Delete request error:', e);
        }
    };

    return (
        <div className="container mx-auto px-4 max-w-6xl py-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 border-b border-neutral-200 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center">
                        <LayoutDashboard className="w-8 h-8 text-primary mr-2" />
                        Dashboard de {userName}
                    </h1>
                    <p className="text-neutral-500 text-sm mt-1">Gérez vos voyages, demandes et propositions en un seul endroit.</p>
                </div>
                <div className="flex space-x-3">
                    <Link
                        href="/poster-annonce?type=trip"
                        className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-sm flex items-center"
                    >
                        <PlusCircle className="w-4 h-4 mr-1.5" />
                        Publier un voyage
                    </Link>
                    <Link
                        href="/poster-annonce?type=request"
                        className="px-4 py-2 bg-accent text-neutral-900 text-xs font-bold rounded-lg hover:bg-accent-hover transition-colors shadow-sm flex items-center"
                    >
                        <PlusCircle className="w-4 h-4 mr-1.5" />
                        Faire une demande
                    </Link>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-state-error/10 border-l-4 border-state-error text-state-error rounded-r-lg flex items-center space-x-2 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-neutral-200 mb-8">
                <button
                    onClick={() => setTab('trips')}
                    className={`px-6 py-3 font-bold border-b-2 transition-all duration-200 text-sm flex items-center focus:outline-none ${
                        tab === 'trips' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                    }`}
                >
                    <Plane className="w-4 h-4 mr-2" />
                    Mes voyages ({trips.length})
                </button>
                <button
                    onClick={() => setTab('requests')}
                    className={`px-6 py-3 font-bold border-b-2 transition-all duration-200 text-sm flex items-center focus:outline-none ${
                        tab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                    }`}
                >
                    <Box className="w-4 h-4 mr-2" />
                    Mes demandes ({requests.length})
                </button>
            </div>

            {/* Content List */}
            {loading ? (
                <div className="bg-white rounded-xl border border-neutral-200/60 p-12 text-center text-neutral-400 text-sm flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    <span>Chargement de vos annonces...</span>
                </div>
            ) : tab === 'trips' ? (
                /* MY TRIPS LIST */
                trips.length === 0 ? (
                    <div className="bg-white rounded-xl border border-neutral-200/60 p-12 text-center text-neutral-400 text-sm">
                        Vous n'avez publié aucun voyage pour le moment.{' '}
                        <Link href="/poster-annonce?type=trip" className="text-primary hover:underline font-semibold">
                            Publiez votre premier trajet !
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                        {trips.map((trip) => (
                            <div key={trip._id} className="bg-white rounded-xl border border-neutral-200/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${trip.priceType === 'free' ? 'bg-state-success/15 text-state-success' : 'bg-accent/15 text-accent-hover'}`}>
                                            {trip.priceType === 'free' ? 'Gratuit' : 'Payant'}
                                        </span>
                                        <span className="text-xs text-neutral-400 font-semibold">
                                            Départ: {new Date(trip.departureDate).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-3 mb-4">
                                        <span className="text-lg font-bold text-neutral-800">{trip.from}</span>
                                        <ArrowRight className="w-4 h-4 text-neutral-300" />
                                        <span className="text-lg font-bold text-neutral-800">{trip.to}</span>
                                    </div>

                                    <div className="flex space-x-4 text-xs text-neutral-500 font-semibold mb-4">
                                        <span>Poids: {trip.maxWeight} kg</span>
                                        <span>Taille: {trip.size || 'M'}</span>
                                    </div>
                                </div>

                                <div className="border-t border-neutral-100 pt-4 flex justify-end">
                                    <button
                                        onClick={() => handleDeleteTrip(trip._id)}
                                        className="px-3 py-1.5 bg-state-error/10 hover:bg-state-error text-state-error hover:text-white rounded-lg text-xs font-bold transition-all duration-200 flex items-center focus:outline-none"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                /* MY REQUESTS LIST */
                requests.length === 0 ? (
                    <div className="bg-white rounded-xl border border-neutral-200/60 p-12 text-center text-neutral-400 text-sm">
                        Vous n'avez publié aucune demande d'expédition pour le moment.{' '}
                        <Link href="/poster-annonce?type=request" className="text-primary hover:underline font-semibold">
                            Faites votre première demande !
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                        {requests.map((req) => (
                            <div key={req._id} className="bg-white rounded-xl border border-neutral-200/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-bold">
                                            {req.item}
                                        </span>
                                        <span className="text-sm font-bold text-state-success">
                                            {req.budget ? `${req.budget} €` : 'À négocier'}
                                        </span>
                                    </div>

                                    <p className="text-xs text-neutral-500 leading-relaxed mb-4 line-clamp-2">
                                        {req.description}
                                    </p>

                                    <div className="flex space-x-4 text-xs text-neutral-400 font-semibold mb-4">
                                        <span>Destination: {req.location}</span>
                                        <span>Poids: {req.weight || 'N/A'} kg</span>
                                    </div>
                                </div>

                                <div className="border-t border-neutral-100 pt-4 flex justify-end">
                                    <button
                                        onClick={() => handleDeleteRequest(req._id)}
                                        className="px-3 py-1.5 bg-state-error/10 hover:bg-state-error text-state-error hover:text-white rounded-lg text-xs font-bold transition-all duration-200 flex items-center focus:outline-none"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
