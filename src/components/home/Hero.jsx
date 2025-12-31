import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-background">
                <div className="hero-overlay"></div>
                {/* Placeholder for dynamic background image or video */}
                <img
                    src="https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=2544&auto=format&fit=crop"
                    alt="Art Gallery Background"
                    className="hero-bg-img"
                />
            </div>

            <div className="container hero-content">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="hero-title">
                        Discover the <span className="text-gold italic">Soul</span> of <br /> Nepali Art
                    </h1>
                    <p className="hero-subtitle">
                        A curated digital sanctuary for exquisite local artworks. Connect with creators, explore heritage, and collect masterpieces.
                    </p>
                    <div className="hero-actions">
                        <Button size="lg" onClick={() => window.location.href = '/gallery'}>Explore Gallery</Button>
                        <Button variant="secondary" size="lg">Start Collecting</Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
