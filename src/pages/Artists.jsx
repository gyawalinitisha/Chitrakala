import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { Mail, MapPin } from 'lucide-react';
import './Artists.css';

const Artists = () => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/auth/artists`);
                if (res.ok) {
                    const data = await res.json();
                    setArtists(data);
                }
            } catch (error) {
                console.error("Error fetching artists:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArtists();
    }, []);

    const getAvatarUrl = (artist) => {
        if (artist.profileImage) {
            return artist.profileImage;
        }
        return `https://ui-avatars.com/api/?name=${artist.name}&background=d4af37&color=000`;
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="artists-page page-content">
            {/* Background */}
            <div className="artists-bg-1" />
            <div className="artists-bg-2" />

            {/* Header */}
            <div className="container artists-header">
                <span className="artists-label">✦ Our Community</span>
                <h1 className="artists-title">Meet the Artists</h1>
                <p className="artists-subtitle">Discover the talented creators shaping Nepal's art scene</p>
            </div>

            {/* Artists Grid */}
            <div className="container">
                {loading ? (
                    <div className="loading-state">Loading artists...</div>
                ) : artists.length > 0 ? (
                    <div className="artists-grid">
                        {artists.map(artist => (
                            <Link key={artist._id} to={`/artist/${artist._id}`} className="artist-card animate-fade-in">
                                <div className="artist-card-image">
                                    {artist.profileImage ? (
                                        <img src={artist.profileImage} alt={artist.name} className="artist-avatar-img" />
                                    ) : (
                                        <div className="artist-avatar-placeholder">
                                            <span>{getInitials(artist.name)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="artist-card-info">
                                    <h3 className="artist-card-name">{artist.name}</h3>
                                    <div className="artist-card-meta">
                                        <span className="meta-item">
                                            <Mail size={14} />
                                            {artist.email.substring(0, 20)}...
                                        </span>
                                        <span className="meta-item">
                                            <MapPin size={14} />
                                            Kathmandu, Nepal
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No artists found yet. Be the first!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Artists;
