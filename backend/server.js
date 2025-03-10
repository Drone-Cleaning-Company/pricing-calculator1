const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const calculationRoutes = require('./routes/calculations');
const authRoutes = require('./routes/auth');
const userManagerRoutes = require('./routes/userManager');

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

// Log mounted routes
console.log('Routes mounted:');
console.log('- /api/calculations');
console.log('- /api/calculations/all');
console.log('- /api/auth');
console.log('- /api/userManager');

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
const port = process.env.PORT || 5000;

// Start the server and log the full URL
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log('Available routes:');
    console.log('- GET /api/userManager/count');
    console.log('- GET /api/userManager/users');
    console.log('- GET /api/calculations');
    console.log('- GET /api/calculations/all');
});
