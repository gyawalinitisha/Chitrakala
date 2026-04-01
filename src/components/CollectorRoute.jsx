import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Only collectors (and unauthenticated users redirected to auth) can access cart/checkout.
// Artists and admins are redirected away.
const CollectorRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '10rem', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) return <Navigate to="/auth" />;
    if (user.role === 'artist') return <Navigate to="/artist-dashboard" />;
    if (user.role === 'admin') return <Navigate to="/admin" />;
    return <Outlet />;
};

export default CollectorRoute;
