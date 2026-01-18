import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (user && (user.role === 'admin' || user.isAdmin)) {
        return <Outlet />;
    } else {
        return <Navigate to="/" />;
    }
};

export default AdminRoute;
