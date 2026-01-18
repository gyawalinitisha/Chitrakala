import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGallery } from '../../context/GalleryContext';
import Button from '../../components/ui/Button';
import { Trash2, User, Shield, CheckCircle } from 'lucide-react';
import { API_URL } from '../../config';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const { artworks, deleteArtwork } = useGallery();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ userCount: 0, artistCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = {
                    'Authorization': `Bearer ${token}`
                };

                // Fetch Users
                const usersRes = await fetch(`${API_URL}/admin/users`, { headers });
                const usersData = await usersRes.json();
                if (usersRes.ok) setUsers(usersData);

                // Fetch Stats
                const statsRes = await fetch(`${API_URL}/admin/stats`, { headers });
                const statsData = await statsRes.json();
                if (statsRes.ok) setStats(statsData);

            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchData();
        }
    }, [user]);

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
                    <p className="stat-value">{stats.userCount || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Artworks</h3>
                    <p className="stat-value">{artworks.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Artists</h3>
                    <p className="stat-value">{stats.artistCount || 0}</p>
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
                {loading ? <p>Loading...</p> : activeTab === 'users' ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-icon"><User size={14} /></div>
                                            {u.name}
                                        </div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                                    <td>
                                        {/* Placeholder for future actions */}
                                        <span className="status-active">Active</span>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
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
