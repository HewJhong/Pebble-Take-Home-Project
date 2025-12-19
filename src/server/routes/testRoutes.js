const express = require('express');
const router = express.Router();
const { User, Campaign, Order } = require('../models');

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

// === USER ROUTES ===
router.post('/user', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === CAMPAIGN ROUTES ===
router.post('/campaign', async (req, res) => {
    try {
        const campaign = await Campaign.create(req.body);
        res.status(201).json(campaign);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/campaigns', async (req, res) => {
    try {
        const campaigns = await Campaign.find().populate('salesPerson', 'name username');
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === ORDER ROUTES ===
router.post('/order', async (req, res) => {
    try {
        const order = await Order.create(req.body);
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().populate({
            path: 'campaign',
            populate: { path: 'salesPerson', select: 'name' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
