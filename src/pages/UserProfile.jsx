import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Mail, Shield, Palette, User } from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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
                {/* Card */}
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
                        <span className={`profile-role-badge ${role.class}`}>
                            {role.icon} {role.label}
                        </span>
                    </div>

                    {/* User Info */}
                    <div className="profile-info">
                        <h1 className="profile-name">{user.name}</h1>
                        <p className="profile-email">
                            <Mail size={15} />
                            {user.email}
                        </p>
                        <p className="profile-since">Member since {memberSince}</p>
                    </div>

                    {/* Stats Row */}
                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-value">—</span>
                            <span className="stat-label">{user.role === 'artist' ? 'Artworks' : 'Collected'}</span>
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
                        <Link to="/inbox" className="profile-action-btn secondary">
                            <Mail size={16} /> Messages
                        </Link>
                        <button onClick={handleLogout} className="profile-action-btn danger">
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
