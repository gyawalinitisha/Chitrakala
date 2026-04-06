import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useChat } from '../../context/ChatContext';
import { useNotification } from '../../context/NotificationContext';
import { Menu, X, ShoppingCart, MessageCircle, Bell } from 'lucide-react';
import './Navbar.css';

// ── Helpers ────────────────────────────────────────────────

const relativeTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

const TYPE_ICON = {
    ORDER_STATUS:       '📦',
    NEW_ORDER:          '🛒',
    ARTWORK_PURCHASED:  '🎨',
    ARTWORK_UPDATED:    '✏️',
    SYSTEM:             '🔔',
};

// ── Component ──────────────────────────────────────────────

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { cartItems } = useCart();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
    const { unreadMessages } = useChat();
    const notifRef = useRef(null);

    // Pages that have a light background — navbar must always be solid white
    const SOLID_NAV_PAGES = ['/settings', '/profile', '/cart', '/checkout', '/inbox', '/artists'];
    const alwaysSolid = SOLID_NAV_PAGES.includes(location.pathname)
        || location.pathname.startsWith('/artwork/')
        || location.pathname.startsWith('/artist/')
        || location.pathname.startsWith('/admin')
        || location.pathname.startsWith('/artist-dashboard');

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Navbar scroll shadow
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // KEY FIX: when dropdown opens, immediately clear the badge
    const toggleNotifications = () => {
        const opening = !showNotifications;
        setShowNotifications(opening);
        if (opening && unreadCount > 0) {
            markAllAsRead(); // optimistic — badge clears instantly
        }
    };

    const handleNotificationClick = (n) => {
        markAsRead(n._id);
        setShowNotifications(false);
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'artist') navigate('/artist-dashboard');
        else navigate('/profile');
    };

    const userInitials = user
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase()
        : '';

    return (
        <>
            <nav className={`navbar${scrolled || alwaysSolid ? ' scrolled' : ''}`}>
                <div className="container navbar-container">
                    <Link to="/" className="nav-logo">Chitrakala</Link>

                    <div className="nav-actions">
                        {/* Cart — customers only */}
                        {user?.role !== 'admin' && user?.role !== 'artist' && (
                            <Link to="/cart" className="action-btn cart-btn">
                                <ShoppingCart size={22} />
                                {cartItems.length > 0 && (
                                    <span className="cart-count">{cartItems.length}</span>
                                )}
                            </Link>
                        )}

                        {/* Messages — non-admin */}
                        {user && user.role !== 'admin' && (
                            <Link to="/inbox" className="action-btn" title="Messages" style={{ position: 'relative' }}>
                                <MessageCircle size={22} />
                                {unreadMessages > 0 && (
                                    <span className="notification-badge">{unreadMessages > 9 ? '9+' : unreadMessages}</span>
                                )}
                            </Link>
                        )}

                        {/* Notifications */}
                        {user && (
                            <div className="notification-container" ref={notifRef}>
                                <button
                                    className="action-btn notification-btn"
                                    onClick={toggleNotifications}
                                    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                                >
                                    <Bell size={22} />
                                    {unreadCount > 0 && (
                                        <span className="notification-badge">{unreadCount}</span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="notification-dropdown">
                                        <div className="notification-header">
                                            <h4>Notifications</h4>
                                            {notifications.some(n => !n.isRead) && (
                                                <button
                                                    className="mark-all-btn"
                                                    onClick={markAllAsRead}
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>

                                        <div className="notification-list">
                                            {notifications.length === 0 ? (
                                                <div className="no-notifications">
                                                    <Bell size={28} strokeWidth={1.2} />
                                                    <p>You're all caught up!</p>
                                                </div>
                                            ) : (
                                                notifications.slice(0, 8).map(n => (
                                                    <div
                                                        key={n._id}
                                                        className={`notification-item${n.isRead ? ' read' : ' unread'}`}
                                                        onClick={() => handleNotificationClick(n)}
                                                        role="button"
                                                        tabIndex={0}
                                                        onKeyDown={e => e.key === 'Enter' && handleNotificationClick(n)}
                                                    >
                                                        <span className="notif-type-icon">
                                                            {TYPE_ICON[n.type] || '🔔'}
                                                        </span>
                                                        <div className="notif-body">
                                                            <p className="notification-message">{n.message}</p>
                                                            <span className="notification-time">
                                                                {relativeTime(n.createdAt)}
                                                            </span>
                                                        </div>
                                                        {!n.isRead && (
                                                            <span className="notif-unread-dot" aria-label="Unread" />
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {notifications.length > 8 && (
                                            <div className="notification-footer">
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setShowNotifications(false)}
                                                >
                                                    View all notifications
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User avatar / Sign in */}
                        {user ? (
                            <div className="user-menu">
                                <Link to="/profile" className="user-avatar" title={`${user.name} – View Profile`}>
                                    {userInitials}
                                </Link>
                            </div>
                        ) : (
                            <Link to="/auth" className="nav-auth-btn hidden-mobile">Sign In</Link>
                        )}

                        <button className="menu-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                            <Menu size={28} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Overlay */}
            <div className={`nav-overlay${isOpen ? ' active' : ''}`} onClick={() => setIsOpen(false)} />

            {/* Sidebar Menu */}
            <div className={`sidebar-menu${isOpen ? ' active' : ''}`}>
                <div className="sidebar-header">
                    <button className="close-btn" onClick={() => setIsOpen(false)}>
                        <X size={32} />
                    </button>
                </div>
                <div className="sidebar-content">
                    <Link to="/" className={`sidebar-link${location.pathname === '/' ? ' active' : ''}`} onClick={() => setIsOpen(false)}>Home</Link>
                    <Link to="/gallery" className={`sidebar-link${location.pathname === '/gallery' ? ' active' : ''}`} onClick={() => setIsOpen(false)}>Online Gallery</Link>
                    <Link to="/artists" className={`sidebar-link${location.pathname === '/artists' ? ' active' : ''}`} onClick={() => setIsOpen(false)}>Artists</Link>

                    {user?.role === 'artist' && (
                        <Link to="/artist-dashboard" className="sidebar-link" onClick={() => setIsOpen(false)}>Artist Dashboard</Link>
                    )}
                    {user?.role === 'admin' && (
                        <Link to="/admin" className="sidebar-link" onClick={() => setIsOpen(false)} style={{ color: '#eab308' }}>Admin Console</Link>
                    )}
                    {user && (
                        <Link to="/settings" className="sidebar-link" onClick={() => setIsOpen(false)}>Settings</Link>
                    )}
                    {!user && (
                        <Link to="/auth" className="sidebar-link mobile-only" onClick={() => setIsOpen(false)}>Sign In</Link>
                    )}
                    {user && (
                        <button className="sidebar-link sidebar-logout" onClick={() => { logout(); setIsOpen(false); navigate('/'); }}>
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default Navbar;
