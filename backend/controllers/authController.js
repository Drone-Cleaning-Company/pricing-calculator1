const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Debug logging
console.log('Current directory:', process.cwd());
console.log('Directory name:', __dirname);
try {
    console.log('Attempting to resolve User model path:', require.resolve('../models/User'));
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
        const { name, email, password, country, username } = req.body;
        console.log('Registration attempt:', { username, email });

        if (!username || !password || !email || !name || !country) {
            console.log('Missing registration fields:', {
                username: !!username,
                password: !!password,
                email: !!email,
                name: !!name,
                country: !!country
            });
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists (either email or username)
        const existingUser = await User.findOne({ 
            $or: [
                { email },
                { username }
            ]
        });
        
        if (existingUser) {
            console.log('User already exists:', {
                existingEmail: existingUser.email === email,
                existingUsername: existingUser.username === username
            });
            return res.status(400).json({ 
                message: existingUser.email === email ? 
                    'Email already registered' : 
                    'Username already taken' 
            });
        }

        // Create new user (password will be hashed by the pre-save middleware)
        const user = new User({
            name,
            email,
            password,
            country,
            username,
            isAdmin: false // Default to non-admin
        });

        await user.save();
        console.log('New user created:', { username, email });

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
            message: 'Registration successful',
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
        console.log('Registration successful:', { username });
        res.status(201).json(response);

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Error during registration', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}; 