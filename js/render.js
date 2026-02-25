/**
 * Render Functions for Jibli.tn
 * Generates HTML for trip and request cards.
 */

function createTripCard(trip) {
    const priceDisplay = trip.priceType === 'free' ?
        '<i class="fas fa-euro-sign mr-2"></i><span>Gratuit</span>' :
        `<i class="fas fa-euro-sign mr-2"></i><span>${trip.price}€ par kg</span>`;

    const badgeColor = trip.priceType === 'free' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
    const badgeText = trip.priceType === 'free' ? 'Gratuit' : 'Payant';

    return `
    <div class="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
        <div class="p-6">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-bold text-neutral-900 mb-1">${trip.from} → ${trip.to}</h3>
                    <p class="text-neutral-500">Départ: ${formatDate(trip.departureDate)}</p>
                </div>
                <span class="px-3 py-1 ${badgeColor} rounded-full text-sm font-medium">
                    ${badgeText}
                </span>
            </div>

            <div class="mb-4">
                <div class="flex items-center text-neutral-500 mb-2">
                    <i class="fas fa-weight-hanging mr-2"></i>
                    <span>Capacité: ${trip.maxWeight}kg disponible</span>
                </div>
                <div class="flex items-center text-neutral-500 mb-2">
                    <i class="fas fa-box mr-2"></i>
                    <span>Taille: ${trip.size}</span>
                </div>
                <div class="flex items-center text-neutral-500">
                    ${priceDisplay}
                </div>
            </div>

            <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-neutral-200 rounded-full overflow-hidden mr-3">
                    <img src="${(trip.user && trip.user.avatar) ? trip.user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(trip.userName || (trip.user && trip.user.name) || 'Anonyme')}&background=0D9488&color=fff`}" alt="Profil voyageur"
                        class="w-full h-full object-cover">
                </div>
                <div>
                    <p class="font-medium">${trip.userName || (trip.user && trip.user.name) || 'Anonyme'}</p>
                    <p class="text-sm text-neutral-500">${trip.userLocation || (trip.user && trip.user.location) || ''}</p>
                </div>
            </div>

            <button onclick="showTripDetails('${trip.id}')"
                class="w-full py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">
                Voir les détails
            </button>
        </div>
    </div>
    `;
}

function createRequestCard(request) {
    let statusBadge = '';
    switch (request.status) {
        case 'pending':
        default:
            statusBadge = '<span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">En attente</span>';
            break;
        case 'accepted':
            statusBadge = '<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Acceptée</span>';
            break;
        case 'completed':
            statusBadge = '<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Terminée</span>';
            break;
        case 'cancelled':
            statusBadge = '<span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Annulée</span>';
            break;
    }

    return `
    <div class="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-xl font-bold text-neutral-900 mb-1">${request.item}</h3>
                <p class="text-neutral-500">${request.location} → ???</p>
            </div>
            ${statusBadge}
        </div>

        <p class="text-neutral-500 mb-4 line-clamp-2">
            ${request.description}
        </p>

        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center text-neutral-500">
                <i class="fas fa-weight-hanging mr-2"></i>
                <span>${request.weight} kg</span>
            </div>
            <div class="text-lg font-bold text-primary">
                Budget: ${request.budget}€
            </div>
        </div>

        <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-neutral-200 rounded-full overflow-hidden mr-3">
                <img src="${(request.user && request.user.avatar) ? request.user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(request.userName || (request.user && request.user.name) || 'Anonyme')}&background=0D9488&color=fff`}" alt="Profil demandeur"
                    class="w-full h-full object-cover">
            </div>
            <div>
                <p class="font-medium">${request.userName || (request.user && request.user.name) || 'Anonyme'}</p>
                <p class="text-sm text-neutral-500">${request.userLocation || (request.user && request.user.location) || ''}</p>
            </div>
        </div>

        <button onclick="showRequestDetails('${request.id}')"
            class="w-full py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors">
            Répondre à cette demande
        </button>
    </div>
    `;
}

function renderTrips(containerId, trips) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (trips.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-8">Aucun voyage trouvé.</p>';
        return;
    }

    container.innerHTML = trips.map(trip => createTripCard(trip)).join('');
}

function renderRequests(containerId, requests) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (requests.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-8">Aucune demande trouvée.</p>';
        return;
    }

    container.innerHTML = requests.map(request => createRequestCard(request)).join('');
}

// Utility
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}
