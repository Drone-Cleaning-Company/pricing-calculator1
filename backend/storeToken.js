const User = require('./models/user'); // Adjust the path as necessary

// Example of storing token in the database
async function storeVerificationToken(userId, token) {
    console.log(`Storing token for user ${userId}:`, { token, expiration: Date.now() + 3600000 });
    // Assume you have a User model with a method to update the user
    await User.update(userId, { verificationToken: token, tokenExpiration: Date.now() + 3600000 }); // 1 hour expiration
    console.log(`Token stored successfully for user ${userId}`);
}

module.exports = storeVerificationToken;
