const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/user'); // Fixed case to match actual file
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Add verification endpoint
router.get('/verify-email', async (req, res) => {
    const token = req.query.token;
    console.log('Verification request received with token:', token);

    if (!token) {
        console.error('No token provided in verification request');
        return res.status(400).send('No verification token provided');
    }

    try {
        // Verify token logic with better debugging
        console.log('Searching for user with token:', token);
        
        // First try to find the user with the exact token
        let user = await User.findOne({ 
            verificationToken: token,
            tokenExpiration: { $gt: Date.now() }
        });
        
        if (!user) {
            console.log('No user found with exact token match, trying case-insensitive search');
            
            // If not found, try to find all users and check their tokens manually
            // This helps debug potential case sensitivity issues
            const allUsers = await User.find({
                tokenExpiration: { $gt: Date.now() }
            });
            
            console.log(`Found ${allUsers.length} users with unexpired tokens`);
            
            // Log all tokens for debugging
            allUsers.forEach(u => {
                console.log(`User ${u.email} has token: ${u.verificationToken}`);
                // Check if tokens match case-insensitively
                if (u.verificationToken && u.verificationToken.toLowerCase() === token.toLowerCase()) {
                    console.log('Found matching token with different case');
                    user = u;
                }
            });
        }
        
        if (!user) {
            // Check if there's a user with this token but expired
            const expiredUser = await User.findOne({ verificationToken: token });
            if (expiredUser) {
                console.error('Found user but token is expired:', expiredUser.email);
                return res.status(400).send('Verification token has expired. Please request a new one.');
            }
            
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
        
        // Redirect to the verification success page
        res.redirect('/verify-email.html?verified=true');
    } catch (error) {
        console.error('Error during verification:', error);
        res.status(500).send('An error occurred during verification');
    }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    
    try {
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }
        
        // Generate new verification token
        const newToken = crypto.randomBytes(32).toString('hex');
        
        // Update user with new token
        user.verificationToken = newToken;
        user.tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await user.save();
        
        // Send verification email
        const verificationLink = `https://pricing-calculator1.onrender.com/verify-email?token=${newToken}`;
        
        let mailOptions = {
            from: 'dronecleaningcompanyinterns@gmail.com',
            to: user.email,
            subject: 'Verify Your Email - Drone Cleaning Services',
            text: `Please verify your email by clicking on the following link: ${verificationLink}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #333;">Verify Your Email</h2>
                    <p>Thank you for registering with Drone Cleaning Services. Please verify your email address by clicking the button below:</p>
                    <a href="${verificationLink}" style="display: inline-block; background-color: #4facfe; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
                    <p>If the button doesn't work, you can also click on this link or copy it to your browser:</p>
                    <p><a href="${verificationLink}">${verificationLink}</a></p>
                    <p>This link will expire in 24 hours.</p>
                    <p>Thank you,<br>Drone Cleaning Services Team</p>
                </div>
            `
        };
        
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'dronecleaningcompanyinterns@gmail.com',
                pass: 'mkfn oiob swrf aogl',
            },
        });
        
        await transporter.sendMail(mailOptions);
        
        res.status(200).send('Verification email resent successfully');
    } catch (error) {
        console.error('Error resending verification email:', error);
        res.status(500).send('Error resending verification email');
    }
});

module.exports = router;
