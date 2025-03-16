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
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.isVerified) {
            return res.status(400).json({ message: 'This account is already verified' });
        }
        
        // Generate new token
        const newToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = newToken;
        user.tokenExpiration = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        
        await user.save();
        
        // Send verification email
        const verificationLink = `https://pricing-calculator1.onrender.com/verify-email?token=${newToken}`;
        
        let mailOptions = {
            from: 'dronecleaningcompanyinterns@gmail.com',
            to: user.email,
            subject: 'Email Verification',
            html: `
                <h1>Verify Your Email</h1>
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                <p>If you did not request this, please ignore this email.</p>
            `
        };
        
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'dronecleaningcompanyinterns@gmail.com',
                pass: 'mkfn oiob swrf aogl'
            },
        });
        
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ message: 'Verification email sent successfully' });
    } catch (error) {
        console.error('Error resending verification email:', error);
        res.status(500).json({ message: 'Failed to resend verification email' });
    }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        
        await user.save();
        
        // Send reset email
        const resetLink = `https://pricing-calculator1.onrender.com/reset-password.html?token=${resetToken}`;
        
        let mailOptions = {
            from: 'dronecleaningcompanyinterns@gmail.com',
            to: user.email,
            subject: 'Password Reset',
            html: `
                <h1>Reset Your Password</h1>
                <p>Please click the link below to reset your password:</p>
                <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you did not request this, please ignore this email.</p>
                <p>This link will expire in 1 hour.</p>
            `
        };
        
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'dronecleaningcompanyinterns@gmail.com',
                pass: 'mkfn oiob swrf aogl'
            },
        });
        
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error('Error sending reset email:', error);
        res.status(500).json({ message: 'Failed to send reset email' });
    }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }
        
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        
        // Update password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();
        
        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Failed to reset password' });
    }
});

module.exports = router;
