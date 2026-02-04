/**
 * @jest-environment jsdom
 */

// Mock JibliData globally BEFORE requiring dashboard.js
global.JibliData = {
    fetchData: jest.fn(() => Promise.resolve()),
    trips: [],
    requests: [],
    updateTrip: jest.fn(() => Promise.resolve()),
    updateRequest: jest.fn(() => Promise.resolve()),
    deleteTrip: jest.fn(() => Promise.resolve()),
    deleteRequest: jest.fn(() => Promise.resolve()),
    getConversations: jest.fn(() => Promise.resolve([])),
    getMessages: jest.fn(() => Promise.resolve([])),
    sendMessage: jest.fn(() => Promise.resolve()),
    markAsRead: jest.fn(() => Promise.resolve())
};

// Mock appData globally
global.appData = {
    currentUser: { id: 1, name: 'Test User' }
};

// Mock showToast (since we use it now)
global.showToast = jest.fn();

// Mock alert/confirm
global.alert = jest.fn();
global.confirm = jest.fn(() => true);

// Mock formatDate
global.formatDate = jest.fn((date) => date);

// Setup DOM
document.body.innerHTML = `
    <div id="tabMyTrips"></div>
    <div id="tabMyRequests"></div>
    <div id="myTripsContainer"></div>
    <div id="myRequestsContainer"></div>
    <!-- Modals -->
    <div id="createTripModal" class="hidden"></div>
    <input type="hidden" id="editTripId">
    <input type="text" id="tripFrom">
    <input type="text" id="tripTo">
    <input type="date" id="tripDate">
    <input type="date" id="tripArrivalDate">
    <input type="number" id="tripWeight">
    <select id="tripSize"><option value="S">S</option></select>
    <div id="priceField" class="hidden"></div>
    <input type="radio" name="priceType" value="free">
    <input type="radio" name="priceType" value="paid">
    <input type="number" id="tripPrice">
    <h3 id="tripModalTitle"></h3>
    <button id="tripSubmitBtn"></button>
    
    <!-- Request Modal -->
    <div id="createRequestModal" class="hidden"></div>
    <input type="hidden" id="editRequestId">
    <input type="text" id="requestItem">
    <input type="text" id="requestDesc">
    <input type="text" id="requestLoc">
    <input type="date" id="requestDate">
    <input type="number" id="requestWeight">
    <input type="number" id="requestBudget">
    <input type="number" id="requestBudget">
    <h3 id="requestModalTitle"></h3>
    <button id="requestSubmitBtn"></button>

    <!-- Messaging -->
    <button id="tabMessages"></button>
    <div id="messagesContainer" class="hidden">
        <div id="conversationsList"></div>
        <div id="chatHeader" class="hidden">
            <h3 id="chatUserName"></h3>
        </div>
        <div id="chatMessages" class="hidden"></div>
        <div id="chatEmptyState"></div>
        <div id="chatInputArea" class="hidden">
            <input id="messageInput">
        </div>
    </div>
`;

// Require dashboard logic
// We need to attach things to window because dashboard.js assumes it can access DOM elements and global vars
// And we want to access the functions it defines.
const dashboard = require('../../../js/dashboard');

// We also need to mock showCreateTripModal which is in main.js
global.showCreateTripModal = jest.fn();
global.showCreateRequestModal = jest.fn();

describe('Dashboard Logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        JibliData.trips = [];
        JibliData.requests = [];
    });

    test('should switch tabs correctly', () => {
        const tripsTab = document.getElementById('tabMyTrips');
        const requestsTab = document.getElementById('tabMyRequests');
        const tripsContainer = document.getElementById('myTripsContainer');
        const requestsContainer = document.getElementById('myRequestsContainer');

        dashboard.switchDashboardTab('requests');
        expect(requestsContainer.classList.contains('hidden')).toBe(false);
        expect(tripsContainer.classList.contains('hidden')).toBe(true);

        dashboard.switchDashboardTab('trips');
        expect(tripsContainer.classList.contains('hidden')).toBe(false);
        expect(requestsContainer.classList.contains('hidden')).toBe(true);
    });

    test('should render trips', async () => {
        JibliData.trips = [
            { id: 101, userId: 1, from: 'Tunis', to: 'Sfax', priceType: 'free' }
        ];

        await dashboard.renderUserTrips();

        const container = document.getElementById('myTripsContainer');
        expect(container.innerHTML).toContain('Tunis → Sfax');
        expect(container.innerHTML).toContain('Gratuit');
    });

    test('should open edit modal with correct data', () => {
        const trip = {
            id: 202, userId: 1, from: 'Gabes', to: 'Nice',
            departureDate: '2023-01-01', maxWeight: 10, size: 'M',
            priceType: 'paid', price: 50
        };
        JibliData.trips = [trip];

        dashboard.openEditTripModal(202);

        expect(document.getElementById('editTripId').value).toBe('202');
        expect(document.getElementById('tripFrom').value).toBe('Gabes');
        expect(document.getElementById('tripPrice').value).toBe('50');
        expect(global.showCreateTripModal).toHaveBeenCalled();
    });

    test('should handle delete trip', async () => {
        JibliData.deleteTrip.mockResolvedValue(true);

        await dashboard.handleDeleteTrip(303);

        expect(global.confirm).toHaveBeenCalled();
        expect(JibliData.deleteTrip).toHaveBeenCalledWith(303);
        expect(global.showToast).toHaveBeenCalledWith("Voyage supprimé.", 'success');
    });

    test('should open conversation', () => {
        const userId = 'user123';
        const userName = 'Alice';

        // Mock getMessages
        JibliData.getMessages = jest.fn().mockResolvedValue([]);
        JibliData.getConversations = jest.fn().mockResolvedValue([]);

        dashboard.openConversation(userId, userName);

        expect(document.getElementById('chatUserName').textContent).toBe(userName);
        expect(document.getElementById('chatMessages').classList.contains('hidden')).toBe(false);
        expect(JibliData.getMessages).toHaveBeenCalledWith(userId);
    });
});
