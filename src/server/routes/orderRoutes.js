const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { Order, Campaign, User } = require('../models');
const { auth, requireRole } = require('../middleware/auth');
const { logActivity } = require('./activityRoutes');

// Auth required for all routes
router.use(auth);

// GET /api/orders - List orders
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const campaignId = req.query.campaign || '';
        const searchTerm = req.query.search || '';

        const query = { deletedAt: null };

        // Add search filter for product names
        if (searchTerm) {
            query['items.name'] = { $regex: searchTerm, $options: 'i' };
        }

        // Sales person can only see orders from their campaigns
        if (req.user.role === 'sales_person') {
            const myCampaigns = await Campaign.find({
                salesPerson: req.user._id,
                status: 'active'
            }).select('_id');
            const myCampaignIds = myCampaigns.map(c => c._id.toString());

            if (campaignId) {
                // Validate the campaign belongs to this sales person
                if (!myCampaignIds.includes(campaignId)) {
                    return res.status(403).json({ error: 'Access denied to this campaign' });
                }
                query.campaign = campaignId;
            } else {
                // No specific campaign, show all orders from their campaigns
                query.campaign = { $in: myCampaigns.map(c => c._id) };
            }
        } else if (campaignId) {
            // Admin: allow filtering by any campaign
            query.campaign = new mongoose.Types.ObjectId(campaignId);
        }

        if (req.user.role === 'sales_person' && campaignId) {
            // We need to ensure the query.campaign is an ObjectId for aggregation
            query.campaign = new mongoose.Types.ObjectId(campaignId);
        }

        const validSortFields = ['createdAt', 'total', 'commission'];
        const sortBy = validSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        // Determine sort field
        let sortField = sortBy;
        if (sortBy === 'total') sortField = 'totalAmount';
        if (sortBy === 'commission') sortField = 'commission.amount';

        const pipeline = [
            { $match: query },
            // Calculate total amount for sorting
            { $addFields: { totalAmount: { $sum: '$items.totalPrice' } } },
            { $sort: { [sortField]: sortOrder } },
            { $skip: skip },
            { $limit: limit },
            // Populate campaign
            {
                $lookup: {
                    from: 'campaigns',
                    localField: 'campaign',
                    foreignField: '_id',
                    as: 'campaign'
                }
            },
            { $unwind: '$campaign' },
            // Populate sales person
            {
                $lookup: {
                    from: 'users',
                    localField: 'campaign.salesPerson',
                    foreignField: '_id',
                    as: 'campaign.salesPerson'
                }
            },
            {
                $unwind: {
                    path: '$campaign.salesPerson',
                    preserveNullAndEmptyArrays: true
                }
            }
        ];

        const [orders, total] = await Promise.all([
            Order.aggregate(pipeline),
            Order.countDocuments(query)
        ]);

        res.json({
            orders,
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

// GET /api/orders/:id - Get single order
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate({
                path: 'campaign',
                populate: { path: 'salesPerson', select: 'name commissionRate' }
            });

        if (!order || order.deletedAt) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/orders - Create order (Admin or Sales Person for own campaigns)
router.post('/', async (req, res) => {
    try {
        const { campaign: campaignId, items } = req.body;

        // Get campaign and sales person
        const campaign = await Campaign.findById(campaignId)
            .populate('salesPerson', 'commissionRate');

        if (!campaign || campaign.status !== 'active') {
            return res.status(400).json({ error: 'Invalid or inactive campaign' });
        }

        // Authorization check: Admin can create for any, sales_person only for their own
        if (req.user.role === 'sales_person') {
            if (campaign.salesPerson._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'You can only add orders to your own campaigns' });
            }
        }

        // Calculate total and commission
        const orderTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const commissionRate = campaign.salesPerson.commissionRate;
        const commissionAmount = orderTotal * (commissionRate / 100);

        const order = await Order.create({
            campaign: campaignId,
            items,
            commission: {
                amount: commissionAmount,
                rateSnapshot: commissionRate
            }
        });

        const populated = await Order.findById(order._id)
            .populate({
                path: 'campaign',
                select: 'title salesPerson',
                populate: { path: 'salesPerson', select: 'name' }
            });

        res.status(201).json(populated);

        // Log activity
        await logActivity(req.user._id, 'CREATE_ORDER', 'Order', order._id,
            `Order for ${populated.campaign?.title}`,
            { itemCount: items.length, total: orderTotal }, req.ip);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/orders/:id - Update order (Admin only)
router.put('/:id', requireRole('admin'), async (req, res) => {
    try {
        const { items } = req.body;

        const order = await Order.findById(req.params.id)
            .populate({
                path: 'campaign',
                populate: { path: 'salesPerson', select: 'commissionRate' }
            });

        if (!order || order.deletedAt) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Recalculate commission with SNAPSHOT rate (locked at creation)
        const orderTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const snapshotRate = order.commission.rateSnapshot;
        const commissionAmount = orderTotal * (snapshotRate / 100);

        order.items = items;
        order.commission = {
            amount: commissionAmount,
            rateSnapshot: snapshotRate  // Keep the original snapshot
        };
        await order.save();

        const populated = await Order.findById(order._id)
            .populate({
                path: 'campaign',
                select: 'title salesPerson',
                populate: { path: 'salesPerson', select: 'name' }
            });

        res.json(populated);

        // Log activity
        await logActivity(req.user._id, 'UPDATE_ORDER', 'Order', order._id,
            `Order #${order._id}`, { itemCount: items.length, total: orderTotal }, req.ip);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/orders/:id - Soft delete order (Admin only)
router.delete('/:id', requireRole('admin'), async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { deletedAt: new Date() },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order deleted successfully' });

        // Log activity
        await logActivity(req.user._id, 'DELETE_ORDER', 'Order', order._id,
            `Order #${order._id}`, {}, req.ip);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
