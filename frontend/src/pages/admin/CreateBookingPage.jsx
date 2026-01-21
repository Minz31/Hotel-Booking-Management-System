import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaHotel, FaCalendar, FaSearch } from 'react-icons/fa';
import { bookingAPI, hotelAPI, userAPI, roomAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CreateBookingPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        hotel_id: '',
        user_id: '',
        check_in_date: '',
        check_out_date: '',
        room_types: [], // { room_type_id, count }
        special_requests: '',
        number_of_guests: 1
    });

    // Fetched Data
    const [hotels, setHotels] = useState([]);
    const [users, setUsers] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [selectedRoomTypes, setSelectedRoomTypes] = useState({});

    // Search Users
    const [userSearch, setUserSearch] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            const { data } = await hotelAPI.getAllHotels();
            setHotels(data.data || []);
        } catch (error) {
            toast.error('Failed to load hotels');
        }
    };

    const fetchUsers = async (search) => {
        if (!search) return;
        setHasSearched(true);
        try {
            const { data } = await userAPI.getAllUsers({ search });
            const foundUsers = data.data || [];
            setUsers(foundUsers);

            // Auto-select if only 1 user found
            if (foundUsers.length === 1) {
                setFormData(prev => ({ ...prev, user_id: foundUsers[0].id }));
                toast.success(`Selected guest: ${foundUsers[0].first_name} ${foundUsers[0].last_name}`);
            } else {
                // Reset selection if multiple or none (force user to choose)
                setFormData(prev => ({ ...prev, user_id: '' }));
            }
        } catch (error) {
            console.error('Failed to search users');
            toast.error('Search failed');
        }
    };

    // Step 1: Select Hotel & Dates & User
    const handleStep1Submit = async (e) => {
        e.preventDefault();

        if (!formData.hotel_id) {
            toast.error('Please select a hotel');
            return;
        }
        if (!formData.user_id) {
            toast.error('Please search and select a guest');
            return;
        }

        console.log('Date validation - Check-in:', formData.check_in_date, 'Check-out:', formData.check_out_date);

        if (!formData.check_in_date) {
            toast.error('Please select check-in date');
            return;
        }
        if (!formData.check_out_date) {
            toast.error('Please select check-out date');
            return;
        }

        setLoading(true);
        try {
            // Check availability
            const { data } = await hotelAPI.searchAvailableRooms(formData.hotel_id, {
                check_in: formData.check_in_date,
                check_out: formData.check_out_date,
                guests: formData.number_of_guests
            });
            setAvailableRooms(data.data || []);
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to check availability');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Select Rooms
    const handleRoomSelection = (roomTypeId, count, max) => {
        if (count < 0 || count > max) return;
        setSelectedRoomTypes(prev => ({
            ...prev,
            [roomTypeId]: count
        }));
    };

    const handleCreateBooking = async () => {
        const room_ids = [];
        // Flatten selected room types into array of IDs
        // Here we are just passing room type IDs, backend handles allocation
        // BUT wait, backend expects 'room_ids' as array of actual room IDs OR room Type IDs if handled?
        // Let's check backend... backend says: "Can be actual room IDs (r1, r2) OR room type IDs (rt1, rt2)"
        // And resolving logic: "if (roomTypeCheck.length > 0) It's a room type ID"
        // So we can pass room type IDs repeated for count.

        Object.entries(selectedRoomTypes).forEach(([typeId, count]) => {
            for (let i = 0; i < count; i++) {
                room_ids.push(typeId);
            }
        });

        if (room_ids.length === 0) {
            toast.error('Please select at least one room');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                hotel_id: formData.hotel_id,
                guest_id: formData.user_id,
                check_in_date: formData.check_in_date,
                check_out_date: formData.check_out_date,
                room_ids: room_ids,
                number_of_guests: formData.number_of_guests,
                special_requests: formData.special_requests
            };

            await bookingAPI.createBooking(payload);
            toast.success('Booking created successfully');
            navigate('/admin/bookings');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-8">Create New Booking</h1>

                {/* Stepper */}
                <div className="flex items-center mb-8">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>1</div>
                    <div className={`h-1 flex-1 mx-2 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>2</div>
                </div>

                <div className="card p-6">
                    {step === 1 ? (
                        <form onSubmit={handleStep1Submit} className="space-y-6">
                            {/* Hotel Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Hotel</label>
                                <select
                                    required
                                    className="input-field"
                                    value={formData.hotel_id}
                                    onChange={(e) => setFormData({ ...formData, hotel_id: e.target.value })}
                                >
                                    <option value="">Select a hotel...</option>
                                    {hotels.map(h => (
                                        <option key={h.id} value={h.id}>{h.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* User Search & Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Guest User</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Search by name or email...."
                                        className="input-field"
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), fetchUsers(userSearch))}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fetchUsers(userSearch)}
                                        className="btn-secondary"
                                    >
                                        <FaSearch />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">Search for a user, then select from the list below.</p>

                                {users.length > 0 ? (
                                    <select
                                        required
                                        className="input-field border-green-500 bg-green-50 font-semibold"
                                        value={formData.user_id}
                                        onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                        size={users.length > 1 ? Math.min(users.length + 1, 5) : 0} // Show list if multiple
                                    >
                                        <option value="">-- Select Guest From Results --</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.first_name || u.full_name} {u.last_name} ({u.email})
                                            </option>
                                        ))}
                                    </select>
                                ) : hasSearched ? (
                                    <p className="text-sm text-red-500 font-bold p-2 bg-red-50 rounded">No guests found. Please try a different name or email.</p>
                                ) : null}

                                {formData.user_id && (
                                    <div className="mt-2 p-2 bg-green-100 text-green-800 rounded text-sm">
                                        Selected: <strong>{users.find(u => u.id === formData.user_id)?.first_name} {users.find(u => u.id === formData.user_id)?.last_name}</strong>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="input-field"
                                        value={formData.check_in_date}
                                        onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="input-field"
                                        value={formData.check_out_date}
                                        onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    className="input-field"
                                    value={formData.number_of_guests}
                                    onChange={(e) => setFormData({ ...formData, number_of_guests: parseInt(e.target.value) })}
                                />
                            </div>

                            <button type="submit" className="btn-primary w-full" disabled={loading}>
                                {loading ? 'Checking Availability...' : 'Next: Select Rooms'}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold">Select Rooms</h3>
                            {availableRooms.length === 0 ? (
                                <p className="text-red-500">No rooms available for these dates.</p>
                            ) : (
                                <div className="space-y-4">
                                    {availableRooms.map(roomType => (
                                        <div key={roomType.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                            <div>
                                                <h4 className="font-bold">{roomType.name}</h4>
                                                <p className="text-sm text-gray-600">${roomType.base_price} / night</p>
                                                <p className="text-xs text-green-600">{roomType.available_count} available</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                                                    onClick={() => handleRoomSelection(roomType.id, (selectedRoomTypes[roomType.id] || 0) - 1, roomType.available_count)}
                                                >
                                                    -
                                                </button>
                                                <span className="font-bold w-4 text-center">{selectedRoomTypes[roomType.id] || 0}</span>
                                                <button
                                                    className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center hover:bg-primary-200"
                                                    onClick={() => handleRoomSelection(roomType.id, (selectedRoomTypes[roomType.id] || 0) + 1, roomType.available_count)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
                                <textarea
                                    className="input-field"
                                    rows="3"
                                    value={formData.special_requests}
                                    onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    className="btn-secondary flex-1"
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </button>
                                <button
                                    className="btn-primary flex-1"
                                    onClick={handleCreateBooking}
                                    disabled={loading || availableRooms.length === 0}
                                >
                                    {loading ? 'Creating...' : 'Create Booking'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateBookingPage;
