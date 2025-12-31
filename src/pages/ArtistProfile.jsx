import React from 'react';
import { useParams } from 'react-router-dom';
import ArtworkCard from '../components/ui/ArtworkCard';
import Button from '../components/ui/Button';
import { artworks, artists } from '../data/mockData';
import { MapPin, Mail, Share2 } from 'lucide-react';
import './ArtistProfile.css';

const ArtistProfile = () => {
    const { id } = useParams();
    // Mock data selection - in real app would fetch by ID
    const artist = artists[0];
    const artistArtworks = artworks.slice(0, 4);

    return (
        <div className="artist-profile">
            <div className="profile-header">
                <div className="cover-image">
                    <img src="https://images.unsplash.com/photo-1544084944-152696a63f72?q=80&w=2540&auto=format&fit=crop" alt="Cover" />
                    <div className="cover-overlay"></div>
                </div>

                <div className="container profile-info-wrapper">
                    <div className="profile-avatar">
                        <img src={artist.avatar} alt={artist.name} />
                    </div>

                    <div className="profile-details animate-fade-in">
                        <div className="profile-main">
                            <h1 className="artist-name">{artist.name}</h1>
                            <p className="artist-bio">{artist.bio}</p>
                            <div className="artist-meta">
                                <span><MapPin size={16} /> Kathmandu, Nepal</span>
                                <span><Mail size={16} /> Contact Artist</span>
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
                <div className="artwork-grid">
                    {artistArtworks.map(art => (
                        <ArtworkCard key={art.id} artwork={art} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ArtistProfile;
