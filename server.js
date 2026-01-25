const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./backend/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('pages')); // Serve static files from pages (temp)
app.use('/js', express.static('js'));
app.use('/css', express.static('css'));
app.use('/assets', express.static('assets'));

// Routes
// Test route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Jibli.tn Backend is running' });
});

// Trips Routes
app.get('/api/trips', (req, res) => {
    const trips = db.getAll('trips');
    res.json(trips);
});

app.post('/api/trips', (req, res) => {
    const newTrip = req.body;
    // Simple validation
    if (!newTrip.from || !newTrip.to) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const createdTrip = db.add('trips', newTrip);
    res.status(201).json(createdTrip);
});

app.put('/api/trips/:id', (req, res) => {
    const updatedTrip = db.update('trips', req.params.id, req.body);
    if (!updatedTrip) return res.status(404).json({ error: 'Trip not found' });
    res.json(updatedTrip);
});

app.delete('/api/trips/:id', (req, res) => {
    const success = db.remove('trips', req.params.id);
    if (!success) return res.status(404).json({ error: 'Trip not found' });
    res.json({ message: 'Trip deleted' });
});

// Requests Routes
app.get('/api/requests', (req, res) => {
    const requests = db.getAll('requests');
    res.json(requests);
});

app.post('/api/requests', (req, res) => {
    const newRequest = req.body;
    if (!newRequest.item) {
        return res.status(400).json({ error: 'Missing item name' });
    }
    const createdRequest = db.add('requests', newRequest);
    res.status(201).json(createdRequest);
});

app.put('/api/requests/:id', (req, res) => {
    const updatedRequest = db.update('requests', req.params.id, req.body);
    if (!updatedRequest) return res.status(404).json({ error: 'Request not found' });
    res.json(updatedRequest);
});

app.delete('/api/requests/:id', (req, res) => {
    const success = db.remove('requests', req.params.id);
    if (!success) return res.status(404).json({ error: 'Request not found' });
    res.json({ message: 'Request deleted' });
});

// Auth Routes (Mock)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    // Mock authentication: accept any email with password 'password'
    // In real app: hash password, check DB
    if (password === 'password') { // Very secure :)
        const user = {
            id: 1,
            name: "Mohamed User",
            email: email,
            location: "Tunis, Tunisie",
            token: "mock-jwt-token-123"
        };
        res.json({ user });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/auth/register', (req, res) => {
    const { email, name, password } = req.body;
    // Mock registration
    const newUser = {
        email,
        name,
        location: "Tunis, Tunisie", // Default for now
        password: password // In real app, HASH THIS!
    };

    const createdUser = db.add('users', newUser);
    res.status(201).json({ user: createdUser, message: "Registration successful" });
});

// User CRUD
app.get('/api/users/:id', (req, res) => {
    const users = db.getAll('users'); // This might be empty if we don't save users to DB on register yet
    const user = users.find(u => u.id == req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

app.put('/api/users/:id', (req, res) => {
    const updatedUser = db.update('users', req.params.id, req.body);
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json(updatedUser);
});

app.delete('/api/users/:id', (req, res) => {
    const success = db.remove('users', req.params.id);
    if (!success) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
