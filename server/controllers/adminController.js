const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const artistCount = await User.countDocuments({ role: 'artist' });
        // Assuming we will have an Artwork model later, for now we can mock or just send user stats
        // const artworkCount = await Artwork.countDocuments(); 

        res.json({
            userCount,
            artistCount,
            // artworkCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getUsers,
    getStats
};
