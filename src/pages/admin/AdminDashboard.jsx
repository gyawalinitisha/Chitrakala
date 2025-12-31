import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGallery } from '../../context/GalleryContext';
import Button from '../../components/ui/Button';
import { Trash2, User, Shield, CheckCircle } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user, allUsers } = useAuth();
    const { artworks, deleteArtwork } = useGallery();
    const [activeTab, setActiveTab] = useState('users');

    if (user?.role !== 'admin') {
        return <div className="page-content container">Access Denied. Admin only area.</div>;
    }

    const handleDeleteArtwork = (id) => {
        if (window.confirm('Are you sure you want to delete this artwork? This cannot be undone.')) {
            deleteArtwork(id);
        }
    };

    return (
        <div className="page-content container admin-dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Admin Console</h1>
                    <p>Overview and Management</p>
                </div>
                <div className="admin-badge">
                    <Shield size={16} /> Super Admin
                </div>
            </header>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Total Users</h3>
                    <p className="stat-value">{allUsers.length + 1} <small>(+Guest)</small></p>
                </div>
                <div className="stat-card">
                    <h3>Total Artworks</h3>
                    <p className="stat-value">{artworks.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Platform Sales</h3>
                    <p className="stat-value">NRP 0</p>
                </div>
            </div>

            <div className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    User Management
                </button>
                <button
                    className={`tab-btn ${activeTab === 'artworks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('artworks')}
                >
                    Artwork Management
                </button>
            </div>

            <div className="admin-content glass-card animate-fade-in">
                {activeTab === 'users' ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allUsers.map((u, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-icon"><User size={14} /></div>
                                            {u.name}
                                        </div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                                    <td>{u.joined || 'N/A'}</td>
                                    <td><span className="status-active">Active</span></td>
                                </tr>
                            ))}
                            {allUsers.length === 0 && (
                                <tr><td colSpan="5" className="text-center">No registered users yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Title</th>
                                <th>Artist</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {artworks.map(art => (
                                <tr key={art.id}>
                                    <td><img src={art.image} alt={art.title} className="table-img" /></td>
                                    <td>{art.title}</td>
                                    <td>{art.artist}</td>
                                    <td>NRP {art.price}</td>
                                    <td>
                                        <button
                                            className="action-icon-btn delete"
                                            onClick={() => handleDeleteArtwork(art.id)}
                                            title="Delete Artwork"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
