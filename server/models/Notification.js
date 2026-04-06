const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['ORDER_STATUS', 'NEW_ORDER', 'ARTWORK_PURCHASED', 'ARTWORK_UPDATED', 'SYSTEM'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        // Could be an Order ID or Artwork ID depending on the notification type
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
