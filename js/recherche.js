/**
 * Search page logic for Jibli.tn
 * Handles search filtering, switching tabs, and results display.
 */

// Données de recherche (État local)
const searchState = {
    type: 'trips', // 'trips' or 'requests', default from query param
    viewMode: 'list',
    filters: {
        query: '',
        date: 'any',
        price: 'any',
        capacity: [],
        objectTypes: []
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', function () {
    // Parser les paramètres URL
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    if (typeParam === 'demandes' || typeParam === 'requests') {
        searchState.type = 'requests';
    }

    // Initialiser les onglets
    initializeTabs();

    // Initialiser les filtres et événements
    initializeFilters();

    // Fetch data via API then render
    JibliData.fetchData().then(() => {
        updateSearchResults();
    });
});

function initializeTabs() {
    const tripsTab = document.getElementById('searchTripsTab');
    const requestsTab = document.getElementById('searchRequestsTab');
    const tripsForm = document.getElementById('tripsSearchForm');
    const requestsForm = document.getElementById('requestsSearchForm');

    if (searchState.type === 'trips') {
        setActiveTab(tripsTab, requestsTab, tripsForm, requestsForm);
    } else {
        setActiveTab(requestsTab, tripsTab, requestsForm, tripsForm);
    }

    tripsTab.addEventListener('click', () => {
        searchState.type = 'trips';
        setActiveTab(tripsTab, requestsTab, tripsForm, requestsForm);
        updateSearchResults();
    });

    requestsTab.addEventListener('click', () => {
        searchState.type = 'requests';
        setActiveTab(requestsTab, tripsTab, requestsForm, tripsForm);
        updateSearchResults();
    });
}

function setActiveTab(activeTab, inactiveTab, activeForm, inactiveForm) {
    activeTab.classList.add('bg-white', 'text-primary');
    activeTab.classList.remove('bg-gray-800', 'text-white');
    inactiveTab.classList.add('bg-gray-800', 'text-white');
    inactiveTab.classList.remove('bg-white', 'text-primary');
    activeForm.classList.remove('hidden');
    inactiveForm.classList.add('hidden');
}

function initializeFilters() {
    // View Mode
    const listViewBtn = document.getElementById('listViewBtn');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const searchResults = document.getElementById('searchResults');

    if (listViewBtn && gridViewBtn) {
        listViewBtn.addEventListener('click', () => {
            listViewBtn.classList.add('bg-white');
            listViewBtn.classList.remove('bg-gray-100');
            gridViewBtn.classList.add('bg-gray-100');
            gridViewBtn.classList.remove('bg-white');
            searchResults.classList.remove('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-6');
            searchResults.classList.add('space-y-6');
            searchState.viewMode = 'list';
        });

        gridViewBtn.addEventListener('click', () => {
            gridViewBtn.classList.add('bg-white');
            gridViewBtn.classList.remove('bg-gray-100');
            listViewBtn.classList.add('bg-gray-100');
            listViewBtn.classList.remove('bg-white');
            searchResults.classList.remove('space-y-6');
            searchResults.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-6');
            searchState.viewMode = 'grid';
        });
    }
}

// Fonctions de recherche
function handleSearchTrips(event) {
    event.preventDefault();
    const form = event.target;
    // Simple filter simulation
    const departure = form.querySelectorAll('input')[0].value.toLowerCase();
    const arrival = form.querySelectorAll('input')[1].value.toLowerCase();

    searchState.filters.query = [departure, arrival].join(' '); // Store for filtering logic

    // Pour l'instant, updateSearchResults filtrera basiquement côté client
    updateSearchResults();
}

function handleSearchRequests(event) {
    event.preventDefault();
    const form = event.target;
    const item = form.querySelectorAll('input')[0].value.toLowerCase();
    const destination = form.querySelectorAll('input')[1].value.toLowerCase();

    searchState.filters.query = [item, destination].join(' ');
    updateSearchResults();
}

function updateSearchResults() {
    console.log("Updating search results based on state:", searchState);
    const containerId = 'searchResults';
    const container = document.getElementById(containerId);

    if (!container) return;

    if (searchState.type === 'trips') {
        const filteredTrips = filterTrips(JibliData.trips);
        renderTrips(containerId, filteredTrips);
        updateResultCount(filteredTrips.length, 'voyages');
    } else {
        const filteredRequests = filterRequests(JibliData.requests);
        renderRequests(containerId, filteredRequests);
        updateResultCount(filteredRequests.length, 'demandes');
    }
}

function filterTrips(trips) {
    if (!searchState.filters.query) return trips;

    const terms = searchState.filters.query.split(' ').filter(t => t.length > 0);
    if (terms.length === 0) return trips;

    return trips.filter(trip => {
        const searchString = `${trip.from} ${trip.to} ${trip.userName}`.toLowerCase();
        return terms.every(term => searchString.includes(term));
    });
}

function filterRequests(requests) {
    if (!searchState.filters.query) return requests;

    const terms = searchState.filters.query.split(' ').filter(t => t.length > 0);
    if (terms.length === 0) return requests;

    return requests.filter(request => {
        const searchString = `${request.item} ${request.location} ${request.description}`.toLowerCase();
        return terms.every(term => searchString.includes(term));
    });
}

function updateResultCount(count, type) {
    // Update the result count text if element exists
    // (This element might need to be added to recherche.html or selected correctly)
    const countElement = document.querySelector('.text-gray-600'); // Assuming specific class structure
    if (countElement && countElement.textContent.includes('trouvés')) {
        countElement.textContent = `${count} ${type} trouvés`;
    }
}


function toggleAdvancedFilters() {
    const filters = document.getElementById('advancedFilters');
    filters.classList.toggle('hidden');
}

function toggleAdvancedFiltersRequests() {
    const filters = document.getElementById('advancedFiltersRequests');
    filters.classList.toggle('hidden');
}

function applyFilters() {
    // Implement detailed filtering logic here if needed
    alert("Filtres appliqués (Simulation)");
    updateSearchResults();
}

// Fallback functions
function contactTraveler(id) { alert('Contact traveler ' + id); }
function saveTrip(id) { alert('Save trip ' + id); }
