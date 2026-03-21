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
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/artworks`);
            if (res.ok) {
                const data = await res.json();
                console.log("Fetched artworks from API:", data);
                
                // If API returns data, use it
                if (Array.isArray(data) && data.length > 0) {
                    setArtworks(data);
                    localStorage.setItem('artworks', JSON.stringify(data));
                } else {
                    // API returned empty, check localStorage first, then use mock data
                    const storedArtworks = localStorage.getItem('artworks');
                    if (storedArtworks) {
                        try {
                            const parsed = JSON.parse(storedArtworks);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                setArtworks(parsed);
                            } else {
                                console.log("Using mock data - no artworks in storage");
                                setArtworks(initialArtworks);
                            }
                        } catch (e) {
                            setArtworks(initialArtworks);
                        }
                    } else {
                        console.log("Using mock data - no data in localStorage");
                        setArtworks(initialArtworks);
                    }
                }
            } else {
                // API request failed - fallback to localStorage or mock data
                console.log("API request failed, falling back to localStorage");
                const storedArtworks = localStorage.getItem('artworks');
                if (storedArtworks) {
                    try {
                        const parsed = JSON.parse(storedArtworks);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setArtworks(parsed);
                        } else {
                            setArtworks(initialArtworks);
                        }
                    } catch (e) {
                        setArtworks(initialArtworks);
                    }
                } else {
                    setArtworks(initialArtworks);
                }
            }
        } catch (err) {
            console.error("Failed to fetch artworks:", err);
            // Fallback to localStorage then mock data
            try {
                const storedArtworks = localStorage.getItem('artworks');
                if (storedArtworks) {
                    const parsed = JSON.parse(storedArtworks);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setArtworks(parsed);
                    } else {
                        setArtworks(initialArtworks);
                    }
                } else {
                    setArtworks(initialArtworks);
                }
            } catch (storageErr) {
                console.error("Failed to parse localStorage:", storageErr);
                setArtworks(initialArtworks);
            }
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
