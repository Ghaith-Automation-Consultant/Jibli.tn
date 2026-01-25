/**
 * Main logic for Jibli.tn
 * Handles navigation, authentication simulation, and modal interactions.
 */

// Données de l'application
// Données de l'application
const appData = {
    "currentUser": null,
    "language": "fr",
    // Références aux données statiques (pour compatibilité avec le reste du code existant)
    get trips() { return JibliData.trips; },
    get requests() { return JibliData.requests; },
    get languages() { return JibliData.languages; }
};

// Navigation
function navigateTo(page) {
    if (event) event.preventDefault();
    console.log("Navigating to:", page);

    // Scroll vers la section correspondante
    if (page === 'home') {
        // if on a different page, we might need to redirect to template.html (or index.html)
        // For now assuming SPA behavior within the template
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'voyages') {
        const el = document.getElementById('voyages');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (page === 'demandes') {
        const el = document.getElementById('demandes');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (page === 'dashboard') {
        if (!appData.currentUser) {
            alert("Veuillez vous connecter pour accéder au tableau de bord.");
            showLoginModal();
        } else {
            window.location.href = 'dashboard.html';
        }
    } else if (page === 'comment-ca-marche') {
        const el = document.getElementById('comment-ca-marche');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
}

// Gestion de la langue
function changeLanguage(lang) {
    appData.language = lang;
    const languageBtn = document.getElementById('languageBtn');
    const dropdown = document.getElementById('languageDropdown');

    // Mettre à jour le bouton de langue
    if (lang === 'fr') {
        languageBtn.innerHTML = '<span>🇫🇷 FR</span><i class="fas fa-chevron-down text-xs text-neutral-500 ml-2"></i>';
    } else if (lang === 'ar') {
        languageBtn.innerHTML = '<span class="rtl-text">🇹🇳 العربية</span><i class="fas fa-chevron-down text-xs text-neutral-500 mr-2"></i>';
    } else if (lang === 'en') {
        languageBtn.innerHTML = '<span>🇬🇧 EN</span><i class="fas fa-chevron-down text-xs text-neutral-500 ml-2"></i>';
    }

    // Fermer le dropdown
    dropdown.classList.add('hidden');

    // Mettre à jour le contenu de la page
    updateContentForLanguage(lang);
}

function updateContentForLanguage(lang) {
    const translations = appData.languages[lang];

    // Mettre à jour la navigation
    document.querySelectorAll('nav a').forEach((link, index) => {
        const keys = Object.keys(translations.nav);
        if (index < keys.length) {
            link.textContent = translations.nav[keys[index]];
        }
    });

    // Mettre à jour le hero
    const heroTitle = document.querySelector('#home h1');
    const heroSubtitle = document.querySelector('#home p');
    const publishBtn = document.querySelector('#home button:nth-child(1)');
    const requestBtn = document.querySelector('#home button:nth-child(2)');

    if (heroTitle) heroTitle.textContent = translations.hero.title;
    if (heroSubtitle) heroSubtitle.textContent = translations.hero.subtitle;
    if (publishBtn) publishBtn.innerHTML = `<i class="fas fa-plane-departure mr-2"></i>${translations.hero.publishTrip}`;
    if (requestBtn) requestBtn.innerHTML = `<i class="fas fa-box mr-2"></i>${translations.hero.makeRequest}`;
}

// Gestion des modals
function showLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
}

function showRegisterModal() {
    document.getElementById('registerModal').classList.remove('hidden');
}

function closeRegisterModal() {
    document.getElementById('registerModal').classList.add('hidden');
}

function showCreateTripModal() {
    if (!appData.currentUser) {
        showLoginModal();
        return;
    }
    document.getElementById('createTripModal').classList.remove('hidden');
}

function closeCreateTripModal() {
    document.getElementById('createTripModal').classList.add('hidden');
}

function showCreateRequestModal() {
    if (!appData.currentUser) {
        showLoginModal();
        return;
    }
    document.getElementById('createRequestModal').classList.remove('hidden');
}

function closeCreateRequestModal() {
    document.getElementById('createRequestModal').classList.add('hidden');
}

function showForgotPasswordModal() {
    closeLoginModal();
    alert("Fonctionnalité 'Mot de passe oublié' - À implémenter");
}

// Gestion des formulaires
function handleLogin(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    const password = event.target.querySelector('input[type="password"]').value;

    // Connexion API
    JibliData.login(email, password)
        .then(response => {
            appData.currentUser = response.user;
            closeLoginModal();
            updateUserInterface();
            alert("Connexion réussie ! Bienvenue " + appData.currentUser.name);
        })
        .catch(err => {
            alert("Erreur de connexion : identifiants invalides");
        });
}

function handleRegister(event) {
    event.preventDefault();
    const email = event.target.querySelectorAll('input')[0].value;
    const password = event.target.querySelectorAll('input')[1].value;
    const confirmPassword = event.target.querySelectorAll('input')[2].value;
    const name = event.target.querySelectorAll('input')[3].value;

    if (password !== confirmPassword) {
        alert("Les mots de passe ne correspondent pas");
        return;
    }

    // Simulation d'inscription
    appData.currentUser = {
        id: 1,
        name: name,
        email: email,
        location: "Tunis, Tunisie"
    };

    closeRegisterModal();
    updateUserInterface();
    alert("Inscription réussie ! Bienvenue " + appData.currentUser.name);
}

function handleCreateTrip(event) {
    event.preventDefault();
    const form = event.target;

    // Check if Edit Mode
    const editId = document.getElementById('editTripId')?.value;

    // Get values (selectors updated to be more robust or use IDs if available, 
    // but sticking to querySelectorAll index for compatibility with existing form in template unless I updated IDs there?
    // In dashboard.html I added IDs. In template.html they might not have IDs.
    // To be safe, I will try to get by ID first, then fallback to querySelectorAll if ID elements don't exist
    // Actually, dashboard.html uses the SAME modal structure but added IDs.
    // The safest way is: if ID exists, use it.

    let from, to, departureDate, arrivalDate, maxWeight, size, priceType, price;

    if (document.getElementById('tripFrom')) {
        from = document.getElementById('tripFrom').value;
        to = document.getElementById('tripTo').value;
        departureDate = document.getElementById('tripDate').value;
        arrivalDate = document.getElementById('tripArrivalDate').value;
        maxWeight = document.getElementById('tripWeight').value;
        size = document.getElementById('tripSize').value;
        const priceTypeEl = form.querySelector('input[name="priceType"]:checked');
        priceType = priceTypeEl ? priceTypeEl.value : 'free';
        price = document.getElementById('tripPrice').value;
    } else {
        // Fallback for template.html if IDs were not added there (I should have added them to template too or use reliable selectors)
        // Ignoring fallback complexity for now, assuming dashboard use or I will update template.html next
        // But for safety, let's keep the old selector style AND the new IDs
        from = document.getElementById('tripFrom') ? document.getElementById('tripFrom').value : form.querySelectorAll('input')[0].value;
        to = document.getElementById('tripTo') ? document.getElementById('tripTo').value : form.querySelectorAll('input')[1].value;
        departureDate = document.getElementById('tripDate') ? document.getElementById('tripDate').value : form.querySelectorAll('input')[2].value;
        arrivalDate = document.getElementById('tripArrivalDate') ? document.getElementById('tripArrivalDate').value : form.querySelectorAll('input')[3].value;
        maxWeight = document.getElementById('tripWeight') ? document.getElementById('tripWeight').value : form.querySelectorAll('input')[4].value;
        size = document.getElementById('tripSize') ? document.getElementById('tripSize').value : form.querySelector('select').value;
        priceType = form.querySelector('input[name="priceType"]:checked').value;
        price = priceType === 'paid' ? (document.getElementById('tripPrice') ? document.getElementById('tripPrice').value : form.querySelectorAll('input')[5]?.value) : 0;
    }

    const tripData = {
        from: from,
        to: to,
        departureDate: departureDate,
        arrivalDate: arrivalDate,
        maxWeight: parseFloat(maxWeight),
        size: size,
        priceType: priceType,
        price: parseFloat(price),
        status: "active",
        userId: appData.currentUser.id,
        userName: appData.currentUser.name,
        userLocation: appData.currentUser.location
    };

    if (editId) {
        JibliData.updateTrip(editId, tripData)
            .then(() => {
                closeCreateTripModal();
                alert("Voyage mis à jour !");
                if (typeof renderUserTrips === 'function') renderUserTrips(); // Refresh dashboard
            })
            .catch(err => alert("Erreur : " + err.message));
    } else {
        JibliData.createTrip(tripData)
            .then(() => {
                closeCreateTripModal();
                alert("Voyage publié avec succès !");
                if (document.getElementById('recentTripsContainer')) {
                    renderTrips('recentTripsContainer', JibliData.trips.slice(0, 3));
                }
                if (typeof renderUserTrips === 'function') renderUserTrips();
            })
            .catch(err => alert("Erreur lors de la publication : " + err.message));
    }
}

function handleCreateRequest(event) {
    event.preventDefault();
    const form = event.target;

    const editId = document.getElementById('editRequestId')?.value;

    let item, description, location, deadline, weight, budget, isPublic;

    if (document.getElementById('requestItem')) {
        item = document.getElementById('requestItem').value;
        description = document.getElementById('requestDesc').value;
        location = document.getElementById('requestLoc').value;
        deadline = document.getElementById('requestDate').value;
        weight = document.getElementById('requestWeight').value;
        budget = document.getElementById('requestBudget').value;
        isPublic = false; // Simplified for now or add checkbox ID
    } else {
        item = form.querySelectorAll('input')[0].value;
        description = form.querySelector('textarea').value;
        location = form.querySelectorAll('input')[1].value;
        deadline = form.querySelectorAll('input')[2].value;
        weight = form.querySelectorAll('input')[3].value;
        budget = form.querySelectorAll('input')[4].value;
        isPublic = form.querySelector('#publicRequest') ? form.querySelector('#publicRequest').checked : false;
    }

    const requestData = {
        item: item,
        description: description,
        location: location,
        deadline: deadline,
        weight: weight ? parseFloat(weight) : null,
        budget: budget ? parseFloat(budget) : null,
        status: "pending",
        isPublic: isPublic,
        userId: appData.currentUser.id,
        userName: appData.currentUser.name,
        userLocation: appData.currentUser.location
    };

    if (editId) {
        JibliData.updateRequest(editId, requestData)
            .then(() => {
                closeCreateRequestModal();
                alert("Demande mise à jour !");
                if (typeof renderUserRequests === 'function') renderUserRequests();
            })
            .catch(err => alert("Erreur : " + err.message));
    } else {
        JibliData.createRequest(requestData)
            .then(() => {
                closeCreateRequestModal();
                if (document.getElementById('recentRequestsContainer')) {
                    renderRequests('recentRequestsContainer', JibliData.requests.slice(0, 2));
                }
                if (typeof renderUserRequests === 'function') renderUserRequests();
                alert("Demande publiée avec succès !");
            })
            .catch(err => alert("Erreur lors de la publication : " + err.message));
    }
}

function logout() {
    appData.currentUser = null;
    updateUserInterface();
    alert("Déconnexion réussie");
}

function updateUserInterface() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');

    if (appData.currentUser) {
        authButtons.classList.add('hidden');
        userMenu.classList.remove('hidden');

        // Mettre à jour le nom de l'utilisateur
        const userNameSpan = userMenu.querySelector('span');
        if (userNameSpan) {
            userNameSpan.textContent = appData.currentUser.name;
        }
    } else {
        authButtons.classList.remove('hidden');
        userMenu.classList.add('hidden');
    }
}

function updateTripsDisplay() {
    // Cette fonction mettrait à jour l'affichage des voyages
    // Pour le MVP, on montre juste une alerte
    console.log("Mise à jour de l'affichage des voyages");
}

function updateRequestsDisplay() {
    // Cette fonction mettrait à jour l'affichage des demandes
    // Pour le MVP, on montre juste une alerte
    console.log("Mise à jour de l'affichage des demandes");
}

function showTripDetails(tripId) {
    if (!appData.currentUser) {
        showLoginModal();
        return;
    }

    const trip = appData.trips.find(t => t.id === tripId);
    if (trip) {
        alert(`Détails du voyage:\nDe: ${trip.from}\nÀ: ${trip.to}\nDate: ${trip.departureDate}\nCapacité: ${trip.maxWeight}kg\nTaille: ${trip.size}\nPrix: ${trip.priceType === 'free' ? 'Gratuit' : trip.price + '€'}`);
    }
}

function showRequestDetails(requestId) {
    if (!appData.currentUser) {
        showLoginModal();
        return;
    }

    const request = appData.requests.find(r => r.id === requestId);
    if (request) {
        alert(`Détails de la demande:\nObjet: ${request.item}\nDescription: ${request.description}\nLieu: ${request.location}\nPoids: ${request.weight || 'Non spécifié'}kg\nBudget: ${request.budget || 'Non spécifié'}€`);
    }
}

// Gestion des dropdowns
document.addEventListener('DOMContentLoaded', function () {
    // Dropdown langue
    const languageBtn = document.getElementById('languageBtn');
    const languageDropdown = document.getElementById('languageDropdown');

    if (languageBtn) {
        languageBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            languageDropdown.classList.toggle('hidden');
        });
    }

    // Dropdown utilisateur
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });
    }

    // Menu mobile
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function () {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Gestion du type de prix dans le formulaire de voyage
    const priceRadios = document.querySelectorAll('input[name="priceType"]');
    const priceField = document.getElementById('priceField');

    priceRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.value === 'paid') {
                priceField.classList.remove('hidden');
            } else {
                priceField.classList.add('hidden');
            }
        });
    });

    // Fermer les dropdowns en cliquant ailleurs
    document.addEventListener('click', function () {
        if (languageDropdown) languageDropdown.classList.add('hidden');
        if (userDropdown) {
            userDropdown.classList.add('hidden');
        }
    });

    // Empêcher la propagation des clics dans les dropdowns
    if (languageDropdown) {
        languageDropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    if (userDropdown) {
        userDropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    // Initialiser l'interface utilisateur
    updateUserInterface();

    // Fetch data and render
    JibliData.fetchData().then(() => {
        // Render Home Page Content if containers exist
        if (document.getElementById('recentTripsContainer')) {
            renderTrips('recentTripsContainer', JibliData.trips.slice(0, 3));
        }
        if (document.getElementById('recentRequestsContainer')) {
            renderRequests('recentRequestsContainer', JibliData.requests.slice(0, 2));
        }
    });
});
