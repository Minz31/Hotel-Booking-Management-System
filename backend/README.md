# Hotel Booking System - Backend API

A comprehensive RESTful API for hotel booking management built with Node.js, Express, MySQL, and JWT authentication.

## 🚀 Features

- ✅ **JWT Authentication** - Secure login for guests and administrators
- ✅ **Role-Based Access Control** - Guest, Admin, Manager, Super Admin roles
- ✅ **Hotel Management** - Browse hotels, search by location, view details
- ✅ **Room Booking** - Real-time availability checking, multi-room bookings
- ✅ **Payment Processing** - Payment tracking, refunds
- ✅ **Reviews & Ratings** - Guest reviews with hotel responses
- ✅ **Discount System** - Promo codes with usage tracking
- ✅ **Comprehensive Validation** - Input validation with express-validator
- ✅ **Error Handling** - Global error handler with meaningful messages
- ✅ **Database Transactions** - ACID compliance for critical operations

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hotel_booking_system
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Setup Database

Run the SQL schema from `hotel_booking_queries.sql`:

```bash
mysql -u root -p < hotel_booking_queries.sql
```

Or import it through MySQL Workbench/phpMyAdmin.

### 5. Start the server

Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register Guest
```http
POST /api/auth/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "guest"
    },
    "token": "jwt_token_here"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

### Hotel Endpoints

#### Get All Hotels
```http
GET /api/hotels?city=New York&star_rating=5&page=1&limit=10
```

#### Get Hotel by ID
```http
GET /api/hotels/:id
```

#### Get Hotel Room Types
```http
GET /api/hotels/:id/room-types
```

#### Search Available Rooms
```http
GET /api/hotels/:id/available-rooms?check_in=2026-02-15&check_out=2026-02-20&guests=2
```

### Booking Endpoints

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "guest_id": "uuid",
  "hotel_id": "uuid",
  "check_in_date": "2026-02-15",
  "check_out_date": "2026-02-20",
  "room_ids": ["room_uuid_1", "room_uuid_2"],
  "number_of_guests": 2,
  "discount_code": "WELCOME10",
  "special_requests": "Late check-in"
}
```

#### Get Guest Bookings
```http
GET /api/bookings/guest/:guestId?status=confirmed&page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Booking Details
```http
GET /api/bookings/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update Booking Status (Admin)
```http
PATCH /api/bookings/:id/status
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "status": "checked_in",
  "notes": "Guest arrived early"
}
```

#### Cancel Booking
```http
POST /api/bookings/:id/cancel
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "reason": "Change of plans"
}
```

### Payment Endpoints

#### Create Payment
```http
POST /api/payments
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "booking_id": "uuid",
  "amount": 1575.00,
  "payment_method": "credit_card",
  "transaction_id": "txn_stripe_abc123",
  "gateway_name": "Stripe"
}
```

#### Get Booking Payments
```http
GET /api/payments/booking/:bookingId
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Process Refund (Admin)
```http
POST /api/payments/:id/refund
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "refund_amount": 1575.00,
  "reason": "Booking cancelled"
}
```

### Review Endpoints

#### Create Review
```http
POST /api/reviews
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "booking_id": "uuid",
  "rating": 5,
  "cleanliness_rating": 5,
  "service_rating": 4,
  "location_rating": 5,
  "value_rating": 4,
  "title": "Excellent Stay!",
  "comment": "Room was spotless and staff was friendly."
}
```

#### Get Hotel Reviews
```http
GET /api/reviews/hotel/:hotelId?page=1&limit=10&sort=recent
```

Sort options: `recent`, `rating_high`, `rating_low`, `helpful`

#### Add Hotel Response (Admin)
```http
POST /api/reviews/:id/response
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "response": "Thank you for your wonderful feedback!"
}
```

#### Mark Review as Helpful
```http
POST /api/reviews/:id/helpful
```

## 🔒 Authentication & Authorization

### JWT Token Usage

Include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### User Roles

1. **Guest** - Can book rooms, make payments, write reviews
2. **Staff** - View-only access
3. **Manager** - Manage bookings, respond to reviews
4. **Hotel Admin** - Manage specific hotel
5. **Super Admin** - Full system access

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MySQL connection pool
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── hotelController.js   # Hotel operations
│   ├── bookingController.js # Booking management
│   ├── paymentController.js # Payment processing
│   └── reviewController.js  # Review management
├── middleware/
│   ├── auth.js             # JWT verification
│   ├── errorHandler.js     # Error handling
│   └── validation.js       # Input validation
├── routes/
│   ├── auth.js
│   ├── hotels.js
│   ├── bookings.js
│   ├── payments.js
│   └── reviews.js
├── app.js                  # Express app setup
├── server.js              # Server entry point
├── package.json
└── .env.example
```

## 🔧 Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors (if applicable)
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

## 🧪 Testing the API

### Using cURL

```bash
# Register a guest
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"John","last_name":"Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get hotels
curl http://localhost:5000/api/hotels
```

### Using Postman

1. Import the environment variables
2. Set `base_url` to `http://localhost:5000/api`
3. After login, save the token to environment
4. Use `{{token}}` in Authorization headers

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
DB_USER=your_db_user
DB_PASSWORD=strong_password
DB_NAME=hotel_booking_system
JWT_SECRET=very_strong_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-domain.com
```

### PM2 Deployment

```bash
npm install -g pm2
pm2 start server.js --name hotel-booking-api
pm2 save
pm2 startup
```

## 📝 Development Notes

### Database Transactions

Critical operations use transactions for ACID compliance:
- Booking creation
- Payment processing with refunds

### Double-Booking Prevention

The system checks for booking conflicts before confirming:
```sql
WHERE NOT (check_out_date <= ? OR check_in_date >= ?)
```

### Price Freezing

Prices are frozen at booking time in `booking_rooms` table to protect against future tariff changes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

ISC

## 👨‍💻 Developer

Built for Hotel Booking Management System

---

**Happy Coding! 🎉**
