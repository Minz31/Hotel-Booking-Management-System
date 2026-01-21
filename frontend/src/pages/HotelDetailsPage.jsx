import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaPhone, FaEnvelope, FaWifi, FaParking, FaSwimmingPool } from 'react-icons/fa';
import { hotelAPI } from '../services/api';
import { useBookingStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';
import ReviewsList from '../components/reviews/ReviewsList';

const HotelDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const { setCurrentBooking } = useBookingStore();

    const [hotel, setHotel] = useState(null);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHotelDetails();
        fetchRoomTypes();
    }, [id]);

    const fetchHotelDetails = async () => {
        try {
            const { data } = await hotelAPI.getHotelById(id);
            setHotel(data.data);
        } catch (error) {
            toast.error('Failed to load hotel details');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoomTypes = async () => {
        try {
            const { data } = await hotelAPI.getRoomTypes(id);
            setRoomTypes(data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleBookNow = (roomType) => {
        if (!isAuthenticated) {
            toast.error('Please login to book a room');
            navigate('/login');
            return;
        }

        setCurrentBooking({
            hotel,
            roomType
        });
        navigate('/booking');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-600">Hotel not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Image */}
            <div className="relative h-96">
                <img
                    src={`https://source.unsplash.com/1200x600/?hotel,${hotel.city}`}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl font-bold mb-2">{hotel.name}</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-yellow-400">
                                {'⭐'.repeat(hotel.star_rating)}
                            </span>
                            <div className="flex items-center gap-2">
                                <FaMapMarkerAlt />
                                <span>{hotel.address}, {hotel.city}, {hotel.state}, {hotel.country}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="card p-6">
                            <h2 className="text-2xl font-bold mb-4">About This Hotel</h2>
                            <p className="text-gray-700 leading-relaxed">
                                {hotel.description || 'Welcome to our hotel! We offer comfortable accommodations and excellent service to make your stay memorable.'}
                            </p>
                        </div>

                        {/* Amenities */}
                        <div className="card p-6">
                            <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2">
                                    <FaWifi className="text-primary-600" />
                                    <span>Free WiFi</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaParking className="text-primary-600" />
                                    <span>Parking</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaSwimmingPool className="text-primary-600" />
                                    <span>Pool</span>
                                </div>
                            </div>
                        </div>


                        {/* Room Types */}
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Available Rooms</h2>
                            <div className="space-y-4">
                                {roomTypes.length === 0 ? (
                                    <p className="text-gray-600">No rooms available</p>
                                ) : (
                                    roomTypes.map((room) => (
                                        <div key={room.id} className="card p-6 hover:shadow-lg transition-shadow">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                                                    <p className="text-gray-600 mb-4">{room.description}</p>

                                                    <div className="flex gap-6 text-sm mb-4">
                                                        <span>👥 Max: {room.max_occupancy} guests</span>
                                                        <span>🛏️ {room.bed_type}</span>
                                                    </div>

                                                    {room.amenities && (
                                                        <p className="text-sm text-gray-600">
                                                            Amenities: {room.amenities}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="text-right ml-6">
                                                    <div className="mb-2">
                                                        <span className="text-3xl font-bold text-primary-600">
                                                            ${room.current_price || room.base_price}
                                                        </span>
                                                        <span className="text-gray-600"> /night</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mb-4">
                                                        {room.available_rooms} rooms available
                                                    </p>
                                                    <button
                                                        onClick={() => handleBookNow(room)}
                                                        className="btn-primary"
                                                        disabled={room.available_rooms === 0}
                                                    >
                                                        {room.available_rooms === 0 ? 'Sold Out' : 'Book Now'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        {/* Reviews */}
                        <div className="card p-6">
                            <ReviewsList hotelId={id} hotelName={hotel.name} />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Info */}
                        <div className="card p-6">
                            <h3 className="text-xl font-bold mb-4">Contact</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <FaPhone className="text-primary-600" />
                                    <span>{hotel.phone}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaEnvelope className="text-primary-600" />
                                    <span className="text-sm">{hotel.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="card p-6">
                            <h3 className="text-xl font-bold mb-4">Guest Rating</h3>
                            <div className="flex items-center gap-4">
                                <div className="text-4xl font-bold text-primary-600">
                                    {hotel.avg_rating || 'New'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <FaStar className="text-yellow-400" />
                                        <FaStar className="text-yellow-400" />
                                        <FaStar className="text-yellow-400" />
                                        <FaStar className="text-yellow-400" />
                                        <FaStar className="text-gray-300" />
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {hotel.review_count || 0} reviews
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelDetailsPage;
