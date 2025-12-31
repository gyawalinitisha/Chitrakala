import React, { useState } from 'react';
import ArtworkCard from '../components/ui/ArtworkCard';
import { useGallery } from '../context/GalleryContext';
import { Filter } from 'lucide-react';
import './Gallery.css';

const Gallery = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const { artworks, loading } = useGallery();
    const categories = ['All', 'Landscape', 'Cityscape', 'Traditional', 'Abstract'];

    if (loading) return <div className="page-content container">Loading Gallery...</div>;

    const filteredArtworks = activeFilter === 'All'
        ? artworks
        : artworks.filter(art => art.category === activeFilter);

    return (
        <div className="page-content container gallery-page">
            <header className="gallery-header">
                <h1>Gallery Collection</h1>
                <p>Explore unique artworks from across Nepal.</p>
            </header>

            <div className="gallery-controls">
                <div className="filter-scroll">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`filter-btn ${activeFilter === activeFilter && cat === activeFilter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <button className="filter-toggle-mobile"><Filter size={20} /></button>
            </div>

            <div className="artwork-grid animate-fade-in">
                {filteredArtworks.map(art => (
                    <ArtworkCard key={art.id} artwork={art} />
                ))}
            </div>
        </div>
    );
};

export default Gallery;
