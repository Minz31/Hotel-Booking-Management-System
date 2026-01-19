const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Guest registration validation
const validateGuestRegistration = [
    body('first_name').trim().notEmpty().withMessage('First name is required'),
    body('last_name').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
        .withMessage('Valid phone number required (e.g., +1-555-1234 or 1234567890)'),
    validate
];

// Login validation
const validateLogin = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

// Booking validation
const validateBooking = [
    body('guest_id').notEmpty().withMessage('Guest ID is required'),
    body('hotel_id').notEmpty().withMessage('Hotel ID is required'),
    body('check_in_date').isISO8601().withMessage('Valid check-in date required'),
    body('check_out_date').isISO8601().withMessage('Valid check-out date required')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.check_in_date)) {
                throw new Error('Check-out date must be after check-in date');
            }
            return true;
        }),
    body('room_ids').isArray({ min: 1 }).withMessage('At least one room must be selected'),
    validate
];

// Review validation
const validateReview = [
    body('booking_id').notEmpty().withMessage('Booking ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').optional().trim().isLength({ max: 255 }),
    body('comment').optional().trim(),
    validate
];

// Payment validation
const validatePayment = [
    body('booking_id').notEmpty().withMessage('Booking ID is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount required'),
    body('payment_method').isIn(['credit_card', 'debit_card', 'online_wallet', 'bank_transfer', 'cash'])
        .withMessage('Invalid payment method'),
    body('transaction_id').notEmpty().withMessage('Transaction ID is required'),
    validate
];

module.exports = {
    validate,
    validateGuestRegistration,
    validateLogin,
    validateBooking,
    validateReview,
    validatePayment
};
