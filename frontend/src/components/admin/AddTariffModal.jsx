import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { roomAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AddTariffModal = ({ isOpen, onClose, onSuccess, roomTypes }) => {
    const [formData, setFormData] = useState({
        room_type_id: '',
        price: '',
        start_date: '',
        end_date: '',
        season_name: ''
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
            await roomAPI.createTariff(formData);
            toast.success('Pricing created successfully!');
            onSuccess();
            onClose();
            setFormData({
                room_type_id: '',
                price: '',
                start_date: '',
                end_date: '',
                season_name: ''
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create pricing');
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
                        <h3 className="text-2xl font-bold text-white">Add Pricing</h3>
                        <button onClick={onClose} className="text-white hover:text-gray-200 transition">
                            <FaTimes className="text-2xl" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-6">
                        <div className="grid grid-cols-2 gap-6">
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
                                            {type.name || type.type_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price per Night *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="input-field pl-8"
                                        placeholder="100.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date *
                                </label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Season Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="season_name"
                                    value={formData.season_name}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="e.g., Peak Season, Off Season"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Optional label for this pricing period
                                </p>
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
                                {loading ? 'Creating...' : 'Create Pricing'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddTariffModal;
