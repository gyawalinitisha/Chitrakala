import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import './ArtworkCard.css';

const ArtworkCard = ({ artwork }) => {
    const { title, artist, price, image, id } = artwork;

    return (
        <div className="artwork-card animate-fade-in">
            <div className="card-image-wrapper">
                <Link to={`/artwork/${id}`}>
                    <img src={image} alt={title} className="card-image" loading="lazy" />
                </Link>
                <div className="card-overlay">
                    <button className="like-btn" aria-label="Add to favorites">
                        <Heart size={20} />
                    </button>
                    <Link to={`/artwork/${id}`} className="view-btn">View Details</Link>
                </div>
            </div>
            <div className="card-info">
                <h3 className="card-title">{title}</h3>
                <p className="card-artist">by {artist}</p>
                <p className="card-price">{price}</p>
            </div>
        </div>
    );
};

export default ArtworkCard;
