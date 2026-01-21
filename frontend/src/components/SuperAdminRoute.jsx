import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';

const SuperAdminRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Only super_admin can access these routes
    if (user?.role !== 'super_admin') {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default SuperAdminRoute;
