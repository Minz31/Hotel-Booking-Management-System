const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
    try {
        const {
            booking_id,
            rating,
            cleanliness_rating,
            service_rating,
            location_rating,
            value_rating,
            title,
            comment
        } = req.body;

        const guestId = req.user.id;

        // Verify booking exists and belongs to guest
        const [[booking]] = await pool.query(
            'SELECT hotel_id, guest_id, status FROM bookings WHERE id = ?',
            [booking_id]
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.guest_id !== guestId) {
            return res.status(403).json({
                success: false,
                message: 'You can only review your own bookings'
            });
        }

        if (booking.status !== 'checked_out') {
            return res.status(400).json({
                success: false,
                message: 'You can only review after checkout'
            });
        }

        // Check if review already exists
        const [[existing]] = await pool.query(
            'SELECT id FROM reviews WHERE booking_id = ?',
            [booking_id]
        );

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Review already exists for this booking'
            });
        }

        const reviewId = uuidv4();

        await pool.query(
            `INSERT INTO reviews (
        id, booking_id, guest_id, hotel_id,
        rating, cleanliness_rating, service_rating, location_rating, value_rating,
        title, comment, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [
                reviewId, booking_id, guestId, booking.hotel_id,
                rating, cleanliness_rating, service_rating, location_rating, value_rating,
                title, comment
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: { id: reviewId }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get hotel reviews
// @route   GET /api/reviews/hotel/:hotelId
// @access  Public
const getHotelReviews = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const { page = 1, limit = 10, sort = 'recent' } = req.query;

        let orderClause = 'r.created_at DESC';
        if (sort === 'rating_high') orderClause = 'r.rating DESC';
        if (sort === 'rating_low') orderClause = 'r.rating ASC';
        if (sort === 'helpful') orderClause = 'r.helpful_count DESC';

        const offset = (page - 1) * limit;

        const [reviews] = await pool.query(
            `SELECT r.*,
        g.first_name, g.last_name,
        rt.name AS room_type,
        a.full_name AS responded_by
       FROM reviews r
       JOIN guests g ON r.guest_id = g.id
       LEFT JOIN room_types rt ON r.room_type_id = rt.id
       LEFT JOIN administrators a ON r.response_by = a.id
       WHERE r.hotel_id = ? AND r.is_approved = TRUE
       ORDER BY ${orderClause}
       LIMIT ? OFFSET ?`,
            [hotelId, parseInt(limit), parseInt(offset)]
        );

        // Get rating statistics
        const [[stats]] = await pool.query(
            `SELECT 
        COUNT(*) AS total_reviews,
        ROUND(AVG(rating), 2) AS avg_overall,
        ROUND(AVG(cleanliness_rating), 2) AS avg_cleanliness,
        ROUND(AVG(service_rating), 2) AS avg_service,
        ROUND(AVG(location_rating), 2) AS avg_location,
        ROUND(AVG(value_rating), 2) AS avg_value,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS one_star
       FROM reviews
       WHERE hotel_id = ? AND is_approved = TRUE`,
            [hotelId]
        );

        res.json({
            success: true,
            data: {
                reviews,
                statistics: stats
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add hotel response to review
// @route   POST /api/reviews/:id/response
// @access  Private (Admin)
const addHotelResponse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { response } = req.body;

        await pool.query(
            `UPDATE reviews 
       SET response = ?, response_by = ?, response_date = NOW()
       WHERE id = ?`,
            [response, req.user.id, id]
        );

        res.json({
            success: true,
            message: 'Response added successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Public
const markHelpful = async (req, res, next) => {
    try {
        const { id } = req.params;

        await pool.query(
            'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Review marked as helpful'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin)
const deleteReview = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if review exists
        const [[review]] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (req.user.role === 'hotel_admin' && req.user.hotel_id !== review.hotel_id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review'
            });
        }

        await pool.query('DELETE FROM reviews WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReview,
    getHotelReviews,
    addHotelResponse,
    markHelpful,
    deleteReview
};
