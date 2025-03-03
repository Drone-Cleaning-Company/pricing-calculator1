const express = require('express');
const router = express.Router();
const Calculation = require('../models/Calculation');

/// POST endpoint to save calculations
router.post('/', async (req, res) => {
    try {
        const { name, totalPrice, discount, totalSqFt, address, country, cleaningType } = req.body;
        console.log("this is the country", country)
        // Create a new calculation object
        const calculation = new Calculation({  // Corrected line: Use lowercase 'calculation'
            name,
            totalPrice,
            discount,
            totalSqFt,
            address,
            country,
            cleaningType,
        });

        // Save to MongoDB
        await calculation.save();
        res.status(201).json(calculation); // Respond with the saved calculation
    } catch (error) {
        console.error('Error saving calculation:', error.message);
        res.status(400).json({ message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const country = req.query.country;
        if (country) {
            const calculations = await Calculation.find({ country: country }).sort({ createdAt: -1 });
            res.status(200).json(calculations);
        } else {
            const calculations = await Calculation.find().sort({ createdAt: -1 });
            res.status(200).json(calculations);
        }
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

// PUT endpoint to update a calculation
router.put('/:id', async (req, res) => {
    try {
        const { totalPrice, discount } = req.body;

        const calculation = await Calculation.findByIdAndUpdate(
            req.params.id,
            { totalPrice: totalPrice, discount: discount },
            { new: true, runValidators: true } // Return the updated document and run validation
        );

        if (!calculation) {
            return res.status(404).json({ message: 'Calculation not found' });
        }

        res.status(200).json(calculation); // Respond with the updated calculation
    } catch (error) {
        console.error('Error updating calculation:', error.message);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
