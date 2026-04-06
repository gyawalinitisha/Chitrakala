const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const Artwork = require('./models/Artwork');

const dumpDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const artworks = await Artwork.find().lean();
        console.log(JSON.stringify(artworks, null, 2));
        process.exit();
    } catch (err) {
        process.exit(1);
    }
};

dumpDB();
