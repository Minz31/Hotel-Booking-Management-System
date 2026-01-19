import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendar, FaHotel, FaUser } from 'react-icons/fa';
import { bookingAPI } from '../services/api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

const DashboardPage = () => {
    const { user } = useAuthStore();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (user?.id) {
            fetchBookings();
        } else {
            setLoading(false);
        }
    }, [user, filter]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params = filter !== 'all' ? { status: filter } : {};
            const { data } = await bookingAPI.getGuestBookings(user.id, params);
            setBookings(data.data || []);
        } catch (error) {
            toast.error('Failed to load bookings');
            console.error(error);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending_payment': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-green-100 text-green-800',
            'checked_in': 'bg-blue-100 text-blue-800',
            'checked_out': 'bg-gray-100 text-gray-800',
            'cancelled': 'bg-red-100 text-red-800',
            'no_show': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-xl text-gray-600">Please login to view dashboard</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
                    <p className="text-gray-600">Manage your bookings and profile</p>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card p-6">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaUser className="text-primary-600 text-3xl" />
                                </div>
                                <h3 className="font-bold text-lg">
                                    {user?.first_name} {user?.last_name}
                                </h3>
                                <p className="text-sm text-gray-600">{user?.email}</p>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition ${filter === 'all' ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    All Bookings
                                </button>
                                <button
                                    onClick={() => setFilter('confirmed')}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition ${filter === 'confirmed' ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    Upcoming
                                </button>
                                <button
                                    onClick={() => setFilter('checked_out')}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition ${filter === 'checked_out' ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    Past Stays
                                </button>
                                <button
                                    onClick={() => setFilter('cancelled')}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition ${filter === 'cancelled' ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    Cancelled
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="card p-12 text-center">
                                <FaHotel className="text-6xl text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">No Bookings Found</h3>
                                <p className="text-gray-600 mb-6">Start planning your next trip!</p>
                                <Link to="/hotels" className="btn-primary inline-block">
                                    Browse Hotels
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {bookings.map((booking) => (
                                    <div key={booking.id} className="card p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold mb-1">{booking.hotel_name || 'Hotel'}</h3>
                                                <p className="text-gray-600">{booking.city || 'City'}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                                {(booking.status || 'unknown').replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                                            <div className="flex items-center gap-2">
                                                <FaCalendar className="text-primary-600" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Check-in</p>
                                                    <p className="font-semibold">{formatDate(booking.check_in_date)}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <FaCalendar className="text-primary-600" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Check-out</p>
                                                    <p className="font-semibold">{formatDate(booking.check_out_date)}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm text-gray-600">Total Amount</p>
                                                <p className="font-semibold text-xl text-primary-600">
                                                    ${booking.final_amount || '0.00'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-4 border-t">
                                            <div className="text-sm text-gray-600">
                                                Rooms: {booking.room_numbers || 'N/A'} • Guests: {booking.number_of_guests || 0}
                                            </div>
                                            <Link
                                                to={`/bookings/${booking.id}`}
                                                className="text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                View Details →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
