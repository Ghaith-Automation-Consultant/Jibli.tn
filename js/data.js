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
        return localStorage.getItem('jibli_token');
    },

    setToken(token) {
        localStorage.setItem('jibli_token', token);
    },

    clearToken() {
        localStorage.removeItem('jibli_token');
    },

    getAuthHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    // API Methods
    async fetchData() {
        try {
            const [tripsRes, requestsRes] = await Promise.all([
                fetch('/api/trips'),
                fetch('/api/requests')
            ]);

            if (tripsRes.ok) this.trips = await tripsRes.json();
            if (requestsRes.ok) this.requests = await requestsRes.json();

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
            throw new Error(error.error || 'Login failed');
        }
        const data = await res.json();
        // Store JWT token
        if (data.user && data.user.token) {
            this.setToken(data.user.token);
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
            throw new Error(error.error || 'Registration failed');
        }
        const data = await res.json();
        // Store JWT token
        if (data.user && data.user.token) {
            this.setToken(data.user.token);
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
    }
};
