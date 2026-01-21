const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

// @desc    Create payment
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res, next) => {
    try {
        const {
            booking_id,
            amount,
            payment_method,
            transaction_id,
            gateway_name
        } = req.body;

        const paymentId = uuidv4();

        // Verify booking exists and get amount
        const [[booking]] = await pool.query(
            'SELECT final_amount, status FROM bookings WHERE id = ?',
            [booking_id]
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Insert payment
        await pool.query(
            `INSERT INTO payments (
        id, booking_id, amount, payment_method, 
        transaction_id, status, gateway_name
      ) VALUES (?, ?, ?, ?, ?, 'paid', ?)`,
            [paymentId, booking_id, amount, payment_method, transaction_id, gateway_name]
        );

        // Update booking status to confirmed if payment successful
        await pool.query(
            'UPDATE bookings SET status = ? WHERE id = ?',
            ['confirmed', booking_id]
        );

        res.status(201).json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                payment_id: paymentId,
                booking_id,
                amount,
                status: 'paid'
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get payments for booking
// @route   GET /api/payments/booking/:bookingId
// @access  Private
const getBookingPayments = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        const [payments] = await pool.query(
            'SELECT * FROM payments WHERE booking_id = ? ORDER BY payment_date DESC',
            [bookingId]
        );

        res.json({
            success: true,
            data: payments
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private (Admin)
const processRefund = async (req, res, next) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { refund_amount, reason } = req.body;

        // Get original payment
        const [[payment]] = await connection.query(
            'SELECT * FROM payments WHERE id = ?',
            [id]
        );

        if (!payment) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        const refundId = uuidv4();

        // Create refund payment record
        await connection.query(
            `INSERT INTO payments (
        id, booking_id, amount, payment_method, transaction_id,
        status, refund_id, gateway_name
      ) VALUES (?, ?, ?, ?, ?, 'refunded', ?, ?)`,
            [
                refundId,
                payment.booking_id,
                refund_amount,
                payment.payment_method,
                `REFUND_${uuidv4()}`,
                payment.id,
                payment.gateway_name
            ]
        );

        // Update original payment
        const newStatus = refund_amount >= payment.amount ? 'refunded' : 'partially_refunded';

        await connection.query(
            `UPDATE payments 
       SET status = ?, refund_amount = ?, refund_date = NOW()
       WHERE id = ?`,
            [newStatus, refund_amount, id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Refund processed successfully',
            data: {
                refund_id: refundId,
                amount: refund_amount,
                status: newStatus
            }
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private (Admin)
const getAllPayments = async (req, res, next) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        // Optionally filter by hotel_id if user is hotel_admin
        let hotelFilter = '';
        const params = [];

        if (req.user.role === 'hotel_admin' && req.user.hotel_id) {
            hotelFilter = 'AND b.hotel_id = ?';
            params.push(req.user.hotel_id);
        }

        params.push(parseInt(limit), parseInt(offset));

        const [payments] = await pool.query(
            `SELECT p.*, 
            b.id as booking_number, 
            h.name as hotel_name,
            CONCAT(g.first_name, ' ', g.last_name) as guest_name
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            JOIN hotels h ON b.hotel_id = h.id
            JOIN guests g ON b.guest_id = g.id
            WHERE 1=1 ${hotelFilter}
            ORDER BY p.payment_date DESC
            LIMIT ? OFFSET ?`,
            params
        );

        // Get total count for pagination
        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) as total 
             FROM payments p 
             JOIN bookings b ON p.booking_id = b.id
             WHERE 1=1 ${hotelFilter}`,
            req.user.role === 'hotel_admin' ? [req.user.hotel_id] : []
        );

        res.json({
            success: true,
            data: payments,
            pagination: {
                total,
                page: Math.floor(offset / limit) + 1,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPayment,
    getBookingPayments,
    processRefund,
    getAllPayments
};
