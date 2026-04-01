import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArtworkCard from '../components/ui/ArtworkCard';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { API_URL } from '../config';
import { MapPin, Mail, MessageCircle, UserPlus, Palette, Calendar } from 'lucide-react';
import './ArtistProfile.css';

const ArtistProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { openChat } = useChat();

    const [artist, setArtist] = useState(null);
    const [artistArtworks, setArtistArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followed, setFollowed] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (!id) return;
        const fetchAll = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const [artistRes, artworksRes] = await Promise.all([
                    fetch(`${API_URL}/auth/artists/${id}`, { headers }),
                    fetch(`${API_URL}/artworks/artist/${id}`)
                ]);
                if (artistRes.ok) {
                    const data = await artistRes.json();
                    setArtist(data);
                    setFollowerCount(data.followerCount ?? 0);
                    setFollowed(data.isFollowing ?? false);
                }
                if (artworksRes.ok) {
                    const data = await artworksRes.json();
                    setArtistArtworks(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error('Error fetching artist profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    if (loading) {
        return (
            <div className="ap-loading">
                <div className="loading-spinner" />
                <p>Loading artist profile…</p>
            </div>
        );
    }

    if (!artist) {
        return (
            <div className="ap-loading" style={{ color: '#777' }}>
                Artist not found
            </div>
        );
    }

    const isOwnProfile = user?._id === artist._id || user?.id === artist._id;

    const avatarUrl = artist.profileImage ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=d4af37&color=000&size=400`;

    const memberSince = artist.createdAt
        ? new Date(artist.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        : '';

    const soldCount = artistArtworks.filter(a => a.isSold).length;
    const availableCount = artistArtworks.length - soldCount;

    const handleChat = () => {
        if (!user) { navigate('/auth'); return; }
        openChat({
            _id: artist._id,
            name: artist.name,
            artistImage: artist.profileImage
        });
    };

    const filteredArtworks = activeTab === 'sold'
        ? artistArtworks.filter(a => a.isSold)
        : activeTab === 'available'
            ? artistArtworks.filter(a => !a.isSold)
            : artistArtworks;

    return (
        <div className="ap-page">

            {/* ── Cover ─────────────────────────────────────────────── */}
            <div className="ap-cover">
                <img
                    src="https://images.unsplash.com/photo-1544084944-152696a63f72?q=80&w=2540&auto=format&fit=crop"
                    alt="Cover"
                />
                <div className="ap-cover-overlay" />
            </div>

            {/* ── Profile Header ────────────────────────────────────── */}
            <div className="container ap-header-wrap">
                <div className="ap-avatar-col">
                    <div className="ap-avatar">
                        <img src={avatarUrl} alt={artist.name} />
                    </div>
                </div>

                <div className="ap-info-col">
                    {/* Name + role badge */}
                    <div className="ap-name-row">
                        <h1 className="ap-name">{artist.name}</h1>
                        <span className="ap-role-badge">
                            <Palette size={13} /> Artist
                        </span>
                    </div>

                    {/* Bio */}
                    <p className="ap-bio">
                        {artist.bio || 'Talented artist from Nepal, creating meaningful works that celebrate culture and heritage.'}
                    </p>

                    {/* Meta */}
                    <div className="ap-meta">
                        <span><MapPin size={14} /> Kathmandu, Nepal</span>
                        <span><Mail size={14} /> {artist.email}</span>
                        {memberSince && <span><Calendar size={14} /> Member since {memberSince}</span>}
                    </div>

                    {/* Action buttons */}
                    <div className="ap-actions">
                        {!isOwnProfile && (
                            <button className="ap-btn-chat" onClick={handleChat}>
                                <MessageCircle size={16} />
                                Chat with Artist
                            </button>
                        )}
                        {!isOwnProfile && (
                            <button
                                className={`ap-btn-follow ${followed ? 'following' : ''}`}
                                disabled={followLoading}
                                onClick={async () => {
                                    if (!user) { navigate('/auth'); return; }
                                    setFollowLoading(true);
                                    try {
                                        const token = localStorage.getItem('token');
                                        const res = await fetch(`${API_URL}/auth/artists/${id}/follow`, {
                                            method: 'POST',
                                            headers: { Authorization: `Bearer ${token}` },
                                        });
                                        if (res.ok) {
                                            const data = await res.json();
                                            setFollowed(data.isFollowing);
                                            setFollowerCount(data.followers);
                                        }
                                    } catch (err) {
                                        console.error('Follow error:', err);
                                    } finally {
                                        setFollowLoading(false);
                                    }
                                }}
                            >
                                <UserPlus size={16} />
                                {followLoading ? '…' : followed ? 'Following' : 'Follow Artist'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="ap-stats-col">
                    <div className="ap-stat">
                        <strong>{artistArtworks.length}</strong>
                        <span>Artworks</span>
                    </div>
                    <div className="ap-stat-divider" />
                    <div className="ap-stat">
                        <strong>{availableCount}</strong>
                        <span>Available</span>
                    </div>
                    <div className="ap-stat-divider" />
                    <div className="ap-stat">
                        <strong>{soldCount}</strong>
                        <span>Sold</span>
                    </div>
                    <div className="ap-stat-divider" />
                    <div className="ap-stat">
                        <strong>{followerCount}</strong>
                        <span>Followers</span>
                    </div>
                </div>
            </div>

            {/* ── Portfolio ─────────────────────────────────────────── */}
            <div className="container ap-portfolio">
                <div className="ap-portfolio-header">
                    <h2 className="ap-portfolio-title">Portfolio</h2>
                    <div className="ap-tabs">
                        {[
                            { key: 'all',       label: `All (${artistArtworks.length})` },
                            { key: 'available', label: `Available (${availableCount})` },
                            { key: 'sold',      label: `Sold (${soldCount})` },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                className={`ap-tab ${activeTab === tab.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredArtworks.length > 0 ? (
                    <div className="artwork-grid">
                        {filteredArtworks.map(art => (
                            <ArtworkCard key={art._id} artwork={art} />
                        ))}
                    </div>
                ) : (
                    <div className="ap-empty">
                        <p>No artworks in this category yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArtistProfile;
