const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    getUserByName,
    getAllArtists,
    getArtistById,
    updateProfileImage,
    googleAuth,
    updateProfile,
    changePassword,
    toggleFollow,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/user/:name', getUserByName);
router.get('/artists', getAllArtists);
router.get('/artists/:id', getArtistById);
router.put('/profile-image', protect, updateProfileImage);
router.post('/google', googleAuth);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/artists/:id/follow', protect, toggleFollow);

module.exports = router;
