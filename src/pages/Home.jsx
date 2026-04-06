import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/home/Hero';
import FeaturedSection from '../components/home/FeaturedSection';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page">
            <Hero />

            <FeaturedSection />

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
