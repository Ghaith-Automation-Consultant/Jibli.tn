'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plane, Box, AlertCircle, CheckCircle } from 'lucide-react';
import { apiFetch } from '../../lib/clientApi';

function PosterAnnonceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [formType, setFormType] = useState('trip'); // 'trip' or 'request'
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Form fields - Trip
    const [tripFrom, setTripFrom] = useState('');
    const [tripTo, setTripTo] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [maxWeight, setMaxWeight] = useState('');
    const [size, setSize] = useState('M');
    const [priceType, setPriceType] = useState('free');
    const [price, setPrice] = useState('');

    // Form fields - Request
    const [item, setItem] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [weight, setWeight] = useState('');
    const [budget, setBudget] = useState('');

    useEffect(() => {
        // Enforce login status check
        if (localStorage.getItem('jibli_logged_in') !== 'true') {
            router.push('/login?redirect=/poster-annonce');
            return;
        }

        const type = searchParams.get('type');
        if (type === 'request' || type === 'trip') {
            setFormType(type);
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            let endpoint = '';
            let body = {};

            if (formType === 'trip') {
                endpoint = '/api/trips';
                body = {
                    from: tripFrom,
                    to: tripTo,
                    departureDate,
                    maxWeight: parseFloat(maxWeight),
                    size,
                    priceType,
                    price: priceType === 'paid' ? parseFloat(price) : 0
                };
            } else {
                endpoint = '/api/requests';
                body = {
                    item,
                    description,
                    location,
                    // Optional field: omit when blank, since the API rejects a weight of 0.
                    weight: weight ? parseFloat(weight) : undefined,
                    budget: budget ? parseFloat(budget) : 0
                };
            }

            const res = await apiFetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.details?.join(' ') || data.error || 'Erreur lors de la publication de votre annonce');
                setLoading(false);
                return;
            }

            setSuccess('Annonce publiée avec succès !');
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);

        } catch (err) {
            console.error('Submit error:', err);
            setError('Une erreur réseau s\'est produite. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white border border-neutral-200/60 rounded-xl p-8 shadow-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
                        Publier une annonce
                    </h2>
                    <p className="text-sm text-neutral-400 mt-2">
                        Partagez votre trajet ou décrivez le colis que vous devez envoyer.
                    </p>
                </div>

                {/* Form Select Tabs */}
                <div className="flex bg-neutral-100 rounded-lg p-1.5 mb-8">
                    <button
                        type="button"
                        onClick={() => { setFormType('trip'); setError(''); }}
                        className={`w-1/2 py-2 text-sm font-bold rounded-md transition-all duration-200 flex items-center justify-center ${
                            formType === 'trip' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                    >
                        <Plane className="w-4 h-4 mr-2" />
                        Publier un voyage
                    </button>
                    <button
                        type="button"
                        onClick={() => { setFormType('request'); setError(''); }}
                        className={`w-1/2 py-2 text-sm font-bold rounded-md transition-all duration-200 flex items-center justify-center ${
                            formType === 'request' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                    >
                        <Box className="w-4 h-4 mr-2" />
                        Faire une demande
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-state-error/10 border-l-4 border-state-error text-state-error rounded-r-lg flex items-center space-x-2 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-state-success/10 border-l-4 border-state-success text-state-success rounded-r-lg flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                {formType === 'trip' ? (
                    /* TRIP FORM */
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="tripFrom-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Ville de départ *</label>
                                <input id="tripFrom-field"
                                    type="text"
                                    required
                                    value={tripFrom}
                                    onChange={(e) => setTripFrom(e.target.value)}
                                    placeholder="Ex: Paris"
                                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                                />
                            </div>
                            <div>
                                <label htmlFor="tripTo-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Ville d'arrivée *</label>
                                <input id="tripTo-field"
                                    type="text"
                                    required
                                    value={tripTo}
                                    onChange={(e) => setTripTo(e.target.value)}
                                    placeholder="Ex: Tunis"
                                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="departureDate-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Date de départ *</label>
                                <input id="departureDate-field"
                                    type="date"
                                    required
                                    value={departureDate}
                                    onChange={(e) => setDepartureDate(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                                />
                            </div>
                            <div>
                                <label htmlFor="size-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Taille maximale de colis *</label>
                                <select id="size-field"
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                                >
                                    <option value="S">Petit (S) - ex: Documents, clés</option>
                                    <option value="M">Moyen (M) - ex: Vêtements, boîte de chaussures</option>
                                    <option value="L">Grand (L) - ex: Ordinateur, valise cabine</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="maxWeight-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Poids maximum autorisé (kg) *</label>
                            <input id="maxWeight-field"
                                type="number"
                                required
                                min="0.1"
                                step="0.1"
                                value={maxWeight}
                                onChange={(e) => setMaxWeight(e.target.value)}
                                placeholder="Ex: 10"
                                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                            />
                        </div>

                        <fieldset className="space-y-3">
                            <legend className="block text-neutral-600 text-xs font-bold uppercase tracking-wider">Conditions de tarification</legend>
                            <div className="flex space-x-6">
                                <label htmlFor="priceType-free" className="flex items-center text-sm font-medium text-neutral-700">
                                    <input id="priceType-free"
                                        type="radio"
                                        name="priceType"
                                        value="free"
                                        checked={priceType === 'free'}
                                        onChange={() => setPriceType('free')}
                                        className="mr-2"
                                    />
                                    Service Gratuit
                                </label>
                                <label htmlFor="priceType-paid" className="flex items-center text-sm font-medium text-neutral-700">
                                    <input id="priceType-paid"
                                        type="radio"
                                        name="priceType"
                                        value="paid"
                                        checked={priceType === 'paid'}
                                        onChange={() => setPriceType('paid')}
                                        className="mr-2"
                                    />
                                    Service Payant (Commission)
                                </label>
                            </div>
                        </fieldset>

                        {priceType === 'paid' && (
                            <div className="animate-fadeIn">
                                <label htmlFor="price-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Prix proposé (€ / kg)</label>
                                <input id="price-field"
                                    type="number"
                                    min="1"
                                    step="0.5"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="Ex: 5"
                                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-md disabled:opacity-50 text-sm"
                        >
                            {loading ? 'Publication en cours...' : 'Publier le voyage'}
                        </button>
                    </form>
                ) : (
                    /* REQUEST FORM */
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="item-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Objet à envoyer *</label>
                            <input id="item-field"
                                type="text"
                                required
                                value={item}
                                onChange={(e) => setItem(e.target.value)}
                                placeholder="Ex: Médicaments, Ordinateur Portable..."
                                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                            />
                        </div>

                        <div>
                            <label htmlFor="description-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Description détaillée (Dimensions, nature de l'objet) *</label>
                            <textarea id="description-field"
                                required
                                rows="4"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Décrivez l'objet en précisant s'il est fragile, emballé, ou s'il nécessite des précautions..."
                                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                                <label htmlFor="location-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Lieu de livraison final *</label>
                                <input id="location-field"
                                    type="text"
                                    required
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Ex: Tunis, Sousse, Monastir"
                                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                                />
                            </div>
                            <div>
                                <label htmlFor="weight-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Poids estimé (kg)</label>
                                <input id="weight-field"
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    placeholder="Ex: 1"
                                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="budget-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Budget proposé (€) - optionnel</label>
                            <input id="budget-field"
                                type="number"
                                min="0"
                                step="1"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                placeholder="Laissez vide pour négocier"
                                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-md disabled:opacity-50 text-sm"
                        >
                            {loading ? 'Publication en cours...' : 'Publier la demande'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function PosterAnnoncePage() {
    return (
        <Suspense fallback={
            <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white border border-neutral-200/60 rounded-xl p-8 shadow-md text-center text-neutral-400 text-sm">
                    Chargement...
                </div>
            </div>
        }>
            <PosterAnnonceContent />
        </Suspense>
    );
}
