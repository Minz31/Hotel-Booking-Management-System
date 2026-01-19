import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';

const GuestRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If user is admin, redirect to admin dashboard
    if (user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'hotel_admin') {
        return <Navigate to="/admin" replace />;
    }

    // Regular guest - allow access
    return children;
};

export default GuestRoute;
