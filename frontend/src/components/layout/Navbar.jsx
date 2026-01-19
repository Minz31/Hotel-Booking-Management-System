import { Link, useNavigate } from 'react-router-dom';
import { FaHotel, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuthStore } from '../../store';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <FaHotel className="text-primary-600 text-3xl" />
                        <span className="text-2xl font-bold text-gray-800">
                            HotelBook
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            to="/hotels"
                            className="text-gray-700 hover:text-primary-600 font-medium transition"
                        >
                            Hotels
                        </Link>

                        {isAuthenticated ? (
                            <>
                                {/* Show different links based on role */}
                                {user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'hotel_admin' ? (
                                    <Link
                                        to="/admin"
                                        className="text-gray-700 hover:text-primary-600 font-medium transition"
                                    >
                                        Admin Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        to="/dashboard"
                                        className="text-gray-700 hover:text-primary-600 font-medium transition"
                                    >
                                        My Bookings
                                    </Link>
                                )}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <FaUser className="text-gray-600" />
                                        <span className="text-gray-700">
                                            {user?.first_name || user?.full_name || 'User'}
                                        </span>
                                        {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'hotel_admin') && (
                                            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                                {user.role.replace('_', ' ').toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
                                    >
                                        <FaSignOutAlt />
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
