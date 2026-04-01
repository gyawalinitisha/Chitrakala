import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '10rem', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (user) {
        return <Outlet />;
    } else {
        return <Navigate to="/auth" />;
    }
};

export default ProtectedRoute;
