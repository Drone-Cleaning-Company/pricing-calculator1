require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');

async function resetPassword() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get username and new password from command line arguments
        const username = process.argv[2];
        const newPassword = process.argv[3];
        
        if (!username || !newPassword) {
            console.error('Please provide both username and new password as arguments');
            console.error('Usage: node reset-password.js <username> <new-password>');
            process.exit(1);
        }

        // Find the user
        const user = await User.findOne({ username });
        
        if (!user) {
            console.error(`User with username ${username} not found`);
            process.exit(1);
        }

        console.log(`Found user: ${user.username} (${user.email})`);
        console.log(`Current password hash: ${user.password}`);

        // Manually hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update the user's password directly
        user.password = hashedPassword;
        
        // Save the user without triggering the pre-save hook
        user.isModified = function() { return false; };
        await user.save();
        
        console.log(`Password updated successfully for ${username}`);
        console.log(`New password: ${newPassword}`);
        console.log(`New password hash: ${user.password}`);
        
        // Test the password comparison
        const isMatch = await bcrypt.compare(newPassword, user.password);
        console.log(`Password comparison test: ${isMatch ? 'SUCCESS' : 'FAILED'}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the MongoDB connection
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    }
}

resetPassword();
