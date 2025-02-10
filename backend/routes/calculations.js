const express = require('express');
const router = express.Router();
const Calculation = require('../models/Calculation');

/// POST endpoint to save calculations
router.post('/', async (req, res) => {
    try {
        const { name, totalPrice, discount, totalSqFt, address } = req.body;

        // Create a new calculation object
        const calculation = new Calculation({
            name,
            totalPrice,
            discount,
            totalSqFt,
            address
        });

        // Save to MongoDB
        await calculation.save();
        res.status(201).json(calculation); // Respond with the saved calculation
    } catch (error) {
        console.error('Error saving calculation:', error.message);
        res.status(400).json({ message: error.message });
    }
});


// GET all endpoint
router.get('/', async (req, res) => {
    try {
        const calculations = await Calculation.find().sort({ createdAt: -1 }); // Sort by date, newest first
        res.status(200).json(calculations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// DELETE endpoint
router.delete('/:id', async (req, res) => {
    try {
        const calculation = await Calculation.findByIdAndDelete(req.params.id);
        if (!calculation) {
            return res.status(404).json({ message: 'Calculation not found' });
        }
        res.status(200).json({ message: 'Calculation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
