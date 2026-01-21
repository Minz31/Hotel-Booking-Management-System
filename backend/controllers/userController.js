const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// @desc    Get all users (administrators)
// @route   GET /api/users
// @access  Private (Admin)
// @desc    Get all users (administrators & guests)
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
    try {
        const { role, hotel_id, search } = req.query;
        let users = [];

        // 1. Fetch Guests
        if (!role || role === 'all' || role === 'guest') {
            let guestQuery = `
                SELECT 
                    id, first_name, last_name, email, phone, 'guest' as role, registration_date as created_at
                FROM guests
                WHERE 1=1
            `;
            const guestParams = [];

            if (search) {
                guestQuery += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
                guestParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            // Guests don't have hotel_id, so if filtering by hotel_id, strictly speaking guests shouldn't return 
            // UNLESS we consider guests to be global. For now, let's include them unless role='hotel_admin'.
            // But if specific hotel_id is requested for filtering USERS, guests aren't linked to hotels directly.
            // So we'll skip hotel_id filter for guests.

            guestQuery += ' ORDER BY registration_date DESC LIMIT 50'; // Limit results

            try {
                const [guests] = await pool.query(guestQuery, guestParams);
                console.log(`Found ${guests.length} guests matching search: "${search}"`);
                users = [...users, ...guests];
            } catch (guestError) {
                console.error('Error fetching guests:', guestError);
                // Continue to fetch admins even if guests query fails
            }
        }

        // 2. Fetch Administrators
        if (!role || role === 'all' || ['hotel_admin', 'super_admin', 'manager'].includes(role)) {
            let adminQuery = `
                SELECT 
                    id, full_name, email, created_at,
                    role, hotel_id, username
                FROM administrators
                WHERE 1=1
            `;
            const adminParams = [];

            if (search) {
                adminQuery += ` AND (full_name LIKE ? OR email LIKE ? OR username LIKE ?)`;
                adminParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            if (hotel_id) {
                adminQuery += ` AND hotel_id = ?`;
                adminParams.push(hotel_id);
            }

            if (role && role !== 'all') {
                adminQuery += ` AND role = ?`;
                adminParams.push(role);
            }

            adminQuery += ' ORDER BY created_at DESC LIMIT 50';
            const [admins] = await pool.query(adminQuery, adminParams);

            // Fetch hotel names and normalize names
            for (let admin of admins) {
                if (admin.hotel_id) {
                    const [hotels] = await pool.query('SELECT name FROM hotels WHERE id = ?', [admin.hotel_id]);
                    admin.hotel_name = hotels[0]?.name || null;
                }
                // Normalize name for frontend consistency
                if (admin.full_name) {
                    const parts = admin.full_name.split(' ');
                    admin.first_name = parts[0];
                    admin.last_name = parts.slice(1).join(' ');
                }
            }
            users = [...users, ...admins];
        }

        // Sort combined results by created_at desc (approximate merging)
        users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        next(error);
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [users] = await pool.query('SELECT * FROM administrators WHERE id = ?', [id]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create hotel admin
// @route   POST /api/users/admin
// @access  Private (Super Admin)
const createHotelAdmin = async (req, res, next) => {
    try {
        const { email, password, full_name, role, hotel_id, username } = req.body;

        // Check if email already exists
        const [existing] = await pool.query(
            'SELECT id FROM administrators WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already in use'
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);
        const adminId = uuidv4();
        const generatedUsername = username || email.split('@')[0];

        await pool.query(
            `INSERT INTO administrators (
                id, username, email, password_hash, full_name, 
                role, hotel_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                adminId,
                generatedUsername,
                email,
                password_hash,
                full_name,
                role || 'hotel_admin',
                hotel_id
            ]
        );

        const [newAdmin] = await pool.query(
            'SELECT id, username, email, full_name, role, hotel_id FROM administrators WHERE id = ?',
            [adminId]
        );

        res.status(201).json({
            success: true,
            message: 'Hotel admin created successfully',
            data: newAdmin[0]
        });
    } catch (error) {
        console.error('Create admin error:', error);
        next(error);
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { full_name, email, role, hotel_id } = req.body;

        await pool.query(
            `UPDATE administrators SET 
                full_name = ?, email = ?, role = ?, hotel_id = ?, updated_at = NOW()
            WHERE id = ?`,
            [full_name, email, role, hotel_id, id]
        );

        res.json({
            success: true,
            message: 'User updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete/deactivate user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Prevent deleting super admin
        await pool.query('DELETE FROM administrators WHERE id = ? AND role != "super_admin"', [id]);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createHotelAdmin,
    updateUser,
    deleteUser
};
