const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        default: 'USA'
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    tokenExpiration: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        // Use bcryptjs consistently
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        if (!candidatePassword) {
            console.error('No candidate password provided for comparison');
            return false;
        }
        
        if (!this.password) {
            console.error('User has no stored password hash');
            return false;
        }
        
        // Use bcryptjs consistently for comparison
        // Make sure both parameters are strings
        const storedPassword = String(this.password);
        const inputPassword = String(candidatePassword);
        
        // Enhanced logging for password debugging
        console.log('Comparing passwords:');
        console.log('- Input password length:', inputPassword.length);
        console.log('- Stored hash length:', storedPassword.length);
        console.log('- Input password type:', typeof inputPassword);
        console.log('- Stored hash type:', typeof storedPassword);
        
        // Use bcryptjs.compare for secure password comparison
        const result = await bcryptjs.compare(inputPassword, storedPassword);
        console.log('Password comparison result:', result);
        
        return result;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        console.error('Error stack:', error.stack);
        return false; // Return false instead of throwing to prevent login failures due to errors
    }
};

// Export the model
const User = mongoose.model('User', userSchema);
module.exports = User;