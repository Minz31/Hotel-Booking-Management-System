const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// ==================== ROOM TYPES ====================

// @desc    Get all room types for a hotel
// @route   GET /api/rooms/types/:hotelId
// @access  Public
const getRoomTypes = async (req, res, next) => {
    try {
        const { hotelId } = req.params;

        const [roomTypes] = await pool.query(
            `SELECT rt.*, 
                COUNT(DISTINCT r.id) as total_rooms,
                COUNT(DISTINCT CASE WHEN r.is_active = TRUE THEN r.id END) as active_rooms
            FROM room_types rt
            LEFT JOIN rooms r ON rt.id = r.room_type_id
            WHERE rt.hotel_id = ?
            GROUP BY rt.id
            ORDER BY rt.name`,
            [hotelId]
        );

        res.json({
            success: true,
            data: roomTypes
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create room type
// @route   POST /api/rooms/types
// @access  Private (Admin)
const createRoomType = async (req, res, next) => {
    try {
        const { hotel_id, type_name, description, max_occupancy, amenities } = req.body;

        const roomTypeId = uuidv4();

        await pool.query(
            `INSERT INTO room_types (id, hotel_id, name, description, max_occupancy, amenities)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [roomTypeId, hotel_id, type_name, description, max_occupancy, amenities]
        );

        const [newRoomType] = await pool.query('SELECT * FROM room_types WHERE id = ?', [roomTypeId]);

        res.status(201).json({
            success: true,
            message: 'Room type created successfully',
            data: newRoomType[0]
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update room type
// @route   PUT /api/rooms/types/:id
// @access  Private (Admin)
const updateRoomType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { type_name, description, max_occupancy, amenities } = req.body;

        await pool.query(
            `UPDATE room_types SET 
                name = ?, description = ?, max_occupancy = ?, amenities = ?
            WHERE id = ?`,
            [type_name, description, max_occupancy, amenities, id]
        );

        res.json({
            success: true,
            message: 'Room type updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete room type
// @route   DELETE /api/rooms/types/:id
// @access  Private (Admin)
const deleteRoomType = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if rooms exist for this type
        const [rooms] = await pool.query('SELECT COUNT(*) as count FROM rooms WHERE room_type_id = ?', [id]);

        if (rooms[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete room type with existing rooms'
            });
        }

        await pool.query('DELETE FROM room_types WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Room type deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ==================== ROOMS ====================

// @desc    Get all rooms for a hotel
// @route   GET /api/rooms/:hotelId
// @access  Public
const getRooms = async (req, res, next) => {
    try {
        const { hotelId } = req.params;

        const [rooms] = await pool.query(
            `SELECT r.*, rt.name as type_name, rt.max_occupancy,
                (SELECT COUNT(*) FROM booking_rooms br 
                 JOIN bookings b ON br.booking_id = b.id 
                 WHERE br.room_id = r.id 
                 AND b.status IN ('confirmed', 'checked_in')
                 AND CURDATE() BETWEEN b.check_in_date AND b.check_out_date) as is_currently_booked
            FROM rooms r
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE r.hotel_id = ?
            ORDER BY r.floor, r.room_number`,
            [hotelId]
        );

        res.json({
            success: true,
            data: rooms
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create room
// @route   POST /api/rooms
// @access  Private (Admin)
const createRoom = async (req, res, next) => {
    try {
        const { hotel_id, room_type_id, room_number, floor, description } = req.body;

        const roomId = uuidv4();

        await pool.query(
            `INSERT INTO rooms (id, hotel_id, room_type_id, room_number, floor, description, is_active)
            VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
            [roomId, hotel_id, room_type_id, room_number, floor, description]
        );

        const [newRoom] = await pool.query('SELECT * FROM rooms WHERE id = ?', [roomId]);

        res.status(201).json({
            success: true,
            message: 'Room created successfully',
            data: newRoom[0]
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Admin)
const updateRoom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { room_number, floor, description, is_active } = req.body;

        await pool.query(
            `UPDATE rooms SET 
                room_number = ?, floor = ?, description = ?, is_active = ?
            WHERE id = ?`,
            [room_number, floor, description, is_active, id]
        );

        res.json({
            success: true,
            message: 'Room updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
const deleteRoom = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check for active bookings
        const [bookings] = await pool.query(
            `SELECT COUNT(*) as count FROM booking_rooms br
            JOIN bookings b ON br.booking_id = b.id
            WHERE br.room_id = ? AND b.status IN ('confirmed', 'checked_in')`,
            [id]
        );

        if (bookings[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete room with active bookings'
            });
        }

        await pool.query('DELETE FROM rooms WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Room deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ==================== TARIFFS ====================

// @desc    Get tariffs for a hotel
// @route   GET /api/rooms/tariffs/:hotelId
// @access  Public
const getTariffs = async (req, res, next) => {
    try {
        const { hotelId } = req.params;

        const [tariffs] = await pool.query(
            `SELECT t.*, rt.name as type_name
            FROM tariffs t
            JOIN room_types rt ON t.room_type_id = rt.id
            WHERE rt.hotel_id = ?
            ORDER BY t.start_date DESC`,
            [hotelId]
        );

        res.json({
            success: true,
            data: tariffs
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create tariff
// @route   POST /api/rooms/tariffs
// @access  Private (Admin)
const createTariff = async (req, res, next) => {
    try {
        const { room_type_id, price, start_date, end_date, season_name } = req.body;

        const tariffId = uuidv4();

        await pool.query(
            `INSERT INTO tariffs (id, room_type_id, price, start_date, end_date, season_name)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [tariffId, room_type_id, price, start_date, end_date, season_name]
        );

        res.status(201).json({
            success: true,
            message: 'Tariff created successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update tariff
// @route   PUT /api/rooms/tariffs/:id
// @access  Private (Admin)
const updateTariff = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { price, start_date, end_date, season_name } = req.body;

        await pool.query(
            `UPDATE tariffs SET 
                price = ?, start_date = ?, end_date = ?, season_name = ?
            WHERE id = ?`,
            [price, start_date, end_date, season_name, id]
        );

        res.json({
            success: true,
            message: 'Tariff updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete tariff
// @route   DELETE /api/rooms/tariffs/:id
// @access  Private (Admin)
const deleteTariff = async (req, res, next) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM tariffs WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Tariff deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ==================== AVAILABILITY ====================

// @desc    Get availability calendar
// @route   GET /api/rooms/availability/:hotelId
// @access  Public
const getAvailabilityCalendar = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const { start_date, end_date } = req.query;

        const [availability] = await pool.query(
            `SELECT 
                r.id, r.room_number, r.floor,
                rt.name as type_name,
                br.booking_id,
                b.check_in_date,
                b.check_out_date,
                b.status,
                CONCAT(g.first_name, ' ', g.last_name) as guest_name
            FROM rooms r
            JOIN room_types rt ON r.room_type_id = rt.id
            LEFT JOIN booking_rooms br ON r.id = br.room_id
            LEFT JOIN bookings b ON br.booking_id = b.id AND b.status IN ('confirmed', 'checked_in')
                AND ((b.check_in_date BETWEEN ? AND ?) 
                OR (b.check_out_date BETWEEN ? AND ?)
                OR (b.check_in_date <= ? AND b.check_out_date >= ?))
            LEFT JOIN guests g ON b.guest_id = g.id
            WHERE r.hotel_id = ? AND r.is_active = TRUE
            ORDER BY r.floor, r.room_number`,
            [start_date, end_date, start_date, end_date, start_date, end_date, hotelId]
        );

        res.json({
            success: true,
            data: availability
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRoomTypes,
    createRoomType,
    updateRoomType,
    deleteRoomType,
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    getTariffs,
    createTariff,
    updateTariff,
    deleteTariff,
    getAvailabilityCalendar
};
