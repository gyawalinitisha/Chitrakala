import React, { useState, useEffect } from 'react';
import ArtworkCard from '../components/ui/ArtworkCard';
import { useGallery } from '../context/GalleryContext';
import { API_URL } from '../config';
import { Link } from 'react-router-dom';
import './Gallery.css';

const categoryNav = [
    { label: 'Paintings', filter: null },
    { label: 'Photography', filter: null },
    { label: 'Sculpture', filter: null },
    { label: 'Drawings', filter: null },
    { label: 'Prints', filter: null },
    { label: 'Traditional', filter: 'Traditional' },
    { label: 'Abstract', filter: 'Abstract' },
    { label: 'Cultural', filter: 'Cultural' },
    { label: 'Curated Deals', filter: null },
];

const Gallery = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeCategoryNav, setActiveCategoryNav] = useState(null);
    const [artists, setArtists] = useState([]);
    const { artworks, loading } = useGallery();

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const res = await fetch(`${API_URL}/auth/artists`);
                if (res.ok) {
                    const data = await res.json();
                    // Get top 3 artists
                    setArtists(data.slice(0, 3));
                }
            } catch (error) {
                console.error("Error fetching artists:", error);
            }
        };

        fetchArtists();
    }, []);

    const getAvatarUrl = (artist) => {
        if (artist.profileImage) {
            return artist.profileImage;
        }
        return `https://ui-avatars.com/api/?name=${artist.name}&background=d4af37&color=000&size=400`;
    };

    const filteredArtworks = activeFilter === 'All'
        ? artworks
        : artworks.filter(art => art.category === activeFilter);

    return (
        <div className="gallery-page">

            {/* ══════════════════════════════════
                CATEGORY NAV BAR (Saatchi-style)
            ══════════════════════════════════ */}
            <nav className="gallery-category-bar">
                <div className="gallery-category-inner">
                    {categoryNav.map(({ label, filter }) => (
                        <button
                            key={label}
                            className={`category-nav-btn ${activeCategoryNav === label ? 'active' : ''}`}
                            onClick={() => {
                                setActiveCategoryNav(label);
                                setActiveFilter(filter || 'All');
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* ══════════════════════════════════
                HERO BANNER
            ══════════════════════════════════ */}
            <section className="gallery-hero">
                <img
                    src="https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=2670&auto=format&fit=crop"
                    alt="Gallery Wall"
                    className="gallery-hero-img"
                />
                <div className="gallery-hero-overlay"></div>
                <div className="gallery-hero-content">
                    <span className="gallery-hero-tag">✦ Chitrakala Originals</span>
                    <h1 className="gallery-hero-title">HANDPICKED FROM NEPAL</h1>
                    <p className="gallery-hero-sub">Artists You Should Know — Curated Exclusively for You</p>
                    <Link to="/gallery" className="gallery-hero-cta">EXPLORE COLLECTION</Link>
                </div>
            </section>

            {/* ══════════════════════════════════
                ARTWORK GRID
            ══════════════════════════════════ */}
            <section className="gallery-grid-section container">
                <div className="gallery-grid-header">
                    <h2 className="gallery-grid-title">
                        {activeCategoryNav || 'All Artworks'}
                    </h2>
                    <span className="gallery-results-count">
                        {loading ? '…' : `${filteredArtworks.length} artwork${filteredArtworks.length !== 1 ? 's' : ''}`}
                    </span>
                </div>

                {loading ? (
                    <div className="gallery-loading">Loading artworks…</div>
                ) : (
                    <div className="artwork-grid animate-fade-in">
                        {filteredArtworks.length > 0 ? (
                            filteredArtworks.map(art => (
                                <ArtworkCard key={art._id || art.id} artwork={art} />
                            ))
                        ) : (
                            <div className="gallery-empty">
                                <h3>No artworks found</h3>
                                <p>Try selecting a different category above</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* ══════════════════════════════════
                MEET THE ARTISTS (Saatchi style)
            ══════════════════════════════════ */}
            <section className="meet-artists-section container">
                <div className="meet-artists-header">
                    <span className="meet-artists-label">✶ Behind the Canvas</span>
                    <h2 className="meet-artists-title">Meet the Artists</h2>
                    <p className="meet-artists-sub">Discover the creators shaping Nepal’s art scene</p>
                    <Link to="/artists" className="meet-artists-view-all">View All Artists →</Link>
                </div>

                {artists.length > 0 ? (
                    <div className="meet-artists-grid">
                        {artists.map(artist => (
                            <Link 
                                key={artist._id} 
                                to={`/artist/${artist._id}`}
                                className="artist-profile-card"
                            >
                                <div className="artist-card-img-wrap">
                                    <img 
                                        src={getAvatarUrl(artist)} 
                                        alt={artist.name} 
                                        className="artist-card-img" 
                                    />
                                </div>
                                <div className="artist-card-body">
                                    <h3 className="artist-card-name">{artist.name}</h3>
                                    <p className="artist-card-role">Artist from Nepal</p>
                                    <p className="artist-card-email">{artist.email}</p>
                                    <div className="artist-card-hover">
                                        VIEW PROFILE →
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        <p>Loading artists...</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Gallery;
