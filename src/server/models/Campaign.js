const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    salesPerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    socialMedia: {
        type: String,
        enum: ['facebook', 'instagram'],
        required: true
    },
    type: {
        type: String,
        enum: ['post', 'event', 'live_post'],
        required: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null  // null = no end date (always active)
    },
    effectiveDate: {
        type: Date,
        default: Date.now
    },
    targetROI: {
        type: Number,
        min: 0,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field to determine if campaign is currently active
campaignSchema.virtual('isActive').get(function () {
    if (this.status === 'deleted') return false;
    const now = new Date();
    if (this.startDate && now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;
    return true;
});

// Index for faster queries by salesPerson
campaignSchema.index({ salesPerson: 1 });
campaignSchema.index({ status: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);
