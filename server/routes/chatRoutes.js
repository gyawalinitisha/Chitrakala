const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware'); // Assuming you have auth middleware

// Get list of conversations (users the current user has chatted with)
router.get('/conversations/all', protect, async (req, res) => {
    try {
        const myId = req.user.id;

        // Find all unique users involved in messages with me
        const messages = await Message.find({
            $or: [{ sender: myId }, { receiver: myId }]
        })
            .sort({ createdAt: -1 })
            .populate('sender', 'name profileImage')
            .populate('receiver', 'name profileImage');

        const conversationsMap = new Map();

        messages.forEach(msg => {
            const otherUser = msg.sender._id.toString() === myId
                ? msg.receiver
                : msg.sender;

            // Check if this user is already in our map
            if (!conversationsMap.has(otherUser._id.toString())) {
                conversationsMap.set(otherUser._id.toString(), {
                    user: otherUser,
                    lastMessage: msg.message,
                    timestamp: msg.createdAt,
                    unread: !msg.readStatus && msg.receiver._id.toString() === myId
                });
            }
        });

        const conversations = Array.from(conversationsMap.values());
        res.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
});

// Mark all unread messages FROM a specific user as read
// Call this when the user opens a chat window with that person
router.patch('/:userId/read', protect, async (req, res) => {
    try {
        const { userId } = req.params;
        const myId = req.user.id;

        await Message.updateMany(
            { sender: userId, receiver: myId, readStatus: false },
            { $set: { readStatus: true } }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Error marking messages as read' });
    }
});

// Get chat history between two users
router.get('/:userId', protect, async (req, res) => {
    try {
        const { userId } = req.params;
        const myId = req.user.id; // From auth middleware

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: userId },
                { sender: userId, receiver: myId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

module.exports = router;
