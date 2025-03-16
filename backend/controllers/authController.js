const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Debug logging
console.log('Current directory:', process.cwd());
console.log('Directory name:', __dirname);
try {
    console.log('Attempting to resolve User model path:', require.resolve('../models/user'));
} catch (error) {
    console.log('Failed to resolve User model path:', error.message);
    console.log('Available files in models:', require('fs').readdirSync(require('path').join(__dirname, '../models')));
}

const User = require('../models/user');

// Validate JWT_SECRET
if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables');
    process.exit(1);
}

// Function to generate a verification token
function generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Function to send verification email
async function sendVerificationEmail(userEmail, token) {
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'dronecleaningcompanyinterns@gmail.com',
            pass: 'mkfn oiob swrf aogl',
        },
    });

    const verificationLink = `https://pricing-calculator1.onrender.com/verify-email?token=${token}`;
    console.log('Generated verification link:', verificationLink);

    let mailOptions = {
        from: 'dronecleaningcompanyinterns@gmail.com',
        to: userEmail,
        subject: 'Verify Your Email - Drone Cleaning Services',
        text: `Please verify your email by clicking on the following link: ${verificationLink}`,
        html: `<p>Please verify your email by clicking on the following link: <a href="${verificationLink}">${verificationLink}</a></p>`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
}

// Login controller
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt:', { username });

        if (!username || !password) {
            console.log('Missing credentials:', { username: !!username, password: !!password });
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Find user by username
        console.log('Searching for user with username:', username);
        const user = await User.findOne({ username });
        
        if (!user) {
            console.log('User not found:', username);
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        console.log('User found:', { 
            username: user.username,
            hasPassword: !!user.password,
            isAdmin: user.isAdmin
        });

        // Check password using the model's comparePassword method
        const isMatch = await user.comparePassword(password);
        console.log('Password check result:', isMatch);

        if (!isMatch) {
            console.log('Password mismatch for user:', username);
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Create JWT token
        const tokenPayload = { 
            userId: user._id,
            isAdmin: user.isAdmin,
            name: user.name,
            country: user.country
        };
        console.log('Creating token with payload:', tokenPayload);

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send response
        const response = {
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                country: user.country,
                isAdmin: user.isAdmin,
                username: user.username
            }
        };
        console.log('Login successful:', { username, isAdmin: user.isAdmin });
        res.status(200).json(response);

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Error during login', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Register controller
exports.register = async (req, res) => {
    try {
        const { name, email, password, username, country } = req.body;
        
        // Log registration attempt
        console.log('Registration attempt:', { username, email });

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: email },
                { username: username }
            ]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Generate verification token
        const verificationToken = generateVerificationToken();
        
        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username,
            country,
            verificationToken,
            tokenExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        });

        await newUser.save();
        
        // Log new user
        console.log('New user created:', {
            username: newUser.username,
            email: newUser.email,
            userId: newUser._id
        });

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        // Generate JWT token
        const payload = {
            userId: newUser._id,
            isAdmin: newUser.isAdmin,
            name: newUser.name,
            country: newUser.country
        };
        
        console.log('Creating token with payload:', payload);

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Return success response with token
        console.log('Registration successful:', { username: newUser.username });
        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                country: newUser.country,
                isAdmin: newUser.isAdmin,
                isVerified: newUser.isVerified
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};