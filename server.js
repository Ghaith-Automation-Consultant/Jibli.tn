require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Route Imports
// Route Imports
const tripsRoutes = require('./backend/routes/trips');
const requestsRoutes = require('./backend/routes/requests');
const authRoutes = require('./backend/routes/auth');
const usersRoutes = require('./backend/routes/users');
const connectDB = require('./backend/config/db');

// Connect to Database
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3000',
    credentials: true // allow sending cookies
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('pages')); // Serve static files from pages (temp)
app.use('/js', express.static('js'));
app.use('/css', express.static('css'));
app.use('/assets', express.static('assets'));

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Jibli.tn Backend is running' });
});

app.use('/api/trips', tripsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/messages', require('./backend/routes/messages'));
app.use('/api/stats', require('./backend/routes/stats'));

// Error Handling Middleware
app.use(require('./backend/middleware/error'));

// Start server only if not in test mode
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
