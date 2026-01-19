const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role || 'guest',
            hotel_id: user.hotel_id || null
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// @desc    Register new guest
// @route   POST /api/auth/register
// @access  Public
const registerGuest = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password, phone, address, city, state, country, zip_code } = req.body;

        // Check if guest already exists
        const [existing] = await pool.query('SELECT id FROM guests WHERE email = ?', [email]);

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);
        const guestId = uuidv4();

        // Insert guest
        await pool.query(
            `INSERT INTO guests (id, first_name, last_name, email, phone, address, city, state, country, zip_code) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [guestId, first_name, last_name, email, phone, address, city, state, country, zip_code]
        );

        // Store password separately (you'd need a separate auth table in production)
        // For now, we'll return the token

        const token = generateToken({ id: guestId, email, role: 'guest' });

        res.status(201).json({
            success: true,
            message: 'Guest registered successfully',
            data: {
                id: guestId,
                first_name,
                last_name,
                email,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login guest/admin
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check in guests table
        let [users] = await pool.query(
            'SELECT id, first_name, last_name, email FROM guests WHERE email = ?',
            [email]
        );

        let userType = 'guest';
        let user = users[0];

        // If not found in guests, check administrators
        if (!user) {
            [users] = await pool.query(
                'SELECT id, username, email, full_name, role, hotel_id, password_hash, permissions FROM administrators WHERE email = ?',
                [email]
            );
            user = users[0];
            userType = 'admin';
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // For admins, verify password (guests would need separate auth table)
        if (userType === 'admin') {
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
        }

        // Generate token
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role || 'guest',
            hotel_id: user.hotel_id || null
        });

        // Update last login
        if (userType === 'admin') {
            await pool.query('UPDATE administrators SET last_login = NOW() WHERE id = ?', [user.id]);
        } else {
            await pool.query('UPDATE guests SET last_login = NOW() WHERE id = ?', [user.id]);
        }

        // Parse admin full_name into first_name and last_name for frontend compatibility
        let responseUser;
        if (userType === 'admin' && user.full_name) {
            const nameParts = user.full_name.split(' ');
            // Parse permissions if it's a JSON string
            let permissions = user.permissions;
            if (typeof permissions === 'string') {
                try {
                    permissions = JSON.parse(permissions);
                } catch (e) {
                    permissions = [];
                }
            }

            responseUser = {
                id: user.id,
                email: user.email,
                first_name: nameParts[0] || 'Admin',
                last_name: nameParts.slice(1).join(' ') || 'User',
                role: user.role || 'guest',
                hotel_id: user.hotel_id || null,
                permissions: permissions || []
            };
        } else {
            responseUser = {
                id: user.id,
                email: user.email,
                first_name: user.first_name || 'User',
                last_name: user.last_name || '',
                role: user.role || 'guest',
                hotel_id: user.hotel_id || null
            };
        }

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: responseUser,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let user;

        if (role === 'guest') {
            const [users] = await pool.query(
                `SELECT id, first_name, last_name, email, phone, address, city, state, country, registration_date
         FROM guests WHERE id = ?`,
                [userId]
            );
            user = users[0];
        } else {
            const [users] = await pool.query(
                `SELECT id, username, email, full_name, role, hotel_id, created_at
         FROM administrators WHERE id = ?`,
                [userId]
            );
            user = users[0];
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerGuest,
    login,
    getMe
};
