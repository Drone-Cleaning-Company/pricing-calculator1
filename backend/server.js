const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Import routes
const calculationsRoute = require('./routes/calculations');

// Use routes
app.use('/api/calculations', calculationsRoute);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));
// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});
// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
