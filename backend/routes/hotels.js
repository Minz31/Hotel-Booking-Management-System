const express = require('express');
const router = express.Router();
const {
    getAllHotels,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel,
    getHotelRoomTypes,
    searchAvailableRooms
} = require('../controllers/hotelController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllHotels);
router.get('/:id', getHotelById);
router.get('/:id/room-types', getHotelRoomTypes);
router.get('/:id/available-rooms', searchAvailableRooms);

// Admin routes
router.post('/', verifyToken, isAdmin, createHotel);
router.put('/:id', verifyToken, isAdmin, updateHotel);
router.delete('/:id', verifyToken, isAdmin, deleteHotel);

module.exports = router;
