const express = require('express');
const router = express.Router();
const {
    getStats,
    getUsers,
    deleteUser,
    getArtworks,
    deleteArtwork,
    toggleArtworkApproval,
    getOrders,
    updateOrderStatus,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require a valid JWT + admin role
router.get('/stats',                        protect, admin, getStats);

router.get('/users',                        protect, admin, getUsers);
router.delete('/users/:id',                 protect, admin, deleteUser);

router.get('/artworks',                     protect, admin, getArtworks);
router.delete('/artworks/:id',              protect, admin, deleteArtwork);
router.patch('/artworks/:id/approve',       protect, admin, toggleArtworkApproval);

router.get('/orders',                       protect, admin, getOrders);
router.patch('/orders/:id/status',          protect, admin, updateOrderStatus);

module.exports = router;
