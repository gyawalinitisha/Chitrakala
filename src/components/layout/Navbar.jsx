import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Menu, X, ShoppingCart, User, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();
    const { cartItems } = useCart();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    const userInitials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-container">
                <Link to="/" className="nav-logo">
                    Chitrakala
                </Link>

                <div className={`nav-links ${isOpen ? 'active' : ''}`}>
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Home</Link>
                    <Link to="/gallery" className={`nav-link ${location.pathname === '/gallery' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Gallery</Link>

                    {/* Role specific links */}
                    {user?.role === 'artist' && (
                        <Link to="/artist-dashboard" className="nav-link badge-artist">Artist Dashboard</Link>
                    )}
                    {user?.role === 'admin' && (
                        <Link to="/admin" className="nav-link badge-artist" style={{ borderColor: '#eab308', color: '#eab308' }}>Admin Console</Link>
                    )}
                </div>

                <div className="nav-actions">
                    <Link to="/cart" className="action-btn cart-btn">
                        <ShoppingCart size={20} />
                        {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
                    </Link>

                    {user ? (
                        <div className="user-menu">
                            <div className="user-avatar" title={user.name}>
                                {userInitials}
                            </div>
                            <button onClick={logout} className="action-btn logout-btn" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/auth" className="nav-link nav-auth-btn">
                            Sign In
                        </Link>
                    )}

                    <button className="mobile-menu-btn" onClick={toggleMenu}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
