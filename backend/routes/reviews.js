const express = require('express');
const router = express.Router();
const {
    createReview,
    getHotelReviews,
    addHotelResponse,
    markHelpful,
    deleteReview
} = require('../controllers/reviewController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { validateReview } = require('../middleware/validation');

// Public routes
router.get('/hotel/:hotelId', getHotelReviews);
router.post('/:id/helpful', markHelpful);

// Protected routes
router.post('/', verifyToken, validateReview, createReview);
router.post('/:id/response', verifyToken, isAdmin, addHotelResponse);
router.delete('/:id', verifyToken, isAdmin, deleteReview);

module.exports = router;
