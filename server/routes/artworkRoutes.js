const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO } = require('../socket');
const { getPublicStats } = require('../controllers/adminController');

// @desc    Get all APPROVED artworks (both sold and available)
// @route   GET /api/artworks
// @access  Public
router.get('/', async (req, res) => {
    try {
        const artworks = await Artwork.find({ isApproved: true })
            .populate('artist', 'name profileImage')
            .sort({ createdAt: -1 });
        res.status(200).json(artworks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get public statistics
// @route   GET /api/artworks/stats
// @access  Public
router.get('/stats', getPublicStats);

// @desc    Get all artworks by a specific artist (public portfolio view)
// @route   GET /api/artworks/artist/:artistId
// @access  Public
// NOTE: must be defined BEFORE /:id
router.get('/artist/:artistId', async (req, res) => {
    try {
        const artworks = await Artwork.find({ artist: req.params.artistId, isApproved: true })
            .populate('artist', 'name profileImage')
            .sort({ createdAt: -1 });
        res.status(200).json(artworks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get all artworks by the authenticated artist (including sold)
// @route   GET /api/artworks/my
// @access  Private (Artist only)
// NOTE: must be defined BEFORE /:id to avoid "my" being treated as an ID
router.get('/my', protect, async (req, res) => {
    try {
        const artworks = await Artwork.find({ artist: req.user._id })
            .populate('artist', 'name profileImage')
            .sort({ createdAt: -1 });
        res.status(200).json(artworks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get a single artwork by ID
// @route   GET /api/artworks/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id).populate('artist', 'name profileImage');
        if (!artwork) {
            return res.status(404).json({ message: 'Artwork not found' });
        }
        res.status(200).json(artwork);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Create new artwork (Only Artists)
// @route   POST /api/artworks
// @access  Private (Artist only)
router.post('/', protect, async (req, res) => {
    if (req.user.role !== 'artist') {
        return res.status(403).json({ message: 'Not authorized as an artist' });
    }

    try {
        const { title, description, price, image, category, width, height } = req.body;

        if (!title || !description || !price || !image || !category) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const artwork = await Artwork.create({
            title,
            description,
            price,
            image,
            category,
            width,
            height,
            artist: req.user._id
        });

        // Notify Admins
        try {
            const io = getIO();
            const admins = await User.find({ role: 'admin' });
            for (const admin of admins) {
                const notif = await Notification.create({
                    recipient: admin._id,
                    type: 'SYSTEM',
                    message: `Artist ${req.user.name} uploaded new artwork "${title}". Review needed.`,
                    referenceId: artwork._id
                });
                if (io) {
                    io.to(String(admin._id)).emit('new_notification', notif);
                }
            }
        } catch (error) {
            console.error('Failed to notify admins of new artwork:', error);
        }

        res.status(201).json(artwork);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Update artwork details
// @route   PUT /api/artworks/:id
// @access  Private (Artist only, must own)
router.put('/:id', protect, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);

        if (!artwork) {
            return res.status(404).json({ message: 'Artwork not found' });
        }

        if (artwork.artist.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to update this artwork' });
        }

        const updatedArtwork = await Artwork.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // Notify artist
        try {
            await Notification.create({
                recipient: req.user._id,
                type: 'ARTWORK_UPDATED',
                message: `Your artwork "${updatedArtwork.title}" was successfully updated.`,
                referenceId: updatedArtwork._id
            });
        } catch (error) {
           console.error('Failed to send notification on artwork update:', error);
        }

        res.status(200).json(updatedArtwork);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Toggle sold status of an artwork
// @route   PATCH /api/artworks/:id/sold
// @access  Private (Artist only, must own)
router.patch('/:id/sold', protect, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);

        if (!artwork) {
            return res.status(404).json({ message: 'Artwork not found' });
        }

        if (artwork.artist.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to update this artwork' });
        }

        artwork.isSold = !artwork.isSold;
        await artwork.save();

        res.status(200).json(artwork);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Delete artwork
// @route   DELETE /api/artworks/:id
// @access  Private (Artist only, must own)
router.delete('/:id', protect, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);

        if (!artwork) {
            return res.status(404).json({ message: 'Artwork not found' });
        }

        if (artwork.artist.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to delete this artwork' });
        }

        await Artwork.findByIdAndDelete(req.params.id);

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
