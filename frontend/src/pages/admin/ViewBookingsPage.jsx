import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTimes, FaExchangeAlt, FaCheck, FaUndo } from 'react-icons/fa';
import { bookingAPI, hotelAPI, paymentAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const ViewBookingsPage = () => {
    const { user } = useAuthStore();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    // Modal states
    const [viewModal, setViewModal] = useState({ open: false, booking: null });
    const [editModal, setEditModal] = useState({ open: false, booking: null });
    const [cancelModal, setCancelModal] = useState({ open: false, booking: null });
    const [roomChangeModal, setRoomChangeModal] = useState({ open: false, booking: null });

    // Available rooms for room change
    const [availableRooms, setAvailableRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [newStatus, setNewStatus] = useState('');

    // Payments for the selected booking
    const [payments, setPayments] = useState([]);

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
            'cancelled': 'bg-red-100 text-red-800',
            'no_show': 'bg-orange-100 text-orange-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // View booking details and fetch payments
    const handleView = async (booking) => {
        try {
            const [bookingRes, paymentsRes] = await Promise.all([
                bookingAPI.getBookingById(booking.id),
                paymentAPI.getBookingPayments(booking.id).catch(() => ({ data: { data: [] } }))
            ]);

            setViewModal({ open: true, booking: bookingRes.data.data });
            setPayments(paymentsRes.data.data || []);
        } catch (error) {
            toast.error('Failed to load details');
        }
    };

    // Process Refund
    const handleRefund = async (paymentId) => {
        if (!confirm('Are you sure you want to refund this payment?')) return;

        try {
            await paymentAPI.processRefund(paymentId);
            toast.success('Refund processed successfully');
            // Refresh payments
            const { data } = await paymentAPI.getBookingPayments(viewModal.booking.id);
            setPayments(data.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to refund');
        }
    };

    // Open edit modal
    const handleEdit = (booking) => {
        setNewStatus(booking.status);
        setEditModal({ open: true, booking });
    };

    // Update booking status
    const handleUpdateStatus = async () => {
        try {
            await bookingAPI.updateBookingStatus(editModal.booking.id, { status: newStatus });
            toast.success('Booking status updated successfully!');
            setEditModal({ open: false, booking: null });
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    // Open cancel modal
    const handleCancelClick = (booking) => {
        setCancelReason('');
        setCancelModal({ open: true, booking });
    };

    // Cancel booking
    const handleCancelBooking = async () => {
        try {
            await bookingAPI.cancelBooking(cancelModal.booking.id, { reason: cancelReason });
            toast.success('Booking cancelled successfully!');
            setCancelModal({ open: false, booking: null });
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    // Open room change modal and fetch available rooms
    const handleRoomChange = async (booking) => {
        try {
            const { data } = await hotelAPI.getRooms(booking.hotel_id);
            // Filter available rooms
            const available = data.data?.filter(r => r.status === 'available') || [];
            setAvailableRooms(available);
            setSelectedRoom('');
            setRoomChangeModal({ open: true, booking });
        } catch (error) {
            toast.error('Failed to load available rooms');
        }
    };

    // Allocate new room
    const handleAllocateRoom = async () => {
        if (!selectedRoom) {
            toast.error('Please select a room');
            return;
        }
        try {
            await bookingAPI.changeRoom(roomChangeModal.booking.id, { new_room_id: selectedRoom });
            toast.success('Room changed successfully!');
            setRoomChangeModal({ open: false, booking: null });
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change room');
        }
    };

    const statusOptions = [
        { value: 'pending_payment', label: 'Pending Payment' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'checked_in', label: 'Checked In' },
        { value: 'checked_out', label: 'Checked Out' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'no_show', label: 'No Show' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                {isHotelAdmin ? 'My Hotel Bookings' : 'View All Bookings'}
                            </h1>
                            {isHotelAdmin && (
                                <p className="text-gray-600">
                                    Manage bookings for your hotel. Changes will reflect on guest accounts.
                                </p>
                            )}
                        </div>
                        <Link to="/admin/bookings/new" className="btn-primary flex items-center gap-2">
                            <span className="text-xl">+</span> Create Booking
                        </Link>
                    </div>

                    <div className="flex flex-wrap gap-2">
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
                ) : bookings.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-600 text-xl">No bookings found</p>
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
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Booking ID</p>
                                                <p className="font-semibold text-xs">{booking.id.substring(0, 8)}...</p>
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
                                        {booking.room_numbers && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                Room(s): {booking.room_numbers}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleView(booking)}
                                            className="btn-secondary p-2"
                                            title="View Details"
                                        >
                                            <FaEye />
                                        </button>
                                        {booking.status !== 'cancelled' && booking.status !== 'checked_out' && (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(booking)}
                                                    className="btn-secondary p-2"
                                                    title="Update Status"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleRoomChange(booking)}
                                                    className="btn-secondary p-2"
                                                    title="Change Room"
                                                >
                                                    <FaExchangeAlt />
                                                </button>
                                                <button
                                                    onClick={() => handleCancelClick(booking)}
                                                    className="text-red-600 hover:bg-red-50 p-2 rounded"
                                                    title="Cancel Booking"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* View Modal */}
            {viewModal.open && viewModal.booking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Booking Details</h2>
                            <button onClick={() => setViewModal({ open: false, booking: null })} className="text-gray-500 hover:text-gray-700">
                                <FaTimes size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-600 text-sm">Booking ID</p>
                                    <p className="font-semibold">{viewModal.booking.id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Status</p>
                                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(viewModal.booking.status)}`}>
                                        {viewModal.booking.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <hr />

                            <div>
                                <h3 className="font-bold mb-2">Guest Information</h3>
                                <p>{viewModal.booking.first_name} {viewModal.booking.last_name}</p>
                                <p className="text-gray-600">{viewModal.booking.guest_email}</p>
                                <p className="text-gray-600">{viewModal.booking.guest_phone}</p>
                            </div>

                            <hr />

                            <div>
                                <h3 className="font-bold mb-2">Hotel Information</h3>
                                <p>{viewModal.booking.hotel_name}</p>
                                <p className="text-gray-600">{viewModal.booking.address}, {viewModal.booking.city}</p>
                            </div>

                            <hr />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-600 text-sm">Check-in</p>
                                    <p className="font-semibold">{new Date(viewModal.booking.check_in_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Check-out</p>
                                    <p className="font-semibold">{new Date(viewModal.booking.check_out_date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-600 text-sm">Room(s)</p>
                                    <p className="font-semibold">{viewModal.booking.room_numbers || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Room Type(s)</p>
                                    <p className="font-semibold">{viewModal.booking.room_types || 'N/A'}</p>
                                </div>
                            </div>

                            <hr />

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between mb-2">
                                    <span>Total Amount</span>
                                    <span>${viewModal.booking.total_amount}</span>
                                </div>
                                {viewModal.booking.discount_amount > 0 && (
                                    <div className="flex justify-between mb-2 text-green-600">
                                        <span>Discount</span>
                                        <span>-${viewModal.booking.discount_amount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg border-t pt-2">
                                    <span>Final Amount</span>
                                    <span className="text-primary-600">${viewModal.booking.final_amount}</span>
                                </div>
                            </div>

                            {/* Payment History Section */}
                            {payments.length > 0 && (
                                <div className="mt-6 border-t pt-4">
                                    <h3 className="font-bold mb-3">Payment History</h3>
                                    <div className="space-y-3">
                                        {payments.map(payment => (
                                            <div key={payment.id} className="flex justify-between items-center bg-gray-50 p-3 rounded text-sm">
                                                <div>
                                                    <p className="font-semibold">${payment.amount}</p>
                                                    <p className="text-xs text-gray-500">{new Date(payment.created_at).toLocaleDateString()} • {payment.method}</p>
                                                    <p className="text-xs font-mono">{payment.transaction_id || 'ID: ' + payment.id}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${payment.status === 'refunded' ? 'bg-red-100 text-red-800' :
                                                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {payment.status.toUpperCase()}
                                                    </span>

                                                    {payment.status === 'completed' && viewModal.booking.status === 'cancelled' && (
                                                        <button
                                                            onClick={() => handleRefund(payment.id)}
                                                            className="block mt-2 text-red-600 hover:text-red-800 text-xs font-semibold flex items-center gap-1 justify-end ml-auto"
                                                        >
                                                            <FaUndo size={10} /> Refund
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {viewModal.booking.special_requests && (
                                <div>
                                    <p className="text-gray-600 text-sm">Special Requests</p>
                                    <p>{viewModal.booking.special_requests}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Status Modal */}
            {editModal.open && editModal.booking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Update Booking Status</h2>
                            <button onClick={() => setEditModal({ open: false, booking: null })} className="text-gray-500 hover:text-gray-700">
                                <FaTimes size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-600 mb-2">Booking: {editModal.booking.id.substring(0, 8)}...</p>
                            <p className="font-semibold">{editModal.booking.guest_name}</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Status
                            </label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="input-field"
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setEditModal({ open: false, booking: null })}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                className="btn-primary flex-1"
                            >
                                <FaCheck className="inline mr-2" /> Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {cancelModal.open && cancelModal.booking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-red-600">Cancel Booking</h2>
                            <button onClick={() => setCancelModal({ open: false, booking: null })} className="text-gray-500 hover:text-gray-700">
                                <FaTimes size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-600 mb-2">Are you sure you want to cancel this booking?</p>
                            <p className="font-semibold">{cancelModal.booking.guest_name}</p>
                            <p className="text-gray-600">{cancelModal.booking.hotel_name}</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cancellation Reason
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="input-field"
                                rows="3"
                                placeholder="Enter reason for cancellation..."
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setCancelModal({ open: false, booking: null })}
                                className="btn-secondary flex-1"
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={handleCancelBooking}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex-1"
                            >
                                Cancel Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Room Change Modal */}
            {roomChangeModal.open && roomChangeModal.booking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Change Room</h2>
                            <button onClick={() => setRoomChangeModal({ open: false, booking: null })} className="text-gray-500 hover:text-gray-700">
                                <FaTimes size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-600 mb-2">Current Room(s): {roomChangeModal.booking.room_numbers || 'N/A'}</p>
                            <p className="font-semibold">{roomChangeModal.booking.guest_name}</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select New Room
                            </label>
                            {availableRooms.length === 0 ? (
                                <p className="text-gray-600">No available rooms</p>
                            ) : (
                                <select
                                    value={selectedRoom}
                                    onChange={(e) => setSelectedRoom(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">Select a room...</option>
                                    {availableRooms.map((room) => (
                                        <option key={room.id} value={room.id}>
                                            Room {room.room_number} - Floor {room.floor} ({room.room_type_name || 'Standard'})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setRoomChangeModal({ open: false, booking: null })}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAllocateRoom}
                                disabled={!selectedRoom}
                                className="btn-primary flex-1 disabled:opacity-50"
                            >
                                <FaExchangeAlt className="inline mr-2" /> Change Room
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewBookingsPage;
