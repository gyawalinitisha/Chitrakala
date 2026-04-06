const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { getIO } = require('../socket');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const userCount        = await User.countDocuments();
        const artistCount      = await User.countDocuments({ role: 'artist' });
        const artworkCount     = await Artwork.countDocuments();
        const orderCount       = await Order.countDocuments();
        const soldCount        = await Artwork.countDocuments({ isSold: true });
        const pendingOrders    = await Order.countDocuments({ orderStatus: 'Processing' });
        const pendingApprovals = await Artwork.countDocuments({ isApproved: false });

        // Total revenue: recalculate from actual artwork prices for accuracy
        const completedOrders = await Order.find({ paymentStatus: 'Completed' })
            .populate('artworks', 'price');
        const totalRevenue = completedOrders.reduce((sum, order) => {
            const orderTotal = order.artworks.reduce((s, art) => s + (Number(art.price) || 0), 0);
            return sum + orderTotal;
        }, 0);

        res.json({ userCount, artistCount, artworkCount, orderCount, soldCount, pendingOrders, pendingApprovals, totalRevenue });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get basic public stats for Home page
// @route   GET /api/artworks/stats
// @access  Public
const getPublicStats = async (req, res) => {
    try {
        const artistCount = await User.countDocuments({ role: 'artist' });
        const artworkCount = await Artwork.countDocuments({ isApproved: true });
        const soldCount = await Artwork.countDocuments({ isSold: true });
        res.json({ artistCount, artworkCount, soldCount });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ── Users ─────────────────────────────────────────────────────────────────────

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot delete an admin account' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ── Artworks ──────────────────────────────────────────────────────────────────

// @desc    Get all artworks (admin sees all regardless of sold/approval)
// @route   GET /api/admin/artworks
// @access  Private/Admin
const getArtworks = async (req, res) => {
    try {
        const artworks = await Artwork.find()
            .populate('artist', 'name profileImage')
            .sort({ createdAt: -1 });
        res.json(artworks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete any artwork
// @route   DELETE /api/admin/artworks/:id
// @access  Private/Admin
const deleteArtwork = async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
        await Artwork.findByIdAndDelete(req.params.id);
        res.json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Toggle artwork approval (approve / reject)
// @route   PATCH /api/admin/artworks/:id/approve
// @access  Private/Admin
const toggleArtworkApproval = async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
        artwork.isApproved = !artwork.isApproved;
        await artwork.save();

        try {
            const message = artwork.isApproved 
                ? `Your artwork "${artwork.title}" has been approved and published!`
                : `Your artwork "${artwork.title}" approval was revoked and it has been hidden.`;
            
            const notif = await Notification.create({
                recipient: artwork.artist,
                type: 'SYSTEM',
                message,
                referenceId: artwork._id
            });
            const io = getIO();
            if (io) {
                io.to(String(artwork.artist)).emit('new_notification', notif);
            }
        } catch (err) {
            console.error('Failed to send approval notification:', err);
        }

        res.json(artwork);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ── Orders ────────────────────────────────────────────────────────────────────

// @desc    Get all orders with full detail
// @route   GET /api/admin/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
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
};

// @desc    Update order shipping status
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const valid = ['Processing', 'Shipped', 'Delivered'];
        if (!valid.includes(orderStatus)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.orderStatus = orderStatus;

        // Auto-complete COD payment when order is delivered
        if (orderStatus === 'Delivered' && order.paymentMethod === 'COD') {
            order.paymentStatus = 'Completed';
        }

        await order.save();

        const updated = await Order.findById(order._id)
            .populate('user', 'name email')
            .populate('artworks', 'title price');

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getStats,
    getPublicStats,
    getUsers,
    deleteUser,
    getArtworks,
    deleteArtwork,
    toggleArtworkApproval,
    getOrders,
    updateOrderStatus,
};
