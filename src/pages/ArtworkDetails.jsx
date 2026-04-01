import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useGallery } from '../context/GalleryContext';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { ArrowLeft, ShoppingBag, MessageCircle, Shield, RotateCcw, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ArtworkCard from '../components/ui/ArtworkCard';
import './ArtworkDetails.css';

const ArtworkDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { artworks } = useGallery();
    const { openChat } = useChat();
    const { user } = useAuth();

    const [artwork, setArtwork] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [tiltStyle, setTiltStyle] = useState({});

    // Fetch this specific artwork directly from the API by ID.
    // This avoids depending on GalleryContext being loaded first, fixes
    // deep-link navigation, and guarantees we always have a real MongoDB _id.
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const fetchArtwork = async () => {
            setPageLoading(true);
            try {
                const res = await fetch(`${API_URL}/artworks/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setArtwork(data);
                } else {
                    setArtwork(null);
                }
            } catch (err) {
                console.error('Failed to fetch artwork:', err);
                setArtwork(null);
            } finally {
                setPageLoading(false);
            }
        };

        fetchArtwork();
    }, [id]);

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / (width / 2);
        const y = (e.clientY - top - height / 2) / (height / 2);
        setTiltStyle({
            transform: `perspective(1000px) rotateX(${y * -15}deg) rotateY(${x * 15}deg) scale3d(1.02, 1.02, 1.02)`,
            transition: 'transform 0.1s ease-out'
        });
    };

    const handleMouseLeave = () => {
        setTiltStyle({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: 'transform 0.5s ease-out'
        });
    };

    const handleAddToCart = () => {
        if (!user) {
            navigate('/auth', { state: { from: `/artwork/${id}` } });
            return;
        }
        addToCart(artwork);
        navigate('/cart');
    };

    const handleChat = () => {
        if (!user) { navigate('/auth'); return; }
        openChat({
            _id: artwork.artist?._id,
            name: artistName,
            artist: artistName,
            artistImage: artwork.artist?.profileImage || artwork.artistImage
        });
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (pageLoading) {
        return (
            <div className="artwork-details-page container" style={{ paddingTop: '10rem', textAlign: 'center', color: '#777' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
                <p>Loading artwork…</p>
            </div>
        );
    }

    // ── Not found ─────────────────────────────────────────────────────────────
    if (!artwork) {
        return (
            <div className="artwork-details-page container" style={{ paddingTop: '10rem', textAlign: 'center', color: '#777' }}>
                <p>Artwork not found</p>
                <button
                    onClick={() => navigate('/gallery')}
                    style={{ marginTop: '1rem', color: '#d4af37', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    Return to Gallery
                </button>
            </div>
        );
    }

    const artistName = typeof artwork.artist === 'string'
        ? artwork.artist
        : artwork.artist?.name || 'Unknown Artist';

    const displayPrice = typeof artwork.price === 'number'
        ? `NRP ${artwork.price.toLocaleString('en-IN')}`
        : artwork.price || 'Price on Request';

    const similarArtworks = Array.isArray(artworks)
        ? artworks
            .filter(a =>
                a?.category === artwork.category &&
                (a?._id || a?.id)?.toString() !== artwork._id?.toString()
            )
            .slice(0, 4)
        : [];

    return (
        <div className="artwork-details-page">
            <div className="container">
                <div className="back-btn-row" style={{ padding: '2rem 0' }}>
                    <button
                        className="details-back-btn"
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111', fontWeight: '500' }}
                    >
                        <ArrowLeft size={16} /> Back to Gallery
                    </button>
                </div>

                <div className="details-grid">
                    <div
                        className="artwork-image-container"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        style={tiltStyle}
                    >
                        <img
                            src={artwork.image}
                            alt={artwork.title}
                            style={{ width: '100%', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                        />
                        <button className="btn-view-room" onClick={() => setIsRoomModalOpen(true)}>
                            <Maximize2 size={16} /> View in Room
                        </button>
                    </div>

                    <div className="artwork-info">
                        <span className="details-category-tag">{artwork.category}</span>
                        <h1 className="details-title">{artwork.title}</h1>

                        <div className="artist-profile-card">
                            <div className="artist-profile-left">
                                <img
                                    src={artwork.artist?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(artistName)}&background=d4af37&color=000`}
                                    alt={artistName}
                                    className="artist-avatar"
                                />
                                <div className="artist-name-wrap">
                                    <p>Created by</p>
                                    <h3>{artistName}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="details-price-row">
                            <p className="details-price">{displayPrice}</p>
                            {artwork.isSold && <span className="details-sold-badge">Sold Out</span>}
                        </div>

                        <div className="details-meta-row">
                            <div className="meta-item">
                                <span className="meta-label">Medium</span>
                                <span className="meta-value">Digital Art</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Category</span>
                                <span className="meta-value">{artwork.category}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Edition</span>
                                <span className="meta-value">1 of 1</span>
                            </div>
                            {(artwork.widthCm || artwork.heightCm) && (
                                <div className="meta-item" style={{ gridColumn: '1 / -1' }}>
                                    <span className="meta-label">Dimensions</span>
                                    <span className="meta-value">
                                        {artwork.widthCm && artwork.heightCm
                                            ? `${artwork.widthCm} × ${artwork.heightCm} cm`
                                            : artwork.widthCm
                                            ? `W: ${artwork.widthCm} cm`
                                            : `H: ${artwork.heightCm} cm`}
                                    </span>
                                </div>
                            )}
                        </div>

                        <hr className="details-divider" />
                        <p className="details-description">
                            Experience the beauty of <strong>"{artwork.title}"</strong>. An exclusive piece by {artistName} showcasing the rich heritage and landscapes of Nepal.
                        </p>

                        <div className="details-actions">
                            {user?.role === 'admin' ? (
                                <span className="details-sold-badge" style={{ background: '#6366f1', fontSize: '0.85rem', padding: '0.5rem 1.5rem' }}>Admin View Only</span>
                            ) : user?.role === 'artist' ? (
                                <span className="details-sold-badge" style={{ background: '#059669', fontSize: '0.85rem', padding: '0.5rem 1.5rem' }}>Artist View Only</span>
                            ) : artwork.isSold ? (
                                <button className="btn-add-cart btn-sold-out" disabled>
                                    <ShoppingBag size={18} /> Sold Out
                                </button>
                            ) : (
                                <button className="btn-add-cart" onClick={handleAddToCart}>
                                    <ShoppingBag size={18} /> Add to Collection
                                </button>
                            )}
                            {user && user.role !== 'admin' && String(user._id) !== String(artwork.artist?._id || artwork.artist) && (
                                <button className="btn-chat-artist" onClick={handleChat}>
                                    <MessageCircle size={18} /> Chat with Artist
                                </button>
                            )}
                        </div>

                        <div className="details-trust">
                            <div className="trust-badge"><Shield size={14} /> <span>Secure Checkout</span></div>
                            <div className="trust-badge"><RotateCcw size={14} /> <span>Authenticity Guaranteed</span></div>
                        </div>
                    </div>
                </div>

                {similarArtworks.length > 0 && (
                    <div className="similar-artworks-section" style={{ marginTop: '6rem', paddingBottom: '4rem' }}>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: '2rem' }}>More like this</h2>
                        <div className="artwork-grid">
                            {similarArtworks.map(art => (
                                <ArtworkCard key={art?._id || art?.id} artwork={art} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isRoomModalOpen && (
                    <motion.div
                        className="room-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <button className="room-modal-close" onClick={() => setIsRoomModalOpen(false)}>
                            <X size={28} />
                        </button>
                        <div className="room-background">
                            <motion.div
                                className="artwork-on-wall"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <img src={artwork.image} alt="On Wall" />
                                <div className="artwork-shadow"></div>
                            </motion.div>
                            <div className="room-info-badge">Viewing: {artwork.title}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ArtworkDetails;
