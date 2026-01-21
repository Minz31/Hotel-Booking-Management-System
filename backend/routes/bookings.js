const express = require('express');
const router = express.Router();
const {
    createBooking,
    getAllBookings,
    getGuestBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking,
    changeRoom
} = require('../controllers/bookingController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');

// All routes require authentication
router.use(verifyToken);

router.post('/', validateBooking, createBooking);
router.get('/', isAdmin, getAllBookings); // Admin: Get all bookings
router.get('/guest/:guestId', getGuestBookings);
router.get('/:id', getBookingById);
router.patch('/:id/status', isAdmin, updateBookingStatus);
router.patch('/:id/room', isAdmin, changeRoom); // Admin: Change room allocation
router.post('/:id/cancel', cancelBooking);

module.exports = router;

