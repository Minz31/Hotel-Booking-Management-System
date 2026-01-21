import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaHotel, FaDoorOpen, FaDollarSign, FaCalendar, FaPlus } from 'react-icons/fa';
import { roomAPI, hotelAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';
import AddRoomTypeModal from '../../components/admin/AddRoomTypeModal';
import AddRoomModal from '../../components/admin/AddRoomModal';
import AddTariffModal from '../../components/admin/AddTariffModal';

const ManageRoomsPage = () => {
    const { hotelId } = useParams();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('types');
    const [hotel, setHotel] = useState(null);
    const [roomTypes, setRoomTypes] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [tariffs, setTariffs] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
    const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
    const [isAddTariffModalOpen, setIsAddTariffModalOpen] = useState(false);

    // Date range for availability
    const [dateRange, setDateRange] = useState({
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchHotelData();
        fetchRoomData();
    }, [hotelId, activeTab]);

    const fetchHotelData = async () => {
        try {
            const { data } = await hotelAPI.getHotelById(hotelId);
            setHotel(data.data);
        } catch (error) {
            toast.error('Failed to load hotel');
        }
    };

    const fetchRoomData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'types') {
                const { data } = await roomAPI.getRoomTypes(hotelId);
                setRoomTypes(data.data || []);
            } else if (activeTab === 'rooms') {
                const [typesRes, roomsRes] = await Promise.all([
                    roomAPI.getRoomTypes(hotelId),
                    roomAPI.getRooms(hotelId)
                ]);
                setRoomTypes(typesRes.data.data || []);
                setRooms(roomsRes.data.data || []);
            } else if (activeTab === 'pricing') {
                const [typesRes, tariffsRes] = await Promise.all([
                    roomAPI.getRoomTypes(hotelId),
                    roomAPI.getTariffs(hotelId)
                ]);
                setRoomTypes(typesRes.data.data || []);
                setTariffs(tariffsRes.data.data || []);
            } else if (activeTab === 'availability') {
                const { data } = await roomAPI.getAvailability(hotelId, dateRange);
                setAvailability(data.data || []);
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRoomType = async (id) => {
        if (!confirm('Delete this room type? All associated rooms must be removed first.')) return;
        try {
            await roomAPI.deleteRoomType(id);
            toast.success('Room type deleted');
            fetchRoomData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    const handleDeleteRoom = async (id) => {
        if (!confirm('Delete this room?')) return;
        try {
            await roomAPI.deleteRoom(id);
            toast.success('Room deleted');
            fetchRoomData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    const handleDeleteTariff = async (id) => {
        if (!confirm('Delete this pricing rule?')) return;
        try {
            await roomAPI.deleteTariff(id);
            toast.success('Pricing deleted');
            fetchRoomData();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleDateRangeChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    const handleFetchAvailability = () => {
        fetchRoomData();
    };

    // Group rooms by floor
    const groupedRooms = rooms.reduce((acc, room) => {
        if (!acc[room.floor]) acc[room.floor] = [];
        acc[room.floor].push(room);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Room Management</h1>
                    <p className="text-gray-600">{hotel?.name}</p>
                </div>

                {/* Tabs */}
                <div className="card p-0 mb-6 overflow-hidden">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('types')}
                            className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 font-medium transition ${activeTab === 'types'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <FaHotel /> Room Types
                        </button>
                        <button
                            onClick={() => setActiveTab('rooms')}
                            className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 font-medium transition ${activeTab === 'rooms'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <FaDoorOpen /> Rooms
                        </button>
                        <button
                            onClick={() => setActiveTab('pricing')}
                            className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 font-medium transition ${activeTab === 'pricing'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <FaDollarSign /> Pricing
                        </button>
                        <button
                            onClick={() => setActiveTab('availability')}
                            className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 font-medium transition ${activeTab === 'availability'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <FaCalendar /> Availability
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="card p-6">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : activeTab === 'types' ? (
                        /* Room Types Tab */
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Room Types</h2>
                                <button
                                    onClick={() => setIsAddTypeModalOpen(true)}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <FaPlus /> Add Room Type
                                </button>
                            </div>
                            {roomTypes.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No room types. Add one to get started!</p>
                            ) : (
                                <div className="grid gap-4">
                                    {roomTypes.map((type) => (
                                        <div key={type.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-bold">{type.name || type.type_name}</h3>
                                                    <p className="text-gray-600">{type.description}</p>
                                                    <div className="mt-2 flex gap-4 text-sm">
                                                        <span>👥 Max: {type.max_occupancy} guests</span>
                                                        <span>🚪 {type.total_rooms} rooms ({type.active_rooms} active)</span>
                                                        {type.amenities && <span>✨ {type.amenities}</span>}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteRoomType(type.id)}
                                                    className="text-red-600 hover:bg-red-50 p-2 rounded"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'rooms' ? (
                        /* Rooms Tab */
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Individual Rooms</h2>
                                <button
                                    onClick={() => setIsAddRoomModalOpen(true)}
                                    className="btn-primary flex items-center gap-2"
                                    disabled={roomTypes.length === 0}
                                >
                                    <FaPlus /> Add Room
                                </button>
                            </div>
                            {roomTypes.length === 0 ? (
                                <p className="text-yellow-600 bg-yellow-50 p-4 rounded">
                                    ⚠️ Please add room types first before adding individual rooms.
                                </p>
                            ) : rooms.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No rooms yet. Add one to get started!</p>
                            ) : (
                                <div className="space-y-6">
                                    {Object.keys(groupedRooms).sort((a, b) => a - b).map((floor) => (
                                        <div key={floor}>
                                            <h3 className="text-lg font-bold mb-3">Floor {floor}</h3>
                                            <div className="grid gap-3">
                                                {groupedRooms[floor].map((room) => (
                                                    <div key={room.id} className="border rounded-lg p-4 flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">🚪</span>
                                                            <div>
                                                                <h4 className="font-bold">Room {room.room_number}</h4>
                                                                <p className="text-sm text-gray-600">
                                                                    {room.type_name} • Max: {room.max_occupancy} guests
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {room.is_currently_booked > 0 ? (
                                                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm">
                                                                    🔴 Booked
                                                                </span>
                                                            ) : (
                                                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                                                                    ✅ Available
                                                                </span>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteRoom(room.id)}
                                                                className="text-red-600 hover:bg-red-50 p-2 rounded"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'pricing' ? (
                        /* Pricing Tab */
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Pricing & Tariffs</h2>
                                <button
                                    onClick={() => setIsAddTariffModalOpen(true)}
                                    className="btn-primary flex items-center gap-2"
                                    disabled={roomTypes.length === 0}
                                >
                                    <FaPlus /> Add Pricing
                                </button>
                            </div>
                            {roomTypes.length === 0 ? (
                                <p className="text-yellow-600 bg-yellow-50 p-4 rounded">
                                    ⚠️ Please add room types first before setting pricing.
                                </p>
                            ) : tariffs.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No pricing rules yet. Add one to set room rates!</p>
                            ) : (
                                <div className="grid gap-4">
                                    {tariffs.map((tariff) => (
                                        <div key={tariff.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-bold">{tariff.type_name}</h3>
                                                    <p className="text-3xl font-bold text-primary-600 mt-2">
                                                        ${parseFloat(tariff.price).toFixed(2)}/night
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        📅 {new Date(tariff.start_date).toLocaleDateString()} - {new Date(tariff.end_date).toLocaleDateString()}
                                                    </p>
                                                    {tariff.season_name && (
                                                        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                                                            {tariff.season_name}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteTariff(tariff.id)}
                                                    className="text-red-600 hover:bg-red-50 p-2 rounded"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Availability Tab */
                        <div>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold mb-4">Availability Overview</h2>
                                <div className="flex gap-4 items-end">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={dateRange.start_date}
                                            onChange={handleDateRangeChange}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">End Date</label>
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={dateRange.end_date}
                                            onChange={handleDateRangeChange}
                                            className="input-field"
                                        />
                                    </div>
                                    <button
                                        onClick={handleFetchAvailability}
                                        className="btn-primary"
                                    >
                                        Check Availability
                                    </button>
                                </div>
                            </div>

                            {availability.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    Select a date range and click "Check Availability"
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="border p-3 text-left">Room</th>
                                                <th className="border p-3 text-left">Type</th>
                                                <th className="border p-3 text-left">Floor</th>
                                                <th className="border p-3 text-left">Status</th>
                                                <th className="border p-3 text-left">Guest</th>
                                                <th className="border p-3 text-left">Dates</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {availability.map((item, idx) => (
                                                <tr key={idx} className={item.booking_id ? 'bg-red-50' : 'bg-green-50'}>
                                                    <td className="border p-3">🚪 {item.room_number}</td>
                                                    <td className="border p-3">{item.type_name}</td>
                                                    <td className="border p-3">Floor {item.floor}</td>
                                                    <td className="border p-3">
                                                        {item.booking_id ? (
                                                            <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-sm">
                                                                Booked
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm">
                                                                Available
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="border p-3">{item.guest_name || '-'}</td>
                                                    <td className="border p-3">
                                                        {item.booking_id ?
                                                            `${new Date(item.check_in_date).toLocaleDateString()} - ${new Date(item.check_out_date).toLocaleDateString()}`
                                                            : '-'
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <AddRoomTypeModal
                isOpen={isAddTypeModalOpen}
                onClose={() => setIsAddTypeModalOpen(false)}
                onSuccess={fetchRoomData}
                hotelId={hotelId}
            />

            <AddRoomModal
                isOpen={isAddRoomModalOpen}
                onClose={() => setIsAddRoomModalOpen(false)}
                onSuccess={fetchRoomData}
                hotelId={hotelId}
                roomTypes={roomTypes}
            />

            <AddTariffModal
                isOpen={isAddTariffModalOpen}
                onClose={() => setIsAddTariffModalOpen(false)}
                onSuccess={fetchRoomData}
                roomTypes={roomTypes}
                hotelId={hotelId}
            />
        </div>
    );
};

export default ManageRoomsPage;
