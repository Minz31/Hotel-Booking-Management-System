import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendar, FaUsers, FaHotel, FaBed, FaCheckCircle } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { bookingAPI } from '../services/api';
import { useBookingStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';

const BookingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { currentBooking, clearBooking } = useBookingStore();

    const [formData, setFormData] = useState({
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 86400000), // +1 day
        guests: 2,
        discountCode: '',
        specialRequests: ''
    });

    const [pricing, setPricing] = useState({
        basePrice: 0,
        nights: 1,
        totalAmount: 0,
        discountAmount: 0,
        finalAmount: 0
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!currentBooking) {
            toast.error('Please select a hotel and room first');
            navigate('/hotels');
            return;
        }
        calculatePricing();
    }, [currentBooking, formData.checkIn, formData.checkOut]);

    const calculatePricing = () => {
        if (!currentBooking?.roomType) return;

        const checkIn = new Date(formData.checkIn);
        const checkOut = new Date(formData.checkOut);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const basePrice = currentBooking.roomType.current_price || currentBooking.roomType.base_price;
        const totalAmount = basePrice * nights;

        setPricing({
            basePrice,
            nights: nights > 0 ? nights : 1,
            totalAmount,
            discountAmount: 0,
            finalAmount: totalAmount
        });
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate dates
            if (formData.checkIn >= formData.checkOut) {
                toast.error('Check-out date must be after check-in date');
                setLoading(false);
                return;
            }

            const bookingData = {
                guest_id: user.id,
                hotel_id: currentBooking.hotel.id,
                check_in_date: formData.checkIn.toISOString().split('T')[0],
                check_out_date: formData.checkOut.toISOString().split('T')[0],
                room_ids: [currentBooking.roomType.id],
                number_of_guests: formData.guests,
                special_requests: formData.specialRequests || null,
                discount_code: formData.discountCode || null
            };

            const { data } = await bookingAPI.createBooking(bookingData);

            toast.success('Booking created successfully!');
            clearBooking();
            navigate(`/bookings/${data.data.id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create booking');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!currentBooking) {
        return null;
    }

    const { hotel, roomType } = currentBooking;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Complete Your Booking</h1>
                    <p className="text-gray-600">Review your details and confirm your reservation</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Booking Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Hotel & Room Info */}
                            <div className="card p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <FaHotel className="text-primary-600 text-3xl mt-1" />
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-1">{hotel.name}</h3>
                                        <p className="text-gray-600">{hotel.city}, {hotel.country}</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <FaBed className="text-primary-600" />
                                        <h4 className="font-semibold">{roomType.name}</h4>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-2">{roomType.description}</p>
                                    <div className="flex gap-4 text-sm text-gray-600">
                                        <span>👥 Max: {roomType.max_occupancy} guests</span>
                                        <span>🛏️ {roomType.bed_type}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dates & Guests */}
                            <div className="card p-6">
                                <h3 className="text-lg font-bold mb-4">Booking Details</h3>

                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <FaCalendar className="inline mr-2" />
                                            Check-in Date
                                        </label>
                                        <DatePicker
                                            selected={formData.checkIn}
                                            onChange={(date) => handleChange('checkIn', date)}
                                            minDate={new Date()}
                                            className="input-field"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <FaCalendar className="inline mr-2" />
                                            Check-out Date
                                        </label>
                                        <DatePicker
                                            selected={formData.checkOut}
                                            onChange={(date) => handleChange('checkOut', date)}
                                            minDate={formData.checkIn}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FaUsers className="inline mr-2" />
                                        Number of Guests
                                    </label>
                                    <select
                                        value={formData.guests}
                                        onChange={(e) => handleChange('guests', Number(e.target.value))}
                                        className="input-field"
                                        required
                                    >
                                        {Array.from({ length: roomType.max_occupancy }, (_, i) => i + 1).map(num => (
                                            <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Discount Code (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.discountCode}
                                        onChange={(e) => handleChange('discountCode', e.target.value.toUpperCase())}
                                        placeholder="Enter code"
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Guest Information */}
                            <div className="card p-6">
                                <h3 className="text-lg font-bold mb-4">Guest Information</h3>

                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={user?.first_name || ''}
                                            disabled
                                            className="input-field bg-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={user?.last_name || ''}
                                            disabled
                                            className="input-field bg-gray-100"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="input-field bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Special Requests (Optional)
                                    </label>
                                    <textarea
                                        value={formData.specialRequests}
                                        onChange={(e) => handleChange('specialRequests', e.target.value)}
                                        placeholder="E.g., Late check-in, extra pillows, quiet room..."
                                        rows="3"
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-4 text-lg disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Confirm Booking'}
                            </button>
                        </form>
                    </div>

                    {/* Price Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card p-6 sticky top-24">
                            <h3 className="text-xl font-bold mb-6">Price Summary</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        ${pricing.basePrice} × {pricing.nights} night{pricing.nights > 1 ? 's' : ''}
                                    </span>
                                    <span className="font-semibold">${pricing.totalAmount.toFixed(2)}</span>
                                </div>

                                {pricing.discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-${pricing.discountAmount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold">Total</span>
                                        <span className="text-2xl font-bold text-primary-600">
                                            ${pricing.finalAmount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-primary-50 p-4 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <FaCheckCircle className="text-primary-600 mt-1" />
                                    <div className="text-sm">
                                        <p className="font-semibold mb-1">Free Cancellation</p>
                                        <p className="text-gray-600">Cancel up to 24 hours before check-in</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 text-sm text-gray-600">
                                <p className="mb-2">✅ Instant confirmation</p>
                                <p className="mb-2">✅ No booking fees</p>
                                <p>✅ Secure payment</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
