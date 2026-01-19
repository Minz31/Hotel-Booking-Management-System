import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUser, FaUserShield } from 'react-icons/fa';
import { userAPI, hotelAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';
import AddAdminModal from '../../components/admin/AddAdminModal';
import EditAdminModal from '../../components/admin/EditAdminModal';

const ManageUsersPage = () => {
    const { user } = useAuthStore();
    const [users, setUsers] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);

    const isSuperAdmin = user?.role === 'super_admin';

    useEffect(() => {
        fetchUsers();
        fetchHotels();
    }, [filter, searchTerm]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {
                role: filter !== 'all' ? filter : undefined,
                search: searchTerm || undefined
            };
            const { data } = await userAPI.getAllUsers(params);
            setUsers(data.data || []);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchHotels = async () => {
        try {
            const { data } = await hotelAPI.getAllHotels();
            setHotels(data.data || []);
        } catch (error) {
            console.error('Failed to load hotels');
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await userAPI.deleteUser(userId);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const handleEdit = (admin) => {
        setSelectedAdmin(admin);
        setIsEditModalOpen(true);
    };

    const getRoleBadge = (role) => {
        const badges = {
            guest: 'bg-gray-100 text-gray-800',
            hotel_admin: 'bg-blue-100 text-blue-800',
            super_admin: 'bg-purple-100 text-purple-800'
        };
        return badges[role] || badges.guest;
    };

    const getRoleIcon = (role) => {
        if (role === 'super_admin' || role === 'hotel_admin') {
            return <FaUserShield className="inline mr-2" />;
        }
        return <FaUser className="inline mr-2" />;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">Manage Users</h1>
                    {isSuperAdmin && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <FaPlus /> Add Hotel Admin
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="card p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field"
                                placeholder="Search by name or email..."
                            />
                        </div>

                        {/* Role Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Role
                            </label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="input-field"
                            >
                                <option value="all">All Users</option>
                                <option value="guest">Guests</option>
                                <option value="hotel_admin">Hotel Admins</option>
                                {isSuperAdmin && <option value="super_admin">Super Admins</option>}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        <p className="mt-4 text-gray-600">Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="card p-8 max-w-md mx-auto">
                            <p className="text-2xl font-bold mb-4">No Users Found</p>
                            <p className="text-gray-600 mb-6">No users match your filters.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        <p className="text-sm text-gray-600 mb-2">Found {users.length} user(s)</p>
                        {users.map((userItem) => (
                            <div key={userItem.id} className="card p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-3">
                                            {getRoleIcon(userItem.role)}
                                            <h3 className="text-xl font-bold">
                                                {userItem.full_name || `${userItem.first_name} ${userItem.last_name}`}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-sm ${getRoleBadge(userItem.role)}`}>
                                                {userItem.role.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Email</p>
                                                <p className="font-semibold">{userItem.email}</p>
                                            </div>
                                            {userItem.phone && (
                                                <div>
                                                    <p className="text-gray-600">Phone</p>
                                                    <p className="font-semibold">{userItem.phone}</p>
                                                </div>
                                            )}
                                            {userItem.hotel_name && (
                                                <div>
                                                    <p className="text-gray-600">Assigned Hotel</p>
                                                    <p className="font-semibold">{userItem.hotel_name}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-gray-600">Joined</p>
                                                <p className="font-semibold">
                                                    {new Date(userItem.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {userItem.role !== 'super_admin' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(userItem)}
                                                className="btn-secondary p-2"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            {isSuperAdmin && (
                                                <button
                                                    onClick={() => handleDelete(userItem.id)}
                                                    className="text-red-600 hover:bg-red-50 p-2 rounded"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Admin Modal */}
            <AddAdminModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchUsers}
                hotels={hotels}
            />

            {/* Edit Admin Modal */}
            <EditAdminModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedAdmin(null);
                }}
                onSuccess={fetchUsers}
                hotels={hotels}
                admin={selectedAdmin}
            />
        </div>
    );
};

export default ManageUsersPage;
