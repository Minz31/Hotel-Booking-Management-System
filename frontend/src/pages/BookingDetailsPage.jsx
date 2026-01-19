import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaCalendar, FaHotel, FaUser, FaBed, FaPrint } from 'react-icons/fa';
import { bookingAPI } from '../services/api';
import toast from 'react-hot-toast';

const BookingDetailsPage = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookingDetails();
    }, [id]);

    const fetchBookingDetails = async () => {
        try {
            const { data } = await bookingAPI.getBookingById(id);
            setBooking(data.data);
        } catch (error) {
            toast.error('Failed to load booking details');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending_payment': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'confirmed': 'bg-green-100 text-green-800 border-green-300',
            'checked_in': 'bg-blue-100 text-blue-800 border-blue-300',
            'checked_out': 'bg-gray-100 text-gray-800 border-gray-300',
            'cancelled': 'bg-red-100 text-red-800 border-red-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-600 mb-4">Booking not found</p>
                    <Link to="/dashboard" className="btn-primary">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <FaCheckCircle className="text-green-600 text-4xl" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">Booking Confirmed!</h1>
                    <p className="text-gray-600">Thank you for your reservation</p>
                </div>

                {/* Booking Details Card */}
                <div className="card p-8 mb-6">
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Booking ID</p>
                            <p className="text-xl font-mono font-bold">{booking.id}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(booking.status)}`}>
                            {(booking.status || '').replace('_', ' ').toUpperCase()}
                        </span>
                    </div>

                    {/* Hotel Information */}
                    <div className="border-b pb-6 mb-6">
                        <div className="flex items-start gap-4">
                            <FaHotel className="text-primary-600 text-3xl mt-1" />
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-2">{booking.hotel_name || 'Hotel'}</h2>
                                <p className="text-gray-600">{booking.city || 'City'}</p>
                                {booking.hotel_address && (
                                    <p className="text-sm text-gray-500 mt-1">{booking.hotel_address}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stay Details */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FaCalendar className="text-primary-600" />
                                <h3 className="font-semibold">Check-in</h3>
                            </div>
                            <p className="text-lg">{formatDate(booking.check_in_date)}</p>
                            <p className="text-sm text-gray-600">After 2:00 PM</p>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FaCalendar className="text-primary-600" />
                                <h3 className="font-semibold">Check-out</h3>
                            </div>
                            <p className="text-lg">{formatDate(booking.check_out_date)}</p>
                            <p className="text-sm text-gray-600">Before 11:00 AM</p>
                        </div>
                    </div>

                    {/* Guest & Room Details */}
                    <div className="border-t pt-6 mb-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <FaUser className="text-primary-600" />
                                    <h3 className="font-semibold">Guest Information</h3>
                                </div>
                                <p className="text-gray-700">
                                    {booking.number_of_guests || 1} Guest{(booking.number_of_guests || 1) > 1 ? 's' : ''}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <FaBed className="text-primary-600" />
                                    <h3 className="font-semibold">Room Details</h3>
                                </div>
                                <p className="text-gray-700">Room: {booking.room_numbers || 'TBA'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Special Requests */}
                    {booking.special_requests && (
                        <div className="border-t pt-6 mb-6">
                            <h3 className="font-semibold mb-2">Special Requests</h3>
                            <p className="text-gray-700">{booking.special_requests}</p>
                        </div>
                    )}

                    {/* Pricing */}
                    <div className="border-t pt-6">
                        <h3 className="font-semibold mb-4">Payment Summary</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-semibold">${booking.total_amount || '0.00'}</span>
                            </div>
                            {booking.discount_amount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount:</span>
                                    <span>-${booking.discount_amount}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold border-t pt-2">
                                <span>Final Amount:</span>
                                <span className="text-primary-600">${booking.final_amount || '0.00'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <button
                        onClick={handlePrint}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <FaPrint />
                        Print Confirmation
                    </button>
                    <Link to="/dashboard" className="btn-primary">
                        Back to My Bookings
                    </Link>
                </div>

                {/* Important Information */}
                <div className="card p-6 mt-6 bg-blue-50">
                    <h3 className="font-bold mb-3">Important Information</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>✓ Please bring a valid ID at check-in</li>
                        <li>✓ Payment will be collected at the hotel</li>
                        <li>✓ Free cancellation up to 24 hours before check-in</li>
                        <li>✓ For any changes, please contact the hotel directly</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailsPage;
