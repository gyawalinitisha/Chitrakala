const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all artworks
// @route   GET /api/artworks
// @access  Public
router.get('/', async (req, res) => {
    try {
        const artworks = await Artwork.find().populate('artist', 'name profileImage');
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
        const { title, description, price, image, category } = req.body;
        
        if (!title || !description || !price || !image || !category) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const artwork = await Artwork.create({
            title,
            description,
            price,
            image,
            category,
            artist: req.user._id
        });

        res.status(201).json(artwork);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Update artwork 
// @route   PUT /api/artworks/:id
// @access  Private (Artist only)
router.put('/:id', protect, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);

        if (!artwork) {
            return res.status(404).json({ message: 'Artwork not found' });
        }

        // Check user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the artwork artist
        if (artwork.artist.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to update this artwork' });
        }

        const updatedArtwork = await Artwork.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.status(200).json(updatedArtwork);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Delete artwork
// @route   DELETE /api/artworks/:id
// @access  Private (Artist only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);

        if (!artwork) {
            return res.status(404).json({ message: 'Artwork not found' });
        }

        // Make sure the logged in user matches the artwork artist
        if (artwork.artist.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to delete this artwork' });
        }

        await artwork.remove();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
