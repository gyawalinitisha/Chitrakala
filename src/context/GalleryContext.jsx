import React, { createContext, useContext, useState, useEffect } from 'react';
import { artworks as initialArtworks } from '../data/mockData';
import { API_URL } from '../config';

const GalleryContext = createContext();

export const useGallery = () => {
    return useContext(GalleryContext);
};

export const GalleryProvider = ({ children }) => {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch artworks from API
    const fetchArtworks = async () => {
        const handleFallback = () => {
            try {
                const stored = localStorage.getItem('artworks');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        setArtworks(parsed);
                        return;
                    }
                }
            } catch (e) { console.error("Storage fallback failed", e); }
            setArtworks(initialArtworks); // Last resort
        };

        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/artworks`);
            if (res.ok) {
                const data = await res.json();
                console.log("Fetched artworks from API:", data);
                
                if (Array.isArray(data)) {
                    setArtworks(data);
                    // Attempt to save but don't crash if quota is exceeded
                    try {
                        localStorage.setItem('artworks', JSON.stringify(data));
                    } catch (e) {
                        console.warn("Storage quota exceeded, could not cache artworks locally.");
                    }
                } else {
                    handleFallback();
                }
            } else {
                handleFallback();
            }
        } catch (err) {
            console.error("Failed to fetch artworks:", err);
            handleFallback();
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        // Fetch on mount
        fetchArtworks();
    }, []);

    const addArtwork = (newArtwork) => {
        setArtworks(prev => [newArtwork, ...prev]);
    };

    const deleteArtwork = (id) => {
        setArtworks(prev => prev.filter(art => art.id !== id && art._id !== id));
    };

    const value = {
        artworks,
        addArtwork,
        deleteArtwork,
        fetchArtworks,
        loading
    };

    return (
        <GalleryContext.Provider value={value}>
            {children}
        </GalleryContext.Provider>
    );
};
