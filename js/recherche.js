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
        objectTypes: [],
        sort: 'Pertinence'
    },
    pagination: {
        currentPage: 1,
        itemsPerPage: 5
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

    // Update Platform Stats
    JibliData.getStats().then(stats => {
        const activeTripsEl = document.getElementById('statActiveTrips');
        const activeTravelersEl = document.getElementById('statActiveTravelers');
        const successfulTransactionsEl = document.getElementById('statSuccessfulTransactions');

        if (activeTripsEl) activeTripsEl.textContent = stats.activeTrips;
        if (activeTravelersEl) activeTravelersEl.textContent = stats.totalUsers; // Using totalActiveUsers as proxy
        if (successfulTransactionsEl) successfulTransactionsEl.textContent = stats.successfulTransactions;
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

    const sortSelect = document.querySelector('select'); // Assuming it's the only select or query specifically
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            searchState.filters.sort = e.target.value;
            updateSearchResults();
        });
    }
}

// Fonctions de recherche
function handleSearchTrips(event) {
    event.preventDefault();
    const form = event.target;

    // Extract values
    const departure = form.querySelector('input[placeholder="Ville de départ"]').value;
    const arrival = form.querySelector('input[placeholder="Ville d\'arrivée"]').value;
    const dateInput = form.querySelector('input[type="date"]');
    const date = dateInput ? dateInput.value : null;

    // Update search state for UI consistency if needed
    searchState.filters.query = [departure, arrival].join(' ').trim();

    // Prepare API params
    const params = {};
    if (departure) params.from = departure;
    if (arrival) params.to = arrival;
    if (date) params.date = date;

    // Fetch and render
    JibliData.fetchData(params, {}).then(() => {
        updateSearchResults();
    });
}

function handleSearchRequests(event) {
    event.preventDefault();
    const form = event.target;

    const item = form.querySelector('input[placeholder*="Objet"]').value;
    const location = form.querySelector('input[placeholder*="Ville"]').value;

    searchState.filters.query = [item, location].join(' ').trim();

    const params = {};
    if (item) params.item = item;
    if (location) params.location = location;

    JibliData.fetchData({}, params).then(() => {
        updateSearchResults();
    });
}

function updateSearchResults() {
    console.log("Updating search results based on state:", searchState);
    const containerId = 'searchResults';
    const container = document.getElementById(containerId);

    if (!container) return;

    let filteredData = [];
    let typeLabel = '';

    if (searchState.type === 'trips') {
        filteredData = filterTrips(JibliData.trips);
        typeLabel = 'voyages';
    } else {
        filteredData = filterRequests(JibliData.requests);
        typeLabel = 'demandes';
    }

    // Pagination Logic
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / searchState.pagination.itemsPerPage);

    // Ensure current page is valid
    if (searchState.pagination.currentPage > totalPages) searchState.pagination.currentPage = totalPages || 1;
    if (searchState.pagination.currentPage < 1) searchState.pagination.currentPage = 1;

    const startIndex = (searchState.pagination.currentPage - 1) * searchState.pagination.itemsPerPage;
    const endIndex = Math.min(startIndex + searchState.pagination.itemsPerPage, totalItems);

    const pageData = filteredData.slice(startIndex, endIndex);

    // Render Data
    if (searchState.type === 'trips') {
        renderTrips(containerId, pageData);
    } else {
        renderRequests(containerId, pageData);
    }

    // Render Pagination Controls
    renderPagination(totalItems, startIndex, endIndex, totalPages);

    // Update count text if needed (though renderPagination handles the main summary)
    updateResultCount(totalItems, typeLabel);
}

