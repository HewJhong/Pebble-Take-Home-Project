const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { auth, requireRole } = require('../middleware/auth');
const { logActivity } = require('./activityRoutes');

// All routes require admin role
router.use(auth, requireRole('admin'));

// GET /api/users - List users with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const role = req.query.role || '';
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            query.role = role;
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query)
        ]);

        // For sales persons, calculate stats (totalSales, totalCommission)
        const { Campaign, Order } = require('../models');
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const userObj = user.toObject();
            if (user.role === 'sales_person') {
                // Get campaigns for this user
                const campaigns = await Campaign.find({ salesPerson: user._id, status: 'active' }).select('_id');
                const campaignIds = campaigns.map(c => c._id);

                // Get orders for these campaigns
                const orders = await Order.find({ campaign: { $in: campaignIds }, deletedAt: null });

                // Calculate totals
                const totalSales = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.totalPrice, 0), 0);
                const totalCommission = orders.reduce((sum, o) => sum + (o.commission?.amount || 0), 0);

                userObj.stats = { totalSales, totalCommission };
            }
            return userObj;
        }));

        res.json({
            users: usersWithStats,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/users/:id - Get single user
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/users - Create user
router.post('/', async (req, res) => {
    try {
        const { username, password, name, role, commissionRate } = req.body;

        // Check if username exists
        const existing = await User.findOne({ username: username.toLowerCase() });
        if (existing) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const user = await User.create({
            username,
            password,
            name,
            role,
            commissionRate: role === 'sales_person' ? commissionRate : 0
        });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            name: user.name,
            role: user.role,
            commissionRate: user.commissionRate
        });

        // Log activity
        await logActivity(req.user._id, 'CREATE_USER', 'User', user._id, user.name,
            { role: user.role, commissionRate: user.commissionRate }, req.ip);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
    try {
        const { name, role, commissionRate, password } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Track commission rate changes
        const newRate = role === 'sales_person' ? commissionRate : 0;
        if (user.role === 'sales_person' && newRate !== user.commissionRate) {
            user.commissionHistory.push({
                rate: newRate,
                changedAt: new Date(),
                changedBy: req.user?._id || null
            });
        }

        // Update fields
        user.name = name;
        user.role = role;
        user.commissionRate = newRate;

        // If password provided, update it (will be hashed by pre-save hook)
        if (password) {
            user.password = password;
        }

        await user.save();

        res.json({
            _id: user._id,
            username: user.username,
            name: user.name,
            role: user.role,
            commissionRate: user.commissionRate,
            commissionHistory: user.commissionHistory
        });

        // Log activity
        await logActivity(req.user._id, 'UPDATE_USER', 'User', user._id, user.name,
            { role: user.role, commissionRate: user.commissionRate }, req.ip);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /api/users/:id/impact - Get user impact before delete
router.get('/:id/impact', async (req, res) => {
    try {
        const Campaign = require('../models/Campaign');
        const Order = require('../models/Order');

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get campaigns assigned to this user
        const campaigns = await Campaign.find({ salesPerson: req.params.id, deletedAt: null });

        // Get total commission from orders
        const orderStats = await Order.aggregate([
            { $match: { salesPerson: user._id, deletedAt: null } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalCommission: { $sum: '$commission.amount' }
                }
            }
        ]);

        res.json({
            user: { _id: user._id, name: user.name, username: user.username },
            campaigns: campaigns.map(c => ({ _id: c._id, title: c.title })),
            campaignCount: campaigns.length,
            totalOrders: orderStats[0]?.totalOrders || 0,
            totalCommission: orderStats[0]?.totalCommission || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });

        // Log activity
        await logActivity(req.user._id, 'DELETE_USER', 'User', user._id, user.name,
            { role: user.role }, req.ip);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
