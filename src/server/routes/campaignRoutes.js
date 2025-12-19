const express = require('express');
const router = express.Router();
const { Campaign, User, Order } = require('../models');
const { auth, requireRole } = require('../middleware/auth');
const { logActivity } = require('./activityRoutes');

// Auth required for all routes
router.use(auth);

// GET /api/campaigns - List campaigns
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const platform = req.query.platform || '';
        const type = req.query.type || '';
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const query = { status: 'active' };

        // Sales person can only see their own campaigns
        if (req.user.role === 'sales_person') {
            query.salesPerson = req.user._id;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (platform) {
            query.socialMedia = platform;
        }
        if (type) {
            query.type = type;
        }

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Build sort object
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder;

        const [campaigns, total] = await Promise.all([
            Campaign.find(query)
                .populate('salesPerson', 'name username')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit),
            Campaign.countDocuments(query)
        ]);

        // Get order stats for each campaign
        const campaignIds = campaigns.map(c => c._id);
        const orderStats = await Order.aggregate([
            { $match: { campaign: { $in: campaignIds }, deletedAt: null } },
            {
                $group: {
                    _id: '$campaign',
                    orderCount: { $sum: 1 },
                    totalSales: { $sum: { $sum: '$items.totalPrice' } },
                    totalCommission: { $sum: '$commission.amount' }
                }
            }
        ]);

        // Map stats to campaigns
        const statsMap = orderStats.reduce((acc, stat) => {
            acc[stat._id.toString()] = stat;
            return acc;
        }, {});

        const campaignsWithStats = campaigns.map(c => ({
            ...c.toObject(),
            stats: statsMap[c._id.toString()] || { orderCount: 0, totalSales: 0, totalCommission: 0 }
        }));

        res.json({
            campaigns: campaignsWithStats,
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

// GET /api/campaigns/:id - Get single campaign
router.get('/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id)
            .populate('salesPerson', 'name username commissionRate');

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Sales person can only see their own
        if (req.user.role === 'sales_person' &&
            campaign.salesPerson._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(campaign);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/campaigns - Create campaign (Admin only)
router.post('/', requireRole('admin'), async (req, res) => {
    try {
        const { title, salesPerson, socialMedia, type, url, imageUrl, effectiveDate, targetROI, startDate, endDate } = req.body;

        // Verify sales person exists and has correct role
        const user = await User.findById(salesPerson);
        if (!user || user.role !== 'sales_person') {
            return res.status(400).json({ error: 'Invalid sales person' });
        }

        const campaign = await Campaign.create({
            title,
            salesPerson,
            socialMedia,
            type,
            url,
            imageUrl,
            effectiveDate: effectiveDate || new Date(),
            targetROI: targetROI || null,
            startDate: startDate || new Date(),
            endDate: endDate || null
        });

        const populated = await Campaign.findById(campaign._id)
            .populate('salesPerson', 'name username');

        res.status(201).json(populated);

        // Log activity
        await logActivity(req.user._id, 'CREATE_CAMPAIGN', 'Campaign', campaign._id, campaign.title,
            { salesPerson: user.name, socialMedia, type }, req.ip);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/campaigns/:id - Update campaign (Admin only)
router.put('/:id', requireRole('admin'), async (req, res) => {
    try {
        const { title, socialMedia, type, url, imageUrl, startDate, endDate } = req.body;
        // Note: salesPerson cannot be changed

        const campaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            { title, socialMedia, type, url, imageUrl, startDate, endDate },
            { new: true, runValidators: true }
        ).populate('salesPerson', 'name username');

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.json(campaign);

        // Log activity
        await logActivity(req.user._id, 'UPDATE_CAMPAIGN', 'Campaign', campaign._id, campaign.title,
            { socialMedia, type }, req.ip);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/campaigns/:id - Soft delete campaign (Admin only)
router.delete('/:id', requireRole('admin'), async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            { status: 'deleted' },
            { new: true }
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Also soft delete all orders under this campaign
        await Order.updateMany(
            { campaign: campaign._id },
            { deletedAt: new Date() }
        );

        res.json({ message: 'Campaign and associated orders deleted successfully' });

        // Log activity
        await logActivity(req.user._id, 'DELETE_CAMPAIGN', 'Campaign', campaign._id, campaign.title,
            {}, req.ip);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/campaigns/:id/orders - Get orders for a campaign
router.get('/:id/orders', async (req, res) => {
    try {
        const orders = await Order.find({
            campaign: req.params.id,
            deletedAt: null
        }).sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
