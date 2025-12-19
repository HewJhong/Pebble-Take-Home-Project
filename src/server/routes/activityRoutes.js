const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { auth, requireRole } = require('../middleware/auth');

// Get activity logs (admin only)
router.get('/', auth, requireRole('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 20, action, user } = req.query;

        const query = {};
        if (action) query.action = action;
        if (user) query.user = user;

        const skip = (page - 1) * limit;

        const [activities, total] = await Promise.all([
            ActivityLog.find(query)
                .populate('user', 'name username')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            ActivityLog.countDocuments(query)
        ]);

        res.json({
            activities,
            pagination: {
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Helper function to log activity (used by other routes)
const logActivity = async (userId, action, targetType, targetId, targetName, details, ipAddress) => {
    try {
        await ActivityLog.create({
            user: userId,
            action,
            targetType,
            targetId,
            targetName,
            details,
            ipAddress
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

module.exports = router;
module.exports.logActivity = logActivity;
