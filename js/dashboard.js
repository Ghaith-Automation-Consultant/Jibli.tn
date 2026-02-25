/**
 * Dashboard Logic for Jibli.tn
 * Manages "My Trips" and "My Requests" views, including Edit and Delete actions.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Check if we need to restore session first
    if (!appData.currentUser && JibliData.getToken()) {
        try {
            const user = await JibliData.getMe();
            appData.currentUser = user;
            updateUserInterface(); // Helper from main.js if available, or just proceed
        } catch (err) {
            console.error("Session restore failed in dashboard", err);
            JibliData.clearToken();
            window.location.href = 'index.html';
            return;
        }
    }

    // Check auth
    if (!appData.currentUser) {
        // We can't show toast easily here if we redirect immediately, but let's try
        alert("Veuillez vous connecter pour accéder au tableau de bord.");
        window.location.href = 'index.html'; // Redirect to home
        return;
    }

    // Initial Render
    // We fetch data once to populate everything if possible, or fetch on demand
    // For MVP, let's fetch everything on load to populate stats
    JibliData.fetchData().then(() => {
        renderOverview();
        renderUserTrips(); // Pre-load
        renderUserRequests(); // Pre-load
        renderProfileSummary();
    });

    // Check for tab param
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
        switchDashboardTab(tab);
    } else {
        switchDashboardTab('overview');
    }
});

function switchDashboardTab(tab) {
    const overviewTab = document.getElementById('tabOverview');
    const tripsTab = document.getElementById('tabMyTrips');
    const requestsTab = document.getElementById('tabMyRequests');
    const messagesTab = document.getElementById('tabMessages');
    const profileTab = document.getElementById('tabProfile');

    const overviewContainer = document.getElementById('overviewContainer');
    const tripsContainer = document.getElementById('myTripsContainer');
    const requestsContainer = document.getElementById('myRequestsContainer');
    const messagesContainer = document.getElementById('messagesContainer');
    const profileContainer = document.getElementById('profileContainer');

    const allTabs = [overviewTab, tripsTab, requestsTab, messagesTab, profileTab];
    const allContainers = [overviewContainer, tripsContainer, requestsContainer, messagesContainer, profileContainer];

    // Reset
    allTabs.forEach(t => {
        if (t) {
            t.classList.remove('border-b-2', 'border-primary', 'text-primary');
            t.classList.add('text-neutral-500');
        }
    });
    allContainers.forEach(c => {
        if (c) c.classList.add('hidden');
    });

    // Activate
    const activeTabMap = {
        'overview': [overviewTab, overviewContainer],
        'trips': [tripsTab, tripsContainer],
        'requests': [requestsTab, requestsContainer],
        'messages': [messagesTab, messagesContainer],
        'profile': [profileTab, profileContainer]
    };

    const target = activeTabMap[tab];
    if (target && target[0] && target[1]) {
        target[0].classList.add('border-b-2', 'border-primary', 'text-primary');
        target[0].classList.remove('text-neutral-500');
        target[1].classList.remove('hidden');

        if (tab === 'messages') renderConversations();
    }
}

async function renderOverview() {
    if (!appData.currentUser) return;

    // Stats
    const myTrips = JibliData.trips.filter(t => t.userId === appData.currentUser.id);
    const myRequests = JibliData.requests.filter(r => r.userId === appData.currentUser.id);

    let unreadCount = 0;
    try {
        const conversations = await JibliData.getConversations();
        unreadCount = conversations.reduce((acc, conv) => {
            const lastMsg = conv.lastMessage;
            if (lastMsg && !lastMsg.read && lastMsg.sender !== appData.currentUser.id) {
                return acc + 1;
            }
            return acc;
        }, 0);
    } catch (error) {
        console.error("Failed to fetch conversations for overview", error);
    }

    document.getElementById('statActiveTrips').textContent = myTrips.length;
    document.getElementById('statActiveRequests').textContent = myRequests.length;
    document.getElementById('statUnreadMessages').textContent = unreadCount;

    // Recent Activity
    const activityList = document.getElementById('recentActivityList');
    activityList.innerHTML = '';

    // Synthesize activity
    const activities = [];
    myTrips.slice(0, 2).forEach(t => {
        activities.push({
            text: `Vous avez publié un voyage vers ${t.to}`,
            date: new Date(t.createdAt || Date.now())
        });
    });
    myRequests.slice(0, 2).forEach(r => {
        activities.push({
            text: `Vous avez demandé : ${r.item}`,
            date: new Date(r.createdAt || Date.now())
        });
    });

    // Sort by date desc
    activities.sort((a, b) => b.date - a.date);

    if (activities.length === 0) {
        activityList.innerHTML = '<li class="flex items-start text-sm text-gray-600"><div class="w-2 h-2 bg-gray-300 rounded-full mt-1.5 mr-3"></div><p>Bienvenue ! Commencez par publier un voyage ou une demande.</p></li>';
    } else {
        activities.forEach(act => {
            const li = document.createElement('li');
            li.className = 'flex items-start text-sm text-gray-600';
            li.innerHTML = `<div class="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div><p>${act.text} <span class="text-xs text-gray-400 block">${act.date.toLocaleDateString()}</span></p>`;
            activityList.appendChild(li);
        });
    }
}

function renderProfileSummary() {
    if (!appData.currentUser) return;
    const user = appData.currentUser;
    document.getElementById('profilePageName').textContent = user.name;
    document.getElementById('profilePageEmail').textContent = user.email;
    document.getElementById('profilePageAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D9488&color=fff`;
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
                <button onclick="openEditTripModal('${trip.id}')" class="flex-1 py-2 border border-primary text-primary rounded-md hover:bg-neutral-50 transition-colors">
                    <i class="fas fa-edit mr-2"></i> Modifier
                </button>
                <button onclick="handleDeleteTrip('${trip.id}')" class="flex-1 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors">
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
                <button onclick="openEditRequestModal('${request.id}')" class="flex-1 py-2 border border-primary text-primary rounded-md hover:bg-neutral-50 transition-colors">
                    <i class="fas fa-edit mr-2"></i> Modifier
                </button>
                <button onclick="handleDeleteRequest('${request.id}')" class="flex-1 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors">
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
            showToast("Voyage supprimé.", 'success');
        }).catch(err => showToast("Erreur: " + err.message, 'error'));
    }
}

function handleDeleteRequest(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette demande ?")) {
        JibliData.deleteRequest(id).then(() => {
            renderUserRequests();
            showToast("Demande supprimée.", 'success');
        }).catch(err => showToast("Erreur: " + err.message, 'error'));
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

// Messaging UI
let currentChatUserId = null;

function renderConversations() {
    // Show loading
    const container = document.getElementById('conversationsList');
    container.innerHTML = '<p class="text-center text-neutral-500 py-4">Chargement...</p>';

    JibliData.getConversations().then(conversations => {
        if (conversations.length === 0) {
            container.innerHTML = '<p class="text-center text-neutral-500 py-4">Aucune conversation</p>';
            return;
        }

        container.innerHTML = conversations.map(conv => {
            const partner = conv.partner;
            const lastMsg = conv.lastMessage;
            const isSelf = lastMsg.sender === appData.currentUser.id;
            const preview = (isSelf ? 'Vous: ' : '') + lastMsg.content;

            return `
            <div onclick="openConversation('${partner._id}', '${partner.name}')" 
                 class="p-4 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer flex items-center space-x-3 transition-colors ${currentChatUserId === partner._id ? 'bg-primary-50' : ''}">
                <div class="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center text-neutral-500 font-bold">
                    ${partner.name.charAt(0).toUpperCase()}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-baseline mb-1">
                        <h4 class="font-bold text-neutral-900 truncate">${partner.name}</h4>
                        <span class="text-xs text-neutral-400">${formatDate(lastMsg.createdAt)}</span>
                    </div>
                    <p class="text-sm text-neutral-500 truncate ${!lastMsg.read && !isSelf ? 'font-bold text-neutral-900' : ''}">
                        ${preview}
                    </p>
                </div>
            </div>
            `;
        }).join('');
    }).catch(err => {
        container.innerHTML = '<p class="text-center text-red-500 py-4">Erreur de chargement</p>';
        showToast("Erreur chargement conversations: " + err.message, 'error');
    });
}

function openConversation(userId, userName) {
    currentChatUserId = userId;
    document.getElementById('chatUserName').textContent = userName;

    // UI toggle
    document.getElementById('chatHeader').classList.remove('hidden');
    document.getElementById('chatMessages').classList.remove('hidden');
    document.getElementById('chatInputArea').classList.remove('hidden');
    document.getElementById('chatEmptyState').classList.add('hidden');

    // Highlight active
    renderConversations(); // Re-render to highlight selected

    renderMessages(userId);
}

function renderMessages(userId) {
    const container = document.getElementById('chatMessages');

    JibliData.getMessages(userId).then(messages => {
        container.innerHTML = messages.map(msg => {
            const isMe = msg.sender._id === appData.currentUser.id || msg.sender === appData.currentUser.id;
            return `
            <div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
                <div class="max-w-[70%] rounded-lg px-4 py-2 ${isMe ? 'bg-primary text-white' : 'bg-white border border-neutral-200'}">
                    <p>${msg.content}</p>
                    <div class="text-xs mt-1 ${isMe ? 'text-primary-100' : 'text-neutral-400'} text-right">
                        ${new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
            `;
        }).join('');

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;

        // Mark as read if they are from other person
        // Simple check: if last message is not from me and not read
        if (messages.length > 0) {
            const last = messages[messages.length - 1];
            if (last.sender !== appData.currentUser.id && !last.read) {
                JibliData.markAsRead(userId);
            }
        }
    }).catch(err => {
        showToast("Erreur lors du chargement des messages", 'error');
    });
}

function handleSendMessage(event) {
    event.preventDefault();
    const input = document.getElementById('messageInput');
    const content = input.value.trim();

    if (!content || !currentChatUserId) return;

    JibliData.sendMessage(currentChatUserId, content).then(msg => {
        input.value = '';
        renderMessages(currentChatUserId); // Refresh messages
        renderConversations(); // Update list preview
    }).catch(err => {
        showToast("Erreur lors de l'envoi : " + err.message, 'error');
    });
}

if (typeof module !== 'undefined') {
    module.exports = {
        renderUserTrips,
        renderUserRequests,
        handleDeleteTrip,
        handleDeleteRequest,
        openEditTripModal,
        openEditRequestModal,
        switchDashboardTab,
        openConversation,
        handleSendMessage
    };
}
