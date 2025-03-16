const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const calculationRoutes = require('./routes/calculations');
const authRoutes = require('./routes/auth');
const userManagerRoutes = require('./routes/userManager');
const verifyEndpoint = require('./verifyEndpoint');
const registerUser = require('./registerController');

const app = express();

// Debug middleware to log all requests with more detail
app.use((req, res, next) => {
    console.log('Incoming request:');
    console.log(`- Method: ${req.method}`);
    console.log(`- URL: ${req.url}`);
    console.log(`- Headers:`, req.headers);
    next();
});

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Registration route
app.post('/register', registerUser);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Mount API routes first
console.log('Mounting API routes...');

// API Routes
app.use('/api/calculations', calculationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/userManager', userManagerRoutes);

// Verification route
app.use('/api/verify', verifyEndpoint);

// Direct route for email verification from email links
app.get('/verify', (req, res) => {
    const token = req.query.token;
    console.log('Redirecting from /verify to verification page with token:', token);
    if (token) {
        res.redirect(`/verify-email.html?token=${token}`);
    } else {
        res.redirect('/verify-email.html');
    }
});

// Direct route for verification-email path
app.get('/verify-email', (req, res) => {
    const token = req.query.token;
    console.log('Redirecting from /verify-email to verification page with token:', token);
    if (token) {
        res.redirect(`/verify-email.html?token=${token}`);
    } else {
        res.redirect('/verify-email.html');
    }
});

// Specific route for verification page to ensure it's accessible
app.get('/verify-email.html', (req, res) => {
    console.log('Serving verification page with query params:', req.query);
    res.sendFile(path.join(__dirname, 'frontend', 'verify-email.html'));
});

// Log mounted routes
console.log('Routes mounted:');
console.log('- /api/calculations');
console.log('- /api/calculations/all');
console.log('- /api/auth');
console.log('- /api/userManager');
console.log('- /api/verify (Email verification endpoint)');

// Serve static files last
app.use(express.static(path.join(__dirname, 'frontend')));

// Default routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// 404 handler
app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.url);
    res.status(404).json({ message: 'Route not found' });
});

// Start the server
const PORT = process.env.PORT || 5001;

// Start the server and log the full URL
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Available routes:');
    console.log('- GET /api/userManager/count');
    console.log('- GET /api/userManager/users');
    console.log('- GET /api/calculations');
    console.log('- GET /api/calculations/all');
});
