import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { roomAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AddRoomTypeModal = ({ isOpen, onClose, onSuccess, hotelId }) => {
    const [formData, setFormData] = useState({
        type_name: '',
        description: '',
        max_occupancy: 2,
        amenities: ''
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
            await roomAPI.createRoomType({ ...formData, hotel_id: hotelId });
            toast.success('Room type created successfully!');
            onSuccess();
            onClose();
            setFormData({
                type_name: '',
                description: '',
                max_occupancy: 2,
                amenities: ''
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create room type');
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
                        <h3 className="text-2xl font-bold text-white">Add Room Type</h3>
                        <button onClick={onClose} className="text-white hover:text-gray-200 transition">
                            <FaTimes className="text-2xl" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Room Type Name *
                                </label>
                                <input
                                    type="text"
                                    name="type_name"
                                    value={formData.type_name}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="e.g., Deluxe Suite, Single Room"
                                />
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
                                    placeholder="Describe this room type..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Occupancy *
                                </label>
                                <input
                                    type="number"
                                    name="max_occupancy"
                                    value={formData.max_occupancy}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    max="10"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amenities
                                </label>
                                <input
                                    type="text"
                                    name="amenities"
                                    value={formData.amenities}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="WiFi, AC, TV, Mini-bar"
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
                                {loading ? 'Creating...' : 'Create Room Type'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddRoomTypeModal;
