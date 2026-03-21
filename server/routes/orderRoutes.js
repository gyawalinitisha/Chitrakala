const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

// @desc    Create new order (Checkout)
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
    const { artworks, totalAmount, shippingAddress, paymentMethod } = req.body;

    if (!artworks || artworks.length === 0) {
        return res.status(400).json({ message: 'No artworks in order' });
    }

    try {
        const order = new Order({
            user: req.user._id,
            artworks,
            totalAmount,
            shippingAddress,
            paymentMethod: paymentMethod || 'eSewa Mock',
            paymentStatus: 'Completed' // Mock successful payment
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('artworks');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
