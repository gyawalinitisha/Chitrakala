import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Menu, X, ShoppingCart, LogOut, MessageCircle } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
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
        <>
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="container navbar-container">
                    <Link to="/" className="nav-logo">
                        Chitrakala
                    </Link>

                    <div className="nav-actions">
                        <Link to="/cart" className="action-btn cart-btn">
                            <ShoppingCart size={22} />
                            {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
                        </Link>

                        {user && (
                            <Link to="/inbox" className="action-btn" title="Messages">
                                <MessageCircle size={22} />
                            </Link>
                        )}

                        {user ? (
                            <div className="user-menu">
                                <Link to="/profile" className="user-avatar" title={`${user.name} – View Profile`}>
                                    {userInitials}
                                </Link>
                            </div>
                        ) : (
                            <Link to="/auth" className="nav-auth-btn hidden-mobile">
                                Sign In
                            </Link>
                        )}

                        <button className="menu-toggle-btn" onClick={toggleMenu}>
                            <Menu size={28} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Overlay */}
            <div className={`nav-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)}></div>

            {/* Sidebar Menu */}
            <div className={`sidebar-menu ${isOpen ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <button className="close-btn" onClick={() => setIsOpen(false)}>
                        <X size={32} />
                    </button>
                </div>

                <div className="sidebar-content">
                    <Link to="/" className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                        Home
                    </Link>
                    <Link to="/gallery" className={`sidebar-link ${location.pathname === '/gallery' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                        Online Gallery
                    </Link>
                    <Link to="/artists" className={`sidebar-link ${location.pathname === '/artists' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                        Artists
                    </Link>

                    {user?.role === 'artist' && (
                        <Link to="/artist-dashboard" className="sidebar-link" onClick={() => setIsOpen(false)}>Artist Dashboard</Link>
                    )}

                    {user?.role === 'admin' && (
                        <Link to="/admin" className="sidebar-link" onClick={() => setIsOpen(false)} style={{ color: '#eab308' }}>Admin Console</Link>
                    )}

                    {!user && (
                        <Link to="/auth" className="sidebar-link mobile-only" onClick={() => setIsOpen(false)}>Sign In</Link>
                    )}

                    {user && (
                        <button className="sidebar-link sidebar-logout" onClick={() => { 
                            logout(); 
                            setIsOpen(false);
                            navigate('/');
                        }}>
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default Navbar;
