const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

router.post('/register', async (req, res) => {
    try {
        console.log('Registration attempt:', req.body);

        const { name, email, username, password, country, adminKey } = req.body;
        const isAdmin = adminKey === process.env.ADMIN_KEY;

        const existingEmailUser = await User.findOne({ email });
        if (existingEmailUser) {
            console.log('Email already exists:', email);
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const existingUsernameUser = await User.findOne({ username });
        if (existingUsernameUser) {
            console.log('Username already exists:', username);
            return res.status(400).json({ message: 'User with this username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            username,
            password: hashedPassword,
            country,
            isAdmin
        });

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
            { userId: user._id, isAdmin: user.isAdmin, name: user.name }, // Include name
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        let redirectURL = '/user.html';
        if (user.isAdmin) {
            redirectURL = '/admin.html';
        }

        res.json({
            message: 'Login successful',
            token: token,
            isAdmin: user.isAdmin,
            redirect: redirectURL,
            country: user.country,
            name: user.name // Send the name
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

module.exports = router;
