const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    getUserByName,
    getAllArtists,
    updateProfileImage,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/user/:name', getUserByName);
router.get('/artists', getAllArtists);
router.put('/profile-image', protect, updateProfileImage);

module.exports = router;
