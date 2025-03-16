const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Debug logging
console.log('Current directory:', process.cwd());
console.log('Directory name:', __dirname);
try {
    console.log('Attempting to resolve User model path:', require.resolve('../models/user'));
} catch (error) {
    console.log('Failed to resolve User model path:', error.message);
    console.log('Available files in models:', require('fs').readdirSync(require('path').join(__dirname, '../models')));
}

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
        
        console.log('Login attempt received:', { 
            username: username,
            passwordProvided: !!password,
            passwordLength: password ? password.length : 0
        });
        
        // Validate input
        if (!username || !password) {
            console.log('Missing credentials:', { username: !!username, password: !!password });
            return res.status(400).json({ 
                message: 'Please provide username and password',
                errorType: 'missing_credentials'
            });
        }

        // Find user by username or email
        console.log('Searching for user with username or email:', username);
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        });

        if (!user) {
            console.log('User not found:', username);
            return res.status(401).json({ 
                message: 'Invalid username or password', 
                errorType: 'user_not_found'
            });
        }

        console.log('User found:', {
            id: user._id,
            username: user.username,
            email: user.email,
            isVerified: user.isVerified,
            isAdmin: user.isAdmin,
            passwordExists: !!user.password,
            passwordLength: user.password ? user.password.length : 0
        });

        // Check if user is verified
        if (!user.isVerified) {
            console.log('User not verified:', username);
            return res.status(401).json({ 
                message: 'Account not verified. Please check your email for verification link or request a new one.',
                needsVerification: true,
                email: user.email,
                errorType: 'not_verified'
            });
        }

        // Check password using the model's comparePassword method
        console.log(`Attempting login for user: ${username} with password length: ${password.length}`);
        
        // Enhanced debugging for password comparison
        console.log('Password first 3 chars:', password.substring(0, 3) + '...');
        console.log('Stored hash first 10 chars:', user.password.substring(0, 10) + '...');
        
        try {
            // Use bcryptjs directly for comparison as a fallback if model method fails
            let isMatch = await user.comparePassword(password);
            
            // If the model method fails, try direct comparison as a fallback
            if (!isMatch) {
                console.log('Model comparePassword failed, trying direct bcryptjs.compare...');
                isMatch = await bcryptjs.compare(String(password), String(user.password));
                console.log('Direct bcryptjs comparison result:', isMatch);
            }
            
            console.log('Final password check result:', isMatch);
            
            if (!isMatch) {
                console.log('Password mismatch for user:', username);
                return res.status(401).json({ 
                    message: 'Invalid username or password',
                    errorType: 'password'
                });
            }
        } catch (error) {
            console.error('Error during password comparison:', error);
            return res.status(500).json({ 
                message: 'Error verifying password',
                errorType: 'server_error'
            });
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
            { expiresIn: '1h' }
        );

        // Return success response
        console.log('Login successful for user:', username);
        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                userId: user._id,
                name: user.name,
                isAdmin: user.isAdmin,
                country: user.country,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Error during login', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            errorType: 'server_error'
        });
    }
};

// Register controller
exports.register = async (req, res) => {
    try {
        const { name, email, username, password, country, adminKey } = req.body;
        
        // Validate required fields
        if (!name || !email || !username || !password || !country) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: email },
                { username: username }
            ]
        });
        
        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return res.status(400).json({ message: `User with this ${field} already exists` });
        }
        
        // Check admin key and set isAdmin flag
        let isAdmin = false;
        let adminKeyMessage = "";
        const correctAdminKey = process.env.ADMIN_KEY;
        
        if (adminKey) {
            if (adminKey === correctAdminKey) {
                isAdmin = true;
                adminKeyMessage = "Admin privileges granted";
            } else {
                adminKeyMessage = "Invalid admin key provided";
            }
        }
        
        console.log('Admin key check:', { 
            provided: adminKey ? 'Yes' : 'No',
            isCorrect: isAdmin,
            isAdmin: isAdmin,
            message: adminKeyMessage
        });

        // Generate verification token
        const verificationToken = generateVerificationToken();
        const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        // Create new user with verification token
        // Note: Password will be hashed by the pre-save middleware in the User model
        const newUser = new User({
            name,
            email,
            username,
            password, // This will be hashed by the pre-save middleware
            country,
            isAdmin,
            verificationToken,
            tokenExpiration
        });
        
        // Save the user to the database
        await newUser.save();
        console.log('User created successfully:', { 
            username: newUser.username,
            email: newUser.email,
            isAdmin: newUser.isAdmin
        });

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        // Return success with admin key message if applicable
        return res.status(201).json({ 
            message: 'User registered successfully', 
            adminKeyMessage: adminKeyMessage,
            userId: newUser._id,
            isAdmin: newUser.isAdmin
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};