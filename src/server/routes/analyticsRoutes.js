const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Order = require('../models/Order');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

// Get campaign analytics
router.get('/campaigns', auth, requireRole('admin'), async (req, res) => {
    try {
        const campaigns = await Campaign.find({ status: 'active' })
            .populate('salesPerson', 'name commissionRate')
            .lean();

        const campaignAnalytics = await Promise.all(campaigns.map(async (campaign) => {
            const orders = await Order.find({ campaign: campaign._id }).lean();

            const totalSales = orders.reduce((sum, order) =>
                sum + order.items.reduce((s, item) => s + item.totalPrice, 0), 0);
            const totalCommission = orders.reduce((sum, order) =>
                sum + (order.commission?.amount || 0), 0);
            const orderCount = orders.length;
            const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;
            const commissionRate = totalSales > 0 ? (totalCommission / totalSales) * 100 : 0;
            const netRevenue = totalSales - totalCommission;

            return {
                _id: campaign._id,
                title: campaign.title,
                salesPerson: campaign.salesPerson,
                socialMedia: campaign.socialMedia,
                type: campaign.type,
                metrics: {
                    totalSales,
                    totalCommission,
                    orderCount,
                    avgOrderValue,
                    commissionRate: commissionRate.toFixed(2),
                    netRevenue
                }
            };
        }));

        // Sort by net revenue descending
        campaignAnalytics.sort((a, b) => b.metrics.netRevenue - a.metrics.netRevenue);

        res.json({
            campaigns: campaignAnalytics,
            summary: {
                totalCampaigns: campaignAnalytics.length,
                totalSales: campaignAnalytics.reduce((sum, c) => sum + c.metrics.totalSales, 0),
                totalCommission: campaignAnalytics.reduce((sum, c) => sum + c.metrics.totalCommission, 0),
                totalNetRevenue: campaignAnalytics.reduce((sum, c) => sum + c.metrics.netRevenue, 0)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get analytics for current sales person (their own campaigns)
router.get('/my-campaigns', auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const campaigns = await Campaign.find({ salesPerson: userId, status: 'active' })
            .populate('salesPerson', 'name commissionRate')
            .lean();

        const campaignAnalytics = await Promise.all(campaigns.map(async (campaign) => {
            const orders = await Order.find({ campaign: campaign._id }).lean();

            const totalSales = orders.reduce((sum, order) =>
                sum + order.items.reduce((s, item) => s + item.totalPrice, 0), 0);
            const totalCommission = orders.reduce((sum, order) =>
                sum + (order.commission?.amount || 0), 0);
            const orderCount = orders.length;
            const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;
            const commissionRate = totalSales > 0 ? (totalCommission / totalSales) * 100 : 0;

            return {
                _id: campaign._id,
                title: campaign.title,
                socialMedia: campaign.socialMedia,
                type: campaign.type,
                metrics: {
                    totalSales,
                    totalCommission,
                    orderCount,
                    avgOrderValue,
                    commissionRate: commissionRate.toFixed(2)
                }
            };
        }));

        // Sort by total sales descending
        campaignAnalytics.sort((a, b) => b.metrics.totalSales - a.metrics.totalSales);

        res.json({
            campaigns: campaignAnalytics,
            summary: {
                totalCampaigns: campaignAnalytics.length,
                totalSales: campaignAnalytics.reduce((sum, c) => sum + c.metrics.totalSales, 0),
                totalCommission: campaignAnalytics.reduce((sum, c) => sum + c.metrics.totalCommission, 0)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get sales person analytics
router.get('/sales-persons', auth, requireRole('admin'), async (req, res) => {
    try {
        const salesPersons = await User.find({ role: 'sales_person' }).lean();

        const salesPersonAnalytics = await Promise.all(salesPersons.map(async (sp) => {
            const campaigns = await Campaign.find({ salesPerson: sp._id, status: 'active' }).lean();
            const campaignIds = campaigns.map(c => c._id);
            const orders = await Order.find({ campaign: { $in: campaignIds } }).lean();

            const totalSales = orders.reduce((sum, order) =>
                sum + order.items.reduce((s, item) => s + item.totalPrice, 0), 0);
            const totalCommission = orders.reduce((sum, order) =>
                sum + (order.commission?.amount || 0), 0);
            const orderCount = orders.length;
            const campaignCount = campaigns.length;
            const avgSalePerCampaign = campaignCount > 0 ? totalSales / campaignCount : 0;
            const efficiencyRatio = totalCommission > 0 ? totalSales / totalCommission : 0;

            return {
                _id: sp._id,
                name: sp.name,
                username: sp.username,
                commissionRate: sp.commissionRate,
                metrics: {
                    totalSales,
                    totalCommission,
                    orderCount,
                    campaignCount,
                    avgSalePerCampaign,
                    efficiencyRatio: efficiencyRatio.toFixed(2)
                }
            };
        }));

        // Sort by total sales descending
        salesPersonAnalytics.sort((a, b) => b.metrics.totalSales - a.metrics.totalSales);

        res.json({
            salesPersons: salesPersonAnalytics,
            summary: {
                totalSalesPersons: salesPersonAnalytics.length,
                totalSales: salesPersonAnalytics.reduce((sum, sp) => sum + sp.metrics.totalSales, 0),
                totalCommission: salesPersonAnalytics.reduce((sum, sp) => sum + sp.metrics.totalCommission, 0)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get summary for dashboard
router.get('/summary', auth, requireRole('admin'), async (req, res) => {
    try {
        const orders = await Order.find().lean();
        const campaigns = await Campaign.find({ status: 'active' }).lean();

        const totalSales = orders.reduce((sum, order) =>
            sum + order.items.reduce((s, item) => s + item.totalPrice, 0), 0);
        const totalCommission = orders.reduce((sum, order) =>
            sum + (order.commission?.amount || 0), 0);

        // Find top campaign
        const campaignSales = {};
        for (const order of orders) {
            const cid = order.campaign.toString();
            if (!campaignSales[cid]) campaignSales[cid] = 0;
            campaignSales[cid] += order.items.reduce((s, item) => s + item.totalPrice, 0);
        }

        let topCampaignId = null;
        let topCampaignSales = 0;
        for (const [cid, sales] of Object.entries(campaignSales)) {
            if (sales > topCampaignSales) {
                topCampaignSales = sales;
                topCampaignId = cid;
            }
        }

        const topCampaign = campaigns.find(c => c._id.toString() === topCampaignId);

        res.json({
            totalSales,
            totalCommission,
            totalNetRevenue: totalSales - totalCommission,
            totalOrders: orders.length,
            totalCampaigns: campaigns.length,
            topCampaign: topCampaign ? {
                title: topCampaign.title,
                sales: topCampaignSales
            } : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// AI Summary - Uses Gemini API if configured, otherwise falls back to rules-based insights
router.get('/ai-summary', auth, requireRole('admin'), async (req, res) => {
    try {
        const campaigns = await Campaign.find({ status: 'active' })
            .populate('salesPerson', 'name commissionRate')
            .lean();
        const salesPersons = await User.find({ role: 'sales_person' }).lean();

        // Calculate metrics
        const campaignMetrics = await Promise.all(campaigns.map(async (c) => {
            const orders = await Order.find({ campaign: c._id }).lean();
            const totalSales = orders.reduce((sum, o) =>
                sum + o.items.reduce((s, i) => s + i.totalPrice, 0), 0);
            const totalCommission = orders.reduce((sum, o) =>
                sum + (o.commission?.amount || 0), 0);
            const commissionRate = totalSales > 0 ? (totalCommission / totalSales) * 100 : 0;
            return { title: c.title, salesPerson: c.salesPerson?.name || 'Unknown', totalSales, totalCommission, commissionRate, orderCount: orders.length };
        }));

        const salesMetrics = await Promise.all(salesPersons.map(async (sp) => {
            const spCampaigns = await Campaign.find({ salesPerson: sp._id, status: 'active' }).lean();
            const campaignIds = spCampaigns.map(c => c._id);
            const orders = await Order.find({ campaign: { $in: campaignIds } }).lean();
            const totalSales = orders.reduce((sum, o) =>
                sum + o.items.reduce((s, i) => s + i.totalPrice, 0), 0);
            const totalCommission = orders.reduce((sum, o) =>
                sum + (o.commission?.amount || 0), 0);
            return { name: sp.name, commissionRate: sp.commissionRate, totalSales, totalCommission, campaignCount: spCampaigns.length };
        }));

        const totalSales = campaignMetrics.reduce((sum, c) => sum + c.totalSales, 0);
        const totalCommission = campaignMetrics.reduce((sum, c) => sum + c.totalCommission, 0);

        // Try Gemini API if configured
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
            try {
                const prompt = `Analyze this sales data and provide 1-2 brief insights (max 100 words total):

Campaign Performance:
${campaignMetrics.slice(0, 5).map(c => `- ${c.title}: RM${c.totalSales.toFixed(0)} sales, ${c.commissionRate.toFixed(1)}% commission`).join('\n')}

Sales Team:
${salesMetrics.slice(0, 3).map(s => `- ${s.name}: RM${s.totalSales.toFixed(0)} sales, ${s.campaignCount} campaigns`).join('\n')}

Totals: RM${totalSales.toFixed(0)} sales, RM${totalCommission.toFixed(0)} commission

Focus on: top performer, campaign to review, or actionable recommendation. Be concise.`;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { maxOutputTokens: 150, temperature: 0.7 }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (aiText) {
                        return res.json({ summary: aiText.trim(), source: 'gemini' });
                    }
                }
            } catch (aiError) {
                console.error('Gemini API error:', aiError.message);
                // Fall through to rules-based
            }
        }

        // Fallback: Rules-based insights
        const insights = [];

        // Top sales person
        const topSales = salesMetrics.sort((a, b) => b.totalSales - a.totalSales)[0];
        if (topSales && topSales.totalSales > 0) {
            insights.push(`🏆 Top performer: ${topSales.name} with RM ${topSales.totalSales.toFixed(2)} in sales.`);
        }

        // Top campaign
        const topCampaign = campaignMetrics.sort((a, b) => b.totalSales - a.totalSales)[0];
        if (topCampaign && topCampaign.totalSales > 0) {
            insights.push(`📈 Best campaign: "${topCampaign.title}" with RM ${topCampaign.totalSales.toFixed(2)} sales.`);
        }

        // Lowest efficiency campaign (consider killing)
        const campaignsWithSales = campaignMetrics.filter(c => c.totalSales > 0);
        if (campaignsWithSales.length > 1) {
            const lowestEfficiency = campaignsWithSales.sort((a, b) => b.commissionRate - a.commissionRate)[0];
            if (lowestEfficiency.commissionRate > 20) {
                insights.push(`⚠️ Review: "${lowestEfficiency.title}" has high ${lowestEfficiency.commissionRate.toFixed(1)}% commission rate.`);
            }
        }

        // High commission alert
        const avgRate = salesPersons.reduce((sum, sp) => sum + (sp.commissionRate || 0), 0) / salesPersons.length;
        const highCommission = salesPersons.filter(sp => sp.commissionRate > avgRate + 5);
        if (highCommission.length > 0) {
            insights.push(`💰 ${highCommission.length} sales person(s) above avg (${avgRate.toFixed(1)}%) commission rate.`);
        }

        res.json({
            summary: insights.join(' ') || 'No data available for insights.',
            insights,
            source: 'rules'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get trends data (weekly/monthly)
router.get('/trends', auth, async (req, res) => {
    try {
        const { period = 'weekly', months = 6 } = req.query;
        const isAdmin = req.user.role === 'admin';

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - parseInt(months));

        // Build match query
        const matchQuery = {
            createdAt: { $gte: startDate, $lte: endDate },
            deletedAt: null
        };

        // For sales person, filter to their campaigns only
        if (!isAdmin) {
            const Campaign = require('../models/Campaign');
            const myCampaigns = await Campaign.find({ salesPerson: req.user._id }).select('_id');
            matchQuery.campaign = { $in: myCampaigns.map(c => c._id) };
        }

        // Aggregate orders by time period
        const groupFormat = period === 'monthly'
            ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
            : { $dateToString: { format: "%Y-W%V", date: "$createdAt" } };

        const trends = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: groupFormat,
                    totalSales: { $sum: { $sum: "$items.totalPrice" } },
                    totalCommission: { $sum: "$commission.amount" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    period: "$_id",
                    totalSales: 1,
                    totalCommission: 1,
                    orderCount: 1,
                    netRevenue: { $subtract: ["$totalSales", "$totalCommission"] }
                }
            }
        ]);

        res.json({
            trends,
            period,
            startDate,
            endDate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;


