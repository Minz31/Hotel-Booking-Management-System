const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const dayjs = require('dayjs');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const {
            guest_id,
            hotel_id,
            check_in_date,
            check_out_date,
            room_ids,        // Can be actual room IDs (r1, r2) OR room type IDs (rt1, rt2)
            number_of_guests,
            special_requests,
            discount_code
        } = req.body;

        const bookingId = uuidv4();
        const checkIn = dayjs(check_in_date);
        const checkOut = dayjs(check_out_date);
        const nights = checkOut.diff(checkIn, 'day');

        if (nights <= 0) {
            throw new Error('Check-out must be after check-in');
        }

        // Resolve room IDs - if they are room_type_ids, find available rooms
        const resolvedRoomIds = [];
        for (const id of room_ids) {
            // Check if this is a room_type_id (starts with 'rt') or actual room_id
            const [roomTypeCheck] = await connection.query(
                'SELECT id FROM room_types WHERE id = ?',
                [id]
            );

            if (roomTypeCheck.length > 0) {
                // It's a room type ID - find an available room of this type
                const [availableRooms] = await connection.query(
                    `SELECT r.id 
                     FROM rooms r
                     WHERE r.room_type_id = ?
                       AND r.hotel_id = ?
                       AND r.status = 'available'
                       AND r.id NOT IN (
                           SELECT br.room_id 
                           FROM booking_rooms br
                           JOIN bookings b ON br.booking_id = b.id
                           WHERE b.status NOT IN ('cancelled', 'no_show')
                             AND NOT (br.check_out_date <= ? OR br.check_in_date >= ?)
                       )
                     LIMIT 1`,
                    [id, hotel_id, check_in_date, check_out_date]
                );

                if (availableRooms.length === 0) {
                    await connection.rollback();
                    return res.status(409).json({
                        success: false,
                        message: `No available rooms for the selected room type and dates`
                    });
                }
                resolvedRoomIds.push(availableRooms[0].id);
            } else {
                // It's an actual room ID
                resolvedRoomIds.push(id);
            }
        }

        // Check room availability for resolved room IDs
        for (const roomId of resolvedRoomIds) {
            const [conflicts] = await connection.query(
                `SELECT COUNT(*) AS conflicts
         FROM booking_rooms br
         JOIN bookings b ON br.booking_id = b.id
         WHERE br.room_id = ?
           AND b.status NOT IN ('cancelled', 'no_show')
           AND NOT (br.check_out_date <= ? OR br.check_in_date >= ?)`,
                [roomId, check_in_date, check_out_date]
            );

            if (conflicts[0].conflicts > 0) {
                await connection.rollback();
                return res.status(409).json({
                    success: false,
                    message: `Room ${roomId} is not available for selected dates`
                });
            }
        }

        // Calculate total amount
        let totalAmount = 0;
        const bookingRooms = [];

        for (const roomId of resolvedRoomIds) {
            const [roomData] = await connection.query(
                `SELECT r.*, rt.id AS room_type_id, rt.base_price, t.price, t.id AS tariff_id
         FROM rooms r
         JOIN room_types rt ON r.room_type_id = rt.id
         LEFT JOIN tariffs t ON rt.id = t.room_type_id
           AND ? BETWEEN t.start_date AND t.end_date
         WHERE r.id = ?`,
                [check_in_date, roomId]
            );

            if (roomData.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: `Room ${roomId} not found`
                });
            }

            const room = roomData[0];
            // Use tariff price if available, otherwise use base_price from room_types
            const pricePerNight = room.price || room.base_price || 0;
            const roomTotal = pricePerNight * nights;
            totalAmount += roomTotal;

            bookingRooms.push({
                room_id: roomId,
                price_per_night: pricePerNight,
                number_of_nights: nights,
                total_price: roomTotal,
                tariff_id: room.tariff_id
            });
        }

        // Apply discount if provided
        let discountAmount = 0;
        let discountId = null;

        if (discount_code) {
            const [discounts] = await connection.query(
                `SELECT * FROM discounts 
         WHERE code = ? AND is_active = TRUE
           AND CURDATE() BETWEEN valid_from AND valid_to
           AND (usage_limit IS NULL OR usage_count < usage_limit)`,
                [discount_code]
            );

            if (discounts.length > 0) {
                const discount = discounts[0];
                discountId = discount.id;

                if (discount.amount_type === 'percentage') {
                    discountAmount = (totalAmount * discount.amount) / 100;
                    if (discount.max_discount_amount) {
                        discountAmount = Math.min(discountAmount, discount.max_discount_amount);
                    }
                } else {
                    discountAmount = discount.amount;
                }

                // Update usage count
                await connection.query(
                    'UPDATE discounts SET usage_count = usage_count + 1 WHERE id = ?',
                    [discountId]
                );
            }
        }

        const finalAmount = totalAmount - discountAmount;

        // Create booking
        await connection.query(
            `INSERT INTO bookings (
        id, guest_id, hotel_id, check_in_date, check_out_date,
        total_amount, discount_amount, final_amount, discount_id,
        number_of_guests, special_requests, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment')`,
            [
                bookingId, guest_id, hotel_id, check_in_date, check_out_date,
                totalAmount, discountAmount, finalAmount, discountId,
                number_of_guests, special_requests
            ]
        );

        // Create booking_rooms entries
        for (const br of bookingRooms) {
            await connection.query(
                `INSERT INTO booking_rooms (
          id, booking_id, room_id, check_in_date, check_out_date,
          price_per_night, number_of_nights, total_price, tariff_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    uuidv4(), bookingId, br.room_id, check_in_date, check_out_date,
                    br.price_per_night, br.number_of_nights, br.total_price, br.tariff_id
                ]
            );
        }

        await connection.commit();

        // Fetch created booking
        const [newBooking] = await connection.query(
            `SELECT b.*, h.name AS hotel_name,
        GROUP_CONCAT(r.room_number) AS room_numbers
       FROM bookings b
       JOIN hotels h ON b.hotel_id = h.id
       LEFT JOIN booking_rooms br ON b.id = br.booking_id
       LEFT JOIN rooms r ON br.room_id = r.id
       WHERE b.id = ?
       GROUP BY b.id`,
            [bookingId]
        );

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: newBooking[0]
        });

    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

// @desc    Get all bookings for a guest
// @route   GET /api/bookings/guest/:guestId
// @access  Private
const getGuestBookings = async (req, res, next) => {
    try {
        const { guestId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        let query = `
      SELECT b.*, h.name AS hotel_name, h.city,
        COUNT(br.id) AS rooms_count,
        GROUP_CONCAT(r.room_number) AS room_numbers,
        p.status AS payment_status
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      LEFT JOIN booking_rooms br ON b.id = br.booking_id
      LEFT JOIN rooms r ON br.room_id = r.id
      LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'paid'
      WHERE b.guest_id = ?
    `;

        const params = [guestId];

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        query += ' GROUP BY b.id ORDER BY b.booking_date DESC';

        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [bookings] = await pool.query(query, params);

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private (Admin)
const getAllBookings = async (req, res, next) => {
    try {
        const { status, hotel_id, page = 1, limit = 50 } = req.query;

        let query = `
      SELECT b.*, h.name AS hotel_name, h.city,
        CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
        g.email AS guest_email,
        COUNT(br.id) AS rooms_count,
        GROUP_CONCAT(r.room_number) AS room_numbers
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      JOIN guests g ON b.guest_id = g.id
      LEFT JOIN booking_rooms br ON b.id = br.booking_id
      LEFT JOIN rooms r ON br.room_id = r.id
      WHERE 1=1
    `;

        const params = [];

        // Filter by hotel_id if provided (for hotel admins)
        if (hotel_id) {
            query += ' AND b.hotel_id = ?';
            params.push(hotel_id);
        }

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        query += ' GROUP BY b.id ORDER BY b.booking_date DESC';

        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [bookings] = await pool.query(query, params);

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [bookings] = await pool.query(
            `SELECT b.*,
        g.first_name, g.last_name, g.email AS guest_email, g.phone AS guest_phone,
        h.name AS hotel_name, h.address, h.city, h.state, h.country, h.phone AS hotel_phone,
        GROUP_CONCAT(DISTINCT r.room_number) AS room_numbers,
        GROUP_CONCAT(DISTINCT rt.name) AS room_types,
        SUM(br.total_price) AS rooms_total
       FROM bookings b
       JOIN guests g ON b.guest_id = g.id
       JOIN hotels h ON b.hotel_id = h.id
       LEFT JOIN booking_rooms br ON b.id = br.booking_id
       LEFT JOIN rooms r ON br.room_id = r.id
       LEFT JOIN room_types rt ON r.room_type_id = rt.id
       WHERE b.id = ?
       GROUP BY b.id`,
            [id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Get payment info
        const [payments] = await pool.query(
            'SELECT * FROM payments WHERE booking_id = ? ORDER BY payment_date DESC',
            [id]
        );

        res.json({
            success: true,
            data: {
                ...bookings[0],
                payments
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (Admin)
const updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const validStatuses = ['pending_payment', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        // Get current booking
        const [[booking]] = await pool.query('SELECT status FROM bookings WHERE id = ?', [id]);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Update booking
        await pool.query(
            'UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, id]
        );

        // Log status change
        await pool.query(
            `INSERT INTO booking_status_history (id, booking_id, old_status, new_status, changed_by, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), id, booking.status, status, req.user.id, notes]
        );

        // If checking in, update room status
        if (status === 'checked_in') {
            await pool.query(
                `UPDATE rooms r
         INNER JOIN booking_rooms br ON r.id = br.room_id
         SET r.status = 'occupied'
         WHERE br.booking_id = ?`,
                [id]
            );
        }

        // If checking out, update room status
        if (status === 'checked_out') {
            await pool.query(
                `UPDATE rooms r
         INNER JOIN booking_rooms br ON r.id = br.room_id
         SET r.status = 'available'
         WHERE br.booking_id = ?`,
                [id]
            );
        }

        res.json({
            success: true,
            message: 'Booking status updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel booking
// @route   POST /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Determine who is cancelling
        // If guest, valid "cancelled_by" might differ or be null if current schema only links to admins
        // Assuming 'cancelled_by' tracks admins/staff. Guests might not satisfy the FK constraint.
        const cancelledBy = req.user.role === 'guest' ? null : req.user.id;
        const finalReason = req.user.role === 'guest' ? `Cancelled by guest: ${reason || 'No reason provided'}` : reason;

        await pool.query(
            `UPDATE bookings 
       SET status = 'cancelled', 
           cancelled_at = NOW(), 
           cancelled_by = ?,
           cancellation_reason = ?
       WHERE id = ?`,
            [cancelledBy, finalReason, id]
        );

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Change room for a booking
// @route   PATCH /api/bookings/:id/room
// @access  Private (Admin)
const changeRoom = async (req, res, next) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { new_room_id } = req.body;

        // Get booking details
        const [[booking]] = await connection.query(
            'SELECT * FROM bookings WHERE id = ?',
            [id]
        );

        if (!booking) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if new room is available
        const [[newRoom]] = await connection.query(
            'SELECT * FROM rooms WHERE id = ?',
            [new_room_id]
        );

        if (!newRoom) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'New room not found'
            });
        }

        if (newRoom.status !== 'available') {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                message: 'Selected room is not available'
            });
        }

        // Get current room(s) from booking
        const [currentRooms] = await connection.query(
            'SELECT room_id FROM booking_rooms WHERE booking_id = ?',
            [id]
        );

        // Update old room(s) status to available
        for (const room of currentRooms) {
            await connection.query(
                "UPDATE rooms SET status = 'available' WHERE id = ?",
                [room.room_id]
            );
        }

        // Get room type and pricing info for new room
        const [[roomData]] = await connection.query(
            `SELECT r.*, rt.id AS room_type_id, rt.base_price, t.price, t.id AS tariff_id
             FROM rooms r
             JOIN room_types rt ON r.room_type_id = rt.id
             LEFT JOIN tariffs t ON rt.id = t.room_type_id
               AND CURDATE() BETWEEN t.start_date AND t.end_date
             WHERE r.id = ?`,
            [new_room_id]
        );

        const pricePerNight = roomData.price || roomData.base_price || 0;

        // Update booking_rooms - replace first room (for single room bookings)
        if (currentRooms.length > 0) {
            await connection.query(
                `UPDATE booking_rooms 
                 SET room_id = ?, price_per_night = ?, tariff_id = ?
                 WHERE booking_id = ? AND room_id = ?`,
                [new_room_id, pricePerNight, roomData.tariff_id, id, currentRooms[0].room_id]
            );
        }

        // Update new room status if checked in
        if (booking.status === 'checked_in') {
            await connection.query(
                "UPDATE rooms SET status = 'occupied' WHERE id = ?",
                [new_room_id]
            );
        }

        // Recalculate total if price changed
        const [bookingRooms] = await connection.query(
            'SELECT SUM(total_price) as total FROM booking_rooms WHERE booking_id = ?',
            [id]
        );

        const newTotal = bookingRooms[0].total || 0;
        await connection.query(
            'UPDATE bookings SET total_amount = ?, final_amount = total_amount - discount_amount WHERE id = ?',
            [newTotal, id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Room changed successfully'
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

module.exports = {
    createBooking,
    getAllBookings,
    getGuestBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking,
    changeRoom
};
