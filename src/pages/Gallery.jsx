import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useGallery } from '../context/GalleryContext';
import { API_URL } from '../config';
import ArtworkCard from '../components/ui/ArtworkCard';
import './Gallery.css';

const categoryNav = [
    { label: 'Landscape', filter: 'Landscape' },
    { label: 'Cityscape', filter: 'Cityscape' },
    { label: 'Traditional', filter: 'Traditional' },
    { label: 'Abstract', filter: 'Abstract' },
    { label: 'Digital', filter: 'Digital' },
];

const Gallery = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeCategoryNav, setActiveCategoryNav] = useState('All');
    const [priceFilter, setPriceFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('Newest');
    const [searchTerm, setSearchTerm] = useState('');
    const [artists, setArtists] = useState([]);
    const { artworks, loading, fetchArtworks } = useGallery();

    useEffect(() => {
        fetchArtworks(); // Refreshes gallery inventory whenever this page is opened
        const fetchArtists = async () => {
            try {
                const res = await fetch(`${API_URL}/auth/artists`);
                if (res.ok) {
                    const data = await res.json();
                    setArtists(Array.isArray(data) ? data.slice(0, 3) : []);
                }
            } catch (error) {
                console.error("Error fetching artists:", error);
            }
        };
        fetchArtists();
    }, []);

    const getAvatarUrl = (artist) => {
        if (artist?.profileImage) return artist.profileImage;
        return `https://ui-avatars.com/api/?name=${artist?.name || 'Artist'}&background=d4af37&color=000&size=400`;
    };

    // Safe Numeric Price Extractor
    const getPriceNumber = (p) => {
        if (typeof p === 'number') return p;
        if (typeof p === 'string') {
            const num = parseInt(p.replace(/[^0-9]/g, ''));
            return isNaN(num) ? 0 : num;
        }
        return 0;
    };

    // Resilience Grid Calculation
    let displayedArtworks = Array.isArray(artworks) ? artworks : [];

    // 1. Category Filter
    if (activeFilter !== 'All') {
        displayedArtworks = displayedArtworks.filter(art => art?.category === activeFilter);
    }

    // 2. Search Title Filter
    if (searchTerm && searchTerm.trim()) {
        const lowerSearch = searchTerm.toLowerCase();
        displayedArtworks = displayedArtworks.filter(art => 
            art?.title?.toLowerCase().includes(lowerSearch)
        );
    }

    // 3. Price Filter
    if (priceFilter !== 'All') {
        displayedArtworks = displayedArtworks.filter(art => {
            const p = getPriceNumber(art?.price);
            if (priceFilter === 'Under5000') return p < 5000;
            if (priceFilter === '5000-20000') return p >= 5000 && p <= 20000;
            if (priceFilter === 'Over20000') return p > 20000;
            return true;
        });
    }

    // 4. Sorting
    displayedArtworks = [...displayedArtworks].sort((a, b) => {
        if (sortOrder === 'Newest') {
            return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
        }
        const pA = getPriceNumber(a?.price);
        const pB = getPriceNumber(b?.price);
        if (sortOrder === 'PriceLowHigh') return pA - pB;
        if (sortOrder === 'PriceHighLow') return pB - pA;
        return 0;
    });

    return (
        <div className="gallery-page">
            <section className="gallery-hero">
                <img
                    src="https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=2544&auto=format&fit=crop"
                    alt="Gallery Wall"
                    className="gallery-hero-img"
                />
                <div className="gallery-hero-overlay"></div>
                <div className="gallery-hero-content">
                    <span className="gallery-hero-tag">✦ Chitrakala Originals</span>
                    <h1 className="gallery-hero-title">HANDPICKED FROM NEPAL</h1>
                    <p className="gallery-hero-sub">Artists You Should Know — Curated Exclusively for You</p>
                    <button className="gallery-hero-cta" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>EXPLORE COLLECTION</button>
                </div>
            </section>

            {/* Category Nav Bar */}
            <nav className="gallery-category-bar">
                <div className="gallery-category-inner">
                    <button
                        className={`category-nav-btn ${activeCategoryNav === 'All' ? 'active' : ''}`}
                        onClick={() => { setActiveCategoryNav('All'); setActiveFilter('All'); }}
                    >
                        All Artworks
                    </button>
                    {categoryNav.map(({ label, filter }) => (
                        <button
                            key={label}
                            className={`category-nav-btn ${activeCategoryNav === label ? 'active' : ''}`}
                            onClick={() => { setActiveCategoryNav(label); setActiveFilter(filter); }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </nav>

            <section className="gallery-grid-section container">
                <div className="gallery-grid-header">
                    <h2 className="gallery-grid-title">{activeCategoryNav === 'All' ? 'All Collection' : activeCategoryNav}</h2>
                    <span className="gallery-results-count">
                        {loading ? '…' : `${displayedArtworks.length} artwork${displayedArtworks.length !== 1 ? 's' : ''}`}
                    </span>
                </div>

                {/* Search Bar */}
                <div className="gallery-search-wrap">
                    <div className="search-input-box">
                        <Search className="search-icon" size={20} />
                        <input 
                            type="text" 
                            placeholder="Find your masterpiece..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="clear-search" onClick={() => setSearchTerm('')}>
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="gallery-filters-bar">
                    <div className="filter-group">
                        <label>Price:</label>
                        <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
                            <option value="All">All Prices</option>
                            <option value="Under5000">Under NPR 5,000</option>
                            <option value="5000-20000">NPR 5,000 - 20,000</option>
                            <option value="Over20000">Over NPR 20,000</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Sort By:</label>
                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="Newest">Newest</option>
                            <option value="PriceLowHigh">Price: Low to High</option>
                            <option value="PriceHighLow">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="gallery-loading">Loading artworks…</div>
                ) : (
                    <div className="artwork-grid animate-fade-in">
                        {displayedArtworks.length > 0 ? (
                            displayedArtworks.map(art => (
                                <ArtworkCard key={art?._id || art?.id} artwork={art} />
                            ))
                        ) : (
                            <div className="gallery-empty">
                                <h3>No artworks found</h3>
                                <p>Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            <section className="meet-artists-section container">
                <div className="meet-artists-header">
                    <span className="meet-artists-label">✶ Behind the Canvas</span>
                    <h2 className="meet-artists-title">Meet the Artists</h2>
                </div>
                {artists.length > 0 ? (
                    <div className="meet-artists-grid">
                        {artists.map(artist => (
                            <Link key={artist._id} to={`/artist/${artist._id}`} className="artist-profile-card">
                                <div className="artist-card-img-wrap">
                                    <img src={getAvatarUrl(artist)} alt={artist.name} className="artist-card-img" />
                                </div>
                                <div className="artist-card-body">
                                    <h3 className="artist-card-name">{artist.name}</h3>
                                    <p className="artist-card-role">Artist from Nepal</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', padding: '2rem' }}>Loading artists...</p>
                )}
            </section>
        </div>
    );
};

export default Gallery;
