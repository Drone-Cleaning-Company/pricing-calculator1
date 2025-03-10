const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Debug middleware for this router
router.use((req, res, next) => {
    console.log(`UserManager Route: ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    next();
});

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
    console.log('Checking admin status:', req.user);
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

// Add CORS headers middleware
const corsHeaders = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
};

// Apply CORS headers to all routes
router.use(corsHeaders);

// Get total number of users
router.get('/count', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Error getting user count' });
    }
});

// Get all users
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclude password field
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error getting users' });
    }
});

// Delete a user (admin only)
router.delete('/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const userIdToDelete = req.params.userId;
        const loggedInUserId = req.user.userId;

        if (userIdToDelete === loggedInUserId) {
            return res.status(400).json({ message: 'You cannot delete the account you are currently logged in as.' });
        }

        await User.findByIdAndDelete(userIdToDelete);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

module.exports = router;
