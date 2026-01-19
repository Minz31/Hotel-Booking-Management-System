const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// @desc    Get all users (administrators)
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
    try {
        const { role, hotel_id, search } = req.query;

        // Get administrators only (guests can be added later if needed)
        let query = `
            SELECT 
                id, full_name, email, created_at,
                role, hotel_id, username
            FROM administrators
            WHERE 1=1
        `;

        const params = [];

        if (search) {
            query += ` AND (full_name LIKE ? OR email LIKE ? OR username LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (hotel_id) {
            query += ` AND hotel_id = ?`;
            params.push(hotel_id);
        }

        if (role && role !== 'all' && role !== 'guest') {
            query += ` AND role = ?`;
            params.push(role);
        }

        query += ' ORDER BY created_at DESC';

        const [users] = await pool.query(query, params);

        // Get hotel names for admins
        for (let user of users) {
            if (user.hotel_id) {
                const [hotels] = await pool.query('SELECT name FROM hotels WHERE id = ?', [user.hotel_id]);
                user.hotel_name = hotels[0]?.name || null;
            }
        }

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
