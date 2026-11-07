'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, Calendar, Tag, Filter, ShieldCheck, Scale, Ruler, ArrowRight, User, CircleDot, Box } from 'lucide-react';

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Tabs & Basic Filters
    const [searchType, setSearchType] = useState('trips'); // 'trips' or 'requests'
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');
    const [priceType, setPriceType] = useState('');
    const [query, setQuery] = useState('');
    
    // Advanced Filters & Toggle
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [minWeight, setMinWeight] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [size, setSize] = useState('');

    // State for Fetch Results
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ trips: 0, requests: 0, users: 0 });
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });

    // Sync state with URL params on mount
    useEffect(() => {
        const type = searchParams.get('type');
        if (type === 'requests' || type === 'trips') {
            setSearchType(type);
        }
        
        // Load initial stats
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setStats(data);
            })
            .catch(err => console.error('Error loading stats:', err));
    }, [searchParams]);

    // Fetch data whenever filters change
    const fetchData = async (pageNumber = 1) => {
        setLoading(true);
        try {
            let endpoint = '';
            const params = new URLSearchParams();

            if (searchType === 'trips') {
                endpoint = '/api/trips';
                if (from) params.set('from', from);
                if (to) params.set('to', to);
                if (date) params.set('date', date);
                if (priceType) params.set('priceType', priceType);
                if (minWeight) params.set('minWeight', minWeight);
                if (size) params.set('size', size);
            } else {
                endpoint = '/api/requests';
                if (query) params.set('query', query);
                if (to) params.set('location', to); // Map Arrival filter to location for requests
                if (maxBudget) params.set('maxBudget', maxBudget);
            }

            params.set('page', pageNumber.toString());
            params.set('limit', '10');

            const res = await fetch(`${endpoint}?${params.toString()}`);
            const data = await res.json();

            if (data.data) {
                setResults(data.data);
                setPagination(data.pagination);
            } else {
                setResults([]);
                setPagination({ total: 0, page: 1, limit: 10, pages: 1 });
            }
        } catch (e) {
            console.error('Error fetching search results:', e);
            setResults([]);
            setPagination({ total: 0, page: 1, limit: 10, pages: 1 });
        } finally {
            setLoading(false);
        }
    };

    // Trigger fetch on tab switch or filters
    useEffect(() => {
        fetchData(1);
    }, [searchType]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchData(1);
    };

    return (
        <div className="bg-neutral-50 min-h-screen">
            {/* Header Search Section */}
            <section className="bg-gradient-to-r from-primary to-primary-hover py-12 text-white relative">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">
                        Trouvez ce que vous cherchez
                    </h1>
                    <p className="opacity-90 text-sm md:text-base mb-8">
                        Recherchez des trajets de voyageurs ou des demandes de colis selon vos critères.
                    </p>

                    {/* Onglets */}
                    <div className="flex space-x-2 mb-6">
                        <button
                            onClick={() => setSearchType('trips')}
                            className={`px-6 py-3 font-bold rounded-t-lg transition-colors text-sm flex items-center ${
                                searchType === 'trips' ? 'bg-white text-primary' : 'bg-neutral-900/40 text-white hover:bg-neutral-900/60'
                            }`}
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Rechercher un voyage
                        </button>
                        <button
                            onClick={() => setSearchType('requests')}
                            className={`px-6 py-3 font-bold rounded-t-lg transition-colors text-sm flex items-center ${
                                searchType === 'requests' ? 'bg-white text-primary' : 'bg-neutral-900/40 text-white hover:bg-neutral-900/60'
                            }`}
                        >
                            <Box className="w-4 h-4 mr-2" />
                            Rechercher une demande
                        </button>
                    </div>

                    {/* Formulaire Trips */}
                    {searchType === 'trips' ? (
                        <form onSubmit={handleSearchSubmit} className="bg-white rounded-xl p-6 shadow-xl text-neutral-800">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label htmlFor="from-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Départ</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
                                        <input id="from-field"
                                            type="text"
                                            value={from}
                                            onChange={(e) => setFrom(e.target.value)}
                                            placeholder="Ville ou Pays"
                                            className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="to-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Arrivée</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
                                        <input id="to-field"
                                            type="text"
                                            value={to}
                                            onChange={(e) => setTo(e.target.value)}
                                            placeholder="Ville ou Pays"
                                            className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="date-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Date de départ</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
                                        <input id="date-field"
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="priceType-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Type</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
                                        <select id="priceType-field"
                                            value={priceType}
                                            onChange={(e) => setPriceType(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                                        >
                                            <option value="">Tous les types</option>
                                            <option value="free">Gratuit</option>
                                            <option value="paid">Payant</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="text-primary hover:text-primary-hover font-semibold text-sm flex items-center focus:outline-none"
                                >
                                    <Filter className="w-4 h-4 mr-1.5" />
                                    {showAdvanced ? 'Fermer les filtres' : 'Filtres avancés'}
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors text-sm shadow-md"
                                >
                                    Rechercher
                                </button>
                            </div>

                            {/* Filtres Avancés Trips */}
                            {showAdvanced && (
                                <div className="mt-6 p-5 bg-neutral-50 rounded-xl border border-neutral-200/50 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fadeIn">
                                    <div>
                                        <label htmlFor="minWeight-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Poids Minimum (kg)</label>
                                        <div className="relative">
                                            <Scale className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
                                            <input id="minWeight-field"
                                                type="number"
                                                value={minWeight}
                                                onChange={(e) => setMinWeight(e.target.value)}
                                                placeholder="Ex: 5"
                                                className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="size-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Taille maximale</label>
                                        <div className="relative">
                                            <Ruler className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
                                            <select id="size-field"
                                                value={size}
                                                onChange={(e) => setSize(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                                            >
                                                <option value="">Toutes les tailles</option>
                                                <option value="S">Petit (S)</option>
                                                <option value="M">Moyen (M)</option>
                                                <option value="L">Grand (L)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    ) : (
                        /* Formulaire Requests */
                        <form onSubmit={handleSearchSubmit} className="bg-white rounded-xl p-6 shadow-xl text-neutral-800">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="md:col-span-2">
                                    <label htmlFor="query-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Objet Recherché</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
                                        <input id="query-field"
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Ex: Médicaments, électronique, vêtements..."
                                            className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="to-field-2" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Destination</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
                                        <input id="to-field-2"
                                            type="text"
                                            value={to}
                                            onChange={(e) => setTo(e.target.value)}
                                            placeholder="Ville ou Pays"
                                            className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="text-primary hover:text-primary-hover font-semibold text-sm flex items-center focus:outline-none"
                                >
                                    <Filter className="w-4 h-4 mr-1.5" />
                                    {showAdvanced ? 'Fermer les filtres' : 'Filtres avancés'}
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors text-sm shadow-md"
                                >
                                    Rechercher
                                </button>
                            </div>

                            {/* Filtres Avancés Requests */}
                            {showAdvanced && (
                                <div className="mt-6 p-5 bg-neutral-50 rounded-xl border border-neutral-200/50 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fadeIn">
                                    <div>
                                        <label htmlFor="maxBudget-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Budget maximum (€)</label>
                                        <input id="maxBudget-field"
                                            type="number"
                                            value={maxBudget}
                                            onChange={(e) => setMaxBudget(e.target.value)}
                                            placeholder="Ex: 50"
                                            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </section>

            {/* Results Section */}
            <section className="py-12">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col lg:flex-row gap-8">
                        
                        {/* Stats / Help column */}
                        <div className="lg:w-1/4 space-y-6">
                            {/* Fast stats card */}
                            <div className="bg-white rounded-xl border border-neutral-200/60 p-6 shadow-sm">
                                <h3 className="text-base font-bold text-neutral-800 mb-4 flex items-center">
                                    <CircleDot className="w-4 h-4 text-primary mr-1.5" />
                                    Statistiques actives
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-neutral-500">Voyages disponibles:</span>
                                        <strong className="text-neutral-800">{stats.trips}</strong>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-neutral-500">Demandes de colis:</span>
                                        <strong className="text-neutral-800">{stats.requests}</strong>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-neutral-500">Utilisateurs inscrits:</span>
                                        <strong className="text-neutral-800">{stats.users}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Help card */}
                            <div className="bg-primary/5 rounded-xl border border-primary/10 p-6 text-neutral-800">
                                <h3 className="font-bold text-sm text-primary mb-2 flex items-center">
                                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                                    Charte de sécurité
                                </h3>
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                    Pour votre sécurité, vérifiez toujours les bagages ensemble et ne transportez jamais d'objets scellés ou dont vous ignorez la nature exacte.
                                </p>
                            </div>
                        </div>

                        {/* Search Results Main */}
                        <div className="lg:w-3/4">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-neutral-800">
                                    {pagination.total} {searchType === 'trips' ? 'voyages trouvés' : 'demandes trouvées'}
                                </h2>
                            </div>

                            {/* Results list */}
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((n) => (
                                        <div key={n} className="bg-white h-32 rounded-xl border border-neutral-200/60 p-6 animate-pulse" />
                                    ))}
                                </div>
                            ) : results.length === 0 ? (
                                <div className="bg-white rounded-xl border border-neutral-200/60 p-12 text-center text-neutral-400 text-sm">
                                    Aucun résultat correspondant à vos filtres de recherche n'a été trouvé.
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {results.map((item) => (
                                        <div
                                            key={item._id}
                                            className="bg-white rounded-xl border border-neutral-200/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                                        >
                                            {searchType === 'trips' ? (
                                                /* Trip Item Card */
                                                <>
                                                    <div className="flex-grow">
                                                        <div className="flex items-center space-x-2 mb-3">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${item.priceType === 'free' ? 'bg-state-success/15 text-state-success' : 'bg-accent/15 text-accent-hover'}`}>
                                                                {item.priceType === 'free' ? 'Gratuit' : 'Payant'}
                                                            </span>
                                                            <span className="text-xs text-neutral-400 font-medium">
                                                                Départ: {new Date(item.departureDate).toLocaleDateString('fr-FR')}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center space-x-3 mb-4">
                                                            <span className="text-lg font-bold text-neutral-800">{item.from}</span>
                                                            <ArrowRight className="w-4 h-4 text-neutral-300" />
                                                            <span className="text-lg font-bold text-neutral-800">{item.to}</span>
                                                        </div>

                                                        <div className="flex space-x-4 text-xs text-neutral-500 font-medium">
                                                            <span>Poids max: <strong className="text-neutral-700">{item.maxWeight} kg</strong></span>
                                                            <span>Taille: <strong className="text-neutral-700">{item.size || 'M'}</strong></span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-neutral-100 pt-4 md:pt-0 gap-4">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden border border-neutral-200">
                                                                <User className="w-4 h-4 text-neutral-500" />
                                                            </div>
                                                            <span className="text-xs font-bold text-neutral-700">{item.user?.name || 'Voyageur'}</span>
                                                        </div>
                                                        <Link
                                                            href={`/voyage/${item._id}`}
                                                            className="text-xs font-bold text-primary hover:underline"
                                                        >
                                                            Voir les détails
                                                        </Link>
                                                        <Link
                                                            href={`/messages?userId=${item.user?._id || item.user || ''}`}
                                                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover text-xs font-bold transition-colors shadow-sm"
                                                        >
                                                            Contacter le Voyageur
                                                        </Link>
                                                    </div>
                                                </>
                                            ) : (
                                                /* Request Item Card */
                                                <>
                                                    <div className="flex-grow">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-lg font-bold text-neutral-800">{item.item}</span>
                                                            <span className="text-sm font-bold text-state-success">
                                                                {item.budget ? `${item.budget} €` : 'À négocier'}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                                                            {item.description}
                                                        </p>
                                                        <div className="flex space-x-4 text-xs text-neutral-400 font-medium">
                                                            <span>Destination: <strong className="text-neutral-700">{item.location}</strong></span>
                                                            <span>Poids: <strong className="text-neutral-700">{item.weight || 'N/A'} kg</strong></span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-neutral-100 pt-4 md:pt-0 gap-4">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden border border-neutral-200">
                                                                <User className="w-4 h-4 text-neutral-500" />
                                                            </div>
                                                            <span className="text-xs font-bold text-neutral-700">{item.user?.name || 'Demandeur'}</span>
                                                        </div>
                                                        <Link
                                                            href={`/demande/${item._id}`}
                                                            className="text-xs font-bold text-primary hover:underline"
                                                        >
                                                            Voir les détails
                                                        </Link>
                                                        <Link
                                                            href={`/messages?userId=${item.user?._id || item.user || ''}`}
                                                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover text-xs font-bold transition-colors shadow-sm"
                                                        >
                                                            Proposer mon trajet
                                                        </Link>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {pagination.pages > 1 && (
                                <div className="mt-8 bg-white rounded-xl border border-neutral-200/60 p-4 shadow-sm flex justify-between items-center text-sm">
                                    <span className="text-neutral-500">
                                        Page <strong className="text-neutral-800">{pagination.page}</strong> sur <strong className="text-neutral-800">{pagination.pages}</strong>
                                    </span>
                                    <div className="flex space-x-2">
                                        <button
                                            disabled={pagination.page === 1}
                                            onClick={() => fetchData(pagination.page - 1)}
                                            className="px-3.5 py-1.5 border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:pointer-events-none text-xs font-bold"
                                        >
                                            Précédent
                                        </button>
                                        <button
                                            disabled={pagination.page === pagination.pages}
                                            onClick={() => fetchData(pagination.page + 1)}
                                            className="px-3.5 py-1.5 border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:pointer-events-none text-xs font-bold"
                                        >
                                            Suivant
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="bg-neutral-50 min-h-screen py-12 flex items-center justify-center">
                <div className="text-neutral-400 text-sm">Chargement de la recherche...</div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}

