import { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTimes } from 'react-icons/fa';
import { bookingAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const ViewBookingsPage = () => {
    const { user } = useAuthStore();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const isHotelAdmin = user?.role === 'hotel_admin';
    const userHotelId = user?.hotel_id;

    useEffect(() => {
        fetchBookings();
    }, [filter]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params = {
                status: filter !== 'all' ? filter : undefined
            };

            // Filter by hotel_id for hotel admins
            if (isHotelAdmin && userHotelId) {
                params.hotel_id = userHotelId;
            }

            const { data } = await bookingAPI.getAllBookings(params);
            setBookings(data.data || []);
        } catch (error) {
            toast.error('Failed to load bookings');
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
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">View All Bookings</h1>

                    <div className="flex gap-2">
                        {['all', 'pending_payment', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg transition ${filter === status ? 'bg-primary-600 text-white' : 'bg-white hover:bg-gray-50'
                                    }`}
                            >
                                {status.replace('_', ' ').toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="card p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <h3 className="text-xl font-bold">{booking.hotel_name}</h3>
                                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>
                                                {booking.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Booking ID</p>
                                                <p className="font-semibold">{booking.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Guest</p>
                                                <p className="font-semibold">{booking.guest_name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Check-in</p>
                                                <p className="font-semibold">{new Date(booking.check_in_date).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Amount</p>
                                                <p className="font-semibold text-lg text-primary-600">${booking.final_amount}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="btn-secondary p-2">
                                            <FaEye />
                                        </button>
                                        <button className="btn-secondary p-2">
                                            <FaEdit />
                                        </button>
                                        <button className="text-red-600 hover:bg-red-50 p-2 rounded">
                                            <FaTimes />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewBookingsPage;
