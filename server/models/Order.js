const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    artworks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Artwork'
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Khalti', 'COD'],
        default: 'Khalti',
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Completed',
    },
    shippingAddress: {
        type: String,
    },
    deliveryDetails: {
        name:    { type: String },
        address: { type: String },
        city:    { type: String },
        phone:   { type: String },
    },
    orderStatus: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered'],
        default: 'Processing',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
