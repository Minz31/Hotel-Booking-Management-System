const { pool } = require('../config/database');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
    try {
        const stats = {
            total_bookings: 0,
            total_hotels: 0,
            total_users: 0,
            revenue: 0
        };

        const hotelAdminFilter = (req.user.role === 'hotel_admin' && req.user.hotel_id)
            ? 'WHERE hotel_id = ?'
            : '';
        const params = (req.user.role === 'hotel_admin' && req.user.hotel_id)
            ? [req.user.hotel_id]
            : [];

        // 1. Total Bookings
        const bookingQuery = `SELECT COUNT(*) as count FROM bookings ${hotelAdminFilter}`;
        const [[bookingResult]] = await pool.query(bookingQuery, params);
        stats.total_bookings = bookingResult.count;

        // 2. Total Hotels (Only relevant for Super Admin, Hotel Admin sees 1)
        if (req.user.role === 'super_admin') {
            const [[hotelResult]] = await pool.query('SELECT COUNT(*) as count FROM hotels');
            stats.total_hotels = hotelResult.count;
        } else {
            stats.total_hotels = 1;
        }

        // 3. Total Users (Super Admin: all users. Hotel Admin: guests who booked at their hotel)
        if (req.user.role === 'super_admin') {
            const [[userResult]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'guest'");
            stats.total_users = userResult.count;
        } else {
            const [[guestResult]] = await pool.query(
                'SELECT COUNT(DISTINCT guest_id) as count FROM bookings WHERE hotel_id = ?',
                [req.user.hotel_id]
            );
            stats.total_users = guestResult.count;
        }

        // 4. Revenue (Total sum of final_amount in bookings with status 'confirmed', 'checked_in', 'checked_out')
        let revenueQuery = `
            SELECT SUM(final_amount) as total 
            FROM bookings 
            WHERE status IN ('confirmed', 'checked_in', 'checked_out', 'completed')
        `;

        if (req.user.role === 'hotel_admin') {
            revenueQuery += ' AND hotel_id = ?';
        }

        const [[revenueResult]] = await pool.query(revenueQuery, params);
        stats.revenue = revenueResult.total || 0;

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
// @access  Private (Admin)
const getRecentActivity = async (req, res, next) => {
    try {
        const activities = [];
        const limit = 10;

        const params = (req.user.role === 'hotel_admin' && req.user.hotel_id)
            ? [req.user.hotel_id]
            : [];

        const bookingFilter = (req.user.role === 'hotel_admin') ? 'AND b.hotel_id = ?' : '';
        const reviewFilter = (req.user.role === 'hotel_admin') ? 'AND r.hotel_id = ?' : '';

        // 1. Recent Bookings
        const [recentBookings] = await pool.query(
            `SELECT 
                b.id, 'booking' as type, b.created_at,
                CONCAT(g.first_name, ' ', g.last_name) as user_name,
                h.name as hotel_name,
                b.status
             FROM bookings b
             JOIN guests g ON b.guest_id = g.id
             JOIN hotels h ON b.hotel_id = h.id
             WHERE 1=1 ${bookingFilter}
             ORDER BY b.created_at DESC LIMIT ?`,
            [...params, limit]
        );

        // 2. Recent Reviews
        const [recentReviews] = await pool.query(
            `SELECT 
                r.id, 'review' as type, r.created_at,
                CONCAT(g.first_name, ' ', g.last_name) as user_name,
                h.name as hotel_name,
                r.rating
             FROM reviews r
             JOIN guests g ON r.guest_id = g.id
             JOIN hotels h ON r.hotel_id = h.id
             WHERE 1=1 ${reviewFilter}
             ORDER BY r.created_at DESC LIMIT ?`,
            [...params, limit]
        );

        // 3. New Users (Only Super Admin sees global new users, Hotel Admin sees their new guests?)
        // For simplicity, let's just show new users for Super Admin.
        let recentUsers = [];
        if (req.user.role === 'super_admin') {
            [recentUsers] = await pool.query(
                `SELECT 
                    id, 'user_register' as type, created_at,
                    CONCAT(first_name, ' ', last_name) as user_name,
                    'System' as hotel_name,
                    role
                 FROM users
                 WHERE role = 'guest'
                 ORDER BY created_at DESC LIMIT ?`,
                [limit]
            );
        }

        // Combine and sort
        const allActivity = [...recentBookings, ...recentReviews, ...recentUsers]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit);

        res.json({
            success: true,
            data: allActivity
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getRecentActivity
};
