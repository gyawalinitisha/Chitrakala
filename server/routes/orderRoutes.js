const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Artwork = require('../models/Artwork');
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO } = require('../socket');

// @desc    Create new order (Checkout)
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
    const { artworks, totalAmount, shippingAddress, deliveryDetails, paymentMethod } = req.body;

    if (!artworks || artworks.length === 0) {
        return res.status(400).json({ message: 'No artworks in order' });
    }

    // Validate that none of the artworks are already sold
    const artsInDb = await Artwork.find({ _id: { $in: artworks } });
    const alreadySold = artsInDb.filter(a => a.isSold);
    if (alreadySold.length > 0) {
        return res.status(400).json({ 
            message: 'One or more artworks in your cart have already been sold. Please refresh your cart.' 
        });
    }

    if (!deliveryDetails?.name || !deliveryDetails?.address || !deliveryDetails?.city || !deliveryDetails?.phone) {
        return res.status(400).json({ message: 'Please provide complete delivery details' });
    }

    try {
        // Always calculate totalAmount server-side from real DB prices
        const serverTotal = artsInDb.reduce((sum, a) => sum + (Number(a.price) || 0), 0);

        const order = new Order({
            user: req.user._id,
            artworks,
            totalAmount: serverTotal,
            shippingAddress: `${deliveryDetails.address}, ${deliveryDetails.city}`,
            deliveryDetails,
            paymentMethod: paymentMethod || 'Khalti',
            paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed'
        });

        const createdOrder = await order.save();

        // Auto-mark all ordered artworks as sold
        await Artwork.updateMany(
            { _id: { $in: artworks } },
            { $set: { isSold: true } }
        );

        // Notify each artist whose artwork was sold via socket
        try {
            const soldArtworks = await Artwork.find({ _id: { $in: artworks } })
                .select('title artist price')
                .populate('artist', 'name');
            const io = getIO();

            for (const art of soldArtworks) {
                const artistId = String(art.artist?._id || art.artist);
                
                // Add DB Notification for artist
                await Notification.create({
                    recipient: artistId,
                    type: 'ARTWORK_PURCHASED',
                    message: `Your artwork "${art.title}" was purchased!`,
                    referenceId: createdOrder._id
                });

                if (io) {
                    io.to(artistId).emit('artwork_sold', {
                        artworkTitle: art.title,
                        artworkPrice: art.price,
                        buyerName: req.user.name,
                        orderId: createdOrder._id,
                    });
                }
            }

            // Notify Customer
            await Notification.create({
                recipient: req.user._id,
                type: 'NEW_ORDER',
                message: `Your order was placed successfully. Total: Rs. ${serverTotal}`,
                referenceId: createdOrder._id
            });

            // Notify Admins
            const admins = await User.find({ role: 'admin' });
            for (const admin of admins) {
                await Notification.create({
                    recipient: admin._id,
                    type: 'SYSTEM',
                    message: `A new order was placed by ${req.user.name}.`,
                    referenceId: createdOrder._id
                });
            }

        } catch (notifyErr) {
            console.error('Failed to send sold notification:', notifyErr);
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get user's own orders with full artwork details
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate({
                path: 'artworks',
                select: 'title price image artist',
                populate: { path: 'artist', select: 'name' }
            })
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Update order status (artist — only for orders containing their artworks)
// @route   PATCH /api/orders/:id/status
// @access  Private (artist)
router.patch('/:id/status', protect, async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const valid = ['Processing', 'Shipped', 'Delivered'];
        if (!valid.includes(orderStatus)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Fetch order and check the artist owns at least one artwork in it
        const order = await Order.findById(req.params.id).populate('artworks', 'artist');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const ownsArtwork = order.artworks.some(
            art => String(art.artist) === String(req.user._id)
        );
        if (!ownsArtwork) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        order.orderStatus = orderStatus;

        // Auto-complete COD payment when order is delivered
        if (orderStatus === 'Delivered' && order.paymentMethod === 'COD') {
            order.paymentStatus = 'Completed';
        }

        await order.save();

        // Notify customer about order status update
        try {
            await Notification.create({
                recipient: order.user,
                type: 'ORDER_STATUS',
                message: `Your order status has been updated to "${orderStatus}".`,
                referenceId: order._id
            });
        } catch (error) {
            console.error('Failed to create notification for status update:', error);
        }

        const updated = await Order.findById(order._id)
            .populate('user', 'name email')
            .populate({
                path: 'artworks',
                select: 'title price image artist isSold',
                populate: { path: 'artist', select: 'name' }
            });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get orders that contain this artist's artworks
// @route   GET /api/orders/artist-orders
// @access  Private (artist)
router.get('/artist-orders', protect, async (req, res) => {
    try {
        const myArtworkIds = await Artwork.find({ artist: req.user._id }).distinct('_id');
        const orders = await Order.find({ artworks: { $in: myArtworkIds } })
            .populate('user', 'name email')
            .populate({
                path: 'artworks',
                select: 'title price image artist isSold',
                populate: { path: 'artist', select: 'name' }
            })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
