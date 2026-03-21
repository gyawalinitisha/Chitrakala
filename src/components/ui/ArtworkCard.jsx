import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './ArtworkCard.css';

const ArtworkCard = ({ artwork }) => {
    const { title, artist, price, image, id, _id } = artwork;
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Handle artist as string or object
    const artistName = typeof artist === 'string' ? artist : artist?.name || 'Unknown';
    // Use _id from API or id from localStorage
    const artworkId = _id || id;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(artwork);
        navigate('/cart');
    };

    return (
        <div className="artwork-card animate-fade-in">
            <div className="card-image-wrapper">
                <Link to={`/artwork/${artworkId}`}>
                    <img src={image} alt={title} className="card-image" loading="lazy" />
                </Link>

                {/* Overlay — only visible on hover */}
                <div className="card-overlay">
                    {/* Top-right action icons */}
                    <div className="card-actions">
                        <button className="like-btn" aria-label="Add to favorites" onClick={e => e.preventDefault()}>
                            <Heart size={17} />
                        </button>
                        <button className="like-btn" aria-label="Add to cart" onClick={handleAddToCart}>
                            <ShoppingBag size={17} />
                        </button>
                    </div>

                    {/* Bottom center: view details */}
                    <div className="card-view-wrap">
                        <Link to={`/artwork/${artworkId}`} className="view-btn">View Details</Link>
                    </div>
                </div>
            </div>

            {/* Card Info below image */}
            <div className="card-info">
                <h3 className="card-title">{title}</h3>
                <p className="card-artist">by {artistName}</p>
                <p className="card-price">{price}</p>
            </div>
        </div>
    );
};

export default ArtworkCard;
