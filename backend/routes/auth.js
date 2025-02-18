const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

router.post('/register', async (req, res) => {
    try {
        console.log('Registration attempt:', req.body);  // Log the incoming request

        const { name, email, username, password, country, adminKey } = req.body;
        const isAdmin = adminKey === process.env.ADMIN_KEY;

        // Check if user with the same email already exists
        const existingEmailUser = await User.findOne({ email });
        if (existingEmailUser) {
            console.log('Email already exists:', email);
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Check if user with the same username already exists
        const existingUsernameUser = await User.findOne({ username });
        if (existingUsernameUser) {
            console.log('Username already exists:', username);
            return res.status(400).json({ message: 'User with this username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({
            name,
            email,
            username,
            password: hashedPassword,
            country,
            isAdmin
        });

        // Save the user to the database
        await user.save();
        console.log('User registered successfully:', username);

        res.status(201).json({ message: 'User registered successfully. Redirecting to login page' });

    } catch (error) {
        console.error('Detailed error registering user:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        let redirectURL = '/user.html'; // Default for non-admin
        if (user.isAdmin) {
            redirectURL = '/admin.html';
        }

        res.json({
            message: 'Login successful',
            token: token,
            isAdmin: user.isAdmin,
            redirect: redirectURL,
            country: user.country
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

module.exports = router;
