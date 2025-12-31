import React, { createContext, useContext, useState, useEffect } from 'react';
import { artworks as initialArtworks } from '../data/mockData';

const GalleryContext = createContext();

export const useGallery = () => {
    return useContext(GalleryContext);
};

export const GalleryProvider = ({ children }) => {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load from local storage or use initial data
        const storedArtworks = localStorage.getItem('artworks');
        if (storedArtworks) {
            setArtworks(JSON.parse(storedArtworks));
        } else {
            setArtworks(initialArtworks);
            localStorage.setItem('artworks', JSON.stringify(initialArtworks));
        }
        setLoading(false);
    }, []);

    // Save to local storage whenever artworks change
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('artworks', JSON.stringify(artworks));
        }
    }, [artworks, loading]);

    const addArtwork = (newArtwork) => {
        setArtworks(prev => [newArtwork, ...prev]);
    };

    const deleteArtwork = (id) => {
        setArtworks(prev => prev.filter(art => art.id !== id));
    };

    const value = {
        artworks,
        addArtwork,
        deleteArtwork,
        loading
    };

    return (
        <GalleryContext.Provider value={value}>
            {!loading && children}
        </GalleryContext.Provider>
    );
};
