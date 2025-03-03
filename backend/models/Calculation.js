const mongoose = require('mongoose');

const calculationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    totalSqFt: {  // Changed from sqFt to totalSqFt
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    country: {
        type: String,
        enum: ['USA', 'Canada', 'Mexico'],
        required: true
    },
    cleaningType: { // Added cleaningType
        type: String,
        enum: ['window', 'facade'],
        required: true
    },
});
module.exports = mongoose.model('Calculation', calculationSchema);
