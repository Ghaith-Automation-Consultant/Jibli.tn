'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Shield, CheckCircle, Star, Settings, Camera, Mail, Phone, MapPin, Globe, AlertCircle, Check } from 'lucide-react';
import { apiFetch } from '../../lib/clientApi';
import { averageRating } from '../../lib/reviews';

export default function ProfileSettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('info');
    
    // User profile state
    const [userId, setUserId] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');
    const [languages, setLanguages] = useState([]);
    
    // Stats
    const [rating, setRating] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [joinDate, setJoinDate] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [isIdentityVerified, setIsIdentityVerified] = useState(false);

    // Form status state
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Security Form state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        if (localStorage.getItem('jibli_logged_in') !== 'true') {
            router.push('/login?redirect=/profile');
            return;
        }
        loadUserData();
    }, []);

    const loadUserData = async () => {
        setLoading(true);
        setError('');
        try {
            // Get me data
            const meRes = await apiFetch('/api/auth/me');
            if (!meRes.ok) {
                setError('Impossible d\'authentifier votre session.');
                setLoading(false);
                return;
            }

            const meData = await meRes.json();
            const meUser = meData.user;
            
            // Fetch complete profile details from user GET by id
            const profileRes = await apiFetch(`/api/users/${meUser.id || meUser._id}`);
            if (!profileRes.ok) {
                setError('Erreur lors de la récupération des détails du profil.');
                setLoading(false);
                return;
            }

            const data = await profileRes.json();
            setUserId(data._id || data.id);
            setName(data.name || '');
            setEmail(data.email || '');
            setPhone(data.phone || '');
            setLocation(data.location || '');
            setBio(data.bio || '');
            setAvatar(data.avatar || '');
            setLanguages(data.languages || []);
            setReviews(data.reviews || []);
            setJoinDate(data.createdAt ? new Date(data.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : '2024');
            setIsEmailVerified(data.isEmailVerified || false);
            setIsPhoneVerified(data.isPhoneVerified || false);
            setIsIdentityVerified(data.isIdentityVerified || false);
            setRating(averageRating(data.reviews));

        } catch (e) {
            console.error('Error loading profile:', e);
            setError('Une erreur réseau s\'est produite. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const res = await apiFetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    location,
                    bio,
                    phone,
                    languages,
                    avatar
                })
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                setError(data?.details?.join(' ') || data?.error || 'Erreur lors de l\'enregistrement de votre profil');
                setSaving(false);
                return;
            }

            // Sync with local storage user name
            localStorage.setItem('jibli_user_name', data.name);
            window.dispatchEvent(new Event('jibli-auth-change'));

            setSuccess('Votre profil a été mis à jour avec succès !');
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            console.error('Update profile error:', err);
            setError('Une erreur réseau s\'est produite. Veuillez réessayer.');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        
        if (!oldPassword || !newPassword) {
            setPasswordError('Veuillez remplir tous les champs.');
            return;
        }

        setPasswordLoading(true);

        try {
            const res = await apiFetch('/api/auth/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPassword, newPassword })
            });
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                setPasswordError(data?.details?.join(' ') || data?.error || 'Le mot de passe n\'a pas pu être modifié.');
                return;
            }

            setPasswordSuccess('Mot de passe mis à jour avec succès !');
            setOldPassword('');
            setNewPassword('');
            setTimeout(() => setPasswordSuccess(''), 3000);

        } catch (err) {
            setPasswordError('Une erreur s\'est produite lors du changement de mot de passe.');
        } finally {
            setPasswordLoading(false);
        }
    };

    const toggleLanguage = (lang) => {
        if (languages.includes(lang)) {
            setLanguages(languages.filter(l => l !== lang));
        } else {
            setLanguages([...languages, lang]);
        }
    };

    const handleAvatarUpload = () => {
        const url = prompt('Entrez l\'URL de votre nouvelle photo de profil :');
        if (url) {
            setAvatar(url);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 max-w-6xl py-20 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-neutral-400 text-sm font-semibold">Chargement de votre profil...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Left sidebar info card */}
                <aside className="space-y-6 lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 text-center shadow-sm">
                        <div className="relative inline-block mb-4">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto bg-neutral-100 flex items-center justify-center relative">
                                {avatar ? (
                                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-neutral-400" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleAvatarUpload}
                                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md text-neutral-600 hover:text-primary transition border border-neutral-200"
                                title="Modifier la photo"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>

                        <h2 className="text-xl font-bold text-neutral-800 tracking-tight">{name}</h2>
                        <p className="text-xs text-neutral-400 mt-1 font-semibold">Membre depuis {joinDate || 'Mai 2026'}</p>

                        <div className="flex items-center justify-center gap-2 mt-3 text-sm">
                            <span className="flex items-center text-yellow-500 font-bold">
                                <Star className="w-4 h-4 mr-1 fill-yellow-500 text-yellow-500" /> {rating ?? '—'}
                            </span>
                            <span className="text-neutral-300">|</span>
                            <span className="text-neutral-500 font-medium">{reviews.length} avis reçu{reviews.length > 1 ? 's' : ''}</span>
                        </div>

                        {/* Badges indicators */}
                        <div className="flex flex-wrap justify-center gap-1.5 mt-5">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold flex items-center ${isEmailVerified ? 'bg-state-success/10 text-state-success' : 'bg-neutral-100 text-neutral-400'}`}>
                                <Check className="w-3 h-3 mr-1" /> Email
                            </span>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold flex items-center ${isPhoneVerified ? 'bg-state-success/10 text-state-success' : 'bg-neutral-100 text-neutral-400'}`}>
                                <Check className="w-3 h-3 mr-1" /> Tél
                            </span>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold flex items-center ${isIdentityVerified ? 'bg-state-success/10 text-state-success' : 'bg-neutral-100 text-neutral-400'}`}>
                                <Check className="w-3 h-3 mr-1" /> ID
                            </span>
                        </div>
                    </div>

                    {/* Navigation sidebar buttons */}
                    <nav className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden shadow-sm flex flex-col">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`w-full text-left px-5 py-4 transition flex items-center text-sm font-bold border-l-4 ${
                                activeTab === 'info' ? 'bg-primary/5 text-primary border-primary' : 'text-neutral-500 hover:bg-neutral-50 border-transparent'
                            }`}
                        >
                            <User className="w-4.5 h-4.5 mr-3 flex-shrink-0" />
                            Informations personnelles
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full text-left px-5 py-4 transition flex items-center text-sm font-bold border-l-4 border-t border-neutral-100 ${
                                activeTab === 'security' ? 'bg-primary/5 text-primary border-primary' : 'text-neutral-500 hover:bg-neutral-50 border-transparent'
                            }`}
                        >
                            <Shield className="w-4.5 h-4.5 mr-3 flex-shrink-0" />
                            Sécurité & Connexion
                        </button>
                        <button
                            onClick={() => setActiveTab('verification')}
                            className={`w-full text-left px-5 py-4 transition flex items-center text-sm font-bold border-l-4 border-t border-neutral-100 ${
                                activeTab === 'verification' ? 'bg-primary/5 text-primary border-primary' : 'text-neutral-500 hover:bg-neutral-50 border-transparent'
                            }`}
                        >
                            <CheckCircle className="w-4.5 h-4.5 mr-3 flex-shrink-0" />
                            Vérifications
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`w-full text-left px-5 py-4 transition flex items-center text-sm font-bold border-l-4 border-t border-neutral-100 ${
                                activeTab === 'reviews' ? 'bg-primary/5 text-primary border-primary' : 'text-neutral-500 hover:bg-neutral-50 border-transparent'
                            }`}
                        >
                            <Star className="w-4.5 h-4.5 mr-3 flex-shrink-0" />
                            Avis & Évaluations
                        </button>
                    </nav>
                </aside>

                {/* Right content layout */}
                <div className="lg:col-span-3 space-y-6">
                    {error && (
                        <div className="p-4 bg-state-error/10 border-l-4 border-state-error text-state-error rounded-r-lg flex items-center space-x-2 text-sm animate-fadeIn">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-state-success/15 border-l-4 border-state-success text-state-success rounded-r-lg flex items-center space-x-2 text-sm animate-fadeIn">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* TAB PANEL: INFO */}
                    {activeTab === 'info' && (
                        <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 md:p-8 shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-neutral-100 pb-4">
                                <div>
                                    <h1 className="text-xl font-extrabold text-neutral-800 tracking-tight">Informations Personnelles</h1>
                                    <p className="text-xs text-neutral-400 mt-0.5">Mettez à jour vos coordonnées et détails de contact.</p>
                                </div>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover shadow-md transition disabled:opacity-50 text-sm flex-shrink-0"
                                >
                                    {saving ? 'Enregistrement...' : 'Sauvegarder'}
                                </button>
                            </div>

                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Nom complet / Pseudo</label>
                                        <input id="name-field"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email-field" className="block text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">Adresse Email</label>
                                        <input id="email-field"
                                            type="email"
                                            value={email}
                                            disabled
                                            className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-400 text-sm cursor-not-allowed"
                                        />
                                        <span className="text-[10px] text-neutral-400 mt-1 block">L'email ne peut pas être modifié.</span>
                                    </div>
                                    <div>
                                        <label htmlFor="phone-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Numéro de téléphone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
                                            <input id="phone-field"
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+216 20 123 456"
                                                className="w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="location-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Ville de résidence</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-neutral-400 w-4 h-4" />
                                            <input id="location-field"
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="Tunis, Sousse, Paris..."
                                                className="w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="bio-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Bio / Présentation</label>
                                    <textarea id="bio-field"
                                        maxLength={500}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows="4"
                                        placeholder="Présentez-vous à la communauté (vos trajets fréquents, vos habitudes d'expédition, etc.)"
                                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                                    />
                                    <div className="text-[10px] text-neutral-400 text-right mt-1">{bio.length}/500 caractères</div>
                                </div>

                                <div>
                                    <span id="languages-label" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-3">Langues parlées</span>
                                    <div role="group" aria-labelledby="languages-label" className="flex flex-wrap gap-2.5">
                                        {['Français', 'Arabe', 'Anglais', 'Italien', 'Allemand'].map((lang) => {
                                            const isSelected = languages.includes(lang);
                                            return (
                                                <button
                                                    type="button"
                                                    key={lang}
                                                    aria-pressed={isSelected}
                                                    onClick={() => toggleLanguage(lang)}
                                                    className={`px-4 py-2 rounded-full border text-xs font-bold transition flex items-center ${
                                                        isSelected ? 'bg-primary border-primary text-white shadow-sm' : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                                                    }`}
                                                >
                                                    <Globe className="w-3.5 h-3.5 mr-1.5" />
                                                    {lang}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB PANEL: SECURITY */}
                    {activeTab === 'security' && (
                        <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 md:p-8 shadow-sm">
                            <div className="border-b border-neutral-100 pb-4 mb-6">
                                <h1 className="text-xl font-extrabold text-neutral-800 tracking-tight">Sécurité & Connexion</h1>
                                <p className="text-xs text-neutral-400 mt-0.5">Modifiez votre mot de passe pour sécuriser votre compte.</p>
                            </div>

                            {passwordError && (
                                <div className="mb-4 p-4 bg-state-error/10 border-l-4 border-state-error text-state-error rounded-r-lg flex items-center space-x-2 text-sm">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span>{passwordError}</span>
                                </div>
                            )}
                            {passwordSuccess && (
                                <div className="mb-4 p-4 bg-state-success/15 border-l-4 border-state-success text-state-success rounded-r-lg flex items-center space-x-2 text-sm">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                    <span>{passwordSuccess}</span>
                                </div>
                            )}

                            <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                                <div>
                                    <label htmlFor="oldPassword-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Ancien mot de passe</label>
                                    <input id="oldPassword-field"
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newPassword-field" className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">Nouveau mot de passe</label>
                                    <input id="newPassword-field"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm text-neutral-800"
                                    />
                                    <span className="text-[10px] text-neutral-400 mt-1 block">Choisissez un mot de passe sécurisé à 12 caractères minimum.</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="px-6 py-2.5 bg-neutral-900 text-white font-bold rounded-lg hover:bg-black transition text-sm disabled:opacity-50 shadow-md"
                                >
                                    {passwordLoading ? 'Mise à jour en cours...' : 'Mettre à jour'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* TAB PANEL: VERIFICATION */}
                    {activeTab === 'verification' && (
                        <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 md:p-8 shadow-sm">
                            <div className="border-b border-neutral-100 pb-4 mb-6">
                                <h1 className="text-xl font-extrabold text-neutral-800 tracking-tight">Statut des Vérifications</h1>
                                <p className="text-xs text-neutral-400 mt-0.5">Augmentez votre niveau de confiance pour multiplier vos opportunités.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200/40">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-state-success/15 flex items-center justify-center text-state-success">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-neutral-800 text-sm">Adresse Email</h4>
                                            <p className="text-xs text-neutral-400 leading-relaxed mt-0.5">{email}</p>
                                        </div>
                                    </div>
                                    {isEmailVerified ? (
                                        <span className="text-state-success font-bold text-xs bg-state-success/15 px-3 py-1.5 rounded-full flex items-center">
                                            <Check className="w-3.5 h-3.5 mr-1" /> Vérifié
                                        </span>
                                    ) : (
                                        <span className="text-neutral-500 font-bold text-xs bg-neutral-100 px-3 py-1.5 rounded-full">Non vérifié</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPhoneVerified ? 'bg-state-success/15 text-state-success' : 'bg-neutral-100 text-neutral-400'}`}>
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-neutral-800 text-sm">Numéro de téléphone</h4>
                                            <p className="text-xs text-neutral-400 leading-relaxed mt-0.5">Ajoutez un numéro de téléphone vérifié par SMS pour la confiance logistique.</p>
                                        </div>
                                    </div>
                                    {isPhoneVerified ? (
                                        <span className="text-state-success font-bold text-xs bg-state-success/15 px-3 py-1.5 rounded-full flex items-center">
                                            <Check className="w-3.5 h-3.5 mr-1" /> Vérifié
                                        </span>
                                    ) : (
                                        <span className="text-neutral-500 font-bold text-xs bg-neutral-100 px-3 py-1.5 rounded-full">Bientôt disponible</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIdentityVerified ? 'bg-state-success/15 text-state-success' : 'bg-neutral-100 text-neutral-400'}`}>
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-neutral-800 text-sm">Identité (CNI / Passeport)</h4>
                                            <p className="text-xs text-neutral-400 leading-relaxed mt-0.5">Faites valider votre pièce d'identité officielle pour obtenir le badge Jibli vérifié.</p>
                                        </div>
                                    </div>
                                    {isIdentityVerified ? (
                                        <span className="text-state-success font-bold text-xs bg-state-success/15 px-3 py-1.5 rounded-full flex items-center">
                                            <Check className="w-3.5 h-3.5 mr-1" /> Vérifié
                                        </span>
                                    ) : (
                                        <span className="text-neutral-500 font-bold text-xs bg-neutral-100 px-3 py-1.5 rounded-full">Bientôt disponible</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB PANEL: REVIEWS */}
                    {activeTab === 'reviews' && (
                        <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 md:p-8 shadow-sm">
                            <div className="border-b border-neutral-100 pb-4 mb-6">
                                <h1 className="text-xl font-extrabold text-neutral-800 tracking-tight">Avis & Évaluations</h1>
                                <p className="text-xs text-neutral-400 mt-0.5">Voici les commentaires de la communauté concernant vos services logistiques.</p>
                            </div>

                            {reviews.length === 0 ? (
                                <div className="text-center py-12 text-neutral-400 text-sm flex flex-col items-center justify-center space-y-3">
                                    <Star className="w-10 h-10 text-neutral-200" />
                                    <p className="font-semibold text-neutral-500">Aucun avis reçu pour le moment.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((rev, index) => (
                                        <div key={index} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/40">
                                            <div className="flex justify-between items-baseline mb-2">
                                                <h4 className="font-bold text-neutral-800 text-sm">{rev.authorName || 'Utilisateur anonyme'}</h4>
                                                <span className="text-[10px] text-neutral-400 font-semibold">{new Date(rev.createdAt).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                            <div className="flex text-yellow-500 text-xs mb-2">
                                                {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                                            </div>
                                            <p className="text-xs text-neutral-500 italic leading-relaxed">"{rev.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
