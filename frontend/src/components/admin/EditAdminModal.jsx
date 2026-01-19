import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EditAdminModal = ({ isOpen, onClose, onSuccess, hotels, admin }) => {
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        role: 'hotel_admin',
        hotel_id: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (admin) {
            setFormData({
                email: admin.email || '',
                full_name: admin.full_name || '',
                role: admin.role || 'hotel_admin',
                hotel_id: admin.hotel_id || ''
            });
        }
    }, [admin]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await userAPI.updateUser(admin.id, formData);
            toast.success('Admin updated successfully!');
            onSuccess(); // Refresh users list
            onClose(); // Close modal
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update admin');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                ></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    {/* Header */}
                    <div className="bg-primary-600 px-6 py-4 flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-white">Edit Administrator</h3>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition"
                        >
                            <FaTimes className="text-2xl" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-6 py-6">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="John Smith"
                                />
                            </div>

                            {/* Email */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="admin@hotel.com"
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role *
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                >
                                    <option value="hotel_admin">Hotel Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>

                            {/* Assign Hotel */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assigned Hotel *
                                </label>
                                <select
                                    name="hotel_id"
                                    value={formData.hotel_id}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                >
                                    <option value="">Select a hotel...</option>
                                    {hotels.map((hotel) => (
                                        <option key={hotel.id} value={hotel.id}>
                                            {hotel.name} - {hotel.city}, {hotel.country}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
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
                                {loading ? 'Updating...' : 'Update Admin'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditAdminModal;
