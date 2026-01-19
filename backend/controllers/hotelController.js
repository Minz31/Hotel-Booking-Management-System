const { pool } = require('../config/database');

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
const getAllHotels = async (req, res, next) => {
    try {
        const { city, country, star_rating, page = 1, limit = 10 } = req.query;

        let query = `
      SELECT h.*, 
        COUNT(DISTINCT r.id) AS total_rooms,
        MIN(t.price) AS starting_price,
        ROUND(AVG(rev.rating), 2) AS avg_rating,
        COUNT(DISTINCT rev.id) AS review_count
      FROM hotels h
      LEFT JOIN rooms r ON h.id = r.hotel_id AND r.is_active = TRUE
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      LEFT JOIN tariffs t ON rt.id = t.room_type_id AND CURDATE() BETWEEN t.start_date AND t.end_date
      LEFT JOIN reviews rev ON h.id = rev.hotel_id AND rev.is_approved = TRUE
      WHERE h.is_active = TRUE
    `;

        const params = [];

        if (city) {
            query += ' AND h.city = ?';
            params.push(city);
        }

        if (country) {
            query += ' AND h.country = ?';
            params.push(country);
        }

        if (star_rating) {
            query += ' AND h.star_rating = ?';
            params.push(star_rating);
        }

        query += ' GROUP BY h.id ORDER BY h.star_rating DESC, avg_rating DESC';

        // Pagination
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [hotels] = await pool.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) AS total FROM hotels WHERE is_active = TRUE';
        const countParams = [];

        if (city) {
            countQuery += ' AND city = ?';
            countParams.push(city);
        }
        if (country) {
            countQuery += ' AND country = ?';
            countParams.push(country);
        }
        if (star_rating) {
            countQuery += ' AND star_rating = ?';
            countParams.push(star_rating);
        }

        const [[{ total }]] = await pool.query(countQuery, countParams);

        res.json({
            success: true,
            data: hotels,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
const getHotelById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [hotels] = await pool.query(
            `SELECT h.*,
        COUNT(DISTINCT r.id) AS total_rooms,
        ROUND(AVG(rev.rating), 2) AS avg_rating,
        COUNT(DISTINCT rev.id) AS review_count
       FROM hotels h
       LEFT JOIN rooms r ON h.id = r.hotel_id
       LEFT JOIN reviews rev ON h.id = rev.hotel_id AND rev.is_approved = TRUE
       WHERE h.id = ? AND h.is_active = TRUE
       GROUP BY h.id`,
            [id]
        );

        if (hotels.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found'
            });
        }

        res.json({
            success: true,
            data: hotels[0]
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get room types for a hotel
// @route   GET /api/hotels/:id/room-types
// @access  Public
const getHotelRoomTypes = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [roomTypes] = await pool.query(
            `SELECT rt.id, rt.hotel_id, rt.name, rt.description, 
        rt.max_occupancy, rt.bed_type, rt.amenities, rt.base_price,
        rt.created_at, rt.updated_at, rt.is_active,
        MAX(t.price) AS current_price, 
        MAX(t.currency) AS currency,
        COUNT(DISTINCT r.id) AS available_rooms
       FROM room_types rt
       LEFT JOIN tariffs t ON rt.id = t.room_type_id 
         AND CURDATE() BETWEEN t.start_date AND t.end_date
       LEFT JOIN rooms r ON rt.id = r.room_type_id 
         AND r.status = 'available' AND r.is_active = TRUE
       WHERE rt.hotel_id = ? AND rt.is_active = TRUE
       GROUP BY rt.id, rt.hotel_id, rt.name, rt.description, 
         rt.max_occupancy, rt.bed_type, rt.amenities, rt.base_price,
         rt.created_at, rt.updated_at, rt.is_active
       ORDER BY MAX(t.price)`,
            [id]
        );

        res.json({
            success: true,
            data: roomTypes
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search available rooms
// @route   GET /api/hotels/:id/available-rooms
// @access  Public
const searchAvailableRooms = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { check_in, check_out, guests } = req.query;

        if (!check_in || !check_out) {
            return res.status(400).json({
                success: false,
                message: 'Check-in and check-out dates are required'
            });
        }

        const [rooms] = await pool.query(
            `SELECT r.*, rt.name AS room_type, rt.max_occupancy, rt.bed_type, rt.amenities,
        t.price AS price_per_night, t.currency
       FROM rooms r
       JOIN room_types rt ON r.room_type_id = rt.id
       LEFT JOIN tariffs t ON rt.id = t.room_type_id 
         AND ? BETWEEN t.start_date AND t.end_date
       WHERE r.hotel_id = ?
         AND r.status = 'available'
         AND r.is_active = TRUE
         ${guests ? 'AND rt.max_occupancy >= ?' : ''}
         AND r.id NOT IN (
           SELECT br.room_id 
           FROM booking_rooms br
           JOIN bookings b ON br.booking_id = b.id
           WHERE b.status NOT IN ('cancelled', 'no_show')
             AND NOT (br.check_out_date <= ? OR br.check_in_date >= ?)
         )
       ORDER BY t.price`,
            guests
                ? [check_in, id, parseInt(guests), check_in, check_out]
                : [check_in, id, check_in, check_out]
        );

        res.json({
            success: true,
            data: rooms,
            search_params: {
                check_in,
                check_out,
                guests: guests || 'any'
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Private (Admin)
const createHotel = async (req, res, next) => {
    try {
        const { v4: uuidv4 } = require('uuid');
        const {
            name, description, address, city, state, country, zip_code,
            phone, email, star_rating
        } = req.body;

        const hotelId = uuidv4();

        await pool.query(
            `INSERT INTO hotels (
                id, name, description, address, city, state, country, zip_code,
                phone, email, star_rating, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [
                hotelId, name, description, address, city, state, country, zip_code,
                phone, email, star_rating
            ]
        );

        const [newHotel] = await pool.query('SELECT * FROM hotels WHERE id = ?', [hotelId]);

        res.status(201).json({
            success: true,
            message: 'Hotel created successfully',
            data: newHotel[0]
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Admin)
const updateHotel = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            name, description, address, city, state, country, zip_code,
            phone, email, star_rating
        } = req.body;

        await pool.query(
            `UPDATE hotels SET 
                name = ?, description = ?, address = ?, city = ?, state = ?,
                country = ?, zip_code = ?, phone = ?, email = ?,
                star_rating = ?, updated_at = NOW()
            WHERE id = ?`,
            [
                name, description, address, city, state, country, zip_code,
                phone, email, star_rating, id
            ]
        );

        const [updatedHotel] = await pool.query('SELECT * FROM hotels WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Hotel updated successfully',
            data: updatedHotel[0]
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Admin)
const deleteHotel = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Soft delete - set is_active to FALSE
        await pool.query('UPDATE hotels SET is_active = FALSE WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Hotel deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllHotels,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel,
    getHotelRoomTypes,
    searchAvailableRooms
};
