const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { authMiddleware } = require('../middleware/auth');


// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

// Get all users (admin only)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Delete a user (admin only)
router.delete('/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const userIdToDelete = req.params.userId;
        const loggedInUserId = req.user.userId; // Assuming req.user has userId

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
