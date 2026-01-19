const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    createHotelAdmin,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(verifyToken);
router.use(isAdmin);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/admin', createHotelAdmin);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
