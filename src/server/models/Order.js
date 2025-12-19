const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    basePrice: {
        type: Number,
        required: true,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true,
        immutable: true
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'Order must have at least one item'
        }
    },
    commission: {
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        rateSnapshot: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        }
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
orderSchema.index({ campaign: 1 });
orderSchema.index({ deletedAt: 1 });

// Virtual for order total
orderSchema.virtual('orderTotal').get(function () {
    return this.items.reduce((sum, item) => sum + item.totalPrice, 0);
});

module.exports = mongoose.model('Order', orderSchema);