function renderPagination(totalItems, startIndex, endIndex, totalPages) {
    const container = document.getElementById('paginationContainer');
    const summary = document.getElementById('paginationSummary');
    const controls = document.getElementById('paginationControls');

    if (!container || !summary || !controls) return;

    if (totalItems === 0) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    // Update Summary
    // "Affichage 1-5 sur 12 résultats"
    summary.innerHTML = `Affichage <span class="font-bold">${totalItems > 0 ? startIndex + 1 : 0}-${endIndex}</span> sur <span class="font-bold">${totalItems}</span> résultats`;

    // Update Controls
    controls.innerHTML = '';

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.className = `w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 ${searchState.pagination.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`;
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = searchState.pagination.currentPage === 1;
    prevBtn.onclick = () => changePage(searchState.pagination.currentPage - 1);
    controls.appendChild(prevBtn);

    // Page Numbers
    // Simple logic: Show all pages if <= 7, otherwise intelligent ellipsis (simplified here for now)
    for (let i = 1; i <= totalPages; i++) {
        // Show 1, Last, Current, and neighbors
        if (i === 1 || i === totalPages || (i >= searchState.pagination.currentPage - 1 && i <= searchState.pagination.currentPage + 1)) {
            const btn = document.createElement('button');
            if (i === searchState.pagination.currentPage) {
                btn.className = 'w-10 h-10 flex items-center justify-center bg-primary text-white rounded-lg';
            } else {
                btn.className = 'w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100';
            }
            btn.textContent = i;
            btn.onclick = () => changePage(i);
            controls.appendChild(btn);
        } else if (
            (i === searchState.pagination.currentPage - 2 && searchState.pagination.currentPage > 3) ||
            (i === searchState.pagination.currentPage + 2 && searchState.pagination.currentPage < totalPages - 2)
        ) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'w-10 h-10 flex items-center justify-center text-gray-500';
            ellipsis.textContent = '...';
            controls.appendChild(ellipsis);
        }
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = `w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 ${searchState.pagination.currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`;
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = searchState.pagination.currentPage === totalPages;
    nextBtn.onclick = () => changePage(searchState.pagination.currentPage + 1);
    controls.appendChild(nextBtn);
}

function changePage(newPage) {
    searchState.pagination.currentPage = newPage;
    updateSearchResults();
    // Scroll to results top
    const resultsContainer = document.getElementById('searchResults');
    if (resultsContainer) {
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Sort helper
function sortData(data, sortType, type = 'trip') {
    const sorted = [...data];
    switch (sortType) {
        case 'Date (plus récent)':
            return sorted.sort((a, b) => new Date(b.createdAt || b.departureDate) - new Date(a.createdAt || a.departureDate));
        case 'Date (plus ancien)':
            return sorted.sort((a, b) => new Date(a.createdAt || a.departureDate) - new Date(b.createdAt || b.departureDate));
        case 'Prix (croissant)':
            return sorted.sort((a, b) => (type === 'trip' ? (a.price || 0) - (b.price || 0) : 0));
        case 'Prix (décroissant)':
            return sorted.sort((a, b) => (type === 'trip' ? (b.price || 0) - (a.price || 0) : 0));
        case 'Capacité disponible':
            return sorted.sort((a, b) => (type === 'trip' ? (b.maxWeight || 0) - (a.maxWeight || 0) : 0));
        default: // Pertinence or others
            return sorted;
    }
}

function filterTrips(trips) {
    let result = trips;
    if (searchState.filters.query) {
        const terms = searchState.filters.query.split(' ').filter(t => t.length > 0).map(t => t.toLowerCase());
        if (terms.length > 0) {
            result = result.filter(trip => {
                const searchString = `${trip.from} ${trip.to} ${trip.userName || ''}`.toLowerCase();
                return terms.every(term => searchString.includes(term));
            });
        }
    }

    // Advanced Sidebar Filters
    if (searchState.filters.price === 'free') {
        result = result.filter(trip => trip.priceType === 'free');
    } else if (searchState.filters.price === 'paid') {
        result = result.filter(trip => trip.priceType === 'paid');
    }

    return sortData(result, searchState.filters.sort, 'trip');
}

function filterRequests(requests) {
    let result = requests;
    if (searchState.filters.query) {
        const terms = searchState.filters.query.split(' ').filter(t => t.length > 0).map(t => t.toLowerCase());
        if (terms.length > 0) {
            result = result.filter(request => {
                const searchString = `${request.item} ${request.location} ${request.description}`.toLowerCase();
                return terms.every(term => searchString.includes(term));
            });
        }
    }
    return sortData(result, searchState.filters.sort, 'request');
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
    const priceFilter = document.querySelector('input[name="priceFilter"]:checked');
    if (priceFilter) {
        searchState.filters.price = priceFilter.value;
    }

    updateSearchResults();
    if (typeof showToast === 'function') {
        showToast("Filtres appliqués", "info");
    }
}

// Fallback functions
function contactTraveler(id) {
    if (typeof showToast === 'function') showToast('Fonctionnalité Messages bientôt disponible.', 'info');
}
function saveTrip(id) {
    if (typeof showToast === 'function') showToast('Voyage sauvegardé.', 'success');
}
