import { Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import { FaHotel, FaCalendarCheck, FaUsers, FaDollarSign, FaStar } from 'react-icons/fa';

const AdminDashboardPage = () => {
    const { user } = useAuthStore();

    // Sample stats - you can connect these to real APIs later
    const stats = [
        {
            title: 'Total Bookings',
            value: '248',
            icon: FaCalendarCheck,
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            title: 'Total Hotels',
            value: '12',
            icon: FaHotel,
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            title: 'Total Users',
            value: '1,234',
            icon: FaUsers,
            color: 'text-purple-600',
            bg: 'bg-purple-100'
        },
        {
            title: 'Revenue',
            value: '$45,280',
            icon: FaDollarSign,
            color: 'text-yellow-600',
            bg: 'bg-yellow-100'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">
                        Welcome back, {user?.first_name || 'Admin'}! ({user?.role})
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => {
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

                    <Link to="/admin/users" className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                        <FaUsers className="text-4xl text-green-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Manage Users</h3>
                        <p className="text-gray-600 text-sm">View and manage user accounts</p>
                    </Link>

                    <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer opacity-50">
                        <FaStar className="text-4xl text-yellow-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Reviews</h3>
                        <p className="text-gray-600 text-sm">Respond to customer reviews (Coming soon)</p>
                    </div>

                    <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer opacity-50">
                        <FaDollarSign className="text-4xl text-purple-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Payments</h3>
                        <p className="text-gray-600 text-sm">View payment transactions (Coming soon)</p>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card p-6">
                    <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <FaCalendarCheck className="text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold">New Booking</p>
                                <p className="text-sm text-gray-600">John Doe booked Grand Plaza Hotel</p>
                            </div>
                            <span className="text-sm text-gray-500">2 hours ago</span>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaUsers className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold">New User Registration</p>
                                <p className="text-sm text-gray-600">Jane Smith created an account</p>
                            </div>
                            <span className="text-sm text-gray-500">5 hours ago</span>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <FaStar className="text-yellow-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold">New Review</p>
                                <p className="text-sm text-gray-600">5-star review for Luxury Resort</p>
                            </div>
                            <span className="text-sm text-gray-500">1 day ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
