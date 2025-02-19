const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const calculationRoutes = require('./routes/calculations'); // Import the calculations route
const authRoutes = require('./routes/auth');  // Import your auth routes
const userManagerRoutes = require('./routes/userManager');


const app = express();

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());
app.use('/api/userManager', userManagerRoutes);
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Use API routes
app.use('/api/calculations', calculationRoutes);
app.use('/api/auth', authRoutes); // ADD THIS LINE HERE


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start the server
const port = process.env.PORT || 5000;

// Start the server and log the full URL
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
