import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/home/Hero';
import ArtworkCard from '../components/ui/ArtworkCard';
import { artworks } from '../data/mockData';
import './Home.css';

const Home = () => {
    const featuredArtworks = artworks.slice(0, 3);

    return (
        <div className="home-page">
            <Hero />

            <section className="container section-featured">
                <div className="section-header">
                    <h2 className="section-title">Featured <span className="text-gold">Masterpieces</span></h2>
                    <p className="section-subtitle">Hand-picked selections from Nepal's finest creators.</p>
                </div>

                <div className="artwork-grid">
                    {featuredArtworks.map(art => (
                        <ArtworkCard key={art.id} artwork={art} />
                    ))}
                </div>
            </section>

            <section className="section-about">
                <div className="container about-content">
                    <div className="about-text">
                        <h2>Preserving Heritage, <br /> Empowering Artists</h2>
                        <p>
                            Our platform connects the vibrant artistic community of Nepal with the world.
                            We provide a digital stage for traditional and contemporary artworks, ensuring
                            fair compensation and global recognition.
                        </p>
                        <Link to="/gallery" className="btn-text-arrow">Read Our Story →</Link>
                    </div>
                    <div className="about-image">
                        <img src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=2680&auto=format&fit=crop" alt="Artist at work" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
