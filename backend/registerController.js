const generateVerificationToken = require('./generateToken');
const storeVerificationToken = require('./storeToken');
require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendVerificationEmail(userEmail, token) {
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'dronecleaningcompanyinterns@gmail.com',
            pass: 'mkfn oiob swrf aogl',
        },
    });

    const verificationLink = `https://pricing-calculator1.onrender.com/verify-email.html?token=${token}`;

    let mailOptions = {
        from: 'dronecleaningcompanyinterns@gmail.com',
        to: userEmail,
        subject: 'Verify Your Email',
        text: `Please verify your email by clicking on the following link: ${verificationLink}`,
        html: `<p>Please verify your email by clicking on the following link: <a href="${verificationLink}">${verificationLink}</a></p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
}

async function registerUser(req, res) {
    try {
        // Assume user creation logic here
        const userEmail = req.body.email;
        const userId = req.body.id; // Assume user ID is obtained after creation

        console.log('Registration attempt for:', userEmail);
        console.log('User ID:', userId);

        if (!userEmail || !userId) {
            console.error('Missing required fields:', { email: !!userEmail, id: !!userId });
            return res.status(400).send('Missing required fields for registration');
        }

        // Generate and store token
        const token = generateVerificationToken();
        console.log('Generated token:', token); // Log the generated token
        
        try {
            await storeVerificationToken(userId, token);
            console.log('Token stored successfully');
        } catch (storeError) {
            console.error('Error storing token:', storeError);
            return res.status(500).send('Error storing verification token');
        }

        const verificationLink = `https://pricing-calculator1.onrender.com/verify-email.html?token=${token}`;
        console.log('Verification link:', verificationLink); // Log the verification link

        // Send verification email
        try {
            await sendVerificationEmail(userEmail, token);
            console.log('Verification email sent successfully to:', userEmail);
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            return res.status(500).send('Error sending verification email');
        }

        res.send('Registration successful! Please check your email to verify your account.');
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send('An error occurred during registration.');
    }
}

module.exports = registerUser;
