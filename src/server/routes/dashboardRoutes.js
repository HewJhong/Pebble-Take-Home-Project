const express = require('express');
const router = express.Router();
const { Order, Campaign } = require('../models');
const { auth, requireRole } = require('../middleware/auth');

// Auth required for all routes
router.use(auth);

// ==========================================
// ADMIN DASHBOARD
// ==========================================

// GET /api/dashboard/admin/stats - Admin dashboard statistics
router.get('/admin/stats', requireRole('admin'), async (req, res) => {
    try {
        const [
            totalUsers,
            totalCampaigns,
            totalOrders,
            orders
        ] = await Promise.all([
            require('../models').User.countDocuments(),
            Campaign.countDocuments({ status: 'active' }),
            Order.countDocuments({ deletedAt: null }),
            Order.find({ deletedAt: null })
        ]);

        const totalSales = orders.reduce((sum, o) =>
            sum + o.items.reduce((s, i) => s + i.totalPrice, 0), 0
        );
        const totalCommission = orders.reduce((sum, o) =>
            sum + (o.commission?.amount || 0), 0
        );

        res.json({
            totalUsers,
            totalCampaigns,
            totalOrders,
            totalSales,
            totalCommission
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// SALES PERSON DASHBOARD
// ==========================================

// GET /api/dashboard/sales/stats - Sales person dashboard statistics
router.get('/sales/stats', requireRole('sales_person'), async (req, res) => {
    try {
        // Get campaigns for this sales person
        const campaigns = await Campaign.find({
            salesPerson: req.user._id,
            status: 'active'
        });

        const campaignIds = campaigns.map(c => c._id);

        // Get orders for these campaigns
        const orders = await Order.find({
            campaign: { $in: campaignIds },
            deletedAt: null
        });

        const totalCampaigns = campaigns.length;
        const totalOrders = orders.length;
        const totalSales = orders.reduce((sum, o) =>
            sum + o.items.reduce((s, i) => s + i.totalPrice, 0), 0
        );
        const totalCommission = orders.reduce((sum, o) =>
            sum + (o.commission?.amount || 0), 0
        );

        res.json({
            totalCampaigns,
            totalOrders,
            totalSales,
            totalCommission
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/dashboard/sales/commissions - List commission by month
router.get('/sales/commissions', requireRole('sales_person'), async (req, res) => {
    try {
        // Get campaigns for this sales person
        const campaigns = await Campaign.find({
            salesPerson: req.user._id,
            status: 'active'
        });

        const campaignIds = campaigns.map(c => c._id);

        // Get all orders for these campaigns, grouped by month
        const orders = await Order.find({
            campaign: { $in: campaignIds },
            deletedAt: null
        }).sort({ createdAt: -1 });

        // Group by year-month
        const monthlyData = {};
        orders.forEach(order => {
            const date = new Date(order.createdAt);
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[yearMonth]) {
                monthlyData[yearMonth] = {
                    yearMonth,
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    totalCommission: 0,
                    orderCount: 0
                };
            }

            monthlyData[yearMonth].totalCommission += order.commission?.amount || 0;
            monthlyData[yearMonth].orderCount += 1;
        });

        // Convert to array and sort by date descending
        const months = Object.values(monthlyData).sort((a, b) =>
            b.yearMonth.localeCompare(a.yearMonth)
        );

        res.json({ months });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/dashboard/sales/commissions/:yearMonth - Monthly commission breakdown
router.get('/sales/commissions/:yearMonth', requireRole('sales_person'), async (req, res) => {
    try {
        const { yearMonth } = req.params;
        const [year, month] = yearMonth.split('-').map(Number);

        if (!year || !month || month < 1 || month > 12) {
            return res.status(400).json({ error: 'Invalid year-month format. Use YYYY-MM' });
        }

        // Get campaigns for this sales person
        const campaigns = await Campaign.find({
            salesPerson: req.user._id,
            status: 'active'
        });

        const campaignIds = campaigns.map(c => c._id);

        // Get orders for the specified month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        const orders = await Order.find({
            campaign: { $in: campaignIds },
            deletedAt: null,
            createdAt: { $gte: startDate, $lt: endDate }
        }).populate('campaign', 'title socialMedia type');

        // Group by campaign
        const campaignBreakdown = {};
        let totalCommission = 0;

        orders.forEach(order => {
            const campaignId = order.campaign._id.toString();

            if (!campaignBreakdown[campaignId]) {
                campaignBreakdown[campaignId] = {
                    campaignId,
                    title: order.campaign.title,
                    socialMedia: order.campaign.socialMedia,
                    type: order.campaign.type,
                    commission: 0,
                    orderCount: 0
                };
            }

            campaignBreakdown[campaignId].commission += order.commission?.amount || 0;
            campaignBreakdown[campaignId].orderCount += 1;
            totalCommission += order.commission?.amount || 0;
        });

        res.json({
            yearMonth,
            year,
            month,
            totalCommission,
            campaigns: Object.values(campaignBreakdown).sort((a, b) => b.commission - a.commission)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
