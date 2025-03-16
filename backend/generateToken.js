const crypto = require('crypto');

// Function to generate a verification token
function generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = generateVerificationToken;
