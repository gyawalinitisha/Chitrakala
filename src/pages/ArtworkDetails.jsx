import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useGallery } from '../context/GalleryContext';
import { useChat } from '../context/ChatContext';
import { ArrowLeft, ShoppingBag, MessageCircle, Shield, RotateCcw, Award } from 'lucide-react';
import './ArtworkDetails.css';

const ArtworkDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { artworks } = useGallery();
    const { openChat } = useChat();

    const artwork = artworks.find(a => {
        // Handle both API format (MongoDB _id) and localStorage format (id)
        return a._id?.toString() === id || a.id?.toString() === id;
    });

    if (!artwork) {
        return (
            <div className="artwork-details-page container" style={{ paddingTop: '10rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Artwork not found
            </div>
        );
    }

    // Handle artist as string or object
    const artistName = typeof artwork.artist === 'string' ? artwork.artist : artwork.artist?.name || 'Unknown Artist';
    // Handle price formatting
    const displayPrice = typeof artwork.price === 'number' ? `NRP ${artwork.price.toLocaleString('en-IN')}` : artwork.price;

    const handleAddToCart = () => {
        console.log("Adding artwork to collection:", artwork);
        addToCart(artwork);
        
        // Immediate confirmation for user
        // alert(`"${artwork.title}" added to collection!`); 
        
        setTimeout(() => {
            navigate('/cart');
        }, 800); 
    };

    const handleChat = () => {
        openChat(artwork);
    };

    return (
        <div className="artwork-details-page">
            <div className="container">
                {/* Back Button */}
                <div className="back-btn-row">
                    <button className="details-back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={15} />
                        Back to Gallery
                    </button>
                </div>

                {/* Main Grid */}
                <div className="details-grid">

                    {/* ── LEFT: Artwork Image ── */}
                    <div className="artwork-image-container">
                        <img src={artwork.image} alt={artwork.title} />
                    </div>

                    {/* ── RIGHT: Info Panel ── */}
                    <div className="artwork-info">

                        {/* Category Tag */}
                        <span className="details-category-tag">{artwork.category}</span>

                        {/* Title */}
                        <h1 className="details-title">{artwork.title}</h1>

                        {/* Artist Profile Card */}
                        <div className="artist-profile-card">
                            <div className="artist-profile-left">
                                <div className="artist-avatar-wrap">
                                    <img
                                        src={artwork.artistImage || `https://ui-avatars.com/api/?name=${artistName}&background=d4af37&color=000`}
                                        alt={artistName}
                                        className="artist-avatar"
                                    />
                                    <div className="verified-badge" title="Verified Artist">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="artist-name-wrap">
                                    <p>Created by</p>
                                    <h3>{artistName}</h3>
                                </div>
                            </div>
                            <button className="chat-action-btn" onClick={handleChat} title="Chat with Artist">
                                <MessageCircle size={18} />
                            </button>
                        </div>

                        {/* Price */}
                        <p className="details-price">{displayPrice}</p>

                        {/* Meta Stats */}
                        <div className="details-meta-row">
                            <div className="meta-item">
                                <span className="meta-label">Medium</span>
                                <span className="meta-value">Digital Art</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Category</span>
                                <span className="meta-value">{artwork.category}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Edition</span>
                                <span className="meta-value">1 of 1</span>
                            </div>
                        </div>

                        {/* Description */}
                        <hr className="details-divider" />
                        <p className="details-description">
                            Experience the depth and emotion of <strong>"{artwork.title}"</strong>. A unique original artwork by {artistName} that
                            explores the breathtaking beauty of Nepal's landscapes and culture. Each piece is a one-of-a-kind
                            creation, capturing a moment that lives forever in color and form.
                        </p>

                        {/* Actions */}
                        <div className="details-actions">
                            <button className="btn-add-cart" onClick={handleAddToCart}>
                                <ShoppingBag size={18} />
                                Add to Collection
                            </button>
                            <button className="btn-chat-artist" onClick={handleChat}>
                                <MessageCircle size={18} />
                                Chat with Artist
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="details-trust">
                            <div className="trust-badge">
                                <Shield size={14} />
                                <span>Secure Checkout</span>
                            </div>
                            <div className="trust-badge">
                                <RotateCcw size={14} />
                                <span>Easy Returns</span>
                            </div>
                            <div className="trust-badge">
                                <Award size={14} />
                                <span>Verified Artist</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtworkDetails;
