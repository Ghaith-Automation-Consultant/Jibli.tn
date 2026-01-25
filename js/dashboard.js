/**
 * Dashboard Logic for Jibli.tn
 * Manages "My Trips" and "My Requests" views, including Edit and Delete actions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check auth
    if (!appData.currentUser) {
        alert("Veuillez vous connecter pour accéder au tableau de bord.");
        window.location.href = 'template.html'; // Redirect to home
        return;
    }

    // Initial Render
    renderUserTrips();
    renderUserRequests();
});

function switchDashboardTab(tab) {
    const tripsTab = document.getElementById('tabMyTrips');
    const requestsTab = document.getElementById('tabMyRequests');
    const tripsContainer = document.getElementById('myTripsContainer');
    const requestsContainer = document.getElementById('myRequestsContainer');

    if (tab === 'trips') {
        tripsTab.classList.add('border-b-2', 'border-primary', 'text-primary');
        tripsTab.classList.remove('text-neutral-500');
        requestsTab.classList.remove('border-b-2', 'border-primary', 'text-primary');
        requestsTab.classList.add('text-neutral-500');

        tripsContainer.classList.remove('hidden');
        requestsContainer.classList.add('hidden');
    } else {
        requestsTab.classList.add('border-b-2', 'border-primary', 'text-primary');
        requestsTab.classList.remove('text-neutral-500');
        tripsTab.classList.remove('border-b-2', 'border-primary', 'text-primary');
        tripsTab.classList.add('text-neutral-500');

        requestsContainer.classList.remove('hidden');
        tripsContainer.classList.add('hidden');
    }
}

function renderUserTrips() {
    JibliData.fetchData().then(() => {
        const userTrips = JibliData.trips.filter(t => t.userId === appData.currentUser.id);
        const container = document.getElementById('myTripsContainer');

        if (userTrips.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">Vous n\'avez publié aucun voyage.</p>';
            return;
        }

        container.innerHTML = userTrips.map(trip => createDashboardTripCard(trip)).join('');
    });
}

function renderUserRequests() {
    // Using already fetched data if possible, but safe to call again or rely on main's fetch
    // Since main.js runs first, JibliData might be ready, but let's be safe
    const userRequests = JibliData.requests.filter(r => r.userId === appData.currentUser.id);
    const container = document.getElementById('myRequestsContainer');

    if (userRequests.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">Vous n\'avez fait aucune demande.</p>';
        return;
    }

    container.innerHTML = userRequests.map(req => createDashboardRequestCard(req)).join('');
}

function createDashboardTripCard(trip) {
    // Reusing logic from render.js but adding Edit/Delete buttons
    // Ideally we would refactor render.js to accept actions, but duplicating for safety/speed now
    return `
    <div class="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
        <div class="p-6">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-bold text-neutral-900 mb-1">${trip.from} → ${trip.to}</h3>
                    <p class="text-neutral-500">Départ: ${formatDate(trip.departureDate)}</p>
                </div>
                <span class="px-3 py-1 ${trip.priceType === 'free' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} rounded-full text-sm font-medium">
                    ${trip.priceType === 'free' ? 'Gratuit' : 'Payant'}
                </span>
            </div>

            <div class="mb-4 text-neutral-500 text-sm">
                 <p>Capacité: ${trip.maxWeight}kg | Taille: ${trip.size}</p>
                 <p>Prix: ${trip.price}€</p>
            </div>

            <div class="flex space-x-3 mt-4">
                <button onclick="openEditTripModal(${trip.id})" class="flex-1 py-2 border border-primary text-primary rounded-md hover:bg-neutral-50 transition-colors">
                    <i class="fas fa-edit mr-2"></i> Modifier
                </button>
                <button onclick="handleDeleteTrip(${trip.id})" class="flex-1 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors">
                    <i class="fas fa-trash-alt mr-2"></i> Supprimer
                </button>
            </div>
        </div>
    </div>
    `;
}

function createDashboardRequestCard(request) {
    return `
    <div class="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
        <div class="p-6">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-bold text-neutral-900 mb-1">${request.item}</h3>
                    <p class="text-neutral-500">${request.location}</p>
                </div>
                <!-- Status Badge could go here -->
            </div>
            
            <p class="text-neutral-500 mb-4 line-clamp-2">${request.description}</p>
            
            <div class="flex space-x-3 mt-4">
                <button onclick="openEditRequestModal(${request.id})" class="flex-1 py-2 border border-primary text-primary rounded-md hover:bg-neutral-50 transition-colors">
                    <i class="fas fa-edit mr-2"></i> Modifier
                </button>
                <button onclick="handleDeleteRequest(${request.id})" class="flex-1 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors">
                    <i class="fas fa-trash-alt mr-2"></i> Supprimer
                </button>
            </div>
        </div>
    </div>
    `;
}

// Actions
function handleDeleteTrip(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce voyage ?")) {
        JibliData.deleteTrip(id).then(() => {
            renderUserTrips();
            alert("Voyage supprimé.");
        }).catch(err => alert("Erreur: " + err.message));
    }
}

function handleDeleteRequest(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette demande ?")) {
        JibliData.deleteRequest(id).then(() => {
            renderUserRequests();
            alert("Demande supprimée.");
        }).catch(err => alert("Erreur: " + err.message));
    }
}

// Edit Modal Opening Logic
// We rely on functions defined in main.js, but we need to populate the form and set 'Edit' mode
function openEditTripModal(id) {
    const trip = JibliData.trips.find(t => t.id === id);
    if (!trip) return;

    // Populate Fields
    document.getElementById('editTripId').value = trip.id;
    document.getElementById('tripFrom').value = trip.from;
    document.getElementById('tripTo').value = trip.to;
    document.getElementById('tripDate').value = trip.departureDate;
    document.getElementById('tripArrivalDate').value = trip.arrivalDate || '';
    document.getElementById('tripWeight').value = trip.maxWeight;
    document.getElementById('tripSize').value = trip.size;

    // Price Radio
    if (trip.priceType === 'paid') {
        document.querySelector('input[name="priceType"][value="paid"]').checked = true;
        document.getElementById('priceField').classList.remove('hidden');
        document.getElementById('tripPrice').value = trip.price;
    } else {
        document.querySelector('input[name="priceType"][value="free"]').checked = true;
        document.getElementById('priceField').classList.add('hidden');
    }

    // UI Updates
    document.getElementById('tripModalTitle').textContent = "Modifier le voyage";
    document.getElementById('tripSubmitBtn').textContent = "Enregistrer les modifications";

    showCreateTripModal();
}

function openEditRequestModal(id) {
    const req = JibliData.requests.find(r => r.id === id);
    if (!req) return;

    // Populate
    document.getElementById('editRequestId').value = req.id;
    document.getElementById('requestItem').value = req.item;
    document.getElementById('requestDesc').value = req.description;
    document.getElementById('requestLoc').value = req.location;
    document.getElementById('requestDate').value = req.deadline || '';
    document.getElementById('requestWeight').value = req.weight;
    document.getElementById('requestBudget').value = req.budget;

    // UI Updates
    document.getElementById('requestModalTitle').textContent = "Modifier la demande";
    document.getElementById('requestSubmitBtn').textContent = "Enregistrer les modifications";

    showCreateRequestModal();
}
