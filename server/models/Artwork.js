const mongoose = require('mongoose');

const artworkSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
    },
    image: {
        type: String,
        required: [true, 'Please add an image URL'],
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    widthCm: {
        type: Number,
        default: null,
    },
    heightCm: {
        type: Number,
        default: null,
    },
    isSold: {
        type: Boolean,
        default: false,
    },
    isApproved: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Artwork', artworkSchema);
