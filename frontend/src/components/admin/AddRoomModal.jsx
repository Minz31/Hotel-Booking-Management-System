import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { roomAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AddRoomModal = ({ isOpen, onClose, onSuccess, hotelId, roomTypes }) => {
    const [formData, setFormData] = useState({
        room_number: '',
        room_type_id: '',
        floor: 1,
        description: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await roomAPI.createRoom({ ...formData, hotel_id: hotelId });
            toast.success('Room created successfully!');
            onSuccess();
            onClose();
            setFormData({
                room_number: '',
                room_type_id: '',
                floor: 1,
                description: ''
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create room');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                ></div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="bg-primary-600 px-6 py-4 flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-white">Add Room</h3>
                        <button onClick={onClose} className="text-white hover:text-gray-200 transition">
                            <FaTimes className="text-2xl" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Room Number *
                                </label>
                                <input
                                    type="text"
                                    name="room_number"
                                    value={formData.room_number}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="e.g., 101, 201A"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Floor *
                                </label>
                                <input
                                    type="number"
                                    name="floor"
                                    value={formData.floor}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    max="100"
                                    className="input-field"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Room Type *
                                </label>
                                <select
                                    name="room_type_id"
                                    value={formData.room_type_id}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                >
                                    <option value="">Select room type...</option>
                                    {roomTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name || type.type_name} (Max: {type.max_occupancy} guests)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="input-field"
                                    placeholder="Special notes about this room..."
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Room'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddRoomModal;
