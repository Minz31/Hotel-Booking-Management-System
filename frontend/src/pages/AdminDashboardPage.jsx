import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import { adminAPI } from '../services/api';
import { FaHotel, FaCalendarCheck, FaUsers, FaDollarSign, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        total_bookings: 0,
        total_hotels: 0,
        total_users: 0,
        revenue: 0
    });
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, activityRes] = await Promise.all([
                    adminAPI.getDashboardStats(),
                    adminAPI.getRecentActivity()
                ]);
                setStats(statsRes.data.data);
                setActivities(activityRes.data.data);
            } catch (error) {
                console.error('Failed to load dashboard data', error);
                // toast.error('Failed to load dashboard data'); // Suppress to avoid noise or handle gracefully
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const statsCards = [
        {
            title: 'Total Bookings',
            value: stats.total_bookings,
            icon: FaCalendarCheck,
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            title: 'Total Hotels',
            value: stats.total_hotels,
            icon: FaHotel,
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            title: 'Total Users',
            value: stats.total_users,
            icon: FaUsers,
            color: 'text-purple-600',
            bg: 'bg-purple-100'
        },
        {
            title: 'Revenue',
            value: `$${parseFloat(stats.revenue || 0).toLocaleString()}`,
            icon: FaDollarSign,
            color: 'text-yellow-600',
            bg: 'bg-yellow-100'
        }
    ];

    const getActivityIcon = (type) => {
        switch (type) {
            case 'booking': return FaCalendarCheck;
            case 'review': return FaStar;
            case 'user_register': return FaUsers;
            default: return FaCalendarCheck;
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'booking': return 'bg-green-100 text-green-600';
            case 'review': return 'bg-yellow-100 text-yellow-600';
            case 'user_register': return 'bg-blue-100 text-blue-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getActivityText = (activity) => {
        switch (activity.type) {
            case 'booking':
                return (
                    <div>
                        <p className="font-semibold">New Booking</p>
                        <p className="text-sm text-gray-600">{activity.user_name} booked {activity.hotel_name}</p>
                    </div>
                );
            case 'review':
                return (
                    <div>
                        <p className="font-semibold">New Review</p>
                        <p className="text-sm text-gray-600">{activity.rating}-star review for {activity.hotel_name}</p>
                    </div>
                );
            case 'user_register':
                return (
                    <div>
                        <p className="font-semibold">New User Registration</p>
                        <p className="text-sm text-gray-600">{activity.user_name} created an account</p>
                    </div>
                );
            default:
                return (
                    <div>
                        <p className="font-semibold">Activity</p>
                        <p className="text-sm text-gray-600">{activity.type}</p>
                    </div>
                );
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">
                        Welcome back, {user?.first_name || 'Admin'}! ({user?.role?.replace('_', ' ')})
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        <p className="mt-4 text-gray-600">Loading dashboard...</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {statsCards.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={index} className="card p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                                                <Icon className={`text-2xl ${stat.color}`} />
                                            </div>
                                        </div>
                                        <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
                                        <p className="text-3xl font-bold">{stat.value}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Quick Actions */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <Link to="/admin/hotels" className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                                <FaHotel className="text-4xl text-primary-600 mb-4" />
                                <h3 className="text-xl font-bold mb-2">Manage Hotels</h3>
                                <p className="text-gray-600 text-sm">Add, edit, or remove hotels</p>
                            </Link>

                            <Link to="/admin/bookings" className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                                <FaCalendarCheck className="text-4xl text-blue-600 mb-4" />
                                <h3 className="text-xl font-bold mb-2">View Bookings</h3>
                                <p className="text-gray-600 text-sm">Manage all customer bookings</p>
                            </Link>

                            {/* Only show Manage Users for Super Admin */}
                            {user?.role === 'super_admin' && (
                                <Link to="/admin/users" className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                                    <FaUsers className="text-4xl text-green-600 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Manage Users</h3>
                                    <p className="text-gray-600 text-sm">View and manage user accounts</p>
                                </Link>
                            )}

                            {user?.role === 'hotel_admin' ? (
                                <Link to={`/admin/reviews/${user.hotel_id}`} className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                                    <FaStar className="text-4xl text-yellow-600 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Reviews</h3>
                                    <p className="text-gray-600 text-sm">Respond to and manage customer reviews</p>
                                </Link>
                            ) : (
                                <Link to="/admin/hotels" className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                                    <FaStar className="text-4xl text-yellow-600 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Reviews</h3>
                                    <p className="text-gray-600 text-sm">Select a hotel to view its reviews</p>
                                </Link>
                            )}

                            <Link to="/admin/payments" className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                                <FaDollarSign className="text-4xl text-purple-600 mb-4" />
                                <h3 className="text-xl font-bold mb-2">Payments</h3>
                                <p className="text-gray-600 text-sm">View payment transactions and history</p>
                            </Link>
                        </div>

                        {/* Recent Activity */}
                        <div className="card p-6">
                            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
                            <div className="space-y-4">
                                {activities.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No recent activity.</p>
                                ) : (
                                    activities.map((activity, index) => {
                                        const Icon = getActivityIcon(activity.type);
                                        const colorClass = getActivityColor(activity.type);
                                        return (
                                            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                                <div className={`w-10 h-10 ${colorClass.split(' ')[0]} rounded-full flex items-center justify-center`}>
                                                    <Icon className={colorClass.split(' ')[1]} />
                                                </div>
                                                <div className="flex-1">
                                                    {getActivityText(activity)}
                                                </div>
                                                <span className="text-sm text-gray-500 whitespace-nowrap">
                                                    {formatTime(activity.created_at)}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardPage;
