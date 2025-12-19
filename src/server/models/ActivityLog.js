const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'login', 'logout',
            'user_create', 'user_update', 'user_delete',
            'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
            'campaign_create', 'campaign_update', 'campaign_delete',
            'CREATE_CAMPAIGN', 'UPDATE_CAMPAIGN', 'DELETE_CAMPAIGN',
            'order_create', 'order_update', 'order_delete',
            'CREATE_ORDER', 'UPDATE_ORDER', 'DELETE_ORDER',
            'commission_change'
        ]
    },
    targetType: {
        type: String,
        enum: ['User', 'Campaign', 'Order', null]
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },
    targetName: String, // Human-readable name of target
    details: {
        type: mongoose.Schema.Types.Mixed // { before, after, etc }
    },
    ipAddress: String
}, {
    timestamps: true
});

// Index for efficient querying
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ action: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
