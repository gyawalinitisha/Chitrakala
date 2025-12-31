import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useGallery } from '../context/GalleryContext';
import Button from '../components/ui/Button';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import './ArtworkDetails.css';

const ArtworkDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { artworks } = useGallery();

    // Find artwork by ID (handle both string and number types)
    const artwork = artworks.find(a => a.id.toString() === id);

    if (!artwork) {
        return <div className="container page-content">Artwork not found</div>;
    }

    const handleAddToCart = () => {
        addToCart(artwork);
        // Optional: Show toast or feedback
        console.log(`Added ${artwork.title} to cart`);
    };

    return (
        <div className="page-content artwork-details-page">
            <div className="container">
                <Button variant="outline" className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} className="mr-2" /> Back to Gallery
                </Button>

                <div className="details-grid">
                    <div className="artwork-image-container animate-fade-in">
                        <img src={artwork.image} alt={artwork.title} className="artwork-full-image" />
                    </div>

                    <div className="artwork-info animate-slide-up">
                        <h1 className="artwork-title">{artwork.title}</h1>
                        <p className="artwork-artist">by {artwork.artist}</p>

                        <div className="artwork-meta">
                            <span className="artwork-price">NRP {artwork.price}</span>
                            <span className="artwork-category">{artwork.category}</span>
                        </div>

                        <p className="artwork-description">
                            Experience the depth and emotion of "{artwork.title}".
                            A unique digital creation that explores the boundaries of imagination and reality.
                            (Description placeholder for {artwork.title})
                        </p>

                        <div className="action-buttons">
                            <Button size="lg" className="buy-btn" onClick={handleAddToCart}>
                                <ShoppingBag size={20} className="mr-2" /> Add to Collection
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtworkDetails;
