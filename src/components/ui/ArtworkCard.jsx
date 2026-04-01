import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './ArtworkCard.css';

const ArtworkCard = ({ artwork }) => {
    const { title, artist, price, image, id, _id, isSold } = artwork;
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const artistName = typeof artist === 'string' ? artist : artist?.name || 'Unknown';
    const artworkId = _id || id;
    const displayPrice = typeof price === 'number'
        ? `NRP ${price.toLocaleString('en-IN')}`
        : price || 'Price on Request';

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate('/auth', { state: { from: `/artwork/${artworkId}` } });
            return;
        }
        addToCart(artwork);
        navigate('/cart');
    };

    return (
        <div className={`artwork-card animate-fade-in${isSold ? ' card-sold' : ''}`}>
            <div className="card-image-wrapper">
                <Link to={`/artwork/${artworkId}`}>
                    <img src={image} alt={title} className="card-image" loading="lazy" />
                </Link>

                {/* Sold Out ribbon */}
                {isSold && <div className="card-sold-ribbon">Sold Out</div>}

                {/* Overlay — only visible on hover */}
                <div className="card-overlay">
                    <div className="card-actions">
                        <button className="like-btn" aria-label="Add to favorites" onClick={e => e.preventDefault()}>
                            <Heart size={17} />
                        </button>
                        {/* Hide cart button when sold or when user is admin */}
                        {!isSold && user?.role !== 'admin' && (
                            <button className="like-btn" aria-label="Add to cart" onClick={handleAddToCart}>
                                <ShoppingBag size={17} />
                            </button>
                        )}
                    </div>

                    <div className="card-view-wrap">
                        <Link to={`/artwork/${artworkId}`} className="view-btn">View Details</Link>
                    </div>
                </div>
            </div>

            <div className="card-info">
                <h3 className="card-title">{title}</h3>
                <p className="card-artist">by {artistName}</p>
                <p className={`card-price${isSold ? ' card-price-sold' : ''}`}>{displayPrice}</p>
            </div>
        </div>
    );
};

export default ArtworkCard;
