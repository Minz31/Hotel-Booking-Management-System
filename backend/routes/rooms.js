const express = require('express');
const router = express.Router();
const {
    getRoomTypes,
    createRoomType,
    updateRoomType,
    deleteRoomType,
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    getTariffs,
    createTariff,
    updateTariff,
    deleteTariff,
    getAvailabilityCalendar
} = require('../controllers/roomController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Room Types
router.get('/types/:hotelId', getRoomTypes);
router.post('/types', verifyToken, isAdmin, createRoomType);
router.put('/types/:id', verifyToken, isAdmin, updateRoomType);
router.delete('/types/:id', verifyToken, isAdmin, deleteRoomType);

// Rooms
router.get('/:hotelId', getRooms);
router.post('/', verifyToken, isAdmin, createRoom);
router.put('/:id', verifyToken, isAdmin, updateRoom);
router.delete('/:id', verifyToken, isAdmin, deleteRoom);

// Tariffs/Pricing
router.get('/tariffs/:hotelId', getTariffs);
router.post('/tariffs', verifyToken, isAdmin, createTariff);
router.put('/tariffs/:id', verifyToken, isAdmin, updateTariff);
router.delete('/tariffs/:id', verifyToken, isAdmin, deleteTariff);

// Availability Calendar
router.get('/availability/:hotelId', getAvailabilityCalendar);

module.exports = router;
