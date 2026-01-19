import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/me'),
};

// Hotel APIs
export const hotelAPI = {
    getAllHotels: (params) => api.get('/hotels', { params }),
    getHotelById: (id) => api.get(`/hotels/${id}`),
    createHotel: (data) => api.post('/hotels', data),
    updateHotel: (id, data) => api.put(`/hotels/${id}`, data),
    deleteHotel: (id) => api.delete(`/hotels/${id}`),
    getRoomTypes: (hotelId) => api.get(`/hotels/${hotelId}/room-types`),
    searchAvailableRooms: (hotelId, params) =>
        api.get(`/hotels/${hotelId}/available-rooms`, { params }),
};

// Booking APIs
export const bookingAPI = {
    createBooking: (data) => api.post('/bookings', data),
    getAllBookings: (params) => api.get('/bookings', { params }), // For admin
    getGuestBookings: (guestId, params) =>
        api.get(`/bookings/guest/${guestId}`, { params }),
    getBookingById: (id) => api.get(`/bookings/${id}`),
    cancelBooking: (id, data) => api.post(`/bookings/${id}/cancel`, data),
};

// Payment APIs
export const paymentAPI = {
    createPayment: (data) => api.post('/payments', data),
    getBookingPayments: (bookingId) => api.get(`/payments/booking/${bookingId}`),
};

// Review APIs
export const reviewAPI = {
    createReview: (data) => api.post('/reviews', data),
    getHotelReviews: (hotelId, params) =>
        api.get(`/reviews/hotel/${hotelId}`, { params }),
    markHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful`),
};

// User Management APIs
export const userAPI = {
    getAllUsers: (params) => api.get('/users', { params }),
    getUserById: (id) => api.get(`/users/${id}`),
    createHotelAdmin: (data) => api.post('/users/admin', data),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    deleteUser: (id) => api.delete(`/users/${id}`),
};

// Room Management APIs
export const roomAPI = {
    // Room Types
    getRoomTypes: (hotelId) => api.get(`/rooms/types/${hotelId}`),
    createRoomType: (data) => api.post('/rooms/types', data),
    updateRoomType: (id, data) => api.put(`/rooms/types/${id}`, data),
    deleteRoomType: (id) => api.delete(`/rooms/types/${id}`),

    // Rooms
    getRooms: (hotelId) => api.get(`/rooms/${hotelId}`),
    createRoom: (data) => api.post('/rooms', data),
    updateRoom: (id, data) => api.put(`/rooms/${id}`, data),
    deleteRoom: (id) => api.delete(`/rooms/${id}`),

    // Tariffs
    getTariffs: (hotelId) => api.get(`/rooms/tariffs/${hotelId}`),
    createTariff: (data) => api.post('/rooms/tariffs', data),
    updateTariff: (id, data) => api.put(`/rooms/tariffs/${id}`, data),
    deleteTariff: (id) => api.delete(`/rooms/tariffs/${id}`),

    // Availability
    getAvailability: (hotelId, params) => api.get(`/rooms/availability/${hotelId}`, { params })
};

export default api;
