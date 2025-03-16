const express = require('express');
const User = require('./models/user'); // Adjust the path as necessary
const router = express.Router();

router.get('/', async (req, res) => {
    const token = req.query.token;
    console.log('Verification request received with token:', token);

    if (!token) {
        console.error('No token provided in verification request');
        return res.status(400).send('No verification token provided');
    }

    try {
        // Verify token logic
        console.log('Searching for user with token:', token);
        const user = await User.findOne({ verificationToken: token, tokenExpiration: { $gt: Date.now() } });
        
        if (!user) {
            console.error('Invalid or expired token:', token);
            return res.status(400).send('Invalid or expired token');
        }

        console.log('User found:', user.email);
        
        // Update user to verified
        user.isVerified = true;
        user.verificationToken = undefined;
        user.tokenExpiration = undefined;
        await user.save();
        
        console.log('User verified successfully:', user.email);
        res.send('Email verified successfully! You can now log in to your account.');
    } catch (error) {
        console.error('Error during verification:', error);
        res.status(500).send('An error occurred during verification');
    }
});

module.exports = router;
