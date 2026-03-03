import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useGallery } from '../context/GalleryContext';
import { useChat } from '../context/ChatContext';
import Button from '../components/ui/Button';
import { ArrowLeft, ShoppingBag, MessageCircle } from 'lucide-react';
import './ArtworkDetails.css';

const ArtworkDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { artworks } = useGallery();
    const { openChat } = useChat(); // Use Chat Context

    // Find artwork by ID (handle both string and number types)
    const artwork = artworks.find(a => a.id.toString() === id);

    if (!artwork) {
        return <div className="container page-content">Artwork not found</div>;
    }

    const handleAddToCart = () => {
        addToCart(artwork);
        // Optional: Show toast or feedback
        console.log(`Added ${artwork.title} to cart`);
    };

    const handleChat = () => {
        openChat(artwork);
    };

    return (
        <div className="page-content artwork-details-page">
            <div className="container">
                <Button variant="ghost" className="back-btn mb-6 flex items-center text-zinc-400 hover:text-white transition-colors" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} className="mr-2" /> Back to Gallery
                </Button>

                <div className="details-grid">
                    {/* Image Section */}
                    <div className="artwork-image-container relative group rounded-md overflow-hidden shadow-lg">
                        <img
                            src={artwork.image}
                            alt={artwork.title}
                            className="w-full h-auto object-cover"
                        />
                    </div>

                    {/* Details Section */}
                    <div className="artwork-info flex flex-col space-y-6">
                        <div>
                            <span className="text-amber-500 text-sm font-medium tracking-wider uppercase mb-2 block">
                                {artwork.category}
                            </span>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                {artwork.title}
                            </h1>
                        </div>

                        {/* Artist Profile Section */}
                        <div className="flex-between pb-4 border-b border-zinc-800">
                            <div className="flex-row-center">
                                <div className="relative">
                                    <img
                                        src={artwork.artistImage || "https://ui-avatars.com/api/?name=" + artwork.artist}
                                        alt={artwork.artist}
                                        className="artist-avatar w-12 h-12 rounded-full object-cover border border-zinc-700"
                                    />
                                    <div className="verified-badge absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border border-black" title="Verified Artist">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="verified-icon h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-400">Created by</p>
                                    <h3 className="text-base font-semibold text-white">{artwork.artist}</h3>
                                </div>
                            </div>

                            {/* Chat Icon Button */}
                            <button
                                onClick={handleChat}
                                className="chat-action-btn p-2.5 rounded-full bg-amber-500 text-black hover:bg-amber-600 transition-colors shadow-lg hover:shadow-amber-500/20 active:scale-95 transform"
                                title="Chat with Artist"
                            >
                                <MessageCircle size={20} />
                            </button>
                        </div>

                        <div className="text-2xl text-amber-500 font-light">
                            {artwork.price}
                        </div>

                        <p className="text-zinc-300 leading-relaxed">
                            Experience the depth and emotion of "{artwork.title}".
                            A unique digital creation that explores the boundaries of imagination and reality.
                            (Description placeholder for {artwork.title})
                        </p>

                        <div className="pt-4">
                            <Button size="lg" className="w-full bg-white text-black hover:bg-zinc-200 font-semibold" onClick={handleAddToCart}>
                                <ShoppingBag size={20} className="mr-2" /> Add to Collection
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtworkDetails;
