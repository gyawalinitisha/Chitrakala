const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const dotenv = require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');

const port = process.env.PORT || 5000;

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Frontend URL
        methods: ["GET", "POST"]
    }
});

// Socket.io Logic
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`User with ID: ${socket.id} joined room: ${userId}`);
    });

    socket.on('send_message', async (data) => {
        // data: { sender, receiver, receiverName?, message }
        let { sender, receiver, receiverName, message } = data;

        try {
            const Message = require('./models/Message'); // Lazy load to avoid circular dependency issues if any
            const User = require('./models/User');

            // If receiver is not a valid ObjectId, try to resolve by name
            const mongoose = require('mongoose');
            if (!mongoose.Types.ObjectId.isValid(String(receiver))) {
                if (receiverName && typeof receiverName === 'string') {
                    const found = await User.findOne({ name: receiverName }).select('_id');
                    if (found) {
                        receiver = found._id;
                        console.log(`Resolved receiverName ${receiverName} -> ${receiver}`);
                    } else {
                        console.warn(`Could not resolve receiverName to user: ${receiverName}`);
                    }
                }
            }

            // Final validation: receiver must be ObjectId
            if (!mongoose.Types.ObjectId.isValid(String(receiver))) {
                throw new Error(`Invalid receiver id after resolution: ${receiver}`);
            }

            // Save to DB
            const newMessage = await Message.create({ sender, receiver, message });

            console.log(`Message saved:`, newMessage);
            console.log(`Message from ${sender} to ${receiver}`);
            console.log(`Defined room: ${receiver}, Sockets in room:`, io.sockets.adapter.rooms.get(String(receiver))?.size || 0);

            // Emit to receiver's room (artist must be joined to their own room)
            io.to(String(receiver)).emit("receive_message", newMessage);
            console.log(`Message emitted to room: ${receiver}`);
        } catch (error) {
            console.error("Error saving message:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log("User Disconnected", socket.id);
    });
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/artworks', require('./routes/artworkRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Simple root route
app.get('/', (req, res) => {
    res.send('Digital Art Gallery API is running');
});

server.listen(port, () => console.log(`Server started on port ${port}`));
