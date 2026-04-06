const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const Artwork = require('./models/Artwork');

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const totalArtworks = await Artwork.countDocuments();
        const approvedArtworks = await Artwork.countDocuments({ isApproved: true });
        const unapprovedArtworks = await Artwork.countDocuments({ isApproved: false });

        console.log(`Total Artworks: ${totalArtworks}`);
        console.log(`Approved Artworks: ${approvedArtworks}`);
        console.log(`Unapproved Artworks: ${unapprovedArtworks}`);

        const allArtworks = await Artwork.find().populate('artist', 'name');
        console.log('Sample Artworks (first 5):');
        allArtworks.slice(0, 5).forEach(art => {
            console.log(`- ${art.title} (Approved: ${art.isApproved}, Artist: ${art.artist?.name || 'Unknown'})`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
