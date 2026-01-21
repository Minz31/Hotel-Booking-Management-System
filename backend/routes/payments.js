const express = require('express');
const router = express.Router();
const {
    createPayment,
    getBookingPayments,
    processRefund,
    getAllPayments
} = require('../controllers/paymentController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { validatePayment } = require('../middleware/validation');

// All routes require authentication
router.use(verifyToken);

router.get('/', isAdmin, getAllPayments);
router.post('/', validatePayment, createPayment);
router.get('/booking/:bookingId', getBookingPayments);
router.post('/:id/refund', isAdmin, processRefund);

module.exports = router;
