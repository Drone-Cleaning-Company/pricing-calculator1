const express = require('express');
const router = express.Router();
const Calculation = require('../models/Calculation');
const { authMiddleware } = require('../middleware/auth');

// Add CORS headers middleware
const corsHeaders = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
};

// Apply CORS headers to all routes
router.use(corsHeaders);

// Apply auth middleware to all routes
router.use(authMiddleware);

/// POST endpoint to save calculations
router.post('/', async (req, res) => {
    try {
        console.log('Received calculation request:', req.body);
        const { name, totalPrice, discount, totalSqFt, address, country, cleaningType } = req.body;

        // Validate required fields
        if (!name || !totalPrice || !totalSqFt || !address || !country || !cleaningType) {
            console.error('Missing required fields:', { name, totalPrice, totalSqFt, address, country, cleaningType });
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: ['name', 'totalPrice', 'totalSqFt', 'address', 'country', 'cleaningType']
            });
        }

        // Create a new calculation object
        const calculation = new Calculation({
            name,
            totalPrice,
            discount: discount || 0,
            totalSqFt,
            address,
            country,
            cleaningType,
        });

        // Save to MongoDB
        await calculation.save();
        console.log('Calculation saved successfully:', calculation);
        res.status(201).json(calculation);
    } catch (error) {
        console.error('Error saving calculation:', error);
        res.status(400).json({ 
            message: 'Error saving calculation',
            error: error.message 
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const country = req.query.country;
        console.log('Fetching calculations for country:', country);

        if (!country) {
            return res.status(400).json({ 
                message: 'Country parameter is required',
                received: req.query 
            });
        }

        const calculations = await Calculation.find({ country: country }).sort({ createdAt: -1 });
        console.log(`Found ${calculations.length} calculations for ${country}`);
        res.status(200).json(calculations);
    } catch (error) {
        console.error('Error fetching calculations:', error);
        res.status(500).json({ 
            message: 'Error fetching calculations',
            error: error.message 
        });
    }
});

// DELETE endpoint
router.delete('/:id', async (req, res) => {
    try {
        console.log('Attempting to delete calculation:', req.params.id);
        const calculation = await Calculation.findByIdAndDelete(req.params.id);
        
        if (!calculation) {
            console.log('Calculation not found:', req.params.id);
            return res.status(404).json({ message: 'Calculation not found' });
        }
        
        console.log('Calculation deleted successfully:', req.params.id);
        res.status(200).json({ message: 'Calculation deleted successfully' });
    } catch (error) {
        console.error('Error deleting calculation:', error);
        res.status(500).json({ 
            message: 'Error deleting calculation',
            error: error.message 
        });
    }
});

// PUT endpoint to update a calculation
router.put('/:id', async (req, res) => {
    try {
        console.log('Attempting to update calculation:', req.params.id);
        const { totalPrice, discount } = req.body;

        const calculation = await Calculation.findByIdAndUpdate(
            req.params.id,
            { totalPrice: totalPrice, discount: discount },
            { new: true, runValidators: true }
        );

        if (!calculation) {
            console.log('Calculation not found for update:', req.params.id);
            return res.status(404).json({ message: 'Calculation not found' });
        }

        console.log('Calculation updated successfully:', calculation);
        res.status(200).json(calculation);
    } catch (error) {
        console.error('Error updating calculation:', error);
        res.status(400).json({ 
            message: 'Error updating calculation',
            error: error.message 
        });
    }
});

// GET endpoint to fetch all calculations (admin only)
router.get('/all', async (req, res) => {
    try {
        console.log('Accessing /all endpoint, user:', req.user);
        // Check if user is admin
        if (!req.user || !req.user.isAdmin) {
            console.log('Non-admin user attempted to access all calculations');
            return res.status(403).json({ 
                message: 'Access denied. Admin privileges required.' 
            });
        }

        console.log('Admin fetching all calculations');
        const calculations = await Calculation.find().sort({ createdAt: -1 });
        console.log(`Found ${calculations.length} total calculations`);
        res.status(200).json(calculations);
    } catch (error) {
        console.error('Error fetching all calculations:', error);
        res.status(500).json({ 
            message: 'Error fetching all calculations',
            error: error.message 
        });
    }
});

module.exports = router;
