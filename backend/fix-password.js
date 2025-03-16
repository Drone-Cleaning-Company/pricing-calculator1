require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const User = require('./models/user');

async function fixPassword() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get username and new password from command line arguments
        const username = process.argv[2];
        const newPassword = process.argv[3];
        
        if (!username || !newPassword) {
            console.error('Please provide both username and new password as arguments');
            console.error('Usage: node fix-password.js <username> <new-password>');
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
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(newPassword, salt);
        
        // Update the user's password directly in the database
        await User.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
        );
        
        // Verify the update
        const updatedUser = await User.findOne({ username });
        
        console.log(`Password updated successfully for ${username}`);
        console.log(`New password: ${newPassword}`);
        console.log(`New password hash: ${updatedUser.password}`);
        
        // Test the password comparison
        const isMatch = await bcryptjs.compare(newPassword, updatedUser.password);
        console.log(`Password comparison test: ${isMatch ? 'SUCCESS' : 'FAILED'}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the MongoDB connection
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    }
}

fixPassword();
