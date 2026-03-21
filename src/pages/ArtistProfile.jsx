import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ArtworkCard from '../components/ui/ArtworkCard';
import Button from '../components/ui/Button';
import { useGallery } from '../context/GalleryContext';
import { API_URL } from '../config';
import { MapPin, Mail, Share2 } from 'lucide-react';
import './ArtistProfile.css';

const ArtistProfile = () => {
    const { id } = useParams();
    const { artworks } = useGallery();
    const [artist, setArtist] = useState(null);
    const [artistArtworks, setArtistArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtist = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/auth/artists`);
                if (res.ok) {
                    const allArtists = await res.json();
                    // Find artist by ID
                    const foundArtist = allArtists.find(a => a._id === id);
                    if (foundArtist) {
                        setArtist(foundArtist);
                        // Filter artworks by this artist
                        const filtered = artworks.filter(art => {
                            const artArtistId = art.artist?._id || art.artist;
                            return artArtistId === foundArtist._id || artArtistId === foundArtist.name;
                        });
                        setArtistArtworks(filtered);
                    }
                }
            } catch (error) {
                console.error("Error fetching artist:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchArtist();
        }
    }, [id, artworks]);

    if (loading) {
        return <div className="page-content container" style={{ paddingTop: '10rem', textAlign: 'center' }}>Loading artist profile...</div>;
    }

    if (!artist) {
        return <div className="page-content container" style={{ paddingTop: '10rem', textAlign: 'center' }}>Artist not found</div>;
    }

    // Generate avatar initials if no profile image
    const initials = artist.name
        ? artist.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';
    
    // Use profile image or generate avatar URL as fallback
    const avatarUrl = artist.profileImage || `https://ui-avatars.com/api/?name=${artist.name}&background=d4af37&color=000`;

    return (
        <div className="artist-profile">
            <div className="profile-header">
                <div className="cover-image">
                    <img src="https://images.unsplash.com/photo-1544084944-152696a63f72?q=80&w=2540&auto=format&fit=crop" alt="Cover" />
                    <div className="cover-overlay"></div>
                </div>

                <div className="container profile-info-wrapper">
                    <div className="profile-avatar">
                        <img src={avatarUrl} alt={artist.name} />
                    </div>

                    <div className="profile-details animate-fade-in">
                        <div className="profile-main">
                            <h1 className="artist-name">{artist.name}</h1>
                            <p className="artist-bio">{artist.bio || 'Talented artist from Nepal'}</p>
                            <div className="artist-meta">
                                <span><MapPin size={16} /> Kathmandu, Nepal</span>
                                <span><Mail size={16} /> {artist.email}</span>
                            </div>
                        </div>

                        <div className="profile-actions">
                            <Button>Follow</Button>
                            <Button variant="secondary"><Share2 size={18} /></Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container profile-body">
                <h2 className="section-title">Portfolio</h2>
                {artistArtworks.length > 0 ? (
                    <div className="artwork-grid">
                        {artistArtworks.map(art => (
                            <ArtworkCard key={art._id || art.id} artwork={art} />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        <p>No artworks yet. Check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArtistProfile;
