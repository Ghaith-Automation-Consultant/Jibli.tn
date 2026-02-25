/**
 * Jibli.tn Data Store & API Client
 * Manages application state and server communication.
 */

const JibliData = {
    // State
    trips: [],
    requests: [],
    languages: {
        "fr": {
            "nav": {
                "home": "Accueil",
                "trips": "Voyages",
                "requests": "Demandes",
                "dashboard": "Dashboard",
                "howItWorks": "Comment ça marche"
            },
            "hero": {
                "title": "Transportez ce qui compte entre Tunisiens",
                "subtitle": "La plateforme peer-to-peer qui connecte la diaspora tunisienne avec la Tunisie pour le transport d'objets",
                "publishTrip": "Publier un voyage",
                "makeRequest": "Faire une demande"
            }
        },
        "ar": {
            "nav": {
                "home": "الرئيسية",
                "trips": "الرحلات",
                "requests": "الطلبات",
                "dashboard": "لوحة التحكم",
                "howItWorks": "كيف تعمل"
            },
            "hero": {
                "title": "نقل ما يهم بين التونسيين",
                "subtitle": "المنصة الند للند التي تربط الشتات التونسي بتونس لنقل الأشياء",
                "publishTrip": "نشر رحلة",
                "makeRequest": "تقديم طلب"
            }
        },
        "en": {
            "nav": {
                "home": "Home",
                "trips": "Trips",
                "requests": "Requests",
                "dashboard": "Dashboard",
                "howItWorks": "How it works"
            },
            "hero": {
                "title": "Transport what matters between Tunisians",
                "subtitle": "The peer-to-peer platform connecting the Tunisian diaspora with Tunisia for object transport",
                "publishTrip": "Publish a trip",
                "makeRequest": "Make a request"
            }
        }
    },

    // Token Management
    getToken() {
        return localStorage.getItem('jibli_logged_in') === 'true' ? 'cookie_managed' : null;
    },

    setToken(token) {
        localStorage.setItem('jibli_logged_in', 'true');
    },

    clearToken() {
        localStorage.removeItem('jibli_logged_in');
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => { });
    },

    getAuthHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        // We rely on HttpOnly cookies for auth, so no Bearer token needed here
        return headers;
    },

    // API Methods
    async fetchData(tripParams = {}, requestParams = {}) {
        try {
            // Convert params objects to query strings
            const tripsQuery = new URLSearchParams(tripParams).toString();
            const requestsQuery = new URLSearchParams(requestParams).toString();

            const [tripsRes, requestsRes] = await Promise.all([
                fetch(`/api/trips?${tripsQuery}`),
                fetch(`/api/requests?${requestsQuery}`)
            ]);

            if (tripsRes.ok) {
                const data = await tripsRes.json();
                this.trips = data.data || data; // Fallback for backward compatibility if needed
            }
            if (requestsRes.ok) {
                const data = await requestsRes.json();
                this.requests = data.data || data;
            }

            console.log('Data fetched:', this.trips.length, 'trips,', this.requests.length, 'requests');
            return true;
        } catch (error) {
            console.error('Error fetching data:', error);
            return false;
        }
    },

    async login(email, password) {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            const error = await res.json();
            const errorMessage = error.details ? `${error.error}: ${error.details.join(', ')}` : (error.error || 'Login failed');
            throw new Error(errorMessage);
        }
        const data = await res.json();
        // Set login flag
        if (data.user) {
            this.setToken('true');
        }
        return data;
    },

    async register(userData) {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!res.ok) {
            const error = await res.json();
            const errorMessage = error.details ? `${error.error}: ${error.details.join(', ')}` : (error.error || 'Registration failed');
            throw new Error(errorMessage);
        }
        const data = await res.json();
        // Set login flag
        if (data.user) {
            this.setToken('true');
        }
        return data;
    },

    logout() {
        this.clearToken();
    },

    async createTrip(tripData) {
        const res = await fetch('/api/trips', {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(tripData)
        });
        if (!res.ok) throw new Error('Failed to create trip');
        const newTrip = await res.json();
        this.trips.unshift(newTrip); // Update local state
        return newTrip;
    },

    async createRequest(requestData) {
        const res = await fetch('/api/requests', {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(requestData)
        });
        if (!res.ok) throw new Error('Failed to create request');
        const newRequest = await res.json();
        this.requests.unshift(newRequest); // Update local state
        return newRequest;
    },

    async updateTrip(id, updates) {
        const res = await fetch(`/api/trips/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error('Failed to update trip');
        const updatedTrip = await res.json();
        // Update local state
        const index = this.trips.findIndex(t => t.id == id);
        if (index !== -1) this.trips[index] = updatedTrip;
        return updatedTrip;
    },

    async deleteTrip(id) {
        const res = await fetch(`/api/trips/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete trip');
        // Update local state
        this.trips = this.trips.filter(t => t.id != id);
        return true;
    },

    async updateRequest(id, updates) {
        const res = await fetch(`/api/requests/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error('Failed to update request');
        const updatedRequest = await res.json();
        // Update local state
        const index = this.requests.findIndex(r => r.id == id);
        if (index !== -1) this.requests[index] = updatedRequest;
        return updatedRequest;
    },

    async deleteRequest(id) {
        const res = await fetch(`/api/requests/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete request');
        // Update local state
        this.requests = this.requests.filter(r => r.id != id);
        return true;
    },

    async updateUser(id, updates) {
        const res = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error('Failed to update user');
        return await res.json();
    },

    async getUser(id) {
        const res = await fetch(`/api/users/${id}`, {
            headers: this.getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch user');
        return await res.json();
    },

    async getMe() {
        return this.getUser('me');
    },

    async updateMe(updates) {
        return this.updateUser('me', updates);
    },

    async changePassword(oldPassword, newPassword) {
        const res = await fetch('/api/users/me/password', {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ oldPassword, newPassword })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Erreur lors du changement de mot de passe');
        }
        return await res.json();
    },

    async getStats() {
        const res = await fetch('/api/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        return await res.json();
    },

    // Messaging Methods
    async getConversations() {
        const res = await fetch('/api/messages/conversations', {
            headers: this.getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch conversations');
        return await res.json();
    },

    async getMessages(userId) {
        const res = await fetch(`/api/messages/${userId}`, {
            headers: this.getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch messages');
        return await res.json();
    },

    async sendMessage(receiverId, content) {
        const res = await fetch('/api/messages', {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ receiverId, content })
        });
        if (!res.ok) throw new Error('Failed to send message');
        return await res.json();
    },

    async markAsRead(userId) {
        const res = await fetch(`/api/messages/${userId}/read`, {
            method: 'PUT',
            headers: this.getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to mark messages as read');
        return await res.json();
    }
};

if (typeof module !== 'undefined') {
    module.exports = JibliData;
}
