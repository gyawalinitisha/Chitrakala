import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGallery } from '../../context/GalleryContext';
import './FeaturedSection.css';

const FeaturedItem = ({ artwork, index }) => {
    const { _id, id, title, artist, description, price, image, isSold } = artwork;
    const artworkId = _id || id;
    const artistName = typeof artist === 'string' ? artist : artist?.name || 'Unknown Artist';
    const displayPrice = typeof price === 'number'
        ? `NPR ${price.toLocaleString('en-IN')}`
        : price || 'Price on Request';
    const isReversed = index % 2 !== 0;

    return (
        <article className={`featured-item${isReversed ? ' featured-item--reversed' : ''}`}>
            <div className="featured-image-wrap">
                <Link to={`/artwork/${artworkId}`} tabIndex={-1}>
                    <img
                        src={image}
                        alt={title}
                        className="featured-image"
                        loading="lazy"
                    />
                </Link>
                {isSold && <span className="featured-sold-badge">Sold</span>}
                <div className="featured-image-overlay" />
            </div>

            <div className="featured-content">
                <span className="featured-label">Featured Work</span>
                <h3 className="featured-title">{title}</h3>
                <p className="featured-artist">by <strong>{artistName}</strong></p>
                {description && (
                    <p className="featured-description">
                        {description.length > 180 ? description.slice(0, 180) + '…' : description}
                    </p>
                )}
                <p className="featured-price">{displayPrice}</p>
                <Link
                    to={`/artwork/${artworkId}`}
                    className="featured-btn"
                >
                    View Details
                </Link>
            </div>
        </article>
    );
};

const FeaturedSection = () => {
    const { artworks, loading } = useGallery();
    const [featured, setFeatured] = useState([]);

    useEffect(() => {
        if (artworks.length > 0) {
            setFeatured(artworks.slice(0, 4));
        }
    }, [artworks]);

    if (loading) {
        return (
            <section className="featured-section container">
                <div className="featured-header">
                    <h2 className="section-title">
                        Featured <span className="text-gold">Masterpieces</span>
                    </h2>
                    <p className="section-subtitle">Hand-picked selections from Nepal's finest creators.</p>
                </div>
                <div className="featured-skeleton-list">
                    {[1, 2].map(n => (
                        <div key={n} className="featured-skeleton" />
                    ))}
                </div>
            </section>
        );
    }

    if (featured.length === 0) return null;

    return (
        <section className="featured-section container">
            <div className="featured-header">
                <h2 className="section-title">
                    Featured <span className="text-gold">Masterpieces</span>
                </h2>
                <p className="section-subtitle">Hand-picked selections from Nepal's finest creators.</p>
            </div>

            <div className="featured-list">
                {featured.map((art, i) => (
                    <FeaturedItem key={art._id || art.id} artwork={art} index={i} />
                ))}
            </div>

            <div className="featured-footer">
                <Link to="/gallery" className="featured-browse-btn">
                    Browse Full Gallery →
                </Link>
            </div>
        </section>
    );
};

export default FeaturedSection;
