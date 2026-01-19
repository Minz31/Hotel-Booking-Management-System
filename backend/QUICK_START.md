# 🚀 Quick Start Guide

## Prerequisites
- ✅ Node.js installed
- ✅ MySQL installed and running
- ✅ Database created from `hotel_booking_queries.sql`

## Step 1: Install Dependencies
```bash
cd backend
npm install
```

## Step 2: Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
# Update DB_PASSWORD, JWT_SECRET, etc.
```

## Step 3: Setup Database
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE hotel_booking_system;

# Exit MySQL and run schema
mysql -u root -p hotel_booking_system < hotel_booking_queries.sql
```

## Step 4: Start Server
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ Database connected successfully
🚀 Hotel Booking API Server
📡 Environment: development
🌐 Server running on port 5000
🔗 API URL: http://localhost:5000
💚 Health check: http://localhost:5000/health
```

## Step 5: Test the API

### Option A: Using cURL
```bash
# Health check
curl http://localhost:5000/health

# Register a guest
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Option B: Using Postman
1. Import `Hotel_Booking_API.postman_collection.json`
2. Set variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: Get from login response
3. Start testing!

### Option C: Using Browser
```
http://localhost:5000/health
http://localhost:5000/api/hotels
```

## 🎯 Common Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/register` | POST | Register new guest | ❌ |
| `/api/auth/login` | POST | Login | ❌ |
| `/api/hotels` | GET | Get all hotels | ❌ |
| `/api/hotels/:id/available-rooms` | GET | Search rooms | ❌ |
| `/api/bookings` | POST | Create booking | ✅ |
| `/api/payments` | POST | Process payment | ✅ |
| `/api/reviews` | POST | Create review | ✅ |

## 🔑 Authentication Flow

1. **Register**: `/api/auth/register`
2. **Login**: `/api/auth/login` → Get JWT token
3. **Use token**: Add to headers: `Authorization: Bearer YOUR_TOKEN`

## 📝 Sample Booking Flow

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Alice","last_name":"Smith","email":"alice@test.com","password":"pass123"}'

# 2. Login (save the token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"pass123"}'

# Response: {"success":true,"data":{"token":"YOUR_JWT_TOKEN"}}

# 3. Search hotels
curl http://localhost:5000/api/hotels?city=New%20York

# 4. Check availability
curl "http://localhost:5000/api/hotels/h1/available-rooms?check_in=2026-03-01&check_out=2026-03-05"

# 5. Create booking (use your token)
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "guest_id": "YOUR_GUEST_ID",
    "hotel_id": "h1",
    "check_in_date": "2026-03-01",
    "check_out_date": "2026-03-05",
    "room_ids": ["r1"],
    "number_of_guests": 2
  }'
```

## 🐛 Troubleshooting

### Database connection failed
- ✅ Check MySQL is running: `mysql --version`
- ✅ Verify credentials in `.env`
- ✅ Ensure database exists: `SHOW DATABASES;`

### Port already in use
```bash
# Change PORT in .env
PORT=5001
```

### Token invalid errors
- ✅ Check JWT_SECRET matches
- ✅ Token might be expired (check JWT_EXPIRE)
- ✅ Verify Authorization header format: `Bearer TOKEN`

### Module not found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. ✅ Read full API documentation in `README.md`
2. ✅ Import Postman collection for testing
3. ✅ Review database schema in `DATABASE_DOCUMENTATION.md`
4. ✅ Check example queries in `hotel_booking_queries.sql`

## 🎉 You're All Set!

Your backend is now running and ready for frontend integration!

For detailed API documentation, see `README.md`
