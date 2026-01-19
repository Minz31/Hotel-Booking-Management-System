import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaDoorOpen } from 'react-icons/fa';
import { hotelAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';
import AddHotelModal from '../../components/admin/AddHotelModal';
import EditHotelModal from '../../components/admin/EditHotelModal';

const ManageHotelsPage = () => {
    const { user } = useAuthStore();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);

    const isSuperAdmin = user?.role === 'super_admin';
    const isHotelAdmin = user?.role === 'hotel_admin';
    const userHotelId = user?.hotel_id;

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            console.log('Fetching hotels...');
            const { data } = await hotelAPI.getAllHotels();
            console.log('Hotels response:', data);

            let filteredHotels = data.data || [];

            // Filter hotels for hotel admins
            if (isHotelAdmin && userHotelId) {
                filteredHotels = filteredHotels.filter(hotel => hotel.id === userHotelId);
                console.log('Filtered to hotel:', userHotelId, filteredHotels);
            }

            setHotels(filteredHotels);
            setError(null);
        } catch (error) {
            console.error('Failed to load hotels:', error);
            setError(error.response?.data?.message || error.message || 'Failed to load hotels');
            toast.error('Failed to load hotels');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (hotel) => {
        setSelectedHotel(hotel);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (hotelId) => {
        if (!confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) return;

        try {
            await hotelAPI.deleteHotel(hotelId);
            toast.success('Hotel deleted successfully');
            fetchHotels(); // Refresh list
        } catch (error) {
            toast.error('Failed to delete hotel');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">
                        {isHotelAdmin ? 'Your Hotel' : 'Manage Hotels'}
                    </h1>
                    {isSuperAdmin && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <FaPlus /> Add New Hotel
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        <p className="mt-4 text-gray-600">Loading hotels...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <div className="card p-8 max-w-md mx-auto bg-red-50">
                            <p className="text-red-600 text-xl font-bold mb-4">❌ Error Loading Hotels</p>
                            <p className="text-gray-700 mb-4">{error}</p>
                            <p className="text-sm text-gray-600 mb-4">Check console (F12) for details</p>
                            <button onClick={fetchHotels} className="btn-primary">
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : hotels.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="card p-8 max-w-md mx-auto">
                            <p className="text-2xl font-bold mb-4">📋 No Hotels Found</p>
                            <p className="text-gray-600 mb-6">There are no hotels in the database yet.</p>
                            <button className="btn-primary">
                                <FaPlus className="inline mr-2" />
                                Add Your First Hotel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <p className="text-sm text-gray-600 mb-2">Found {hotels.length} hotel(s)</p>
                        {hotels.map((hotel) => (
                            <div key={hotel.id} className="card p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold mb-2">{hotel.name}</h3>
                                        <p className="text-gray-600 mb-4">
                                            {hotel.address}, {hotel.city}, {hotel.state}, {hotel.country}
                                        </p>
                                        <div className="flex gap-4 text-sm">
                                            <span className="font-semibold">⭐ {hotel.star_rating} Stars</span>
                                            <span>📧 {hotel.email}</span>
                                            <span>📞 {hotel.phone}</span>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/admin/rooms/${hotel.id}`}
                                        className="btn-primary text-sm px-3 py-2 flex items-center gap-2"
                                    >
                                        <FaDoorOpen /> Rooms
                                    </Link>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(hotel)}
                                            className="btn-secondary p-2"
                                            title="Edit Hotel"
                                        >
                                            <FaEdit />
                                        </button>
                                        {isSuperAdmin && (
                                            <button
                                                onClick={() => handleDelete(hotel.id)}
                                                className="text-red-600 hover:bg-red-50 p-2 rounded"
                                                title="Delete Hotel"
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Hotel Modal */}
            <AddHotelModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchHotels}
            />

            {/* Edit Hotel Modal */}
            <EditHotelModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedHotel(null);
                }}
                onSuccess={fetchHotels}
                hotel={selectedHotel}
            />
        </div>
    );
};

export default ManageHotelsPage;
