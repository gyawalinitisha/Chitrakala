import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { LogOut, Mail, Shield, Palette, User, Camera, Upload, Edit2, Check, X, Package, ShoppingBag } from 'lucide-react';
import './UserProfile.css';

const STATUS_CONFIG = {
    Processing: { label: 'Processing', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
    Shipped:    { label: 'Shipped',    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)' },
    Delivered:  { label: 'Delivered',  color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)' },
};

const UserProfile = () => {
    const { user, logout, setUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: user?.name || '', bio: user?.bio || '' });

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    if (!user) {
        navigate('/auth');
        return null;
    }

    const userInitials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const memberSince = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        : 'Recently';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${API_URL}/orders/myorders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrders(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error('Failed to fetch orders:', err);
            } finally {
                setOrdersLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleProfileImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_URL}/auth/profile-image`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            profileImage: reader.result
                        })
                    });

                    if (res.ok) {
                        const updatedUser = await res.json();
                        setUser(updatedUser);
                        alert('Profile picture updated successfully!');
                    } else {
                        alert('Failed to update profile picture');
                    }
                } catch (error) {
                    console.error("Error uploading profile image:", error);
                    alert('Error uploading profile picture');
                } finally {
                    setUploading(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Error reading file:", error);
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editData)
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                setIsEditing(false);
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert('Error updating profile');
        }
    };

    const roleConfig = {
        artist: { label: 'Artist', icon: <Palette size={14} />, class: 'role-artist' },
        collector: { label: 'Collector', icon: <User size={14} />, class: 'role-collector' },
        admin: { label: 'Admin', icon: <Shield size={14} />, class: 'role-admin' },
    };
    const role = roleConfig[user.role] || roleConfig.collector;

    return (
        <div className="profile-page page-content">
            <div className="profile-bg-gradient" />

            <div className="container profile-content">
                {/* Profile Card */}
                <div className="profile-card animate-fade-in">
                    {/* Avatar */}
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar-circle">
                            {user.profileImage ? (
                                <img src={user.profileImage} alt={user.name} className="profile-avatar-img" />
                            ) : (
                                <span className="profile-avatar-initials">{userInitials}</span>
                            )}
                        </div>
                        <button
                            className="profile-upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Upload profile picture"
                            disabled={uploading}
                        >
                            {uploading ? <Upload size={16} /> : <Camera size={16} />}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageUpload}
                            style={{ display: 'none' }}
                        />
                        <span className={`profile-role-badge ${role.class}`}>
                            {role.icon} {role.label}
                        </span>
                    </div>

                    {/* User Info */}
                    <div className="profile-info">
                        {isEditing ? (
                            <div className="profile-edit-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' }}>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                                    className="profile-edit-input"
                                    placeholder="Your Name"
                                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', width: '80%', background: 'var(--bg-elevated)', color: 'var(--text-main)', fontSize: '1.2rem', textAlign: 'center' }}
                                />
                                <textarea
                                    value={editData.bio}
                                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                                    className="profile-edit-input"
                                    placeholder="Tell us about yourself..."
                                    rows={3}
                                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', width: '80%', background: 'var(--bg-elevated)', color: 'var(--text-main)', resize: 'none' }}
                                />
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button onClick={handleSaveProfile} className="profile-action-btn primary" style={{ padding: '8px 16px' }}>
                                        <Check size={16} /> Save
                                    </button>
                                    <button onClick={() => {setIsEditing(false); setEditData({ name: user.name, bio: user.bio || '' })}} className="profile-action-btn secondary" style={{ padding: '8px 16px' }}>
                                        <X size={16} /> Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="profile-name">
                                    {user.name}
                                    <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: '10px' }} title="Edit Profile">
                                        <Edit2 size={16} />
                                    </button>
                                </h1>
                                <p className="profile-email">
                                    <Mail size={15} />
                                    {user.email}
                                </p>
                                {user.bio && <p className="profile-bio" style={{ color: 'var(--text-secondary)', marginTop: '10px', maxWidth: '400px', textAlign: 'center' }}>{user.bio}</p>}
                                <p className="profile-since">Member since {memberSince}</p>
                            </>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-value">{orders.length || '—'}</span>
                            <span className="stat-label">{user.role === 'artist' ? 'Artworks' : 'Orders'}</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-value">—</span>
                            <span className="stat-label">Messages</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-value">{user.role === 'artist' ? 'Artist' : 'Collector'}</span>
                            <span className="stat-label">Account Type</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="profile-actions">
                        {user.role === 'artist' && (
                            <Link to="/artist-dashboard" className="profile-action-btn primary">
                                <Palette size={16} /> My Dashboard
                            </Link>
                        )}
                        {user.role === 'admin' && (
                            <Link to="/admin" className="profile-action-btn primary">
                                <Shield size={16} /> Admin Console
                            </Link>
                        )}
                        {user.role !== 'admin' && (
                            <Link to="/inbox" className="profile-action-btn secondary">
                                <Mail size={16} /> Messages
                            </Link>
                        )}
                        <button onClick={handleLogout} className="profile-action-btn danger">
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </div>

                {/* Orders Section — hidden for admin */}
                {user.role !== 'admin' ? (
                <div className="orders-section">
                    <div className="orders-section-header">
                        <ShoppingBag size={20} />
                        <h2>My Orders</h2>
                        <span className="orders-count">{orders.length}</span>
                    </div>

                    {ordersLoading ? (
                        <div className="orders-loading">Loading orders…</div>
                    ) : orders.length === 0 ? (
                        <div className="orders-empty">
                            <Package size={40} />
                            <p>No orders yet</p>
                            <Link to="/gallery" className="profile-action-btn primary" style={{ marginTop: '1rem' }}>
                                Browse Gallery
                            </Link>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {orders.map(order => {
                                const status = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.Processing;
                                const date = new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'short', day: 'numeric'
                                });
                                const shortId = order._id?.slice(-8).toUpperCase();

                                return (
                                    <div key={order._id} className="order-card">
                                        {/* Order Header */}
                                        <div className="order-card-header">
                                            <div className="order-meta">
                                                <span className="order-id">#{shortId}</span>
                                                <span className="order-date">{date}</span>
                                                <span className="order-payment-method">
                                                    {order.paymentMethod || 'eSewa'}
                                                </span>
                                            </div>
                                            <span
                                                className="order-status-badge"
                                                style={{ color: status.color, background: status.bg, borderColor: status.border }}
                                            >
                                                {status.label}
                                            </span>
                                        </div>

                                        {/* Artwork Details */}
                                        <div className="order-artwork-rows">
                                            {order.artworks.map((art, idx) => (
                                                <div key={art._id || idx} className="order-artwork-row">
                                                    <img src={art.image} alt={art.title} className="order-artwork-img" />
                                                    <div className="order-artwork-text">
                                                        <span className="order-artwork-title">{art.title}</span>
                                                        <span className="order-artwork-artist">
                                                            by {art.artist?.name || 'Unknown Artist'}
                                                        </span>
                                                    </div>
                                                    <span className="order-artwork-price">
                                                        NPR {art.price?.toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Order Footer */}
                                        <div className="order-card-footer">
                                            <span className="order-items-count">
                                                {order.artworks.length} {order.artworks.length === 1 ? 'item' : 'items'}
                                            </span>
                                            <span className="order-total">
                                                NPR {order.totalAmount?.toLocaleString('en-IN')}
                                            </span>
                                        </div>

                                        {/* Shipping progress bar */}
                                        <div className="order-progress">
                                            <div className={`order-progress-step ${['Processing','Shipped','Delivered'].includes(order.orderStatus) ? 'done' : ''}`}>
                                                <div className="step-dot" />
                                                <span>Ordered</span>
                                            </div>
                                            <div className="step-line" />
                                            <div className={`order-progress-step ${['Shipped','Delivered'].includes(order.orderStatus) ? 'done' : ''}`}>
                                                <div className="step-dot" />
                                                <span>Shipped</span>
                                            </div>
                                            <div className="step-line" />
                                            <div className={`order-progress-step ${order.orderStatus === 'Delivered' ? 'done' : ''}`}>
                                                <div className="step-dot" />
                                                <span>Delivered</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                ) : (
                <div className="orders-section">
                    <div className="orders-section-header">
                        <Shield size={20} />
                        <h2>Admin Account</h2>
                    </div>
                    <div className="orders-empty">
                        <Shield size={40} />
                        <p>Admin accounts manage the platform. Head to the Admin Console to manage users, artworks, and orders.</p>
                        <Link to="/admin" className="profile-action-btn primary" style={{ marginTop: '1rem' }}>
                            Open Admin Console
                        </Link>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
