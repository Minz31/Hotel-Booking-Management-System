const express = require('express');
const router = express.Router();
const { registerGuest, login, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validateGuestRegistration, validateLogin } = require('../middleware/validation');

// Public routes
router.post('/register', validateGuestRegistration, registerGuest);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', verifyToken, getMe);

module.exports = router;
