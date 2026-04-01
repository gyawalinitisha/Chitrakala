const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
    },
    password: {
        type: String,
        required: false, // Optional for Google Auth users
    },
    role: {
        type: String,
        enum: ['artist', 'collector', 'admin'],
        default: 'collector',
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    profileImage: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
